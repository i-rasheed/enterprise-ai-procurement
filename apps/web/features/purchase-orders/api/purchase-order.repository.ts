import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

import type {
  AcknowledgePurchaseOrderFormValues,
  CreatePurchaseOrderFormValues,
  IssuePurchaseOrderFormValues,
  UpdatePurchaseOrderFormValues,
} from "../schemas/purchase-order.schema";
import type {
  PaginatedPurchaseOrders,
  PurchaseOrder,
  PurchaseOrderFilters,
} from "../types";

function buildQuery(filters?: PurchaseOrderFilters): Record<string, string> {
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

export const purchaseOrderRepository = {
  list(filters?: PurchaseOrderFilters) {
    return apiGet<PaginatedPurchaseOrders>(
      "/purchase-orders",
      buildQuery(filters),
    );
  },

  getById(id: string) {
    return apiGet<PurchaseOrder>(`/purchase-orders/${id}`);
  },

  create(values: CreatePurchaseOrderFormValues) {
    return apiPost<PurchaseOrder>("/purchase-orders", {
      awardId: values.awardId,
      expectedDeliveryDate: toIsoDate(values.expectedDeliveryDate),
      deliveryAddress: values.deliveryAddress || undefined,
      notes: values.notes || undefined,
    });
  },

  update(id: string, values: UpdatePurchaseOrderFormValues) {
    return apiPatch<PurchaseOrder>(`/purchase-orders/${id}`, {
      expectedDeliveryDate: toIsoDate(values.expectedDeliveryDate),
      paymentTerms: values.paymentTerms || undefined,
      deliveryAddress: values.deliveryAddress || undefined,
      notes: values.notes || undefined,
    });
  },

  delete(id: string) {
    return apiDelete<{ message: string }>(`/purchase-orders/${id}`);
  },

  issue(id: string, values: IssuePurchaseOrderFormValues) {
    return apiPost<PurchaseOrder>(`/purchase-orders/${id}/issue`, {
      issueDate: values.issueDate ? toIsoDate(values.issueDate) : undefined,
      notes: values.notes || undefined,
    });
  },

  acknowledge(id: string, values: AcknowledgePurchaseOrderFormValues) {
    return apiPost<PurchaseOrder>(`/purchase-orders/${id}/acknowledge`, {
      notes: values.notes || undefined,
    });
  },

  cancel(id: string) {
    return apiPost<{ purchaseOrder: PurchaseOrder }>(
      `/purchase-orders/${id}/cancel`,
    );
  },
};
