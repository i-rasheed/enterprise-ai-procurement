"use client";

import type { AnalyticsFilters } from "@/features/analytics/types";
import { ApiClientError } from "@/lib/api";

import { useVendorAnalytics } from "../hooks/use-analytics";
import { DomainAnalyticsView } from "./domain-analytics-view";

type VendorDashboardProps = {
  filters: AnalyticsFilters;
};

export function VendorDashboard({ filters }: VendorDashboardProps) {
  const vendorQuery = useVendorAnalytics(filters);

  return (
    <DomainAnalyticsView
      title="Vendor dashboard"
      description="Vendor portfolio health, category distribution, compliance, and success rates."
      data={vendorQuery.data}
      isLoading={vendorQuery.isLoading}
      isError={vendorQuery.isError}
      errorMessage={
        vendorQuery.error instanceof ApiClientError
          ? vendorQuery.error.message
          : undefined
      }
      onRetry={() => vendorQuery.refetch()}
    />
  );
}
