"use client";

import { useParams, useRouter } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeaderSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BidDetailHeader } from "@/features/bids/components/bid-detail-header";
import { BidEvaluationsPanel } from "@/features/bids/components/bid-evaluations-panel";
import { BidItemsPanel } from "@/features/bids/components/bid-items-panel";
import { EvaluationMatrixForm } from "@/features/bids/components/evaluation-matrix-form";
import {
  canEvaluateBids,
  canViewBids,
} from "@/features/bids/config/permissions";
import { useBid, useBidEvaluations } from "@/features/bids/hooks/use-bids";
import { useRfq } from "@/features/rfqs/hooks/use-rfqs";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function BidDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const userRole = useAuthStore((state) => state.user?.role);
  const bidQuery = useBid(id);
  const evaluationsQuery = useBidEvaluations(id);
  const rfqQuery = useRfq(bidQuery.data?.rfqId ?? "");

  if (!canViewBids(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to view vendor bids."
        action={{ label: "Back to dashboard", href: "/dashboard" }}
      />
    );
  }

  if (bidQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (bidQuery.isError || !bidQuery.data) {
    return (
      <EmptyState
        title="Bid not found"
        description={
          bidQuery.error instanceof ApiClientError
            ? bidQuery.error.message
            : "This bid could not be loaded."
        }
        action={{ label: "Back to bids", href: "/dashboard/bids" }}
      />
    );
  }

  const bid = bidQuery.data;
  const canEvaluate = canEvaluateBids(userRole);
  const canScore =
    canEvaluate && (bid.status === "SUBMITTED" || bid.status === "AWARDED");
  const procurementRequestId = rfqQuery.data?.procurementRequestId;

  return (
    <div className="space-y-6">
      <BidDetailHeader bid={bid} procurementRequestId={procurementRequestId} />

      <div className="grid gap-6 xl:grid-cols-2">
        <BidItemsPanel bid={bid} />
        <EvaluationMatrixForm
          bidId={bid.id}
          canEvaluate={canEvaluate}
          disabled={!canScore}
        />
      </div>

      <BidEvaluationsPanel
        data={evaluationsQuery.data}
        isLoading={evaluationsQuery.isLoading}
      />

      {bid.notes ? (
        <div className="bg-muted rounded-lg p-4 text-sm">
          <p className="font-medium">Vendor notes</p>
          <p className="text-muted-foreground mt-1">{bid.notes}</p>
        </div>
      ) : null}

      <Button type="button" variant="outline" onClick={() => router.back()}>
        Back
      </Button>
    </div>
  );
}
