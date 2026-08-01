import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

import type {
  CreateGoodsReceiptFormValues,
  ReceiveGoodsFormValues,
  RejectGoodsFormValues,
  UpdateGoodsReceiptFormValues,
} from "../schemas/goods-receipt.schema";
import type {
  GoodsReceipt,
  GoodsReceiptFilters,
  PaginatedGoodsReceipts,
} from "../types";

function buildQuery(filters?: GoodsReceiptFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (!filters) return params;
  if (filters.search) params.search = filters.search;
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.status) params.status = filters.status;
  if (filters.purchaseOrderId) params.purchaseOrderId = filters.purchaseOrderId;
  return params;
}

function toIsoDate(date: string): string {
  if (date.includes("T")) return date;
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

export const goodsReceiptRepository = {
  list(filters?: GoodsReceiptFilters) {
    return apiGet<PaginatedGoodsReceipts>(
      "/goods-receipts",
      buildQuery(filters),
    );
  },

  getById(id: string) {
    return apiGet<GoodsReceipt>(`/goods-receipts/${id}`);
  },

  listByPurchaseOrder(purchaseOrderId: string) {
    return apiGet<{ goodsReceipts: GoodsReceipt[] }>(
      `/purchase-orders/${purchaseOrderId}/goods-receipts`,
    );
  },

  create(values: CreateGoodsReceiptFormValues) {
    return apiPost<GoodsReceipt>("/goods-receipts", {
      purchaseOrderId: values.purchaseOrderId,
      receiptDate: toIsoDate(values.receiptDate),
      warehouse: values.warehouse || undefined,
      notes: values.notes || undefined,
    });
  },

  update(id: string, values: UpdateGoodsReceiptFormValues) {
    return apiPatch<GoodsReceipt>(`/goods-receipts/${id}`, {
      receiptDate: toIsoDate(values.receiptDate),
      warehouse: values.warehouse || undefined,
      notes: values.notes || undefined,
    });
  },

  delete(id: string) {
    return apiDelete<{ message: string }>(`/goods-receipts/${id}`);
  },

  receive(id: string, values: ReceiveGoodsFormValues) {
    return apiPost<GoodsReceipt>(`/goods-receipts/${id}/receive`, values);
  },

  reject(id: string, values: RejectGoodsFormValues) {
    return apiPost<GoodsReceipt>(`/goods-receipts/${id}/reject`, {
      items: values.items
        .filter((item) => item.quantityRejected > 0)
        .map((item) => ({
          goodsReceiptItemId: item.goodsReceiptItemId,
          quantityRejected: item.quantityRejected,
          remarks: item.remarks ?? "",
        })),
    });
  },

  complete(id: string) {
    return apiPost<GoodsReceipt>(`/goods-receipts/${id}/complete`);
  },
};
