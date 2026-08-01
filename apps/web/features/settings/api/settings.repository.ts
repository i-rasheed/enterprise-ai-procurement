import { approvalRepository } from "@/features/approvals/api/approval.repository";

import type { AuditLogFilters, NotificationPreferences } from "../types";

export const settingsRepository = {
  getNotificationPreferences() {
    return approvalRepository.getNotificationPreferences();
  },

  updateNotificationPreferences(input: {
    emailEnabled: boolean;
    inAppEnabled: boolean;
  }) {
    return approvalRepository.updateNotificationPreferences(input);
  },

  getAuditLogs(filters?: AuditLogFilters) {
    return approvalRepository.getAuditLogs(filters);
  },
};

export type { NotificationPreferences };
