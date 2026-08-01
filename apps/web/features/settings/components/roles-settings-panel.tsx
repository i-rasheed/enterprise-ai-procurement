"use client";

import { EmptyState } from "@/components/shared/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MembersTable } from "@/features/organization/components/members-table";
import {
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
} from "@/features/organization/config/permissions";
import { useOrganization } from "@/features/organization/hooks/use-organization";
import { canManageRoles } from "@/features/settings/config/permissions";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function RolesSettingsPanel() {
  const userRole = useAuthStore((state) => state.user?.role);
  const organizationQuery = useOrganization();
  const canManage = canManageRoles(userRole);

  if (organizationQuery.isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (organizationQuery.isError || !organizationQuery.data) {
    return (
      <EmptyState
        title="Unable to load roles"
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
        <h2 className="text-xl font-semibold">Roles</h2>
        <p className="text-muted-foreground text-sm">
          Review role definitions and assign roles to organisation members.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ASSIGNABLE_ROLES.map((role) => (
          <Card key={role}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{ROLE_LABELS[role]}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {role === "ADMIN" && "Full platform and organisation control."}
                {role === "FINANCE" &&
                  "Finance, invoices, analytics, and approvals."}
                {role === "PROCUREMENT_MANAGER" &&
                  "Procurement operations, vendors, and analytics."}
                {role === "DEPARTMENT_HEAD" &&
                  "Department procurement and approvals."}
                {role === "USER" && "Create and manage procurement requests."}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <MembersTable
        members={organizationQuery.data.users}
        canManage={canManage}
      />
    </div>
  );
}
