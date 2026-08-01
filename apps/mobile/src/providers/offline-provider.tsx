import { useEffect, type ReactNode } from "react";

import {
  fetchNetworkStatus,
  subscribeToNetworkStatus,
} from "@/lib/offline/network";
import { useOfflineStore } from "@/stores/offline-store";

export function OfflineProvider({ children }: { children: ReactNode }) {
  const setNetwork = useOfflineStore((state) => state.setNetwork);

  useEffect(() => {
    fetchNetworkStatus().then(setNetwork);
    return subscribeToNetworkStatus(setNetwork);
  }, [setNetwork]);

  return children;
}
