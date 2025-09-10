import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WatchlistState {
  watchlist: string[];
  toggleCoin: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      toggleCoin: (id: string) => {
        const current = get().watchlist;
        if (current.includes(id)) {
          set({ watchlist: current.filter((coinId) => coinId !== id) });
        } else {
          set({ watchlist: [...current, id] });
        }
      },
      isInWatchlist: (id: string) => get().watchlist.includes(id),
    }),
    { name: "watchlist-storage" }
  )
);
