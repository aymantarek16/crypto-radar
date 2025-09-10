"use client";

interface FilterMenuProps {
  filter: string;
  setFilter: (value: string) => void;
}

export default function FilterMenu({ filter, setFilter }: FilterMenuProps) {
  return (
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white"
    >
      <option value="market_cap_desc">Market Cap</option>
      <option value="volume_desc">Volume</option>
      <option value="price_change_percentage_24h_desc">Top Gainers</option>
      <option value="price_change_percentage_24h_asc">Top Losers</option>
    </select>
  );
}
