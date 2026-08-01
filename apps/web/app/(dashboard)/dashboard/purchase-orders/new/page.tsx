"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader, TableSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { bidRepository } from "@/features/bids/api/bid.repository";
import { PoCreateForm } from "@/features/purchase-orders/components/po-form";
import { canManagePurchaseOrders } from "@/features/purchase-orders/config/permissions";
import { useCreatePurchaseOrder } from "@/features/purchase-orders/hooks/use-purchase-orders";
import { purchaseOrderRepository } from "@/features/purchase-orders/api/purchase-order.repository";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const userRole = useAuthStore((state) => state.user?.role);
  const createPo = useCreatePurchaseOrder();

  const awardsQuery = useQuery({
    queryKey: ["awards"],
    queryFn: () => bidRepository.listAwards(),
    staleTime: 60 * 1000,
  });

  const bidsQuery = useQuery({
    queryKey: ["bids", "list", { limit: 100 }],
    queryFn: () => bidRepository.list({ limit: 100 }),
    staleTime: 60 * 1000,
  });

  const posQuery = useQuery({
    queryKey: ["purchase-orders", "list", { limit: 100 }],
    queryFn: () => purchaseOrderRepository.list({ limit: 100 }),
    staleTime: 60 * 1000,
  });

  const awardOptions = useMemo(() => {
    const usedAwardIds = new Set(
      (posQuery.data?.purchaseOrders ?? [])
        .filter((po) => po.status !== "CANCELLED")
        .map((po) => po.awardId),
    );
    const bidMap = new Map(
      (bidsQuery.data?.bids ?? []).map((bid) => [bid.id, bid]),
    );

    return (awardsQuery.data?.awards ?? [])
      .filter((award) => !usedAwardIds.has(award.id))
      .map((award) => {
        const bid = bidMap.get(award.bidId);
        return {
          id: award.id,
          bidId: award.bidId,
          label: bid
            ? `${bid.bidNumber} · ${bid.vendor.name}`
            : `Award ${award.id.slice(0, 8)}`,
        };
      });
  }, [awardsQuery.data, bidsQuery.data, posQuery.data]);

  if (!canManagePurchaseOrders(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to create purchase orders."
        action={{ label: "Back to purchase orders", href: "/dashboard/purchase-orders" }}
      />
    );
  }

  const isLoading =
    awardsQuery.isLoading || bidsQuery.isLoading || posQuery.isLoading;
  const isError = awardsQuery.isError || bidsQuery.isError || posQuery.isError;
  const error =
    awardsQuery.error ?? bidsQuery.error ?? posQuery.error ?? undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create purchase order"
        description="Generate a draft PO from an awarded bid."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/purchase-orders">Back to list</Link>
          </Button>
        }
      />

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : isError ? (
        <EmptyState
          title="Unable to load awards"
          description={
            error instanceof ApiClientError
              ? error.message
              : "Something went wrong."
          }
          action={{
            label: "Retry",
            onClick: () => {
              awardsQuery.refetch();
              bidsQuery.refetch();
              posQuery.refetch();
            },
          }}
        />
      ) : awardOptions.length === 0 ? (
        <EmptyState
          title="No available awards"
          description="Award a bid first, or all awards already have active purchase orders."
          action={{ label: "View bids", href: "/dashboard/bids" }}
        />
      ) : (
        <PoCreateForm
          awards={awardOptions}
          submitLabel="Create draft PO"
          isSubmitting={createPo.isPending}
          onSubmit={(values) => createPo.mutate(values)}
          onCancel={() => router.push("/dashboard/purchase-orders")}
        />
      )}
    </div>
  );
}
