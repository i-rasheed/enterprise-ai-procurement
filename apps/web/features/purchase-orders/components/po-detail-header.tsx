import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PoStatusBadge } from "@/features/purchase-orders/components/po-status-badge";
import type { PurchaseOrder } from "@/features/purchase-orders/types";

type PoDetailHeaderProps = {
  po: PurchaseOrder;
  canEdit: boolean;
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}

export function PoDetailHeader({ po, canEdit }: PoDetailHeaderProps) {
  return (
    <div className="space-y-4 border-b pb-6">
      <PageHeader
        title={po.poNumber}
        description={`${po.vendor.name} · Created by ${po.issuedBy.firstName} ${po.issuedBy.lastName}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PoStatusBadge status={po.status} />
            {canEdit ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/purchase-orders/${po.id}/edit`}>
                  Edit draft
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/procurement/${po.procurementRequestId}`}>
                Procurement request
              </Link>
            </Button>
          </div>
        }
        className="border-0 pb-0"
      />
      <dl className="text-muted-foreground grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-medium text-foreground">Total amount</dt>
          <dd>{formatCurrency(po.totalAmount, po.currency)}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Expected delivery</dt>
          <dd>{new Date(po.expectedDeliveryDate).toLocaleDateString()}</dd>
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
    </div>
  );
}
