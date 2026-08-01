"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader, TableSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ProcurementFiltersPanel } from "@/features/procurement/components/procurement-filters";
import { ProcurementRequestsTable } from "@/features/procurement/components/procurement-requests-table";
import {
  useDeleteProcurementRequest,
  useProcurementRequests,
} from "@/features/procurement/hooks/use-procurement";
import type { ProcurementFilters } from "@/features/procurement/types";
import { ApiClientError } from "@/lib/api";

const DEFAULT_FILTERS: ProcurementFilters = {
  page: 1,
  limit: 10,
};

export default function ProcurementPage() {
  const [filters, setFilters] = useState<ProcurementFilters>(DEFAULT_FILTERS);
  const requestsQuery = useProcurementRequests(filters);
  const deleteRequest = useDeleteProcurementRequest();

  const handleDelete = (id: string, title: string) => {
    if (
      window.confirm(
        `Delete procurement request "${title}"? This action cannot be undone.`,
      )
    ) {
      deleteRequest.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Procurement"
        description="Create and track purchase requests through approval workflows."
        actions={
          <Button asChild>
            <Link href="/dashboard/procurement/new">
              <Plus className="size-4" />
              New request
            </Link>
          </Button>
        }
      />

      <ProcurementFiltersPanel
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {requestsQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : requestsQuery.isError ? (
        <EmptyState
          title="Unable to load procurement requests"
          description={
            requestsQuery.error instanceof ApiClientError
              ? requestsQuery.error.message
              : "Something went wrong."
          }
          action={{ label: "Retry", onClick: () => requestsQuery.refetch() }}
        />
      ) : requestsQuery.data && requestsQuery.data.requests.length > 0 ? (
        <ProcurementRequestsTable
          data={requestsQuery.data}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          onDelete={handleDelete}
        />
      ) : (
        <EmptyState
          title="No procurement requests yet"
          description="Create your first purchase request to start the approval workflow."
          action={{
            label: "Create request",
            href: "/dashboard/procurement/new",
          }}
        />
      )}
    </div>
  );
}
