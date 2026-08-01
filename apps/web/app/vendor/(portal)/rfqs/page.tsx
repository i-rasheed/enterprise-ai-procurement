import { PageHeader } from "@/components/shared/page-header";
import { VendorRfqsPanel } from "@/features/vendor-portal/components/vendor-rfqs-panel";

export default function VendorRfqsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="RFQs"
        description="Published requests where your company has been invited to respond."
      />
      <VendorRfqsPanel />
    </div>
  );
}
