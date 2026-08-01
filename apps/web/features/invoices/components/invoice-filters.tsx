"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InvoiceFilters, InvoiceStatus } from "@/features/invoices/types";

const STATUS_OPTIONS: { value: InvoiceStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "MATCHED", label: "Matched" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "PAID", label: "Paid" },
];

type InvoiceFiltersPanelProps = {
  filters: InvoiceFilters;
  onChange: (filters: InvoiceFilters) => void;
  onReset: () => void;
};

export function InvoiceFiltersPanel({
  filters,
  onChange,
  onReset,
}: InvoiceFiltersPanelProps) {
  const hasActiveFilters = Boolean(filters.search || filters.status);

  return (
    <Card>
      <CardContent className="flex flex-wrap items-end gap-4 pt-6">
        <div className="min-w-[220px] flex-1 space-y-2">
          <Label htmlFor="invoice-search">Search</Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
            <Input
              id="invoice-search"
              placeholder="Invoice number, vendor, notes..."
              className="pl-9"
              value={filters.search ?? ""}
              onChange={(event) =>
                onChange({ ...filters, search: event.target.value, page: 1 })
              }
            />
          </div>
        </div>

        <div className="min-w-[160px] space-y-2">
          <Label htmlFor="invoice-status">Status</Label>
          <select
            id="invoice-status"
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            value={filters.status ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                status: (event.target.value as InvoiceStatus) || undefined,
                page: 1,
              })
            }
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters ? (
          <Button type="button" variant="ghost" onClick={onReset}>
            <X className="size-4" />
            Reset
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
