/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import { Line } from "react-chartjs-2";
import useSWR from "swr";
import { fetcher } from "../lib/api";
import { useEffect, useState } from "react";
import { calculateEMA } from "../lib/indicators";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, TimeScale);

let zoomRegistered = false;

interface ChartProps {
  coinId: string;
}

export default function Chart({ coinId }: ChartProps) {
const { data, error } = useSWR(
  `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30`,
  fetcher,
  {
    refreshInterval: 15000,      // every 15s, lighter on API
    revalidateOnFocus: false,    // prevent refetch on tab focus
    shouldRetryOnError: true,    // retry if error occurs
    errorRetryCount: 3,          // maximum 3 retries
    errorRetryInterval: 3000,    // retry every 3s
    fallbackData: { prices: [] }, // empty array if fetch fails
  }
);


  // dynamic import for zoom plugin (register once)
  useEffect(() => {
    (async () => {
      if (zoomRegistered) return;
      try {
        const mod = await import("chartjs-plugin-zoom");
        const zoomPlugin = mod?.default ?? mod;
        ChartJS.register(zoomPlugin);
        zoomRegistered = true;
      } catch (err) {
        // plugin not available — silently ignore; zoom will be disabled
        // console.warn("zoom plugin failed to load", err);
      }
    })();
  }, []);

  if (error) return <p className="text-red-500">Failed to load chart.</p>;
  if (!data) return (
    <div className="flex justify-center items-center h-40">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
    </div>
  );

  const labels = data.prices.map((p: [number, number]) => {
    return new Date(p[0]).toLocaleString();
  });

  const prices = data.prices.map((p: [number, number]) => p[1]);

  // compute EMA(14) on prices (if enough data)
  const emaValues = prices.length >= 14 ? calculateEMA(prices, 14) : [];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Price (USD)",
        data: prices,
        borderColor: "rgb(59,130,246)",
        backgroundColor: "rgba(59,130,246,0.12)",
        fill: true,
        tension: 0.15,
        pointRadius: 0,
      },
      ...(emaValues.length
        ? [
          {
            label: "EMA(14)",
            data: enaSafe(emaValues, prices.length),
            borderColor: "rgb(34,197,94)",
            backgroundColor: "rgba(34,197,94,0.06)",
            fill: false,
            tension: 0.15,
            pointRadius: 0,
          },
        ]
        : []),
    ],
  };

  const options: any = {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: true },
      tooltip: { mode: "index", intersect: false },
      zoom: {
        pan: { enabled: true, mode: "x" },
        zoom: { wheel: { enabled: true }, mode: "x" },
      },
    },
    scales: {
      x: { display: true },
      y: { display: true },
    },
  };

  return <Line data={chartData} options={options} />;
}

/**
 * Helper: ensure ema array length aligns with chart labels.
 * If ema shorter than labels, pad beginning with nulls so datasets align.
 */
function enaSafe(arr: number[], targetLen: number) {
  if (arr.length >= targetLen) return arr.slice(arr.length - targetLen);
  const pad = new Array(targetLen - arr.length).fill(null);
  return [...pad, ...arr];
}
