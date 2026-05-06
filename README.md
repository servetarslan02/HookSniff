# 🪝 HookRelay

**Reliable webhook delivery for developers.**

Send webhooks. We deliver them. If they fail, we retry. Simple.

---

## Features

- **Reliable delivery** — Automatic retries with exponential backoff
- **HMAC signatures** — Verify webhooks are from HookRelay (Standard Webhooks compliant)
- **Dashboard** — Monitor deliveries in real-time
- **Simple API** — 4 endpoints, that's it
- **Stripe billing** — Plan management with Stripe Checkout
- **User auth** — JWT + API key authentication
- **Multiple delivery methods** — HTTP, WebSocket, gRPC, SQS
- **Dead letter queue** — Failed deliveries preserved for debugging
- **OpenTelemetry** — Distributed tracing and structured logging

## Tech Stack

| Component | Technology |
|---|---|
| API | Rust (Axum) |
| Queue | PostgreSQL (webhook_queue table) |
| Database | PostgreSQL |
| Dashboard | Next.js 15 |
| Billing | Stripe |
| Monitoring | Grafana + Prometheus + OpenTelemetry |

## Quick Start

```bash
# Clone
git clone https://github.com/servetarslan02/hookrelay.git
cd hookrelay

# Copy environment config
cp .env.example .env

# Start everything (PostgreSQL + API + Worker + Dashboard)
make local
```

API runs on `http://localhost:3000`
Dashboard runs on `http://localhost:3001`

## API Usage

```bash
# Register
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "your-password"}'

# Create endpoint
curl -X POST http://localhost:3000/v1/endpoints \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-app.com/webhook"}'

# Send webhook
curl -X POST http://localhost:3000/v1/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"endpoint_id": "YOUR_ENDPOINT_ID", "event": "order.created", "data": {"order_id": "12345"}}'
```

## Project Structure

```
hookrelay/
├── api/               # Rust Axum API server
├── worker/            # Background worker (retry + delivery)
├── dashboard/         # Next.js dashboard + landing page
├── ai-center/         # AI-powered monitoring (optional)
├── sdks/              # Node.js & Python SDKs
├── docs/              # API documentation
├── monitoring/        # Grafana + Prometheus config
├── k8s/               # Kubernetes manifests
├── docker-compose.yml
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

## Pricing

| Plan | Price | Webhooks/mo | Endpoints | Retention |
|------|-------|-------------|-----------|-----------|
| Free | $0 | 1,000 | 5 | 7 days |
| Pro | $49/mo | 50,000 | 50 | 30 days |
| Business | $149/mo | 500,000 | 500 | 90 days |

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

## License

MIT
