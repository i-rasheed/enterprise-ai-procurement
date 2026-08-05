"use client";

import {
  Activity,
  CheckCircle,
  FileText,
  Package,
  ShoppingCart,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppNotification, ExecutiveDashboard } from "@/features/dashboard/types";
import { formatRelativeTime } from "@/features/dashboard/utils/formatters";

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: typeof Activity;
};

function buildSyntheticActivities(
  dashboard?: ExecutiveDashboard,
): ActivityItem[] {
  if (!dashboard) return [];

  const items: ActivityItem[] = [];

  if (dashboard.pendingApprovals > 0) {
    items.push({
      id: "approvals",
      title: "Approvals pending",
      description: `${dashboard.pendingApprovals} requests awaiting decision`,
      time: new Date().toISOString(),
      icon: CheckCircle,
    });
  }

  if (dashboard.outstandingPurchaseOrders > 0) {
    items.push({
      id: "pos",
      title: "Purchase orders in flight",
      description: `${dashboard.outstandingPurchaseOrders} POs outstanding delivery`,
      time: new Date().toISOString(),
      icon: Package,
    });
  }

  if (dashboard.invoicesAwaitingApproval > 0) {
    items.push({
      id: "invoices",
      title: "Invoices awaiting approval",
      description: `${dashboard.invoicesAwaitingApproval} invoices in review queue`,
      time: new Date().toISOString(),
      icon: FileText,
    });
  }

  if (dashboard.openProcurementRequests > 0) {
    items.push({
      id: "procurement",
      title: "Open procurement requests",
      description: `${dashboard.openProcurementRequests} requests in progress`,
      time: new Date().toISOString(),
      icon: ShoppingCart,
    });
  }

  return items;
}

function mapNotificationActivities(
  notifications: AppNotification[],
): ActivityItem[] {
  return notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    description: notification.message,
    time: notification.createdAt,
    icon: Activity,
  }));
}

type RecentActivitiesProps = {
  dashboard?: ExecutiveDashboard;
  notifications?: AppNotification[];
  isLoading?: boolean;
};

export function RecentActivities({
  dashboard,
  notifications = [],
  isLoading,
}: RecentActivitiesProps) {
  const activities = [
    ...mapNotificationActivities(notifications),
    ...buildSyntheticActivities(dashboard),
  ].slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent activities</CardTitle>
        <CardDescription>
          Latest notifications and procurement events
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Activity will appear here as your team processes procurement
            workflows.
          </p>
        ) : (
          <ul className="divide-y">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <li
                  key={activity.id}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {activity.description}
                    </p>
                  </div>
                  <time
                    className="text-muted-foreground shrink-0 text-xs"
                    dateTime={activity.time}
                  >
                    {formatRelativeTime(activity.time)}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
