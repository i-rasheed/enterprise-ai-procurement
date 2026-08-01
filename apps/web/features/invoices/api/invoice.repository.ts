import { apiGet, apiPost } from "@/lib/api";

import type {
  ApproveInvoiceFormValues,
  MarkPaidFormValues,
  RejectInvoiceFormValues,
} from "../schemas/invoice.schema";
import type {
  Invoice,
  InvoiceFilters,
  MatchInvoiceResponse,
  MatchingResult,
  PaginatedInvoices,
} from "../types";

function buildQuery(filters?: InvoiceFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (!filters) return params;
  if (filters.search) params.search = filters.search;
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.status) params.status = filters.status;
  if (filters.vendorId) params.vendorId = filters.vendorId;
  return params;
}

function toIsoDate(date: string): string {
  if (date.includes("T")) return date;
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

export const invoiceRepository = {
  list(filters?: InvoiceFilters) {
    return apiGet<PaginatedInvoices>("/invoices", buildQuery(filters));
  },

  getById(id: string) {
    return apiGet<Invoice>(`/invoices/${id}`);
  },

  getMatchingResult(invoiceId: string) {
    return apiGet<MatchingResult>(`/matching-results/${invoiceId}`);
  },

  match(id: string) {
    return apiPost<MatchInvoiceResponse>(`/invoices/${id}/match`);
  },

  approve(id: string, values: ApproveInvoiceFormValues) {
    return apiPost<Invoice>(`/invoices/${id}/approve`, {
      notes: values.notes || undefined,
    });
  },

  reject(id: string, values: RejectInvoiceFormValues) {
    return apiPost<Invoice>(`/invoices/${id}/reject`, values);
  },

  markPaid(id: string, values: MarkPaidFormValues) {
    return apiPost<Invoice>(`/invoices/${id}/pay`, {
      paidDate: values.paidDate ? toIsoDate(values.paidDate) : undefined,
      paymentReference: values.paymentReference || undefined,
    });
  },
};
