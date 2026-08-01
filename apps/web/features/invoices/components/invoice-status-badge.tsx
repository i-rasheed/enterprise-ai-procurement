import { Badge } from "@/components/ui/badge";
import type { InvoiceStatus } from "@/features/invoices/types";
import { formatInvoiceStatus } from "@/features/invoices/config/permissions";

const statusVariant: Record<
  InvoiceStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  SUBMITTED: "secondary",
  MATCHED: "default",
  APPROVED: "default",
  REJECTED: "destructive",
  PAID: "default",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge variant={statusVariant[status]}>
      {formatInvoiceStatus(status)}
    </Badge>
  );
}
