"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ApprovalsNav } from "@/features/approvals/components/approvals-nav";
import { ApiClientError } from "@/lib/api";

type ApprovalsShellProps = {
  title: string;
  description: string;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  children: React.ReactNode;
};

export function ApprovalsShell({
  title,
  description,
  isLoading,
  isError,
  error,
  onRetry,
  children,
}: ApprovalsShellProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <ApprovalsNav />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError ? (
        <EmptyState
          title="Unable to load approvals"
          description={
            error instanceof ApiClientError
              ? error.message
              : "Something went wrong."
          }
          action={onRetry ? { label: "Retry", onClick: onRetry } : undefined}
        />
      ) : (
        children
      )}
    </div>
  );
}
