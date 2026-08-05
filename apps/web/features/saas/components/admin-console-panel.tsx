"use client";

import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { saasRepository } from "@/features/saas/api/saas.repository";

export function AdminConsolePanel() {
  const dashboardQuery = useQuery({
    queryKey: ["platform", "dashboard"],
    queryFn: () => saasRepository.getPlatformDashboard(),
  });

  const orgsQuery = useQuery({
    queryKey: ["platform", "organisations"],
    queryFn: () => saasRepository.listPlatformOrganisations(),
  });

  const ticketsQuery = useQuery({
    queryKey: ["platform", "tickets"],
    queryFn: () => saasRepository.listPlatformTickets(),
  });

  const dashboard = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform admin"
        description="Cross-tenant metrics, organisations, and support triage."
      />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Organisations", dashboard?.organisations],
          ["Users", dashboard?.users],
          ["Open tickets", dashboard?.openTickets],
          ["Active subs", dashboard?.activeSubscriptions],
        ].map(([label, value]) => (
          <Card key={label as string}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{label as string}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{value ?? "—"}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(orgsQuery.data ?? []).slice(0, 10).map((org: { id: string; name: string; plan: string; _count?: { users: number } }) => (
            <div key={org.id} className="flex justify-between border-b pb-2">
              <span>{org.name}</span>
              <span className="text-muted-foreground capitalize">
                {org.plan.toLowerCase()} · {org._count?.users ?? 0} users
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Support queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(ticketsQuery.data ?? []).slice(0, 10).map((ticket: { id: string; subject: string; status: string; organisation?: { name: string } }) => (
            <div key={ticket.id} className="flex justify-between border-b pb-2">
              <span>{ticket.subject}</span>
              <span className="text-muted-foreground">
                {ticket.organisation?.name} · {ticket.status.toLowerCase()}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
