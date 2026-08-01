"use client";

import { useParams } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { InvoiceDetailHeader } from "@/features/invoices/components/invoice-detail-header";
import { InvoiceItemsPanel } from "@/features/invoices/components/invoice-items-panel";
import { InvoiceTimeline } from "@/features/invoices/components/invoice-timeline";
import { useVendorInvoice } from "@/features/vendor-portal/hooks/use-vendor-portal";
import { useVendorContextStore } from "@/features/vendor-portal/stores/vendor-context-store";

export default function VendorInvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const vendor = useVendorContextStore((state) => state.vendor);
  const invoiceQuery = useVendorInvoice(params.id);
  const invoice = invoiceQuery.data;

  if (invoiceQuery.isLoading) {
    return <p className="text-muted-foreground text-sm">Loading invoice...</p>;
  }

  if (!invoice || invoice.vendor.id !== vendor?.id) {
    return (
      <EmptyState
        title="Invoice not found"
        description="This invoice is unavailable."
        action={{ label: "Back to invoices", href: "/vendor/invoices" }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <InvoiceDetailHeader invoice={invoice} />
      <InvoiceItemsPanel invoice={invoice} />
      <InvoiceTimeline invoice={invoice} />
      {invoice.notes ? (
        <div className="rounded-xl border p-4">
          <h3 className="mb-2 font-semibold">Notes</h3>
          <p className="text-muted-foreground text-sm whitespace-pre-wrap">
            {invoice.notes}
          </p>
        </div>
      ) : null}
    </div>
  );
}
