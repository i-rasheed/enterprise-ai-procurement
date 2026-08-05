"use client";

import { PiggyBank, Target, TrendingDown } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DashboardChart,
  DashboardChartSkeleton,
} from "@/features/dashboard/components/dashboard-chart";
import {
  KpiStatCard,
  KpiStatCardSkeleton,
} from "@/features/dashboard/components/kpi-stat-card";
import type { AnalyticsFilters } from "@/features/analytics/types";
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
} from "@/features/dashboard/utils/formatters";
import { ApiClientError } from "@/lib/api";

import {
  useAnalyticsExecutive,
  useReport,
  useSpendAnalytics,
} from "../hooks/use-analytics";
import { kpiEntries, summaryEntries } from "../utils/format-summary";

type SavingsDashboardProps = {
  filters: AnalyticsFilters;
};

export function SavingsDashboard({ filters }: SavingsDashboardProps) {
  const executiveQuery = useAnalyticsExecutive({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });
  const spendQuery = useSpendAnalytics(filters);
  const budgetReportQuery = useReport("budget", filters);

  const isLoading =
    executiveQuery.isLoading ||
    spendQuery.isLoading ||
    budgetReportQuery.isLoading;
  const dashboard = executiveQuery.data;
  const spend = spendQuery.data;
  const budget = budgetReportQuery.data;

  if (
    executiveQuery.isError ||
    spendQuery.isError ||
    budgetReportQuery.isError
  ) {
    const error =
      executiveQuery.error ??
      spendQuery.error ??
      budgetReportQuery.error;
    return (
      <Card>
        <CardHeader>
          <CardTitle>Savings dashboard</CardTitle>
          <CardDescription>
            Budget savings, utilization, and cost reduction trends.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {error instanceof ApiClientError
              ? error.message
              : "Unable to load savings analytics."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const budgetSummary = budget ? summaryEntries(budget.data) : [];
  const budgetKpis = budget ? kpiEntries(budget.kpis) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Savings dashboard</h2>
        <p className="text-muted-foreground text-sm">
          Track generated savings, budget utilization, and savings opportunities
          across the organisation.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <KpiStatCardSkeleton key={index} />
          ))
        ) : (
          <>
            <KpiStatCard
              title="Savings generated"
              value={formatCompactCurrency(
                dashboard?.savingsGenerated ??
                  Number(spend?.summary.savingsGenerated ?? 0),
              )}
              description="Total savings vs estimated budget"
              icon={PiggyBank}
              trend={
                spend?.kpis.savingsPercentage
                  ? `${formatPercent(Number(spend.kpis.savingsPercentage))} of budget saved`
                  : undefined
              }
            />
            <KpiStatCard
              title="Budget utilization"
              value={formatPercent(
                Number(
                  budget?.data.budgetUtilization ??
                    dashboard?.budgetUtilization ??
                    spend?.summary.budgetUtilization ??
                    0,
                ),
              )}
              description="Spend against approved budget"
              icon={Target}
            />
            <KpiStatCard
              title="Total spend"
              value={formatCompactCurrency(
                Number(
                  budget?.data.totalSpend ??
                    dashboard?.totalSpend ??
                    spend?.summary.totalSpend ??
                    0,
                ),
              )}
              description="Paid and approved invoice spend"
              icon={TrendingDown}
            />
          </>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {isLoading || !dashboard ? (
          <DashboardChartSkeleton />
        ) : (
          <DashboardChart
            chart={dashboard.monthlySavingsTrend}
            variant="line"
            valueFormatter={formatCurrency}
          />
        )}
        {isLoading || !spend ? (
          <DashboardChartSkeleton />
        ) : (
          spend.charts[0] ? (
            <DashboardChart
              chart={spend.charts[0]}
              variant="pie"
              valueFormatter={formatCurrency}
            />
          ) : (
            <DashboardChartSkeleton />
          )
        )}
      </section>

      {budgetSummary.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget summary</CardTitle>
            <CardDescription>From budget analytics report</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 md:grid-cols-2">
              {budgetSummary.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <dt className="text-muted-foreground text-sm">{item.label}</dt>
                  <dd className="font-medium">{item.value}</dd>
                </div>
              ))}
            </dl>
            {budgetKpis.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {budgetKpis.map((item) => (
                  <div
                    key={item.key}
                    className="bg-muted/40 rounded-lg px-3 py-2 text-sm"
                  >
                    <p className="text-muted-foreground">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
