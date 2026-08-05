"use client";

import { ApprovalsShell } from "@/features/approvals/components/approvals-shell";
import { NotificationsList } from "@/features/approvals/components/notifications-list";

export default function ApprovalsNotificationsPage() {
  return (
    <ApprovalsShell
      title="Notifications"
      description="Stay informed about approvals, submissions, and procurement updates."
    >
      <NotificationsList />
    </ApprovalsShell>
  );
}
