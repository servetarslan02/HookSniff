# HookRelay — Deployment Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development (Docker Compose)](#local-development-docker-compose)
- [Production Deployment (Fly.io)](#production-deployment-flyio)
  - [1. Neon PostgreSQL Setup](#1-neon-postgresql-setup)
  - [2. Fly.io App Setup](#2-flyio-app-setup)
  - [3. Environment Variables](#3-environment-variables)
  - [4. Deploy Services](#4-deploy-services)
  - [5. Database Migrations](#5-database-migrations)
  - [6. Custom Domain](#6-custom-domain)
- [Environment Variables Reference](#environment-variables-reference)
- [Stripe Configuration](#stripe-configuration)
- [Monitoring](#monitoring)
- [Scaling](#scaling)
- [Backup & Restore](#backup--restore)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Local Development
- Docker & Docker Compose v2+
- 4 GB RAM minimum

### Production
- [Fly.io](https://fly.io) account (free tier available)
- [Neon](https://neon.tech) PostgreSQL account (free tier: 0.5 GB)
- [Stripe](https://stripe.com) account (for billing)
- Domain name (optional, for custom domain)

---

## Local Development (Docker Compose)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/servetarslan02/hookrelay.git
cd hookrelay

# Copy environment file
cp .env.example .env

# Start everything
make local
```

This starts:
| Service | Port | URL |
|---------|------|-----|
| PostgreSQL | 5432 | `postgresql://hookrelay:hookrelay_local@localhost:5432/hookrelay` |
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
make generate-secret  # Generate random secret
make generate-api-key # Generate sample API key
```

### First API Call

```bash
# Register
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPass123!"}'

# Use the returned API key for subsequent requests
curl http://localhost:3000/v1/endpoints \
  -H "Authorization: Bearer hr_live_YOUR_KEY"
```

### Docker Compose Architecture

```
docker-compose.yml (development)
├── postgres:16-alpine     — Database (port 5432)
├── hookrelay-api          — API server (port 3000)
├── hookrelay-worker       — Background worker
└── hookrelay-dashboard    — Next.js UI (port 3001)
```

---

## Production Deployment (Fly.io)

### 1. Neon PostgreSQL Setup

[Neon](https://neon.tech) provides serverless PostgreSQL with a generous free tier.

**Step 1: Create a Neon project**

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project: `hookrelay-prod`
3. Choose region closest to your Fly.io deployment (e.g., `us-east-1`)
4. Note the connection string

**Step 2: Get connection string**

```
postgresql://username:password@ep-cool-rain-123456.us-east-2.aws.neon.tech/hookrelay?sslmode=require
```

> ⚠️ Always use `sslmode=require` for Neon connections.

**Step 3: Run migrations**

```bash
# Connect and run schema
psql "postgresql://username:password@ep-xxx.neon.tech/hookrelay?sslmode=require" \
  -f migrations/001_init.sql
```

Or use the Neon SQL editor in the dashboard.

**Step 4: Enable connection pooling (optional)**

Neon supports connection pooling via a pooled connection string:
```
postgresql://username:password@ep-xxx-pooler.neon.tech/hookrelay?sslmode=require
```

Use the pooled string for the API server (high connection churn) and the direct string for migrations.

---

### 2. Fly.io App Setup

**Step 1: Install Fly CLI**

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Login
fly auth login
```

**Step 2: Create the app**

```bash
cd hookrelay

# Create app (choose a unique name)
fly launch --no-deploy --name hookrelay-api

# This creates fly.toml — we'll edit it next
```

**Step 3: Configure `fly.toml`**

```toml
app = "hookrelay-api"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile.api"

[env]
  APP_ENV = "production"
  PORT = "3000"
  RUST_LOG = "info"
  MAX_PAYLOAD_BYTES = "1048576"
  RETENTION_DAYS = "30"
  WEBHOOK_FORMAT = "standard"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

  [http_service.concurrency]
    type = "requests"
    hard_limit = 250
    soft_limit = 200

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512

[[services]]
  protocol = "tcp"
  internal_port = 3000

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [[services.ports]]
    port = 80
    handlers = ["http"]
```

---

### 3. Environment Variables

Set secrets in Fly.io:

```bash
# Database
fly secrets set DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/hookrelay?sslmode=require"

# Auth
fly secrets set JWT_SECRET="$(openssl rand -hex 32)"
fly secrets set HMAC_SECRET="$(openssl rand -hex 32)"

# Stripe (get from Stripe dashboard)
fly secrets set STRIPE_SECRET_KEY="sk_live_..."
fly secrets set STRIPE_WEBHOOK_SECRET="whsec_..."
fly secrets set STRIPE_PRO_PRICE_ID="price_..."
fly secrets set STRIPE_BUSINESS_PRICE_ID="price_..."

# PostgreSQL queue configuration
fly secrets set KAFKA_BROKERS="broker1:9092,broker2:9092"
fly secrets set KAFKA_TOPIC="webhook-deliveries"
```

Verify secrets:
```bash
fly secrets list
```

---

### 4. Deploy Services

**Deploy the API:**

```bash
fly deploy
```

**Deploy the Worker (separate Fly app):**

```bash
# Create a separate app for the worker
fly launch --no-deploy --name hookrelay-worker --dockerfile Dockerfile.worker

# Copy the same secrets
fly secrets set \
  DATABASE_URL="..." \
  KAFKA_BROKERS="..." \
  KAFKA_TOPIC="webhook-deliveries" \
  RUST_LOG="info"

# Worker doesn't need HTTP — configure as machine
fly scale count 1

fly deploy
```

**Deploy the Dashboard (separate Fly app or Vercel):**

Option A: Fly.io
```bash
fly launch --no-deploy --name hookrelay-dashboard --dockerfile Dockerfile.dashboard

fly secrets set \
  NEXT_PUBLIC_API_URL="https://hookrelay-api.fly.dev/v1"

fly deploy
```

Option B: Vercel (recommended for Next.js)
```bash
cd dashboard
vercel --prod
# Set NEXT_PUBLIC_API_URL in Vercel environment variables
```

---

### 5. Database Migrations

```bash
# Option 1: Direct psql
psql "$DATABASE_URL" -f migrations/001_init.sql

# Option 2: Using Fly SSH
fly ssh console -C "psql \$DATABASE_URL -f /app/migrations/001_init.sql"

# Option 3: Neon SQL Editor
# Copy/paste migrations into the Neon dashboard SQL editor
```

**Migration files:**
```
migrations/
├── 001_init.sql           # Core tables (customers, endpoints, deliveries)
├── 002_api_keys.sql       # API keys table
├── 003_delivery_attempts.sql  # Delivery attempt tracking
└── 005_alerts.sql         # Alert rules
```

---

### 6. Custom Domain

```bash
# Add domain to API app
fly certs add api.hookrelay.is-a.dev

# Add domain to Dashboard
fly certs add dashboard.hookrelay.is-a.dev

# Check certificate status
fly certs list
fly certs show api.hookrelay.is-a.dev
```

**DNS records to add:**

| Type | Name | Value |
|------|------|-------|
| A | `api` | `<fly.io IP>` |
| AAAA | `api` | `<fly.io IPv6>` |
| CNAME | `dashboard` | `hookrelay-dashboard.fly.dev` |

Get IPs:
```bash
fly ips list
```

---

## Environment Variables Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | JWT signing secret (min 32 bytes) | `openssl rand -hex 32` |
| `HMAC_SECRET` | Webhook payload signing secret | `openssl rand -hex 32` |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_ENV` | `development` | Environment name |
| `PORT` | `3000` | API server port |
| `RUST_LOG` | `info` | Log level (`debug`, `info`, `warn`, `error`) |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `MAX_ATTEMPTS` | `3` | Max delivery attempts |
| `MAX_PAYLOAD_BYTES` | `1048576` | Max webhook payload size (1 MB) |
| `RETENTION_DAYS` | `30` | Days to keep delivery logs |
| `WEBHOOK_FORMAT` | `standard` | Webhook format (`standard` for Standard Webhooks) |
| `WEBHOOK_TIMESTAMP_TOLERANCE_SECS` | `300` | Timestamp tolerance for signature verification |

### Stripe (Billing)

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `STRIPE_PRO_PRICE_ID` | Stripe Price ID for Pro plan |
| `STRIPE_BUSINESS_PRICE_ID` | Stripe Price ID for Business plan |

### Dashboard

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API base URL (e.g., `https://api.hookrelay.is-a.dev/v1`) |

---

## Stripe Configuration

### 1. Create Products & Prices

In the Stripe Dashboard:

1. **Product: HookRelay Pro**
   - Price: $49/month recurring
   - Note the Price ID: `price_xxxxx`

2. **Product: HookRelay Business**
   - Price: $149/month recurring
   - Note the Price ID: `price_yyyyy`

### 2. Configure Webhook Endpoint

In Stripe Dashboard → Developers → Webhooks:

- **Endpoint URL:** `https://api.hookrelay.is-a.dev/v1/billing/webhook`
- **Events:**
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### 3. Set Environment Variables

```bash
fly secrets set \
  STRIPE_SECRET_KEY="sk_live_..." \
  STRIPE_WEBHOOK_SECRET="whsec_..." \
  STRIPE_PRO_PRICE_ID="price_..." \
  STRIPE_BUSINESS_PRICE_ID="price_..."
```

### 4. Test Webhooks (Development)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/v1/billing/webhook
```

---

## Monitoring

### Health Check

```bash
curl https://api.hookrelay.is-a.dev/v1/health
```

```json
{
  "status": "ok",
  "service": "hookrelay-api",
  "version": "0.1.0"
}
```

### Prometheus Metrics

The API exposes metrics at `/metrics` (internal only).

### Grafana (Optional)

```bash
# Start monitoring stack locally
docker compose -f monitoring/docker-compose.monitoring.yml up -d

# Access Grafana
open http://localhost:3002
# Default: admin / hookrelay_grafana_change_me
```

### Fly.io Monitoring

```bash
# View logs
fly logs

# View machines
fly machine list

# View metrics
fly dashboard metrics
```

---

## Scaling

### Fly.io Auto-scaling

HookRelay uses Fly.io's auto-scaling:

```toml
[http_service]
  auto_stop_machines = true    # Scale to zero when idle
  auto_start_machines = true   # Scale up on demand
  min_machines_running = 0     # Minimum machines (set to 1 for always-on)

  [http_service.concurrency]
    type = "requests"
    hard_limit = 250           # Max concurrent requests per machine
    soft_limit = 200           # Scale trigger
```

### Manual Scaling

```bash
# Scale API to 2 machines
fly scale count 2 --app hookrelay-api

# Scale worker to 2 machines
fly scale count 2 --app hookrelay-worker

# Increase memory
fly scale memory 1024 --app hookrelay-api
```

### Database Scaling (Neon)

Neon auto-scales compute based on load. For higher limits:

1. Upgrade Neon plan (Pro: 8 GB storage, better performance)
2. Enable autoscaling in Neon dashboard
3. Use connection pooling for high-concurrency workloads

---

## Backup & Restore

### Neon Backups

Neon provides automatic backups:
- **Free tier:** Point-in-time restore (24 hours)
- **Pro tier:** Point-in-time restore (7 days)

### Manual Backup

```bash
# Full database dump
pg_dump "$DATABASE_URL" --format=custom --file=hookrelay-backup-$(date +%Y%m%d).dump

# Restore
pg_restore --clean --if-exists -d "$DATABASE_URL" hookrelay-backup-20260506.dump
```

### Automated Backups (Cron)

```bash
# Add to crontab
0 3 * * * pg_dump "$DATABASE_URL" --format=custom --file="/backups/hookrelay-$(date +\%Y\%m\%d).dump"
```

---

## Troubleshooting

### API won't start

```bash
# Check logs
fly logs --app hookrelay-api

# Common issues:
# 1. DATABASE_URL not set → fly secrets list
# 2. Migration not run → psql "$DATABASE_URL" -f migrations/001_init.sql
# 3. Port conflict → check PORT env var
```

### Database connection issues

```bash
# Test connection
psql "$DATABASE_URL" -c "SELECT 1;"

# Check Neon status: https://console.neon.tech
# Ensure sslmode=require is in connection string
```

### Webhook delivery failures

```bash
# Check worker logs
fly logs --app hookrelay-worker

# Check endpoint health
curl -H "Authorization: Bearer hr_live_..." \
  https://api.hookrelay.is-a.dev/v1/endpoint-health

# Common issues:
# 1. Endpoint URL unreachable
# 2. Endpoint returning 4xx/5xx
# 3. PostgreSQL down
```

### Stripe webhook issues

```bash
# Test webhook endpoint
curl -X POST https://api.hookrelay.is-a.dev/v1/billing/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "ping"}'

# Check Stripe webhook logs in Stripe Dashboard
# Ensure STRIPE_WEBHOOK_SECRET matches the signing secret
```

### Rate limiting

Check response headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 45
```

If hitting limits:
1. Upgrade plan
2. Implement request batching (`POST /v1/webhooks/batch`)
3. Cache responses client-side

### Memory issues

```bash
# Check machine resources
fly machine list --app hookrelay-api

# Increase memory
fly scale memory 1024 --app hookrelay-api

# Or update fly.toml
# [[vm]]
#   memory_mb = 1024
```
