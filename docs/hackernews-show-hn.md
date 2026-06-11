# Hacker News "Show HN" Post

## Title
```
Show HN: HookSniff – Webhook delivery platform built in Rust with smart retry and real-time dashboard
```

## URL
```
https://hooksniff.vercel.app
```

## First Comment (HN'de hemen yapıştır)

```
Hi HN, I'm the founder of HookSniff. I built this because I needed webhook infrastructure for another project and existing solutions were either too expensive (Svix at $490/mo) or too limited.

Here's what makes it different from other webhook platforms:

**Smart retry with error classification.** Most webhook tools treat all failures the same. HookSniff classifies errors differently — 400 means the payload is wrong, stop immediately. 500 means the server had a temporary issue, retry with exponential backoff. 429 means respect the rate limit header. Each endpoint has its own retry config (max attempts, base delay, backoff type). Failed deliveries go to a dead letter queue.

**Playground for testing.** Built a sandbox environment where you can test webhooks directly from the dashboard. It generates a temporary URL, you send webhooks to it, and you see the full request details (headers, body, method, IP, user agent) in real-time. Has sample payloads for common events (order.created, payment.completed, user.created). Also includes a signature verifier tool that supports SHA-256 and SHA-512 with constant-time comparison to prevent timing attacks.

**Customer portal.** Each customer gets a portal showing their plan details, webhook usage (used/limit), endpoint count, data retention status, and when their data expires. The portal auto-calculates usage percentages and shows unlimited plans correctly.

**Per-endpoint everything.** Rate limiting (token bucket + sliding window), retry policy, signing secrets, and routing strategy are all configurable per endpoint. Not global settings — each endpoint can have its own configuration.

**FIFO ordering.** Sequence numbers for event-sourced systems. Critical for webhooks that need to be processed in order. Has max-wait protection so events don't get stuck.

**SSRF protection built-in.** Blocks private IPs, metadata endpoints, DNS rebinding automatically. Developers don't need to configure this.

**Tech stack:** Rust (Axum 0.8) for the API, Tokio for the worker, PostgreSQL (Neon) for storage, Redis (Upstash) for queue/cache, Next.js 16 for the dashboard. Deployed on Google Cloud Run across 4 regions.

**Pricing:** Free tier with 300 webhooks/day and unlimited endpoints. Paid plans start at $29/mo.

https://hooksniff.vercel.app

Happy to answer any questions about the architecture or the product.
```
