"use client";

import type { AnalyticsFilters } from "@/features/analytics/types";
import { ApiClientError } from "@/lib/api";

import { useApprovalAnalytics } from "../hooks/use-analytics";
import { DomainAnalyticsView } from "./domain-analytics-view";

type ApprovalDashboardProps = {
  filters: AnalyticsFilters;
};

export function ApprovalDashboard({ filters }: ApprovalDashboardProps) {
  const approvalQuery = useApprovalAnalytics(filters);

  return (
    <DomainAnalyticsView
      title="Approval dashboard"
      description="Approval throughput, pending workload by level, and bottleneck KPIs."
      data={approvalQuery.data}
      isLoading={approvalQuery.isLoading}
      isError={approvalQuery.isError}
      errorMessage={
        approvalQuery.error instanceof ApiClientError
          ? approvalQuery.error.message
          : undefined
      }
      onRetry={() => approvalQuery.refetch()}
    />
  );
}
