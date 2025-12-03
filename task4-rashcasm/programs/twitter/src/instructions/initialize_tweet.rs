//-------------------------------------------------------------------------------
///
/// TASK: Implement the initialize tweet functionality for the Twitter program
/// 
/// Requirements:
/// - Validate that topic and content don't exceed maximum lengths
/// - Initialize a new tweet account with proper PDA seeds
/// - Set tweet fields: topic, content, author, likes, dislikes, and bump
/// - Initialize counters (likes and dislikes) to zero
/// - Use topic in PDA seeds for tweet identification
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;

use crate::errors::TwitterError;
use crate::states::*;

pub fn initialize_tweet(
    ctx: Context<InitializeTweet>,
    topic: String,
    content: String,
) -> Result<()> {
    // Validate topic length
    require!(topic.len() <= TOPIC_LENGTH, TwitterError::TopicTooLong);
    // Validate content length
    require!(content.len() <= CONTENT_LENGTH, TwitterError::ContentTooLong);
    // Initialize the tweet account
    ctx.accounts.tweet.tweet_author = ctx.accounts.tweet_authority.key() ; 
    ctx.accounts.tweet.topic = topic.clone() ; 
    ctx.accounts.tweet.content = content ; 
    ctx.accounts.tweet.likes = 0 ; 
    ctx.accounts.tweet.dislikes = 0 ;
    ctx.accounts.tweet.bump  = ctx.bumps.tweet ; 

    Ok(())

}

#[derive(Accounts)]
#[instruction(topic: String)]
pub struct InitializeTweet<'info> {
    #[account(mut)]
    pub tweet_authority: Signer<'info>,
    #[account(init,
        payer = tweet_authority,
        space = 8 + Tweet::INIT_SPACE,
        seeds=[topic.as_bytes(), TWEET_SEED.as_bytes(), tweet_authority.key().as_ref()],
        bump
    )]
    pub tweet: Account<'info, Tweet>,
    pub system_program: Program<'info, System>,
}
