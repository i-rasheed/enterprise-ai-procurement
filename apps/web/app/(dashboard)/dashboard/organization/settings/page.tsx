"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { OrganizationSettingsForm } from "@/features/organization/components/organization-settings-form";
import { OrganizationShell } from "@/features/organization/components/organization-shell";
import { useAuthStore } from "@/stores/auth-store";

export default function OrganizationSettingsPage() {
  const userRole = useAuthStore((state) => state.user?.role);

  if (userRole !== "ADMIN") {
    return (
      <OrganizationShell
        title="Settings"
        description="Organisation settings and danger zone actions."
      >
        <EmptyState
          title="Admin access required"
          description="Only administrators can manage organisation settings."
        />
      </OrganizationShell>
    );
  }

  return (
    <OrganizationShell
      title="Settings"
      description="Organisation settings and danger zone actions."
    >
      <OrganizationSettingsForm />
    </OrganizationShell>
  );
}
