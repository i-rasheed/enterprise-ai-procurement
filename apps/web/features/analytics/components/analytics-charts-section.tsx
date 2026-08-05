"use client";

import {
  DashboardChart,
  DashboardChartSkeleton,
} from "@/features/dashboard/components/dashboard-chart";
import type { ChartDataset } from "@/features/dashboard/types";
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
} from "@/features/dashboard/utils/formatters";

import { getChartVariant, isCurrencyChart } from "../utils/chart-variant";

type AnalyticsChartsSectionProps = {
  charts: ChartDataset[];
  isLoading?: boolean;
  emptyMessage?: string;
};

export function AnalyticsChartsSection({
  charts,
  isLoading,
  emptyMessage = "No chart data available for the selected filters.",
}: AnalyticsChartsSectionProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <DashboardChartSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (charts.length === 0) {
    return (
      <div className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {charts.map((chart) => (
        <DashboardChart
          key={chart.title}
          chart={chart}
          variant={getChartVariant(chart)}
          valueFormatter={
            isCurrencyChart(chart) ? formatCurrency : formatNumber
          }
          emptyMessage={emptyMessage}
        />
      ))}
    </div>
  );
}

export function AnalyticsChartsCompact({
  charts,
}: {
  charts: ChartDataset[];
}) {
  return (
    <AnalyticsChartsSection
      charts={charts}
      emptyMessage="Charts will appear once report data is generated."
    />
  );
}

export function formatChartAxis(value: number, chart: ChartDataset): string {
  return isCurrencyChart(chart)
    ? formatCompactCurrency(value)
    : formatNumber(value);
}
