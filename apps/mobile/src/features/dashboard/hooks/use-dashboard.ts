import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getErrorMessage } from "@/lib/api";
import { fetchWithOfflineCache } from "@/lib/offline/fetch-with-cache";
import { enqueueSyncItem } from "@/lib/offline/sync-queue";
import { isOnline } from "@/lib/offline/network";
import { notificationsRepository } from "@/features/approvals/api/approval.repository";
import { useAuthStore } from "@/stores/auth-store";
import { useOfflineStore } from "@/stores/offline-store";

import { dashboardRepository } from "../api/dashboard.repository";

export const dashboardQueryKeys = {
  executive: ["dashboard", "executive"] as const,
  notifications: ["notifications"] as const,
  unreadNotifications: ["notifications", "unread"] as const,
};

export function useExecutiveDashboard() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const network = useOfflineStore((state) => state.network);
  const markSynced = useOfflineStore((state) => state.markSynced);

  return useQuery({
    queryKey: dashboardQueryKeys.executive,
    queryFn: () =>
      fetchWithOfflineCache(
        "dashboard.executive",
        () => dashboardRepository.getExecutiveDashboard(),
        network,
        markSynced,
      ),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useNotifications() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const network = useOfflineStore((state) => state.network);

  return useQuery({
    queryKey: dashboardQueryKeys.notifications,
    queryFn: () =>
      fetchWithOfflineCache(
        "notifications",
        () => notificationsRepository.list(),
        network,
      ),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useUnreadNotificationCount() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: dashboardQueryKeys.unreadNotifications,
    queryFn: () => notificationsRepository.listUnread(),
    enabled: isAuthenticated,
    staleTime: 30_000,
    select: (items) => items.length,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const network = useOfflineStore((state) => state.network);
  const setPendingSyncCount = useOfflineStore((state) => state.setPendingSyncCount);

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isOnline(network)) {
        const queue = await enqueueSyncItem({
          id: `${id}-read-${Date.now()}`,
          type: "mark-notification-read",
          payload: { id },
        });
        setPendingSyncCount(queue.length);
        return { queued: true };
      }

      return notificationsRepository.markRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.notifications });
      queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.unreadNotifications,
      });
    },
    onError: (error) => {
      console.warn(getErrorMessage(error));
    },
  });
}
