"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ProcurementRequestForm } from "@/features/procurement/components/procurement-request-form";
import { useCreateProcurementRequest } from "@/features/procurement/hooks/use-procurement";

export default function NewProcurementPage() {
  const createRequest = useCreateProcurementRequest();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create procurement request"
        description="Start a new draft purchase request for your organisation."
        actions={
          <Link
            href="/dashboard/procurement"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="size-4" />
            Back to list
          </Link>
        }
      />

      <ProcurementRequestForm
        submitLabel="Create draft"
        isSubmitting={createRequest.isPending}
        onSubmit={(values) => createRequest.mutate(values)}
      />
    </div>
  );
}
