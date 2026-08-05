import type { Role } from "@/lib/api/types";

export type RFQStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "CANCELLED";

export type VendorInvitationStatus =
  | "INVITED"
  | "VIEWED"
  | "RESPONDED"
  | "DECLINED";

export type RFQCreator = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
};

export type RFQVendorSummary = {
  id: string;
  name: string;
  email: string;
};

export type RFQVendorInvitation = {
  id: string;
  rfqId: string;
  vendor: RFQVendorSummary;
  invitedAt: string;
  respondedAt?: string | null;
  status: VendorInvitationStatus;
};

export type RFQ = {
  id: string;
  procurementRequestId: string;
  rfqNumber: string;
  title: string;
  description: string;
  closingDate: string;
  status: RFQStatus;
  createdBy: RFQCreator;
  vendors?: RFQVendorInvitation[];
  createdAt: string;
  updatedAt: string;
};

export type PaginatedRfqs = {
  rfqs: RFQ[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type RFQFilters = {
  search?: string;
  page?: number;
  limit?: number;
  status?: RFQStatus;
};

export type RFQQuestion = {
  id: string;
  question: string;
  answer?: string | null;
  askedAt: string;
  status: "OPEN" | "ANSWERED";
};

export type RFQAttachment = {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  status: "PENDING" | "UPLOADED";
};
