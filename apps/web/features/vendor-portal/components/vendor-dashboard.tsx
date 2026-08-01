"use client";

import Link from "next/link";
import {
  FileSignature,
  FileText,
  Gavel,
  Package,
  FileSearch,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KpiStatCard, KpiStatCardSkeleton } from "@/features/dashboard/components/kpi-stat-card";
import { useVendorDashboard } from "@/features/vendor-portal/hooks/use-vendor-portal";
import { useVendorContextStore } from "@/features/vendor-portal/stores/vendor-context-store";

export function VendorDashboard() {
  const vendor = useVendorContextStore((state) => state.vendor);
  const dashboardQuery = useVendorDashboard(vendor?.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor dashboard"
        description={`Welcome back${vendor ? `, ${vendor.name}` : ""}. Track RFQs, bids, orders, and contracts in one place.`}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {dashboardQuery.isLoading || !dashboardQuery.data ? (
          Array.from({ length: 5 }).map((_, index) => (
            <KpiStatCardSkeleton key={index} />
          ))
        ) : (
          <>
            <KpiStatCard
              title="Open RFQs"
              value={String(dashboardQuery.data.openRfqs)}
              description="Published invitations"
              icon={FileSearch}
            />
            <KpiStatCard
              title="Active bids"
              value={String(dashboardQuery.data.activeBids)}
              description="Draft and submitted"
              icon={Gavel}
            />
            <KpiStatCard
              title="Purchase orders"
              value={String(dashboardQuery.data.issuedPurchaseOrders)}
              description="Issued or acknowledged"
              icon={Package}
            />
            <KpiStatCard
              title="Pending invoices"
              value={String(dashboardQuery.data.pendingInvoices)}
              description="Submitted or matched"
              icon={FileText}
            />
            <KpiStatCard
              title="Active contracts"
              value={String(dashboardQuery.data.activeContracts)}
              description="Currently in force"
              icon={FileSignature}
            />
          </>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Respond to RFQs</CardTitle>
            <CardDescription>
              Review invitations and prepare competitive bids.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/vendor/rfqs" className="text-primary text-sm font-medium hover:underline">
              View RFQs
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manage bids</CardTitle>
            <CardDescription>
              Finish draft bids and track submitted proposals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/vendor/bids" className="text-primary text-sm font-medium hover:underline">
              View bids
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI assistant</CardTitle>
            <CardDescription>
              Get quick answers about your vendor workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/vendor/assistant"
              className="text-primary text-sm font-medium hover:underline"
            >
              Open assistant
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
