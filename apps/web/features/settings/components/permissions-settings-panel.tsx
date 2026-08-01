"use client";

import { RolesPermissionsMatrix } from "@/features/organization/components/roles-permissions-matrix";

export function PermissionsSettingsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Permissions</h2>
        <p className="text-muted-foreground text-sm">
          Reference matrix showing which permissions are granted to each role.
        </p>
      </div>

      <RolesPermissionsMatrix />
    </div>
  );
}
