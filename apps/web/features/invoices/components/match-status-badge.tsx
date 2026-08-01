import { Badge } from "@/components/ui/badge";
import type { MatchStatus } from "@/features/invoices/types";
import { formatMatchStatus } from "@/features/invoices/config/permissions";

const statusVariant: Record<
  MatchStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  MATCHED: "default",
  PRICE_MISMATCH: "destructive",
  QUANTITY_MISMATCH: "destructive",
  MISSING_GRN: "destructive",
  MISSING_PO: "destructive",
  FAILED: "destructive",
};

export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  return (
    <Badge variant={statusVariant[status]}>
      {formatMatchStatus(status)}
    </Badge>
  );
}
