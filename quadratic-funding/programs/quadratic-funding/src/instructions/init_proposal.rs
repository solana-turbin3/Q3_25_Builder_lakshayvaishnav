use anchor_lang::prelude::*;

use crate::{ Dao, Proposal };

#[derive(Accounts)]
pub struct InitProposalContext<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
    )]
    pub dao_account: Account<'info, Dao>,

    #[account(
        init,
        payer = creator,
        space = 8 + Proposal::INIT_SPACE,
        seeds = [
            b"proposal",
            dao_account.key().as_ref(),
            dao_account.proposal_count.to_le_bytes().as_ref(),
        ],
        bump
    )]
    pub proposal: Account<'info, Proposal>,

    pub system_program: Program<'info, System>,
}

pub fn init_proposal(ctx: Context<InitProposalContext>, metdata: String) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let dao_account = &mut ctx.accounts.dao_account;
    dao_account.proposal_count += 1;

    proposal.set_inner(Proposal {
        authority: ctx.accounts.creator.key(),
        metdata: metdata,
        yes_vote_count: 0,
        no_vote_count: 0,
        bump: ctx.bumps.proposal,
    });

    Ok(())
}
