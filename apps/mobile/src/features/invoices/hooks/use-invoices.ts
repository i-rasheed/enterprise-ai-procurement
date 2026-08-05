import { useQuery } from "@tanstack/react-query";

import { fetchWithOfflineCache } from "@/lib/offline/fetch-with-cache";
import { useAuthStore } from "@/stores/auth-store";
import { useOfflineStore } from "@/stores/offline-store";

import { invoiceRepository } from "../api/invoice.repository";

export const invoiceQueryKeys = {
  list: ["invoices"] as const,
  detail: (id: string) => ["invoices", id] as const,
};

export function useInvoices(vendorId?: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const network = useOfflineStore((state) => state.network);
  const markSynced = useOfflineStore((state) => state.markSynced);
  const cacheKey = vendorId ? `invoices.list.${vendorId}` : "invoices.list";

  return useQuery({
    queryKey: vendorId ? [...invoiceQueryKeys.list, vendorId] : invoiceQueryKeys.list,
    queryFn: () =>
      fetchWithOfflineCache(
        cacheKey,
        () => invoiceRepository.list({ vendorId }),
        network,
        markSynced,
      ),
    enabled: isAuthenticated,
    select: (data) => data.invoices,
    staleTime: 30_000,
  });
}

export function useInvoice(id: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const network = useOfflineStore((state) => state.network);

  return useQuery({
    queryKey: invoiceQueryKeys.detail(id),
    queryFn: () =>
      fetchWithOfflineCache(
        `invoices.${id}`,
        () => invoiceRepository.getById(id),
        network,
      ),
    enabled: isAuthenticated && Boolean(id),
  });
}
