"use client";

import { useParams, useRouter } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeaderSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractActionsPanel } from "@/features/contracts/components/contract-actions-panel";
import { ContractDetailHeader } from "@/features/contracts/components/contract-detail-header";
import { ContractDocumentsPanel } from "@/features/contracts/components/contract-documents-panel";
import {
  ContractTimeline,
  ContractVersionsPanel,
} from "@/features/contracts/components/contract-timeline";
import {
  canEditContract,
  canManageContracts,
  canViewContracts,
} from "@/features/contracts/config/permissions";
import {
  useContract,
  useContractHistory,
} from "@/features/contracts/hooks/use-contracts";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function ContractDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const userRole = useAuthStore((state) => state.user?.role);
  const contractQuery = useContract(id);
  const historyQuery = useContractHistory(id);

  if (!canViewContracts(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to view contracts."
        action={{ label: "Back to dashboard", href: "/dashboard" }}
      />
    );
  }

  if (contractQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (contractQuery.isError || !contractQuery.data) {
    return (
      <EmptyState
        title="Contract not found"
        description={
          contractQuery.error instanceof ApiClientError
            ? contractQuery.error.message
            : "This contract could not be loaded."
        }
        action={{ label: "Back to contracts", href: "/dashboard/contracts" }}
      />
    );
  }

  const contract = contractQuery.data;
  const versions = historyQuery.data?.versions ?? [];
  const canManage = canManageContracts(userRole);

  return (
    <div className="space-y-6">
      <ContractDetailHeader
        contract={contract}
        canEdit={canManage && canEditContract(contract)}
      />

      <div className="rounded-xl border p-4">
        <h3 className="mb-2 font-semibold">Description</h3>
        <p className="text-muted-foreground text-sm whitespace-pre-wrap">
          {contract.description}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ContractDocumentsPanel contract={contract} canManage={canManage} />
        <ContractActionsPanel contract={contract} canManage={canManage} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ContractTimeline
          versions={versions}
          isLoading={historyQuery.isLoading}
        />
        <ContractVersionsPanel
          versions={versions}
          isLoading={historyQuery.isLoading}
        />
      </div>

      {(contract.signedByOrganisation || contract.signedByVendor) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {contract.signedByOrganisation ? (
            <div className="rounded-xl border p-4 text-sm">
              <h3 className="mb-1 font-semibold">Signed by organisation</h3>
              <p className="text-muted-foreground">
                {contract.signedByOrganisation}
              </p>
            </div>
          ) : null}
          {contract.signedByVendor ? (
            <div className="rounded-xl border p-4 text-sm">
              <h3 className="mb-1 font-semibold">Signed by vendor</h3>
              <p className="text-muted-foreground">{contract.signedByVendor}</p>
            </div>
          ) : null}
        </div>
      )}

      <Button type="button" variant="outline" onClick={() => router.back()}>
        Back
      </Button>
    </div>
  );
}
