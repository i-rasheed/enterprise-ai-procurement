"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  formatInvitationStatus,
} from "@/features/rfqs/config/permissions";
import {
  inviteVendorSchema,
  type InviteVendorFormValues,
} from "@/features/rfqs/schemas/rfq.schema";
import { useInviteVendor } from "@/features/rfqs/hooks/use-rfqs";
import type { RFQ } from "@/features/rfqs/types";
import { useVendors } from "@/features/vendors/hooks/use-vendors";

type RfqVendorsPanelProps = {
  rfq: RFQ;
  canInvite: boolean;
};

export function RfqVendorsPanel({ rfq, canInvite }: RfqVendorsPanelProps) {
  const [open, setOpen] = useState(false);
  const inviteVendor = useInviteVendor(rfq.id);
  const vendorsQuery = useVendors({ page: 1, limit: 100, status: "ACTIVE" });

  const form = useForm<InviteVendorFormValues>({
    resolver: zodResolver(inviteVendorSchema),
    defaultValues: { vendorId: "" },
  });

  const invitedVendorIds = new Set(
    (rfq.vendors ?? []).map((invitation) => invitation.vendor.id),
  );

  const availableVendors =
    vendorsQuery.data?.vendors.filter(
      (vendor) => !invitedVendorIds.has(vendor.id),
    ) ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Invited vendors</CardTitle>
          <CardDescription>
            {rfq.vendors?.length ?? 0} vendor
            {(rfq.vendors?.length ?? 0) === 1 ? "" : "s"} invited
          </CardDescription>
        </div>
        {canInvite ? (
          <Button
            type="button"
            variant={open ? "outline" : "default"}
            onClick={() => setOpen((value) => !value)}
          >
            <Plus className="size-4" />
            {open ? "Close" : "Invite vendor"}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {open && canInvite ? (
          <form
            className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-end"
            onSubmit={form.handleSubmit((values) =>
              inviteVendor.mutate(values, {
                onSuccess: () => {
                  form.reset({ vendorId: "" });
                  setOpen(false);
                },
              }),
            )}
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="vendorId">Vendor</Label>
              <select
                id="vendorId"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                {...form.register("vendorId")}
              >
                <option value="">Select vendor</option>
                {availableVendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} ({vendor.email})
                  </option>
                ))}
              </select>
              {form.formState.errors.vendorId ? (
                <p className="text-destructive text-sm">
                  {form.formState.errors.vendorId.message}
                </p>
              ) : null}
            </div>
            <Button type="submit" disabled={inviteVendor.isPending}>
              {inviteVendor.isPending ? "Inviting..." : "Send invitation"}
            </Button>
          </form>
        ) : null}

        {(rfq.vendors?.length ?? 0) === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No vendors invited yet. Invite at least one vendor before publishing.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invited</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rfq.vendors?.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">
                    {invitation.vendor.name}
                  </TableCell>
                  <TableCell>{invitation.vendor.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {formatInvitationStatus(invitation.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(invitation.invitedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
