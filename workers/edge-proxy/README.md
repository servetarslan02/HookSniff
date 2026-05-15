# 🌐 HookSniff Edge Proxy (Cloudflare Worker)

Cloudflare Worker that sits in front of the HookSniff API for edge-level performance and security.

## Features

- **Edge Rate Limiting** — KV-based sliding window, per-IP per-endpoint
- **Edge Caching** — GET responses cached at edge (health=10s, docs=1h, analytics=30s)
- **CORS Preflight** — Handled at edge (no origin round-trip)
- **Security Headers** — HSTS, X-Frame-Options, X-Content-Type-Options
- **DDoS Protection** — Cloudflare's built-in protection + edge rate limiting
- **Failover** — Serves stale cache if origin is unreachable

## Rate Limits

| Endpoint | Window | Max Requests |
|----------|--------|-------------|
| `/v1/auth/login` | 60s | 10 |
| `/v1/auth/register` | 60s | 5 |
| `/v1/auth/forgot-password` | 300s | 3 |
| `/v1/webhooks` | 60s | 200 |
| Default | 60s | 100 |

## Setup

```bash
cd workers/edge-proxy
npm install

# Create KV namespaces
wrangler kv namespace create RATE_LIMIT_KV
wrangler kv namespace create EDGE_CACHE_KV

# Update wrangler.toml with the returned IDs

# Deploy
wrangler deploy
```

## Development

```bash
# Local development
wrangler dev

# Run tests
npm test
```

## Architecture

```
Client → Cloudflare Edge (this Worker) → Google Cloud Run (API)
                ↓
         ┌─────────────┐
         │  Rate Limit  │ (KV sliding window)
         │  Edge Cache  │ (KV TTL-based)
         │  CORS        │ (edge preflight)
         │  Security    │ (headers)
         └─────────────┘
```

## Metrics

The worker adds these headers to responses:

| Header | Description |
|--------|-------------|
| `X-Served-By` | `cloudflare-edge` |
| `X-Cache` | `HIT` / `MISS` / `STALE` |
| `X-RateLimit-Limit` | Max requests in window |
| `X-RateLimit-Remaining` | Remaining requests |
| `X-CF-Ray` | Cloudflare ray ID (tracing) |
