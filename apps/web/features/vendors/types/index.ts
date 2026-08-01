export type VendorStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BLACKLISTED";

export type ComplianceStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type Vendor = {
  id: string;
  organisationId: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  registrationNumber: string | null;
  taxIdentificationNumber: string | null;
  category: string | null;
  status: VendorStatus;
  rating: number | null;
  complianceStatus: ComplianceStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedVendors = {
  vendors: Vendor[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type VendorFilters = {
  q?: string;
  page?: number;
  limit?: number;
  name?: string;
  category?: string;
  status?: VendorStatus;
  complianceStatus?: ComplianceStatus;
};

export type VendorRiskAnalysis = {
  vendorId: string;
  riskScore: number;
  financialRisk: Record<string, unknown>;
  deliveryRisk: Record<string, unknown>;
  complianceRisk: Record<string, unknown>;
  operationalRisk: Record<string, unknown>;
  overallRecommendation: string;
};

export type VendorDocumentType =
  | "REGISTRATION_CERTIFICATE"
  | "TAX_CERTIFICATE"
  | "INSURANCE"
  | "BANK_REFERENCE"
  | "COMPLIANCE_AUDIT";

export type VendorDocumentStatus = "MISSING" | "SUBMITTED" | "VERIFIED";

export type VendorDocumentItem = {
  type: VendorDocumentType;
  label: string;
  status: VendorDocumentStatus;
  reference?: string;
};
