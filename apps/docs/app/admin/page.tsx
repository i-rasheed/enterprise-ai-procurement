export default function AdminDocsPage() {
  return (
    <article className="prose mx-auto max-w-3xl px-6 py-16">
      <h1>Admin console</h1>
      <p>
        Platform admins (<code>isPlatformAdmin</code>) access cross-tenant metrics at
        <code>/dashboard/admin</code> and via <code>/api/v1/platform/*</code>.
      </p>
    </article>
  );
}
