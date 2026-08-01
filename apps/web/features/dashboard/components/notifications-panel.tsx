"use client";

import { Bell, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppNotification } from "@/features/dashboard/types";
import { formatRelativeTime } from "@/features/dashboard/utils/formatters";

type NotificationsPanelProps = {
  notifications?: AppNotification[];
  isLoading?: boolean;
};

export function NotificationsPanel({
  notifications = [],
  isLoading,
}: NotificationsPanelProps) {
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Latest in-app alerts and updates</CardDescription>
        </div>
        {unreadCount > 0 ? (
          <Badge variant="secondary">{unreadCount} unread</Badge>
        ) : null}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-8 text-center text-sm">
            <Bell className="size-8 opacity-40" aria-hidden />
            <p>No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-3">
            <ul className="space-y-3">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="hover:bg-muted/50 rounded-lg border p-3 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-medium">
                        {notification.title}
                      </p>
                      <p className="text-muted-foreground line-clamp-2 text-xs">
                        {notification.message}
                      </p>
                    </div>
                    {notification.read ? (
                      <CheckCircle2
                        className="text-muted-foreground size-4 shrink-0"
                        aria-label="Read"
                      />
                    ) : (
                      <span
                        className="bg-primary mt-1 size-2 shrink-0 rounded-full"
                        aria-label="Unread"
                      />
                    )}
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
