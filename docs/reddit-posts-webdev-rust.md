# Reddit Post — r/webdev (Image + Comment)

## Başlık (Title)
```
I split a 4000-line webhook handler into smart modules — lessons learned building a delivery platform in Rust
```

## Görsel
Dashboard screenshot'ları ekle:
1. Code architecture / module structure
2. Dashboard endpoint detail page
3. Retry timeline with error classification

## İlk Yorum

```
Hey r/webdev,

Building HookSniff (a webhook delivery platform) and wanted to share some 
lessons learned along the way.

**The problem:** My webhook handler was a single 4000-line file. Every retry 
strategy, every error type, every delivery method — all in one place. It worked, 
but it was unmaintainable.

**What I learned:**

**1. Error classification matters more than retry count**

Most webhook handlers treat all failures the same. But a 400 and a 500 are 
completely different problems:

- 400 = Your payload is wrong. Retrying 12 times won't fix it.
- 500 = Temporary server issue. Retry with backoff.
- 429 = Rate limited. Respect the Retry-After header.
- Timeout = Server is slow. Retry with increasing timeout.

I built a classifier that assigns one of: `permanent_error`, `rate_limited`, 
`server_error`, `timeout`, `network_error`. Each gets different retry behavior.

**2. Exponential backoff needs jitter**

Without jitter, all your retries hit at the same time (thundering herd). 
I added ±25% random jitter to every retry delay.

**3. Dead letter queues save your life**

Failed deliveries go to a DLQ automatically. You can replay them later, 
filter by error type, or batch-process them. Nothing gets silently dropped.

**4. FIFO ordering is underrated**

For event-sourced systems, you need sequence numbers. If `order.created` 
arrives before `order.updated`, your system breaks. I added FIFO ordering 
with max-wait protection.

**5. Real-time visibility is the killer feature**

The #1 complaint from webhook users: "I didn't know it was failing." 
I built a dashboard that shows every delivery, every failure, every latency 
spike — in real-time.

**The stack:** Rust (Axum) for the API, Next.js 16 for the dashboard, 
PostgreSQL + Redis for storage, Google Cloud Run for deployment.

Happy to answer questions about the architecture or specific implementation 
details.

Try it: https://hooksniff.vercel.app
```

---

# Reddit Post — r/rust (Image + Comment)

## Başlık (Title)
```
I built a webhook delivery platform in Rust — Axum + Tokio, handling 22K lines across 30 route modules
```

## Görsel
1. Architecture diagram
2. Performance metrics (latency, throughput)
3. Dashboard screenshot

## İlk Yorum

```
Hey r/rust,

Been building HookSniff — a webhook delivery platform — and wanted to share 
my experience with the Rust ecosystem for this kind of project.

**Why Rust for webhooks?**

Webhooks need to be fast and reliable. A 10ms delay in your delivery pipeline 
multiplies across thousands of deliveries. Rust's zero-cost abstractions mean 
I get the performance of C with the safety of a managed language.

**The stack:**
- **API:** Axum 0.8 + sqlx 0.8 (async PostgreSQL)
- **Worker:** Tokio-based async task processing
- **Queue:** Redis (Upstash) with Lua scripting for atomic operations
- **Telemetry:** OpenTelemetry → Sentry
- **Auth:** JWT + OAuth (Google, GitHub) + SSO/SAML

**What I learned:**

**1. Axum's tower middleware is incredibly powerful**

Rate limiting, authentication, CORS, request logging — all as tower layers. 
The composability is beautiful.

**2. sqlx's compile-time query checking saved me multiple times**

Catching SQL errors at compile time instead of runtime is a game-changer. 
The `query!` macro with PostgreSQL is *chef's kiss*.

**3. Error handling with anyhow + thiserror**

I use `thiserror` for library-level errors and `anyhow` for application-level 
errors. The combination is clean and ergonomic.

**4. Async webhooks with Tokio**

Each delivery is a Tokio task with its own timeout, retry policy, and error 
classification. The `select!` macro makes timeout handling trivial.

**5. The codebase grew to 22K lines**

30 route modules, ~22K lines of Rust. The module structure matters more than 
I expected. I split routes into: auth, endpoints, webhooks, analytics, billing, 
teams, admin, etc.

**Performance:**
- Average delivery latency: 45ms
- P99 latency: 120ms  
- Throughput: ~500 deliveries/second per instance

**What's next:**
- gRPC internal API for worker communication
- OpenTelemetry distributed tracing
- More SDKs (currently building Node.js, Python, Go)

Repo is private for now but happy to discuss architecture details.

Try it: https://hooksniff.vercel.app
```
