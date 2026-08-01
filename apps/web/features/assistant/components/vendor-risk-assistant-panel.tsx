"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { VendorRiskPanel } from "@/features/vendors/components/vendor-risk-panel";
import { useVendors } from "@/features/vendors/hooks/use-vendors";

export function VendorRiskAssistantPanel() {
  const vendorsQuery = useVendors({ page: 1, limit: 100, status: "ACTIVE" });
  const [vendorId, setVendorId] = useState("");

  const vendors = vendorsQuery.data?.vendors ?? [];
  const selectedVendorId = vendorId || vendors[0]?.id || "";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="size-5" />
            Vendor risk
          </CardTitle>
          <CardDescription>
            Analyze vendor financial, delivery, compliance, and operational risk
            using AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="vendorSelect">Vendor</Label>
            {vendorsQuery.isLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <select
                id="vendorSelect"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                value={selectedVendorId}
                onChange={(event) => setVendorId(event.target.value)}
              >
                {vendors.length === 0 ? (
                  <option value="">No active vendors available</option>
                ) : (
                  vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedVendorId ? (
        <VendorRiskPanel vendorId={selectedVendorId} canAnalyze />
      ) : null}
    </div>
  );
}
