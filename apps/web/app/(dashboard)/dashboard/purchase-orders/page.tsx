"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader, TableSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PoFiltersPanel } from "@/features/purchase-orders/components/po-filters";
import { PurchaseOrdersTable } from "@/features/purchase-orders/components/purchase-orders-table";
import {
  canManagePurchaseOrders,
  canViewPurchaseOrders,
} from "@/features/purchase-orders/config/permissions";
import {
  useDeletePurchaseOrder,
  usePurchaseOrders,
} from "@/features/purchase-orders/hooks/use-purchase-orders";
import type { PurchaseOrderFilters } from "@/features/purchase-orders/types";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const DEFAULT_FILTERS: PurchaseOrderFilters = {
  page: 1,
  limit: 10,
};

export default function PurchaseOrdersPage() {
  const userRole = useAuthStore((state) => state.user?.role);
  const canManage = canManagePurchaseOrders(userRole);
  const [filters, setFilters] = useState<PurchaseOrderFilters>(DEFAULT_FILTERS);
  const purchaseOrdersQuery = usePurchaseOrders(filters);
  const deletePo = useDeletePurchaseOrder();

  if (!canViewPurchaseOrders(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to view purchase orders."
        action={{ label: "Back to dashboard", href: "/dashboard" }}
      />
    );
  }

  const handleDelete = (id: string, poNumber: string) => {
    if (
      window.confirm(
        `Delete draft purchase order "${poNumber}"? This action cannot be undone.`,
      )
    ) {
      deletePo.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase orders"
        description="Create draft POs from awards, issue to vendors, and track acknowledgements."
        actions={
          canManage ? (
            <Button asChild>
              <Link href="/dashboard/purchase-orders/new">
                <Plus className="size-4" />
                Create PO
              </Link>
            </Button>
          ) : null
        }
      />

      <PoFiltersPanel
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {purchaseOrdersQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : purchaseOrdersQuery.isError ? (
        <EmptyState
          title="Unable to load purchase orders"
          description={
            purchaseOrdersQuery.error instanceof ApiClientError
              ? purchaseOrdersQuery.error.message
              : "Something went wrong."
          }
          action={{
            label: "Retry",
            onClick: () => purchaseOrdersQuery.refetch(),
          }}
        />
      ) : purchaseOrdersQuery.data &&
        purchaseOrdersQuery.data.purchaseOrders.length > 0 ? (
        <PurchaseOrdersTable
          data={purchaseOrdersQuery.data}
          canManage={canManage}
          onPageChange={(page) =>
            setFilters((current) => ({ ...current, page }))
          }
          onDelete={canManage ? handleDelete : undefined}
        />
      ) : (
        <EmptyState
          title="No purchase orders yet"
          description="Create a draft PO from an awarded bid to begin the procurement fulfilment process."
          action={
            canManage
              ? { label: "Create PO", href: "/dashboard/purchase-orders/new" }
              : undefined
          }
        />
      )}
    </div>
  );
}
