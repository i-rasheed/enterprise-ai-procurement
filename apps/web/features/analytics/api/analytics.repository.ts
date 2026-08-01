import { apiGet } from "@/lib/api";

import type {
  AnalyticsFilters,
  AnalyticsReport,
  AnalyticsSummary,
  ReportListItem,
} from "../types";

function buildQuery(filters?: AnalyticsFilters): Record<string, string> {
  const params: Record<string, string> = {};

  if (!filters) {
    return params;
  }

  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.vendorId) params.vendorId = filters.vendorId;
  if (filters.department) params.department = filters.department;
  if (filters.category) params.category = filters.category;
  if (filters.currency) params.currency = filters.currency;
  if (filters.status) params.status = filters.status;
  if (filters.search) params.search = filters.search;
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);

  return params;
}

export const analyticsRepository = {
  getSpend(filters?: AnalyticsFilters) {
    return apiGet<AnalyticsSummary>("/analytics/spend", buildQuery(filters));
  },

  getVendors(filters?: AnalyticsFilters) {
    return apiGet<AnalyticsSummary>("/analytics/vendors", buildQuery(filters));
  },

  getApprovals(filters?: AnalyticsFilters) {
    return apiGet<AnalyticsSummary>(
      "/analytics/approvals",
      buildQuery(filters),
    );
  },

  listReports() {
    return apiGet<ReportListItem[]>("/reports");
  },

  getReport(id: string, filters?: AnalyticsFilters) {
    return apiGet<AnalyticsReport>(`/reports/${id}`, buildQuery(filters));
  },
};
