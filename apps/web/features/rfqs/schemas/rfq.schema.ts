import { z } from "zod";

export const rfqFormSchema = z.object({
  procurementRequestId: z.string().min(1, "Select an approved procurement request"),
  title: z.string().min(2, "Title must be at least 2 characters").max(255),
  description: z.string().min(10, "Description is required").max(5000),
  closingDate: z.string().min(1, "Closing date is required"),
});

export const publishRfqSchema = z.object({
  publicationNote: z.string().max(1000).optional().or(z.literal("")),
});

export const inviteVendorSchema = z.object({
  vendorId: z.string().min(1, "Select a vendor"),
});

export type RfqFormValues = z.infer<typeof rfqFormSchema>;
export type PublishRfqFormValues = z.infer<typeof publishRfqSchema>;
export type InviteVendorFormValues = z.infer<typeof inviteVendorSchema>;
