import { useRouter } from "expo-router";
import { useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { dashboardQueryKeys } from "@/features/dashboard/hooks/use-dashboard";
import { useProfile } from "@/features/auth/hooks/use-auth";
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
  registerForPushNotifications,
  scheduleLocalNotification,
} from "@/lib/notifications/push";
import { useAuthStore } from "@/stores/auth-store";
import { useOfflineStore } from "@/stores/offline-store";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setPushToken = useOfflineStore((state) => state.setPushToken);
  const queryClient = useQueryClient();
  useProfile();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    registerForPushNotifications()
      .then((token) => setPushToken(token))
      .catch(() => undefined);

    const received = addNotificationReceivedListener((notification) => {
      const title = notification.request.content.title ?? "ProcureAI";
      const body = notification.request.content.body ?? "New update available";
      scheduleLocalNotification(title, body).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.notifications });
      queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.unreadNotifications,
      });
    });

    const response = addNotificationResponseListener(() => {
      router.push("/notifications");
    });

    return () => {
      received.remove();
      response.remove();
    };
  }, [isAuthenticated, queryClient, router, setPushToken]);

  return children;
}
