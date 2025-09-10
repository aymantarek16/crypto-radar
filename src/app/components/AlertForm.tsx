"use client";

import { useState } from "react";
import useAlertsStore from "../store/useAlertsStore"; 
import NotificationToast from "./NotificationToast";

export default function AlertForm({ coinId, coinGeckoId }: { coinId: string; coinGeckoId: string }) {
  const [price, setPrice] = useState("");
  const addAlert = useAlertsStore((s) => s.addAlert);
  const showToast = useAlertsStore((s) => s.showToast);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price) return;

    const targetPrice = parseFloat(price);
    if (isNaN(targetPrice) || targetPrice <= 0) return;

    // Alert object 
    const newAlert = {
      id: Date.now(),
      coinId,
      coinGeckoId,
      target: targetPrice,
      message: `✅ Alert added for ${coinId} @ $${targetPrice.toLocaleString()}`,
    };

    addAlert(newAlert);

    // Toast object 
    showToast({
      id: Date.now(),
      coinId,
      target: targetPrice,
      message: `✅ Alert added for ${coinId} @ $${targetPrice.toLocaleString()}`,
    });

    setPrice("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex gap-3 items-center"
    >
      <input
        type="number"
        step="any"
        placeholder="Target price..."
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-500 border border-gray-700 px-3 py-2 rounded-lg"
      />
      <button
        type="submit"
        className="px-4 py-2 cursor-pointer bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition"
      >
        Add Alert
      </button>
      <NotificationToast />
    </form>
  );
}
