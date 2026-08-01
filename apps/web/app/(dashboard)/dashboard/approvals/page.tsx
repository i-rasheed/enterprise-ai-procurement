"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { ApprovalQueueTable } from "@/features/approvals/components/approval-queue-table";
import { ApprovalsShell } from "@/features/approvals/components/approvals-shell";
import { usePendingApprovals } from "@/features/approvals/hooks/use-approvals";

export default function ApprovalsQueuePage() {
  const pendingQuery = usePendingApprovals();

  return (
    <ApprovalsShell
      title="Approval queue"
      description="Review and action procurement requests assigned to you."
      isLoading={pendingQuery.isLoading}
      isError={pendingQuery.isError}
      error={pendingQuery.error}
      onRetry={() => pendingQuery.refetch()}
    >
      {pendingQuery.data && pendingQuery.data.pendingApprovals.length > 0 ? (
        <ApprovalQueueTable items={pendingQuery.data.pendingApprovals} />
      ) : (
        <EmptyState
          title="No pending approvals"
          description="You're all caught up. New requests will appear here when they reach your approval level."
        />
      )}
    </ApprovalsShell>
  );
}
