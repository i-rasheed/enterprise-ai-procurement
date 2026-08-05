import { PageHeader } from "@/components/shared/page-header";
import { VendorPurchaseOrdersPanel } from "@/features/vendor-portal/components/vendor-purchase-orders-panel";

export default function VendorPurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Review and acknowledge purchase orders issued to your company."
      />
      <VendorPurchaseOrdersPanel />
    </div>
  );
}
