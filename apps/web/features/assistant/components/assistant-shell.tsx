"use client";

import {
  BarChart3,
  Bot,
  FileText,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import type { AssistantTab } from "../types";
import { ChatWindow } from "./chat-window";
import { ContractSummaryPanel } from "./contract-summary-panel";
import { RecommendationsAssistantPanel } from "./recommendations-assistant-panel";
import { SemanticSearchPanel } from "./semantic-search-panel";
import { SpendAnalysisPanel } from "./spend-analysis-panel";
import { VendorRiskAssistantPanel } from "./vendor-risk-assistant-panel";

const TABS: Array<{
  id: AssistantTab;
  label: string;
  icon: typeof Bot;
}> = [
  { id: "chat", label: "Chat", icon: Bot },
  { id: "search", label: "Semantic search", icon: Search },
  { id: "contract-summary", label: "Contract summary", icon: FileText },
  { id: "vendor-risk", label: "Vendor risk", icon: ShieldAlert },
  { id: "spend-analysis", label: "Spend analysis", icon: BarChart3 },
  { id: "recommendations", label: "Recommendations", icon: Sparkles },
];

export function AssistantShell() {
  const [activeTab, setActiveTab] = useState<AssistantTab>("chat");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "chat" ? <ChatWindow /> : null}
      {activeTab === "search" ? <SemanticSearchPanel /> : null}
      {activeTab === "contract-summary" ? <ContractSummaryPanel /> : null}
      {activeTab === "vendor-risk" ? <VendorRiskAssistantPanel /> : null}
      {activeTab === "spend-analysis" ? <SpendAnalysisPanel /> : null}
      {activeTab === "recommendations" ? (
        <RecommendationsAssistantPanel />
      ) : null}
    </div>
  );
}
