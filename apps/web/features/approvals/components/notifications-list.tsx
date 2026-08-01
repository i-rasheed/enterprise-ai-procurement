"use client";

import Link from "next/link";
import { Bell, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useMarkNotificationRead,
  useNotifications,
} from "@/features/approvals/hooks/use-approvals";
import { formatRelativeTime } from "@/features/dashboard/utils/formatters";

export function NotificationsList() {
  const notificationsQuery = useNotifications();
  const markRead = useMarkNotificationRead();
  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            In-app alerts for approvals and procurement activity.
          </CardDescription>
        </div>
        {unreadCount > 0 ? (
          <Badge variant="secondary">{unreadCount} unread</Badge>
        ) : null}
      </CardHeader>
      <CardContent>
        {notificationsQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No notifications yet. Approval alerts will appear here when emitted
            by the platform.
          </p>
        ) : (
          <ScrollArea className="h-[480px] pr-3">
            <ul className="space-y-3">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-muted-foreground text-sm">
                        {notification.message}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                    {notification.read ? (
                      <CheckCircle2 className="text-muted-foreground size-4 shrink-0" />
                    ) : (
                      <span className="bg-primary mt-1 size-2 shrink-0 rounded-full" />
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!notification.read ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={markRead.isPending}
                        onClick={() => markRead.mutate(notification.id)}
                      >
                        Mark as read
                      </Button>
                    ) : null}
                    {typeof notification.metadata?.requestId === "string" ? (
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/procurement/${notification.metadata.requestId}`}
                        >
                          View request
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
