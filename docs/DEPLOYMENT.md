# HookSniff — Deployment Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development (Docker Compose)](#local-development-docker-compose)
- [Production Deployment (Google Cloud Run)](#production-deployment-google-cloud-run)
  - [1. Neon PostgreSQL Setup](#1-neon-postgresql-setup)
  - [2. Upstash Redis Setup](#2-upstash-redis-setup)
  - [3. GCP Service Account](#3-gcp-service-account)
  - [4. Cloud Run Deployment](#4-cloud-run-deployment)
  - [5. Dashboard (Vercel)](#5-dashboard-vercel)
  - [6. Database Migrations](#6-database-migrations)
- [Environment Variables Reference](#environment-variables-reference)
- [Billing Configuration](#billing-configuration)
- [Monitoring (Grafana Cloud)](#monitoring-grafana-cloud)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Local Development
- Docker & Docker Compose v2+
- 4 GB RAM minimum

### Production
- [Google Cloud](https://cloud.google.com) account (Cloud Run free tier)
- [Neon](https://neon.tech) PostgreSQL account (free tier: 0.5 GB)
- [Upstash](https://upstash.com) Redis account (free tier: 10K commands/day)
- [Vercel](https://vercel.com) account (for dashboard)
- [Polar.sh](https://polar.sh) account (for billing, optional)

---

## Local Development (Docker Compose)

### Quick Start

```bash
git clone https://github.com/servetarslan02/HookSniff.git
cd HookSniff
cp .env.example .env
make local
```

This starts:
| Service | Port | URL |
|---------|------|-----|
| PostgreSQL | 5432 | `postgresql://hooksniff:hooksniff_local@localhost:5432/hooksniff` |
| API Server | 3000 | http://localhost:3000/health |
| Dashboard | 3001 | http://localhost:3001 |
| Worker | — | (background) |

### Useful Commands

```bash
make local          # Start all services
make stop           # Stop all services
make restart        # Restart all services
make reset          # Reset everything (including DB data)
make fix            # Auto-fix common issues
make status         # Check service health
make logs           # Tail all logs
make logs-api       # API logs only
make logs-worker    # Worker logs only
make logs-db        # Database logs only
make db-shell       # Open PostgreSQL shell
```

---

## Production Deployment (Google Cloud Run)

HookSniff uses **Google Cloud Run** for API and Worker, **Vercel** for Dashboard, **Neon** for PostgreSQL, and **Upstash** for Redis. Total cost: **$0/month** on free tiers.

### 1. Neon PostgreSQL Setup

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create project: `hooksniff-prod`
3. Choose region: `eu-central-1` (Frankfurt)
4. Copy the connection string:
   ```
   postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/hooksniff?sslmode=require
   ```
5. Run migrations via Neon SQL editor or `psql`

> ⚠️ Always use `sslmode=require` for Neon connections.

### 2. Upstash Redis Setup

1. Go to [console.upstash.com](https://console.upstash.com)
2. Create Redis database: `hooksniff`
3. Choose region: `eu-west-1` (Ireland)
4. Copy the REST URL and token

### 3. GCP Service Account

1. Go to [GCP Console](https://console.cloud.google.com)
2. Create project: `hooksniff-app`
3. Enable Cloud Run API
4. Create service account: `hooksniff-deploy`
5. Grant roles: Cloud Run Admin, Secret Manager Admin, Artifact Registry Admin
6. Create JSON key → save securely (used in GitHub Actions)

### 4. Cloud Run Deployment

**Option A: GitHub Actions (recommended)**

CI/CD is configured in `.github/workflows/deploy.yml`:
1. Push to `main` → CI runs (lint, test, build)
2. If CI passes → Deploy triggers automatically
3. Docker images built and pushed to Artifact Registry
4. Cloud Run services updated with new images

Required GitHub Secrets:
- `GCP_SA_KEY` — Service account JSON key

**Option B: Manual deploy**

```bash
# Authenticate
gcloud auth activate-service-account --key-file=gcp-sa-key.json
gcloud config set project hooksniff-app

# Configure Docker
gcloud auth configure-docker europe-west1-docker.pkg.dev --quiet

# Build and push API
docker build -f Dockerfile.api -t europe-west1-docker.pkg.dev/hooksniff-app/hooksniff/api:latest .
docker push europe-west1-docker.pkg.dev/hooksniff-app/hooksniff/api:latest

# Deploy API
gcloud run deploy hooksniff-api \
  --image europe-west1-docker.pkg.dev/hooksniff-app/hooksniff/api:latest \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --timeout 300 \
  --set-env-vars "APP_ENV=production,RUST_LOG=info,LOG_FORMAT=json" \
  --set-secrets "DATABASE_URL=neon-db-url:latest,REDIS_URL=upstash-redis-url:latest,JWT_SECRET=jwt-secret:latest,HMAC_SECRET=hmac-secret:latest" \
  --project hooksniff-app

# Build and push Worker
docker build -f Dockerfile.worker -t europe-west1-docker.pkg.dev/hooksniff-app/hooksniff/worker:latest .
docker push europe-west1-docker.pkg.dev/hooksniff-app/hooksniff/worker:latest

# Deploy Worker
gcloud run deploy hooksniff-worker \
  --image europe-west1-docker.pkg.dev/hooksniff-app/hooksniff/worker:latest \
  --region europe-west1 \
  --platform managed \
  --no-allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 2 \
  --set-secrets "DATABASE_URL=neon-db-url:latest,REDIS_URL=upstash-redis-url:latest" \
  --project hooksniff-app
```

### 5. Dashboard (Vercel)

1. Connect GitHub repo to Vercel
2. Root Directory: `dashboard`
3. Framework: Next.js
4. Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://hooksniff-api-1046140057667.europe-west1.run.app/v1
   ```

### 6. Database Migrations

Migrations run automatically on API startup (`api/src/db.rs`).

Manual migration:
```bash
psql "$DATABASE_URL" -f migrations/001_init.sql
```

---

## Environment Variables Reference

### Required

| Variable | Description | Source |
|----------|-------------|--------|
| `DATABASE_URL` | PostgreSQL connection string | Neon Console |
| `REDIS_URL` | Redis connection string | Upstash Console |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `openssl rand -hex 32` |
| `HMAC_SECRET` | Webhook signing secret (min 32 chars) | `openssl rand -hex 32` |

### Application

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_ENV` | `development` | Environment (`production`, `development`) |
| `PORT` | `3000` | API server port |
| `RUST_LOG` | `info` | Log level |
| `LOG_FORMAT` | `text` | `json` for production |
| `MAX_PAYLOAD_BYTES` | `1048576` | Max webhook payload (bytes) |
| `RETENTION_DAYS` | `30` | Days to keep delivery logs |
| `WEBHOOK_FORMAT` | `standard` | `standard` or `cloudevents` |
| `WEBHOOK_TIMESTAMP_TOLERANCE_SECS` | `300` | Replay protection window (seconds) |
| `CORS_ORIGINS` | — | Comma-separated allowed origins |
| `APP_URL` | — | Dashboard URL for email links |
| `EMAIL_BASE_URL` | — | Base URL for email links |

### Billing (Polar.sh)

| Variable | Description |
|----------|-------------|
| `POLAR_ACCESS_TOKEN` | Polar.sh API token |
| `POLAR_WEBHOOK_SECRET` | Webhook signing secret |
| `POLAR_PRODUCT_PRO` | Product ID for Pro plan |
| `POLAR_PRODUCT_BUSINESS` | Product ID for Business plan |
| `POLAR_ENV` | `production` or `sandbox` |

### Billing (iyzico — Turkey)

| Variable | Description |
|----------|-------------|
| `IYZICO_API_KEY` | iyzico API key |
| `IYZICO_SECRET_KEY` | iyzico secret key |
| `IYZICO_ENV` | `sandbox` or `production` |

### Email (Gmail API)

| Variable | Description |
|----------|-------------|
| `GCP_SA_JSON` | GCP service account JSON (for Gmail API) |
| `NOTIFY_FROM_EMAIL` | Sender email address |
| `NOTIFY_EMAIL` | Admin notification email |

### Monitoring

| Variable | Description |
|----------|-------------|
| `OTEL_ENABLED` | `true` to enable OpenTelemetry |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Grafana Cloud OTLP endpoint |
| `OTEL_EXPORTER_OTLP_HEADERS` | Auth headers |

### Dashboard

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API base URL |

---

## Billing Configuration

### Polar.sh (Global)

1. Create account at [polar.sh](https://polar.sh)
2. Create products: HookSniff Pro ($49/mo), HookSniff Business ($149/mo)
3. Get API token from Settings → API
4. Set webhook endpoint: `https://hooksniff-api-1046140057667.europe-west1.run.app/v1/billing/webhook/polar`
5. Configure secrets in GCP Secret Manager

### iyzico (Turkey)

1. Create account at [iyzico](https://iyzico.com)
2. Get API key and secret from dashboard
3. Set webhook endpoint: `https://hooksniff-api-1046140057667.europe-west1.run.app/v1/billing/webhook/iyzico`
4. Configure secrets in GCP Secret Manager

---

## Monitoring (Grafana Cloud)

1. Create account at [grafana.com](https://grafana.com)
2. Create a stack (region: EU West)
3. Go to Connections → OpenTelemetry → Generate API token
4. Set environment variables:
   ```
   OTEL_ENABLED=true
   OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-eu-west-2.grafana.net
   OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <base64(stack_id:token)>
   ```
5. Import dashboards from `monitoring/` directory

---

## Troubleshooting

### Container fails to start

Check Cloud Run logs:
```bash
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="hooksniff-api"' --limit=20
```

Common causes:
- Missing environment variables
- Database connection failure
- OTLP exporter panic (check `OTEL_ENABLED=false` to test)

### Database connection issues

```bash
# Test connection
psql "$DATABASE_URL" -c "SELECT 1"

# Check migrations
psql "$DATABASE_URL" -c "SELECT * FROM _migrations ORDER BY version DESC LIMIT 5"
```

### Rate limit errors

Check Redis connection:
```bash
curl -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN" "$UPSTASH_REDIS_REST_URL/ping"
```
