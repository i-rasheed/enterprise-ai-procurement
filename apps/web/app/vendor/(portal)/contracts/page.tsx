import { PageHeader } from "@/components/shared/page-header";
import { VendorContractsPanel } from "@/features/vendor-portal/components/vendor-contracts-panel";

export default function VendorContractsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts"
        description="View active and historical contracts with the buyer."
      />
      <VendorContractsPanel />
    </div>
  );
}
