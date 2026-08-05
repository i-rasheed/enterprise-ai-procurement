import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { GrnStatusBadge } from "@/features/goods-receipts/components/grn-status-badge";
import type { GoodsReceipt } from "@/features/goods-receipts/types";

type GrnDetailHeaderProps = {
  grn: GoodsReceipt;
  canEdit: boolean;
};

export function GrnDetailHeader({ grn, canEdit }: GrnDetailHeaderProps) {
  return (
    <div className="space-y-4 border-b pb-6">
      <PageHeader
        title={grn.receiptNumber}
        description={`Received by ${grn.receivedBy.firstName} ${grn.receivedBy.lastName}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <GrnStatusBadge status={grn.status} />
            {canEdit ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/goods-receipts/${grn.id}/edit`}>
                  Edit draft
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/purchase-orders/${grn.purchaseOrderId}`}>
                View PO
              </Link>
            </Button>
          </div>
        }
        className="border-0 pb-0"
      />
      <dl className="text-muted-foreground grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-medium text-foreground">Receipt date</dt>
          <dd>{new Date(grn.receiptDate).toLocaleDateString()}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Warehouse</dt>
          <dd>{grn.warehouse ?? "Not assigned"}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Line items</dt>
          <dd>{grn.items.length}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Last updated</dt>
          <dd>{new Date(grn.updatedAt).toLocaleString()}</dd>
        </div>
      </dl>
    </div>
  );
}
