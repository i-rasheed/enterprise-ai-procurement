import type { Role } from "@/lib/api/types";

import type { Invoice, InvoiceTimelineEvent, MatchStatus } from "../types";

export function canViewInvoices(role?: Role | null): boolean {
  return (
    role === "ADMIN" ||
    role === "FINANCE" ||
    role === "PROCUREMENT_MANAGER" ||
    role === "USER"
  );
}

export function canApproveInvoices(role?: Role | null): boolean {
  return role === "ADMIN" || role === "FINANCE";
}

export function canPayInvoices(role?: Role | null): boolean {
  return role === "ADMIN" || role === "FINANCE";
}

export function formatInvoiceStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function formatMatchStatus(status: MatchStatus | string): string {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function canMatchInvoice(invoice: Invoice): boolean {
  return invoice.status === "SUBMITTED";
}

export function canApproveInvoice(invoice: Invoice): boolean {
  return (
    invoice.status === "MATCHED" &&
    invoice.matchingResult?.matchStatus === "MATCHED"
  );
}

export function canRejectInvoice(invoice: Invoice): boolean {
  return invoice.status === "SUBMITTED" || invoice.status === "MATCHED";
}

export function canMarkInvoicePaid(invoice: Invoice): boolean {
  return invoice.status === "APPROVED";
}

export function buildInvoiceTimeline(invoice: Invoice): InvoiceTimelineEvent[] {
  const events: InvoiceTimelineEvent[] = [
    {
      id: "created",
      title: "Invoice created",
      description: `${invoice.invoiceNumber} from ${invoice.vendor.name}`,
      timestamp: invoice.createdAt,
      status: "completed",
    },
  ];

  if (invoice.status !== "DRAFT") {
    events.push({
      id: "submitted",
      title: "Submitted for matching",
      description: "Invoice submitted for three-way match review",
      timestamp: invoice.updatedAt,
      status: "completed",
    });
  }

  if (invoice.matchingResult) {
    const matched = invoice.matchingResult.matchStatus === "MATCHED";
    events.push({
      id: "matched",
      title: matched ? "Three-way match passed" : "Matching completed with discrepancies",
      description: `${formatMatchStatus(invoice.matchingResult.matchStatus)} · Matched by ${invoice.matchingResult.matchedBy.firstName} ${invoice.matchingResult.matchedBy.lastName}`,
      timestamp: invoice.matchingResult.matchedAt,
      status: matched ? "completed" : "rejected",
    });
  }

  if (invoice.status === "MATCHED") {
    events.push({
      id: "awaiting-approval",
      title: "Awaiting approval",
      description: "Matched invoice ready for finance approval",
      timestamp: invoice.updatedAt,
      status: "current",
    });
  }

  if (invoice.status === "APPROVED") {
    events.push({
      id: "approved",
      title: "Invoice approved",
      description: "Approved for payment",
      timestamp: invoice.updatedAt,
      status: "completed",
    });
  }

  if (invoice.status === "REJECTED") {
    events.push({
      id: "rejected",
      title: "Invoice rejected",
      description: invoice.notes ?? "Invoice was rejected",
      timestamp: invoice.updatedAt,
      status: "rejected",
    });
  }

  if (invoice.status === "PAID") {
    events.push({
      id: "paid",
      title: "Marked as paid",
      description: "Payment recorded for this invoice",
      timestamp: invoice.updatedAt,
      status: "completed",
    });
  }

  return events.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}
