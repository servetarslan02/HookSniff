# 🚀 Reddit Launch Plan — HookSniff

> Hazırlanma: 2026-05-25
> En iyi paylaşım zamanları hesaplandı (Reddit trafiğine göre)

---

## 📅 Zamanlama (En İyi Gün + Saat)

Reddit'te en yüksek trafik: **Salı-Perşembe, 06:00-08:00 EST (13:00-15:00 Türkiye)**

| # | Subreddit | Gün | Saat (GMT+8) | Saat (TR) | Görsel |
|---|-----------|-----|-------------|-----------|--------|
| 1 | r/SaaS | **Salı 26 Mayıs** | 21:00 | 16:00 | hero-main.png |
| 2 | r/webdev | **Salı 26 Mayıs** | 21:30 | 16:30 | hero-architecture.png |
| 3 | r/selfhosted | **Çarşamba 27 Mayıs** | 21:00 | 16:00 | hero-comparison.png |
| 4 | r/programming | **Çarşamba 27 Mayıs** | 21:30 | 16:30 | hero-main.png |
| 5 | r/devops | **Perşembe 28 Mayıs** | 21:00 | 16:00 | hero-architecture.png |
| 6 | r/rust | **Perşembe 28 Mayıs** | 21:30 | 16:30 | hero-main.png |

**NOT:** Her subreddit'e farklı saatte at, Reddit spam algılamasın. Aralarında en az 30 dk olsun.

---

## 📝 POST 1 — r/SaaS

**Başlık:**
```
I built a webhook delivery platform with Rust for $0/month — here's how
```

**İçerik:**
```
Hey r/SaaS,

I've been building HookSniff for the past few months — a webhook delivery platform 
that handles retries, security, and monitoring so developers can focus on their product.

**The problem:** Webhooks are simple until they're not. Your server goes down for 
5 minutes and you lose critical events. No retries, no visibility, no debugging.

**What HookSniff does:**
- Automatic retries with exponential backoff + jitter
- HMAC-SHA256 signatures (Webhooks standard compliant)
- Real-time dashboard with delivery logs
- Dead letter queue for failed deliveries
- 11 SDKs (Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift)

**The stack (and why it costs $0/month):**
- API: Rust (Axum) → Google Cloud Run Free Tier
- Database: Neon PostgreSQL (serverless, free)
- Cache/Queue: Upstash Redis (serverless, free)
- Dashboard: Next.js 15 → Vercel
- Monitoring: Grafana Cloud (free)

**Free tier:** 10,000 webhooks/month, 5 endpoints, no credit card required.

I'm a solo developer building this. Would love feedback from this community — 
what's missing? What would make you switch from your current webhook solution?

Try it: https://hooksniff.vercel.app
GitHub: https://github.com/servetarslan02/HookSniff
```

**Görsel:** `hero-main.png` (ilk resim olarak)

---

## 📝 POST 2 — r/webdev

**Başlık:**
```
I split a 4000-line Rust file into 10 modules — lessons learned building a webhook platform
```

**İçerik:**
```
Hey r/webdev,

Building HookSniff (a webhook delivery platform) and hit a wall: my `sso.rs` was 
3,943 lines. My `webhooks.rs` was 2,000+. Something had to change.

**What I learned splitting large Rust modules:**

1. **Commit before you split** — if it compiles, commit. Then split.
2. **mod.rs holds the types** — all structs/enums stay in mod.rs, made `pub`
3. **`use super::*` doesn't work** — use `use super::{Type1, Type2}` instead
4. **External crates** need separate imports in each file
5. **Cross-module calls** need prefix (`helpers::fn_name`)
6. **One step at a time** — `cargo check` after every change

**Before/After:**

| Module | Before | After | Files |
|--------|--------|-------|-------|
| sso.rs | 3,943 lines | ~600 lines | 10 files |
| teams.rs | 2,000+ lines | ~300 lines | 3 files |
| webhooks.rs | 2,000+ lines | ~400 lines | 2 files |
| auth.rs | 1,500+ lines | ~300 lines | 2 files |
| admin/ | - | ~2,000 lines | 20+ files |

On the frontend side (Next.js/TypeScript), same story:
- `useDashboardData.ts`: 1,106 → 754 lines
- `useAdminData.ts`: 851 → 363 lines
- 7 new custom hooks extracted

**Tech stack:** Rust + Axum, Next.js 15, PostgreSQL, Redis

The full codebase is open source: https://github.com/servetarslan02/HookSniff

Anyone else dealing with large file splitting? What's your approach?
```

