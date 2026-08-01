"use client";

import {
  AlertCircle,
  BadgeDollarSign,
  ClipboardCheck,
  FileText,
  Handshake,
  PiggyBank,
  ScrollText,
  ShoppingCart,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { DashboardChart, DashboardChartSkeleton } from "@/features/dashboard/components/dashboard-chart";
import { KpiStatCard, KpiStatCardSkeleton } from "@/features/dashboard/components/kpi-stat-card";
import { NotificationsPanel } from "@/features/dashboard/components/notifications-panel";
import { QuickActionsPanel } from "@/features/dashboard/components/quick-actions-panel";
import { RecentActivities } from "@/features/dashboard/components/recent-activities";
import { VendorHealthWidget } from "@/features/dashboard/components/vendor-health-widget";
import {
  useDashboardNotifications,
  useExecutiveDashboard,
  usePendingRfqsCount,
} from "@/features/dashboard/hooks/use-dashboard";
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/features/dashboard/utils/formatters";
import { ApiClientError } from "@/lib/api";

export function ExecutiveDashboard() {
  const executiveQuery = useExecutiveDashboard();
  const notificationsQuery = useDashboardNotifications();
  const pendingRfqsQuery = usePendingRfqsCount(
    !executiveQuery.isError,
  );

  const dashboard = executiveQuery.data;
  const isLoading = executiveQuery.isLoading;
  const isForbidden =
    executiveQuery.error instanceof ApiClientError &&
    executiveQuery.error.statusCode === 403;

  if (isForbidden) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Executive dashboard"
          description="Organisation-wide procurement intelligence and KPIs."
        />
        <EmptyState
          icon={AlertCircle}
          title="Analytics access required"
          description="Your role does not include executive analytics. Contact an administrator for access or use the procurement modules available in the sidebar."
          action={{ label: "Go to procurement", href: "/dashboard/procurement" }}
        />
      </div>
    );
  }

  if (executiveQuery.isError && !dashboard) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Executive dashboard"
          description="Organisation-wide procurement intelligence and KPIs."
        />
        <EmptyState
          icon={AlertCircle}
          title="Unable to load dashboard"
          description={
            executiveQuery.error instanceof ApiClientError
              ? executiveQuery.error.message
              : "Something went wrong while loading analytics."
          }
          action={{ label: "Retry", onClick: () => executiveQuery.refetch() }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Executive dashboard"
        description="Real-time spend, savings, approvals, and operational health across your organisation."
        actions={
          dashboard ? (
            <Badge variant="secondary">
              Budget utilization {formatPercent(dashboard.budgetUtilization)}
            </Badge>
          ) : null
        }
      />

      <section
        aria-label="Key performance indicators"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {isLoading || !dashboard ? (
          Array.from({ length: 8 }).map((_, index) => (
            <KpiStatCardSkeleton key={index} />
          ))
        ) : (
          <>
            <KpiStatCard
              title="Spend"
              value={formatCompactCurrency(dashboard.totalSpend)}
              description={`${formatNumber(dashboard.invoicesPaid)} invoices paid`}
              icon={BadgeDollarSign}
              trend={`Budget used ${formatPercent(dashboard.budgetUtilization)}`}
            />
            <KpiStatCard
              title="Savings"
              value={formatCompactCurrency(dashboard.savingsGenerated)}
              description="Generated vs estimated budget"
              icon={PiggyBank}
              trend={
                dashboard.kpis?.savingsPercentage
                  ? `${formatPercent(dashboard.kpis.savingsPercentage)} of budget saved`
                  : undefined
              }
            />
            <KpiStatCard
              title="Approvals"
              value={formatNumber(dashboard.pendingApprovals)}
              description={`Avg ${dashboard.averageApprovalTimeDays.toFixed(1)} days to approve`}
              icon={ClipboardCheck}
            />
            <KpiStatCard
              title="Pending RFQs"
              value={formatNumber(pendingRfqsQuery.data ?? 0)}
              description="Published and accepting bids"
              icon={ShoppingCart}
            />
            <KpiStatCard
              title="Purchase orders"
              value={formatNumber(dashboard.totalPurchaseOrders)}
              description={`${formatNumber(dashboard.outstandingPurchaseOrders)} outstanding`}
              icon={Handshake}
            />
            <KpiStatCard
              title="Invoices"
              value={formatNumber(dashboard.invoicesAwaitingApproval)}
              description="Awaiting approval or matching"
              icon={FileText}
              trend={`${formatNumber(dashboard.invoicesPaid)} paid`}
            />
            <KpiStatCard
              title="Contracts"
              value={formatNumber(dashboard.activeContracts)}
              description={`${formatNumber(dashboard.totalContracts)} total contracts`}
              icon={ScrollText}
            />
            <VendorHealthWidget dashboard={dashboard} />
          </>
        )}
      </section>

      <section
        aria-label="Analytics charts"
        className="grid gap-4 xl:grid-cols-2"
      >
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
              chart={dashboard.spendByVendor}
              variant="bar"
              valueFormatter={formatCurrency}
            />
          </>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <NotificationsPanel
          notifications={notificationsQuery.data}
          isLoading={notificationsQuery.isLoading}
        />
        <QuickActionsPanel />
      </section>

      <RecentActivities
        dashboard={dashboard}
        notifications={notificationsQuery.data}
        isLoading={isLoading || notificationsQuery.isLoading}
      />
    </div>
  );
}
