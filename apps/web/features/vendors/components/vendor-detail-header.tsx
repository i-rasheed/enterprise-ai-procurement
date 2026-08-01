"use client";

import Link from "next/link";
import { ArrowLeft, Building2, Mail, MapPin, Phone, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ComplianceStatusBadge,
  VendorStatusBadge,
} from "@/features/vendors/components/vendor-status-badge";
import type { Vendor } from "@/features/vendors/types";

type VendorDetailHeaderProps = {
  vendor: Vendor;
};

export function VendorDetailHeader({ vendor }: VendorDetailHeaderProps) {
  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/vendors"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="size-4" />
        Back to vendors
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Building2 className="size-6" />
                {vendor.name}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <VendorStatusBadge status={vendor.status} />
                <ComplianceStatusBadge status={vendor.complianceStatus} />
                {vendor.category ? (
                  <Badge variant="outline">{vendor.category}</Badge>
                ) : null}
              </div>
            </div>
            {vendor.rating != null ? (
              <div className="flex items-center gap-1 rounded-lg border px-3 py-2">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="text-muted-foreground size-4" />
            {vendor.email}
          </div>
          {vendor.phone ? (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="text-muted-foreground size-4" />
              {vendor.phone}
            </div>
          ) : null}
          {vendor.address ? (
            <div className="flex items-start gap-2 text-sm sm:col-span-2">
              <MapPin className="text-muted-foreground mt-0.5 size-4" />
              {vendor.address}
            </div>
          ) : null}
          {vendor.website ? (
            <div className="sm:col-span-2">
              <a
                href={vendor.website}
                target="_blank"
                rel="noreferrer"
                className="text-primary text-sm hover:underline"
              >
                {vendor.website}
              </a>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
