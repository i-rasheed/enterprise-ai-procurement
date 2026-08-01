import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { assistantRepository } from "@/features/assistant/api/assistant.repository";
import type { ChatRequest } from "@/features/assistant/types";
import type { Bid } from "@/features/bids/types";
import type { Contract, PaginatedContracts } from "@/features/contracts/types";
import type {
  Invoice,
  PaginatedInvoices,
} from "@/features/invoices/types";
import type {
  PaginatedPurchaseOrders,
  PurchaseOrder,
} from "@/features/purchase-orders/types";
import type { PaginatedRfqs, RFQ } from "@/features/rfqs/types";
import type { PaginatedVendors, Vendor } from "@/features/vendors/types";

import type { VendorBidDraft } from "../types";

export const vendorPortalRepository = {
  resolveVendorByEmail(email: string) {
    return apiGet<PaginatedVendors>("/vendors/search", {
      q: email,
      limit: 100,
    }).then(
      (response) =>
        response.vendors.find(
          (vendor) => vendor.email.toLowerCase() === email.toLowerCase(),
        ) ?? null,
    );
  },

  getVendor(vendorId: string) {
    return apiGet<Vendor>(`/vendors/${vendorId}`);
  },

  listRfqs() {
    return apiGet<PaginatedRfqs>("/rfqs", { page: 1, limit: 100 });
  },

  getRfq(id: string) {
    return apiGet<RFQ>(`/rfqs/${id}`);
  },

  listBids(vendorId: string) {
    return apiGet<{ bids: Bid[] }>(`/vendors/${vendorId}/bids`);
  },

  getBid(id: string) {
    return apiGet<Bid>(`/bids/${id}`);
  },

  createBid(vendorId: string, draft: VendorBidDraft) {
    return apiPost<Bid>("/bids", {
      rfqId: draft.rfqId,
      vendorId,
      currency: draft.currency || "USD",
      deliveryPeriod: draft.deliveryPeriod || undefined,
      paymentTerms: draft.paymentTerms || undefined,
      warrantyPeriod: draft.warrantyPeriod || undefined,
      notes: draft.notes || undefined,
    });
  },

  async createBidWithItems(vendorId: string, draft: VendorBidDraft) {
    const bid = await this.createBid(vendorId, draft);

    for (const item of draft.items) {
      await apiPost(`/bids/${bid.id}/items`, item);
    }

    return this.getBid(bid.id);
  },

  submitBid(id: string) {
    return apiPost<Bid>(`/bids/${id}/submit`, {});
  },

  listPurchaseOrders(vendorId: string) {
    return apiGet<{ purchaseOrders: PurchaseOrder[] }>(
      `/vendors/${vendorId}/purchase-orders`,
    );
  },

  getPurchaseOrder(id: string) {
    return apiGet<PurchaseOrder>(`/purchase-orders/${id}`);
  },

  acknowledgePurchaseOrder(id: string, notes?: string) {
    return apiPost<PurchaseOrder>(`/purchase-orders/${id}/acknowledge`, {
      notes,
    });
  },

  listInvoices(vendorId: string) {
    return apiGet<PaginatedInvoices>("/invoices", {
      vendorId,
      page: 1,
      limit: 100,
    });
  },

  getInvoice(id: string) {
    return apiGet<Invoice>(`/invoices/${id}`);
  },

  listContracts(vendorId: string) {
    return apiGet<PaginatedContracts>("/contracts", {
      vendorId,
      page: 1,
      limit: 100,
    });
  },

  getContract(id: string) {
    return apiGet<Contract>(`/contracts/${id}`);
  },

  chat(payload: ChatRequest) {
    return assistantRepository.chat(payload);
  },
};
