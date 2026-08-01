import { PageHeader } from "@/components/shared/page-header";
import { VendorProfilePanel } from "@/features/vendor-portal/components/vendor-profile-panel";

export default function VendorProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your account and vendor company details."
      />
      <VendorProfilePanel />
    </div>
  );
}
