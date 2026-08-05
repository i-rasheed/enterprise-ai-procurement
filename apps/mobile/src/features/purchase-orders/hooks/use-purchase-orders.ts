import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchWithOfflineCache } from "@/lib/offline/fetch-with-cache";
import { enqueueSyncItem } from "@/lib/offline/sync-queue";
import { isOnline } from "@/lib/offline/network";
import { useAuthStore } from "@/stores/auth-store";
import { useOfflineStore } from "@/stores/offline-store";

import { purchaseOrderRepository } from "../api/purchase-order.repository";

export const purchaseOrderQueryKeys = {
  list: ["purchase-orders"] as const,
  detail: (id: string) => ["purchase-orders", id] as const,
};

export function usePurchaseOrders() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const network = useOfflineStore((state) => state.network);
  const markSynced = useOfflineStore((state) => state.markSynced);

  return useQuery({
    queryKey: purchaseOrderQueryKeys.list,
    queryFn: () =>
      fetchWithOfflineCache(
        "purchase-orders.list",
        () => purchaseOrderRepository.list(),
        network,
        markSynced,
      ),
    enabled: isAuthenticated,
    select: (data) => data.purchaseOrders,
    staleTime: 30_000,
  });
}

export function usePurchaseOrder(id: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const network = useOfflineStore((state) => state.network);

  return useQuery({
    queryKey: purchaseOrderQueryKeys.detail(id),
    queryFn: () =>
      fetchWithOfflineCache(
        `purchase-orders.${id}`,
        () => purchaseOrderRepository.getById(id),
        network,
      ),
    enabled: isAuthenticated && Boolean(id),
  });
}

export function useAcknowledgePurchaseOrder() {
  const queryClient = useQueryClient();
  const network = useOfflineStore((state) => state.network);
  const setPendingSyncCount = useOfflineStore((state) => state.setPendingSyncCount);

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      if (!isOnline(network)) {
        const queue = await enqueueSyncItem({
          id: `${id}-ack-${Date.now()}`,
          type: "acknowledge-po",
          payload: { id, notes },
        });
        setPendingSyncCount(queue.length);
        return { queued: true };
      }

      return purchaseOrderRepository.acknowledge(id, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.list });
    },
  });
}
