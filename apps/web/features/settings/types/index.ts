export type SettingsTab =
  | "profile"
  | "organization"
  | "branding"
  | "notifications"
  | "roles"
  | "permissions"
  | "api-keys"
  | "security"
  | "audit-logs";

export type StoredApiKey = {
  id: string;
  name: string;
  prefix: string;
  keyHash: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export type BrandingPreferences = {
  displayName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
};

export type NotificationPreferences = {
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

export type AuditLog = {
  id: string;
  organisationId: string | null;
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type PaginatedAuditLogs = {
  logs: AuditLog[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
