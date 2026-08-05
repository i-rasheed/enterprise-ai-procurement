"use client";

import { useParams, useRouter } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeaderSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceActionsPanel } from "@/features/invoices/components/invoice-actions-panel";
import { InvoiceDetailHeader } from "@/features/invoices/components/invoice-detail-header";
import { InvoiceItemsPanel } from "@/features/invoices/components/invoice-items-panel";
import { InvoiceTimeline } from "@/features/invoices/components/invoice-timeline";
import { MatchingResultsPanel } from "@/features/invoices/components/matching-results-panel";
import {
  canApproveInvoices,
  canViewInvoices,
} from "@/features/invoices/config/permissions";
import {
  useInvoice,
  useMatchingResult,
} from "@/features/invoices/hooks/use-invoices";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const userRole = useAuthStore((state) => state.user?.role);
  const invoiceQuery = useInvoice(id);
  const matchingQuery = useMatchingResult(
    id,
    Boolean(invoiceQuery.data?.matchingResult) ||
      invoiceQuery.data?.status === "SUBMITTED" ||
      invoiceQuery.data?.status === "MATCHED" ||
      invoiceQuery.data?.status === "APPROVED" ||
      invoiceQuery.data?.status === "PAID",
  );

  if (!canViewInvoices(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to view invoices."
        action={{ label: "Back to dashboard", href: "/dashboard" }}
      />
    );
  }

  if (invoiceQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (invoiceQuery.isError || !invoiceQuery.data) {
    return (
      <EmptyState
        title="Invoice not found"
        description={
          invoiceQuery.error instanceof ApiClientError
            ? invoiceQuery.error.message
            : "This invoice could not be loaded."
        }
        action={{ label: "Back to invoices", href: "/dashboard/invoices" }}
      />
    );
  }

  const invoice = invoiceQuery.data;
  const matchingResult =
    invoice.matchingResult ?? matchingQuery.data ?? null;

  return (
    <div className="space-y-6">
      <InvoiceDetailHeader invoice={invoice} />

      <InvoiceItemsPanel invoice={invoice} />

      <div className="grid gap-6 xl:grid-cols-2">
        <MatchingResultsPanel
          matchingResult={matchingResult}
          isLoading={matchingQuery.isLoading && !invoice.matchingResult}
        />
        <InvoiceTimeline invoice={invoice} />
      </div>

      <InvoiceActionsPanel
        invoice={invoice}
        canApprove={canApproveInvoices(userRole)}
      />

      {invoice.notes ? (
        <div className="rounded-xl border p-4">
          <h3 className="mb-2 font-semibold">Notes</h3>
          <p className="text-muted-foreground text-sm whitespace-pre-wrap">
            {invoice.notes}
          </p>
        </div>
      ) : null}

      <Button type="button" variant="outline" onClick={() => router.back()}>
        Back
      </Button>
    </div>
  );
}
