"use client";

import { Building2, Mail, Shield, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrganizationProfileForm } from "@/features/organization/components/organization-profile-form";
import { OrganizationShell } from "@/features/organization/components/organization-shell";
import {
  canManageOrganization,
} from "@/features/organization/config/permissions";
import { useOrganization } from "@/features/organization/hooks/use-organization";
import { useAuthStore } from "@/stores/auth-store";

export default function OrganizationProfilePage() {
  const { data: organization } = useOrganization();
  const userRole = useAuthStore((state) => state.user?.role);

  return (
    <OrganizationShell
      title="Organization"
      description="Manage your tenant profile, members, roles, and invitations."
    >
      {organization ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Members</CardTitle>
                <Users className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {organization.users.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tenant</CardTitle>
                <Building2 className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <div className="truncate text-lg font-semibold">
                  {organization.name}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Your role</CardTitle>
                <Shield className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">{userRole ?? "—"}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Invitations</CardTitle>
                <Mail className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground text-sm">
                  Manage from Invitations tab
                </div>
              </CardContent>
            </Card>
          </div>

          <OrganizationProfileForm
            organization={organization}
            canEdit={canManageOrganization(userRole)}
          />
        </div>
      ) : null}
    </OrganizationShell>
  );
}
