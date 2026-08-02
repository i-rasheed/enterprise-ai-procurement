import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    title: "Tenant isolation",
    description:
      "Row-level security, organisation-scoped APIs, and billing-aware access controls.",
  },
  {
    title: "AI procurement",
    description:
      "Contract summaries, spend analysis, and assistant chat gated by subscription plan.",
  },
  {
    title: "Enterprise workflows",
    description:
      "Procure-to-pay with approvals, RFQs, POs, goods receipts, invoices, and contracts.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="max-w-3xl">
          <p className="text-primary text-sm font-medium">Multi-tenant SaaS platform</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Enterprise procurement, delivered as a subscription
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Launch faster with Stripe billing, usage limits, feature flags, onboarding,
            and a customer portal built for B2B SaaS.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/register">Start 14-day trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 border-y">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3 md:px-6">
          {highlights.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold">Ready for production on AWS</h2>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm">
              Docker images, CI/CD, monitoring hooks, backup guidance, and deployment
              documentation included.
            </p>
          </div>
          <Button asChild>
            <Link href="/contact">Talk to sales</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
