"use client";

import {
  BarChart3,
  ClipboardCheck,
  FileBarChart,
  LayoutDashboard,
  PiggyBank,
  Users,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import type { AnalyticsFilters, AnalyticsTab } from "../types";
import { AnalyticsFiltersPanel } from "./analytics-filters";
import { ApprovalDashboard } from "./approval-dashboard";
import { OverviewDashboard } from "./overview-dashboard";
import { ReportsPanel } from "./reports-panel";
import { SavingsDashboard } from "./savings-dashboard";
import { SpendDashboard } from "./spend-dashboard";
import { VendorDashboard } from "./vendor-dashboard";

const DEFAULT_FILTERS: AnalyticsFilters = {};

const TABS: Array<{
  id: AnalyticsTab;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "spend", label: "Spend", icon: BarChart3 },
  { id: "vendors", label: "Vendors", icon: Users },
  { id: "approvals", label: "Approvals", icon: ClipboardCheck },
  { id: "savings", label: "Savings", icon: PiggyBank },
  { id: "reports", label: "Reports", icon: FileBarChart },
];

export function AnalyticsShell() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("overview");
  const [filters, setFilters] = useState<AnalyticsFilters>(DEFAULT_FILTERS);

  return (
    <div className="space-y-6">
      <AnalyticsFiltersPanel
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

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

      {activeTab === "overview" ? <OverviewDashboard filters={filters} /> : null}
      {activeTab === "spend" ? <SpendDashboard filters={filters} /> : null}
      {activeTab === "vendors" ? <VendorDashboard filters={filters} /> : null}
      {activeTab === "approvals" ? <ApprovalDashboard filters={filters} /> : null}
      {activeTab === "savings" ? <SavingsDashboard filters={filters} /> : null}
      {activeTab === "reports" ? <ReportsPanel filters={filters} /> : null}
    </div>
  );
}
