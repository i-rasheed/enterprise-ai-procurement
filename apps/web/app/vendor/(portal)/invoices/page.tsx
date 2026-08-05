import { PageHeader } from "@/components/shared/page-header";
import { VendorInvoicesPanel } from "@/features/vendor-portal/components/vendor-invoices-panel";

export default function VendorInvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Track submitted invoices and payment status."
      />
      <VendorInvoicesPanel />
    </div>
  );
}
