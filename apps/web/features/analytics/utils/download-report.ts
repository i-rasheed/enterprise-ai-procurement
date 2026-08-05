import { apiClient } from "@/lib/api/client";

import type { AnalyticsFilters, ExportFormat } from "../types";

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

function parseFilename(
  contentDisposition: string | undefined,
  fallback: string,
): string {
  if (!contentDisposition) {
    return fallback;
  }

  const match = /filename="([^"]+)"/.exec(contentDisposition);
  return match?.[1] ?? fallback;
}

const MIME_TYPES: Record<ExportFormat, string> = {
  pdf: "application/pdf",
  excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
};

const EXTENSIONS: Record<ExportFormat, string> = {
  pdf: "pdf",
  excel: "xlsx",
  csv: "csv",
};

export async function downloadReport(
  reportId: string,
  format: ExportFormat,
  filters?: AnalyticsFilters,
): Promise<void> {
  const response = await apiClient.get<Blob>(`/reports/${reportId}/${format}`, {
    params: buildQuery(filters),
    responseType: "blob",
  });

  const fallback = `${reportId}-report.${EXTENSIONS[format]}`;
  const filename = parseFilename(
    response.headers["content-disposition"] as string | undefined,
    fallback,
  );

  const blob =
    response.data instanceof Blob
      ? response.data
      : new Blob([response.data], { type: MIME_TYPES[format] });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
