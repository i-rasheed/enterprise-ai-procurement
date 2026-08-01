import { useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { approvalRepository, notificationsRepository } from "@/features/approvals/api/approval.repository";
import { purchaseOrderRepository } from "@/features/purchase-orders/api/purchase-order.repository";
import { isOnline } from "@/lib/offline/network";
import {
  getSyncQueue,
  replaceSyncQueue,
  type SyncQueueItem,
} from "@/lib/offline/sync-queue";
import { useOfflineStore } from "@/stores/offline-store";

async function processSyncItem(item: SyncQueueItem) {
  switch (item.type) {
    case "approve":
      await approvalRepository.approve(
        String(item.payload.workflowId),
        item.payload.comments
          ? { comments: String(item.payload.comments) }
          : undefined,
      );
      break;
    case "reject":
      await approvalRepository.reject(String(item.payload.workflowId), {
        comments: String(item.payload.comments ?? ""),
        reason: String(item.payload.reason ?? "Rejected offline"),
      });
      break;
    case "acknowledge-po":
      await purchaseOrderRepository.acknowledge(String(item.payload.id), {
        notes: String(item.payload.notes ?? "Acknowledged after reconnect"),
      });
      break;
    case "mark-notification-read":
      await notificationsRepository.markRead(String(item.payload.id));
      break;
    default:
      break;
  }
}

export function OfflineSyncProvider({ children }: { children: ReactNode }) {
  const network = useOfflineStore((state) => state.network);
  const markSynced = useOfflineStore((state) => state.markSynced);
  const setPendingSyncCount = useOfflineStore((state) => state.setPendingSyncCount);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isOnline(network)) {
      return;
    }

    let cancelled = false;

    (async () => {
      const queue = await getSyncQueue();
      setPendingSyncCount(queue.length);

      if (!queue.length) {
        return;
      }

      const remaining: SyncQueueItem[] = [];

      for (const item of queue) {
        if (cancelled) {
          remaining.push(item);
          continue;
        }

        try {
          await processSyncItem(item);
        } catch {
          remaining.push(item);
        }
      }

      await replaceSyncQueue(remaining);
      setPendingSyncCount(remaining.length);
      markSynced();
      await queryClient.invalidateQueries();
    })();

    return () => {
      cancelled = true;
    };
  }, [markSynced, network, queryClient, setPendingSyncCount]);

  return children;
}
