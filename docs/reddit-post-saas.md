# Reddit Post — r/SaaS (Image + Comment)

## Başlık (Title)
```
I built a webhook platform that tracks every delivery in real-time — here's the dashboard
```

## Görsel
Dashboard screenshot'larını ekle (1-3 arası):
1. Dashboard overview (deliveries, success rate, latency)
2. Endpoint detail / retry timeline
3. Analytics charts

## İlk Yorum (Sticky Comment — post attıktan hemen sonra yorum olarak ekle)

```
Hey r/SaaS! 👋

I've been building HookSniff for the past few months — a webhook delivery platform 
that solves the problems developers complain about most.

**The problems I kept seeing in every webhook discussion:**

1. **Silent failures** — Your webhook returns 500s for 3 days and nobody tells you
2. **No retry visibility** — You don't know if retries are working or what's failing  
3. **Duplicate deliveries** — Same payment processed twice because retry logic was broken
4. **Expensive tools** — Svix charges $490/mo, most indie devs can't afford that

**What HookSniff does differently:**

🪝 **Smart retry logic** — Classifies errors (400 ≠ 500) and retries accordingly. 
Exponential backoff with jitter, configurable per endpoint.

📊 **Real-time dashboard** — See every delivery, every failure, every latency spike. 
Per-endpoint health cards with success rate, p95/p99 latency.

🔐 **HMAC-SHA256 signatures** — Standard Webhooks compliant. Every delivery signed 
with `whsec_` secrets.

⚡ **FIFO ordering** — Sequence numbers for event-sourced systems. Only Svix also 
offers this.

🔀 **Smart routing** — Round-robin, failover, weighted strategies with auto-fallback.

💰 **Starting at $49/mo** — 10x cheaper than Svix for comparable features.

**The stack:**
- API: Rust (Axum 0.8) — memory safety, async performance
- Worker: Rust (Tokio) — reliable async task processing  
- Dashboard: Next.js 16 + React 19 + Tailwind
- Database: PostgreSQL (Neon) + Redis (Upstash)
- Deploy: Google Cloud Run (4 regions)

**Free tier:** 10,000 webhooks/month, 5 endpoints, no credit card required.

Would love feedback from this community — what's missing from your current 
webhook setup? What would make you switch?

Try it: https://hooksniff.vercel.app
```
