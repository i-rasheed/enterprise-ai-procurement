export default function DeploymentDocsPage() {
  return (
    <article className="prose mx-auto max-w-3xl px-6 py-16">
      <h1>AWS deployment</h1>
      <p>
        See the repository <code>docs/AWS_DEPLOYMENT.md</code> and Terraform in <code>infra/aws/</code>
        for ECS, RDS, Redis, S3 backups, and ECR image workflow.
      </p>
    </article>
  );
}
