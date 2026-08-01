"use client";

import { useParams, useRouter } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeaderSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PoActionsPanel } from "@/features/purchase-orders/components/po-actions-panel";
import { PoDetailHeader } from "@/features/purchase-orders/components/po-detail-header";
import { PoItemsPanel } from "@/features/purchase-orders/components/po-items-panel";
import { PoPdfPreview } from "@/features/purchase-orders/components/po-pdf-preview";
import { PoGrnPanel } from "@/features/goods-receipts/components/po-grn-panel";
import {
  canEditPurchaseOrder,
  canManagePurchaseOrders,
  canViewPurchaseOrders,
} from "@/features/purchase-orders/config/permissions";
import { usePurchaseOrder } from "@/features/purchase-orders/hooks/use-purchase-orders";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function PurchaseOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role;
  const poQuery = usePurchaseOrder(id);

  if (!canViewPurchaseOrders(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to view purchase orders."
        action={{ label: "Back to dashboard", href: "/dashboard" }}
      />
    );
  }

  if (poQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (poQuery.isError || !poQuery.data) {
    return (
      <EmptyState
        title="Purchase order not found"
        description={
          poQuery.error instanceof ApiClientError
            ? poQuery.error.message
            : "This purchase order could not be loaded."
        }
        action={{
          label: "Back to purchase orders",
          href: "/dashboard/purchase-orders",
        }}
      />
    );
  }

  const po = poQuery.data;
  const canManage = canManagePurchaseOrders(userRole);

  return (
    <div className="space-y-6">
      <PoDetailHeader
        po={po}
        canEdit={canManage && canEditPurchaseOrder(po)}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <PoItemsPanel po={po} />
        <PoActionsPanel
          po={po}
          canManage={canManage}
          userEmail={user?.email}
        />
      </div>

      <PoGrnPanel po={po} canManage={canManage} />

      {po.deliveryAddress || po.notes ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {po.deliveryAddress ? (
            <div className="rounded-xl border p-4">
              <h3 className="mb-2 font-semibold">Delivery address</h3>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                {po.deliveryAddress}
              </p>
            </div>
          ) : null}
          {po.notes ? (
            <div className="rounded-xl border p-4">
              <h3 className="mb-2 font-semibold">Notes</h3>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                {po.notes}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <PoPdfPreview po={po} />

      <Button type="button" variant="outline" onClick={() => router.back()}>
        Back
      </Button>
    </div>
  );
}