**Görsel:** `hero-architecture.png`

---

## 📝 POST 3 — r/selfhosted

**Başlık:**
```
Self-hostable webhook platform — Rust, $0/month, runs entirely on free tier services
```

**İçerik:**
```
Hey r/selfhosted,

Built HookSniff — a webhook delivery platform you can self-host or run on free-tier 
cloud services. MIT licensed, fully open source.

**What it does:**
- Receive and deliver webhooks with automatic retries
- HMAC-SHA256 signature verification
- Real-time dashboard (41 pages)
- Dead letter queue for failed deliveries
- Smart routing (round-robin, failover, weighted)
- Per-endpoint throttling (token bucket / sliding window)
- SSRF protection (blocks private IPs, metadata endpoints)
- Schema registry with JSON schema validation
- CloudEvents v1.0 support
- 11 SDKs

**Self-host options:**
1. **Docker Compose** — `docker compose up` and you're running
2. **Google Cloud Run** — free tier (2M requests/month)
3. **Any VPS** — just need Rust + PostgreSQL + Redis

**Free tier stack ($0/month):**
- API: Rust (Axum) on Google Cloud Run
- DB: Neon PostgreSQL (0.5 GB free)
- Cache: Upstash Redis (256 MB free)
- Dashboard: Next.js 15 on Vercel
- Monitoring: Grafana Cloud
- Storage: Cloudflare R2 (10 GB free)

**Quick start:**
```bash
git clone https://github.com/servetarslan02/HookSniff.git
cd HookSniff
cp .env.example .env
make local
```

GitHub: https://github.com/servetarslan02/HookSniff
Docs: https://hooksniff.vercel.app/docs

Would love feedback on the self-hosting experience. What's missing?
```

**Görsel:** `hero-comparison.png`

---

## 📝 POST 4 — r/programming

**Başlık:**
```
Show: HookSniff — open-source webhook delivery platform built with Rust + Next.js
```

**İçerik:**
```
Hi r/programming,

HookSniff is an open-source webhook delivery platform I've been building. 
It handles the boring parts of webhooks: retries, security, monitoring, and debugging.

**Technical highlights:**

*Rust API (Axum):*
- 30+ REST endpoints
- JWT + API key auth (Argon2id)
- 2FA (TOTP), email verification
- SSRF protection with DNS validation
- Token bucket + sliding window throttling
- FIFO ordered delivery with sequence numbers

*Background Worker:*
- Exponential backoff with jitter
- Dead letter queue
- Smart routing (round-robin, failover, weighted, random)
- OpenTelemetry distributed tracing

*Dashboard (Next.js 15):*
- 41 pages
- Real-time analytics
- Endpoint management
- Team collaboration

*Infrastructure ($0/month):*
- Google Cloud Run (free tier)
- Neon PostgreSQL (serverless)
- Upstash Redis (serverless)
- Vercel (dashboard)
- Grafana Cloud (monitoring)

*SDKs:* Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift

Everything is MIT licensed: https://github.com/servetarslan02/HookSniff

Feedback welcome — especially on the Rust code quality and architecture decisions.
```

**Görsel:** `hero-main.png`

---

## 📝 POST 5 — r/devops

**Başlık:**
```
How I built a webhook platform that costs $0/month to run (Google Cloud Run + Neon + Upstash)
```

**İçerik:**
```
Hey r/devops,

Wanted to share my infrastructure setup for HookSniff — a webhook delivery platform 
that runs entirely on free-tier services.

**Architecture:**

```
[Your App] → HTTPS → [HookSniff API] → Queue → [Worker] → [Customer Endpoint]
                         ↓                ↓           ↓
                    Neon PostgreSQL   Upstash Redis   Grafana Cloud
