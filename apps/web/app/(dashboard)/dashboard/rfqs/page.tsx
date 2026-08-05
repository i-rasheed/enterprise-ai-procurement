"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader, TableSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { canManageRfqs } from "@/features/rfqs/config/permissions";
import { RfqFiltersPanel } from "@/features/rfqs/components/rfq-filters";
import { RfqsTable } from "@/features/rfqs/components/rfqs-table";
import { useDeleteRfq, useRfqs } from "@/features/rfqs/hooks/use-rfqs";
import type { RFQFilters } from "@/features/rfqs/types";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const DEFAULT_FILTERS: RFQFilters = {
  page: 1,
  limit: 10,
};

export default function RfqsPage() {
  const userRole = useAuthStore((state) => state.user?.role);
  const canManage = canManageRfqs(userRole);
  const [filters, setFilters] = useState<RFQFilters>(DEFAULT_FILTERS);
  const rfqsQuery = useRfqs(filters);
  const deleteRfq = useDeleteRfq();

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete RFQ "${title}"? This action cannot be undone.`)) {
      deleteRfq.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="RFQs"
        description="Create, publish, and manage requests for quotation."
        actions={
          canManage ? (
            <Button asChild>
              <Link href="/dashboard/rfqs/new">
                <Plus className="size-4" />
                Create RFQ
              </Link>
            </Button>
          ) : null
        }
      />

      <RfqFiltersPanel
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {rfqsQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : rfqsQuery.isError ? (
        <EmptyState
          title="Unable to load RFQs"
          description={
            rfqsQuery.error instanceof ApiClientError
              ? rfqsQuery.error.message
              : "Something went wrong."
          }
          action={{ label: "Retry", onClick: () => rfqsQuery.refetch() }}
        />
      ) : rfqsQuery.data && rfqsQuery.data.rfqs.length > 0 ? (
        <RfqsTable
          data={rfqsQuery.data}
          canManage={canManage}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          onDelete={canManage ? handleDelete : undefined}
        />
      ) : (
        <EmptyState
          title="No RFQs yet"
          description="Create an RFQ from an approved procurement request to invite vendors."
          action={
            canManage
              ? { label: "Create RFQ", href: "/dashboard/rfqs/new" }
              : undefined
          }
        />
      )}
    </div>
  );
}
