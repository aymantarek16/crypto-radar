/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import SearchBar from "./components/SearchBar";
import FilterMenu from "./components/FilterMenu";
import CoinCard from "./components/CoinCard";
import useSWR from "swr";
import { fetcher } from "./lib/api";
import { useState } from "react";
import NotificationToast from "./components/NotificationToast";
import Loading from "./components/Loading";

export default function HomePage() {
  const { data, error, isLoading } = useSWR(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h,24h,7d,30d",
    fetcher,
    {
      refreshInterval: 10000,        // refresh every 10 seconds (safe & smooth UX)
      revalidateOnFocus: true,       // ensures data always fresh when user comes back
      errorRetryCount: 3,
      errorRetryInterval: 3000,
      fallbackData: { prices: [] },

    }

  );

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("market_cap_desc");

  if (error) return <div className="p-6 text-red-500">Failed to load coins.</div>;
  if (isLoading) return <div className="p-6 text-gray-400"><Loading /></div>;

  let filteredData = (data ?? []).filter(
    (coin: any) =>
      coin.name.toLowerCase().includes(query.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(query.toLowerCase())
  );

  if (filter === "volume_desc") {
    filteredData = [...filteredData].sort((a, b) => b.total_volume - a.total_volume);
  } else if (filter === "price_change_percentage_24h_desc") {
    filteredData = [...filteredData].sort(
      (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
    );
  } else if (filter === "price_change_percentage_24h_asc") {
    filteredData = [...filteredData].sort(
      (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
    );
  } else {
    filteredData = [...filteredData].sort((a, b) => b.market_cap - a.market_cap);
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SearchBar query={query} setQuery={setQuery} />
        <FilterMenu filter={filter} setFilter={setFilter} />
      </div>

      {/* Coins Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
        {filteredData.length > 0 ? (
          filteredData.map((coin: any) => <CoinCard key={coin.id} coin={coin} />)
        ) : (
          <div className="col-span-full text-center text-gray-400 py-10">
            No coins found.
          </div>
        )}
      </div>

      {/* Toast */}
      <NotificationToast />
    </div>
  );
}
