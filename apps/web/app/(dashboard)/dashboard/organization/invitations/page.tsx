"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { InviteMemberPanel } from "@/features/organization/components/invite-member-form";
import { InvitationsTable } from "@/features/organization/components/invitations-table";
import { OrganizationShell } from "@/features/organization/components/organization-shell";
import { canManageMembers } from "@/features/organization/config/permissions";
import {
  useInvitations,
  useOrganization,
} from "@/features/organization/hooks/use-organization";
import { useAuthStore } from "@/stores/auth-store";

export default function OrganizationInvitationsPage() {
  const { data: organization } = useOrganization();
  const userRole = useAuthStore((state) => state.user?.role);
  const canManage = canManageMembers(userRole);
  const invitationsQuery = useInvitations(organization?.id);

  if (!canManage) {
    return (
      <OrganizationShell
        title="Invitations"
        description="Invite users to join your organisation."
      >
        <EmptyState
          title="Admin access required"
          description="Only administrators can manage organisation invitations."
        />
      </OrganizationShell>
    );
  }

  return (
    <OrganizationShell
      title="Invitations"
      description="Invite users to join your organisation with assigned roles."
    >
      {organization ? (
        <div className="space-y-6">
          <InviteMemberPanel />
          <InvitationsTable
            organisationId={organization.id}
            invitations={invitationsQuery.data?.invitations ?? []}
          />
        </div>
      ) : null}
    </OrganizationShell>
  );
}
