import { Badge } from "@/components/ui/badge";
import type { ComplianceStatus, VendorStatus } from "@/features/vendors/types";
import {
  formatComplianceStatus,
  formatVendorStatus,
} from "@/features/vendors/utils/formatters";

type VendorStatusBadgeProps = {
  status: VendorStatus;
};

type ComplianceStatusBadgeProps = {
  status: ComplianceStatus;
};

const vendorStatusVariant: Record<
  VendorStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  ACTIVE: "secondary",
  INACTIVE: "outline",
  SUSPENDED: "destructive",
  BLACKLISTED: "destructive",
};

const complianceStatusVariant: Record<
  ComplianceStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "outline",
  VERIFIED: "secondary",
  REJECTED: "destructive",
};

export function VendorStatusBadge({ status }: VendorStatusBadgeProps) {
  return (
    <Badge variant={vendorStatusVariant[status]}>
      {formatVendorStatus(status)}
    </Badge>
  );
}

export function ComplianceStatusBadge({ status }: ComplianceStatusBadgeProps) {
  return (
    <Badge variant={complianceStatusVariant[status]}>
      {formatComplianceStatus(status)}
    </Badge>
  );
}
