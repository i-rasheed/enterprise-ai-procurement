"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeaderSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApprovalStatusPanel } from "@/features/procurement/components/approval-status-panel";
import { ProcurementAttachmentsPanel } from "@/features/procurement/components/procurement-attachments-panel";
import { ProcurementDetailHeader } from "@/features/procurement/components/procurement-detail-header";
import { ProcurementItemsPanel } from "@/features/procurement/components/procurement-items-panel";
import { ProcurementTimeline } from "@/features/procurement/components/procurement-timeline";
import { SubmitProcurementPanel } from "@/features/procurement/components/submit-procurement-panel";
import {
  useApprovalHistory,
  useDeleteProcurementRequest,
  useProcurementRequest,
} from "@/features/procurement/hooks/use-procurement";
import {
  buildTimelineEvents,
  canDeleteRequest,
  canEditRequest,
} from "@/features/procurement/utils/formatters";
import { ApiClientError } from "@/lib/api";

export default function ProcurementDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const requestQuery = useProcurementRequest(id);
  const approvalQuery = useApprovalHistory(
    id,
    requestQuery.data?.status !== "DRAFT",
  );
  const deleteRequest = useDeleteProcurementRequest();

  if (requestQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
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
  const canEdit = canEditRequest(request);
  const timelineEvents = buildTimelineEvents(request, approvalQuery.data);

  const handleDelete = () => {
    if (
      window.confirm(
        `Delete procurement request "${request.title}"? This action cannot be undone.`,
      )
    ) {
      deleteRequest.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <ProcurementDetailHeader request={request} />

      <div className="grid gap-4 lg:grid-cols-2">
        <CardSection title="Description">{request.description}</CardSection>
        <CardSection title="Justification">{request.justification}</CardSection>
      </div>

      <ProcurementItemsPanel request={request} canEdit={canEdit} />

      {canEdit ? <SubmitProcurementPanel request={request} /> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <ApprovalStatusPanel
          requestId={id}
          history={approvalQuery.data}
          isLoading={approvalQuery.isLoading}
        />
        <ProcurementTimeline events={timelineEvents} />
      </div>

      <ProcurementAttachmentsPanel request={request} canEdit={canEdit} />

      <div className="flex flex-wrap gap-2">
        {canEdit ? (
          <>
            <Button asChild variant="outline">
              <Link href={`/dashboard/procurement/${id}/edit`}>Edit request</Link>
            </Button>
            {canDeleteRequest(request) ? (
              <Button
                type="button"
                variant="destructive"
                disabled={deleteRequest.isPending}
                onClick={handleDelete}
              >
                {deleteRequest.isPending ? "Deleting..." : "Delete draft"}
              </Button>
            ) : null}
          </>
        ) : (
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        )}
      </div>
    </div>
  );
}

function CardSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border p-4">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm whitespace-pre-wrap">
        {children}
      </p>
    </div>
  );
}
