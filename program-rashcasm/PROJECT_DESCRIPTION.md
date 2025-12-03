# Project Description

This workspace contains **3 Solana projects**: 2 backend-only programs and 1 full-stack dApp with a deployed frontend.


## 1. Ticket Registry dApp (Full-Stack)

**Location:** `/ticket-registry`

**Backend Program:** Anchor program in `ticket-registry/anchor/programs/ticketregistry`  
**Frontend:** Next.js React app  
**Deployed Frontend URL:** https://patanahibhai.vercel.app/ticketregistry  
**Program ID:** `EUnidZqxcVZLwsEaR9Msz1vVuethUct6V4zZmLbNmB8L`

### Description
A decentralized event ticketing platform on Solana. Event organizers can create events and set ticket prices; users can purchase tickets and organizers can withdraw proceeds.

### Key Features
- **Event Creation:** Organizers create events with name, description, ticket price, availability, and start date
- **Ticket Purchase:** Users purchase tickets by paying the ticket price in SOL
- **Ticket Ownership:** Buyers receive on-chain ticket receipts (NFT-like account)
- **Fund Withdrawal:** Organizers can withdraw accumulated ticket sales proceeds
- **Validation:** Prevents past-dated events, invalid ticket quantities, and overselling

### How to Use the dApp
1. **Connect Wallet:** Link your Solana wallet
2. **Create Event (Organizers):** Fill event details (name, description, price, quantity, start date) and submit
3. **Browse Events:** View all available events with ticket availability and pricing
4. **Buy Ticket:** Select an event and purchase a ticket; confirm the transaction
5. **Withdraw Funds (Organizers):** View events you organized and withdraw sales proceeds
6. **View Ticket:** Check your purchased ticket records on-chain

### Program Architecture

**Instructions Implemented:**

1. **`initialize(name, description, ticket_price, available_tickets, start_date)`**
   - Creates a new Event account
   - **Accounts:** Organizer (Signer), Event (PDA, Mutable), System Program
   - **Validation:**
     - Event name ≤ 30 characters
     - Event description ≤ 300 characters
     - available_tickets > 0
     - start_date must be in the future
   - **PDA Seeds:** `[b"event", name.as_bytes(), event_organizer.key().as_ref()]`

2. **`buy()`**
   - Purchases a ticket for an event
   - **Accounts:** Buyer (Signer, Mutable), Ticket (PDA, Mutable, newly initialized), Event (Mutable), System Program
   - **Validation:**
     - Event start date has not passed
     - Event has available tickets
   - **Actions:**
     - Decrements `available_tickets` counter
     - Transfers SOL (ticket price) from buyer to event organizer
     - Creates Ticket account for the buyer
   - **PDA Seeds:** `[b"ticket", event.key().as_ref(), buyer.key().as_ref()]`

3. **`withdraw(amount: u64)`**
   - Allows event organizers to withdraw accumulated sales proceeds
   - **Accounts:** Event Organizer (Signer, Mutable), Event (Mutable)
   - **Validation:**
     - Must be signed by the event organizer (verified via `has_one = event_organizer`)
   - **Actions:**
     - Subtracts lamports from Event account
     - Adds lamports to Organizer account (direct balance transfer)

### Account Structures

```rust
#[account]
pub struct Event {
    pub name: String,                    // Max 30 characters
    pub description: String,             // Max 300 characters
    pub ticket_price: u64,               // Price in lamports
    pub available_tickets: u64,          // Number of unsold tickets
    pub event_organizer: Pubkey,         // Event creator/organizer address
    pub start_date: i64,                 // Unix timestamp of event start
}

#[account]
pub struct Ticket {
    pub event: Pubkey,                   // Reference to the Event account
    pub buyer: Pubkey,                   // Address of the ticket buyer
    pub price: u64,                      // Price paid (in lamports)
}
```

### PDA Usage

**Event Account PDA:**
- **Seeds:** `[b"event", name.as_bytes(), event_organizer.key().as_ref()]`
- **Purpose:** Derives a deterministic, unique address for each event using event name and organizer address
- **Benefit:** Prevents duplicate events and ensures organizers can only create one event per name

**Ticket Account PDA:**
- **Seeds:** `[b"ticket", event.key().as_ref(), buyer.key().as_ref()]`
- **Purpose:** Creates a unique ticket receipt for each buyer per event
- **Benefit:** Prevents double-spending; ensures one ticket per buyer per event

### Custom Error Codes

```rust
#[error_code]
pub enum TicketRegistryError {
    #[msg("Event name must be 30 characters or less")]
    NameTooLong,
    
    #[msg("Event description must be 300 characters or less")]
    DescriptionTooLong,
    
    #[msg("Event start date cannot be in the past")]
    StartDateInThePast,
    
    #[msg("Available tickets must be greater than 0")]
    AvailableTicketsTooLow,
    
    #[msg("All tickets for this event have been sold out")]
    AllTicketsSoldOut,
}
```

