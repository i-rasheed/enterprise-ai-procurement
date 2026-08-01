import type { Role } from "@/lib/api/types";

export type GoodsReceiptStatus =
  | "DRAFT"
  | "RECEIVED"
  | "PARTIALLY_RECEIVED"
  | "REJECTED"
  | "COMPLETED";

export type GoodsReceiptUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
};

export type GoodsReceiptItem = {
  id: string;
  purchaseOrderItemId: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityRejected: number;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GoodsReceipt = {
  id: string;
  receiptNumber: string;
  purchaseOrderId: string;
  organisationId: string;
  receivedBy: GoodsReceiptUser;
  receiptDate: string;
  warehouse?: string | null;
  notes?: string | null;
  status: GoodsReceiptStatus;
  items: GoodsReceiptItem[];
  createdAt: string;
  updatedAt: string;
};

export type PaginatedGoodsReceipts = {
  goodsReceipts: GoodsReceipt[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GoodsReceiptFilters = {
  search?: string;
  page?: number;
  limit?: number;
  status?: GoodsReceiptStatus;
  purchaseOrderId?: string;
};

export type GrnTimelineEvent = {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status?: "completed" | "current" | "rejected" | "pending";
};
