export default function BillingDocsPage() {
  return (
    <article className="prose mx-auto max-w-3xl px-6 py-16">
      <h1>Billing &amp; subscriptions</h1>
      <p>Stripe powers checkout, customer portal, and webhook-driven subscription sync.</p>
      <h2>Setup</h2>
      <ol>
        <li>Create Stripe products/prices for each paid plan</li>
        <li>Set <code>STRIPE_*</code> environment variables on the API</li>
        <li>Configure webhook endpoint: <code>/api/v1/billing/webhooks/stripe</code></li>
      </ol>
    </article>
  );
}
