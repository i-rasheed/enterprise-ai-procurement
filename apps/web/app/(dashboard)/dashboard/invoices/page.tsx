"use client";

import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader, TableSkeleton } from "@/components/shared/page-header";
import { InvoiceFiltersPanel } from "@/features/invoices/components/invoice-filters";
import { InvoicesTable } from "@/features/invoices/components/invoices-table";
import { canViewInvoices } from "@/features/invoices/config/permissions";
import { useInvoices } from "@/features/invoices/hooks/use-invoices";
import type { InvoiceFilters } from "@/features/invoices/types";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const DEFAULT_FILTERS: InvoiceFilters = {
  page: 1,
  limit: 10,
};

export default function InvoicesPage() {
  const userRole = useAuthStore((state) => state.user?.role);
  const [filters, setFilters] = useState<InvoiceFilters>(DEFAULT_FILTERS);
  const invoicesQuery = useInvoices(filters);

  if (!canViewInvoices(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to view invoices."
        action={{ label: "Back to dashboard", href: "/dashboard" }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Review submitted invoices, run three-way matching, approve for payment, and track paid status."
      />

      <InvoiceFiltersPanel
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {invoicesQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : invoicesQuery.isError ? (
        <EmptyState
          title="Unable to load invoices"
          description={
            invoicesQuery.error instanceof ApiClientError
              ? invoicesQuery.error.message
              : "Something went wrong."
          }
          action={{ label: "Retry", onClick: () => invoicesQuery.refetch() }}
        />
      ) : invoicesQuery.data && invoicesQuery.data.invoices.length > 0 ? (
        <InvoicesTable
          data={invoicesQuery.data}
          onPageChange={(page) =>
            setFilters((current) => ({ ...current, page }))
          }
        />
      ) : (
        <EmptyState
          title="No invoices yet"
          description="Submitted vendor invoices appear here for matching and approval."
        />
      )}
    </div>
  );
}
