/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import NotificationToast from "../components/NotificationToast";
import { useAlertsStore, Alert } from "../store/useAlertsStore";
import {
  AiOutlineDelete,
  AiOutlineAim,
  AiOutlineEdit,
  AiOutlineCheck,
} from "react-icons/ai";
import { useState, useEffect, useRef } from "react";

/**
 * Trigger browser notification + optional speech (TTS).
 * speakText: text to be read by SpeechSynthesis (if provided)
 */
function triggerNotification(title: string, body: string, speakText?: string) {
  // Request notification permission if needed
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }

  // Show browser notification if granted
  if (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    try {
      new Notification(title, {
        body,
        icon: "/icon.png",
      });
    } catch (err) {
      console.warn("Notification error:", err);
    }
  }

  // Text-to-speech (TTS)
  if (speakText && typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      const utter = new SpeechSynthesisUtterance(speakText);
      utter.lang = "en-US"; // change to "ar-EG" if you want Arabic TTS (results may vary)
      utter.rate = 1;
      utter.pitch = 1;
      speechSynthesis.cancel(); // avoid overlapping utterances
      speechSynthesis.speak(utter);
    } catch (err) {
      console.warn("TTS error:", err);
    }
  }
}

/** Fetch prices from CoinGecko (returns object like { bitcoin: { usd: 50000 } }) */
async function fetchPricesForIds(ids: string[]) {
  if (!ids.length) return {};
  const uniq = Array.from(new Set(ids)).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
    uniq
  )}&vs_currencies=usd`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`price fetch failed: ${res.status}`);
  return await res.json();
}

export default function AlertsPage() {
  const alerts = useAlertsStore((s) => s.alerts);
  const removeAlert = useAlertsStore((s) => s.removeAlert);
  const showToast = useAlertsStore((s) => s.showToast);
  const updateAlert = useAlertsStore((s) => s.updateAlert);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [newTarget, setNewTarget] = useState<string>("");

  const notifiedRef = useRef<Set<number>>(new Set());
  const POLL_INTERVAL = 15000;

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Poll coin prices periodically and trigger notifications when target reached
  useEffect(() => {
    let cancelled = false;

    const checkAll = async () => {
      try {
        if (!alerts || alerts.length === 0) return;

        // collect coingecko ids from alerts
        const ids = alerts.map((a) => a.coinGeckoId).filter(Boolean) as string[];
        if (!ids.length) return;

        const prices = await fetchPricesForIds(ids);
        if (cancelled) return;

        for (const alert of alerts) {
          const cgId = alert.coinGeckoId;
          const priceObj = (prices as any)[cgId];
          if (!priceObj || typeof priceObj.usd !== "number") continue;
          const currentPrice = priceObj.usd;

          if (currentPrice >= alert.target && !notifiedRef.current.has(alert.id)) {
            const formatted = new Intl.NumberFormat("en-US").format(currentPrice);
            const msg = `🚨 ${alert.coinId.toUpperCase()} reached $${formatted}`;

            // show internal toast
            showToast({
              id: Date.now(),
              coinId: alert.coinId,
              target: alert.target,
              message: msg,
            });

            // browser notification + TTS
            triggerNotification(
              "Crypto Radar — Target Reached",
              msg,
              `${alert.coinId.toUpperCase()} reached ${formatted} dollars`
            );

            // mark as notified to avoid repeats
            notifiedRef.current.add(alert.id);
          }
        }
      } catch (err) {
        console.warn("Price check error:", err);
      }
    };

    // initial check + polling
    checkAll();
    const iv = setInterval(checkAll, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [alerts, showToast]);

  if (!alerts.length)
    return (
      <div className="p-6 text-gray-400 text-center text-lg">
        🚀 No alerts set yet.
      </div>
    );

  // Remove alert and clear notified flag for it
  const handleDelete = (id: number, coinId: string, target: number) => {
    removeAlert(id);
    showToast({
      id: Date.now(),
      coinId,
      target,
      message: `❌ Alert for ${coinId} @ $${target.toLocaleString()} removed`,
    });
    const copy = new Set(notifiedRef.current);
    copy.delete(id);
    notifiedRef.current = copy;
  };

  // Start editing an alert
  const handleEdit = (id: number, currentTarget: number) => {
    setEditingId(id);
    setNewTarget(currentTarget.toString());
  };

  /**
   * Save new target for an alert.
   * coinGeckoId is used here to immediately fetch current price after update
   * so we can trigger notification right away if currentPrice >= newTarget.
   */
  const handleSave = async (id: number, coinId: string, coinGeckoId: string) => {
    const parsedTarget = parseFloat(newTarget);
    if (!isNaN(parsedTarget)) {
      // update the store
      updateAlert(id, parsedTarget);

      // show internal toast
      showToast({
        id: Date.now(),
        coinId,
        target: parsedTarget,
        message: `✏️ Alert for ${coinId} updated → $${parsedTarget.toLocaleString()}`,
      });

      // clear notified flag so it can re-trigger if needed
      const copy = new Set(notifiedRef.current);
      copy.delete(id);
      notifiedRef.current = copy;

      // immediate check for this coin using coinGeckoId
      try {
        if (coinGeckoId) {
          const prices = await fetchPricesForIds([coinGeckoId]);
          const priceObj = (prices as any)[coinGeckoId];
          if (priceObj && typeof priceObj.usd === "number") {
            const currentPrice = priceObj.usd;
            if (currentPrice >= parsedTarget && !notifiedRef.current.has(id)) {
              const formatted = new Intl.NumberFormat("en-US").format(currentPrice);
              const msg = `🚨 ${coinId.toUpperCase()} reached $${formatted}`;

              showToast({
                id: Date.now(),
                coinId,
                target: parsedTarget,
                message: msg,
              });

              triggerNotification(
                "Crypto Radar — Target Reached",
                msg,
                `${coinId.toUpperCase()} reached ${formatted} dollars`
              );

              notifiedRef.current.add(id);
            }
          }
        }
      } catch (err) {
        console.warn("Immediate check error:", err);
      }
    }

    // close editor
    setEditingId(null);
    setNewTarget("");
  };

  // Manual test button to unlock permissions & TTS and verify notifications
  const handleTest = (alert: Alert) => {
    const msg = `🚨 TEST — ${alert.coinId.toUpperCase()} at $${alert.target.toLocaleString()}`;
    triggerNotification(
      "Crypto Radar — Test Alert",
      msg,
      `${alert.coinId.toUpperCase()} test ${alert.target} dollars`
    );
    showToast({
      id: Date.now(),
      coinId: alert.coinId,
      target: alert.target,
      message: msg,
    });
  };

  return (
    <div className="p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative">
      {alerts.map((alert: Alert) => (
        <div
          key={alert.id}
          className="relative group overflow-hidden rounded-3xl border border-gray-700/40 
                     bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 
                     backdrop-blur-xl shadow-xl hover:shadow-2xl 
                     transition-all duration-500 hover:border-blue-500/50"
        >
          {/* Glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-2xl"></div>

          {/* Card content */}
          <div className="relative z-10 flex flex-col h-full p-6 justify-between">
            <div className="flex flex-col gap-3">
              <span className="text-white font-bold text-xl tracking-wide drop-shadow-lg mb-2">
                {alert.coinId.toUpperCase()}
              </span>

              {editingId === alert.id ? (
                <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-400/30">
                  <input
                    type="number"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="bg-transparent border-none outline-none text-blue-300 text-lg font-mono w-24"
                  />
                  <button
                    onClick={() =>
                      handleSave(alert.id, alert.coinId, alert.coinGeckoId)
                    }
                    className="text-green-400 hover:text-green-300 transition"
                  >
                    <AiOutlineCheck size={22} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-400/30">
                  <AiOutlineAim className="text-blue-400 text-xl" />
                  <span className="text-blue-300 text-lg font-mono">
                    ${alert.target.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() =>
                  editingId === alert.id
                    ? setEditingId(null)
                    : handleEdit(alert.id, alert.target)
                }
                className="flex items-center justify-center gap-2 py-2 rounded-xl text-white font-medium transition hover:scale-105 shadow-md"
              >
                <AiOutlineEdit size={18} />
                Edit
              </button>

              <button
                onClick={() =>
                  handleDelete(alert.id, alert.coinId, alert.target)
                }
                className="flex items-center justify-center gap-2 py-2 rounded-xl !bg-red-600/90 hover:bg-red-500 text-white font-medium transition hover:scale-105 shadow-md"
              >
                <AiOutlineDelete size={18} />
                Delete
              </button>

              <button
                onClick={() => handleTest(alert)}
                className="flex items-center justify-center gap-2 py-2 rounded-xl !bg-blue-600/90 hover:bg-blue-500 text-white font-medium transition hover:scale-105 shadow-md"
              >
                🔔 Test
              </button>
            </div>
          </div>
        </div>
      ))}

      <NotificationToast />
    </div>
  );
}
