"use client";

import { useParams } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { BidItemsPanel } from "@/features/bids/components/bid-items-panel";
import { BidStatusBadge } from "@/features/bids/components/bid-status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/features/dashboard/utils/formatters";
import { useVendorBid } from "@/features/vendor-portal/hooks/use-vendor-portal";

export default function VendorBidDetailPage() {
  const params = useParams<{ id: string }>();
  const bidQuery = useVendorBid(params.id);
  const bid = bidQuery.data;

  if (bidQuery.isLoading) {
    return <p className="text-muted-foreground text-sm">Loading bid...</p>;
  }

  if (!bid) {
    return (
      <EmptyState
        title="Bid not found"
        description="This bid is unavailable."
        action={{ label: "Back to bids", href: "/vendor/bids" }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={bid.bidNumber}
        description={bid.rfq.title}
        actions={<BidStatusBadge status={bid.status} />}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total amount</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatCurrency(bid.totalAmount)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Payment terms</CardTitle>
          </CardHeader>
          <CardContent>{bid.paymentTerms ?? "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Delivery period</CardTitle>
          </CardHeader>
          <CardContent>{bid.deliveryPeriod ?? "—"}</CardContent>
        </Card>
      </div>

      <BidItemsPanel bid={bid} />
    </div>
  );
}
