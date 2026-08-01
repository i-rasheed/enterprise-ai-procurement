"use client";

import type { AnalyticsFilters } from "@/features/analytics/types";
import { ApiClientError } from "@/lib/api";

import { useSpendAnalytics } from "../hooks/use-analytics";
import { DomainAnalyticsView } from "./domain-analytics-view";

type SpendDashboardProps = {
  filters: AnalyticsFilters;
};

export function SpendDashboard({ filters }: SpendDashboardProps) {
  const spendQuery = useSpendAnalytics(filters);

  return (
    <DomainAnalyticsView
      title="Spend dashboard"
      description="Invoice-backed spend analysis with category trends, vendor concentration, and savings KPIs."
      data={spendQuery.data}
      isLoading={spendQuery.isLoading}
      isError={spendQuery.isError}
      errorMessage={
        spendQuery.error instanceof ApiClientError
          ? spendQuery.error.message
          : undefined
      }
      onRetry={() => spendQuery.refetch()}
    />
  );
}
