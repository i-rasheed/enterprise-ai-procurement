import type {
  ApprovalLevelRole,
  ApprovalStatus,
  ProcurementPriority,
  ProcurementStatus,
} from "@/features/procurement/types";

export type PendingApprovalRequest = {
  id: string;
  title: string;
  department: string;
  estimatedBudget: number;
  currency: string;
  priority: ProcurementPriority;
  status: ProcurementStatus;
  requester: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export type PendingApproval = {
  id: string;
  workflowId: string;
  approver: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  role: ApprovalLevelRole;
  level: number;
  status: ApprovalStatus;
  comments?: string | null;
  actedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  procurementRequest: PendingApprovalRequest | null;
};

export type PendingApprovalsResponse = {
  pendingApprovals: PendingApproval[];
};

export type AuditLog = {
  id: string;
  organisationId?: string | null;
  userId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export type PaginatedAuditLogs = {
  logs: AuditLog[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AppNotification = {
  id: string;
  userId: string;
  organisationId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export type NotificationPreference = {
  id: string;
  userId: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuditLogFilters = {
  page?: number;
  limit?: number;
};
