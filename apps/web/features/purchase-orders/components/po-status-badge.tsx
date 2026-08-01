import { Badge } from "@/components/ui/badge";
import type { PurchaseOrderStatus } from "@/features/purchase-orders/types";
import { formatPurchaseOrderStatus } from "@/features/purchase-orders/config/permissions";

const statusVariant: Record<
  PurchaseOrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  ISSUED: "secondary",
  ACKNOWLEDGED: "default",
  PARTIALLY_DELIVERED: "secondary",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

export function PoStatusBadge({ status }: { status: PurchaseOrderStatus }) {
  return (
    <Badge variant={statusVariant[status]}>
      {formatPurchaseOrderStatus(status)}
    </Badge>
  );
}
