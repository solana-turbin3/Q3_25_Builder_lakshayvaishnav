use anchor_lang::{ prelude::* };
use anchor_spl::token::TokenAccount;

use crate::{ Dao, Proposal, Vote };

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,

    pub dao: Account<'info, Dao>,
    pub proposal: Account<'info, Proposal>,

    #[account(
        init,
        payer = voter,
        space = 8 + Vote::INIT_SPACE,
        seeds = [b"vote", voter.key().as_ref(), proposal.key().as_ref()],
        bump
    )]
    pub vote_account: Account<'info, Vote>,

    pub creator_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
}

pub fn cast_vote(ctx: Context<CastVote>, vote_type: u8) -> Result<()> {
    let vote_account = &mut ctx.accounts.vote_account;

    let _proposal_account = &ctx.accounts.proposal;

    let voting_credits = (ctx.accounts.creator_token_account.amount as f64).sqrt() as u64;

    vote_account.set_inner(Vote {
        authority: ctx.accounts.voter.key(),
        vote_type: vote_type,
        vote_credits: voting_credits,
        bump: ctx.bumps.vote_account,
    });

    Ok(())
}
