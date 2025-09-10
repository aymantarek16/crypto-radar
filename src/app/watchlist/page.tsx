"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useWatchlistStore } from "../store/useWatchlistStore";
import CoinCard from "../components/CoinCard";
import useSWR from "swr";
import { fetcher } from "../lib/api";
import NotificationToast from "../components/NotificationToast";
import Loading from "../components/Loading";

export default function WatchlistPage() {
  const watchlist = useWatchlistStore((s) => s.watchlist);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

const { data, error, isLoading } = useSWR(
  mounted && watchlist.length > 0
    ? `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${watchlist.join(",")}`
    : null,
  fetcher,
  {
    refreshInterval: 15000,        // every 15 seconds, lighter on API
    revalidateOnFocus: false,      // prevent refetch on tab focus
    shouldRetryOnError: true,      // retry if an error occurs
    errorRetryCount: 3,            // maximum 3 retries
    errorRetryInterval: 3000,      // retry every 3 seconds
    fallbackData: [],              // empty array if fetch fails
  }
);

  if (!mounted) {
    return (
      <div className="p-6 text-gray-400">
        <Loading />
      </div>
    );
  }

  if (error) return <div className="p-6 text-red-500">Failed to load watchlist.</div>;
  if (isLoading) return <div className="p-6 text-gray-400"><Loading /></div>;
  if (!watchlist.length) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        No coins in watchlist.
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {(data ?? []).map((coin: any) => (
        <CoinCard key={coin.id} coin={coin} />
      ))}

      {/* Toast */}
      <NotificationToast />
    </div>
  );
}
