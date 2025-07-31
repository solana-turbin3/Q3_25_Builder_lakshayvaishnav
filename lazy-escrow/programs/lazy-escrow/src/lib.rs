#![allow(warnings)]

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;



declare_id!("Bu77ZW7LAXPh7CQmCad71hLKF4G7uoCYEzfWZjaC72v9");

#[program]
pub mod lazy_escrow {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn make(ctx: Context<Make>, amount_a: u64, amount_b: u64) -> Result<()> {
        ctx.accounts.init_escrow(amount_a, amount_b, &ctx.bumps)?;
        ctx.accounts.transfer_token_a()
    }

    #[instruction(discriminator = 1)]
    pub fn take(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.transfer_token_b()?;
        ctx.accounts.transfer_token_a()?;
        ctx.accounts.close_vault()
    }

    #[instruction(discriminator = 2)]
    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        ctx.accounts.refund_to_maker()?;
        ctx.accounts.close_vault()
    }
}
