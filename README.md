# 🪝 HookSniff

**Reliable webhook delivery for developers.**

Send webhooks. We deliver them. If they fail, we retry. Simple.

---

## Features

- **Reliable delivery** — Automatic retries with exponential backoff
- **HMAC signatures** — Verify webhooks are from HookSniff (Standard Webhooks compliant)
- **Dashboard** — Monitor deliveries in real-time
- **Simple API** — 4 endpoints, that's it
- **Stripe billing** — Plan management with Stripe Checkout
- **User auth** — JWT + API key authentication
- **Multiple delivery methods** — HTTP, WebSocket, gRPC, SQS
- **Dead letter queue** — Failed deliveries preserved for debugging
- **OpenTelemetry** — Distributed tracing and structured logging
- **Free-tier friendly** — Runs entirely on free services (see below)

## Tech Stack

| Component | Technology | Hosting | Cost |
|---|---|---|---|
| API | Rust (Axum) | Oracle Cloud Always Free (ARM) | $0 |
| Worker | Rust | Oracle Cloud Always Free (ARM) | $0 |
| Database | PostgreSQL | Neon (serverless) | $0 (0.5 GB) |
| Queue | PostgreSQL + Redis | Upstash (serverless) | $0 (256 MB) |
| Dashboard | Next.js 15 | Vercel | $0 |
| CDN/DNS | Cloudflare | Cloudflare Free | $0 |
| Monitoring | Grafana + OpenTelemetry | Grafana Cloud | $0 |
| Storage | Cloudflare R2 | Cloudflare R2 | $0 (10 GB) |
| Email | Resend | Resend | $0 (3K/mo) |
| Billing | Stripe | Stripe | Pay per transaction |

## Quick Start

### Local Development

```bash
# Clone
git clone https://github.com/servetarslan02/hooksniff.git
cd hooksniff

# Copy environment config
cp .env.example .env

# Start everything (PostgreSQL + API + Worker + Dashboard)
make local
```

API runs on `http://localhost:3000`
Dashboard runs on `http://localhost:3001`

### Production Deployment (Free Tier)

See **[FREE_TIER_SETUP.md](FREE_TIER_SETUP.md)** for a complete guide to deploying HookSniff on free-tier services (Oracle Cloud, Neon, Vercel, Upstash, Grafana Cloud, Cloudflare R2, Resend).

## API Usage

```bash
# Register
curl -X POST https://api.hooksniff.is-a.dev/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "your-password"}'

# Create endpoint
curl -X POST https://api.hooksniff.is-a.dev/v1/endpoints \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-app.com/webhook"}'

# Send webhook
curl -X POST https://api.hooksniff.is-a.dev/v1/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"endpoint_id": "YOUR_ENDPOINT_ID", "event": "order.created", "data": {"order_id": "12345"}}'
```

## Project Structure

```
hooksniff/
├── api/               # Rust Axum API server
├── worker/            # Background worker (retry + delivery)
├── dashboard/         # Next.js dashboard + landing page
├── sdks/              # Node.js, Python & Go SDKs
├── docs/              # API documentation
├── monitoring/        # Grafana + OpenTelemetry config
├── k8s/               # Kubernetes manifests
├── migrations/        # PostgreSQL migration scripts
├── scripts/           # Deployment & utility scripts
├── docker-compose.yml
├── FREE_TIER_SETUP.md # Free-tier deployment guide
└── Makefile
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/auth/register` | Create account |
| POST | `/v1/auth/login` | Get JWT token |
| POST | `/v1/endpoints` | Create endpoint |
| GET | `/v1/endpoints` | List endpoints |
| POST | `/v1/webhooks` | Send webhook |
| GET | `/v1/webhooks` | List deliveries |
| GET | `/v1/webhooks/:id` | Get delivery |
| POST | `/v1/webhooks/:id/replay` | Replay webhook |
| POST | `/v1/billing/upgrade` | Upgrade plan (Stripe Checkout) |
| POST | `/v1/billing/portal` | Open customer portal |
| GET | `/v1/outbound-ips` | List outbound IPs (for firewall whitelisting) |

## Pricing

| Plan | Price | Webhooks/mo | Endpoints | Retention |
|------|-------|-------------|-----------|-----------|
| Free | $0 | 1,000 | 5 | 7 days |
| Pro | $49/mo | 50,000 | 50 | 30 days |
| Business | $149/mo | 500,000 | 500 | 90 days |

**Hosting cost:** $0/month on free-tier services (Oracle Cloud, Neon, Vercel, Upstash, Grafana Cloud, Cloudflare, Resend).

## Testing

```bash
# Run unit tests
cargo test

# Run integration tests
cargo test --test integration

# Run load tests
k6 run tests/load/k6_load_test.js
```

## Documentation

- [API Reference](docs/api-reference.md)
- [Quickstart Guide](docs/quickstart.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Free Tier Setup](FREE_TIER_SETUP.md)
- [Outbound IPs & Firewall Whitelisting](docs/OUTBOUND_IPS.md)

## Enterprise: IP Whitelisting

Enterprise customers can whitelist HookSniff's static outbound IPs in their firewall/WAF to ensure webhook delivery. See **[docs/OUTBOUND_IPS.md](docs/OUTBOUND_IPS.md)** for the full list of IPs and setup instructions.

Programmatically fetch current IPs:

```bash
curl https://api.hooksniff.is-a.dev/v1/outbound-ips
# → { "ips": ["..."], "updated_at": "..." }
```

## License

MIT
