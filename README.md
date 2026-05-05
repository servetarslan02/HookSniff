# 🪝 Hookrelay

**Reliable webhook delivery for developers.**

Send webhooks. We deliver them. If they fail, we retry. Simple.

---

## Features

- **Reliable delivery** — Automatic retries with exponential backoff
- **HMAC signatures** — Verify webhooks are from Hookrelay
- **Dashboard** — Monitor deliveries in real-time
- **Global infrastructure** — Low latency worldwide
- **Simple API** — 4 endpoints, that's it

## Tech Stack

| Component | Technology |
|---|---|
| API | Rust (Axum) |
| Queue | Kafka / Redpanda |
| Workflow | Temporal |
| Database | CockroachDB |
| Dashboard | Next.js 15 |

## Quick Start

```bash
# Clone
git clone https://github.com/yourusername/hookrelay.git
cd hookrelay

# Start infrastructure
make infra

# Run API
make api

# Run worker (in another terminal)
make worker

# Run dashboard (in another terminal)
make dashboard
```

API runs on `http://localhost:3000`
Dashboard runs on `http://localhost:3001`

## API Usage

```bash
# Create endpoint
curl -X POST http://localhost:3000/v1/endpoints \
  -H "Authorization: Bearer hr_live_test" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://httpbin.org/post"}'

# Send webhook
curl -X POST http://localhost:3000/v1/webhooks \
  -H "Authorization: Bearer hr_live_test" \
  -H "Content-Type: application/json" \
  -d '{"endpoint_id": "YOUR_ENDPOINT_ID", "event": "test.ping", "data": {"hello": "world"}}'
```

## Project Structure

```
hookrelay/
├── api/           # Rust Axum API server
├── worker/        # Temporal worker (retry logic)
├── dashboard/     # Next.js dashboard
├── docs/          # API documentation
├── docker-compose.yml
└── Makefile
```

## Documentation

- [API Reference](docs/api-reference.md)
- [Quickstart Guide](docs/quickstart.md)

## License

MIT
