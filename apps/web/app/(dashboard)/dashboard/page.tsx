import type { Metadata } from "next";

import { ExecutiveDashboard } from "@/features/dashboard/components/executive-dashboard";

export const metadata: Metadata = {
  title: "Executive Dashboard",
  description:
    "Executive procurement dashboard with spend, savings, approvals, and operational KPIs.",
};

export default function DashboardPage() {
  return <ExecutiveDashboard />;
}
