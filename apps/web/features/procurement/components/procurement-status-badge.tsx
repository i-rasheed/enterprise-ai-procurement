import { Badge } from "@/components/ui/badge";
import type {
  ProcurementPriority,
  ProcurementStatus,
} from "@/features/procurement/types";
import {
  formatProcurementPriority,
  formatProcurementStatus,
} from "@/features/procurement/utils/formatters";

type ProcurementStatusBadgeProps = {
  status: ProcurementStatus;
};

type ProcurementPriorityBadgeProps = {
  priority: ProcurementPriority;
};

const statusVariant: Record<
  ProcurementStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  SUBMITTED: "secondary",
  CANCELLED: "outline",
  REJECTED: "destructive",
  APPROVED: "default",
};

const priorityVariant: Record<
  ProcurementPriority,
  "default" | "secondary" | "destructive" | "outline"
> = {
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "default",
  CRITICAL: "destructive",
};

export function ProcurementStatusBadge({ status }: ProcurementStatusBadgeProps) {
  return (
    <Badge variant={statusVariant[status]}>
      {formatProcurementStatus(status)}
    </Badge>
  );
}

export function ProcurementPriorityBadge({
  priority,
}: ProcurementPriorityBadgeProps) {
  return (
    <Badge variant={priorityVariant[priority]}>
      {formatProcurementPriority(priority)}
    </Badge>
  );
}
