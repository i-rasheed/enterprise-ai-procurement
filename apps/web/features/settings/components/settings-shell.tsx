"use client";

import {
  Building2,
  KeyRound,
  Palette,
  ScrollText,
  Shield,
  ShieldCheck,
  UserCircle,
  Bell,
  Users,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import type { SettingsTab } from "../types";
import { ApiKeysSettingsPanel } from "./api-keys-settings-panel";
import { AuditLogsSettingsPanel } from "./audit-logs-settings-panel";
import { BrandingSettingsPanel } from "./branding-settings-panel";
import { NotificationSettingsPanel } from "./notification-settings-panel";
import { OrganizationSettingsPanel } from "./organization-settings-panel";
import { PermissionsSettingsPanel } from "./permissions-settings-panel";
import { ProfileSettingsPanel } from "./profile-settings-panel";
import { RolesSettingsPanel } from "./roles-settings-panel";
import { SecuritySettingsPanel } from "./security-settings-panel";

const TABS: Array<{
  id: SettingsTab;
  label: string;
  icon: typeof UserCircle;
}> = [
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "roles", label: "Roles", icon: Users },
  { id: "permissions", label: "Permissions", icon: ShieldCheck },
  { id: "api-keys", label: "API keys", icon: KeyRound },
  { id: "security", label: "Security", icon: Shield },
  { id: "audit-logs", label: "Audit logs", icon: ScrollText },
];

export function SettingsShell() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <nav
        aria-label="Settings sections"
        className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-visible"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="min-w-0">
        {activeTab === "profile" ? <ProfileSettingsPanel /> : null}
        {activeTab === "organization" ? <OrganizationSettingsPanel /> : null}
        {activeTab === "branding" ? <BrandingSettingsPanel /> : null}
        {activeTab === "notifications" ? <NotificationSettingsPanel /> : null}
        {activeTab === "roles" ? <RolesSettingsPanel /> : null}
        {activeTab === "permissions" ? <PermissionsSettingsPanel /> : null}
        {activeTab === "api-keys" ? <ApiKeysSettingsPanel /> : null}
        {activeTab === "security" ? <SecuritySettingsPanel /> : null}
        {activeTab === "audit-logs" ? <AuditLogsSettingsPanel /> : null}
      </div>
    </div>
  );
}
