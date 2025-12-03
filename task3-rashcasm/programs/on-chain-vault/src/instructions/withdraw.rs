//-------------------------------------------------------------------------------
///
/// TASK: Implement the withdraw functionality for the on-chain vault
/// 
/// Requirements:
/// - Verify that the vault is not locked
/// - Verify that the vault has enough balance to withdraw
/// - Transfer lamports from vault to vault authority
/// - Emit a withdraw event after successful transfer
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;
use crate::state::Vault;
use crate::errors::VaultError;
use crate::events::WithdrawEvent;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    // TODO: Add required accounts and constraints
    #[account(mut)]
    pub vault_authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"vault", vault.vault_authority.as_ref()],
        bump,
        has_one = vault_authority
    )]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
    pub placeholder: Signer<'info>,
}

pub fn _withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    // TODO: Implement withdraw functionality
    let vault_authority = &mut ctx.accounts.vault_authority;
    let vault = &mut ctx.accounts.vault;

    //check if vault is locked
    require!(!vault.locked, VaultError::VaultLocked);
    // Check if vault has enough balance
    require!(vault.get_lamports() >= amount, VaultError::InsufficientBalance);

    // Transfer lamports from vault to vault authority
    // We need to manually transfer since we're going from PDA to regular account
    **vault.to_account_info().try_borrow_mut_lamports()? -= amount;
    **vault_authority.to_account_info().try_borrow_mut_lamports()? += amount;

    emit!(WithdrawEvent {
        amount,
        vault: vault.key(),
        vault_authority: vault_authority.key()
    });
    Ok(())
}