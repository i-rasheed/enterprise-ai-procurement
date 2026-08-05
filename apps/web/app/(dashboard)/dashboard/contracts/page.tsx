"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader, TableSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ContractFiltersPanel } from "@/features/contracts/components/contract-filters";
import { ContractsTable } from "@/features/contracts/components/contracts-table";
import {
  canManageContracts,
  canViewContracts,
} from "@/features/contracts/config/permissions";
import {
  useContracts,
  useDeleteContract,
} from "@/features/contracts/hooks/use-contracts";
import type { ContractFilters } from "@/features/contracts/types";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const DEFAULT_FILTERS: ContractFilters = {
  page: 1,
  limit: 10,
};

export default function ContractsPage() {
  const userRole = useAuthStore((state) => state.user?.role);
  const canManage = canManageContracts(userRole);
  const [filters, setFilters] = useState<ContractFilters>(DEFAULT_FILTERS);
  const contractsQuery = useContracts(filters);
  const deleteContract = useDeleteContract();

  if (!canViewContracts(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to view contracts."
        action={{ label: "Back to dashboard", href: "/dashboard" }}
      />
    );
  }

  const handleDelete = (id: string, contractNumber: string) => {
    if (
      window.confirm(
        `Delete draft contract "${contractNumber}"? This action cannot be undone.`,
      )
    ) {
      deleteContract.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts"
        description="Manage vendor agreements, track versions and renewals, monitor expiry, and store contract documents."
        actions={
          canManage ? (
            <Button asChild>
              <Link href="/dashboard/contracts/new">
                <Plus className="size-4" />
                Create contract
              </Link>
            </Button>
          ) : null
        }
      />

      <ContractFiltersPanel
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {contractsQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : contractsQuery.isError ? (
        <EmptyState
          title="Unable to load contracts"
          description={
            contractsQuery.error instanceof ApiClientError
              ? contractsQuery.error.message
              : "Something went wrong."
          }
          action={{ label: "Retry", onClick: () => contractsQuery.refetch() }}
        />
      ) : contractsQuery.data && contractsQuery.data.contracts.length > 0 ? (
        <ContractsTable
          data={contractsQuery.data}
          canManage={canManage}
          onPageChange={(page) =>
            setFilters((current) => ({ ...current, page }))
          }
          onDelete={canManage ? handleDelete : undefined}
        />
      ) : (
        <EmptyState
          title="No contracts yet"
          description="Create a contract from an award or purchase order to begin vendor agreement management."
          action={
            canManage
              ? { label: "Create contract", href: "/dashboard/contracts/new" }
              : undefined
          }
        />
      )}
    </div>
  );
}
