import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getErrorMessage } from "@/lib/api";
import { getOfflineCache, setOfflineCache } from "@/lib/offline/cache";
import { isOnline } from "@/lib/offline/network";
import { useAuthStore } from "@/stores/auth-store";
import { useOfflineStore } from "@/stores/offline-store";

import {
  dashboardRepository,
  notificationsRepository,
} from "../api/dashboard.repository";

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
    queryFn: async () => {
      try {
        const dashboard = await dashboardRepository.getExecutiveDashboard();
        await setOfflineCache("dashboard.executive", dashboard);
        markSynced();
        return dashboard;
      } catch (error) {
        if (!isOnline(network)) {
          const cached = await getOfflineCache<
            Awaited<ReturnType<typeof dashboardRepository.getExecutiveDashboard>>
          >("dashboard.executive");
          if (cached) {
            return cached;
          }
        }
        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useNotifications() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const network = useOfflineStore((state) => state.network);

  return useQuery({
    queryKey: dashboardQueryKeys.notifications,
    queryFn: async () => {
      try {
        const notifications = await notificationsRepository.list();
        await setOfflineCache("notifications", notifications);
        return notifications;
      } catch (error) {
        if (!isOnline(network)) {
          const cached = await getOfflineCache<
            Awaited<ReturnType<typeof notificationsRepository.list>>
          >("notifications");
          if (cached) {
            return cached;
          }
        }
        throw error;
      }
    },
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

  return useMutation({
    mutationFn: (id: string) => notificationsRepository.markRead(id),
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
