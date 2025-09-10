import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ReactNode } from "react";

/** Alert type used across the app */
export interface Alert {
  id: number;
  message?: ReactNode | string;
  coinId: string;       // e.g. "BTC" (display)
  coinGeckoId: string;  // e.g. "bitcoin" (for CoinGecko API)
  target: number;
}

/** Toast type used for internal toasts */
export interface Toast {
  id: number;
  coinId: string;
  target: number;
  message: string;
}

/** Zustand state shape for alerts + toast */
interface AlertsState {
  alerts: Alert[];
  toast: Toast | null;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: number, newTarget: number) => void;
  removeAlert: (id: number) => void;
  showToast: (toast: Toast) => void;
  hideToast: () => void;
}

const useAlertsStore = create<AlertsState>()(

  persist(
    (set) => ({
      alerts: [],
      toast: null,

      // Add new alert
      addAlert: (alert) =>
        set((state) => ({
          alerts: [...state.alerts, alert],
        })),

      // Update the alert target
      updateAlert: (id, newTarget) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, target: newTarget } : a
          ),
        })),

      // Remove an alert
      removeAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        })),

      // Show an internal toast
      showToast: (toast) => set({ toast }),

      // Hide toast
      hideToast: () => set({ toast: null }),
    }),
    { name: "alerts-storage" }
  )
);

export default useAlertsStore;