---

## 2. Automated Market Maker (AMM) Contract (Backend Only)

**Location:** `/Project_AMM`

**Program Location:** `Project_AMM/amm/programs/amm`  
**Status:** Backend contract (no frontend deployed)
**Program id:** 8Tc8dWLhdNDsXZdRyFkraP8eHqoVWYPXb6jRviSzpyYt

### Description
An Automated Market Maker (AMM) contract for Solana. AMMs are decentralized exchange protocols that use liquidity pools and mathematical formulas (typically x·y=k) to determine token prices and enable token swaps.

### Key Features
- **Liquidity Pool Management:** Create and manage liquidity pools for token pairs
- **Token Swaps:** Exchange tokens using constant product formula
- **Liquidity Provision:** Users can deposit tokens and earn swap fees
- **Slippage Protection:** Specify minimum output to protect against price impact

### Architecture Notes
This is a backend-only contract designed for integration into DeFi protocols. Typical usage includes:
- Decentralized exchanges (DEX) platforms
- Yield farming protocols
- Multi-token bridges

---

## Technology Stack

### Backend
- **Language:** Rust
- **Framework:** Anchor v0.26.0 (Solana framework)
- **Build Target:** SBPF (Solana Berkeley Packet Filter)
- **Blockchain:** Solana mainnet-beta / devnet

### Development & Testing
- **Package Manager:** npm / cargo
- **Rust Toolchain:** Custom rust-toolchain.toml
- **IDL:** Anchor-generated IDLs in JSON format

---

## Project Summary

| Project | Type | Backend | Frontend | Deployed | Purpose |
|---------|------|---------|----------|----------|---------|
| **Buy Me A Coffee** | Full-Stack | Anchor (tip instruction) | Next.js | Vercel | SOL tipping with messages |
| **Ticket Registry** | Full-Stack | Anchor (3 instructions) | Next.js | Vercel (https://patanahibhai.vercel.app/ticketregistry) | Event ticketing platform |
| **AMM** | Backend Only | Anchor (swap logic) | None | No | Automated market maker |

---

## Key Improvements Made

1. **IDL Externalization (Coffee dApp):** Replaced hardcoded IDL in BuyMeCoffee.tsx component with external `ancproject.json` import to eliminate code duplication and ensure frontend-backend consistency.

2. **Error Handling:** All programs implement custom error codes for validation and user feedback.

3. **PDA Architecture:** Both Ticket Registry and Coffee dApp use deterministic PDAs for scalable, composable account management.
```#[account]
pub struct YourAccountName {
    // Describe each field
}
```
---

## 3. Buy Me A Coffee dApp (Full-Stack)

**Location:** `/anchorproject`

**Backend Program:** Anchor program (`anchorproject` folder)  
**Frontend:** Next.js React app deployed to Vercel  
**Program ID:** `4K6LtuL5hK9FGADBNgiw5cXyk3RPPz3LeLwq7M8xUzUS`

### Description
A Solana-based tipping dApp where users can send tips (in SOL) with optional messages to a creator. The program stores tip history and emits events for all transactions.

### Key Features
- **Wallet Connection:** Supports Phantom and other Solana wallets
- **Send Tips:** Users can send arbitrary SOL amounts to the creator with a message
- **Tip History:** All tips are stored in a program-derived account for historical tracking
- **Tip Events:** Every tip emission triggers a TipEvent with tipper address, amount, and timestamp
- **Message Support:** Tips include optional text messages (up to 1024 characters)

### How to Use the dApp
1. **Connect Wallet:** Click "Connect Wallet" button to link your Solana wallet (Phantom recommended)
2. **Enter Amount:** Specify the SOL amount you want to tip
3. **Add Message (Optional):** Include a message with your tip
4. **Send Tip:** Click submit button to confirm the transaction
5. **View Transaction:** The blockchain will process the transaction and show confirmation

### Program Architecture

**Main Instruction:**
- `tip`: Accepts a tip amount (u64), message (string), and timestamp (i64)
  - **Accounts Used:** Tipper (Signer), Creator (Mutable), TipHistory (PDA, Mutable), System Program
  - **Functionality:** Transfers SOL from tipper to creator, records tip in TipHistory account, emits TipEvent

**Account Structures:**

```rust
#[account]
pub struct TipHistory {
    pub tips: Vec<Tip>,  // Stores all tips received
}

pub struct Tip {
    pub tipper: Pubkey,
    pub amount: u64,
    pub message: String,
    pub timestamp: i64,
}
```

**Event Emission:**

```rust
#[event]
pub struct TipEvent {
    pub tipper: Pubkey,
    pub amount: u64,
}
```

### PDA Usage
- **TipHistory Account PDA:** Uses seeds to derive a deterministic address for storing all tips
- **Purpose:** Ensures only one TipHistory account exists per creator, making it easy to query all tips received

---

### Additional Notes for Evaluators

i hate making frontends- 