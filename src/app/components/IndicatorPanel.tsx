/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { calculateEMA, calculateRSI, calculatePivot } from "../lib/indicators";
import useSWR from "swr";
import { fetcher } from "../lib/api";

export default function IndicatorPanel({ coinId }: { coinId: string }) {
const { data } = useSWR(
  `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30&interval=daily`,
  fetcher,
  {
    refreshInterval: 15000,        // every 15 seconds, lighter on API
    revalidateOnFocus: false,      // prevent refetch on tab focus
    shouldRetryOnError: true,      // retry if an error occurs
    errorRetryCount: 3,            // maximum 3 retries
    errorRetryInterval: 3000,      // retry every 3 seconds
    fallbackData: { prices: [] },  // empty array if fetch fails
  }
);


  const [indicators, setIndicators] = useState<any>(null);

  useEffect(() => {
    if (data) {
      const closes = data.prices.map((p: [number, number]) => p[1]);
      setIndicators({
        ema: calculateEMA(closes, 14).slice(-1)[0],
        rsi: calculateRSI(closes, 14).slice(-1)[0],
        pivot: calculatePivot(closes.slice(-1)[0]),
      });
    }
  }, [data]);

  if (!indicators) return null;

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex gap-6">
      <div>
        <p className="text-sm text-gray-400">EMA(14)</p>
        <p className="text-lg font-bold text-white">{indicators.ema.toFixed(2)}</p>
      </div>
      <div>
        <p className="text-sm text-gray-400">RSI(14)</p>
        <p className="text-lg font-bold text-white">{indicators.rsi.toFixed(2)}</p>
      </div>
      <div>
        <p className="text-sm text-gray-400">Pivot</p>
        <p className="text-lg font-bold text-white">{indicators.pivot.toFixed(2)}</p>
      </div>
    </div>
  );
}
