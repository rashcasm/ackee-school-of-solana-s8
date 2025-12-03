'use client';

import { FC, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN, Idl } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import idl from '../idl/amm.json';

const PROGRAM_ID = new PublicKey('8Tc8dWLhdNDsXZdRyFkraP8eHqoVWYPXb6jRviSzpyYt');

const AMMInterface: FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  
  // Form states
  const [activeTab, setActiveTab] = useState('swap');
  const [mintX, setMintX] = useState('');
  const [mintY, setMintY] = useState('');
  const [seed, setSeed] = useState('1');
  const [fee, setFee] = useState('30');
  
  // Swap
  const [swapAmount, setSwapAmount] = useState('');
  const [swapMin, setSwapMin] = useState('');
  const [swapDirection, setSwapDirection] = useState(true);
  
  // Deposit
  const [depositAmount, setDepositAmount] = useState('');
  const [maxX, setMaxX] = useState('');
  const [maxY, setMaxY] = useState('');
  
  // Withdraw
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [minX, setMinX] = useState('');
  const [minY, setMinY] = useState('');

  const getProgram = () => {
    if (!wallet.publicKey) return null;
    
    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );
    
    return new Program(idl as Idl, PROGRAM_ID, provider);
  };

  const getPDAs = async (seedNum: number) => {
    const seedBN = new BN(seedNum);
    const seedBytes = seedBN.toArrayLike(Buffer, 'le', 8);
    
    const [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('config'), seedBytes],
      PROGRAM_ID
    );
    
    const [lpMintPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('lp'), configPDA.toBuffer()],
      PROGRAM_ID
    );
    
    return { configPDA, lpMintPDA };
  };

  const handleInitialize = async () => {
    if (!wallet.publicKey) {
      setStatus('Please connect wallet first');
      return;
    }
    
    setLoading(true);
    try {
      const program = getProgram();
      if (!program) throw new Error('Program not initialized');
      
      const mintXPubkey = new PublicKey(mintX);
      const mintYPubkey = new PublicKey(mintY);
      const seedNum = parseInt(seed);
      const feeNum = parseInt(fee);
      
      const { configPDA, lpMintPDA } = await getPDAs(seedNum);
      
      const vaultX = await getAssociatedTokenAddress(mintXPubkey, configPDA, true);
      const vaultY = await getAssociatedTokenAddress(mintYPubkey, configPDA, true);
      
      const tx = await program.methods
        .initialize(new BN(seedNum), feeNum, null)
        .accounts({
          initializer: wallet.publicKey,
          mintX: mintXPubkey,
          mintY: mintYPubkey,
          mintLp: lpMintPDA,
          vaultX,
          vaultY,
          config: configPDA,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      setStatus(`✅ Pool initialized! Tx: ${tx}`);
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleSwap = async () => {
    if (!wallet.publicKey) return;
    
    setLoading(true);
    try {
      const program = getProgram();
      if (!program) throw new Error('Program not initialized');
      
      const mintXPubkey = new PublicKey(mintX);
      const mintYPubkey = new PublicKey(mintY);
      const seedNum = parseInt(seed);
      
      const { configPDA, lpMintPDA } = await getPDAs(seedNum);
      
      const vaultX = await getAssociatedTokenAddress(mintXPubkey, configPDA, true);
      const vaultY = await getAssociatedTokenAddress(mintYPubkey, configPDA, true);
      const userX = await getAssociatedTokenAddress(mintXPubkey, wallet.publicKey);
      const userY = await getAssociatedTokenAddress(mintYPubkey, wallet.publicKey);
      
      const tx = await program.methods
        .swap(
          swapDirection,
          new BN(parseFloat(swapAmount) * 1e6),
          new BN(parseFloat(swapMin) * 1e6)
        )
        .accounts({
          user: wallet.publicKey,
          mintX: mintXPubkey,
          mintY: mintYPubkey,
          config: configPDA,
          mintLp: lpMintPDA,
          vaultX,
          vaultY,
          userX,
          userY,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      setStatus(`✅ Swap successful! Tx: ${tx}`);
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleDeposit = async () => {
    if (!wallet.publicKey) return;
    
    setLoading(true);
    try {
      const program = getProgram();
      if (!program) throw new Error('Program not initialized');
      
      const mintXPubkey = new PublicKey(mintX);
      const mintYPubkey = new PublicKey(mintY);
      const seedNum = parseInt(seed);
      
      const { configPDA, lpMintPDA } = await getPDAs(seedNum);
      
      const vaultX = await getAssociatedTokenAddress(mintXPubkey, configPDA, true);
      const vaultY = await getAssociatedTokenAddress(mintYPubkey, configPDA, true);
      const userX = await getAssociatedTokenAddress(mintXPubkey, wallet.publicKey);
      const userY = await getAssociatedTokenAddress(mintYPubkey, wallet.publicKey);
      const userLp = await getAssociatedTokenAddress(lpMintPDA, wallet.publicKey);
      
      const tx = await program.methods
        .deposit(
          new BN(parseFloat(depositAmount) * 1e6),
          new BN(parseFloat(maxX) * 1e6),
          new BN(parseFloat(maxY) * 1e6)
        )
        .accounts({
          user: wallet.publicKey,
          mintX: mintXPubkey,
          mintY: mintYPubkey,
          config: configPDA,
          mintLp: lpMintPDA,
          vaultX,
          vaultY,
          userX,
          userY,
          userLp,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .rpc();
      
      setStatus(`✅ Deposit successful! Tx: ${tx}`);
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    if (!wallet.publicKey) return;
    
    setLoading(true);
    try {
      const program = getProgram();
      if (!program) throw new Error('Program not initialized');
      
      const mintXPubkey = new PublicKey(mintX);
      const mintYPubkey = new PublicKey(mintY);
      const seedNum = parseInt(seed);
      
      const { configPDA, lpMintPDA } = await getPDAs(seedNum);
      
      const vaultX = await getAssociatedTokenAddress(mintXPubkey, configPDA, true);
      const vaultY = await getAssociatedTokenAddress(mintYPubkey, configPDA, true);
      const userX = await getAssociatedTokenAddress(mintXPubkey, wallet.publicKey);
      const userY = await getAssociatedTokenAddress(mintYPubkey, wallet.publicKey);
      const userLp = await getAssociatedTokenAddress(lpMintPDA, wallet.publicKey);
      
      const tx = await program.methods
        .withdraw(
          new BN(parseFloat(withdrawAmount) * 1e6),
          new BN(parseFloat(minX) * 1e6),
          new BN(parseFloat(minY) * 1e6)
        )
        .accounts({
          user: wallet.publicKey,
          mintX: mintXPubkey,
          mintY: mintYPubkey,
          config: configPDA,
          mintLp: lpMintPDA,
          userLp,
          vaultX,
          vaultY,
          userX,
          userY,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      setStatus(`✅ Withdraw successful! Tx: ${tx}`);
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-2 text-center">Solana AMM</h1>
          <p className="text-blue-200 text-center mb-6">Decentralized Exchange on Devnet</p>
          
          <div className="mb-6">
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-blue-500 hover:!from-purple-600 hover:!to-blue-600" />
          </div>

          {wallet.connected && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm font-medium">Token X Mint Address</label>
                  <input
                    type="text"
                    value={mintX}
                    onChange={(e) => setMintX(e.target.value)}
                    placeholder="Enter Token X mint address"
                    className="w-full mt-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label className="text-white text-sm font-medium">Token Y Mint Address</label>
                  <input
                    type="text"
                    value={mintY}
                    onChange={(e) => setMintY(e.target.value)}
                    placeholder="Enter Token Y mint address"
                    className="w-full mt-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-medium">Pool Seed</label>
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="Pool seed"
                    className="w-full mt-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex gap-2 border-b border-white/20">
                {['swap', 'deposit', 'withdraw', 'initialize'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-medium capitalize transition-all ${
                      activeTab === tab
                        ? 'text-white border-b-2 border-blue-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'initialize' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm font-medium">Fee (basis points)</label>
                    <input
                      type="number"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      placeholder="30 = 0.3%"
                      className="w-full mt-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <button
                    onClick={handleInitialize}
                    disabled={loading}
                    className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Processing...' : 'Initialize Pool'}
                  </button>
                </div>
              )}

              {activeTab === 'swap' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm font-medium">Swap Direction</label>
                    <select
                      value={swapDirection ? 'true' : 'false'}
                      onChange={(e) => setSwapDirection(e.target.value === 'true')}
                      className="w-full mt-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="true">X → Y</option>
                      <option value="false">Y → X</option>
                    </select>
                  </div>
                  <input
                    type="number"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    placeholder="Amount to swap"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  />
                  <input
                    type="number"
                    value={swapMin}
                    onChange={(e) => setSwapMin(e.target.value)}
                    placeholder="Minimum to receive"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  />
                  <button
                    onClick={handleSwap}
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Processing...' : 'Swap Tokens'}
                  </button>
                </div>
              )}

              {activeTab === 'deposit' && (
                <div className="space-y-4">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="LP tokens to mint"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  />
                  <input
                    type="number"
                    value={maxX}
                    onChange={(e) => setMaxX(e.target.value)}
                    placeholder="Max Token X"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  />
                  <input
                    type="number"
                    value={maxY}
                    onChange={(e) => setMaxY(e.target.value)}
                    placeholder="Max Token Y"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  />
                  <button
                    onClick={handleDeposit}
                    disabled={loading}
                    className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Processing...' : 'Add Liquidity'}
                  </button>
                </div>
              )}

              {activeTab === 'withdraw' && (
                <div className="space-y-4">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="LP tokens to burn"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  />
                  <input
                    type="number"
                    value={minX}
                    onChange={(e) => setMinX(e.target.value)}
                    placeholder="Min Token X"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  />
                  <input
                    type="number"
                    value={minY}
                    onChange={(e) => setMinY(e.target.value)}
                    placeholder="Min Token Y"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  />
                  <button
                    onClick={handleWithdraw}
                    disabled={loading}
                    className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Processing...' : 'Remove Liquidity'}
                  </button>
                </div>
              )}

              {status && (
                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <p className="text-white text-sm break-all">{status}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AMMInterface;