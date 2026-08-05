"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { saasRepository } from "@/features/saas/api/saas.repository";
import { Badge } from "@/components/ui/badge";

export function BillingPortalPanel() {
  const queryClient = useQueryClient();

  const overviewQuery = useQuery({
    queryKey: ["billing", "overview"],
    queryFn: () => saasRepository.getBillingOverview(),
  });

  const usageQuery = useQuery({
    queryKey: ["billing", "usage"],
    queryFn: () => saasRepository.getUsage(),
  });

  const checkoutMutation = useMutation({
    mutationFn: (plan: string) => saasRepository.createCheckout(plan),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => saasRepository.cancelSubscription(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["billing", "overview"] });
    },
  });

  const overview = overviewQuery.data;
  const usage = usageQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Manage your subscription, usage, and Paystack payments."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold capitalize">
                {overview?.plan?.toLowerCase() ?? "—"}
              </span>
              <Badge variant="secondary">{overview?.billingStatus ?? "—"}</Badge>
            </div>
            {overview?.trialEndsAt ? (
              <p className="text-muted-foreground text-sm">
                Trial ends {new Date(overview.trialEndsAt).toLocaleDateString()}
              </p>
            ) : null}
            <Button
              variant="outline"
              disabled={
                !overview?.paystackEnabled ||
                cancelMutation.isPending ||
                overview?.billingStatus === "CANCELED"
              }
              onClick={() => {
                if (
                  window.confirm(
                    "Cancel your Paystack subscription? You will keep access until the current billing period ends.",
                  )
                ) {
                  cancelMutation.mutate();
                }
              }}>
              Cancel subscription
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage this period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {usage?.metrics?.map((metric: { metric: string; used: number; limit: number }) => (
              <div key={metric.metric} className="flex justify-between">
                <span className="text-muted-foreground capitalize">
                  {metric.metric.toLowerCase().replaceAll("_", " ")}
                </span>
                <span>
                  {metric.used}
                  {metric.limit >= 0 ? ` / ${metric.limit}` : " / ∞"}
                </span>
              </div>
            )) ?? "Loading usage..."}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade plan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {["STARTER", "PROFESSIONAL"].map((plan) => (
            <Button
              key={plan}
              disabled={!overview?.paystackEnabled || checkoutMutation.isPending}
              onClick={() => checkoutMutation.mutate(plan)}>
              Upgrade to {plan.toLowerCase()}
            </Button>
          ))}
          <Button variant="outline" asChild>
            <Link href="/pricing">Compare plans</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