```

**The $0/month stack:**

| Component | Service | Free Tier Limit |
|-----------|---------|-----------------|
| API | Google Cloud Run | 2M requests/month |
| Worker | Google Cloud Run | 2M requests/month |
| Database | Neon PostgreSQL | 0.5 GB |
| Cache/Queue | Upstash Redis | 256 MB |
| Dashboard | Vercel | 100 GB bandwidth |
| CDN/DNS | Cloudflare | Unlimited |
| Monitoring | Grafana Cloud | 10K metrics |
| Storage | Cloudflare R2 | 10 GB |
| Email | Gmail API | 2,000/day |

**What I learned:**
1. Serverless is perfect for webhooks — bursty traffic, low baseline
2. Neon's connection pooling handles spikes beautifully
3. Upstash Redis with pay-per-request is ideal for queues
4. Cloud Run cold starts are ~500ms — acceptable for webhooks
5. Grafana Cloud free tier is surprisingly generous

**Monitoring setup:**
- OpenTelemetry for distributed tracing
- Structured JSON logging
- Grafana dashboard for delivery metrics
- Prometheus-compatible `/metrics` endpoint

GitHub: https://github.com/servetarslan02/HookSniff
Free tier setup guide: https://github.com/servetarslan02/HookSniff/blob/main/FREE_TIER_SETUP.md

Anyone else running production workloads on free tiers? What's your experience?
```

**Görsel:** `hero-architecture.png`

---

## 📝 POST 6 — r/rust

**Başlık:**
```
Built a webhook delivery platform in Rust (Axum) — architecture and lessons learned
```

**İçerik:**
```
Hey r/rust,

Been building HookSniff — a webhook delivery platform — and wanted to share 
the Rust architecture and things I learned along the way.

**Why Rust:**
- Performance matters — webhooks need low latency (<50ms delivery)
- Memory safety without GC — critical for a always-on service
- Axum's tower ecosystem is fantastic for middleware

**Project structure:**
```
HookSniff/
├── api/          → Axum API server (30+ routes)
│   ├── src/
│   │   ├── auth/     → JWT, API keys, 2FA, SSO
│   │   ├── webhooks/ → CRUD + delivery logic
│   │   ├── teams/    → RBAC, invitations
│   │   ├── admin/    → 20+ admin endpoints
│   │   ├── billing/  → Polar.sh + iyzico
│   │   ├── inbound/  → Webhook proxy
│   │   └── sso/      → SAML + OIDC + SCIM
├── worker/       → Background delivery worker
├── common/       → Shared library
├── cli/          → CLI tool
└── sdks/         → 11 language SDKs
```

**Key architectural decisions:**
1. **Shared `common` crate** — types, config, errors shared between API and worker
2. **Module-level organization** — each domain (auth, webhooks, teams) is its own module
3. **PostgreSQL as queue** — using `FOR UPDATE SKIP LOCKED` for job processing
4. **Argon2id** for password hashing, **HMAC-SHA256** for webhook signatures
5. **CloudEvents v1.0** format for event payloads

**Challenges:**
- Splitting large modules (sso.rs was 3,943 lines → 10 files)
- SQLx compile-time query checking with Neon
- Handling concurrent webhook deliveries without race conditions

**What I'd do differently:**
- Start with module organization from day 1
- Use `thiserror` for error types earlier
- Add OpenTelemetry from the start

Code: https://github.com/servetarslan02/HookSniff

Would appreciate code review feedback, especially on the Axum patterns.
```

**Görsel:** `hero-main.png`

---

## 🖼️ Görseller

Tüm görseller `reddit-launch/` klasöründe:

| Dosya | Kullanım |
|-------|----------|
| `hero-main.png` | Ana tanıtım görseli (tüm post'larda ilk resim) |
| `hero-architecture.png` | Teknik mimari diyagramı |
| `hero-comparison.png` | Karşılaştırma tablosu |

---

## 📋 Paylaşım Checklist

Her paylaşım için:
- [ ] Subreddit kurallarını kontrol et
- [ ] Başlığı kopyala
- [ ] İçeriği kopyala
- [ ] Görseli yükle (ilk resim olarak)
- [ ] "OC" flair'i seç
- [ ] İlk yorumu kendin at (SS: teşekkür + link)
- [ ] İlk 1 saat boyunca gelen yorumları cevapla

## ⚡ Pro Tips

1. **İlk yorum:** Post attıktan hemen sonra kendin yorum at:
   ```
   Full disclosure: I'm the developer of HookSniff. 
   Happy to answer any questions about the architecture or implementation!
   ```

2. **Downvote'ları umursama** — Reddit'te ilk saatlerde downvote normal, sonra düzelir

3. **Her yoruma cevap ver** — algoritma etkileşimi sever

4. **Cross-post yapma** — aynı içeriği birden fazla subreddit'e atma, Reddit banlayabilir

5. **Farklı günlerde paylaş** — 3 gün boyunca her gün 2 post at
