import { z } from "zod";

export const createPurchaseOrderSchema = z.object({
  awardId: z.string().min(1, "Select an award"),
  expectedDeliveryDate: z.string().min(1, "Expected delivery date is required"),
  deliveryAddress: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const updatePurchaseOrderSchema = z.object({
  expectedDeliveryDate: z.string().min(1, "Expected delivery date is required"),
  paymentTerms: z.string().max(255).optional().or(z.literal("")),
  deliveryAddress: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const issuePurchaseOrderSchema = z.object({
  issueDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const acknowledgePurchaseOrderSchema = z.object({
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export type CreatePurchaseOrderFormValues = z.infer<
  typeof createPurchaseOrderSchema
>;
export type UpdatePurchaseOrderFormValues = z.infer<
  typeof updatePurchaseOrderSchema
>;
export type IssuePurchaseOrderFormValues = z.infer<
  typeof issuePurchaseOrderSchema
>;
export type AcknowledgePurchaseOrderFormValues = z.infer<
  typeof acknowledgePurchaseOrderSchema
>;
