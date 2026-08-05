"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  procurementItemSchema,
  type ProcurementItemFormValues,
} from "@/features/procurement/schemas/procurement.schema";
import {
  useAddProcurementItem,
  useRemoveProcurementItem,
} from "@/features/procurement/hooks/use-procurement";
import type { ProcurementRequest } from "@/features/procurement/types";
import { formatCurrency } from "@/features/procurement/utils/formatters";

type ProcurementItemsPanelProps = {
  request: ProcurementRequest;
  canEdit: boolean;
};

export function ProcurementItemsPanel({
  request,
  canEdit,
}: ProcurementItemsPanelProps) {
  const [open, setOpen] = useState(false);
  const addItem = useAddProcurementItem(request.id);
  const removeItem = useRemoveProcurementItem(request.id);

  const form = useForm<ProcurementItemFormValues>({
    resolver: zodResolver(procurementItemSchema),
    defaultValues: {
      description: "",
      quantity: 1,
      unitPrice: 0,
    },
  });

  const totalCost =
    request.totalCost ??
    request.items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Line items</CardTitle>
          <CardDescription>
            {request.items.length} item{request.items.length === 1 ? "" : "s"} ·
            Total {formatCurrency(totalCost, request.currency)}
          </CardDescription>
        </div>
        {canEdit ? (
          <Button
            type="button"
            variant={open ? "outline" : "default"}
            onClick={() => setOpen((value) => !value)}
          >
            <Plus className="size-4" />
            {open ? "Close" : "Add item"}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {open && canEdit ? (
          <form
            className="grid gap-4 rounded-lg border p-4 md:grid-cols-4"
            onSubmit={form.handleSubmit((values) =>
              addItem.mutate(values, {
                onSuccess: () => {
                  form.reset({ description: "", quantity: 1, unitPrice: 0 });
                  setOpen(false);
                },
              }),
            )}
          >
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="itemDescription">Description</Label>
              <Input id="itemDescription" {...form.register("description")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemQuantity">Quantity</Label>
              <Input
                id="itemQuantity"
                type="number"
                min={1}
                {...form.register("quantity", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemUnitPrice">Unit price</Label>
              <Input
                id="itemUnitPrice"
                type="number"
                min={0.01}
                step={0.01}
                {...form.register("unitPrice", { valueAsNumber: true })}
              />
            </div>
            <div className="md:col-span-4">
              <Button type="submit" disabled={addItem.isPending}>
                {addItem.isPending ? "Adding..." : "Add line item"}
              </Button>
            </div>
          </form>
        ) : null}

        {request.items.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No line items yet. Add at least one item before submitting.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit price</TableHead>
                <TableHead>Total</TableHead>
                {canEdit ? <TableHead className="text-right">Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {request.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {formatCurrency(item.unitPrice, request.currency)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(item.totalPrice, request.currency)}
                  </TableCell>
                  {canEdit ? (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={removeItem.isPending}
                        onClick={() => removeItem.mutate(item.id)}
                      >
                        <Trash2 className="text-destructive size-4" />
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="flex justify-between border-t pt-4 text-sm">
          <span className="text-muted-foreground">Estimated budget</span>
          <span className="font-medium">
            {formatCurrency(request.estimatedBudget, request.currency)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
