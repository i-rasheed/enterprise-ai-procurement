"use client";

import {
  BadgeDollarSign,
  ClipboardCheck,
  Handshake,
  PiggyBank,
  ScrollText,
  ShoppingCart,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DashboardChart,
  DashboardChartSkeleton,
} from "@/features/dashboard/components/dashboard-chart";
import {
  KpiStatCard,
  KpiStatCardSkeleton,
} from "@/features/dashboard/components/kpi-stat-card";
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/features/dashboard/utils/formatters";
import type { AnalyticsFilters } from "@/features/analytics/types";

import { useAnalyticsExecutive } from "../hooks/use-analytics";

type OverviewDashboardProps = {
  filters: AnalyticsFilters;
};

export function OverviewDashboard({ filters }: OverviewDashboardProps) {
  const executiveQuery = useAnalyticsExecutive({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });
  const dashboard = executiveQuery.data;
  const isLoading = executiveQuery.isLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Overview</h2>
          <p className="text-muted-foreground text-sm">
            Organisation-wide KPIs, charts, and procurement health metrics.
          </p>
        </div>
        {dashboard ? (
          <Badge variant="secondary">
            Budget utilization {formatPercent(dashboard.budgetUtilization)}
          </Badge>
        ) : null}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading || !dashboard ? (
          Array.from({ length: 8 }).map((_, index) => (
            <KpiStatCardSkeleton key={index} />
          ))
        ) : (
          <>
            <KpiStatCard
              title="Total spend"
              value={formatCompactCurrency(dashboard.totalSpend)}
              description={`${formatNumber(dashboard.invoicesPaid)} invoices paid`}
              icon={BadgeDollarSign}
            />
            <KpiStatCard
              title="Savings generated"
              value={formatCompactCurrency(dashboard.savingsGenerated)}
              description="Against estimated budget"
              icon={PiggyBank}
              trend={
                dashboard.kpis?.savingsPercentage
                  ? `${formatPercent(dashboard.kpis.savingsPercentage)} saved`
                  : undefined
              }
            />
            <KpiStatCard
              title="Pending approvals"
              value={formatNumber(dashboard.pendingApprovals)}
              description={`Avg ${dashboard.averageApprovalTimeDays.toFixed(1)} days`}
              icon={ClipboardCheck}
            />
            <KpiStatCard
              title="Active vendors"
              value={formatNumber(dashboard.activeVendors)}
              description={`${formatNumber(dashboard.approvedVendors)} approved`}
              icon={Users}
            />
            <KpiStatCard
              title="Procurement requests"
              value={formatNumber(dashboard.totalProcurementRequests)}
              description={`${formatNumber(dashboard.openProcurementRequests)} open`}
              icon={ShoppingCart}
            />
            <KpiStatCard
              title="Purchase orders"
              value={formatNumber(dashboard.totalPurchaseOrders)}
              description={`${formatNumber(dashboard.outstandingPurchaseOrders)} outstanding`}
              icon={Handshake}
            />
            <KpiStatCard
              title="Active contracts"
              value={formatNumber(dashboard.activeContracts)}
              description={`${formatNumber(dashboard.totalContracts)} total`}
              icon={ScrollText}
            />
            <KpiStatCard
              title="Cycle time"
              value={`${dashboard.averageProcurementCycleTimeDays.toFixed(1)}d`}
              description="Average procurement duration"
              icon={ShoppingCart}
            />
          </>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {isLoading || !dashboard ? (
          Array.from({ length: 4 }).map((_, index) => (
            <DashboardChartSkeleton key={index} />
          ))
        ) : (
          <>
            <DashboardChart
              chart={dashboard.monthlySpendTrend}
              variant="line"
              valueFormatter={formatCurrency}
            />
            <DashboardChart
              chart={dashboard.monthlySavingsTrend}
              variant="line"
              valueFormatter={formatCurrency}
            />
            <DashboardChart
              chart={dashboard.spendByCategory}
              variant="pie"
              valueFormatter={formatCurrency}
            />
            <DashboardChart
              chart={dashboard.spendByDepartment}
              variant="bar"
              valueFormatter={formatCurrency}
            />
          </>
        )}
      </section>
    </div>
  );
}
