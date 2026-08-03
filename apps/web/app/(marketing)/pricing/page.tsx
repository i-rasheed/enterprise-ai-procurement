import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Free",
    price: "₦0",
    description: "Evaluate core procurement workflows.",
    features: ["3 users", "25 requests", "50 AI requests", "Approvals & vendors"],
  },
  {
    name: "Starter",
    price: "₦75,000",
    description: "Growing teams with sourcing needs.",
    features: ["10 users", "RFQs & bids", "Purchase orders", "200 requests"],
    highlighted: true,
  },
  {
    name: "Professional",
    price: "₦225,000",
    description: "Full procure-to-pay plus AI.",
    features: ["50 users", "Analytics", "AI assistant", "Vendor portal"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "SSO, API access, and unlimited scale.",
    features: ["Unlimited users", "Custom branding", "Dedicated support", "SLA"],
  },
];

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold">Simple, transparent pricing</h1>
        <p className="text-muted-foreground mt-2">
          Every organisation starts with a 14-day trial. Upgrade anytime from the customer portal.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.highlighted ? "border-primary" : undefined}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-3xl font-bold">{plan.price}</p>
              <p className="text-muted-foreground text-sm">{plan.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <Button className="mt-6 w-full" asChild>
                <Link href="/register">{plan.name === "Enterprise" ? "Contact sales" : "Get started"}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
