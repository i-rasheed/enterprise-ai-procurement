import { Badge } from "@/components/ui/badge";
import type { GoodsReceiptStatus } from "@/features/goods-receipts/types";
import { formatGoodsReceiptStatus } from "@/features/goods-receipts/config/permissions";

const statusVariant: Record<
  GoodsReceiptStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  RECEIVED: "default",
  PARTIALLY_RECEIVED: "secondary",
  REJECTED: "destructive",
  COMPLETED: "default",
};

export function GrnStatusBadge({ status }: { status: GoodsReceiptStatus }) {
  return (
    <Badge variant={statusVariant[status]}>
      {formatGoodsReceiptStatus(status)}
    </Badge>
  );
}
