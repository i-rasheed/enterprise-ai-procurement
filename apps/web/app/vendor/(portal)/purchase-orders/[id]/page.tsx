"use client";

import { useParams } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PoItemsPanel } from "@/features/purchase-orders/components/po-items-panel";
import { PoStatusBadge } from "@/features/purchase-orders/components/po-status-badge";
import { formatCurrency } from "@/features/dashboard/utils/formatters";
import {
  useAcknowledgePurchaseOrder,
  useVendorPurchaseOrder,
} from "@/features/vendor-portal/hooks/use-vendor-portal";
import { useVendorContextStore } from "@/features/vendor-portal/stores/vendor-context-store";

export default function VendorPurchaseOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const vendor = useVendorContextStore((state) => state.vendor);
  const poQuery = useVendorPurchaseOrder(params.id);
  const acknowledge = useAcknowledgePurchaseOrder(vendor?.id);
  const po = poQuery.data;

  if (poQuery.isLoading) {
    return <p className="text-muted-foreground text-sm">Loading purchase order...</p>;
  }

  if (!po || po.vendor.id !== vendor?.id) {
    return (
      <EmptyState
        title="Purchase order not found"
        description="This purchase order is unavailable."
        action={{ label: "Back to purchase orders", href: "/vendor/purchase-orders" }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={po.poNumber}
        description={`Issued to ${po.vendor.name}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PoStatusBadge status={po.status} />
            {po.status === "ISSUED" ? (
              <Button
                type="button"
                size="sm"
                disabled={acknowledge.isPending}
                onClick={() =>
                  acknowledge.mutate({
                    id: po.id,
                    notes: "Acknowledged via vendor portal",
                  })
                }
              >
                Acknowledge
              </Button>
            ) : null}
          </div>
        }
      />

      <dl className="text-muted-foreground grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-medium text-foreground">Total amount</dt>
          <dd>{formatCurrency(po.totalAmount)}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Expected delivery</dt>
          <dd>
            {po.expectedDeliveryDate
              ? new Date(po.expectedDeliveryDate).toLocaleDateString()
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Issue date</dt>
          <dd>
            {po.issueDate
              ? new Date(po.issueDate).toLocaleDateString()
              : "Not issued"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Payment terms</dt>
          <dd>{po.paymentTerms ?? "—"}</dd>
        </div>
      </dl>

      <PoItemsPanel po={po} />

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
    </div>
  );
}
