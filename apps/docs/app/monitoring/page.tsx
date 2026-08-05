export default function MonitoringDocsPage() {
  return (
    <article className="prose mx-auto max-w-3xl px-6 py-16">
      <h1>Monitoring</h1>
      <ul>
        <li>API health: <code>/api/v1/health/live</code> and <code>/ready</code></li>
        <li>Sentry for web and API error tracking</li>
        <li>CloudWatch for ECS, RDS, and Redis metrics on AWS</li>
        <li>Paystack dashboard for webhook and subscription health</li>
      </ul>
    </article>
  );
}
