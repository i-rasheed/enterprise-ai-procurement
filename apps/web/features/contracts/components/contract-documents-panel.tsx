"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, FileText, Upload } from "lucide-react";
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
  uploadContractDocumentSchema,
  type UploadContractDocumentFormValues,
} from "@/features/contracts/schemas/contract.schema";
import { useUploadContractDocument } from "@/features/contracts/hooks/use-contracts";
import { canUploadDocuments } from "@/features/contracts/config/permissions";
import type { Contract } from "@/features/contracts/types";

type ContractDocumentsPanelProps = {
  contract: Contract;
  canManage: boolean;
};

export function ContractDocumentsPanel({
  contract,
  canManage,
}: ContractDocumentsPanelProps) {
  const uploadDocument = useUploadContractDocument(contract.id);
  const canUpload = canManage && canUploadDocuments(contract);

  const form = useForm<UploadContractDocumentFormValues>({
    resolver: zodResolver(uploadContractDocumentSchema),
    defaultValues: {
      fileName: "",
      fileUrl: "",
      mimeType: "application/pdf",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    uploadDocument.mutate(values, {
      onSuccess: () => form.reset(),
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-5" />
          Documents
        </CardTitle>
        <CardDescription>
          Contract document metadata and file references.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {contract.documents.length === 0 ? (
          <p className="text-muted-foreground text-sm">No documents uploaded.</p>
        ) : (
          <ul className="space-y-2">
            {contract.documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between rounded-lg border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{doc.fileName}</p>
                  <p className="text-muted-foreground text-xs">
                    {doc.mimeType} · Uploaded by {doc.uploadedBy.firstName}{" "}
                    {doc.uploadedBy.lastName} ·{" "}
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                    Open
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        )}

        {canUpload ? (
          <form onSubmit={onSubmit} className="space-y-3 border-t pt-4">
            <p className="text-sm font-medium">Add document</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fileName">File name</Label>
                <Input
                  id="fileName"
                  placeholder="master-services-agreement.pdf"
                  disabled={uploadDocument.isPending}
                  {...form.register("fileName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mimeType">MIME type</Label>
                <Input
                  id="mimeType"
                  placeholder="application/pdf"
                  disabled={uploadDocument.isPending}
                  {...form.register("mimeType")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fileUrl">File URL</Label>
              <Input
                id="fileUrl"
                placeholder="https://storage.example.com/contracts/..."
                disabled={uploadDocument.isPending}
                {...form.register("fileUrl")}
              />
            </div>
            <Button type="submit" variant="outline" disabled={uploadDocument.isPending}>
              <Upload className="size-4" />
              {uploadDocument.isPending ? "Uploading..." : "Add document"}
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
