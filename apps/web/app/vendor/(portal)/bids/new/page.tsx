"use client";

import { useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VendorBidForm } from "@/features/vendor-portal/components/vendor-bid-form";
import { useVendorRfq } from "@/features/vendor-portal/hooks/use-vendor-portal";
import { useVendorContextStore } from "@/features/vendor-portal/stores/vendor-context-store";

export default function VendorNewBidPage() {
  const searchParams = useSearchParams();
  const rfqId = searchParams.get("rfqId") ?? "";
  const vendor = useVendorContextStore((state) => state.vendor);
  const rfqQuery = useVendorRfq(rfqId, vendor?.id);

  if (!rfqId) {
    return (
      <EmptyState
        title="Select an RFQ"
        description="Choose an invited RFQ before submitting a bid."
        action={{ label: "View RFQs", href: "/vendor/rfqs" }}
      />
    );
  }

  if (rfqQuery.isLoading) {
    return <p className="text-muted-foreground text-sm">Loading RFQ...</p>;
  }

  if (!rfqQuery.data) {
    return (
      <EmptyState
        title="RFQ unavailable"
        description="You may not be invited to this RFQ."
        action={{ label: "Back to RFQs", href: "/vendor/rfqs" }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bid submission"
        description={`Prepare and submit your proposal for ${rfqQuery.data.rfqNumber}.`}
      />
      <Card>
        <CardHeader>
          <CardTitle>{rfqQuery.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <VendorBidForm rfqId={rfqId} rfqTitle={rfqQuery.data.title} />
        </CardContent>
      </Card>
    </div>
  );
}
