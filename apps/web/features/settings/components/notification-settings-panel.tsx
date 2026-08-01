"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/features/settings/hooks/use-settings";

export function NotificationSettingsPanel() {
  const preferencesQuery = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const preferences = preferencesQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Notifications</h2>
        <p className="text-muted-foreground text-sm">
          Control how you receive procurement alerts and approval updates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery preferences</CardTitle>
          <CardDescription>
            Choose which channels are enabled for your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {preferencesQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <>
              <label className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="emailEnabled">Email notifications</Label>
                  <p className="text-muted-foreground text-sm">
                    Receive approval, invitation, and status updates by email.
                  </p>
                </div>
                <input
                  id="emailEnabled"
                  type="checkbox"
                  className="size-4"
                  checked={preferences?.emailEnabled ?? true}
                  disabled={updatePreferences.isPending}
                  onChange={(event) =>
                    updatePreferences.mutate({
                      emailEnabled: event.target.checked,
                      inAppEnabled: preferences?.inAppEnabled ?? true,
                    })
                  }
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="inAppEnabled">In-app notifications</Label>
                  <p className="text-muted-foreground text-sm">
                    Show alerts in the dashboard notifications panel.
                  </p>
                </div>
                <input
                  id="inAppEnabled"
                  type="checkbox"
                  className="size-4"
                  checked={preferences?.inAppEnabled ?? true}
                  disabled={updatePreferences.isPending}
                  onChange={(event) =>
                    updatePreferences.mutate({
                      emailEnabled: preferences?.emailEnabled ?? true,
                      inAppEnabled: event.target.checked,
                    })
                  }
                />
              </label>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
