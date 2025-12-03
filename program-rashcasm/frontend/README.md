# Mint Me A Moment - Frontend

A modern Solana dApp for tipping creators, built with Next.js, TypeScript, and Anchor.

## Features

- 🔐 Wallet integration (Phantom, Solflare, Torus)
- 💸 Send SOL tips with messages
- 📝 View recent support history
- 🎨 Beautiful gradient UI
- ⚡ Built on Solana Devnet

## Prerequisites

- Node.js 18+ and yarn/npm
- A Solana wallet (Phantom recommended)
- SOL on Devnet (get from [faucet](https://faucet.solana.com/))

## Getting Started

1. **Install dependencies:**
```bash
cd frontend
yarn install
# or
npm install
```

2. **Update the creator address:**
Edit `src/config/constants.ts` and replace `DEFAULT_CREATOR` with your wallet address.

3. **Run the development server:**
```bash
yarn dev
# or
npm run dev
```

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout with wallet provider
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   │   ├── TipDapp.tsx   # Main dApp container
│   │   ├── TipForm.tsx   # Tip sending form
│   │   ├── RecentSupports.tsx # Recent tips display
│   │   └── WalletProvider.tsx # Wallet adapter setup
│   ├── config/           # Configuration
│   │   └── constants.ts  # Program ID and constants
│   ├── idl/              # Anchor IDL
│   │   └── ancproject.ts # Program interface
│   └── types/            # TypeScript types
│       └── index.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## Configuration

### Update Creator Wallet

In `src/config/constants.ts`:

```typescript
export const DEFAULT_CREATOR = new PublicKey("YOUR_WALLET_ADDRESS_HERE");
```

### Change Network

The app uses Devnet by default. To change to Mainnet, edit `src/components/WalletProvider.tsx`:

```typescript
const network = WalletAdapterNetwork.Mainnet;
```

## Building for Production

```bash
yarn build
yarn start
```

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Solana Web3.js** - Solana interactions
- **Anchor** - Solana program framework
- **Wallet Adapter** - Multi-wallet support
- **React Hot Toast** - Notifications

## Tips

- Make sure you're connected to Devnet in your wallet
- Get Devnet SOL from the [Solana Faucet](https://faucet.solana.com/)
- Check the browser console for transaction signatures
- Transaction signatures can be viewed on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)

## Troubleshooting

**Wallet not connecting?**
- Make sure your wallet extension is installed and unlocked
- Try refreshing the page

**Transaction failing?**
- Ensure you have enough SOL in your wallet
- Check that you're on Devnet
- Verify the program is deployed

**Build errors?**
- Clear `.next` folder and rebuild
- Delete `node_modules` and reinstall dependencies

## License

MIT
