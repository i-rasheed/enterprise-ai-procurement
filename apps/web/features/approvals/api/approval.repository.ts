import { apiGet, apiPatch, apiPost } from "@/lib/api";

import type {
  ApproveStepFormValues,
  RejectStepFormValues,
} from "@/features/procurement/schemas/procurement.schema";
import type { ApprovalHistory, ApprovalWorkflow } from "@/features/procurement/types";

import type {
  AppNotification,
  AuditLogFilters,
  NotificationPreference,
  PaginatedAuditLogs,
  PendingApprovalsResponse,
} from "../types";

export const approvalRepository = {
  getPendingApprovals() {
    return apiGet<PendingApprovalsResponse>("/approval-workflows/pending");
  },

  getHistory(requestId: string) {
    return apiGet<ApprovalHistory>(`/approval-workflows/history/${requestId}`);
  },

  getWorkflow(workflowId: string) {
    return apiGet<ApprovalWorkflow>(`/approval-workflows/${workflowId}`);
  },

  approve(workflowId: string, values?: ApproveStepFormValues) {
    return apiPost<ApprovalWorkflow>(
      `/approval-workflows/${workflowId}/approve`,
      { comments: values?.comments || undefined },
    );
  },

  reject(workflowId: string, values: RejectStepFormValues) {
    return apiPost<ApprovalWorkflow>(
      `/approval-workflows/${workflowId}/reject`,
      values,
    );
  },

  getNotifications() {
    return apiGet<AppNotification[]>("/notifications");
  },

  getUnreadNotifications() {
    return apiGet<AppNotification[]>("/notifications/unread");
  },

  markNotificationRead(id: string) {
    return apiPatch<{ count: number }>(`/notifications/${id}/read`);
  },

  getNotificationPreferences() {
    return apiGet<NotificationPreference | null>("/notifications/preferences");
  },

  updateNotificationPreferences(input: {
    emailEnabled: boolean;
    inAppEnabled: boolean;
  }) {
    return apiPatch<NotificationPreference>(
      "/notifications/preferences",
      input,
    );
  },

  getAuditLogs(filters?: AuditLogFilters) {
    const params: Record<string, string> = {};
    if (filters?.page) params.page = String(filters.page);
    if (filters?.limit) params.limit = String(filters.limit);
    return apiGet<PaginatedAuditLogs>("/audit-logs", params);
  },
};
