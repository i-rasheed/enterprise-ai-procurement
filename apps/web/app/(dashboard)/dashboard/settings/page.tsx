"use client";

import { PageHeader } from "@/components/shared/page-header";
import { SettingsShell } from "@/features/settings/components/settings-shell";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile, organisation, security, notifications, roles, and audit logs."
      />
      <SettingsShell />
    </div>
  );
}
