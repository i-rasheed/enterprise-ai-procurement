import Link from "next/link";

const siteName = "SpendWise";

const sections = [
  {
    title: "Getting started",
    links: [
      { href: "/getting-started", label: "Quick start" },
      { href: "/saas", label: "Multi-tenant SaaS" },
      { href: "/billing", label: "Billing & subscriptions" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/tenant-isolation", label: "Tenant isolation" },
      { href: "/feature-flags", label: "Feature flags" },
      { href: "/admin", label: "Admin console" },
    ],
  },
  {
    title: "Operations",
    links: [
      { href: "/deployment", label: "AWS deployment" },
      { href: "/monitoring", label: "Monitoring" },
      { href: "/backups", label: "Backups" },
    ],
  },
];

export default function DocsHomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm font-medium text-blue-600">Documentation</p>
      <h1 className="mt-2 text-4xl font-bold">{siteName} Docs</h1>
      <p className="text-muted-foreground mt-3 max-w-2xl">
        Product, SaaS, and production operations documentation for developers and platform teams.
      </p>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="font-semibold">{section.title}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-blue-600 hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
