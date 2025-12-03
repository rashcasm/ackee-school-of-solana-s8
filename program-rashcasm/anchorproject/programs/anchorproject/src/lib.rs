use anchor_lang::prelude::*;

declare_id!("4K6LtuL5hK9FGADBNgiw5cXyk3RPPz3LeLwq7M8xUzUS");


#[program]
pub mod ancproject {
    use super::*;

    pub fn tip(
        ctx: Context<Tip>,
        amount: u64,
        message: String,
        timestamp: i64,
    ) -> Result<()> {
        require!(amount > 0, CoffeeError::InvalidAmount);

        require!(
            ctx.accounts.tipper.lamports() >= amount,
            CoffeeError::InsufficientBalance
        );

        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.tipper.to_account_info(),
                    to: ctx.accounts.creator.to_account_info(),
                },
            ),
            amount,
        )?;

        let tip_history = &mut ctx.accounts.tip_history;
        tip_history.tipper = ctx.accounts.tipper.key();
        tip_history.amount = amount;
        tip_history.message = message;
        tip_history.timestamp = timestamp;

        emit!(TipEvent {
            tipper: ctx.accounts.tipper.key(),
            amount,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(amount: u64, message: String, timestamp: i64)]
pub struct Tip<'info> {
    #[account(mut)]
    pub tipper: Signer<'info>,
    /// CHECK: This account is the recipient of the tip, and no specific constraints are required
    /// because this program simply transfers lamports to it.
    #[account(mut)]
    pub creator: AccountInfo<'info>,
    #[account(
        init,
        payer = tipper,
        space = TipHistory::LEN,
        seeds = [
            b"tip_history",
            tipper.key().as_ref(),
            timestamp.to_be_bytes().as_ref()
        ],
        bump
    )]
    pub tip_history: Account<'info, TipHistory>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct TipHistory {
    pub tipper: Pubkey,
    pub amount: u64,
    pub message: String,
    pub timestamp: i64,
}

impl TipHistory {
    pub const LEN: usize = 8   // Discriminator
        + 32                  // Tipper public key
        + 8                   // Amount
        + 4 + 200             // Message (4 bytes for string prefix + max 200 characters)
        + 8;                  // Timestamp
}

#[error_code]
pub enum CoffeeError {
    #[msg("Amount must be greater than 0!")]
    InvalidAmount,
    #[msg("Insufficient balance!")]
    InsufficientBalance,
}

#[event]
pub struct TipEvent {
    pub tipper: Pubkey,
    pub amount: u64,
}