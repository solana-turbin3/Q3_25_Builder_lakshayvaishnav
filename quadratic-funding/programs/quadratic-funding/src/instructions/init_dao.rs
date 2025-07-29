use anchor_lang::prelude::*;

use crate::Dao;

#[derive(Accounts)]
#[instruction(name:String)]
pub struct InitDao<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + Dao::INIT_SPACE,
        seeds = [b"dao", creator.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub dao_account: Account<'info, Dao>,
    pub system_program: Program<'info, System>,
}

pub fn init_dao(ctx: Context<InitDao>, name: String) -> Result<()> {
    let dao_account = &mut ctx.accounts.dao_account;
    dao_account.set_inner(Dao {
        name: name,
        authority: ctx.accounts.creator.key(),
        proposal_count: 0,
        bump: ctx.bumps.dao_account,
    });

    Ok(())
}
