import type { Metadata } from "next";

import { DynamicExecutiveDashboard } from "@/lib/performance/dynamic-imports";

export const metadata: Metadata = {
  title: "Executive Dashboard",
  description:
    "Executive procurement dashboard with spend, savings, approvals, and operational KPIs.",
};

export default function DashboardPage() {
  return <DynamicExecutiveDashboard />;
}
