import { useEffect, type ReactNode } from "react";

import { useProfile } from "@/features/auth/hooks/use-auth";
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
  registerForPushNotifications,
} from "@/lib/notifications/push";
import { useAuthStore } from "@/stores/auth-store";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  useProfile();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    registerForPushNotifications().catch(() => undefined);

    const received = addNotificationReceivedListener(() => undefined);
    const response = addNotificationResponseListener(() => undefined);

    return () => {
      received.remove();
      response.remove();
    };
  }, [isAuthenticated]);

  return children;
}
