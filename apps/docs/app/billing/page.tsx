export default function BillingPage() {
  return (
    <article className="prose mx-auto max-w-3xl px-6 py-16">
      <h1>Billing</h1>
      <p>Paystack powers checkout, subscriptions, and webhook-driven plan sync.</p>
      <h2>Setup</h2>
      <ol>
        <li>Create Paystack subscription plans for Starter, Professional, and Enterprise</li>
        <li>Set <code>PAYSTACK_*</code> environment variables on the API</li>
        <li>Configure webhook endpoint: <code>/api/v1/billing/webhooks/paystack</code></li>
      </ol>
      <h2>Environment variables</h2>
      <pre><code>{`PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_PLAN_STARTER=PLN_...
PAYSTACK_PLAN_PROFESSIONAL=PLN_...
PAYSTACK_PLAN_ENTERPRISE=PLN_...`}</code></pre>
    </article>
  );
}
