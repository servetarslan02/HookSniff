# 🪝 HookSniff

[![CI](https://github.com/servetarslan02/HookSniff/actions/workflows/ci.yml/badge.svg)](https://github.com/servetarslan02/HookSniff/actions/workflows/ci.yml)
[![Deploy](https://github.com/servetarslan02/HookSniff/actions/workflows/deploy.yml/badge.svg)](https://github.com/servetarslan02/HookSniff/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/Rust-1.95+-orange.svg)](https://www.rust-lang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)

**The webhook infrastructure for developers.**

HookSniff is an open-source webhook delivery platform built in Rust. It handles sending, receiving, retrying, and monitoring webhooks — so you can focus on building your product.

---

---

## Why HookSniff?

Webhooks are the backbone of modern integrations, but building reliable webhook infrastructure is hard. HookSniff gives you:

- **Reliable delivery** — Automatic retries with exponential backoff and jitter. Failed deliveries go to a dead letter queue, never lost.
- **Standard Webhooks** — HMAC-SHA256 signatures with `whsec_` secrets, fully compliant with the [Standard Webhooks](https://www.standardwebhooks.com/) specification.
- **Smart routing** — Round-robin, failover, weighted, and random strategies with automatic fallback URLs.
- **FIFO ordering** — Guaranteed ordered delivery with sequence numbers for event-sourced systems.
- **Real-time visibility** — SSE streaming, WebSocket updates, and a full analytics dashboard.
- **Cortex AI** — ML-powered anomaly detection, auto-healing, drift detection, and predictive monitoring.
- **11 SDKs** — Official clients for Node.js, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, and Swift.

---

## Features

### Core Webhook Delivery

| Feature | Description |
|---------|-------------|
| **Automatic retries** | Exponential backoff with jitter, configurable per endpoint |
| **Dead letter queue** | Failed deliveries preserved for debugging and replay |
| **Batch operations** | Send and replay webhooks in bulk |
| **Idempotency** | `Idempotency-Key` header with 24h TTL prevents duplicate processing |
| **FIFO ordering** | Sequence numbers guarantee ordered delivery |
| **Per-endpoint throttling** | Token bucket / sliding window to protect customer servers |
| **Payload transformation** | Filter, map, and enrich webhook payloads per endpoint |
| **Schema registry** | JSON schema validation with versioning |
| **CloudEvents v1.0** | Standard event format support |
| **Multiple delivery methods** | HTTP, WebSocket, Email |

### Security

| Feature | Description |
|---------|-------------|
| **HMAC-SHA256 signatures** | Standard Webhooks compliant (`whsec_` secrets) |
| **SSRF protection** | Blocks private IPs, metadata endpoints, DNS validation |
| **Rate limiting** | Sliding window algorithm, per-plan limits |
| **API key auth** | `hr_live_*` / `hr_test_*` keys, Argon2id hashed |
| **JWT + 2FA** | Dashboard auth with TOTP two-factor authentication |
| **SSO/SAML** | Enterprise single sign-on |
| **OAuth** | Google and GitHub social login |
| **GDPR** | Data export and account deletion endpoints |

### Monitoring & Observability

| Feature | Description |
|---------|-------------|
| **Real-time stream** | SSE (`GET /v1/stream/deliveries`) + WebSocket |
| **Analytics** | Delivery trends, success rates, latency percentiles (24h/7d/30d) |
| **Alerts** | Configurable alert rules with notification channels |
| **Endpoint health** | Per-endpoint success rate, p95/p99 latency, failure streaks |
| **OpenTelemetry** | Distributed tracing with Grafana Cloud |
| **Prometheus metrics** | `GET /metrics` endpoint |
| **Cortex AI** | Anomaly detection, auto-healing, drift detection, predictive monitoring |

### Platform

| Feature | Description |
|---------|-------------|
| **Dashboard** | 40+ pages: analytics, endpoint management, team collaboration (Next.js 16) |
| **Admin panel** | User management, revenue dashboard, system health |
| **Teams** | Team CRUD, invitations, roles (admin/editor/viewer) |
| **Billing** | Polar.sh (global) + iyzico (Turkey) multi-provider support |
| **Inbound proxy** | Receive webhooks from Stripe, GitHub, Shopify |
| **Embeddable portal** | Customer-facing portal widget |
| **CLI** | Command-line tool for endpoint and webhook management |
| **11 SDKs** | Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift |

---

## Tech Stack

| Component | Technology | Hosting |
|---|---|---|
| **API** | Rust (Axum 0.8, sqlx 0.8) | Google Cloud Run |
| **Worker** | Rust (Tokio) | Google Cloud Run |
| **Database** | PostgreSQL 16 | Neon (serverless) |
| **Cache / Queue** | Redis | Upstash (serverless) |
| **Dashboard** | Next.js 16, React, TypeScript, Tailwind | Vercel |
| **CDN/DNS** | Cloudflare | Cloudflare Free |
| **Monitoring** | Grafana + OpenTelemetry | Grafana Cloud |
| **Storage** | Cloudflare R2 | S3-compatible |
| **Email** | Resend + Gmail API | Service Account |
| **Billing** | Polar.sh + iyzico | Per-transaction |

## Quick Start

### Local Development

```bash
# Clone
git clone https://github.com/servetarslan02/HookSniff.git
cd HookSniff

# Copy environment config
cp .env.example .env

# Start everything (PostgreSQL + API + Worker + Dashboard)
make local
```

API runs on `http://localhost:3000`
Dashboard runs on `http://localhost:3001`

### Production Deployment (Free Tier)

See **[FREE_TIER_SETUP.md](FREE_TIER_SETUP.md)** for a complete guide to deploying HookSniff on free-tier services (Google Cloud Run, Neon, Vercel, Upstash, Grafana Cloud, Cloudflare R2).

## API Usage

```bash
# Register
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "your-password"}'

# Create endpoint
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-app.com/webhook"}'

# Send webhook
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"endpoint_id": "YOUR_ENDPOINT_ID", "event": "order.created", "data": {"order_id": "12345"}}'
```

## Project Structure

```
HookSniff/
├── api/               # Rust Axum API server
│   ├── src/
│   │   ├── routes/    # API endpoints (auth, webhooks, billing, etc.)
│   │   ├── billing/   # Polar.sh, iyzico, Stripe integrations
│   │   ├── fifo/      # FIFO ordered delivery
│   │   ├── throttle/  # Per-endpoint throttling
│   │   ├── ws/        # WebSocket handler
│   │   └── ...
│   └── migrations/    # PostgreSQL migration scripts
├── worker/            # Background worker (retry + delivery)
├── dashboard/         # Next.js 15 dashboard + landing page
├── sdks/              # SDKs (Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift)
├── cli/               # CLI tool
├── portal/            # Embeddable portal widget
├── docs/              # API documentation (OpenAPI)
├── monitoring/        # Grafana + OpenTelemetry config
├── tests/             # Integration + load tests (k6)
├── docker-compose.yml
├── FREE_TIER_SETUP.md # Free-tier deployment guide
└── Makefile
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/auth/register` | Create account |
| POST | `/v1/auth/login` | Get JWT token (supports 2FA) |
| POST | `/v1/auth/2fa/enable` | Enable two-factor auth |
| GET | `/v1/auth/verify-email` | Verify email address |
| POST | `/v1/auth/forgot-password` | Request password reset |
| GET | `/v1/auth/export` | Export user data (GDPR) |
| DELETE | `/v1/auth/account` | Delete account (GDPR) |
| GET/POST | `/v1/endpoints` | List / Create endpoints |
| GET/PUT/DELETE | `/v1/endpoints/:id` | Get / Update / Delete endpoint |
| POST | `/v1/endpoints/:id/rotate-secret` | Rotate signing secret |
| POST | `/v1/webhooks` | Send webhook |
| POST | `/v1/webhooks/batch` | Send batch webhooks |
| GET | `/v1/webhooks` | List deliveries |
| GET | `/v1/webhooks/:id` | Get delivery |
| POST | `/v1/webhooks/:id/replay` | Replay webhook |
| GET | `/v1/stream/deliveries` | SSE real-time stream |
| GET | `/v1/analytics/deliveries` | Delivery trend data |
| GET | `/v1/analytics/success-rate` | Success rate metrics |
| GET | `/v1/search` | Search deliveries |
| GET/POST | `/v1/api-keys` | List / Create API keys |
| POST | `/v1/billing/upgrade` | Upgrade plan |
| POST | `/v1/billing/portal` | Open customer portal |
| GET | `/v1/outbound-ips` | List outbound IPs |
| GET | `/v1/docs` | Swagger UI |
| GET | `/health` | Health check |
| GET | `/metrics` | Prometheus metrics |

## Pricing

| Plan | Price | Webhooks/mo | Endpoints | Payload | Retention | Rate/min |
|------|-------|-------------|-----------|---------|-----------|----------|
| Free | $0 | 10,000 | 5 | 256 KB | 7 days | 100 |
| Pro | $49/mo | 50,000 | 50 | 1 MB | 30 days | 1,000 |
| Business | $149/mo | 500,000 | 500 | 5 MB | 90 days | 10,000 |
| Enterprise | Custom | Unlimited | Unlimited | 10 MB | 365 days | Unlimited |

**Turkey pricing**: Pro ₺149/mo, Business ₺449/mo (via iyzico)

**Hosting cost:** $0/month on free-tier services.

## SDKs

| Language | Package | Status |
|----------|---------|--------|
| Node.js | `hooksniff-sdk` | ✅ Ready |
| Python | `hooksniff` | ✅ Ready |
| Go | `hooksniff-go` | ✅ Ready |
| Rust | `hooksniff` | ✅ Ready |
| Ruby | `hooksniff` | ✅ Ready |
| Java | `com.hooksniff` | ✅ Ready |
| Kotlin | `com.hooksniff` | ✅ Ready |
| PHP | `hooksniff/hooksniff` | ✅ Ready |
| C# | `HookSniff` | ✅ Ready |
| Elixir | `hooksniff` | ✅ Ready |
| Swift | [`HookSniff`](https://github.com/servetarslan02/hooksniff-swift) | ✅ Ready |

## Testing

```bash
# Run unit tests
cargo test

# Run integration tests
cargo test --test integration

# Run load tests
k6 run tests/load/k6_load_test.js
```

## Development

### Quick Start (5 Steps)

```bash
# 1. Clone
git clone https://github.com/servetarslan02/HookSniff.git && cd HookSniff

# 2. Environment
cp .env.example .env.local

# 3. Start services
docker compose up -d postgres redis

# 4. Migrate + run API
cd api && sqlx migrate run && cargo run

# 5. Run dashboard
cd ../dashboard && npm install && npm run dev
```

API → `http://localhost:3000` | Dashboard → `http://localhost:3001`

📖 **Full developer guide:** [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)  
🔧 **Troubleshooting:** [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)  
📋 **Operations runbook:** [docs/RUNBOOK.md](docs/RUNBOOK.md)

## Documentation

- [Developer Guide](docs/DEVELOPMENT.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- [Operations Runbook](docs/RUNBOOK.md)
- [API Reference](docs/api-reference.md)
- [Quickstart Guide](docs/quickstart.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Free Tier Setup](FREE_TIER_SETUP.md)

## Enterprise: IP Whitelisting

Enterprise customers can whitelist HookSniff's static outbound IPs in their firewall/WAF. See **[docs/OUTBOUND_IPS.md](docs/OUTBOUND_IPS.md)** for the full list.

```bash
curl https://hooksniff-api-1046140057667.europe-west1.run.app/v1/outbound-ips
# → { "ips": ["..."], "updated_at": "..." }
```

## Support

- 📖 [Documentation](docs/)
- 🐛 [Report a Bug](https://github.com/servetarslan02/HookSniff/issues/new?template=bug_report.md)
- 💡 [Request a Feature](https://github.com/servetarslan02/HookSniff/issues/new?template=feature_request.md)
- 💬 [GitHub Discussions](https://github.com/servetarslan02/HookSniff/discussions)
- 🔒 [Security Policy](SECURITY.md)

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

## Security

For security vulnerabilities, please see our [Security Policy](SECURITY.md). **Do not open public issues for security bugs.**

## License

MIT — see [LICENSE](LICENSE) for details.

