export const notificationTemplates = {
  invoiceApproved: (invoiceNumber: string) => ({
    title: 'Invoice Approved',
    message: `Invoice ${invoiceNumber} has been approved for payment.`,
  }),
  contractExpiring: (contractNumber: string, days: number) => ({
    title: 'Contract Expiring Soon',
    message: `Contract ${contractNumber} expires in ${days} days.`,
  }),
  approvalRequired: (requestTitle: string) => ({
    title: 'Approval Required',
    message: `Procurement request "${requestTitle}" requires your approval.`,
  }),
  reportReady: (reportName: string) => ({
    title: 'Report Ready',
    message: `Your ${reportName} report is ready for download.`,
  }),
};
