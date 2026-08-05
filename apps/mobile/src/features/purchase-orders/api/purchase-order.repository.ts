import { apiGet, apiPost } from "@/lib/api";
import type {
  PaginatedPurchaseOrders,
  PurchaseOrder,
} from "@/lib/api/types";

export const purchaseOrderRepository = {
  list(params?: { page?: number; limit?: number; status?: string }) {
    return apiGet<PaginatedPurchaseOrders>("/purchase-orders", {
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
      status: params?.status,
    });
  },

  getById(id: string) {
    return apiGet<PurchaseOrder>(`/purchase-orders/${id}`);
  },

  acknowledge(id: string, input?: { notes?: string }) {
    return apiPost<PurchaseOrder>(`/purchase-orders/${id}/acknowledge`, {
      notes: input?.notes || undefined,
    });
  },
};
