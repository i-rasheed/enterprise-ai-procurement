import { apiGet } from "@/lib/api";
import type { Invoice, PaginatedInvoices } from "@/lib/api/types";

export const invoiceRepository = {
  list(params?: { page?: number; limit?: number; status?: string; vendorId?: string }) {
    return apiGet<PaginatedInvoices>("/invoices", {
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
      status: params?.status,
      vendorId: params?.vendorId,
    });
  },

  getById(id: string) {
    return apiGet<Invoice>(`/invoices/${id}`);
  },
};
