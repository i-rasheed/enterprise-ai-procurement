"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { dashboardRepository } from "@/features/dashboard/api/dashboard.repository";
import type { DashboardFilters } from "@/features/dashboard/types";
import { getErrorMessage } from "@/lib/api";
import { ApiClientError } from "@/lib/api";

import { analyticsRepository } from "../api/analytics.repository";
import type { AnalyticsFilters, ExportFormat } from "../types";
import { downloadReport } from "../utils/download-report";

export const analyticsQueryKeys = {
  all: ["analytics"] as const,
  spend: (filters?: AnalyticsFilters) =>
    ["analytics", "spend", filters] as const,
  vendors: (filters?: AnalyticsFilters) =>
    ["analytics", "vendors", filters] as const,
  approvals: (filters?: AnalyticsFilters) =>
    ["analytics", "approvals", filters] as const,
  executive: (filters?: DashboardFilters) =>
    ["analytics", "executive", filters] as const,
  reports: ["analytics", "reports"] as const,
  report: (id: string, filters?: AnalyticsFilters) =>
    ["analytics", "report", id, filters] as const,
};

export function useSpendAnalytics(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: analyticsQueryKeys.spend(filters),
    queryFn: () => analyticsRepository.getSpend(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useVendorAnalytics(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: analyticsQueryKeys.vendors(filters),
    queryFn: () => analyticsRepository.getVendors(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useApprovalAnalytics(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: analyticsQueryKeys.approvals(filters),
    queryFn: () => analyticsRepository.getApprovals(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAnalyticsExecutive(filters?: DashboardFilters) {
  return useQuery({
    queryKey: analyticsQueryKeys.executive(filters),
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

export function useReportsList() {
  return useQuery({
    queryKey: analyticsQueryKeys.reports,
    queryFn: () => analyticsRepository.listReports(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useReport(id: string, filters?: AnalyticsFilters, enabled = true) {
  return useQuery({
    queryKey: analyticsQueryKeys.report(id, filters),
    queryFn: () => analyticsRepository.getReport(id, filters),
    enabled: Boolean(id) && enabled,
    staleTime: 2 * 60 * 1000,
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({
      reportId,
      format,
      filters,
    }: {
      reportId: string;
      format: ExportFormat;
      filters?: AnalyticsFilters;
    }) => downloadReport(reportId, format, filters),
    onSuccess: (_, variables) => {
      toast.success(
        `${variables.format.toUpperCase()} export started for ${variables.reportId} report`,
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
