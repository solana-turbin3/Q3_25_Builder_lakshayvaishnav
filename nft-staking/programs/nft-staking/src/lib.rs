#![allow(warnings)]

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use error::*;
pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("C5ByCD7AuAGptQ9XfA69CPiteZeU2K68CRbVaJW2rKej");

#[program]
pub mod nft_staking {
    use super::*;
}
