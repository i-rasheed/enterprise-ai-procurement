"use client";

import { FileText, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Vendor, VendorDocumentItem } from "@/features/vendors/types";

function buildDocumentItems(vendor: Vendor): VendorDocumentItem[] {
  return [
    {
      type: "REGISTRATION_CERTIFICATE",
      label: "Company registration certificate",
      status: vendor.registrationNumber ? "SUBMITTED" : "MISSING",
      reference: vendor.registrationNumber ?? undefined,
    },
    {
      type: "TAX_CERTIFICATE",
      label: "Tax identification certificate",
      status: vendor.taxIdentificationNumber ? "SUBMITTED" : "MISSING",
      reference: vendor.taxIdentificationNumber ?? undefined,
    },
    {
      type: "INSURANCE",
      label: "Insurance certificate",
      status: vendor.complianceStatus === "VERIFIED" ? "VERIFIED" : "MISSING",
    },
    {
      type: "BANK_REFERENCE",
      label: "Bank reference letter",
      status: "MISSING",
    },
    {
      type: "COMPLIANCE_AUDIT",
      label: "Compliance audit report",
      status:
        vendor.complianceStatus === "VERIFIED"
          ? "VERIFIED"
          : vendor.complianceStatus === "REJECTED"
            ? "MISSING"
            : "SUBMITTED",
    },
  ];
}

const documentStatusVariant = {
  MISSING: "outline",
  SUBMITTED: "secondary",
  VERIFIED: "default",
} as const;

type VendorDocumentsPanelProps = {
  vendor: Vendor;
  canManage: boolean;
};

export function VendorDocumentsPanel({
  vendor,
  canManage,
}: VendorDocumentsPanelProps) {
  const documents = buildDocumentItems(vendor);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-5" />
          Vendor documents
        </CardTitle>
        <CardDescription>
          Track required compliance documents and registration references.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {documents.map((document) => (
            <div
              key={document.type}
              className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{document.label}</p>
                {document.reference ? (
                  <p className="text-muted-foreground text-sm">
                    Ref: {document.reference}
                  </p>
                ) : null}
              </div>
              <Badge variant={documentStatusVariant[document.status]}>
                {document.status.charAt(0) +
                  document.status.slice(1).toLowerCase()}
              </Badge>
            </div>
          ))}
        </div>

        {canManage ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Upload className="text-muted-foreground mx-auto mb-2 size-8" />
            <p className="text-sm font-medium">Document upload</p>
            <p className="text-muted-foreground mt-1 text-sm">
              File upload will be available when the documents API is enabled.
              Update registration and tax fields to record document references.
            </p>
            <Button type="button" variant="outline" className="mt-4" disabled>
              Upload document
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
