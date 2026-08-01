"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { DashboardSkeleton } from "@/components/shared/page-header";
import { useAuthStore } from "@/stores/auth-store";

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [isAuthenticated, isHydrated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <DashboardSkeleton />
      </div>
    </div>
  );
}
