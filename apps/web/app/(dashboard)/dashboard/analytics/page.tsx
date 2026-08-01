"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { AnalyticsShell } from "@/features/analytics/components/analytics-shell";
import { canAccessAnalytics } from "@/features/analytics/config/permissions";
import { useAuthStore } from "@/stores/auth-store";

export default function AnalyticsPage() {
  const userRole = useAuthStore((state) => state.user?.role);

  if (!canAccessAnalytics(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="Analytics is available to admin, finance, procurement manager, and department head roles."
        action={{ label: "Back to dashboard", href: "/dashboard" }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Charts, KPIs, domain dashboards, and exportable reports across spend, vendors, approvals, and savings."
      />
      <AnalyticsShell />
    </div>
  );
}
