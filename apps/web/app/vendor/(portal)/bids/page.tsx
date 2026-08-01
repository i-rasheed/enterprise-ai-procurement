import { PageHeader } from "@/components/shared/page-header";
import { VendorBidsPanel } from "@/features/vendor-portal/components/vendor-bids-panel";

export default function VendorBidsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bids"
        description="Manage draft and submitted bids for invited RFQs."
      />
      <VendorBidsPanel />
    </div>
  );
}
