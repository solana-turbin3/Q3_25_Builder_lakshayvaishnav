use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{ MasterEditionAccount, Metadata, MetadataAccount },
    token_interface::{ Mint, TransferChecked, TokenAccount, TokenInterface, transfer_checked },
};

use crate::{ Listing, Marketplace };

#[derive(Accounts)]
pub struct List<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    #[account(seeds = [b"marktplace", marketplace.name.as_bytes()], bump = marketplace.bump)]
    pub marketplace: Account<'info, Marketplace>,

    // the SPL token mint representing the asset to be listed.
    pub maker_mint: InterfaceAccount<'info, Mint>,

    // the seller's assocaited token account holding the asset/mint
    // it is mutable because token will be transferred
    #[account(
        mut,
        associated_token::mint = maker_mint,
        associated_token::authority = maker,
    )]
    pub maker_ata: InterfaceAccount<'info, TokenAccount>,

    // the escrow vault (ATA) where the asset will be held while listed.
    // newly created and owned by the listing PDA so only the program can trasnfer out the asset.
    #[account(
        init,
        payer = maker,
        associated_token::mint = maker_mint,
        associated_token::authority = listing
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        payer = maker,
        seeds = [marketplace.key().as_ref(), maker_mint.key().as_ref()],
        bump,
        space = 8 + Listing::INIT_SPACE
    )]
    pub listing: Account<'info, Listing>,

    // The mint account for the collection (NFT group) this asset belongs to.
    // Used for collection or verified asset verification.
    pub collection_mint: InterfaceAccount<'info, Mint>,

    // the metadata account for the asset , containing details like name, image , etc.
    // the account's address is derived as a pda from the mint and the metadata program.
    #[account(
        seeds = [b"metadata", metadata_program.key().as_ref(), maker_mint.key().as_ref()],
        seeds::program = metadata_program.key(),
        bump,

        // CONSTRAINT : collections's mint must match the provided collection_mint key.
        constraint = metadata.collection.as_ref().unwrap().key.as_ref() ==
        collection_mint.key().as_ref(),

        // CONSTRAINT : the collection verification must be confirmed (prventing fake collections)
        constraint = metadata.collection.as_ref().unwrap().verified
    )]
    pub metadata: Account<'info, MetadataAccount>,

    // The MasterEditionAccount for the asset, proving it is a real NFT and not just a copy.
    // Derives as a PDA from the mint, metadata program, and "edition" seed.
    #[account(
        seeds = [
            b"metdata",
            metadata_program.key().as_ref(),
            maker_mint.key().as_ref(),
            b"edition",
        ],
        seeds::program = metadata_program.key(),
        bump
    )]
    pub master_edition: Account<'info, MasterEditionAccount>,

    pub metadata_program: Program<'info, Metadata>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}

impl<'info> List<'info> {
    pub fn create_listing(&mut self, price: u64, bumps: &ListBumps) -> Result<()> {
        self.listing.set_inner(Listing {
            maker: self.maker.key(),
            mint: self.maker_mint.key(),
            price: price,
            bump: bumps.listing,
        });
        Ok(())
    }

    pub fn deposit_nft(&mut self) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = TransferChecked {
            mint: self.maker_mint.to_account_info(),
            authority: self.maker.to_account_info(),
            from: self.maker_ata.to_account_info(),
            to: self.vault.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer_checked(cpi_ctx, 1, self.maker_mint.decimals)?;

        Ok(())
    }
}
