import { Badge } from "@/components/ui/badge";
import type { BidStatus } from "@/features/bids/types";
import { formatBidStatus } from "@/features/bids/config/permissions";

const statusVariant: Record<
  BidStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  SUBMITTED: "secondary",
  WITHDRAWN: "destructive",
  DISQUALIFIED: "destructive",
  AWARDED: "default",
};

export function BidStatusBadge({ status }: { status: BidStatus }) {
  return (
    <Badge variant={statusVariant[status]}>{formatBidStatus(status)}</Badge>
  );
}
