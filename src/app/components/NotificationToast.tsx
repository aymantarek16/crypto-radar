"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useAlertsStore  from "../store/useAlertsStore";

export default function NotificationToast() {
  const toast = useAlertsStore((s) => s.toast);
  const hideToast = useAlertsStore((s) => s.hideToast);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      hideToast();
    }, 2000);

    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.25 }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 max-w-xs"
          >
            <span className="text-xl">🔔</span>
            <div className="flex-1">
              <div className="text-sm">{toast.message}</div>
              {toast.coinId && (
                <div className="text-xs text-blue-100/80 mt-1">{toast.coinId}</div>
              )}
            </div>

            <button
              onClick={hideToast}
              className="ml-2 px-2 py-1 rounded bg-blue-800/30 hover:bg-blue-800/50"
              aria-label="Dismiss alert"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
