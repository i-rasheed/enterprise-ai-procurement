"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RfqForm } from "@/features/rfqs/components/rfq-form";
import { canManageRfqs } from "@/features/rfqs/config/permissions";
import { useRfq, useUpdateRfq } from "@/features/rfqs/hooks/use-rfqs";
import { useProcurementRequests } from "@/features/procurement/hooks/use-procurement";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function EditRfqPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const userRole = useAuthStore((state) => state.user?.role);
  const canManage = canManageRfqs(userRole);
  const rfqQuery = useRfq(id);
  const updateRfq = useUpdateRfq(id);
  const approvedRequestsQuery = useProcurementRequests({
    status: "APPROVED",
    page: 1,
    limit: 100,
  });

  if (!canManage) {
    return (
      <EmptyState
        title="Permission required"
        description="Only admins and procurement managers can edit RFQs."
        action={{ label: "Back to RFQs", href: "/dashboard/rfqs" }}
      />
    );
  }

  if (rfqQuery.isLoading) {
    return null;
  }

  if (rfqQuery.isError || !rfqQuery.data) {
    return (
      <EmptyState
        title="RFQ not found"
        description={
          rfqQuery.error instanceof ApiClientError
            ? rfqQuery.error.message
            : "This RFQ could not be loaded."
        }
        action={{ label: "Back to RFQs", href: "/dashboard/rfqs" }}
      />
    );
  }

  const rfq = rfqQuery.data;

  if (rfq.status !== "DRAFT" && rfq.status !== "PUBLISHED") {
    return (
      <EmptyState
        title="RFQ is read-only"
        description="Only draft and published RFQs can be edited."
        action={{ label: "View RFQ", href: `/dashboard/rfqs/${id}` }}
      />
    );
  }

  const approvedRequests = approvedRequestsQuery.data?.requests ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit RFQ"
        description={
          rfq.status === "PUBLISHED"
            ? "Published RFQs only allow closing date changes."
            : "Update draft RFQ details."
        }
        actions={
          <Link
            href={`/dashboard/rfqs/${id}`}
            className="text-muted-foreground hover:text-foreground text-sm hover:underline"
          >
            Cancel
          </Link>
        }
      />

      <RfqForm
        rfq={rfq}
        approvedRequests={approvedRequests}
        submitLabel="Save changes"
        isSubmitting={updateRfq.isPending}
        lockProcurementRequest
        onSubmit={(values) => {
          const payload =
            rfq.status === "PUBLISHED"
              ? { closingDate: values.closingDate }
              : values;
          updateRfq.mutate(payload, {
            onSuccess: () => router.push(`/dashboard/rfqs/${id}`),
          });
        }}
        onCancel={() => router.push(`/dashboard/rfqs/${id}`)}
      />
    </div>
  );
}
