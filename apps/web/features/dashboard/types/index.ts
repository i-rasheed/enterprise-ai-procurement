export type ChartDataset = {
  type: string;
  title: string;
  labels: string[];
  datasets: Array<{ label: string; data: number[] }>;
};

export type TopItem = {
  name: string;
  value: number;
};

export type ExecutiveDashboard = {
  totalProcurementRequests: number;
  openProcurementRequests: number;
  completedProcurementRequests: number;
  activeVendors: number;
  approvedVendors: number;
  totalPurchaseOrders: number;
  outstandingPurchaseOrders: number;
  totalContracts: number;
  activeContracts: number;
  pendingApprovals: number;
  invoicesAwaitingApproval: number;
  invoicesPaid: number;
  goodsReceiptsPending: number;
  totalSpend: number;
  savingsGenerated: number;
  averageProcurementCycleTimeDays: number;
  averageApprovalTimeDays: number;
  topCategories: TopItem[];
  topVendors: TopItem[];
  topDepartments: TopItem[];
  spendByCategory: ChartDataset;
  spendByVendor: ChartDataset;
  spendByDepartment: ChartDataset;
  budgetUtilization: number;
  monthlyProcurementTrend: ChartDataset;
  monthlySpendTrend: ChartDataset;
  monthlySavingsTrend: ChartDataset;
  kpis?: ExecutiveDashboardKpis;
  charts?: Record<string, ChartDataset>;
};

export type ExecutiveDashboardKpis = {
  compliancePercentage?: number;
  vendorDeliveryPerformance?: number;
  vendorSuccessRate?: number;
  savingsPercentage?: number;
  budgetConsumption?: number;
  lateDeliveries?: number;
  rejectedInvoices?: number;
};

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type PaginatedRfqs = {
  rfqs: Array<{ id: string; rfqNumber: string; title: string; status: string }>;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type DashboardFilters = {
  startDate?: string;
  endDate?: string;
};
