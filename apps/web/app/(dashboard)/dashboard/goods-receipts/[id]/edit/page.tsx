"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader, PageHeaderSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { GrnEditForm } from "@/features/goods-receipts/components/grn-form";
import {
  canEditGoodsReceipt,
  canManageGoodsReceipts,
} from "@/features/goods-receipts/config/permissions";
import {
  useGoodsReceipt,
  useUpdateGoodsReceipt,
} from "@/features/goods-receipts/hooks/use-goods-receipts";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function EditGoodsReceiptPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const userRole = useAuthStore((state) => state.user?.role);
  const grnQuery = useGoodsReceipt(id);
  const updateGrn = useUpdateGoodsReceipt(id);

  if (!canManageGoodsReceipts(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to edit goods receipts."
        action={{
          label: "Back to goods receipts",
          href: "/dashboard/goods-receipts",
        }}
      />
    );
  }

  if (grnQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
      </div>
    );
  }

  if (grnQuery.isError || !grnQuery.data) {
    return (
      <EmptyState
        title="Goods receipt not found"
        description={
          grnQuery.error instanceof ApiClientError
            ? grnQuery.error.message
            : "This goods receipt could not be loaded."
        }
        action={{
          label: "Back to goods receipts",
          href: "/dashboard/goods-receipts",
        }}
      />
    );
  }

  const grn = grnQuery.data;

  if (!canEditGoodsReceipt(grn)) {
    return (
      <EmptyState
        title="Cannot edit goods receipt"
        description="Only draft goods receipts can be edited."
        action={{
          label: "View goods receipt",
          href: `/dashboard/goods-receipts/${id}`,
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${grn.receiptNumber}`}
        description="Update draft goods receipt details."
        actions={
          <Button asChild variant="outline">
            <Link href={`/dashboard/goods-receipts/${id}`}>Cancel</Link>
          </Button>
        }
      />

      <GrnEditForm
        grn={grn}
        submitLabel="Save changes"
        isSubmitting={updateGrn.isPending}
        onSubmit={(values) => updateGrn.mutate(values)}
        onCancel={() => router.push(`/dashboard/goods-receipts/${id}`)}
      />
    </div>
  );
}
