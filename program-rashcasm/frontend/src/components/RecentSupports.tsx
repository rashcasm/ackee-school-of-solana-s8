"use client";

import { TipHistoryData } from "@/types";

interface RecentSupportsProps {
  tips: TipHistoryData[];
}

export function RecentSupports({ tips }: RecentSupportsProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Recent supports</h2>
      <div className="space-y-4">
        {tips.length === 0 ? (
          <div className="text-white/60 text-center py-8">
            No supports yet. Be the first! 🚀
          </div>
        ) : (
          tips.map((tip, index) => (
            <div
              key={index}
              className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-white/70">👤</div>
                  <span className="text-white/90 font-mono text-sm">
                    {formatAddress(tip.tipper)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-yellow-400 font-semibold">
                  <span>💰</span>
                  <span>{tip.amount.toFixed(2)} SOL</span>
                </div>
              </div>
              <p className="text-white/80 mb-2">{tip.message}</p>
              <div className="flex items-center gap-1 text-white/50 text-xs">
                <span>🕐</span>
                <span>{formatDate(tip.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
