export const REPORT_TYPES = [
  'procurement',
  'vendor',
  'spend',
  'contract',
  'invoice',
  'purchase-order',
  'goods-receipt',
  'approval',
  'budget',
  'executive-summary',
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  procurement: 'Procurement Report',
  vendor: 'Vendor Report',
  spend: 'Spend Report',
  contract: 'Contract Report',
  invoice: 'Invoice Report',
  'purchase-order': 'Purchase Order Report',
  'goods-receipt': 'Goods Receipt Report',
  approval: 'Approval Report',
  budget: 'Budget Report',
  'executive-summary': 'Executive Summary',
};
