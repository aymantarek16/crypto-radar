"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useWatchlistStore } from "../store/useWatchlistStore";
import { useAlertsStore } from "../store/useAlertsStore";
import { Coin } from "../../types";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import Loading from "../components/Loading";

interface CoinCardProps {
  coin: Coin;
}

export default function CoinCard({ coin }: CoinCardProps) {
  const toggleCoin = useWatchlistStore((s) => s.toggleCoin);
  const isInWatchlist = useWatchlistStore((s) =>
    s.watchlist.includes(coin.id)
  );
  const showToast = useAlertsStore((s) => s.showToast);

  const [timeframe, setTimeframe] = useState<"1h" | "24h" | "7d" | "30d">("24h");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = () => {
    toggleCoin(coin.id);

    if (!isInWatchlist) {
      showToast({
        id: Date.now(),
        message: `${coin.name} added to Watchlist ✅`,
        coinId: coin.id,
        target: coin.current_price,
      });
    } else {
      showToast({
        id: Date.now(),
        message: `${coin.name} removed from Watchlist ❌`,
        coinId: coin.id,
        target: coin.current_price,
      });
    }
  };

  const getChangeValue = () => {
    switch (timeframe) {
      case "1h":
        return coin.price_change_percentage_1h_in_currency;
      case "7d":
        return coin.price_change_percentage_7d_in_currency;
      case "30d":
        return coin.price_change_percentage_30d_in_currency;
      default:
        return coin.price_change_percentage_24h;
    }
  };

  const changeValue = getChangeValue();

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(() => {
      router.push(`/coin/${coin.id}`);
    });
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative p-4 md:w-[220px] bg-gray-900 border border-gray-800 rounded-2xl flex flex-col gap-4 hover:border-blue-500 transition cursor-pointer"
    >
      {/* Heart Button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); 
          handleToggle();
        }}
        className="absolute top-3 right-1 text-2xl !bg-transparent cursor-pointer"
        aria-label="Toggle Watchlist"
      >
        {isInWatchlist ? (
          <AiFillHeart className="text-green-500" />
        ) : (
          <AiOutlineHeart className="text-white/50 hover:text-white" />
        )}
      </button>

      {/* Coin Header */}
      <div className="flex items-center gap-3">
        <Image src={coin.image} width={40} height={40} alt={coin.name} />
        <div>
          <h2 className="text-white font-bold text-lg">
            {coin.name.split(" ").slice(0, 1).join(" ")}
          </h2>
          <p className="text-gray-400 text-sm">{coin.symbol.toUpperCase()}</p>
        </div>
      </div>

      {/* Price + Change */}
      <div>
        <p className="text-xl font-bold text-white">
          ${coin.current_price.toLocaleString()}
        </p>
        <p
          className={`text-sm mt-1 ${
            changeValue !== undefined && changeValue >= 0
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {changeValue !== undefined ? `${changeValue.toFixed(2)}%` : "N/A"} (
          {timeframe})
        </p>
      </div>

      {/* Dropdown For Timeframe */}
      <select
        value={timeframe}
        onChange={(e) =>
          setTimeframe(e.target.value as "1h" | "24h" | "7d" | "30d")
        }
        className="bg-gray-800 text-white text-sm rounded-lg px-2 py-1 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <option value="1h">1h</option>
        <option value="24h">24h</option>
        <option value="7d">7d</option>
        <option value="30d">30d</option>
      </select>

      {/* ✅ Loading Overlay */}
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl">
          <Loading />
        </div>
      )}
    </div>
  );
}
