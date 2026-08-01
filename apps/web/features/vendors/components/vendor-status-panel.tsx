"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  ComplianceStatusBadge,
  VendorStatusBadge,
} from "@/features/vendors/components/vendor-status-badge";
import { useUpdateVendor } from "@/features/vendors/hooks/use-vendors";
import type { Vendor } from "@/features/vendors/types";
import type { VendorStatus, ComplianceStatus } from "@/features/vendors/types";

type VendorStatusPanelProps = {
  vendor: Vendor;
  canManage: boolean;
};

export function VendorStatusPanel({ vendor, canManage }: VendorStatusPanelProps) {
  const updateVendor = useUpdateVendor(vendor.id);
  const [status, setStatus] = useState<VendorStatus>(vendor.status);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>(
    vendor.complianceStatus,
  );

  const hasChanges =
    status !== vendor.status || complianceStatus !== vendor.complianceStatus;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor status</CardTitle>
        <CardDescription>
          Manage operational status and compliance verification state.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-muted-foreground mb-1 text-sm">Current status</p>
            <VendorStatusBadge status={vendor.status} />
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm">Compliance</p>
            <ComplianceStatusBadge status={vendor.complianceStatus} />
          </div>
        </div>

        {canManage ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="statusUpdate">Update status</Label>
              <select
                id="statusUpdate"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as VendorStatus)
                }
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BLACKLISTED">Blacklisted</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="complianceUpdate">Update compliance</Label>
              <select
                id="complianceUpdate"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                value={complianceStatus}
                onChange={(event) =>
                  setComplianceStatus(event.target.value as ComplianceStatus)
                }
              >
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Button
                type="button"
                disabled={!hasChanges || updateVendor.isPending}
                onClick={() =>
                  updateVendor.mutate({ status, complianceStatus })
                }
              >
                {updateVendor.isPending ? "Updating..." : "Save status changes"}
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
