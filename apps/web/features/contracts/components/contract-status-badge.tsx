import { Badge } from "@/components/ui/badge";
import type { ContractStatus } from "@/features/contracts/types";
import { formatContractStatus } from "@/features/contracts/config/permissions";

const statusVariant: Record<
  ContractStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  UNDER_REVIEW: "secondary",
  ACTIVE: "default",
  EXPIRED: "destructive",
  TERMINATED: "destructive",
  RENEWED: "secondary",
};

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  return (
    <Badge variant={statusVariant[status]}>
      {formatContractStatus(status)}
    </Badge>
  );
}
