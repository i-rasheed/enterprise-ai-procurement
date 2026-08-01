"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { MembersTable } from "@/features/organization/components/members-table";
import { OrganizationShell } from "@/features/organization/components/organization-shell";
import { canManageMembers } from "@/features/organization/config/permissions";
import { useOrganization } from "@/features/organization/hooks/use-organization";
import { useAuthStore } from "@/stores/auth-store";

export default function OrganizationMembersPage() {
  const { data: organization } = useOrganization();
  const userRole = useAuthStore((state) => state.user?.role);
  const canManage = canManageMembers(userRole);

  return (
    <OrganizationShell
      title="Members"
      description="View and manage organisation members and their roles."
    >
      {organization ? (
        canManage || organization.users.length > 0 ? (
          <MembersTable
            members={organization.users}
            canManage={canManage}
          />
        ) : (
          <EmptyState
            title="No members found"
            description="Members will appear here once they join the organisation."
          />
        )
      ) : null}
    </OrganizationShell>
  );
}
