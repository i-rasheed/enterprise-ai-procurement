"use client";

import { Printer } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PoStatusBadge } from "@/features/purchase-orders/components/po-status-badge";
import type { PurchaseOrder } from "@/features/purchase-orders/types";
import { useAuthStore } from "@/stores/auth-store";

type PoPdfPreviewProps = {
  po: PurchaseOrder;
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}

export function PoPdfPreview({ po }: PoPdfPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const organisation = useAuthStore((state) => state.organisation);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="print:border-0 print:shadow-none">
      <CardHeader className="print:hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>PDF preview</CardTitle>
            <CardDescription>
              Print-friendly purchase order document. Use Print to save as PDF.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="size-4" />
            Print / Save PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="print:p-0">
        <div
          ref={printRef}
          id="po-document"
          className="bg-background mx-auto max-w-3xl rounded-lg border p-8 shadow-sm print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none"
        >
          <header className="mb-8 flex items-start justify-between border-b pb-6">
            <div>
              <p className="text-muted-foreground text-sm uppercase tracking-wide">
                Purchase Order
              </p>
              <h2 className="mt-1 text-2xl font-bold">{po.poNumber}</h2>
              <div className="mt-2 print:hidden">
                <PoStatusBadge status={po.status} />
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold">{organisation?.name ?? "Organisation"}</p>
              <p className="text-muted-foreground mt-1">
                Created {new Date(po.createdAt).toLocaleDateString()}
              </p>
              {po.issueDate ? (
                <p className="text-muted-foreground">
                  Issued {new Date(po.issueDate).toLocaleDateString()}
                </p>
              ) : null}
            </div>
          </header>

          <div className="mb-8 grid gap-6 sm:grid-cols-2">
            <section>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide">
                Vendor
              </h3>
              <p className="font-medium">{po.vendor.name}</p>
              <p className="text-muted-foreground text-sm">{po.vendor.email}</p>
            </section>
            <section>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide">
                Delivery
              </h3>
              <p className="text-sm">
                Expected:{" "}
                {new Date(po.expectedDeliveryDate).toLocaleDateString()}
              </p>
              {po.deliveryAddress ? (
                <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">
                  {po.deliveryAddress}
                </p>
              ) : null}
            </section>
          </div>

          <table className="mb-8 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left font-semibold">Description</th>
                <th className="py-2 text-right font-semibold">Qty</th>
                <th className="py-2 text-right font-semibold">Unit price</th>
                <th className="py-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {po.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2 pr-4">{item.description}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">
                    {formatCurrency(item.unitPrice, po.currency)}
                  </td>
                  <td className="py-2 text-right">
                    {formatCurrency(item.totalPrice, po.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="pt-4 text-right font-semibold">
                  Grand total
                </td>
                <td className="pt-4 text-right text-lg font-bold">
                  {formatCurrency(po.totalAmount, po.currency)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="grid gap-4 text-sm sm:grid-cols-2">
            {po.paymentTerms ? (
              <section>
                <h3 className="mb-1 font-semibold">Payment terms</h3>
                <p className="text-muted-foreground">{po.paymentTerms}</p>
              </section>
            ) : null}
            {po.notes ? (
              <section>
                <h3 className="mb-1 font-semibold">Notes</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {po.notes}
                </p>
              </section>
            ) : null}
          </div>

          <footer className="text-muted-foreground mt-10 border-t pt-4 text-xs">
            <p>
              Prepared by {po.issuedBy.firstName} {po.issuedBy.lastName} (
              {po.issuedBy.email})
            </p>
            <p className="mt-1">
              Status: {po.status.replaceAll("_", " ")} · Procurement request
              linked
            </p>
          </footer>
        </div>
      </CardContent>
    </Card>
  );
}
