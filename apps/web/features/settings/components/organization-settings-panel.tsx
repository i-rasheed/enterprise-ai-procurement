"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { OrganizationProfileForm } from "@/features/organization/components/organization-profile-form";
import { OrganizationSettingsForm } from "@/features/organization/components/organization-settings-form";
import {
  canManageOrganization,
} from "@/features/settings/config/permissions";
import { useOrganization } from "@/features/organization/hooks/use-organization";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function OrganizationSettingsPanel() {
  const userRole = useAuthStore((state) => state.user?.role);
  const organizationQuery = useOrganization();
  const canEdit = canManageOrganization(userRole);

  if (organizationQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (organizationQuery.isError || !organizationQuery.data) {
    return (
      <EmptyState
        title="Unable to load organisation"
        description={
          organizationQuery.error instanceof ApiClientError
            ? organizationQuery.error.message
            : "Something went wrong."
        }
        action={{ label: "Retry", onClick: () => organizationQuery.refetch() }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Organization</h2>
        <p className="text-muted-foreground text-sm">
          Manage your tenant profile and organisation-level settings.
        </p>
      </div>

      <OrganizationProfileForm
        organization={organizationQuery.data}
        canEdit={canEdit}
      />
      {canEdit ? <OrganizationSettingsForm /> : null}
    </div>
  );
}
