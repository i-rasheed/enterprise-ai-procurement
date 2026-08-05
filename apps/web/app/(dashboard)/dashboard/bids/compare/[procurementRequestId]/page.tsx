"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader, PageHeaderSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { AwardBidPanel } from "@/features/bids/components/award-bid-panel";
import { BidComparisonTable } from "@/features/bids/components/bid-comparison-table";
import { ProcurementRecommendationsPanel } from "@/features/bids/components/procurement-recommendations-panel";
import {
  canAwardBid,
  canGetRecommendations,
  canViewBids,
} from "@/features/bids/config/permissions";
import { useProcurementRankings } from "@/features/bids/hooks/use-bids";
import { useProcurementRequest } from "@/features/procurement/hooks/use-procurement";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function BidComparePage() {
  const params = useParams<{ procurementRequestId: string }>();
  const procurementRequestId = params.procurementRequestId;
  const userRole = useAuthStore((state) => state.user?.role);
  const requestQuery = useProcurementRequest(procurementRequestId);
  const rankingsQuery = useProcurementRankings(procurementRequestId);

  if (!canViewBids(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to compare bids."
        action={{ label: "Back to dashboard", href: "/dashboard" }}
      />
    );
  }

  if (requestQuery.isLoading || rankingsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <div className="bg-muted h-64 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (requestQuery.isError || !requestQuery.data) {
    return (
      <EmptyState
        title="Procurement request not found"
        description={
          requestQuery.error instanceof ApiClientError
            ? requestQuery.error.message
            : "This procurement request could not be loaded."
        }
        action={{ label: "Back to bids", href: "/dashboard/bids" }}
      />
    );
  }

  const request = requestQuery.data;
  const rankings = rankingsQuery.data?.rankings ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bid comparison & award"
        description={request.title}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/procurement/${procurementRequestId}`}>
              View procurement request
            </Link>
          </Button>
        }
      />

      <BidComparisonTable rankings={rankings} />

      <div className="grid gap-6 xl:grid-cols-2">
        <AwardBidPanel
          procurementRequestId={procurementRequestId}
          rankings={rankings}
          canAward={canAwardBid(userRole)}
        />
        <ProcurementRecommendationsPanel
          procurementRequestId={procurementRequestId}
          canRequest={canGetRecommendations(userRole)}
        />
      </div>
    </div>
  );
}
