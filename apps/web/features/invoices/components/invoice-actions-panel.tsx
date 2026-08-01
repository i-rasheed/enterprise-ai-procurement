"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  approveInvoiceSchema,
  rejectInvoiceSchema,
  markPaidSchema,
  type ApproveInvoiceFormValues,
  type RejectInvoiceFormValues,
  type MarkPaidFormValues,
} from "@/features/invoices/schemas/invoice.schema";
import {
  canApproveInvoice,
  canMarkInvoicePaid,
  canMatchInvoice,
  canRejectInvoice,
} from "@/features/invoices/config/permissions";
import {
  useApproveInvoice,
  useMatchInvoice,
  useMarkInvoicePaid,
  useRejectInvoice,
} from "@/features/invoices/hooks/use-invoices";
import type { Invoice } from "@/features/invoices/types";

type InvoiceActionsPanelProps = {
  invoice: Invoice;
  canApprove: boolean;
};

export function InvoiceActionsPanel({
  invoice,
  canApprove,
}: InvoiceActionsPanelProps) {
  const matchInvoice = useMatchInvoice(invoice.id);
  const approveInvoice = useApproveInvoice(invoice.id);
  const rejectInvoice = useRejectInvoice(invoice.id);
  const markPaid = useMarkInvoicePaid(invoice.id);

  const approveForm = useForm<ApproveInvoiceFormValues>({
    resolver: zodResolver(approveInvoiceSchema),
    defaultValues: { notes: "" },
  });

  const rejectForm = useForm<RejectInvoiceFormValues>({
    resolver: zodResolver(rejectInvoiceSchema),
    defaultValues: { reason: "" },
  });

  const payForm = useForm<MarkPaidFormValues>({
    resolver: zodResolver(markPaidSchema),
    defaultValues: {
      paidDate: new Date().toISOString().slice(0, 10),
      paymentReference: "",
    },
  });

  const showMatch = canApprove && canMatchInvoice(invoice);
  const showApprove = canApprove && canApproveInvoice(invoice);
  const showReject = canApprove && canRejectInvoice(invoice);
  const showPay = canApprove && canMarkInvoicePaid(invoice);

  const handleMatch = () => {
    if (
      window.confirm(
        `Run three-way matching for ${invoice.invoiceNumber}?`,
      )
    ) {
      matchInvoice.mutate();
    }
  };

  const handleApprove = approveForm.handleSubmit((values) => {
    approveInvoice.mutate(values);
  });

  const handleReject = rejectForm.handleSubmit((values) => {
    if (
      window.confirm(
        `Reject ${invoice.invoiceNumber}? This action cannot be undone.`,
      )
    ) {
      rejectInvoice.mutate(values);
    }
  });

  const handlePay = payForm.handleSubmit((values) => {
    if (
      window.confirm(
        `Mark ${invoice.invoiceNumber} as paid?`,
      )
    ) {
      markPaid.mutate(values);
    }
  });

  if (
    invoice.status === "PAID" ||
    invoice.status === "REJECTED" ||
    invoice.status === "DRAFT" ||
    (!showMatch && !showApprove && !showReject && !showPay)
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            {invoice.status === "PAID"
              ? "This invoice has been paid."
              : invoice.status === "REJECTED"
                ? "This invoice was rejected."
                : invoice.status === "DRAFT"
                  ? "Draft invoices must be submitted before finance review."
                  : "No actions available for the current status."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showMatch ? (
        <Card>
          <CardHeader>
            <CardTitle>Run three-way match</CardTitle>
            <CardDescription>
              Compare invoice line items against the purchase order and goods
              receipt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              onClick={handleMatch}
              disabled={matchInvoice.isPending}
            >
              {matchInvoice.isPending ? "Matching..." : "Run matching"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {showApprove ? (
        <Card>
          <CardHeader>
            <CardTitle>Approve invoice</CardTitle>
            <CardDescription>
              Approve this matched invoice for payment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleApprove} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="approveNotes">Approval notes</Label>
                <textarea
                  id="approveNotes"
                  rows={3}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Optional approval notes..."
                  disabled={approveInvoice.isPending}
                  {...approveForm.register("notes")}
                />
              </div>
              <Button type="submit" disabled={approveInvoice.isPending}>
                {approveInvoice.isPending ? "Approving..." : "Approve invoice"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {showReject ? (
        <Card>
          <CardHeader>
            <CardTitle>Reject invoice</CardTitle>
            <CardDescription>
              Reject this invoice with a reason for the vendor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejectReason">Rejection reason</Label>
                <textarea
                  id="rejectReason"
                  rows={3}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Explain why this invoice is rejected..."
                  disabled={rejectInvoice.isPending}
                  {...rejectForm.register("reason")}
                />
                {rejectForm.formState.errors.reason ? (
                  <p className="text-destructive text-sm">
                    {rejectForm.formState.errors.reason.message}
                  </p>
                ) : null}
              </div>
              <Button
                type="submit"
                variant="destructive"
                disabled={rejectInvoice.isPending}
              >
                {rejectInvoice.isPending ? "Rejecting..." : "Reject invoice"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {showPay ? (
        <Card>
          <CardHeader>
            <CardTitle>Mark as paid</CardTitle>
            <CardDescription>
              Record payment for this approved invoice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePay} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paidDate">Payment date</Label>
                <Input
                  id="paidDate"
                  type="date"
                  disabled={markPaid.isPending}
                  {...payForm.register("paidDate")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentReference">Payment reference</Label>
                <Input
                  id="paymentReference"
                  placeholder="PAY-2026-000001"
                  disabled={markPaid.isPending}
                  {...payForm.register("paymentReference")}
                />
              </div>
              <Button type="submit" disabled={markPaid.isPending}>
                {markPaid.isPending ? "Recording..." : "Mark as paid"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
