export default function BackupsDocsPage() {
  return (
    <article className="prose mx-auto max-w-3xl px-6 py-16">
      <h1>Backups</h1>
      <p>RDS automated snapshots (14-day retention) and versioned S3 backup bucket for manual exports.</p>
      <pre><code>{`pg_dump "$DATABASE_URL" | gzip | aws s3 cp - s3://<bucket>/postgres/$(date +%F).sql.gz`}</code></pre>
    </article>
  );
}
