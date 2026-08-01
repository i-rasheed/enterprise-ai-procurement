import { useEffect, type ReactNode } from "react";
import { getSyncQueue } from "@/lib/offline/sync-queue";

import {
  fetchNetworkStatus,
  subscribeToNetworkStatus,
} from "@/lib/offline/network";
import { useOfflineStore } from "@/stores/offline-store";

export function OfflineProvider({ children }: { children: ReactNode }) {
  const setNetwork = useOfflineStore((state) => state.setNetwork);
  const setPendingSyncCount = useOfflineStore((state) => state.setPendingSyncCount);

  useEffect(() => {
    fetchNetworkStatus().then(setNetwork);
    getSyncQueue().then((queue) => setPendingSyncCount(queue.length));
    return subscribeToNetworkStatus(setNetwork);
  }, [setNetwork, setPendingSyncCount]);

  return children;
}
