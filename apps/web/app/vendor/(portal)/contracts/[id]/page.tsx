"use client";

import { useParams } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { ContractDetailHeader } from "@/features/contracts/components/contract-detail-header";
import { ContractDocumentsPanel } from "@/features/contracts/components/contract-documents-panel";
import { useVendorContract } from "@/features/vendor-portal/hooks/use-vendor-portal";
import { useVendorContextStore } from "@/features/vendor-portal/stores/vendor-context-store";

export default function VendorContractDetailPage() {
  const params = useParams<{ id: string }>();
  const vendor = useVendorContextStore((state) => state.vendor);
  const contractQuery = useVendorContract(params.id);
  const contract = contractQuery.data;

  if (contractQuery.isLoading) {
    return <p className="text-muted-foreground text-sm">Loading contract...</p>;
  }

  if (!contract || contract.vendor.id !== vendor?.id) {
    return (
      <EmptyState
        title="Contract not found"
        description="This contract is unavailable."
        action={{ label: "Back to contracts", href: "/vendor/contracts" }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ContractDetailHeader contract={contract} canEdit={false} />

      <div className="rounded-xl border p-4">
        <h3 className="mb-2 font-semibold">Description</h3>
        <p className="text-muted-foreground text-sm whitespace-pre-wrap">
          {contract.description}
        </p>
      </div>

      <ContractDocumentsPanel contract={contract} canManage={false} />

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
    </div>
  );
}
