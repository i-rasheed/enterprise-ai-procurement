export type VendorPortalStats = {
  openRfqs: number;
  activeBids: number;
  issuedPurchaseOrders: number;
  pendingInvoices: number;
  activeContracts: number;
};

export type VendorBidDraft = {
  rfqId: string;
  currency?: string;
  deliveryPeriod?: string;
  paymentTerms?: string;
  warrantyPeriod?: string;
  notes?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
};

export type VendorAssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};
