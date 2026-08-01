import { PageHeader } from "@/components/shared/page-header";
import { VendorAssistantPanel } from "@/features/vendor-portal/components/vendor-assistant-panel";

export default function VendorAssistantPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Assistant"
        description="Get help with RFQs, bids, purchase orders, and invoices."
      />
      <VendorAssistantPanel />
    </div>
  );
}
