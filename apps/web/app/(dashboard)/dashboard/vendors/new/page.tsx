"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { VendorForm } from "@/features/vendors/components/vendor-form";
import {
  canManageVendors,
} from "@/features/vendors/config/permissions";
import { useCreateVendor } from "@/features/vendors/hooks/use-vendors";
import { useAuthStore } from "@/stores/auth-store";

export default function NewVendorPage() {
  const userRole = useAuthStore((state) => state.user?.role);
  const canManage = canManageVendors(userRole);
  const createVendor = useCreateVendor();

  if (!canManage) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Register vendor"
          description="Add a new vendor to your organisation directory."
        />
        <EmptyState
          title="Permission required"
          description="Only admins and procurement managers can register vendors."
          action={{ label: "Back to vendors", href: "/dashboard/vendors" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Register vendor"
        description="Add a new vendor to your organisation directory."
        actions={
          <Link
            href="/dashboard/vendors"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="size-4" />
            Back to list
          </Link>
        }
      />

      <VendorForm
        submitLabel="Register vendor"
        isSubmitting={createVendor.isPending}
        onSubmit={(values) => createVendor.mutate(values)}
      />
    </div>
  );
}
