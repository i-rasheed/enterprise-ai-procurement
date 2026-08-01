"use client";

import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/page-header";
import { ApprovalHistoryList } from "@/features/approvals/components/approval-history-list";
import { ApprovalsShell } from "@/features/approvals/components/approvals-shell";
import { ProcurementFiltersPanel } from "@/features/procurement/components/procurement-filters";
import { useProcurementRequests } from "@/features/procurement/hooks/use-procurement";
import type { ProcurementFilters } from "@/features/procurement/types";
import { ApiClientError } from "@/lib/api";

const DEFAULT_FILTERS: ProcurementFilters = {
  page: 1,
  limit: 20,
};

export default function ApprovalsHistoryPage() {
  const [filters, setFilters] = useState<ProcurementFilters>(DEFAULT_FILTERS);
  const requestsQuery = useProcurementRequests(filters);

  return (
    <ApprovalsShell
      title="Approval history"
      description="Review workflow progress and comments for submitted procurement requests."
    >
      <ProcurementFiltersPanel
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {requestsQuery.isLoading ? (
        <TableSkeleton rows={5} />
      ) : requestsQuery.isError ? (
        <EmptyState
          title="Unable to load history"
          description={
            requestsQuery.error instanceof ApiClientError
              ? requestsQuery.error.message
              : "Something went wrong."
          }
          action={{ label: "Retry", onClick: () => requestsQuery.refetch() }}
        />
      ) : requestsQuery.data ? (
        <ApprovalHistoryList requests={requestsQuery.data.requests} />
      ) : null}
    </ApprovalsShell>
  );
}
