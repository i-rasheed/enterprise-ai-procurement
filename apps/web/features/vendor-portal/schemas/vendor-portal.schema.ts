import { z } from "zod";

export const vendorBidSchema = z.object({
  rfqId: z.string().min(1, "Select an RFQ"),
  currency: z.string().max(3).optional().or(z.literal("")),
  deliveryPeriod: z.string().max(255).optional().or(z.literal("")),
  paymentTerms: z.string().max(255).optional().or(z.literal("")),
  warrantyPeriod: z.string().max(255).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
      }),
    )
    .min(1, "Add at least one line item"),
});

export type VendorBidFormValues = z.infer<typeof vendorBidSchema>;

export const vendorLoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

export type VendorLoginFormValues = z.infer<typeof vendorLoginSchema>;
