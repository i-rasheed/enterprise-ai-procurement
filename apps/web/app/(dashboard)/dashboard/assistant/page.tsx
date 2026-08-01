"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { DynamicAssistantShell } from "@/lib/performance/dynamic-imports";
import { canAccessAssistant } from "@/features/assistant/config/permissions";
import { useAuthStore } from "@/stores/auth-store";

export default function AssistantPage() {
  const userRole = useAuthStore((state) => state.user?.role);

  if (!canAccessAssistant(userRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="The AI procurement assistant is available to admin, procurement manager, and finance users."
        action={{ label: "Back to dashboard", href: "/dashboard" }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Procurement Assistant"
        description="Chat with your procurement data, run semantic search, summarize contracts, analyze vendor risk and spend, and get AI recommendations."
      />
      <DynamicAssistantShell />
    </div>
  );
}
