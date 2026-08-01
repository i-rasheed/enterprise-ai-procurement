"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProcurementRequestForm } from "@/features/procurement/components/procurement-request-form";
import {
  useProcurementRequest,
  useUpdateProcurementRequest,
} from "@/features/procurement/hooks/use-procurement";
import { canEditRequest } from "@/features/procurement/utils/formatters";
import { ApiClientError } from "@/lib/api";

export default function EditProcurementPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const requestQuery = useProcurementRequest(id);
  const updateRequest = useUpdateProcurementRequest(id);

  if (requestQuery.isLoading) {
    return null;
  }

  if (requestQuery.isError || !requestQuery.data) {
    return (
      <EmptyState
        title="Procurement request not found"
        description={
          requestQuery.error instanceof ApiClientError
            ? requestQuery.error.message
            : "This request could not be loaded."
        }
        action={{ label: "Back to procurement", href: "/dashboard/procurement" }}
      />
    );
  }

  const request = requestQuery.data;

  if (!canEditRequest(request)) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit procurement request"
          description="Only draft requests can be edited."
        />
        <EmptyState
          title="Request is read-only"
          description="Submitted requests cannot be modified."
          action={{
            label: "View request",
            href: `/dashboard/procurement/${id}`,
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit procurement request"
        description="Update draft request details."
        actions={
          <Link
            href={`/dashboard/procurement/${id}`}
            className="text-muted-foreground hover:text-foreground text-sm hover:underline"
          >
            Cancel
          </Link>
        }
      />

      <ProcurementRequestForm
        request={request}
        submitLabel="Save changes"
        isSubmitting={updateRequest.isPending}
        onSubmit={(values) =>
          updateRequest.mutate(values, {
            onSuccess: () => router.push(`/dashboard/procurement/${id}`),
          })
        }
        onCancel={() => router.push(`/dashboard/procurement/${id}`)}
      />
    </div>
  );
}
