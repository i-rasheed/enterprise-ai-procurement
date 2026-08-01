import type { ChartDataset } from "@/features/dashboard/types";

export type AnalyticsFilters = {
  startDate?: string;
  endDate?: string;
  vendorId?: string;
  department?: string;
  category?: string;
  currency?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type AnalyticsSummary = {
  summary: Record<string, unknown>;
  charts: ChartDataset[];
  kpis: Record<string, unknown>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ReportListItem = {
  id: string;
  title: string;
};

export type AnalyticsReport = {
  id: string;
  title: string;
  generatedAt: string;
  data: Record<string, unknown>;
  charts: ChartDataset[];
  kpis: Record<string, unknown>;
};

export type ExportFormat = "pdf" | "excel" | "csv";

export type AnalyticsTab =
  | "overview"
  | "spend"
  | "vendors"
  | "approvals"
  | "savings"
  | "reports";
