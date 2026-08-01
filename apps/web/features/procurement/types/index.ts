import type { Role } from "@/lib/api/types";

export type ProcurementPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ProcurementStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "CANCELLED"
  | "REJECTED"
  | "APPROVED";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "SKIPPED";

export type WorkflowStatus = "IN_PROGRESS" | "APPROVED" | "REJECTED";

export type ApprovalLevelRole =
  | "DEPARTMENT_HEAD"
  | "PROCUREMENT_MANAGER"
  | "FINANCE"
  | "ADMIN";

export type ProcurementRequester = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type ProcurementItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
};

export type ProcurementRequest = {
  id: string;
  organisationId: string;
  requester: ProcurementRequester;
  title: string;
  description: string;
  justification: string;
  department: string;
  estimatedBudget: number;
  currency: string;
  priority: ProcurementPriority;
  status: ProcurementStatus;
  requiredDeliveryDate: string;
  items: ProcurementItem[];
  totalCost?: number;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedProcurementRequests = {
  requests: ProcurementRequest[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ProcurementFilters = {
  search?: string;
  page?: number;
  limit?: number;
  status?: ProcurementStatus;
  priority?: ProcurementPriority;
  department?: string;
};

export type ApprovalStepApprover = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
};

export type ApprovalStep = {
  id: string;
  workflowId: string;
  approver: ApprovalStepApprover;
  role: ApprovalLevelRole;
  level: number;
  status: ApprovalStatus;
  comments?: string | null;
  actedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApprovalWorkflow = {
  id: string;
  procurementRequestId: string;
  currentLevel: number;
  status: WorkflowStatus;
  steps: ApprovalStep[];
  createdAt: string;
  updatedAt: string;
};

export type ApprovalHistory = {
  procurementRequestId: string;
  workflow: ApprovalWorkflow | null;
};

export type TimelineEvent = {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status?: "completed" | "current" | "pending" | "rejected" | "skipped";
};

export type ProcurementAttachment = {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  status: "PENDING" | "UPLOADED";
};
