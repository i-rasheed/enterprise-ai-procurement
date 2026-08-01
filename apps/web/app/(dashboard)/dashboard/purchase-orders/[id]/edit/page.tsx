"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader, PageHeaderSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PoEditForm } from "@/features/purchase-orders/components/po-form";
import {
  canEditPurchaseOrder,
  canManagePurchaseOrders,
} from "@/features/purchase-orders/config/permissions";
import {
  usePurchaseOrder,
  useUpdatePurchaseOrder,
} from "@/features/purchase-orders/hooks/use-purchase-orders";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function EditPurchaseOrderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const userRole = useAuthStore((state) => state.user?.role);
  const poQuery = usePurchaseOrder(id);
  const updatePo = useUpdatePurchaseOrder(id);

  if (!canManagePurchaseOrders(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to edit purchase orders."
        action={{
          label: "Back to purchase orders",
          href: "/dashboard/purchase-orders",
        }}
      />
    );
  }

  if (poQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
      </div>
    );
  }

  if (poQuery.isError || !poQuery.data) {
    return (
      <EmptyState
        title="Purchase order not found"
        description={
          poQuery.error instanceof ApiClientError
            ? poQuery.error.message
            : "This purchase order could not be loaded."
        }
        action={{
          label: "Back to purchase orders",
          href: "/dashboard/purchase-orders",
        }}
      />
    );
  }

  const po = poQuery.data;

  if (!canEditPurchaseOrder(po)) {
    return (
      <EmptyState
        title="Cannot edit purchase order"
        description="Only draft purchase orders can be edited."
        action={{
          label: "View purchase order",
          href: `/dashboard/purchase-orders/${id}`,
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${po.poNumber}`}
        description="Update draft purchase order details."
        actions={
          <Button asChild variant="outline">
            <Link href={`/dashboard/purchase-orders/${id}`}>Cancel</Link>
          </Button>
        }
      />

      <PoEditForm
        po={po}
        submitLabel="Save changes"
        isSubmitting={updatePo.isPending}
        onSubmit={(values) => updatePo.mutate(values)}
        onCancel={() => router.push(`/dashboard/purchase-orders/${id}`)}
      />
    </div>
  );
}
