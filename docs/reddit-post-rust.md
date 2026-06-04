# Reddit Post — r/rust

## Başlık
```
Webhook platform in Rust: 22K lines, 30 modules, 4 Cloud Run regions — what I learned
```

## İlk Yorum

```
Founder here. Been building HookSniff — a webhook delivery platform — and wanted to share what worked and what didn't with the Rust stack.

Why Rust for webhooks? Webhook delivery is latency-sensitive. P99 matters and you can't afford GC pauses. Also, webhook handlers process untrusted payloads from the internet, so memory safety without runtime overhead is a big deal. Axum's tower middleware ecosystem turned out to be perfect for cross-cutting concerns like auth, rate limiting, and idempotency.

The stack:
- API: Axum 0.8 + sqlx 0.8 (compile-time checked SQL)
- Worker: Tokio async tasks with exponential backoff
- Database: PostgreSQL via Neon (serverless)
- Queue: Redis via Upstash (serverless, Lua scripting for atomic ops)
- Dashboard: Next.js 16 (separate deploy on Vercel)
- Observability: OpenTelemetry to Sentry

Key modules that made the biggest difference:

signing/ — HMAC-SHA256 with constant-time comparison, following the Standard Webhooks spec. Had to be careful about timing attacks here.

retry_policy/ — Configurable per endpoint. Supports exponential and linear backoff with jitter of ±25%. Each endpoint can have its own max attempts, base delay, and max delay.

throttle/ — Token bucket plus sliding window per endpoint. Protects customer servers from being overwhelmed.

fifo/ — Sequence numbers for ordered delivery. Has max-wait protection so events don't get stuck forever. Only Svix also offers this.

ssrf/ — Blocks private IPs, metadata endpoints, DNS rebinding. This should just work out of the box, developers shouldn't have to configure it.

circuit_breaker/ — Auto-disables endpoints after consecutive failures. Prevents wasting resources on endpoints that are clearly down.

transform/ — Payload filter, map, and enrich per endpoint. Lets customers customize what data they receive.

What worked well:
- Axum extractors make route handlers really clean
- sqlx compile-time query checking caught 3 bugs before they hit production
- Tower middleware for idempotency/retry/auth is composable and testable
- serde for webhook payload parsing is rock solid

What was hard:
- sqlx migrations with advisory locks needed a dedicated connection, session-scoped. Tricky to get right.
- Redis Lua scripts for atomic rate limiting were hard to debug. Redis doesn't give great error messages.
- The SSO/SAML module grew to 3400 lines. XML parsing in Rust is verbose compared to languages with built-in XML support.

Performance numbers:
- Average latency: 45ms
- P99: ~120ms
- Handles 1000+ webhooks/second per region

Deployed across 4 GCP Cloud Run regions (europe-west1, west3, me-west1, us-central1).

https://hooksniff.vercel.app

Happy to dive deeper into any specific module or Rust decision.
```
