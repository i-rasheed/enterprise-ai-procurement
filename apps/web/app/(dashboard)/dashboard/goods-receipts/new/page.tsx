"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader, TableSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { GrnCreateForm } from "@/features/goods-receipts/components/grn-form";
import { canManageGoodsReceipts } from "@/features/goods-receipts/config/permissions";
import { useCreateGoodsReceipt } from "@/features/goods-receipts/hooks/use-goods-receipts";
import { purchaseOrderRepository } from "@/features/purchase-orders/api/purchase-order.repository";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const ELIGIBLE_PO_STATUSES = ["ISSUED", "ACKNOWLEDGED", "PARTIALLY_DELIVERED"];

function NewGoodsReceiptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultPurchaseOrderId = searchParams.get("purchaseOrderId") ?? undefined;
  const userRole = useAuthStore((state) => state.user?.role);
  const createGrn = useCreateGoodsReceipt();

  const posQuery = useQuery({
    queryKey: ["purchase-orders", "list", { limit: 100 }],
    queryFn: () => purchaseOrderRepository.list({ limit: 100 }),
    staleTime: 60 * 1000,
  });

  const purchaseOrderOptions = useMemo(
    () =>
      (posQuery.data?.purchaseOrders ?? [])
        .filter((po) => ELIGIBLE_PO_STATUSES.includes(po.status))
        .map((po) => ({
          id: po.id,
          label: `${po.poNumber} · ${po.vendor.name}`,
        })),
    [posQuery.data],
  );

  if (!canManageGoodsReceipts(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to create goods receipts."
        action={{
          label: "Back to goods receipts",
          href: "/dashboard/goods-receipts",
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create goods receipt"
        description="Create a draft receipt against an eligible purchase order."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/goods-receipts">Back to list</Link>
          </Button>
        }
      />

      {posQuery.isLoading ? (
        <TableSkeleton rows={4} />
      ) : posQuery.isError ? (
        <EmptyState
          title="Unable to load purchase orders"
          description={
            posQuery.error instanceof ApiClientError
              ? posQuery.error.message
              : "Something went wrong."
          }
          action={{ label: "Retry", onClick: () => posQuery.refetch() }}
        />
      ) : purchaseOrderOptions.length === 0 ? (
        <EmptyState
          title="No eligible purchase orders"
          description="Issue a purchase order first before creating a goods receipt."
          action={{
            label: "View purchase orders",
            href: "/dashboard/purchase-orders",
          }}
        />
      ) : (
        <GrnCreateForm
          purchaseOrders={purchaseOrderOptions}
          defaultPurchaseOrderId={defaultPurchaseOrderId}
          submitLabel="Create draft receipt"
          isSubmitting={createGrn.isPending}
          onSubmit={(values) => createGrn.mutate(values)}
          onCancel={() => router.push("/dashboard/goods-receipts")}
        />
      )}
    </div>
  );
}

export default function NewGoodsReceiptPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={4} />}>
      <NewGoodsReceiptContent />
    </Suspense>
  );
}
