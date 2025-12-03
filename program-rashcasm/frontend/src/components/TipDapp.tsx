"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { TipForm } from "./TipForm";
import { RecentSupports } from "./RecentSupports";
import { TipHistoryData } from "@/types";

// Dynamically import WalletMultiButton to avoid SSR issues
const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export function TipDapp() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [recentTips, setRecentTips] = useState<TipHistoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addNewTip = (tip: TipHistoryData) => {
    setRecentTips((prev) => [tip, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-blue-700">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">☕</div>
            <h1 className="text-2xl font-bold text-white">Mint Me A Moment</h1>
          </div>
          {mounted && (
            <WalletMultiButton className="!bg-white/10 hover:!bg-white/20 !rounded-lg !h-12 !px-6 !transition-all" />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Info Banner */}
        <div className="mb-8 bg-blue-500/30 backdrop-blur-sm border border-blue-400/30 rounded-xl p-4 flex items-start gap-3">
          <div className="text-blue-200 text-xl mt-1">ℹ️</div>
          <div className="text-white/90">
            <p>
              This Solana dApp, <strong>Mint Me a Moment</strong>, is a demonstration app deployed on the{" "}
              <strong>DEVNET</strong>. It functions as a tipping platform, similar to 'Buy Me a Coffee,' allowing
              users to send Solana to the creator as a gesture of support.
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Send Support Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <TipForm onSuccess={addNewTip} />
          </div>

          {/* Recent Supports Section */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <RecentSupports tips={recentTips} />
          </div>
        </div>
      </main>
    </div>
  );
}
