import { create } from "zustand";

import type { NetworkStatus } from "@/lib/offline/network";

type OfflineState = {
  network: NetworkStatus;
  lastSyncedAt: string | null;
  setNetwork: (network: NetworkStatus) => void;
  markSynced: () => void;
};

export const useOfflineStore = create<OfflineState>((set) => ({
  network: {
    isConnected: true,
    isInternetReachable: true,
  },
  lastSyncedAt: null,
  setNetwork: (network) => set({ network }),
  markSynced: () => set({ lastSyncedAt: new Date().toISOString() }),
}));
