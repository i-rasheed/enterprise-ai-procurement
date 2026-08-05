"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeaderSkeleton } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { VendorDetailHeader } from "@/features/vendors/components/vendor-detail-header";
import { VendorDocumentsPanel } from "@/features/vendors/components/vendor-documents-panel";
import { VendorForm } from "@/features/vendors/components/vendor-form";
import { VendorRiskPanel } from "@/features/vendors/components/vendor-risk-panel";
import { VendorStatusPanel } from "@/features/vendors/components/vendor-status-panel";
import {
  canAnalyzeVendorRisk,
  canManageVendors,
} from "@/features/vendors/config/permissions";
import {
  useDeleteVendor,
  useUpdateVendor,
  useVendor,
} from "@/features/vendors/hooks/use-vendors";
import type { VendorRiskAnalysis } from "@/features/vendors/types";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";

export default function VendorDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const userRole = useAuthStore((state) => state.user?.role);
  const canManage = canManageVendors(userRole);
  const canAnalyze = canAnalyzeVendorRisk(userRole);
  const vendorQuery = useVendor(id);
  const updateVendor = useUpdateVendor(id);
  const deleteVendor = useDeleteVendor();
  const [riskAnalysis, setRiskAnalysis] = useState<VendorRiskAnalysis | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);

  if (vendorQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (vendorQuery.isError || !vendorQuery.data) {
    return (
      <EmptyState
        title="Vendor not found"
        description={
          vendorQuery.error instanceof ApiClientError
            ? vendorQuery.error.message
            : "This vendor could not be loaded."
        }
        action={{ label: "Back to vendors", href: "/dashboard/vendors" }}
      />
    );
  }

  const vendor = vendorQuery.data;

  const handleDelete = () => {
    if (
      window.confirm(
        `Delete vendor "${vendor.name}"? This action cannot be undone.`,
      )
    ) {
      deleteVendor.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <VendorDetailHeader vendor={vendor} />

      <div className="grid gap-6 xl:grid-cols-2">
        <VendorStatusPanel vendor={vendor} canManage={canManage} />
        <VendorRiskPanel
          vendorId={vendor.id}
          canAnalyze={canAnalyze}
          analysis={riskAnalysis}
          onAnalysis={setRiskAnalysis}
        />
      </div>

      <VendorDocumentsPanel vendor={vendor} canManage={canManage} />

      {canManage ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Vendor profile</h2>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing((value) => !value)}
            >
              {isEditing ? "Cancel edit" : "Edit profile"}
            </Button>
          </div>

          {isEditing ? (
            <VendorForm
              vendor={vendor}
              submitLabel="Save changes"
              isSubmitting={updateVendor.isPending}
              onSubmit={(values) =>
                updateVendor.mutate(values, {
                  onSuccess: () => setIsEditing(false),
                })
              }
              onCancel={() => setIsEditing(false)}
            />
          ) : null}

          <div className="flex justify-end">
            <Button
              type="button"
              variant="destructive"
              disabled={deleteVendor.isPending}
              onClick={handleDelete}
            >
              {deleteVendor.isPending ? "Deleting..." : "Delete vendor"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
