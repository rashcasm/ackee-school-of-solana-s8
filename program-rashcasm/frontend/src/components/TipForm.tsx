"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, BN } from "@coral-xyz/anchor";
import { IDL, Ancproject } from "@/idl/ancproject";
import { PROGRAM_ID, DEFAULT_CREATOR } from "@/config/constants";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import toast from "react-hot-toast";
import { TipHistoryData } from "@/types";

interface TipFormProps {
  onSuccess?: (tip: TipHistoryData) => void;
}

export function TipForm({ onSuccess }: TipFormProps) {
  const { publicKey, sendTransaction, wallet } = useWallet();
  const { connection } = useConnection();
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("0.01");
  const [loading, setLoading] = useState(false);

  const handleSendTip = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey || !wallet) {
      toast.error("Please connect your wallet first!");
      return;
    }

    if (!message.trim()) {
      toast.error("Please write a message!");
      return;
    }

    const tipAmount = parseFloat(amount);
    if (isNaN(tipAmount) || tipAmount <= 0) {
      toast.error("Please enter a valid amount!");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Sending your support...");

    try {
      // Create provider
      const provider = new AnchorProvider(
        connection,
        wallet.adapter as any,
        AnchorProvider.defaultOptions()
      );

      // Create program instance
      const program = new Program<Ancproject>(IDL, PROGRAM_ID, provider);

      // Convert SOL to lamports
      const lamports = new BN(tipAmount * 1e9); // 1 SOL = 1e9 lamports

      const timestamp = new BN(Math.floor(Date.now() / 1000));

      // Derive PDA for tip history
      const [tipHistoryPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("tip_history"),
          publicKey.toBuffer(),
          timestamp.toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
      );

      // Send transaction
      const tx = await program.methods
        .tip(lamports, message, timestamp)
        .accounts({
          tipper: publicKey,
          creator: DEFAULT_CREATOR,
          tipHistory: tipHistoryPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Transaction signature:", tx);

      toast.success("Support sent successfully! 🎉", { id: toastId });

      // Add to recent tips
      if (onSuccess) {
        onSuccess({
          tipper: publicKey.toString(),
          amount: tipAmount,
          message: message,
          timestamp: Date.now(),
        });
      }

      // Reset form
      setMessage("");
      setAmount("0.01");
    } catch (error: any) {
      console.error("Error sending tip:", error);
      toast.error(error.message || "Failed to send support", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Send Support</h2>
      <form onSubmit={handleSendTip} className="space-y-6">
        {/* Message Input */}
        <div>
          <label className="block text-white/80 text-sm mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none h-32"
            disabled={loading}
          />
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-white/80 text-sm mb-2">Amount (SOL)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!publicKey || loading}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send Support ✈️
            </>
          )}
        </button>
      </form>
    </div>
  );
}
