"use client";

import { HeartPulse } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ExecutiveDashboard } from "@/features/dashboard/types";
import {
  formatNumber,
  formatPercent,
} from "@/features/dashboard/utils/formatters";

type VendorHealthWidgetProps = {
  dashboard: ExecutiveDashboard;
};

export function VendorHealthWidget({ dashboard }: VendorHealthWidgetProps) {
  const kpis = dashboard.kpis ?? {};
  const compliance = kpis.compliancePercentage ?? 0;
  const delivery = kpis.vendorDeliveryPerformance ?? 0;
  const success = kpis.vendorSuccessRate ?? 0;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Vendor health</CardTitle>
          <CardDescription className="mt-1">
            {formatNumber(dashboard.activeVendors)} active ·{" "}
            {formatNumber(dashboard.approvedVendors)} verified
          </CardDescription>
        </div>
        <HeartPulse className="text-muted-foreground size-4" aria-hidden />
      </CardHeader>
      <CardContent className="space-y-4">
        <MetricRow label="Compliance" value={compliance} />
        <MetricRow label="Delivery performance" value={delivery} />
        <MetricRow label="Bid success rate" value={success} />
      </CardContent>
    </Card>
  );
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{formatPercent(value)}</span>
      </div>
      <Progress value={Math.min(Math.max(value, 0), 100)} className="h-2" />
    </div>
  );
}
