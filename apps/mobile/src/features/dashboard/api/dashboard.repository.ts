import { apiGet } from "@/lib/api";
import type { ExecutiveDashboard } from "@/lib/api/types";

export const dashboardRepository = {
  getExecutiveDashboard() {
    return apiGet<ExecutiveDashboard>("/dashboard/executive");
  },
};
