# 🪝 HookRelay — Quick Start

Get HookRelay running in **5 minutes** with Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20+)
- [Docker Compose](https://docs.docker.com/compose/) (v2+)

## Start

```bash
# Clone
git clone https://github.com/servetarslan02/hookrelay.git
cd hookrelay

# Copy environment config
cp .env.example .env

# Start everything (API + Worker + Dashboard + Database + Queue)
docker compose up -d

# Wait ~30 seconds for services to initialize, then check:
curl http://localhost:3000/health
```

That's it. API is on `http://localhost:3000`, Dashboard on `http://localhost:3001`.

## First Webhook

```bash
# 1. Register
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Response: { "token": "eyJ...", "customer": { "api_key": "hr_live_..." } }

# 2. Create endpoint (use the token from step 1)
curl -X POST http://localhost:3000/v1/endpoints \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://httpbin.org/post"}'

# Response: { "id": "ep_...", "url": "https://httpbin.org/post", ... }

# 3. Send webhook (use the API key from step 1)
curl -X POST http://localhost:3000/v1/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"endpoint_id": "YOUR_ENDPOINT_ID", "event": "order.created", "data": {"order_id": "12345", "total": 49.99}}'

# Response: { "id": "wh_...", "status": "pending", ... }

# 4. Check delivery status
curl http://localhost:3000/v1/webhooks/YOUR_WEBHOOK_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| API | 3000 | Rust Axum server |
| Dashboard | 3001 | Next.js web UI |
| PostgreSQL | 5432 | Database + queue |

## Stop

```bash
docker compose down

# Remove all data (fresh start)
docker compose down -v
```

## Troubleshooting

**Services won't start?**
```bash
# Check logs
docker compose logs api
docker compose logs worker

# Restart everything
docker compose down && docker compose up -d
```

**Database not ready?**
```bash
# Wait 30 seconds, then:
docker compose exec postgres psql -U hookrelay -d hookrelay -c "SELECT 1"
```

**Port conflict?**
Edit `docker-compose.yml` and change the port mapping.

## Next Steps

- [API Reference](docs/api-reference.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Deploy to Production](docs/DEPLOYMENT.md)
