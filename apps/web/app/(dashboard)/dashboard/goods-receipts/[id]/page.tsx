"use client";

import { useParams, useRouter } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeaderSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GrnActionsPanel } from "@/features/goods-receipts/components/grn-actions-panel";
import { GrnDetailHeader } from "@/features/goods-receipts/components/grn-detail-header";
import { GrnHistoryPanel } from "@/features/goods-receipts/components/grn-history-panel";
import { GrnItemsPanel } from "@/features/goods-receipts/components/grn-items-panel";
import { GrnTimeline } from "@/features/goods-receipts/components/grn-timeline";
import { ReceiveGoodsForm } from "@/features/goods-receipts/components/receive-goods-form";
import { RejectGoodsForm } from "@/features/goods-receipts/components/reject-goods-form";
import {
  canCompleteGoodsReceipt,
  canEditGoodsReceipt,
  canManageGoodsReceipts,
  canReceiveOrRejectGoods,
  canViewGoodsReceipts,
} from "@/features/goods-receipts/config/permissions";
import { useGoodsReceipt } from "@/features/goods-receipts/hooks/use-goods-receipts";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function GoodsReceiptDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const userRole = useAuthStore((state) => state.user?.role);
  const grnQuery = useGoodsReceipt(id);

  if (!canViewGoodsReceipts(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to view goods receipts."
        action={{ label: "Back to dashboard", href: "/dashboard" }}
      />
    );
  }

  if (grnQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (grnQuery.isError || !grnQuery.data) {
    return (
      <EmptyState
        title="Goods receipt not found"
        description={
          grnQuery.error instanceof ApiClientError
            ? grnQuery.error.message
            : "This goods receipt could not be loaded."
        }
        action={{
          label: "Back to goods receipts",
          href: "/dashboard/goods-receipts",
        }}
      />
    );
  }

  const grn = grnQuery.data;
  const canManage = canManageGoodsReceipts(userRole);
  const canReceive = canManage && canReceiveOrRejectGoods(grn);

  return (
    <div className="space-y-6">
      <GrnDetailHeader
        grn={grn}
        canEdit={canManage && canEditGoodsReceipt(grn)}
      />

      <GrnItemsPanel grn={grn} />

      <div className="grid gap-6 xl:grid-cols-2">
        <ReceiveGoodsForm
          key={`receive-${grn.updatedAt}`}
          grn={grn}
          canReceive={canReceive}
        />
        <RejectGoodsForm
          key={`reject-${grn.updatedAt}`}
          grn={grn}
          canReject={canReceive}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GrnTimeline grn={grn} />
        <GrnHistoryPanel
          purchaseOrderId={grn.purchaseOrderId}
          currentReceiptId={grn.id}
        />
      </div>

      {grn.notes ? (
        <div className="rounded-xl border p-4">
          <h3 className="mb-2 font-semibold">Notes</h3>
          <p className="text-muted-foreground text-sm whitespace-pre-wrap">
            {grn.notes}
          </p>
        </div>
      ) : null}

      <GrnActionsPanel
        grn={grn}
        canComplete={canCompleteGoodsReceipt(userRole)}
      />

      <Button type="button" variant="outline" onClick={() => router.back()}>
        Back
      </Button>
    </div>
  );
}
