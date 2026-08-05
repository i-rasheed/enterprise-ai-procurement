# SpendWise SaaS — AWS Production Deployment

This guide describes deploying the multi-tenant SaaS platform to AWS using the Terraform reference in `infra/aws/`.

## Architecture

| Component | AWS service | Notes |
|-----------|-------------|-------|
| API | ECS Fargate + ALB | NestJS standalone Docker image |
| Web | ECS Fargate + ALB | Next.js standalone on port 3000 |
| Docs | ECS Fargate or S3/CloudFront | Static docs site |
| Database | RDS PostgreSQL 16 | Encrypted, 14-day backups |
| Cache/queues | ElastiCache Redis 7 | BullMQ email and jobs |
| File storage | S3 | Contract documents and exports |
| Backups | S3 + RDS snapshots | Versioned backup bucket |
| Secrets | Secrets Manager | Paystack, JWT, SMTP, OpenAI |
| Monitoring | CloudWatch + Sentry | Logs, metrics, error tracking |

## Prerequisites

- AWS account with IAM permissions for VPC, ECS, RDS, ElastiCache, S3, ECR
- Domain + ACM certificate for HTTPS
- Paystack account with subscription plans for Starter, Professional, Enterprise
- SMTP provider (SES, SendGrid, etc.)

## 1. Provision infrastructure

```bash
cd infra/aws
terraform init
terraform plan -var="environment=production"
terraform apply
```

Update the RDS master password via Secrets Manager before production use.

## 2. Build and push images

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

docker build -f apps/api/Dockerfile -t spendwise-api .
docker tag spendwise-api:latest <ecr_api_repository_url>:latest
docker push <ecr_api_repository_url>:latest

docker build -f apps/web/Dockerfile -t spendwise-web .
docker tag spendwise-web:latest <ecr_web_repository_url>:latest
docker push <ecr_web_repository_url>:latest
```

## 3. Configure environment

Store secrets in AWS Secrets Manager and inject into ECS task definitions:

### API

```
DATABASE_URL=postgresql://spendwise:***@<rds_endpoint>:5432/spendwise
REDIS_URL=redis://<redis_endpoint>:6379
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_PLAN_STARTER=PLN_...
PAYSTACK_PLAN_PROFESSIONAL=PLN_...
PAYSTACK_PLAN_ENTERPRISE=PLN_...
SMTP_HOST=...
SMTP_FROM=SpendWise <noreply@yourdomain.com>
FRONTEND_URL=https://app.yourdomain.com
CORS_ORIGINS=https://app.yourdomain.com
OPENAI_API_KEY=...
AWS_S3_BUCKET=...
```

### Web

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_SITE_URL=https://app.yourdomain.com
NEXT_PUBLIC_SENTRY_DSN=...
```

## 4. Run migrations

```bash
pnpm --filter api exec prisma migrate deploy
pnpm --filter api db:seed
```

Run once from a migration task or CI job with VPC access to RDS.

## 5. Paystack webhooks

Point Paystack to:

```
POST https://api.yourdomain.com/api/v1/billing/webhooks/paystack
```

Enable events: `charge.success`, `subscription.create`, `subscription.disable`, `invoice.payment_failed`.

## 6. Monitoring

- **Health checks:** `/api/v1/health/live`, `/api/v1/health/ready`
- **CloudWatch:** ECS CPU/memory, RDS connections, Redis evictions
- **Sentry:** Web and API error rates, release tracking
- **Alerts:** PagerDuty/Slack on 5xx rate, RDS storage, failed backups

## 7. Backups

| Asset | Method | Retention |
|-------|--------|-----------|
| PostgreSQL | RDS automated snapshots | 14 days (configurable) |
| Manual exports | `pg_dump` to S3 backup bucket | 90 days lifecycle |
| S3 documents | Versioning enabled on backup bucket | 90 days |
| Redis | Ephemeral — rebuild from queues | N/A |

Example manual backup:

```bash
pg_dump "$DATABASE_URL" | gzip | aws s3 cp - s3://<backup_bucket>/postgres/$(date +%F).sql.gz
```

## 8. CI/CD

GitHub Actions builds and tests on every PR. For production:

1. Merge to `main`
2. Build Docker images
3. Push to ECR
4. Deploy ECS services (rolling update)
5. Run `prisma migrate deploy`

## 9. Post-deploy checklist

- [ ] Paystack webhook verified
- [ ] Trial registration creates organisation with 14-day trial
- [ ] Feature flags gate AI on Free/Starter plans
- [ ] Platform admin can access `/dashboard/admin`
- [ ] Support tickets flow end-to-end
- [ ] Email delivery tested (verification, invitation)
- [ ] Sentry receiving errors
- [ ] Backup restore drill completed

## Related docs

- [SAAS_PRODUCTION.md](./SAAS_PRODUCTION.md) — SaaS operations runbook
- [DEPLOYMENT.md](./DEPLOYMENT.md) — General deployment guide
- [FRONTEND_DEPLOYMENT.md](./FRONTEND_DEPLOYMENT.md) — Web-specific deployment
