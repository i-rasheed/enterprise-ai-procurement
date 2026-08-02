import { apiGet, apiPost } from "@/lib/api";
import type {
  Contract,
  Invoice,
  PaginatedContracts,
  PaginatedInvoices,
  PaginatedRfqs,
  PaginatedVendors,
  PurchaseOrder,
  RFQ,
  Vendor,
} from "@/lib/api/types";

type VendorBidsResponse = {
  bids: {
    id: string;
    bidNumber: string;
    status: string;
    totalAmount: number;
    rfq: { id: string; title: string; rfqNumber: string };
  }[];
};

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

  listRfqs() {
    return apiGet<PaginatedRfqs>("/rfqs", { page: 1, limit: 100 });
  },

  getRfq(id: string) {
    return apiGet<RFQ>(`/rfqs/${id}`);
  },

  listBids(vendorId: string) {
    return apiGet<VendorBidsResponse>(`/vendors/${vendorId}/bids`);
  },

  listPurchaseOrders(vendorId: string) {
    return apiGet<{ purchaseOrders: PurchaseOrder[] }>(
      `/vendors/${vendorId}/purchase-orders`,
    );
  },

  listInvoices(vendorId: string) {
    return apiGet<PaginatedInvoices>("/invoices", {
      vendorId,
      page: 1,
      limit: 100,
    });
  },

  listContracts(vendorId: string) {
    return apiGet<PaginatedContracts>("/contracts", {
      vendorId,
      page: 1,
      limit: 100,
    });
  },

  acknowledgePurchaseOrder(id: string, notes?: string) {
    return apiPost<PurchaseOrder>(`/purchase-orders/${id}/acknowledge`, {
      notes,
    });
  },

  getVendor(vendorId: string) {
    return apiGet<Vendor>(`/vendors/${vendorId}`);
  },

  getInvoice(id: string) {
    return apiGet<Invoice>(`/invoices/${id}`);
  },

  getContract(id: string) {
    return apiGet<Contract>(`/contracts/${id}`);
  },
};
