import { DashboardChartSkeleton } from "@/features/dashboard/components/dashboard-chart";
import { KpiStatCardSkeleton } from "@/features/dashboard/components/kpi-stat-card";
import { PageHeaderSkeleton } from "@/components/shared/page-header";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <KpiStatCardSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <DashboardChartSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
