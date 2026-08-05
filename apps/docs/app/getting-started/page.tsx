export default function GettingStartedPage() {
  return (
    <article className="prose mx-auto max-w-3xl px-6 py-16">
      <h1>Getting started</h1>
      <p>Install dependencies, run Postgres/Redis, migrate, and seed the demo tenant.</p>
      <pre><code>{`pnpm install
docker compose up -d postgres redis
pnpm --filter api exec prisma migrate dev
pnpm --filter api db:seed
pnpm dev`}</code></pre>
      <p>Sign in with <code>admin@demo.com</code> / <code>Password123!</code> (platform admin).</p>
    </article>
  );
}
