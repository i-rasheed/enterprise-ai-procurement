import { apiGet, apiPatch } from "@/lib/api";
import type { AppNotification, ExecutiveDashboard } from "@/lib/api/types";

export const dashboardRepository = {
  getExecutiveDashboard() {
    return apiGet<ExecutiveDashboard>("/dashboard/executive");
  },

  getNotifications() {
    return apiGet<AppNotification[]>("/notifications");
  },

  getUnreadNotifications() {
    return apiGet<AppNotification[]>("/notifications/unread");
  },
};

export const notificationsRepository = {
  list() {
    return apiGet<AppNotification[]>("/notifications");
  },

  listUnread() {
    return apiGet<AppNotification[]>("/notifications/unread");
  },

  markRead(id: string) {
    return apiPatch<{ count: number }>(`/notifications/${id}/read`);
  },
};
