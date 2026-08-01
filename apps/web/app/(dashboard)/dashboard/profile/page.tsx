import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ProfileSettings } from "@/features/auth/components/profile-settings";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile"
        description="Manage your account, security, and active sessions."
      />
      <ProfileSettings />
    </div>
  );
}
