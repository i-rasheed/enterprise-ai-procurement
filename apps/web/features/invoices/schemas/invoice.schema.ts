import { z } from "zod";

export const approveInvoiceSchema = z.object({
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const rejectInvoiceSchema = z.object({
  reason: z.string().min(1, "Rejection reason is required").max(2000),
});

export const markPaidSchema = z.object({
  paidDate: z.string().optional().or(z.literal("")),
  paymentReference: z.string().max(255).optional().or(z.literal("")),
});

export type ApproveInvoiceFormValues = z.infer<typeof approveInvoiceSchema>;
export type RejectInvoiceFormValues = z.infer<typeof rejectInvoiceSchema>;
export type MarkPaidFormValues = z.infer<typeof markPaidSchema>;
