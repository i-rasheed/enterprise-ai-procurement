"use client";

import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader, TableSkeleton } from "@/components/shared/page-header";
import { BidFiltersPanel } from "@/features/bids/components/bid-filters";
import { BidsTable } from "@/features/bids/components/bids-table";
import { canViewBids } from "@/features/bids/config/permissions";
import { useBids } from "@/features/bids/hooks/use-bids";
import type { BidFilters } from "@/features/bids/types";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const DEFAULT_FILTERS: BidFilters = {
  page: 1,
  limit: 10,
};

export default function BidsPage() {
  const userRole = useAuthStore((state) => state.user?.role);
  const [filters, setFilters] = useState<BidFilters>(DEFAULT_FILTERS);
  const bidsQuery = useBids(filters);

  if (!canViewBids(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to view vendor bids."
        action={{ label: "Back to dashboard", href: "/dashboard" }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor bids"
        description="Review submitted bids, score evaluations, compare rankings, and award winners."
      />

      <BidFiltersPanel
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {bidsQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : bidsQuery.isError ? (
        <EmptyState
          title="Unable to load bids"
          description={
            bidsQuery.error instanceof ApiClientError
              ? bidsQuery.error.message
              : "Something went wrong."
          }
          action={{ label: "Retry", onClick: () => bidsQuery.refetch() }}
        />
      ) : bidsQuery.data && bidsQuery.data.bids.length > 0 ? (
        <BidsTable
          data={bidsQuery.data}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      ) : (
        <EmptyState
          title="No bids yet"
          description="Bids appear here once vendors submit responses to published RFQs."
        />
      )}
    </div>
  );
}
