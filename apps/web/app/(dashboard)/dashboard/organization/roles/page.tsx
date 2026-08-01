"use client";

import { RolesPermissionsMatrix } from "@/features/organization/components/roles-permissions-matrix";
import { OrganizationShell } from "@/features/organization/components/organization-shell";

export default function OrganizationRolesPage() {
  return (
    <OrganizationShell
      title="Roles & permissions"
      description="Understand what each role can access across the platform."
    >
      <RolesPermissionsMatrix />
    </OrganizationShell>
  );
}
