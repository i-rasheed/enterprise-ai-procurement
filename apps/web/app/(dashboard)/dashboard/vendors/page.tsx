"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader, TableSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  canManageVendors,
} from "@/features/vendors/config/permissions";
import { VendorFiltersPanel } from "@/features/vendors/components/vendor-filters";
import { VendorsTable } from "@/features/vendors/components/vendors-table";
import {
  useDeleteVendor,
  useVendors,
} from "@/features/vendors/hooks/use-vendors";
import type { VendorFilters } from "@/features/vendors/types";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const DEFAULT_FILTERS: VendorFilters = {
  page: 1,
  limit: 10,
};

export default function VendorsPage() {
  const userRole = useAuthStore((state) => state.user?.role);
  const canManage = canManageVendors(userRole);
  const [filters, setFilters] = useState<VendorFilters>(DEFAULT_FILTERS);
  const vendorsQuery = useVendors(filters);
  const deleteVendor = useDeleteVendor();

  const handleDelete = (id: string, name: string) => {
    if (
      window.confirm(
        `Delete vendor "${name}"? This action cannot be undone.`,
      )
    ) {
      deleteVendor.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        description="Search, filter, and manage your vendor directory."
        actions={
          canManage ? (
            <Button asChild>
              <Link href="/dashboard/vendors/new">
                <Plus className="size-4" />
                Register vendor
              </Link>
            </Button>
          ) : null
        }
      />

      <VendorFiltersPanel
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {vendorsQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : vendorsQuery.isError ? (
        <EmptyState
          title="Unable to load vendors"
          description={
            vendorsQuery.error instanceof ApiClientError
              ? vendorsQuery.error.message
              : "Something went wrong."
          }
          action={{ label: "Retry", onClick: () => vendorsQuery.refetch() }}
        />
      ) : vendorsQuery.data && vendorsQuery.data.vendors.length > 0 ? (
        <VendorsTable
          data={vendorsQuery.data}
          canManage={canManage}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          onDelete={canManage ? handleDelete : undefined}
        />
      ) : (
        <EmptyState
          title="No vendors found"
          description="Adjust your filters or register a new vendor to get started."
          action={
            canManage
              ? { label: "Register vendor", href: "/dashboard/vendors/new" }
              : undefined
          }
        />
      )}
    </div>
  );
}
