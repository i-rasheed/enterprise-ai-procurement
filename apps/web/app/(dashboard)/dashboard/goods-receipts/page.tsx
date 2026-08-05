"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader, TableSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { GrnFiltersPanel } from "@/features/goods-receipts/components/grn-filters";
import { GoodsReceiptsTable } from "@/features/goods-receipts/components/goods-receipts-table";
import {
  canManageGoodsReceipts,
  canViewGoodsReceipts,
} from "@/features/goods-receipts/config/permissions";
import {
  useDeleteGoodsReceipt,
  useGoodsReceipts,
} from "@/features/goods-receipts/hooks/use-goods-receipts";
import type { GoodsReceiptFilters } from "@/features/goods-receipts/types";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const DEFAULT_FILTERS: GoodsReceiptFilters = {
  page: 1,
  limit: 10,
};

export default function GoodsReceiptsPage() {
  const userRole = useAuthStore((state) => state.user?.role);
  const canManage = canManageGoodsReceipts(userRole);
  const [filters, setFilters] = useState<GoodsReceiptFilters>(DEFAULT_FILTERS);
  const grnsQuery = useGoodsReceipts(filters);
  const deleteGrn = useDeleteGoodsReceipt();

  if (!canViewGoodsReceipts(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to view goods receipts."
        action={{ label: "Back to dashboard", href: "/dashboard" }}
      />
    );
  }

  const handleDelete = (id: string, receiptNumber: string) => {
    if (
      window.confirm(
        `Delete draft goods receipt "${receiptNumber}"? This action cannot be undone.`,
      )
    ) {
      deleteGrn.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goods receipts"
        description="Receive goods, record partial deliveries, reject damaged items, and track warehouse receipts."
        actions={
          canManage ? (
            <Button asChild>
              <Link href="/dashboard/goods-receipts/new">
                <Plus className="size-4" />
                Create receipt
              </Link>
            </Button>
          ) : null
        }
      />

      <GrnFiltersPanel
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {grnsQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : grnsQuery.isError ? (
        <EmptyState
          title="Unable to load goods receipts"
          description={
            grnsQuery.error instanceof ApiClientError
              ? grnsQuery.error.message
              : "Something went wrong."
          }
          action={{ label: "Retry", onClick: () => grnsQuery.refetch() }}
        />
      ) : grnsQuery.data && grnsQuery.data.goodsReceipts.length > 0 ? (
        <GoodsReceiptsTable
          data={grnsQuery.data}
          canManage={canManage}
          onPageChange={(page) =>
            setFilters((current) => ({ ...current, page }))
          }
          onDelete={canManage ? handleDelete : undefined}
        />
      ) : (
        <EmptyState
          title="No goods receipts yet"
          description="Create a receipt against an issued purchase order to begin receiving goods."
          action={
            canManage
              ? { label: "Create receipt", href: "/dashboard/goods-receipts/new" }
              : undefined
          }
        />
      )}
    </div>
  );
}
