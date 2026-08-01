export const QUEUE_NAMES = {
  EMAIL: 'email',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  AI: 'ai-processing',
  SCHEDULED: 'scheduled-tasks',
} as const;

export type EmailJobData = {
  to: string;
  subject: string;
  html: string;
};

export type NotificationJobData = {
  userId: string;
  organisationId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export type ReportJobData = {
  reportId: string;
  organisationId: string;
  userId: string;
  format: 'pdf' | 'excel' | 'csv';
};

export type ScheduledJobData = {
  task:
    | 'contract-reminders'
    | 'invoice-reminders'
    | 'cleanup-expired-tokens'
    | 'cleanup-old-audit-logs';
};

export type AiJobData = {
  feature: string;
  organisationId: string;
  userId: string;
  payload: Record<string, unknown>;
};
