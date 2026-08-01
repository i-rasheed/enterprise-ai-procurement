"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeaderSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RfqActionsPanel } from "@/features/rfqs/components/rfq-actions-panel";
import { RfqAttachmentsPanel } from "@/features/rfqs/components/rfq-attachments-panel";
import { RfqDetailHeader } from "@/features/rfqs/components/rfq-detail-header";
import { RfqQuestionsPanel } from "@/features/rfqs/components/rfq-questions-panel";
import { RfqVendorsPanel } from "@/features/rfqs/components/rfq-vendors-panel";
import {
  canDeleteRfq,
  canInviteToRfq,
  canInviteVendors,
  canManageRfqs,
} from "@/features/rfqs/config/permissions";
import { useDeleteRfq, useRfq } from "@/features/rfqs/hooks/use-rfqs";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function RfqDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const userRole = useAuthStore((state) => state.user?.role);
  const canManage = canManageRfqs(userRole);
  const rfqQuery = useRfq(id);
  const deleteRfq = useDeleteRfq();

  if (rfqQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
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
  const canInvite = canInviteVendors(userRole) && canInviteToRfq(rfq);

  const handleDelete = () => {
    if (window.confirm(`Delete RFQ "${rfq.title}"? This action cannot be undone.`)) {
      deleteRfq.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <RfqDetailHeader rfq={rfq} />

      <div className="grid gap-6 xl:grid-cols-2">
        <RfqVendorsPanel rfq={rfq} canInvite={canInvite} />
        <RfqActionsPanel rfq={rfq} canManage={canManage} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <RfqQuestionsPanel canManage={canManage} />
        <RfqAttachmentsPanel canManage={canManage} />
      </div>

      <div className="flex flex-wrap gap-2">
        {canManage && rfq.status === "DRAFT" ? (
          <>
            <Button asChild variant="outline">
              <Link href={`/dashboard/rfqs/${id}/edit`}>Edit RFQ</Link>
            </Button>
            {canDeleteRfq(rfq) ? (
              <Button
                type="button"
                variant="destructive"
                disabled={deleteRfq.isPending}
                onClick={handleDelete}
              >
                {deleteRfq.isPending ? "Deleting..." : "Delete draft"}
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
