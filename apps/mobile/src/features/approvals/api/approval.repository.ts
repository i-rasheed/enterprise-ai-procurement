import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type {
  AppNotification,
  NotificationPreference,
  PendingApprovalsResponse,
} from "@/lib/api/types";

export const approvalRepository = {
  getPendingApprovals() {
    return apiGet<PendingApprovalsResponse>("/approval-workflows/pending");
  },

  approve(workflowId: string, input?: { comments?: string }) {
    return apiPost(`/approval-workflows/${workflowId}/approve`, {
      comments: input?.comments || undefined,
    });
  },

  reject(
    workflowId: string,
    input: { comments: string; reason: string },
  ) {
    return apiPost(`/approval-workflows/${workflowId}/reject`, input);
  },

  getNotificationPreferences() {
    return apiGet<NotificationPreference | null>("/notifications/preferences");
  },

  updateNotificationPreferences(input: {
    emailEnabled: boolean;
    inAppEnabled: boolean;
  }) {
    return apiPatch<NotificationPreference>("/notifications/preferences", input);
  },
};

export const notificationsRepository = {
  list() {
    return apiGet<AppNotification[]>("/notifications");
  },

  listUnread() {
    return apiGet<AppNotification[]>("/notifications/unread");
  },

  markRead(id: string) {
    return apiPatch<{ count: number }>(`/notifications/${id}/read`);
  },
};
