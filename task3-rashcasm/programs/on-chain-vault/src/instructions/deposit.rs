//-------------------------------------------------------------------------------
///
/// TASK: Implement the deposit functionality for the on-chain vault
/// 
/// Requirements:
/// - Verify that the user has enough balance to deposit
/// - Verify that the vault is not locked
/// - Transfer lamports from user to vault using CPI (Cross-Program Invocation)
/// - Emit a deposit event after successful transfer
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction::transfer;
use crate::state::Vault;
use crate::errors::VaultError;
use crate::events::DepositEvent;

#[derive(Accounts)]
pub struct Deposit<'info> {
    // TODO: Add required accounts and constraints
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"vault", vault.vault_authority.as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
    pub placeholder: Signer<'info>,
}

pub fn _deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    // TODO: Implement deposit functionality
    let user = &mut ctx.accounts.user;
    let vault = &mut ctx.accounts.vault;
    let system_program = &ctx.accounts.system_program;

    //check freakin balance
    require!(user.lamports() >= amount, VaultError::InsufficientBalance);
    //check if vault is locked
    require!(!vault.locked, VaultError::VaultLocked);

    //transfer lamports from user to vault
    let tx_inst = transfer(&user.key(), &vault.key(), amount);
    invoke(
        &tx_inst,
        &[
            user.to_account_info(),
            vault.to_account_info(),
            system_program.to_account_info()
        ],
    )?;

    // emit dis sheet
    emit!(DepositEvent {
        amount,
        user: user.key(),
        vault: vault.key(),
    });
    Ok(())
}