# 📋 Operations Runbook

> Operational procedures for deploying, monitoring, and incident response.  
> Last updated: 2026-05-12

---

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Deployment Steps](#deployment-steps)
- [Post-Deployment Verification](#post-deployment-verification)
- [Rollback Procedure](#rollback-procedure)
- [Database Migration Runbook](#database-migration-runbook)
- [Incident Response](#incident-response)
- [Escalation Matrix](#escalation-matrix)

---

## Pre-Deployment Checklist

### Code Quality

- [ ] `cargo test` — all tests pass
- [ ] `cargo clippy -- -D warnings` — no warnings
- [ ] `cargo fmt -- --check` — code formatted
- [ ] `npm run lint` (dashboard) — no lint errors
- [ ] `npm run build` (dashboard) — build succeeds
- [ ] SDK tests pass (`make test` or `./run-tests.sh`)

### Security

- [ ] No secrets in code or commit history
- [ ] `.env.production` not in repository
- [ ] New dependencies reviewed (no known vulnerabilities)
- [ ] API keys rotated if exposed
- [ ] SQL injection checks (parameterized queries only)
- [ ] SSRF protection intact (no new direct HTTP calls)

### Database

- [ ] Migrations tested locally
- [ ] Migrations are reversible (down migration exists)
- [ ] No destructive migrations without backup
- [ ] New columns have defaults or are nullable
- [ ] Indexes added for new query patterns

### Configuration

- [ ] Environment variables documented in `.env.example`
- [ ] New env vars added to Cloud Run / Vercel
- [ ] Secrets stored in Google Secret Manager (not env vars)
- [ ] Feature flags configured (if applicable)

### Documentation

- [ ] API changes reflected in `docs/openapi.yaml`
- [ ] README updated (if public-facing change)
- [ ] CHANGELOG entry added (if applicable)

---

## Deployment Steps

### API + Worker (Google Cloud Run)

#### Automatic Deployment

Push to `main` branch triggers GitHub Actions:

```bash
# 1. Ensure tests pass locally
cargo test && cargo clippy -- -D warnings

# 2. Commit and push
git add -A
git commit -m "feat: your change"
git push origin main

# 3. GitHub Actions builds and deploys automatically
# Monitor: https://github.com/servetarslan02/HookSniff/actions
```

#### Manual Deployment

```bash
# Build and push container image
gcloud builds submit --tag europe-west1-docker.pkg.dev/hooksniff/cloud-run-source/hooksniff-api

# Deploy to Cloud Run
gcloud run deploy hooksniff-api \
  --image europe-west1-docker.pkg.dev/hooksniff/cloud-run-source/hooksniff-api \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated

# Deploy worker
gcloud run deploy hooksniff-worker \
  --image europe-west1-docker.pkg.dev/hooksniff/cloud-run-source/hooksniff-worker \
  --region europe-west1 \
  --platform managed \
  --no-allow-unauthenticated
```

#### Setting Environment Variables

```bash
# Set a single env var
gcloud run services update hooksniff-api \
  --set-env-vars "KEY=VALUE" \
  --region europe-west1

# Set a secret as env var
gcloud run services update hooksniff-api \
  --set-secrets "DATABASE_URL=hooksniff-db-url:latest" \
  --region europe-west1

# Update revision (triggers new deployment)
gcloud run services update hooksniff-api \
  --region europe-west1 \
  --update-env-vars "FORCE_REVISION=$(date +%s)"
```

### Dashboard (Vercel)

#### Automatic Deployment

Push to `main` branch triggers Vercel deployment:

```bash
# 1. Build locally to verify
cd dashboard && npm run build

# 2. Push to main
git push origin main

# 3. Vercel auto-deploys
# Monitor: https://vercel.com/servetarslan02/hooksniff
```

#### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (preview)
cd dashboard
vercel

# Deploy (production)
vercel --prod
```

#### Environment Variables (Vercel)

Set via Vercel Dashboard → Settings → Environment Variables:

| Variable | Environment | Description |
|----------|-------------|-------------|
| `NEXT_PUBLIC_API_URL` | All | API base URL |
| `NEXTAUTH_SECRET` | Production | NextAuth secret |
| `NEXTAUTH_URL` | Production | `https://hooksniff.vercel.app` |

---

## Post-Deployment Verification

### Immediate Checks (< 2 minutes)

```bash
# 1. Health check
curl -s https://hooksniff-api-1046140057667.europe-west1.run.app/health
# Expected: {"status":"ok","version":"...","uptime":"..."}

# 2. API responds
curl -s https://hooksniff-api-1046140057667.europe-west1.run.app/v1/docs
# Expected: Swagger UI HTML

# 3. Database connectivity
curl -s https://hooksniff-api-1046140057667.europe-west1.run.app/v1/auth/register \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"test-deploy@example.com","password":"Test1234!"}'
# Expected: 201 Created or 409 Conflict (if user exists)

# 4. Dashboard loads
curl -s -o /dev/null -w "%{http_code}" https://hooksniff.vercel.app
# Expected: 200

# 5. Check Cloud Run logs
gcloud run services logs read hooksniff-api --region europe-west1 --limit 20
```

### Extended Checks (< 5 minutes)

```bash
# 6. Create endpoint and send webhook (full flow)
TOKEN=$(curl -s https://hooksniff-api-1046140057667.europe-west1.run.app/v1/auth/login \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"demo@hooksniff.com","password":"Demo1234!"}' | jq -r .token)

curl -s https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints \
  -H "Authorization: Bearer $TOKEN" | jq .

# 7. Check metrics endpoint
curl -s https://hooksniff-api-1046140057667.europe-west1.run.app/metrics
# Expected: Prometheus metrics

# 8. Check Grafana dashboards
# Open: https://hookrelay.grafana.net
```

### Automated Verification Script

```bash
#!/bin/bash
# scripts/verify-deploy.sh

API_URL="https://hooksniff-api-1046140057667.europe-west1.run.app"
DASHBOARD_URL="https://hooksniff.vercel.app"
ERRORS=0

echo "🔍 Post-deployment verification..."

# Health check
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Health check failed (HTTP $HTTP_CODE)"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Health check passed"
fi

# Dashboard
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DASHBOARD_URL")
if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Dashboard failed (HTTP $HTTP_CODE)"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Dashboard passed"
fi

# Auth flow
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/v1/auth/register" \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"deploy-check@example.com","password":"Test1234!"}')
if [ "$HTTP_CODE" != "201" ] && [ "$HTTP_CODE" != "409" ]; then
  echo "❌ Auth flow failed (HTTP $HTTP_CODE)"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Auth flow passed"
fi

if [ $ERRORS -gt 0 ]; then
  echo "🚨 $ERRORS check(s) failed!"
  exit 1
else
  echo "✅ All checks passed!"
fi
```

---

## Rollback Procedure

### API/Worker Rollback (Cloud Run)

#### Option 1: Revert Git and Redeploy

```bash
# Revert the last commit
git revert HEAD
git push origin main

# GitHub Actions will auto-deploy the reverted code
```

#### Option 2: Deploy Previous Revision

```bash
# List revisions
gcloud run revisions list --service hooksniff-api --region europe-west1

# Route traffic to previous revision
gcloud run services update-traffic hooksniff-api \
  --to-revisions hooksniff-api-00052-abc=100 \
  --region europe-west1
```

#### Option 3: Quick Traffic Split (Canary)

```bash
# Split traffic 90/10 (old/new)
gcloud run services update-traffic hooksniff-api \
  --to-revisions hooksniff-api-00052-abc=90,hooksniff-api-00053-def=10 \
  --region europe-west1
```

### Dashboard Rollback (Vercel)

#### Option 1: Redeploy Previous Build

```bash
# In Vercel Dashboard:
# Deployments → Find previous working deployment → ⋮ → Promote to Production
```

#### Option 2: Git Revert

```bash
git revert HEAD
git push origin main
# Vercel auto-deploys the revert
```

### Database Rollback

```bash
# ⚠️ Database rollbacks should be done carefully

# 1. Check current migration version
sqlx migrate info

# 2. Revert last migration (if reversible)
sqlx migrate revert

# 3. If data was lost, restore from backup
# Neon backup: 03:00 UTC daily, 30-day retention
# Contact Neon support or use their dashboard for point-in-time recovery
```

---

## Database Migration Runbook

### Pre-Migration

```bash
# 1. Backup current database (if not using Neon auto-backup)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Test migration on local copy
createdb hooksniff_test
pg_dump $DATABASE_URL | psql hooksniff_test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hooksniff_test sqlx migrate run

# 3. Verify migration is reversible
sqlx migrate revert
sqlx migrate run
```

### Running Migration (Production)

```bash
# 1. Set production database URL
export DATABASE_URL="postgresql://...@ep-frosty-bar.eu-central-1.aws.neon.tech/hooksniff?sslmode=require"

# 2. Run migration
cd api
sqlx migrate run

# 3. Verify
sqlx migrate info
```

### Post-Migration Verification

```bash
# 1. Check application health
curl https://hooksniff-api-1046140057667.europe-west1.run.app/health

# 2. Check for errors in logs
gcloud run services logs read hooksniff-api --region europe-west1 --limit 50

# 3. Test critical paths
# - Login
# - Create endpoint
# - Send webhook
# - Check analytics
```

### Migration Naming Convention

```
api/migrations/
├── 20260101_create_users.sql
├── 20260102_create_webhooks.sql
├── 20260103_create_endpoints.sql
└── ...
```

Pattern: `YYYYMMDD_description.sql`

### Common Migration Patterns

```sql
-- Add column with default (safe)
ALTER TABLE users ADD COLUMN display_name TEXT DEFAULT '';

-- Add column NOT NULL (must have default or be nullable)
ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false;

-- Create index concurrently (PostgreSQL)
CREATE INDEX CONCURRENTLY idx_webhooks_user_id ON webhooks(user_id);

-- Rename column (two-step for safety)
ALTER TABLE users RENAME COLUMN name TO full_name;
-- Update app code, then remove old column if needed
```

---

## Incident Response

### Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **P0 — Critical** | Service completely down | < 15 min | API unreachable, data loss |
| **P1 — High** | Major feature broken | < 1 hour | Webhook delivery failing, auth broken |
| **P2 — Medium** | Degraded performance | < 4 hours | Slow responses, intermittent errors |
| **P3 — Low** | Minor issue | < 24 hours | UI glitch, non-critical feature bug |

### Incident Response Steps

#### 1. Detect & Assess (0-5 min)

```bash
# Check service status
curl https://hooksniff-api-1046140057667.europe-west1.run.app/health

# Check recent logs
gcloud run services logs read hooksniff-api --region europe-west1 --limit 50

# Check Grafana dashboards
# https://hookrelay.grafana.net

# Check Vercel status
# https://vercel.com/servetarslan02/hooksniff/deployments
```

#### 2. Communicate (5-10 min)

- Open incident in monitoring dashboard
- Notify affected users (if applicable)
- Create incident tracking issue

#### 3. Mitigate (10-30 min)

```bash
# Quick mitigation options:
# 1. Rollback (see Rollback Procedure above)
# 2. Scale up instances
gcloud run services update hooksniff-api --min-instances=2 --max-instances=10 --region europe-west1

# 3. Enable maintenance mode (dashboard)
# Set NEXT_PUBLIC_MAINTENANCE=true in Vercel env vars

# 4. Block abusive traffic (if DDoS)
# Cloudflare Dashboard → Security → WAF rules
```

#### 4. Resolve (30 min - 4 hours)

- Identify root cause
- Implement fix
- Test fix
- Deploy fix
- Verify resolution

#### 5. Post-Incident (within 48 hours)

- Write post-mortem document
- Identify preventive measures
- Create follow-up tasks
- Update monitoring/alerts if needed

### Quick Reference: Common Incidents

#### API Returns 500 Errors

```bash
# Check logs
gcloud run services logs read hooksniff-api --region europe-west1 --limit 100

# Check database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# Restart service (triggers new instance)
gcloud run services update hooksniff-api --region europe-west1 --update-env-vars "RESTART=$(date +%s)"
```

#### Webhook Deliveries Failing

```bash
# Check worker status
gcloud run services logs read hooksniff-worker --region europe-west1 --limit 50

# Check stuck deliveries
psql $DATABASE_URL -c "SELECT COUNT(*), status FROM deliveries GROUP BY status;"

# Restart worker
gcloud run services update hooksniff-worker --region europe-west1 --update-env-vars "RESTART=$(date +%s)"
```

#### High Latency

```bash
# Check Cloud Run metrics in GCP Console
# Cloud Run → hooksniff-api → Metrics

# Scale up
gcloud run services update hooksniff-api --max-instances=20 --region europe-west1

# Check database slow queries
psql $DATABASE_URL -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
  FROM pg_stat_activity 
  WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds';"
```

---

## Escalation Matrix

### Contact Information

| Role | Name | Contact | When to Escalate |
|------|------|---------|-------------------|
| **Project Owner** | Servet Arslan | servetarslan02@gmail.com | P0/P1 incidents, business decisions |
| **AI Agent** | HookSniff Bot | GitHub Issues | Technical issues, code changes |
| **Neon Support** | Neon | neon.tech/support | Database issues, outages |
| **Vercel Support** | Vercel | vercel.com/support | Dashboard deployment issues |
| **Google Cloud** | GCP | cloud.google.com/support | Cloud Run issues, quotas |
| **Upstash Support** | Upstash | upstash.com/support | Redis issues |
| **Grafana Support** | Grafana | grafana.com/support | Monitoring/alerting issues |

### Escalation Triggers

| Trigger | Escalate To | Action |
|---------|-------------|--------|
| Service down > 5 min | Servet | Immediate notification |
| Data loss detected | Servet | Immediate notification + stop writes |
| Security breach suspected | Servet | Immediate notification + isolate |
| Billing anomaly | Servet | Review + potential suspension |
| Third-party outage | Vendor support | Create ticket + notify users |
| Quota exceeded | Servet | Review usage + upgrade plan |

### Communication Channels

- **Internal:** GitHub Issues + Comments
- **Users:** Email (via Resend/Gmail API)
- **Status Page:** (Future: status.hooksniff.dev)

---

## Monitoring & Alerts

### Key Metrics to Watch

| Metric | Warning | Critical |
|--------|---------|----------|
| API latency (p95) | > 500ms | > 2s |
| Error rate | > 1% | > 5% |
| Webhook delivery success | < 99% | < 95% |
| Database connections | > 80% pool | > 95% pool |
| Redis memory | > 80% | > 95% |
| Worker queue depth | > 1000 | > 10000 |

### Grafana Dashboards

- **API Overview:** Request rate, latency, error rate
- **Webhook Delivery:** Success rate, retry count, queue depth
- **Database:** Connection pool, query latency, slow queries
- **Infrastructure:** CPU, memory, network

### Log Queries (Grafana Cloud)

```logql
# Error logs
{service="hooksniff-api"} |= "ERROR"

# Slow requests
{service="hooksniff-api"} | json | duration > 5000

# Failed deliveries
{service="hooksniff-worker"} |= "delivery_failed"
```

---

## Maintenance Windows

### Planned Maintenance

1. Schedule during low-traffic hours (02:00-06:00 UTC)
2. Notify users 48 hours in advance
3. Put up maintenance banner on dashboard
4. Execute maintenance
5. Verify everything works
6. Remove maintenance banner
7. Notify users of completion

### Emergency Maintenance

1. Assess severity
2. Notify users immediately (if user-facing)
3. Execute fix
4. Verify
5. Post-incident communication

---

## Further Reading

- [Development Guide](DEVELOPMENT.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Architecture Guide](ARCHITECTURE.md)
- [Security Policy](../SECURITY.md)
