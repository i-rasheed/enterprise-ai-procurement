import type { Role } from "@/lib/api/types";

export type ContractStatus =
  | "DRAFT"
  | "UNDER_REVIEW"
  | "ACTIVE"
  | "EXPIRED"
  | "TERMINATED"
  | "RENEWED";

export type ContractType =
  | "GOODS"
  | "SERVICES"
  | "CONSULTING"
  | "SOFTWARE"
  | "FRAMEWORK";

export type ContractUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
};

export type ContractVendor = {
  id: string;
  name: string;
  email: string;
};

export type ContractDocument = {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  uploadedBy: ContractUser;
  uploadedAt: string;
};

export type ContractVersion = {
  id: string;
  version: number;
  changeSummary: string;
  createdBy: ContractUser;
  createdAt: string;
};

export type Contract = {
  id: string;
  contractNumber: string;
  organisationId: string;
  vendor: ContractVendor;
  procurementRequestId: string;
  purchaseOrderId?: string | null;
  awardId?: string | null;
  title: string;
  description: string;
  contractType: ContractType;
  startDate: string;
  endDate: string;
  value: number;
  currency: string;
  renewalType?: string | null;
  renewalDate?: string | null;
  autoRenew: boolean;
  status: ContractStatus;
  signedByOrganisation?: string | null;
  signedByVendor?: string | null;
  createdBy: ContractUser;
  documents: ContractDocument[];
  createdAt: string;
  updatedAt: string;
};

export type PaginatedContracts = {
  contracts: Contract[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ContractFilters = {
  search?: string;
  page?: number;
  limit?: number;
  status?: ContractStatus;
  contractType?: ContractType;
  vendorId?: string;
};

export type ContractHistory = {
  contractId: string;
  versions: ContractVersion[];
};

export const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: "GOODS", label: "Goods" },
  { value: "SERVICES", label: "Services" },
  { value: "CONSULTING", label: "Consulting" },
  { value: "SOFTWARE", label: "Software" },
  { value: "FRAMEWORK", label: "Framework" },
];
