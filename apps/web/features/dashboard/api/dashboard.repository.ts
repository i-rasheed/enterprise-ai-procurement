import { apiGet } from "@/lib/api";

import type {
  AppNotification,
  DashboardFilters,
  ExecutiveDashboard,
  PaginatedRfqs,
} from "../types";

function buildQuery(filters?: DashboardFilters): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters?.startDate) {
    params.startDate = filters.startDate;
  }

  if (filters?.endDate) {
    params.endDate = filters.endDate;
  }

  return params;
}

export const dashboardRepository = {
  getExecutiveDashboard(filters?: DashboardFilters) {
    return apiGet<ExecutiveDashboard>("/dashboard/executive", buildQuery(filters));
  },

  getNotifications(limit = 8) {
    return apiGet<AppNotification[]>("/notifications").then((items) =>
      items.slice(0, limit),
    );
  },

  getUnreadNotificationCount() {
    return apiGet<AppNotification[]>("/notifications/unread").then(
      (items) => items.length,
    );
  },

  getPendingRfqsCount() {
    return apiGet<PaginatedRfqs>("/rfqs", {
      status: "PUBLISHED",
      page: 1,
      limit: 1,
    }).then((response) => response.total);
  },
};
