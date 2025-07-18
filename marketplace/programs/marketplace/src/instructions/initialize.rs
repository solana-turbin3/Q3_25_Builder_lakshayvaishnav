use anchor_lang::prelude::*;
use anchor_spl::token_interface::{ Mint, TokenInterface };

use crate::Marketplace;
use crate::error::ErrorCode;
#[derive(Accounts)]
#[instruction(name : String)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    // account to store marketplace data.
    #[account(
        init,
        payer = admin,
        seeds = [b"marktplace", name.as_bytes()],
        bump,
        space = 8 + Marketplace::INIT_SPACE
    )]
    pub marketplace: Account<'info, Marketplace>,


    // a regular solana account.
    // to hold marketpace funds.
    #[account(seeds = [b"treasury", marketplace.key().as_ref()], bump)]
    pub treasury: SystemAccount<'info>,

    // spl token mint account for rewards token.
    #[account(
        init,
        payer = admin,
        seeds = [b"rewards", marketplace.key().as_ref()],
        bump,
        mint::decimals = 6,
        mint::authority = marketplace
    )]
    pub rewards_mint: InterfaceAccount<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}

impl<'info> Initialize<'info> {
    pub fn init(&mut self, name: String, fee: u16, bumps: &InitializeBumps) -> Result<()> {

        // FIX-LATER : error in size
        require!(!name.is_empty() && name.len() < 20, ErrorCode::NameTooLong);

        self.marketplace.set_inner(Marketplace {
            admin: self.admin.key(),
            fee,
            bump: bumps.marketplace,
            treasury_bump: bumps.treasury,
            rewards_bump: bumps.rewards_mint,
            name,
        });

        Ok(())
    }
}
