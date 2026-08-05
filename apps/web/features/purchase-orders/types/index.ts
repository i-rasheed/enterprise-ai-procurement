import type { Role } from "@/lib/api/types";

export type PurchaseOrderStatus =
  | "DRAFT"
  | "ISSUED"
  | "ACKNOWLEDGED"
  | "PARTIALLY_DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export type PurchaseOrderUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
};

export type PurchaseOrderVendor = {
  id: string;
  name: string;
  email: string;
};

export type PurchaseOrderItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseOrder = {
  id: string;
  poNumber: string;
  organisationId: string;
  vendor: PurchaseOrderVendor;
  awardId: string;
  procurementRequestId: string;
  issuedBy: PurchaseOrderUser;
  issueDate?: string | null;
  expectedDeliveryDate: string;
  totalAmount: number;
  currency: string;
  paymentTerms?: string | null;
  deliveryAddress?: string | null;
  notes?: string | null;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type PaginatedPurchaseOrders = {
  purchaseOrders: PurchaseOrder[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PurchaseOrderFilters = {
  search?: string;
  page?: number;
  limit?: number;
  status?: PurchaseOrderStatus;
  vendorId?: string;
};
