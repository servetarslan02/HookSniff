# Reddit Post — r/SaaS (IMAGE type)

## Başlık
```
Built my own webhook platform because Svix was too expensive — here's the dashboard
```

## Görseller (3 tane ekle)
1. Dashboard overview — stat cards + delivery trend chart + recent deliveries
2. Endpoint management — endpoint list + toggle + secret rotation
3. Delivery detail — attempt timeline + response headers + retry classification

## İlk Yorum (post attıktan hemen sonra yapıştır)

```
Founder here. Been working on HookSniff for a few months and wanted to share what the dashboard looks like.

Quick context: I needed webhook infrastructure for another project, looked at Svix ($490/mo), decided to build my own. Ended up turning it into a product.

So here's what you actually see when you log in:

The main dashboard has 4 stat cards at the top — total deliveries, success rate, active endpoints, and failed deliveries. Below that there's an area chart showing delivery trends over time (you can switch between 24h, 7d, 30d, 90d). Green is successful, red is failed. Makes it really easy to spot when something breaks.

The widgets are drag and drop, so you can rearrange the layout. There's also a recent deliveries table at the bottom showing the last 5 webhooks with their status.

For endpoint management, you can create endpoints with a URL and description, toggle them active/inactive without deleting, rotate signing secrets with one click, and bulk select + delete. The list uses virtual scrolling so it stays smooth even with a lot of endpoints.

Delivery tracking is the part I'm most proud of. Every single webhook is tracked individually — you can see response headers, response body, attempt timeline with retry count, latency, and HTTP status for each attempt. There's also batch replay for failed deliveries and CSV/JSON export.

The retry system classifies errors differently — 400 means stop immediately (bad payload), 500 means retry with exponential backoff, 429 means respect the rate limit. Each endpoint has its own retry config (max attempts, base delay, backoff type). Failed deliveries go to a dead letter queue.

Security-wise: HMAC-SHA256 signatures on every delivery, SSRF protection that blocks private IPs automatically, API keys with hr_live_*/hr_test_* prefixes, JWT + 2FA, and SSO/SAML for enterprise teams.

There's also smart routing (round-robin, failover, weighted), per-endpoint rate limiting, a playground for testing webhooks from the dashboard, a signature verifier, and a schema registry.

Free tier: 300 webhooks/day, unlimited endpoints. Paid plans start at $29/mo.

Built with Rust (Axum) + Next.js 16 + PostgreSQL + Redis. Running on Google Cloud Run across 4 regions.

https://hooksniff.vercel.app

Curious what features people think are missing from their current webhook setup?
```
