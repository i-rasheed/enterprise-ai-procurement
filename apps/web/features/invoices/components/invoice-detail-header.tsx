import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "@/features/invoices/components/invoice-status-badge";
import { MatchStatusBadge } from "@/features/invoices/components/match-status-badge";
import type { Invoice } from "@/features/invoices/types";

type InvoiceDetailHeaderProps = {
  invoice: Invoice;
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}

export function InvoiceDetailHeader({ invoice }: InvoiceDetailHeaderProps) {
  return (
    <div className="space-y-4 border-b pb-6">
      <PageHeader
        title={invoice.invoiceNumber}
        description={`${invoice.vendor.name} · Due ${new Date(invoice.dueDate).toLocaleDateString()}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <InvoiceStatusBadge status={invoice.status} />
            {invoice.matchingResult ? (
              <MatchStatusBadge status={invoice.matchingResult.matchStatus} />
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/purchase-orders/${invoice.purchaseOrderId}`}>
                View PO
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/dashboard/goods-receipts/${invoice.goodsReceiptId}`}
              >
                View GRN
              </Link>
            </Button>
          </div>
        }
        className="border-0 pb-0"
      />
      <dl className="text-muted-foreground grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-medium text-foreground">Total amount</dt>
          <dd>{formatCurrency(invoice.totalAmount, invoice.currency)}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Subtotal</dt>
          <dd>{formatCurrency(invoice.subtotal, invoice.currency)}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Tax</dt>
          <dd>{formatCurrency(invoice.taxAmount, invoice.currency)}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Payment terms</dt>
          <dd>{invoice.paymentTerms ?? "—"}</dd>
        </div>
      </dl>
    </div>
  );
}
