import { useQuery } from "@tanstack/react-query";

import { fetchWithOfflineCache } from "@/lib/offline/fetch-with-cache";
import { useAuthStore } from "@/stores/auth-store";
import { useOfflineStore } from "@/stores/offline-store";

import { contractRepository } from "../api/contract.repository";

export const contractQueryKeys = {
  list: ["contracts"] as const,
  detail: (id: string) => ["contracts", id] as const,
};

export function useContracts(vendorId?: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const network = useOfflineStore((state) => state.network);
  const markSynced = useOfflineStore((state) => state.markSynced);
  const cacheKey = vendorId ? `contracts.list.${vendorId}` : "contracts.list";

  return useQuery({
    queryKey: vendorId ? [...contractQueryKeys.list, vendorId] : contractQueryKeys.list,
    queryFn: () =>
      fetchWithOfflineCache(
        cacheKey,
        () => contractRepository.list({ vendorId }),
        network,
        markSynced,
      ),
    enabled: isAuthenticated,
    select: (data) => data.contracts,
    staleTime: 30_000,
  });
}

export function useContract(id: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const network = useOfflineStore((state) => state.network);

  return useQuery({
    queryKey: contractQueryKeys.detail(id),
    queryFn: () =>
      fetchWithOfflineCache(
        `contracts.${id}`,
        () => contractRepository.getById(id),
        network,
      ),
    enabled: isAuthenticated && Boolean(id),
  });
}
