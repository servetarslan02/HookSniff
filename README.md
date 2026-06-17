# 🪝 HookSniff

[![CI](https://github.com/servetarslan02/HookSniff/actions/workflows/ci.yml/badge.svg)](https://github.com/servetarslan02/HookSniff/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/Rust-1.96+-orange.svg)](https://www.rust-lang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)

**The webhook infrastructure for developers.**

HookSniff is an open-source webhook delivery platform built in Rust and Next.js. It handles sending, receiving, retrying, and monitoring webhooks — so you can focus on building your product.

🌐 **Live:** [hooksniff.vercel.app](https://hooksniff.vercel.app) · 📖 **Docs:** [hooksniff.vercel.app/docs](https://hooksniff.vercel.app/docs)

---

## Why HookSniff?

Webhooks are the backbone of modern integrations, but building reliable webhook infrastructure is hard. HookSniff gives you:

- **Reliable delivery** — Automatic retries with exponential backoff and jitter. Failed deliveries go to a dead letter queue, never lost.
- **Standard Webhooks** — HMAC-SHA256 signatures with `whsec_` secrets, fully compliant with the [Standard Webhooks](https://www.standardwebhooks.com/) specification.
- **Smart routing** — Round-robin, failover, weighted, and random strategies with automatic fallback URLs.
- **FIFO ordering** — Guaranteed ordered delivery with sequence numbers for event-sourced systems.
- **Real-time visibility** — SSE streaming, WebSocket updates, and a full analytics dashboard.
- **Cortex AI** — ML-powered anomaly detection, auto-healing, drift detection, and predictive monitoring.
- **11 SDKs** — Official clients for Node.js, Python, Go, Rust, Java, Kotlin, Ruby, PHP, C#, Elixir, and Swift. Each in its own repo under [servetarslan02](https://github.com/servetarslan02?tab=repositories&q=hooksniff).

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
| **11 SDKs** | Node, Python, Go, Rust, Java, Kotlin, Ruby, PHP, C#, Elixir, Swift — [all repos](https://github.com/servetarslan02?tab=repositories&q=hooksniff) |

---

## Tech Stack

| Component | Technology | Hosting |
|---|---|---|
| **API** | Rust (Axum 0.8, sqlx 0.8) |
| **Worker** | Rust (Tokio) | 
| **Database** | PostgreSQL 16 |
| **Cache / Queue** | Redis | 
| **Dashboard** | Next.js 16, React, TypeScript, Tailwind | 
| **CDN/DNS** | Cloudflare | 
| **Monitoring** | Grafana + OpenTelemetry |
| **Storage** | Cloudflare R2 | S3-compatible |
| **Email** | Resend + Gmail API |
| **Billing** | Polar.sh + iyzico | 

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

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for a complete guide to deploying HookSniff on Google Cloud Run.

## API Usage

```bash
# Register
curl -X POST https://hooksniff-api-e6ztf3x2ma-ew.a.run.app/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "your-password"}'

# Create endpoint
curl -X POST https://hooksniff-api-e6ztf3x2ma-ew.a.run.app/v1/endpoints \
  -H "Authorization: Bearer hr_live_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-app.com/webhook"}'

# Send webhook
curl -X POST https://hooksniff-api-e6ztf3x2ma-ew.a.run.app/v1/webhooks \
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
├── dashboard/         # Next.js 16 dashboard + landing page
├── sdks/              # SDK source (Node.js in-repo, others in separate repos)
├── cli/               # CLI tool
├── portal/            # Embeddable portal widget
├── docs/              # API documentation (OpenAPI)
├── monitoring/        # Grafana + OpenTelemetry config
├── tests/             # Integration + load tests (k6)
├── docker-compose.yml
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

| Plan | Price | Webhooks/day | Endpoints | Payload | Retention | Rate/min |
|------|-------|-------------|-----------|---------|-----------|----------|
| Developer | $0 | 300 | Unlimited | 256 KB | 14 days | 100 |
| Startup | $29/mo | 30,000 | Unlimited | 1 MB | 30 days | 500 |
| Pro | $49/mo | 100,000 | Unlimited | 5 MB | 180 days | 1,000 |
| Enterprise | Custom | Unlimited | Unlimited | 10 MB | 365 days | 5,000 |

**Hosting cost:** $0/month on free-tier services.

## SDKs

| Language | Package | Repository | Status |
|----------|---------|------------|--------|
| Node.js | [`hooksniff-sdk`](https://www.npmjs.com/package/hooksniff-sdk) | [hooksniff-node](https://github.com/servetarslan02/hooksniff-node) | ✅ Available |
| Python | `hooksniff` | [hooksniff-python](https://github.com/servetarslan02/hooksniff-python) | ✅ Available |
| Go | `hooksniff-go` | [hooksniff-go](https://github.com/servetarslan02/hooksniff-go) | ✅ Available |
| Rust | `hooksniff` | [hooksniff-rust](https://github.com/servetarslan02/hooksniff-rust) | ✅ Available |
| Java | `com.hooksniff` | [hooksniff-java](https://github.com/servetarslan02/hooksniff-java) | ✅ Available |
| Kotlin | `com.hooksniff` | [hooksniff-kotlin](https://github.com/servetarslan02/hooksniff-kotlin) | ✅ Available |
| Ruby | `hooksniff` | [hooksniff-ruby](https://github.com/servetarslan02/hooksniff-ruby) | ✅ Available |
| PHP | `hooksniff/hooksniff` | [hooksniff-php](https://github.com/servetarslan02/hooksniff-php) | ✅ Available |
| C# | `HookSniff` | [hooksniff-csharp](https://github.com/servetarslan02/hooksniff-csharp) | ✅ Available |
| Elixir | `hooksniff` | [hooksniff-elixir](https://github.com/servetarslan02/hooksniff-elixir) | ✅ Available |
| Swift | `HookSniff` | [hooksniff-swift](https://github.com/servetarslan02/hooksniff-swift) | ✅ Available |

> All SDKs are MIT licensed. See [docs/sdk-coverage.md](docs/sdk-coverage.md) for detailed status.

## Testing

```bash
# Run unit tests
cargo test

# Run integration tests
cargo test --test integration

# Run load tests
k6 run tests/load/k6_load_test.js
```

## SDK Examples

### Node.js

```typescript
import { HookSniff } from 'hooksniff-sdk';

const hs = new HookSniff('hr_live_YOUR_KEY');

// Create application
const app = await hs.application.create({ name: 'My App' });

// Create endpoint
const ep = await hs.endpoint.create({
  url: 'https://your-app.com/webhook',
  application_id: app.id,
  description: 'Order notifications',
});

// Send webhook
await hs.webhook.send({
  endpoint_id: ep.id,
  event: 'order.created',
  data: { order_id: '12345', amount: 99.99 },
});
```

### Python

```python
from hooksniff import HookSniff

hs = HookSniff('hr_live_YOUR_KEY')

# Create application
app = hs.application.create(name='My App')

# Create endpoint
ep = hs.endpoint.create(
    url='https://your-app.com/webhook',
    application_id=app['id'],
    description='Order notifications'
)

# Send webhook
hs.webhook.send(
    endpoint_id=ep['id'],
    event='order.created',
    data={'order_id': '12345', 'amount': 99.99}
)
```

### Go

```go
import hooksniff "github.com/servetarslan02/hooksniff-go"

hs := hooksniff.NewClient("hr_live_YOUR_KEY")

// Create application
app, _ := hs.Application.Create(&hooksniff.ApplicationCreate{
    Name: "My App",
})

// Create endpoint
ep, _ := hs.Endpoint.Create(&hooksniff.EndpointCreate{
    URL:           "https://your-app.com/webhook",
    ApplicationID: app.ID,
    Description:   hooksniff.String("Order notifications"),
})

// Send webhook
hs.Webhook.Send(&hooksniff.WebhookSend{
    EndpointID: ep.ID,
    Event:      "order.created",
    Data:       map[string]interface{}{"order_id": "12345", "amount": 99.99},
})
```

📖 **Full SDK docs:** [docs/SDK_EXAMPLES.md](docs/SDK_EXAMPLES.md)

---

## Documentation

| Document | Description |
|----------|-------------|
| [API Reference](docs/api-reference.md) | Full REST API documentation with request/response examples |
| [Quickstart Guide](docs/QUICKSTART.md) | Get your first webhook running in 5 minutes |
| [Architecture](docs/ARCHITECTURE.md) | System design, data flow, retry mechanism |
| [Deployment Guide](docs/DEPLOYMENT.md) | Production deployment on Google Cloud Run |
| [Deployment Guide](docs/DEPLOYMENT.md) | Deploy on Google Cloud Run |
| [Self-Host Guide](docs/SELF-HOST.md) | Run HookSniff on your own infrastructure |
| [SDK Examples](docs/SDK_EXAMPLES.md) | Code examples for all SDKs |
| [Developer Guide](docs/DEVELOPMENT.md) | Local development setup and workflows |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Common issues and solutions |
| [Runbook](docs/RUNBOOK.md) | Operational procedures and incident response |

## Enterprise: IP Whitelisting

Enterprise customers can whitelist HookSniff's static outbound IPs in their firewall/WAF. See **[docs/OUTBOUND_IPS.md](docs/OUTBOUND_IPS.md)** for the full list.

```bash
curl https://hooksniff-api-e6ztf3x2ma-ew.a.run.app/v1/outbound-ips
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

