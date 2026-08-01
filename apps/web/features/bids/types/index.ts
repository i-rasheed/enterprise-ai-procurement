import type { Role } from "@/lib/api/types";

export type BidStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "WITHDRAWN"
  | "DISQUALIFIED"
  | "AWARDED";

export type BidSubmitter = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
};

export type BidVendor = {
  id: string;
  name: string;
  email: string;
};

export type BidRfqSummary = {
  id: string;
  rfqNumber: string;
  title: string;
};

export type BidItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
};

export type BidAttachment = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
};

export type Bid = {
  id: string;
  rfqId: string;
  rfq: BidRfqSummary;
  vendor: BidVendor;
  submittedBy: BidSubmitter;
  bidNumber: string;
  totalAmount: number;
  currency: string;
  deliveryPeriod?: string | null;
  paymentTerms?: string | null;
  warrantyPeriod?: string | null;
  notes?: string | null;
  status: BidStatus;
  submittedAt?: string | null;
  items: BidItem[];
  attachments: BidAttachment[];
  createdAt: string;
  updatedAt: string;
};

export type PaginatedBids = {
  bids: Bid[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type BidFilters = {
  search?: string;
  page?: number;
  limit?: number;
  status?: BidStatus;
};

export type BidEvaluator = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
};

export type BidEvaluation = {
  id: string;
  bidId: string;
  evaluator: BidEvaluator;
  technicalScore: number;
  commercialScore: number;
  complianceScore: number;
  deliveryScore: number;
  totalScore: number;
  comments?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BidEvaluationList = {
  bidId: string;
  evaluations: BidEvaluation[];
  averageTotalScore: number;
};

export type BidRankingEntry = {
  rank: number;
  bidId: string;
  bidNumber: string;
  vendorName: string;
  totalScore: number;
  totalAmount: number;
  evaluationCount: number;
};

export type ProcurementRankings = {
  procurementRequestId: string;
  rankings: BidRankingEntry[];
};

export type Award = {
  id: string;
  bidId: string;
  procurementRequestId: string;
  awardedBy: BidEvaluator;
  awardReason: string;
  awardedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type PreferredVendorRecommendation = {
  vendorName: string;
  reason: string;
  estimatedSavings?: number;
};

export type AlternativeSupplier = {
  name: string;
  category: string;
  rationale: string;
};

export type ProcurementRecommendations = {
  procurementRequestId: string;
  preferredVendors: PreferredVendorRecommendation[];
  savingsOpportunities: string[];
  alternativeSuppliers: AlternativeSupplier[];
  procurementStrategy: string;
};

export const EVALUATION_CRITERIA = [
  { key: "technicalScore", label: "Technical" },
  { key: "commercialScore", label: "Commercial" },
  { key: "complianceScore", label: "Compliance" },
  { key: "deliveryScore", label: "Delivery" },
] as const;
