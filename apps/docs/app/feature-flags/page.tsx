export default function FeatureFlagsPage() {
  return (
    <article className="prose mx-auto max-w-3xl px-6 py-16">
      <h1>Feature flags</h1>
      <p>
        Features are enabled per subscription plan. Platform admins can override flags per organisation
        via <code>featureOverrides</code> JSON.
      </p>
      <p>Use <code>@RequiresFeature(&quot;ai_assistant&quot;)</code> on API routes to gate capabilities.</p>
    </article>
  );
}
