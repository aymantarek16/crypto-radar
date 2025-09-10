"use client";

import { useWatchlistStore } from "../store/useWatchlistStore";

export default function WatchlistButton({ coinId }: { coinId: string }) {
  const { watchlist, toggleCoin } = useWatchlistStore();

  const isInWatchlist = watchlist.includes(coinId);

  return (
    <button
      onClick={() => toggleCoin(coinId)}
      className={`px-3 py-1 rounded-lg text-sm ${
        isInWatchlist
          ? "bg-red-600 text-white"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {isInWatchlist ? "Remove" : "Add to Watchlist"}
    </button>
  );
}
