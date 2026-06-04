# Reddit Post — r/webdev

## Başlık
```
How I organized 22K lines of Rust into 30 modules for a webhook platform
```

## İlk Yorum

```
Founder here. Been building HookSniff — a webhook delivery platform — and wanted to share how I organized the codebase.

Started with a single main.rs that grew to over 4000 lines. Every webhook feature was tangled together — retries, signing, routing, rate limiting. It was a mess.

So I split it into 30 modules. Here's the structure:

api/src/
  routes/          → 30 route modules (auth, endpoints, deliveries, analytics...)
  middleware/       → idempotency, rate limiting, auth
  signing/         → HMAC-SHA256 (Standard Webhooks)
  retry_policy/    → exponential backoff with jitter
  throttle/        → token bucket per endpoint
  fifo/            → ordered delivery with sequence numbers
  transform/       → payload filter/map/enrich
  schemas/         → JSON schema registry
  ssrf/            → private IP blocking
  circuit_breaker/ → auto-disable failing endpoints
  ws/              → WebSocket real-time updates

A few things I learned along the way:

Retry logic should be separate from delivery logic. Each endpoint has its own retry config — max attempts, base delay, backoff type. The delivery worker just reads the config and applies it.

Error classification matters a lot. A 400 and a 500 need completely different retry strategies. 400 means the payload is wrong, stop immediately. 500 means the server had a temporary issue, retry with backoff. 429 means respect the rate limit header. Most webhook tools treat all errors the same, which leads to either lost events or hammering broken endpoints.

Idempotency works better as middleware than as a handler concern. The Idempotency-Key header with 24h TTL handles deduplication before the handler even runs. The handler doesn't need to know about it.

SSRF protection should be automatic. Block private IPs, metadata endpoints, DNS rebinding. Don't make developers configure this — it should just work out of the box.

FIFO ordering needs its own module. Sequence numbers plus max-wait protection. Critical for event-sourced systems but not needed for most webhooks, so it's opt-in per endpoint.

The 30-module split made the codebase actually maintainable. Each module has a clear responsibility and can be tested independently. Went from "I'm afraid to touch this file" to "I know exactly where to make changes."

Stack: Rust (Axum 0.8), PostgreSQL (Neon), Redis (Upstash), Next.js 16 dashboard. Deployed on Google Cloud Run.

https://hooksniff.vercel.app

Happy to answer questions about the architecture or the Rust-specific decisions.
```
