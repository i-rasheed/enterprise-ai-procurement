"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardSkeleton } from "@/components/shared/page-header";
import { useAuth } from "@/providers/auth-provider";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isHydrated, isLoading } = useAuth();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated || isLoading) {
    return (
      <div className="bg-muted/30 min-h-screen">
        <div className="mx-auto max-w-7xl p-4 md:p-6">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <AppSidebar className="fixed inset-y-0 left-0 z-30" />
      </div>
      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        <AppHeader />
        <main className="flex-1 px-4 py-6 md:px-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
