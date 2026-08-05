"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

export const DynamicAnalyticsShell = dynamic(
  () =>
    import("@/features/analytics/components/analytics-shell").then(
      (module) => module.AnalyticsShell,
    ),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
    ssr: false,
  },
);

export const DynamicAssistantShell = dynamic(
  () =>
    import("@/features/assistant/components/assistant-shell").then(
      (module) => module.AssistantShell,
    ),
  {
    loading: () => <Skeleton className="h-[480px] w-full" />,
    ssr: false,
  },
);

export const DynamicExecutiveDashboard = dynamic(
  () =>
    import("@/features/dashboard/components/executive-dashboard").then(
      (module) => module.ExecutiveDashboard,
    ),
  {
    loading: () => (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    ),
  },
);
