import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { title: "Subscription plans", body: "Free, Starter, Professional, and Enterprise tiers with plan-based limits." },
  { title: "Stripe billing", body: "Checkout, customer portal, and webhook-driven subscription sync." },
  { title: "Usage metering", body: "Track users, procurement requests, AI usage, and storage per tenant." },
  { title: "Feature flags", body: "Gate AI, analytics, vendor portal, and enterprise capabilities by plan." },
  { title: "Onboarding wizard", body: "Guide new tenants through profile, team invites, and first workflows." },
  { title: "Support center", body: "Ticket-based support with platform admin triage." },
  { title: "Admin console", body: "Cross-tenant metrics, plan overrides, and system settings." },
  { title: "Email templates", body: "Branded transactional email with queue-backed delivery." },
];

export default function FeaturesPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="text-3xl font-bold">Built for multi-tenant SaaS</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        ProcureAI ships with the subscription, billing, and operations layer enterprises expect.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{feature.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
