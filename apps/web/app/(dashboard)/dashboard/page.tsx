import type { Metadata } from "next";
import {
  ArrowUpRight,
  ClipboardList,
  Package,
  TrendingUp,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
};

const stats = [
  {
    title: "Open requests",
    value: "—",
    description: "Awaiting approval or RFQ",
    icon: ClipboardList,
  },
  {
    title: "Active POs",
    value: "—",
    description: "In progress deliveries",
    icon: Package,
  },
  {
    title: "Spend (MTD)",
    value: "—",
    description: "Organisation-wide",
    icon: TrendingUp,
  },
  {
    title: "Pending invoices",
    value: "—",
    description: "Three-way match queue",
    icon: ArrowUpRight,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of procurement activity across your organisation."
        actions={<Badge variant="secondary">Foundation ready</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <CardDescription>{stat.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <EmptyState
        title="Analytics modules coming next"
        description="Executive KPIs, charts, and AI insights will appear here once the analytics sprint is connected to the API."
        action={{ label: "View procurement", href: "/dashboard/procurement" }}
      />
    </div>
  );
}
