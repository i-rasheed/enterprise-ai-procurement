"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader, TableSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { bidRepository } from "@/features/bids/api/bid.repository";
import {
  ContractCreateForm,
  type SourceOption,
} from "@/features/contracts/components/contract-form";
import { canManageContracts } from "@/features/contracts/config/permissions";
import { useCreateContract } from "@/features/contracts/hooks/use-contracts";
import { purchaseOrderRepository } from "@/features/purchase-orders/api/purchase-order.repository";
import { useAuthStore } from "@/stores/auth-store";

const ELIGIBLE_PO_STATUSES = [
  "ISSUED",
  "ACKNOWLEDGED",
  "PARTIALLY_DELIVERED",
  "COMPLETED",
];

export default function NewContractPage() {
  const router = useRouter();
  const userRole = useAuthStore((state) => state.user?.role);
  const createContract = useCreateContract();

  const awardsQuery = useQuery({
    queryKey: ["awards"],
    queryFn: () => bidRepository.listAwards(),
    staleTime: 60 * 1000,
  });

  const posQuery = useQuery({
    queryKey: ["purchase-orders", "list", { limit: 100 }],
    queryFn: () => purchaseOrderRepository.list({ limit: 100 }),
    staleTime: 60 * 1000,
  });

  const bidsQuery = useQuery({
    queryKey: ["bids", "list", { limit: 100 }],
    queryFn: () => bidRepository.list({ limit: 100 }),
    staleTime: 60 * 1000,
  });

  const awardOptions: SourceOption[] = useMemo(() => {
    const bidMap = new Map(
      (bidsQuery.data?.bids ?? []).map((bid) => [bid.id, bid]),
    );
    return (awardsQuery.data?.awards ?? []).map((award) => {
      const bid = bidMap.get(award.bidId);
      return {
        id: award.id,
        label: bid
          ? `${bid.bidNumber} · ${bid.vendor.name}`
          : `Award ${award.id.slice(0, 8)}`,
      };
    });
  }, [awardsQuery.data, bidsQuery.data]);

  const poOptions: SourceOption[] = useMemo(
    () =>
      (posQuery.data?.purchaseOrders ?? [])
        .filter((po) => ELIGIBLE_PO_STATUSES.includes(po.status))
        .map((po) => ({
          id: po.id,
          label: `${po.poNumber} · ${po.vendor.name}`,
        })),
    [posQuery.data],
  );

  if (!canManageContracts(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to create contracts."
        action={{ label: "Back to contracts", href: "/dashboard/contracts" }}
      />
    );
  }

  const isLoading =
    awardsQuery.isLoading || posQuery.isLoading || bidsQuery.isLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create contract"
        description="Create a draft contract from an award or purchase order."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/contracts">Back to list</Link>
          </Button>
        }
      />

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : awardOptions.length === 0 && poOptions.length === 0 ? (
        <EmptyState
          title="No eligible sources"
          description="Award a bid or issue a purchase order before creating a contract."
          action={{
            label: "View purchase orders",
            href: "/dashboard/purchase-orders",
          }}
        />
      ) : (
        <ContractCreateForm
          awards={awardOptions}
          purchaseOrders={poOptions}
          submitLabel="Create draft contract"
          isSubmitting={createContract.isPending}
          onSubmit={(values) => createContract.mutate(values)}
          onCancel={() => router.push("/dashboard/contracts")}
        />
      )}
    </div>
  );
}
