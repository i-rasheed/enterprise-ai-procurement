export default function TenantIsolationPage() {
  return (
    <article className="prose mx-auto max-w-3xl px-6 py-16">
      <h1>Tenant isolation</h1>
      <p>
        All business entities include <code>organisationId</code>. API guards enforce tenant context
        and billing status before serving protected routes.
      </p>
    </article>
  );
}
