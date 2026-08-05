import { create } from "zustand";

import type { NetworkStatus } from "@/lib/offline/network";

type OfflineState = {
  network: NetworkStatus;
  lastSyncedAt: string | null;
  pendingSyncCount: number;
  pushToken: string | null;
  setNetwork: (network: NetworkStatus) => void;
  markSynced: () => void;
  setPendingSyncCount: (count: number) => void;
  setPushToken: (token: string | null) => void;
};

export const useOfflineStore = create<OfflineState>((set) => ({
  network: {
    isConnected: true,
    isInternetReachable: true,
  },
  lastSyncedAt: null,
  pendingSyncCount: 0,
  pushToken: null,
  setNetwork: (network) => set({ network }),
  markSynced: () => set({ lastSyncedAt: new Date().toISOString() }),
  setPendingSyncCount: (pendingSyncCount) => set({ pendingSyncCount }),
  setPushToken: (pushToken) => set({ pushToken }),
}));
