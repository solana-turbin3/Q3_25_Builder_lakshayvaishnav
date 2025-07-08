use anchor_lang::prelude::*;

declare_id!("9iZnW2QCRCBkkLQ3dMnR49MnuGn9YXoRte6pY7bmJvbc");

#[program]
pub mod vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
