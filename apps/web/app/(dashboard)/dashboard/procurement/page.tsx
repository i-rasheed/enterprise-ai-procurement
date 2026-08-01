"use client";

import { ShoppingCart } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export default function ProcurementPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Procurement"
        description="Create and track purchase requests through approval workflows."
        actions={<Button disabled>New request</Button>}
      />
      <EmptyState
        icon={ShoppingCart}
        title="No procurement requests yet"
        description="This module will list requests, approvals, and RFQs once connected to the backend API."
      />
    </div>
  );
}
