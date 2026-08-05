import type { Role } from "@/lib/api/types";

export type InvoiceStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "MATCHED"
  | "APPROVED"
  | "REJECTED"
  | "PAID";

export type MatchStatus =
  | "MATCHED"
  | "PRICE_MISMATCH"
  | "QUANTITY_MISMATCH"
  | "MISSING_GRN"
  | "MISSING_PO"
  | "FAILED";

export type InvoiceVendor = {
  id: string;
  name: string;
  email: string;
};

export type InvoiceItem = {
  id: string;
  purchaseOrderItemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
};

export type MatchingResultUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
};

export type MatchingDiscrepancy = {
  field: string;
  message?: string;
  expected?: number | string;
  actual?: number | string;
  purchaseOrderItemId?: string;
};

export type MatchingResult = {
  id: string;
  invoiceId: string;
  purchaseOrderId: string;
  goodsReceiptId: string;
  matchStatus: MatchStatus;
  matchedBy: MatchingResultUser;
  matchedAt: string;
  discrepancies: MatchingDiscrepancy[] | null;
  createdAt: string;
  updatedAt: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  vendor: InvoiceVendor;
  purchaseOrderId: string;
  goodsReceiptId: string;
  organisationId: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  paymentTerms?: string | null;
  status: InvoiceStatus;
  notes?: string | null;
  items: InvoiceItem[];
  matchingResult?: MatchingResult | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedInvoices = {
  invoices: Invoice[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type InvoiceFilters = {
  search?: string;
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
  vendorId?: string;
};

export type MatchInvoiceResponse = {
  invoice: Invoice;
  matchingResult: MatchingResult;
};

export type InvoiceTimelineEvent = {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status?: "completed" | "current" | "rejected" | "pending";
};
