import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ContractStatusBadge } from "@/features/contracts/components/contract-status-badge";
import {
  formatContractType,
  getDaysUntilExpiry,
  isExpiringSoon,
  isPastEndDate,
} from "@/features/contracts/config/permissions";
import type { Contract } from "@/features/contracts/types";

type ContractDetailHeaderProps = {
  contract: Contract;
  canEdit: boolean;
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}

export function ContractDetailHeader({
  contract,
  canEdit,
}: ContractDetailHeaderProps) {
  const daysUntilExpiry = getDaysUntilExpiry(contract.endDate);
  const showExpiryWarning =
    contract.status === "ACTIVE" &&
    (isExpiringSoon(contract) || isPastEndDate(contract));

  return (
    <div className="space-y-4 border-b pb-6">
      <PageHeader
        title={contract.contractNumber}
        description={`${contract.title} · ${contract.vendor.name}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ContractStatusBadge status={contract.status} />
            {canEdit ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/contracts/${contract.id}/edit`}>
                  Edit draft
                </Link>
              </Button>
            ) : null}
            {contract.purchaseOrderId ? (
              <Button asChild variant="outline" size="sm">
                <Link
                  href={`/dashboard/purchase-orders/${contract.purchaseOrderId}`}
                >
                  View PO
                </Link>
              </Button>
            ) : null}
          </div>
        }
        className="border-0 pb-0"
      />

      {showExpiryWarning ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            {isPastEndDate(contract) ? (
              <p>
                This contract is past its end date but still marked active.
                Consider renewing or expiring it.
              </p>
            ) : (
              <p>
                Expires in {daysUntilExpiry} day
                {daysUntilExpiry === 1 ? "" : "s"} on{" "}
                {new Date(contract.endDate).toLocaleDateString()}.
                {contract.autoRenew
                  ? " Auto-renew is enabled."
                  : " Review renewal options."}
              </p>
            )}
          </div>
        </div>
      ) : null}

      <dl className="text-muted-foreground grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-medium text-foreground">Contract value</dt>
          <dd>{formatCurrency(contract.value, contract.currency)}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Type</dt>
          <dd>{formatContractType(contract.contractType)}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Term</dt>
          <dd>
            {new Date(contract.startDate).toLocaleDateString()} –{" "}
            {new Date(contract.endDate).toLocaleDateString()}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Renewal</dt>
          <dd>
            {contract.renewalType ?? "None"}
            {contract.renewalDate
              ? ` · Next ${new Date(contract.renewalDate).toLocaleDateString()}`
              : ""}
          </dd>
        </div>
      </dl>
    </div>
  );
}
