"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RfqForm } from "@/features/rfqs/components/rfq-form";
import { canManageRfqs } from "@/features/rfqs/config/permissions";
import { useCreateRfq } from "@/features/rfqs/hooks/use-rfqs";
import { useProcurementRequests } from "@/features/procurement/hooks/use-procurement";
import { useAuthStore } from "@/stores/auth-store";

export default function NewRfqPage() {
  const userRole = useAuthStore((state) => state.user?.role);
  const canManage = canManageRfqs(userRole);
  const createRfq = useCreateRfq();
  const approvedRequestsQuery = useProcurementRequests({
    status: "APPROVED",
    page: 1,
    limit: 100,
  });

  if (!canManage) {
    return (
      <EmptyState
        title="Permission required"
        description="Only admins and procurement managers can create RFQs."
        action={{ label: "Back to RFQs", href: "/dashboard/rfqs" }}
      />
    );
  }

  const approvedRequests =
    approvedRequestsQuery.data?.requests.filter(
      (request) => request.status === "APPROVED",
    ) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create RFQ"
        description="Start a draft request for quotation from an approved procurement request."
        actions={
          <Link
            href="/dashboard/rfqs"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="size-4" />
            Back to list
          </Link>
        }
      />

      {approvedRequests.length === 0 && !approvedRequestsQuery.isLoading ? (
        <EmptyState
          title="No approved procurement requests"
          description="An RFQ must be linked to an approved procurement request."
          action={{ label: "View procurement", href: "/dashboard/procurement" }}
        />
      ) : (
        <RfqForm
          approvedRequests={approvedRequests}
          submitLabel="Create draft"
          isSubmitting={createRfq.isPending}
          onSubmit={(values) => createRfq.mutate(values)}
        />
      )}
    </div>
  );
}
