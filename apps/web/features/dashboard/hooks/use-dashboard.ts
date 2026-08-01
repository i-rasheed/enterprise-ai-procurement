"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardRepository } from "@/features/dashboard/api/dashboard.repository";
import type { DashboardFilters } from "@/features/dashboard/types";
import { ApiClientError } from "@/lib/api";

export const dashboardQueryKeys = {
  executive: (filters?: DashboardFilters) =>
    ["dashboard", "executive", filters] as const,
  notifications: ["dashboard", "notifications"] as const,
  pendingRfqs: ["dashboard", "pending-rfqs"] as const,
};

export function useExecutiveDashboard(filters?: DashboardFilters) {
  return useQuery({
    queryKey: dashboardQueryKeys.executive(filters),
    queryFn: () => dashboardRepository.getExecutiveDashboard(filters),
    retry: (count, error) => {
      if (error instanceof ApiClientError && error.statusCode === 403) {
        return false;
      }
      return count < 1;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useDashboardNotifications() {
  return useQuery({
    queryKey: dashboardQueryKeys.notifications,
    queryFn: () => dashboardRepository.getNotifications(8),
    staleTime: 60 * 1000,
  });
}

export function usePendingRfqsCount(enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.pendingRfqs,
    queryFn: () => dashboardRepository.getPendingRfqsCount(),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}
