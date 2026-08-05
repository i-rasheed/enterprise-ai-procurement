import { z } from "zod";

export const createGoodsReceiptSchema = z.object({
  purchaseOrderId: z.string().min(1, "Select a purchase order"),
  receiptDate: z.string().min(1, "Receipt date is required"),
  warehouse: z.string().max(255).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const updateGoodsReceiptSchema = z.object({
  receiptDate: z.string().min(1, "Receipt date is required"),
  warehouse: z.string().max(255).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

const receiveItemSchema = z.object({
  goodsReceiptItemId: z.string().min(1),
  quantityReceived: z.number().int().min(0, "Quantity must be 0 or more"),
});

const rejectItemSchema = z.object({
  goodsReceiptItemId: z.string().min(1),
  quantityRejected: z.number().int().min(0, "Quantity must be 0 or more"),
  remarks: z.string().max(2000).optional().or(z.literal("")),
});

export const receiveGoodsSchema = z
  .object({
    items: z.array(receiveItemSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const hasReceived = data.items.some((item) => item.quantityReceived > 0);
    if (!hasReceived) {
      ctx.addIssue({
        code: "custom",
        message: "Enter at least one received quantity greater than zero",
        path: ["items"],
      });
    }
  });

export const rejectGoodsSchema = z
  .object({
    items: z.array(rejectItemSchema).min(1),
  })
  .superRefine((data, ctx) => {
    data.items.forEach((item, index) => {
      if (item.quantityRejected > 0 && !item.remarks?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Remarks are required when rejecting items",
          path: ["items", index, "remarks"],
        });
      }
    });
  });

export type CreateGoodsReceiptFormValues = z.infer<
  typeof createGoodsReceiptSchema
>;
export type UpdateGoodsReceiptFormValues = z.infer<
  typeof updateGoodsReceiptSchema
>;
export type ReceiveGoodsFormValues = z.infer<typeof receiveGoodsSchema>;
export type RejectGoodsFormValues = z.infer<typeof rejectGoodsSchema>;
