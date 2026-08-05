import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { BidStatusBadge } from "@/features/bids/components/bid-status-badge";
import type { Bid } from "@/features/bids/types";

type BidDetailHeaderProps = {
  bid: Bid;
  procurementRequestId?: string;
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}

export function BidDetailHeader({
  bid,
  procurementRequestId,
}: BidDetailHeaderProps) {
  return (
    <div className="space-y-4 border-b pb-6">
      <PageHeader
        title={bid.bidNumber}
        description={`${bid.vendor.name} · ${bid.rfq.title}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <BidStatusBadge status={bid.status} />
            {procurementRequestId ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/bids/compare/${procurementRequestId}`}>
                  Compare bids
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/rfqs/${bid.rfqId}`}>View RFQ</Link>
            </Button>
          </div>
        }
        className="border-0 pb-0"
      />
      <dl className="text-muted-foreground grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-medium text-foreground">Total amount</dt>
          <dd>{formatCurrency(bid.totalAmount, bid.currency)}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Delivery</dt>
          <dd>{bid.deliveryPeriod ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Payment terms</dt>
          <dd>{bid.paymentTerms ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Submitted</dt>
          <dd>
            {bid.submittedAt
              ? new Date(bid.submittedAt).toLocaleString()
              : "Not submitted"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
