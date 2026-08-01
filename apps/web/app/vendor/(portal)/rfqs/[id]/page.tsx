"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useVendorRfq } from "@/features/vendor-portal/hooks/use-vendor-portal";
import { useVendorContextStore } from "@/features/vendor-portal/stores/vendor-context-store";

export default function VendorRfqDetailPage() {
  const params = useParams<{ id: string }>();
  const vendor = useVendorContextStore((state) => state.vendor);
  const rfqQuery = useVendorRfq(params.id, vendor?.id);
  const rfq = rfqQuery.data;

  if (rfqQuery.isLoading) {
    return <p className="text-muted-foreground text-sm">Loading RFQ...</p>;
  }

  if (!rfq) {
    return (
      <EmptyState
        title="RFQ not found"
        description="This RFQ is unavailable or you are not invited."
        action={{ label: "Back to RFQs", href: "/vendor/rfqs" }}
      />
    );
  }

  const invited = rfq.vendors?.some((entry) => entry.vendor.id === vendor?.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={rfq.title}
        description={rfq.rfqNumber}
        actions={<Badge variant="outline">{rfq.status}</Badge>}
      />

      <Card>
        <CardHeader>
          <CardTitle>RFQ details</CardTitle>
          <CardDescription>
            Closing {new Date(rfq.closingDate).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">{rfq.description}</p>
          {invited && rfq.status === "PUBLISHED" ? (
            <Button asChild>
              <Link href={`/vendor/bids/new?rfqId=${rfq.id}`}>Prepare bid</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
