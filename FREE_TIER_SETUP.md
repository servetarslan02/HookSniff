# 🆓 HookRelay — Free Tier Deployment Guide

Deploy HookRelay to production for **$0/month** using free-tier services.

This guide walks you through setting up every service, getting credentials, and configuring your environment.

---

## Table of Contents

1. [Overview](#overview)
2. [Neon — Database](#1-neon--postgresql-database)
3. [Upstash — Redis Queue](#2-upstash--redis)
4. [Oracle Cloud — API + Worker Hosting](#3-oracle-cloud--api--worker)
5. [Vercel — Dashboard Hosting](#4-vercel--dashboard)
6. [Grafana Cloud — Monitoring](#5-grafana-cloud--monitoring)
7. [Cloudflare R2 — Storage](#6-cloudflare-r2--storage)
8. [Resend — Email](#7-resend--email)
9. [Cloudflare — CDN/DNS](#8-cloudflare--cdndns)
10. [Environment Variables](#environment-variables)
11. [Deployment Checklist](#deployment-checklist)
12. [Gotchas & Limitations](#gotchas--limitations)

---

## Overview

| Service | Purpose | Free Tier | Cost After Free |
|---------|---------|-----------|-----------------|
| Neon | PostgreSQL database | 0.5 GB, 100 CU-hrs, 10 projects | $19/mo (Scale) |
| Upstash Redis | Rate limiting + caching | 256 MB, 500K cmds/mo | $120/mo (Pro) |
| Oracle Cloud | API + Worker hosting | 4 OCPU ARM, 24 GB RAM (forever) | Pay-as-you-go |
| Vercel | Dashboard hosting | 100 GB BW, unlimited sites | $20/mo (Pro) |
| Grafana Cloud | Monitoring + tracing | 10K metrics, 50 GB logs, 50 GB traces | Pay-as-you-go |
| Cloudflare R2 | Webhook payload storage | 10 GB, egress free | $0.015/GB-mo |
| Resend | Email notifications | 3,000/mo, 100/day | $20/mo (50K) |
| Cloudflare | CDN, DNS, SSL, DDoS | Unlimited (free plan) | $20/mo (Pro) |

**Total monthly cost: $0**

---

## 1. Neon — PostgreSQL Database

**What it does:** Hosts the main PostgreSQL database for HookRelay (users, endpoints, webhooks, delivery logs, queue).

### Free Tier Limits

- **Storage:** 0.5 GB
- **Compute:** 100 CU-hours/month (auto-scales to zero when idle)
- **Projects:** 10
- **Branches:** Unlimited (for dev/staging)
- **Connections:** Pooling included (serverless driver or connection pooler)

### Step-by-Step Setup

1. **Go to** [neon.tech](https://neon.tech)
2. **Sign up** with GitHub or email
3. **Create a project:**
   - Name: `hookrelay-prod`
   - Region: Choose closest to your users (e.g., `US East` or `EU Frankfurt`)
4. **Copy the connection string** from the dashboard:
   ```
   postgresql://neondb_owner:YOUR_PASSWORD@ep-cool-bird-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. **Create the database schema:**
   ```bash
   # From the hookrelay project directory
   psql "YOUR_CONNECTION_STRING" -f migrations/001_initial.sql
   ```

### Environment Variables

```env
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-cool-bird-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Gotchas

- **Idle compute pauses** after 5 minutes of inactivity. First request after idle takes ~1-2 seconds to wake up. This is fine for most webhook workloads.
- **0.5 GB fills up fast** with webhook logs. Set `RETENTION_DAYS=7` (free plan) or implement log rotation.
- **Connection pooling:** Use the `-pooler` endpoint for serverless environments (Vercel, Cloudflare Workers). Direct connections may hit limits.
- **Branching** is great for dev — create a branch for testing, delete when done.

---

## 2. Upstash — Redis

**What it does:** Provides Redis for rate limiting, request deduplication, and caching. Complements the PostgreSQL queue.

### Free Tier Limits

- **Storage:** 256 MB
- **Commands:** 500,000/month
- **Bandwidth:** Unlimited
- **Max connections:** 100 concurrent
- **Regions:** Single region (choose closest to your Oracle Cloud VM)

### Step-by-Step Setup

1. **Go to** [upstash.com](https://upstash.com)
2. **Sign up** with GitHub or email
3. **Create a Redis database:**
   - Name: `hookrelay-redis`
   - Region: Choose closest to your Oracle Cloud VM (e.g., `us-east-1`)
   - Type: `Regional` (not Global — lower latency)
4. **Copy the credentials:**
   - Go to **Details** → **REST API**
   - Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### Environment Variables

```env
REDIS_URL=rediss://default:YOUR_TOKEN@YOUR_REGION-xxx.upstash.io:6379
# Or use REST API (recommended for serverless):
UPSTASH_REDIS_REST_URL=https://xxx-xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYxxASQxxxxxxxxxxxxxxxxxxxxx
```

### Gotchas

- **500K commands/month** = ~16K/day. At 1,000 webhooks/month (free plan), you'll use ~30K commands/month for rate limiting. Plenty of headroom.
- **Choose Regional** (not Global) for lower latency with your Oracle Cloud VM.
- **No Lua scripts** on free tier — use pipelining for atomic operations.
- **Connection pooling:** Upstash handles this automatically via REST API.

---

## 3. Oracle Cloud — API + Worker Hosting

**What it does:** Hosts the Rust API server and background worker. Oracle Cloud's "Always Free" tier provides permanent ARM VMs at no cost.

### Free Tier Limits (Always Free — No Expiration)

- **ARM Ampere A1:** 4 OCPU + 24 GB RAM total (can split into up to 4 VMs)
- **AMD VMs:** 2 VMs (1/8 OCPU, 1 GB RAM each)
- **Storage:** 200 GB total (boot + block volumes)
- **Bandwidth:** 10 TB/month outbound
- **Public IPs:** Up to 2 (ARM) + 2 (AMD) = 4 total
- **Load Balancer:** 1 instance (10 Mbps)

### Step-by-Step Setup

1. **Go to** [cloud.oracle.com](https://cloud.oracle.com/free)
2. **Create an account:**
   - Email, password, home region
   - **Credit card required** for identity verification only — you will NOT be charged for Always Free resources
   - Choose a region close to your users (e.g., `us-ashburn-1`, `eu-frankfurt-1`)
3. **Create an ARM VM (A1 Flex):**
   - Go to **Compute** → **Instances** → **Create Instance**
   - Image: `Canonical Ubuntu 24.04 Minimal aarch64`
   - Shape: `VM.Standard.A1.Flex` — set to **4 OCPU, 24 GB RAM**
   - Networking: Create a new VCN or use default
   - Add your SSH public key (generate one if needed: `ssh-keygen -t ed25519`)
4. **Open firewall ports:**
   - Go to **Networking** → **Virtual Cloud Networks** → your VCN → **Security Lists** → Default
   - Add ingress rules:
     - Port `3000` (API) — TCP, Source `0.0.0.0/0`
     - Port `22` (SSH) — TCP, Source `0.0.0.0/0` (restrict to your IP for security)
5. **SSH into the VM:**
   ```bash
   ssh -i ~/.ssh/id_ed25519 ubuntu@YOUR_VM_PUBLIC_IP
   ```
6. **Install Docker:**
   ```bash
   # Update packages
   sudo apt update && sudo apt upgrade -y

   # Install Docker
   curl -fsSL https://get.docker.com | sudo sh
   sudo usermod -aG docker $USER
   newgrp docker

   # Verify
   docker --version
   ```
7. **Deploy HookRelay:**
   ```bash
   # Clone the repo
   git clone https://github.com/servetarslan02/hookrelay.git
   cd hookrelay

   # Create .env with production values
   cp .env.example .env
   nano .env  # Edit with your Neon, Upstash, Stripe credentials

   # Start API + Worker
   docker compose -f docker-compose.prod.yml up -d
   ```
8. **Set up a systemd service** (auto-restart on reboot):
   ```bash
   sudo tee /etc/systemd/system/hookrelay.service <<EOF
   [Unit]
   Description=HookRelay API + Worker
   After=docker.service
   Requires=docker.service

   [Service]
   Type=oneshot
   RemainAfterExit=yes
   WorkingDirectory=/home/ubuntu/hookrelay
   ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
   ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down

   [Install]
   WantedBy=multi-user.target
   EOF

   sudo systemctl enable hookrelay
   sudo systemctl start hookrelay
   ```

### Environment Variables

```env
# Set in .env on the Oracle Cloud VM
APP_ENV=production
PORT=3000
DATABASE_URL=postgresql://neondb_owner:...@ep-xxx.neon.tech/neondb?sslmode=require
REDIS_URL=rediss://default:...@xxx.upstash.io:6379
```

### Gotchas

- **Always Free is truly free** — Oracle will never charge you for these resources. They're "always free" by design.
- **Credit card** is only for identity verification. If you exceed Always Free limits, services stop (not charge).
- **ARM architecture** — Make sure your Docker images are built for `linux/arm64`. The provided `Dockerfile.api` and `Dockerfile.worker` should work, but test locally first.
- **Boot volume:** 47 GB included. Don't fill it up with Docker images — use `docker system prune` regularly.
- **Public IP:** Oracle assigns ephemeral public IPs by default. For a permanent IP, allocate a reserved public IP (free, up to 2 for ARM).
- **Outbound port 25** is blocked by default (anti-spam). Use Resend or SMTP relay for email.
- **No built-in HTTPS** — You'll need Cloudflare or Let's Encrypt for SSL (see Cloudflare section).

---

## 4. Vercel — Dashboard Hosting

**What it does:** Hosts the Next.js dashboard and landing page with automatic deployments from GitHub.

### Free Tier Limits

- **Bandwidth:** 100 GB/month
- **Builds:** 6,000 minutes/month
- **Serverless Functions:** 100 GB-hours
- **Sites:** Unlimited
- **Custom Domains:** Unlimited
- **Team Members:** 1 (personal), up to 10 with Hobby)

### Step-by-Step Setup

1. **Go to** [vercel.com](https://vercel.com)
2. **Sign up** with GitHub
3. **Import your repo:**
   - Click **Add New** → **Project**
   - Select your `hookrelay` repo
   - Framework: `Next.js` (auto-detected)
   - Root Directory: `dashboard`
4. **Configure environment variables:**
   - `NEXT_PUBLIC_API_URL` = `https://api.hookrelay.is-a.dev/v1` (your Oracle Cloud API URL)
5. **Deploy:** Click **Deploy** — Vercel builds and deploys automatically on every push to `main`

### Environment Variables

```env
# Set in Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_API_URL=https://api.hookrelay.is-a.dev/v1
```

### Gotchas

- **Serverless functions** run on the edge. They can't connect to your Oracle Cloud VM directly via internal network — use the public URL.
- **`NEXT_PUBLIC_API_URL`** is embedded at build time. Changing it requires a redeploy.
- **100 GB bandwidth** is generous for a dashboard. You'll hit limits only with heavy traffic.
- **Preview deployments** get their own URL — useful for testing but costs build minutes.
- **Custom domain:** Add your domain in Vercel → Settings → Domains for a cleaner URL.

---

## 5. Grafana Cloud — Monitoring

**What it does:** Provides metrics dashboards, log aggregation, and distributed tracing for HookRelay.

### Free Tier Limits

- **Metrics:** 10,000 active series
- **Logs:** 50 GB/month
- **Traces:** 50 GB/month
- **Dashboards:** Unlimited
- **Alerts:** Unlimited
- **Users:** 3

### Step-by-Step Setup

1. **Go to** [grafana.com](https://grafana.com)
2. **Sign up** for Grafana Cloud (free account)
3. **Get your credentials:**
   - Go to **My Account** → **Details** (left sidebar)
   - Copy the following:
     - **Stack URL** (e.g., `https://xxx.grafana.net`)
     - **OTLP Endpoint** (e.g., `otlp-gateway-xxx.grafana.net`)
     - **Grafana URL** (e.g., `https://xxx.grafana.net`)
4. **Create an API key:**
   - Go to **Security** → **API Keys**
   - Create a key with **Admin** role
   - Copy the key (you'll only see it once)
5. **Configure OpenTelemetry in HookRelay:**
   - Set `OTEL_ENABLED=true` in your `.env`
   - Set the OTLP endpoint and credentials

### Environment Variables

```env
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-xxx.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic BASE64_ENCODED_CREDENTIALS
```

**To get the base64 credentials:**
```bash
echo -n "YOUR_GRAFANA_CLOUD_INSTANCE_ID:YOUR_API_KEY" | base64
```

### Gotchas

- **10K active series** is enough for a small-to-medium webhook service. Each endpoint, webhook type, and status code creates a series.
- **50 GB logs** = ~500K-1M log lines/month. Use structured logging (JSON) to stay within limits.
- **OTLP over HTTP** (not gRPC) is recommended for serverless/container environments.
- **Data retention** on free tier is 14 days for logs, 90 days for metrics.
- **Alerting** is free — set up alerts for high error rates, queue depth, and delivery failures.

---

## 6. Cloudflare R2 — Storage

**What it does:** Stores webhook payloads, delivery attempt details, and dead letter queue entries with zero egress fees.

### Free Tier Limits

- **Storage:** 10 GB
- **Class A operations** (writes): 1 million/month
- **Class B operations** (reads): 10 million/month
- **Egress:** FREE (unlimited)
- **No egress fees** — This is R2's killer feature vs S3

### Step-by-Step Setup

1. **Go to** [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Sign up** or log in (same account as CDN)
3. **Enable R2:**
   - Left sidebar → **R2 Object Storage**
   - Click **Create Bucket**
   - Name: `hookrelay-storage`
   - Location: `Automatic` (or choose closest region)
4. **Create API credentials:**
   - Click **Manage R2 API Tokens**
   - Click **Create API Token**
   - Permissions: `Object Read & Write`
   - Apply to: `hookrelay-storage` bucket
   - Copy the **Access Key ID** and **Secret Access Key**

### Environment Variables

```env
R2_ACCOUNT_ID=YOUR_CLOUDFLARE_ACCOUNT_ID
R2_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
R2_BUCKET_NAME=hookrelay-storage
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
```

### Gotchas

- **10 GB** is enough for storing thousands of webhook payloads. Implement cleanup with `RETENTION_DAYS`.
- **Zero egress** — Unlike S3, R2 doesn't charge for data transfer out. This saves significant costs at scale.
- **S3-compatible API** — You can use any S3 SDK (AWS SDK, boto3, etc.) with R2 by setting the endpoint.
- **No free custom domains** on free plan — use the default `*.r2.cloudflarestorage.com` endpoint.

---

## 7. Resend — Email

**What it does:** Sends transactional emails (account verification, alert notifications, billing receipts).

### Free Tier Limits

- **Emails:** 3,000/month
- **Daily limit:** 100/day
- **Custom domain:** 1 domain
- **Team members:** 1
- **Email API:** Full access

### Step-by-Step Setup

1. **Go to** [resend.com](https://resend.com)
2. **Sign up** with GitHub or email
3. **Get your API key:**
   - Go to **API Keys** in the dashboard
   - Click **Create API Key**
   - Name: `hookrelay-prod`
   - Copy the key (starts with `re_`)
4. **Add your domain** (optional but recommended):
   - Go to **Domains** → **Add Domain**
   - Enter your domain (e.g., `hookrelay.is-a.dev`)
   - Add the DNS records (SPF, DKIM, DMARC) to your Cloudflare DNS
   - Wait for verification (~5 minutes)
5. **Test:**
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer re_YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"from": "noreply@hookrelay.is-a.dev", "to": "you@example.com", "subject": "Test", "html": "<p>Hello!</p>"}'
   ```

### Environment Variables

```env
RESEND_API_KEY=re_YOUR_API_KEY
NOTIFY_EMAIL=admin@example.com
NOTIFY_EMAIL_FROM=noreply@hookrelay.is-a.dev
```

### Gotchas

- **100/day** = 3,000/month. If you need more, upgrade to the $20/mo plan (50K emails).
- **Custom domain** improves deliverability. Without it, emails come from `onresend.com` which may hit spam filters.
- **No SMTP** — Resend uses REST API only. If your code uses SMTP, you'll need an adapter.
- **Rate limiting:** 10 emails/second. Batch sends accordingly.

---

## 8. Cloudflare — CDN/DNS

**What it does:** Provides DNS, SSL/TLS, CDN caching, DDoS protection, and acts as a reverse proxy for your API.

### Free Tier Limits

- **DNS:** Unlimited queries
- **SSL/TLS:** Free Universal SSL certificate
- **CDN:** Unlimited bandwidth
- **DDoS Protection:** Unlimited
- **Page Rules:** 3 (enough for basic caching)
- **Workers:** 100K requests/day (optional, for edge logic)

### Step-by-Step Setup

1. **Go to** [cloudflare.com](https://cloudflare.com)
2. **Sign up** and add your domain
3. **Change nameservers** at your domain registrar to Cloudflare's nameservers (provided during setup)
4. **Wait for DNS propagation** (~5-30 minutes)
5. **Create DNS records:**
   | Type | Name | Value | Proxy |
   |------|------|-------|-------|
   | A | `api` | YOUR_ORACLE_VM_IP | ✅ Proxied |
   | CNAME | `dashboard` | `cname.vercel-dns.com` | ✅ Proxied |
   | CNAME | `www` | `cname.vercel-dns.com` | ✅ Proxied |
6. **Configure SSL:**
   - Go to **SSL/TLS** → Set to **Full (Strict)**
   - This ensures end-to-end encryption between Cloudflare and your origin server
7. **Set up origin certificates** (optional but recommended):
   - Go to **SSL/TLS** → **Origin Server** → **Create Certificate**
   - Install the certificate on your Oracle Cloud VM (Nginx/Caddy)
8. **Page Rules** (optional):
   - Cache everything for dashboard: `hookrelay.is-a.dev/*` → Cache Level: Cache Everything

### Environment Variables

```env
# Set in .env on Oracle Cloud
CORS_ORIGINS=https://hookrelay.is-a.dev,https://hookrelay.is-a.dev
APP_URL=https://hookrelay.is-a.dev
```

### Gotchas

- **"Proxied"** means Cloudflare hides your Oracle VM's IP. This is good for security and DDoS protection.
- **Full (Strict) SSL** requires an origin certificate on your VM. Without it, use "Full" (not strict).
- **Free plan** includes DDoS protection — no need to upgrade for security.
- **Orange cloud** (proxied) vs **Grey cloud** (DNS only): Keep API and dashboard proxied for SSL and caching.
- **API caching:** Be careful with Cloudflare's default caching. API responses shouldn't be cached — add a Page Rule for `api.hookrelay.is-a.dev/*` with Cache Level: Bypass.

---

## Environment Variables

Here's a complete `.env` template for production deployment:

```env
# ═══════════════════════════════════════
#  HookRelay — Production Configuration
# ═══════════════════════════════════════

# ── Application ──
APP_ENV=production
PORT=3000
RUST_LOG=info,hookrelay=debug

# ── Database (Neon) ──
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-xxx.neon.tech/neondb?sslmode=require

# ── Redis (Upstash) ──
REDIS_URL=rediss://default:YOUR_TOKEN@xxx.upstash.io:6379

# ── Security (⚠️ Generate with: openssl rand -hex 32) ──
HMAC_SECRET=your-64-char-random-hex-string
JWT_SECRET=your-64-char-random-hex-string

# ── Rate Limiting ──
MAX_PAYLOAD_BYTES=1048576

# ── Data Retention ──
RETENTION_DAYS=7

# ── CORS ──
CORS_ORIGINS=https://hookrelay.is-a.dev

# ── App URL (for Stripe redirects) ──
APP_URL=https://hookrelay.is-a.dev

# ── Stripe (optional) ──
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_BUSINESS=price_...

# ── Email (Resend) ──
RESEND_API_KEY=re_...
NOTIFY_EMAIL=admin@example.com
NOTIFY_EMAIL_FROM=noreply@hookrelay.is-a.dev

# ── Storage (Cloudflare R2) ──
R2_ACCOUNT_ID=your_cf_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=hookrelay-storage
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com

# ── Monitoring (Grafana Cloud) ──
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-xxx.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic BASE64_ENCODED_CREDENTIALS

# ── Logging ──
LOG_FORMAT=json

# ── Notifications (optional) ──
SLACK_WEBHOOK_URL=
```

---

## Deployment Checklist

- [ ] **Neon:** Create project, copy connection string, run migrations
- [ ] **Upstash:** Create Redis database, copy URL + token
- [ ] **Oracle Cloud:** Create ARM VM, install Docker, deploy containers
- [ ] **Vercel:** Import dashboard repo, set `NEXT_PUBLIC_API_URL`
- [ ] **Grafana Cloud:** Create stack, get OTLP endpoint + API key
- [ ] **Cloudflare R2:** Create bucket, get S3 credentials
- [ ] **Resend:** Get API key, add custom domain (optional)
- [ ] **Cloudflare CDN:** Add domain, configure DNS records, set SSL to Full (Strict)
- [ ] **Generate secrets:** `HMAC_SECRET` and `JWT_SECRET` (openssl rand -hex 32)
- [ ] **Test:** Send a test webhook end-to-end
- [ ] **Monitor:** Check Grafana dashboards for errors
- [ ] **Set up alerts:** Grafana alerts for high error rate, queue depth

---

## Gotchas & Limitations

### General

- **Free tiers can change.** Services may reduce free limits or discontinue them. Monitor announcements.
- **No SLA on free tiers.** If a service goes down, you have no support. Use multiple services to reduce single points of failure.
- **Upgrade triggers:** You'll hit limits when:
  - Neon: > 0.5 GB data or > 100 CU-hours compute
  - Upstash: > 500K Redis commands/month
  - Vercel: > 100 GB bandwidth/month
  - Grafana: > 10K metric series
  - R2: > 10 GB storage
  - Resend: > 3K emails/month

### Performance

- **Oracle Cloud ARM** performs well for Rust workloads. Expect ~1-5ms API response times for simple operations.
- **Neon cold start** adds ~1-2 seconds after 5 minutes of idle. Use connection pooling to minimize impact.
- **Cloudflare** adds ~10-30ms of latency but provides global CDN and DDoS protection.

### Security

- **Always use `sslmode=require`** for Neon connections.
- **Generate strong secrets** — never use placeholder values in production.
- **Restrict SSH access** to your Oracle Cloud VM to your IP address.
- **Use Cloudflare** to hide your Oracle VM's IP address.

### Scaling Path

When you outgrow free tiers:

| Bottleneck | Solution | Cost |
|------------|----------|------|
| Neon storage > 0.5 GB | Neon Scale plan | $19/mo |
| Upstash commands > 500K | Upstash Pro | $120/mo |
| Need more VM resources | Oracle paid tier or AWS/GCP | $20-100/mo |
| Vercel bandwidth > 100 GB | Vercel Pro | $20/mo |
| Need more logs/metrics | Grafana Cloud paid | Pay-as-you-go |
| R2 storage > 10 GB | R2 paid | $0.015/GB-mo |
| Email > 3K/month | Resend Starter | $20/mo |

---

> 💡 **Tip:** Start with free tiers. Monitor usage. Upgrade only when you hit limits. The goal is $0 until you have paying customers.
