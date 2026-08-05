"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { OrganizationNav } from "@/features/organization/components/organization-nav";
import { useOrganization } from "@/features/organization/hooks/use-organization";
import { ApiClientError } from "@/lib/api";

type OrganizationShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function OrganizationShell({
  title,
  description,
  children,
}: OrganizationShellProps) {
  const { isLoading, isError, error, refetch } = useOrganization();

  return (
    <div className="space-y-8">
      <PageHeader title={title} description={description} />
      <OrganizationNav />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError ? (
        <EmptyState
          title="Unable to load organisation"
          description={
            error instanceof ApiClientError
              ? error.message
              : "Something went wrong."
          }
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      ) : (
        children
      )}
    </div>
  );
}
