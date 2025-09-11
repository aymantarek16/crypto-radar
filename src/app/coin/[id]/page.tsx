"use client";

import React from "react";
import Chart from "../../components/Chart";
import IndicatorPanel from "../../components/IndicatorPanel";
import AlertForm from "../../components/AlertForm";
import useSWR from "swr";
import { fetcher } from "../../lib/api";
import Image from "next/image";
import Loading from "src/app/components/Loading";

interface CoinDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function CoinDetailsPage({ params }: CoinDetailsPageProps) {
  const { id } = React.use(params);

  const { data: coin, error, isLoading } = useSWR(
  `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`,
  fetcher,
  {
  refreshInterval: 10000,        // refresh every 10 seconds (safe & smooth UX)
revalidateOnFocus: true,       // ensures data always fresh when user comes back
errorRetryCount: 3,
errorRetryInterval: 3000,
fallbackData: { prices: [] },

  }
);


  if (error) return <div className="p-6 text-red-500">Failed to load coin data.</div>;
  if (isLoading || !coin) return <div className="p-6 text-gray-400">
        <Loading />
  </div>;

  return (
    <div className="flex flex-col gap-6 p-6  w-[70vw]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Image
          src={coin.image?.small || coin.image}
          width={64}
          height={64}
          alt={coin.name}
          className="w-8 h-8"
        />
        <h1 className="text-2xl font-bold text-white">
          {coin.name}{" "}
          <span className="text-gray-400">
            ({coin.symbol?.toUpperCase()})
          </span>
        </h1>
      </div>

      {/* Price */}
      <div>
        <p className="text-3xl font-bold text-white">
          ${coin.market_data?.current_price?.usd?.toLocaleString() ?? "—"}
        </p>
        <p
          className={`text-lg ${
            (coin.market_data?.price_change_percentage_24h ?? 0) >= 0
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {(coin.market_data?.price_change_percentage_24h ?? 0).toFixed(2)}%
        </p>
      </div>

      {/* Chart */}
      <Chart coinId={id} />

      {/* Indicators */}
      <IndicatorPanel coinId={id} />

      {/* Alerts */}
      <AlertForm coinId={id} coinGeckoId={coin.id} />
    </div>
  );
}
