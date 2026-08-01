"use client";

import { useState } from "react";

import { AuditTrailTable } from "@/features/approvals/components/audit-trail-table";
import { ApprovalsShell } from "@/features/approvals/components/approvals-shell";
import { useAuditLogs } from "@/features/approvals/hooks/use-approvals";
import type { AuditLogFilters } from "@/features/approvals/types";

const DEFAULT_FILTERS: AuditLogFilters = {
  page: 1,
  limit: 20,
};

export default function ApprovalsAuditPage() {
  const [filters, setFilters] = useState<AuditLogFilters>(DEFAULT_FILTERS);
  const auditQuery = useAuditLogs(filters);

  return (
    <ApprovalsShell
      title="Audit trail"
      description="Immutable log of approval actions and platform activity."
      isLoading={auditQuery.isLoading}
      isError={auditQuery.isError}
      error={auditQuery.error}
      onRetry={() => auditQuery.refetch()}
    >
      {auditQuery.data ? (
        <AuditTrailTable
          data={auditQuery.data}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      ) : null}
    </ApprovalsShell>
  );
}
