"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
  vendorFormSchema,
  type VendorFormValues,
} from "@/features/vendors/schemas/vendor.schema";
import type { Vendor } from "@/features/vendors/types";

type VendorFormProps = {
  vendor?: Vendor;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: VendorFormValues) => void;
  onCancel?: () => void;
};

function toFormValues(vendor?: Vendor): VendorFormValues {
  if (!vendor) {
    return {
      name: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      registrationNumber: "",
      taxIdentificationNumber: "",
      category: "",
      status: "ACTIVE",
      rating: "",
      complianceStatus: "PENDING",
      notes: "",
    };
  }

  return {
    name: vendor.name,
    email: vendor.email,
    phone: vendor.phone ?? "",
    address: vendor.address ?? "",
    website: vendor.website ?? "",
    registrationNumber: vendor.registrationNumber ?? "",
    taxIdentificationNumber: vendor.taxIdentificationNumber ?? "",
    category: vendor.category ?? "",
    status: vendor.status,
    rating: vendor.rating != null ? String(vendor.rating) : "",
    complianceStatus: vendor.complianceStatus,
    notes: vendor.notes ?? "",
  };
}

export function VendorForm({
  vendor,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: VendorFormProps) {
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    values: toFormValues(vendor),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{vendor ? "Edit vendor" : "Vendor registration"}</CardTitle>
        <CardDescription>
          {vendor
            ? "Update vendor profile, status, and compliance details."
            : "Register a new vendor in your organisation directory."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Vendor name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...form.register("phone")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...form.register("address")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" placeholder="https://" {...form.register("website")} />
            {form.formState.errors.website ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.website.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" placeholder="e.g. IT Services" {...form.register("category")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration number</Label>
            <Input id="registrationNumber" {...form.register("registrationNumber")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxIdentificationNumber">Tax ID</Label>
            <Input id="taxIdentificationNumber" {...form.register("taxIdentificationNumber")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
              {...form.register("status")}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BLACKLISTED">Blacklisted</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complianceStatus">Compliance status</Label>
            <select
              id="complianceStatus"
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
              {...form.register("complianceStatus")}
            >
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Rating (0–5)</Label>
            <Input
              id="rating"
              type="number"
              min={0}
              max={5}
              step={0.1}
              {...form.register("rating")}
            />
            {form.formState.errors.rating ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.rating.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              rows={4}
              className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm"
              {...form.register("notes")}
            />
          </div>

          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
