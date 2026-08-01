"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader, PageHeaderSkeleton } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ContractEditForm } from "@/features/contracts/components/contract-form";
import {
  canEditContract,
  canManageContracts,
} from "@/features/contracts/config/permissions";
import {
  useContract,
  useUpdateContract,
} from "@/features/contracts/hooks/use-contracts";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function EditContractPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const userRole = useAuthStore((state) => state.user?.role);
  const contractQuery = useContract(id);
  const updateContract = useUpdateContract(id);

  if (!canManageContracts(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to edit contracts."
        action={{ label: "Back to contracts", href: "/dashboard/contracts" }}
      />
    );
  }

  if (contractQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
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

  if (!canEditContract(contract)) {
    return (
      <EmptyState
        title="Cannot edit contract"
        description="Only draft or under-review contracts can be edited."
        action={{
          label: "View contract",
          href: `/dashboard/contracts/${id}`,
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${contract.contractNumber}`}
        description="Update draft contract terms."
        actions={
          <Button asChild variant="outline">
            <Link href={`/dashboard/contracts/${id}`}>Cancel</Link>
          </Button>
        }
      />

      <ContractEditForm
        contract={contract}
        submitLabel="Save changes"
        isSubmitting={updateContract.isPending}
        onSubmit={(values) => updateContract.mutate(values)}
        onCancel={() => router.push(`/dashboard/contracts/${id}`)}
      />
    </div>
  );
}
