export default function SaasDocsPage() {
  return (
    <article className="prose mx-auto max-w-3xl px-6 py-16">
      <h1>Multi-tenant SaaS</h1>
      <p>
        Each organisation is a tenant with isolated data, subscription plan, usage limits, and feature flags.
      </p>
      <ul>
        <li>Registration creates a 14-day trial organisation</li>
        <li>JWT includes <code>organisationId</code> for row-level isolation</li>
        <li>Plans: Free, Starter, Professional, Enterprise</li>
        <li>Customer portal at <code>/dashboard/billing</code></li>
      </ul>
    </article>
  );
}
