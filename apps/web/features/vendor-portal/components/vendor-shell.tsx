"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeaderSkeleton } from "@/components/shared/page-header";
import { AppFooter } from "@/components/layout/app-footer";
import { VendorHeader } from "@/features/vendor-portal/components/vendor-header";
import { VendorSidebar } from "@/features/vendor-portal/components/vendor-sidebar";
import { useVendorAccount } from "@/features/vendor-portal/hooks/use-vendor-portal";
import { useVendorContextStore } from "@/features/vendor-portal/stores/vendor-context-store";
import { useAuth } from "@/providers/auth-provider";
import { useAuthStore } from "@/stores/auth-store";

export function VendorShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isHydrated, isLoading } = useAuth();
  const user = useAuthStore((state) => state.user);
  const vendor = useVendorContextStore((state) => state.vendor);
  const vendorQuery = useVendorAccount(user?.email, isAuthenticated);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/vendor/login");
    }
  }, [isAuthenticated, isHydrated, router]);

  const resolvedVendor = vendorQuery.data ?? vendor;

  if (!isHydrated || isLoading || vendorQuery.isLoading) {
    return (
      <div className="bg-muted/30 min-h-screen p-4 md:p-6">
        <PageHeaderSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!resolvedVendor) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10">
        <EmptyState
          title="Vendor profile not found"
          description="Your login email must match the email on your vendor record. Ask your procurement contact to update the vendor profile or use the correct vendor account."
          action={{
            label: "Back to vendor login",
            href: "/vendor/login",
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <VendorSidebar
          className="fixed inset-y-0 left-0 z-30"
          vendorName={resolvedVendor.name}
        />
      </div>
      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        <VendorHeader vendorName={resolvedVendor.name} />
        <main className="flex-1 px-4 py-6 md:px-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
