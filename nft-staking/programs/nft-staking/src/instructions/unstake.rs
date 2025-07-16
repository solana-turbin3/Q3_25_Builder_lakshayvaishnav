use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::{
        mpl_token_metadata::instructions::{
            ThawDelegatedAccountCpi,
            ThawDelegatedAccountCpiAccounts,
        },
        MasterEditionAccount,
        Metadata,
        MetadataAccount,
    },
    token::{ Revoke, revoke, Mint, Token, TokenAccount },
};

use crate::{ state::{ StakeAccount, StakeConfig }, UserAccount };
use crate::{ error::StakeError };

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub mint: Account<'info, Mint>,
    pub collection_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub user_mint_ata: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"metadata", metadata_program.key().as_ref(), mint.key().as_ref()],
        seeds::program = metadata_program.key(),
        bump,
        constraint = metadata.collection.as_ref().unwrap().key.as_ref() ==
        collection_mint.key().as_ref(),
        constraint = metadata.collection.as_ref().unwrap().verified == true
    )]
    pub metadata: Account<'info, MetadataAccount>,

    #[account(
        seeds = [b"metadata", metadata_program.key().as_ref(), mint.key().as_ref(), b"edition"],
        seeds::program = metadata_program.key(),
        bump
    )]
    pub edition: Account<'info, MetadataAccount>,

    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, StakeConfig>,

    #[account(
        mut,
        seeds = [b"user",user.key().as_ref()],
        bump = user_account.bump
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(
        mut,
        seeds = [b"stake", mint.key().as_ref(), config.key().as_ref()],
        bump = stake_account.bump,
        close = user
    )]
    pub stake_account: Account<'info, StakeAccount>,
    pub metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

impl<'info> Unstake<'info> {
    pub fn unstake(&mut self) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;

        let time_elapsed  = (now - self.stake_account.staked_at) as u32 / 86400 as u32;
        require!(time_elapsed >= self.config.freeze_period, StakeError::FreezePeriodNotPassed);

        let seeds = [b"seeds"]
        let delegate = &self.stake_account.to_account_info();
        let token_account = &self.user_account.to_account_info();
        let edition = 

        let cpi_program = self.metadata_program.to_account_info();
        Ok(())
    }
}
