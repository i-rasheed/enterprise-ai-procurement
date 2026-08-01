import { Badge } from "@/components/ui/badge";
import type { RFQStatus } from "@/features/rfqs/types";
import { formatRfqStatus } from "@/features/rfqs/config/permissions";

const statusVariant: Record<
  RFQStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  PUBLISHED: "secondary",
  CLOSED: "default",
  CANCELLED: "destructive",
};

export function RfqStatusBadge({ status }: { status: RFQStatus }) {
  return (
    <Badge variant={statusVariant[status]}>{formatRfqStatus(status)}</Badge>
  );
}
