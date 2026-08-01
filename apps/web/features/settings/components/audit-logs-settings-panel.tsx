"use client";

import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { AuditTrailTable } from "@/features/approvals/components/audit-trail-table";
import type { AuditLogFilters } from "@/features/settings/types";
import { useSettingsAuditLogs } from "@/features/settings/hooks/use-settings";
import { canViewAuditLogs } from "@/features/settings/config/permissions";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const DEFAULT_FILTERS: AuditLogFilters = {
  page: 1,
  limit: 20,
};

export function AuditLogsSettingsPanel() {
  const userRole = useAuthStore((state) => state.user?.role);
  const [filters, setFilters] = useState<AuditLogFilters>(DEFAULT_FILTERS);
  const auditQuery = useSettingsAuditLogs(filters);

  if (!canViewAuditLogs(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="Audit logs are available to admin, finance, procurement manager, and department head roles."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Audit logs</h2>
        <p className="text-muted-foreground text-sm">
          Immutable record of authentication, approval, and platform activity.
        </p>
      </div>

      {auditQuery.isError ? (
        <EmptyState
          title="Unable to load audit logs"
          description={
            auditQuery.error instanceof ApiClientError
              ? auditQuery.error.message
              : "Something went wrong."
          }
          action={{ label: "Retry", onClick: () => auditQuery.refetch() }}
        />
      ) : auditQuery.data ? (
        <AuditTrailTable
          data={auditQuery.data}
          onPageChange={(page) =>
            setFilters((current) => ({ ...current, page }))
          }
        />
      ) : null}
    </div>
  );
}
