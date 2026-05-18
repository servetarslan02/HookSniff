# Deep Review: Rate Limiting, Throttling & Abuse Prevention

**Reviewer:** Deep Rate-Limit Subagent  
**Date:** 2026-05-10  
**Scope:** `rate_limit.rs`, `throttle/`, `routes/rate_limits.rs`, `middleware/`, `routes/auth.rs`, `routes/endpoints.rs`, `routes/webhooks.rs`, `dashboard/.../rate-limiting/page.tsx`, `worker/src/`

---

## Executive Summary

HookSniff has a **solid foundation** for rate limiting and throttling, but there are **critical enforcement gaps** and **bypass scenarios** that must be addressed before production. The system has two separate rate limiting layers (API-level and per-endpoint throttle) plus a webhook quota system, but they don't fully coordinate, and some attack vectors remain open.

**Overall Risk Rating: MEDIUM-HIGH** — The core infrastructure is sound, but several bypass paths and missing enforcement points create real abuse potential.

---

## 1. Rate Limiter Implementation

### Algorithm & Storage

| Aspect | Finding | Rating |
|--------|---------|--------|
| **Algorithm** | Sliding window (sorted sets in Redis, timestamp vectors in-memory) | ✅ Good |
| **Scope** | Per-API-key-prefix (authenticated) or per-IP (unauthenticated) | ✅ Good |
| **Storage** | Dual-backend: `InMemoryRateLimiter` (default) or `RedisRateLimiter` (when `RATE_LIMIT_STORE=redis`) | ⚠️ See below |
| **Survives restarts** | In-memory: **NO**. Redis: **YES** | ⚠️ Critical |
| **Distributed** | In-memory: **NO** (per-instance). Redis: **YES** | ⚠️ Critical |

### Key Issues

#### 🔴 CRITICAL: In-Memory Default is Dangerous in Production

```rust
pub async fn create_rate_limiter() -> RateLimiter {
    let store: Arc<dyn RateLimitStore> = match std::env::var("RATE_LIMIT_STORE").as_deref() {
        Ok("redis") => { /* use Redis */ },
        _ => Arc::new(InMemoryRateLimiter::new()), // ← DEFAULT
    };
}
```

**Problem:** If `RATE_LIMIT_STORE` is not set (or set to anything other than `"redis"`), the system silently falls back to in-memory rate limiting. This means:
- Rate limits reset on every server restart (DDoS window)
- Multiple API instances each have independent counters (N× bypass with N instances)
- No persistence, no distribution

**Recommendation:** Log a loud warning (or fail to start) in production when Redis is not configured. Consider making Redis mandatory for production deployments.

#### 🟡 MEDIUM: Redis Failure = Open Floodgates

```rust
Err(e) => {
    tracing::error!("Redis rate limit error: {e}, allowing request");
    return RateLimitResult {
        allowed: true,  // ← Fail-open
        remaining: limit,
        limit,
        reset_seconds: window_secs,
    };
}
```

**Problem:** On any Redis error, the rate limiter **fails open** — allowing all requests through. A brief Redis outage could allow unlimited API calls.

**Recommendation:** Consider a circuit breaker pattern: after N consecutive Redis failures, switch to a conservative in-memory fallback with lower limits rather than fully open.

#### 🟡 MEDIUM: Key Collision Risk with 15-Character Prefix

```rust
fn extract_key(req: &Request) -> String {
    req.headers()
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .map(|k| k[..15.min(k.len())].to_string())
        // ...
}
```

**Problem:** Only the first 15 characters of the API key are used as the rate limit key. While `hr_live_` (8 chars) + 7 hex chars provides ~16M unique prefixes, two different customers' keys could collide at the prefix level, causing one customer to be rate-limited by another's usage.

**Recommendation:** Use a hash of the full API key or the customer ID as the rate limit key. The prefix approach works for plan lookup but is risky for counter isolation.

---

## 2. Throttle Manager

### Architecture

The `ThrottleManager` is a **separate, in-memory, per-endpoint** rate limiter used for delivery throttling (protecting downstream webhook receivers).

| Aspect | Finding | Rating |
|--------|---------|--------|
| **Algorithm** | Sliding window (timestamp vectors) | ✅ Good |
| **Scope** | Per-endpoint UUID | ✅ Good |
| **Storage** | In-memory only (`Arc<Mutex<HashMap>>`) | 🔴 Critical |
| **Survives restarts** | **NO** | 🔴 Critical |
| **Distributed** | **NO** | 🔴 Critical |
| **Configurable per plan** | **NO** — uses endpoint-level `throttle_rate`/`throttle_period_secs` | ⚠️ See below |

### Key Issues

#### 🔴 CRITICAL: Throttle State is Purely In-Memory

```rust
pub struct ThrottleManager {
    states: Arc<Mutex<HashMap<Uuid, ThrottleState>>>,
    cleanup_interval: Duration,
}
```

**Problem:** The throttle manager stores all state in process memory. This means:
- State is lost on worker restart → burst of previously-throttled deliveries
- Multiple workers each have independent throttle state → no cross-instance coordination
- No way to inspect current throttle state from the dashboard

**Recommendation:** Move throttle state to Redis (like the API rate limiter) or use PostgreSQL advisory locks for coordination.

#### 🟡 MEDIUM: Throttle Manager Not Used in Worker

The `ThrottleManager` is instantiated in `api/src/main.rs` and injected into the API routes, but **the worker (`worker/src/main.rs`) has no throttle manager**. The worker processes webhook deliveries directly without checking per-endpoint throttle limits.

The worker only does:
1. Fetch pending items from `webhook_queue`
2. Deliver via HTTP
3. Update status

There's no check against `throttle_rate`/`throttle_period_secs` before delivery. The throttle manager exists in the API but appears to be **unused at the actual delivery point**.

**Recommendation:** The worker must check `ThrottleManager` (or equivalent) before each delivery attempt. This is where throttling actually matters.

#### 🟡 MEDIUM: Not Configurable Per Plan

The throttle config (`throttle_rate`, `throttle_period_secs`) is stored per-endpoint in the database. There's no plan-based default or maximum. A Free-tier customer could set `throttle_rate=100000` on their endpoint, bypassing any plan-based delivery rate limits.

**Recommendation:** Enforce plan-based maximum throttle rates:
- Free: max 10 req/sec per endpoint
- Pro: max 100 req/sec
- Business: max 1000 req/sec
- Enterprise: unlimited

---

## 3. Plan-Based Limits

### Actual vs. Expected Limits

| Plan | Task Spec (Expected) | Actual Code | Match? |
|------|---------------------|-------------|--------|
| **Free** | 1,000 webhooks/month | **10,000** webhooks/month | ❌ |
| **Pro** | 10,000 webhooks/month | **50,000** webhooks/month | ❌ |
| **Business** | 100,000 webhooks/month | **500,000** webhooks/month | ❌ |
| **Enterprise** | Unlimited | `u64::MAX` | ✅ |

**Note:** The code limits are 10× higher than the task spec suggests. This may be intentional (the code is the source of truth), but the discrepancy should be confirmed with product.

### Enforcement Mechanism

```rust
// Atomic check-and-increment in create_webhook:
let updated: Option<Customer> = sqlx::query_as(
    "UPDATE customers SET webhook_count = webhook_count + 1 
     WHERE id = $1 AND webhook_count < $2 RETURNING *",
)
.bind(customer.id)
.bind(customer.webhook_limit as i64)
.fetch_optional(&pool)
.await?;

if updated.is_none() {
    return Err(AppError::RateLimitExceeded);
}
```

| Aspect | Finding | Rating |
|--------|---------|--------|
| **Enforcement timing** | **Before delivery** (atomic check-and-increment) | ✅ Excellent |
| **Batch support** | Atomic increment for entire batch | ✅ Good |
| **Rollback on failure** | Yes — excess `webhook_count` rolled back for failed/filtered items | ✅ Good |
| **Monthly reset** | Background job runs daily, resets `webhook_count` | ⚠️ See below |
| **Race conditions** | Atomic SQL prevents double-spend | ✅ Good |

### Key Issues

#### 🟡 MEDIUM: Monthly Reset is Day-Based, Not Period-Based

```rust
// In main.rs:
tokio::spawn(async move {
    loop {
        tokio::time::sleep(std::time::Duration::from_secs(24 * 60 * 60)).await;
        if let Err(e) = jobs::retention::reset_monthly_webhook_counts(&reset_pool).await {
            tracing::error!("❌ Monthly count reset failed: {:?}", e);
        }
    }
});
```

**Problem:** The reset job runs every 24 hours but should run on the 1st of each month. If the job checks `now().day() == 1`, it might miss the window. Need to verify the implementation of `reset_monthly_webhook_counts`.

#### 🟡 MEDIUM: `webhook_limit` is Stored on Customer, Not Derived from Plan

```rust
.bind(customer.webhook_limit as i64)
```

The `webhook_limit` field on the `customers` table is set when the plan changes, but if the billing webhook fails to update it, the limit could be stale. The check should ideally derive the limit from `Plan::parse_str(&customer.plan).max_webhooks_per_month()` at check time rather than relying on a stored field.

---

## 4. Abuse Prevention

### 4.1 Rate Limit Bypass Scenarios

#### 🔴 CRITICAL: IP Spoofing via X-Forwarded-For

```rust
fn extract_client_ip(headers: &HeaderMap) -> String {
    if let Some(real_ip) = headers.get("x-real-ip") { return real_ip; }
    // Fallback: take LAST entry from X-Forwarded-For
    headers.get("x-forwarded-for")
        .and_then(|v| v.split(',').last())
        .map(|s| s.trim().to_string())
        .unwrap_or_else(|| "unknown".to_string())
}
```

**Problem:** The code takes the **LAST** entry from `X-Forwarded-For`, but per the standard, the FIRST entry is the client IP and subsequent entries are proxies. Additionally, if `X-Real-IP` is not set (no trusted proxy), an attacker can inject `X-Forwarded-For: innocent_victim_ip, attacker_real_ip`. The rate limiter would then:
- Track and rate-limit the **victim's** spoofed IP
- Allow the attacker to operate unrestricted

This affects all IP-based rate limits: registration, login, password reset, etc.

**Recommendation:** 
1. Take the **FIRST** entry from `X-Forwarded-For` (or better, configure a trusted proxy count)
2. Only trust `X-Real-IP` / `X-Forwarded-For` from known proxy IPs
3. In production behind Cloudflare, `CF-Connecting-IP` is the authoritative source

#### 🔴 CRITICAL: API-Level Rate Limit Middleware Has a Gap

Looking at `routes/mod.rs`, the rate limit middleware is applied to the `api_router()`:

```rust
api_router()
    .layer(axum_middleware::from_fn(rate_limit_middleware))
    .layer(axum::Extension(pool))
    .layer(axum::Extension(rate_limiter))
    // ...
```

But the `auth::router()` is registered at the **top level** of `api_router()`, **outside** the protected routes:

```rust
Router::new()
    .nest("/auth", auth::router())      // ← Outside rate_limit_middleware
    .nest("/oauth", oauth::router())    // ← Outside
    .nest("/contact", contact::router())// ← Outside
    .merge(protected)                   // ← Inside rate_limit_middleware
```

**Wait** — actually, looking more carefully at the middleware layer order:

```rust
api_router()
    .layer(axum_middleware::from_fn(rate_limit_middleware))  // Applied to ALL routes
    .layer(axum::Extension(pool))
    // ...
```

The `rate_limit_middleware` is applied as the **outermost** middleware on the entire `api_router()`. So it does cover auth routes. However, the auth routes also have their own per-endpoint rate limiting (5 register, 10 login per IP). This is **defense in depth** — good.

**But there's a subtle issue:** The `rate_limit_middleware` uses `extract_key()` which falls back to IP for unauthenticated requests. If an attacker rotates IPs (via proxies), they bypass the API-level rate limiter entirely. The per-route rate limits in `auth.rs` also use IP, so the same bypass applies.

**Recommendation:** Consider adding CAPTCHA or proof-of-work for registration/login endpoints to prevent automated abuse even with IP rotation.

#### 🟡 MEDIUM: Auth Routes Lack X-RateLimit Headers

The `rate_limit_middleware` adds `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, and `Retry-After` headers. However, when auth routes return `AppError::RateLimitExceeded`, the error response goes through `AppError::into_response()` which does **NOT** include these headers:

```rust
AppError::RateLimitExceeded => (
    StatusCode::TOO_MANY_REQUESTS,
    "RATE_LIMIT_EXCEEDED",
    self.to_string(),
),
// → (status, Json(body)).into_response()  ← No rate limit headers
```

**Recommendation:** Ensure `AppError::RateLimitExceeded` responses include rate limit headers, or route all 429 responses through the middleware.

### 4.2 IP-Based Limiting for Unauthenticated Endpoints

| Endpoint | Rate Limit | Key | Rating |
|----------|-----------|-----|--------|
| `POST /auth/register` | 5/hour per IP | `register:{ip}` | ✅ Good |
| `POST /auth/login` | 10/15min per IP | `login:{ip}` | ✅ Good |
| `POST /auth/forgot-password` | 5/hour per IP | `forgot_pwd:{ip}` | ✅ Good |
| `POST /auth/reset-password` | 5/hour per IP | `reset_pwd:{ip}` | ✅ Good |
| `POST /auth/resend-verification` | 5/hour per IP | `resend_verify:{ip}` | ✅ Good |
| `GET /status` | **None** | — | ⚠️ Low risk |
| `POST /contact` | **None visible** | — | 🟡 Medium risk |
| `POST /oauth/*` | **None visible** | — | 🟡 Medium risk |

**Recommendation:** Add rate limiting to `/contact` and `/oauth` endpoints to prevent spam/abuse.

### 4.3 Webhook Flooding Protection

#### ✅ Good: Atomic Quota Enforcement

The `webhook_count` check is atomic — a customer cannot exceed their monthly quota even with concurrent requests.

#### ⚠️ Concern: No Per-Second/Per-Minute Limit on Webhook Creation

The API rate limit middleware applies `max_requests_per_minute()` based on plan (Free: 100, Pro: 1000, etc.), but this covers **all** API requests, not just webhook creation. A customer could make 100 webhook creation requests per minute on the Free plan, which is the API limit but not specifically a webhook creation rate limit.

#### ⚠️ Concern: Batch Endpoint Allows Up to 100 Webhooks per Request

```rust
if req.webhooks.len() > 100 {
    return Err(AppError::BadRequest("Batch size cannot exceed 100".into()));
}
```

A Free-tier customer with 100 API requests/min could create 100 × 100 = 10,000 webhooks per minute through the batch endpoint, consuming their monthly quota in 1 minute.

**Recommendation:** Apply a stricter per-minute limit on webhook creation specifically, or reduce the batch size limit for lower tiers.

### 4.4 Endpoint URL Enumeration

#### ✅ Good: Ownership Check

```rust
async fn verify_endpoint_ownership(
    pool: &PgPool,
    customer_id: Uuid,
    endpoint_id: Uuid,
) -> Result<(), AppError> {
    let exists: Option<(Uuid,)> =
        sqlx::query_as("SELECT id FROM endpoints WHERE id = $1 AND customer_id = $2")
            .bind(endpoint_id)
            .bind(customer_id)
            .fetch_optional(pool)
            .await?;
    if exists.is_none() {
        return Err(AppError::NotFound);
    }
    Ok(())
}
```

All endpoint operations verify ownership. UUIDs are not sequential, making enumeration impractical.

#### ⚠️ Concern: Different Error for Invalid vs. Unauthorized

The `verify_endpoint_ownership` function returns `AppError::NotFound` for both "endpoint doesn't exist" and "endpoint exists but belongs to another customer." This is correct — it prevents leaking existence information.

---

## 5. Error Responses

### Rate Limit Headers

| Header | Middleware Response | Error Response | Rating |
|--------|-------------------|----------------|--------|
| `X-RateLimit-Limit` | ✅ Set | ❌ Missing | 🟡 |
| `X-RateLimit-Remaining` | ✅ Set | ❌ Missing | 🟡 |
| `X-RateLimit-Reset` | ✅ Set | ❌ Missing | 🟡 |
| `Retry-After` | ✅ Set on 429 | ❌ Missing | 🟡 |
| Status Code | 429 ✅ | 429 ✅ | ✅ |
| Body Format | Empty body | JSON error ✅ | ✅ |

**Issue:** There are two different code paths for 429 responses:
1. **Middleware path** (`rate_limit_middleware`): Returns proper headers but **empty body**
2. **Handler path** (`AppError::RateLimitExceeded`): Returns JSON error body but **no rate limit headers**

**Recommendation:** Unify the 429 response format. The middleware should inject rate limit headers into the `AppError::RateLimitExceeded` response, or the error handler should include them.

### Response Body on 429

The middleware returns an empty body on 429:
```rust
let mut response = Response::new(axum::body::Body::empty());
*response.status_mut() = StatusCode::TOO_MANY_REQUESTS;
```

**Recommendation:** Return a JSON body with error details, like the handler path does:
```json
{"error": {"code": "RATE_LIMIT_EXCEEDED", "message": "Rate limit exceeded"}}
```

---

## 6. Dashboard UI

### Rate Limiting Page Analysis

| Feature | Status | Rating |
|---------|--------|--------|
| Shows current usage | ❌ Hardcoded to 0 | 🔴 |
| Shows limits per endpoint | ✅ Lists RPS, RPM, burst | ✅ |
| Shows throttled count | ❌ Always 0 | 🔴 |
| Shows queue depth | ❌ Always 0 | 🔴 |
| Warning before limits | ❌ No warnings | 🟡 |
| Plan-based limit display | ❌ Not shown | 🟡 |
| Edit limits inline | ❌ No edit UI | 🟡 |

### Key Issues

#### 🔴 CRITICAL: Dashboard Shows Fake Data

```tsx
setStats({
  total_throttled: 0,        // ← Hardcoded
  limits: data.map(d => ({
    current_queue_depth: 0,  // ← Hardcoded
    throttled_count: 0,      // ← Hardcoded
    last_throttled_at: null, // ← Hardcoded
  })),
});
```

The dashboard fetches rate limit configs from the API but fabricates usage metrics. Users see "0 throttled requests" and "0 queue depth" regardless of actual state.

**Recommendation:** Create API endpoints that return real-time throttle/queue metrics, or at minimum show the plan-based API rate limit and current usage from the billing/usage endpoint.

#### 🟡 MEDIUM: No Plan-Based Usage Display

The rate limiting page doesn't show:
- Current plan and its rate limits
- Monthly webhook quota usage (used/remaining)
- Warnings when approaching limits

The `/billing/usage` endpoint already provides this data — it should be surfaced on the rate limiting page.

#### 🟡 MEDIUM: No Inline Configuration

Users can't edit rate limits from the dashboard. They must use the API directly (`POST /rate-limits/:endpoint_id`).

---

## 7. Worker-Side Rate Limiting

### Finding: NO Rate Limiting in Worker

The worker (`worker/src/main.rs`) processes webhook deliveries with:
- Exponential backoff for retries (30s → 60s → 120s → 300s → 600s → 1800s)
- Zombie reaper for stuck records
- `FOR UPDATE SKIP LOCKED` for concurrent processing

**But there is NO:**
- Per-endpoint delivery rate limiting
- Per-customer delivery rate limiting
- Global delivery rate limiting
- Integration with the `ThrottleManager`

The `ThrottleManager` exists in the API layer but is **never used in the worker**. This means a burst of 1000 queued webhooks for a single endpoint will all be delivered simultaneously, potentially overwhelming the downstream server.

**Recommendation:** Implement per-endpoint rate limiting in the worker before each delivery:
1. Check `throttle_rate` / `throttle_period_secs` from endpoint config
2. If throttled, re-queue with `next_retry_at` set to the throttle window
3. Use Redis or PostgreSQL advisory locks for cross-worker coordination

---

## 8. Bypass Scenarios Summary

### 🔴 Critical Bypasses

| # | Bypass | Impact | Effort |
|---|--------|--------|--------|
| 1 | **IP spoofing via X-Forwarded-For** — Attacker spoofs victim IP, victim gets rate-limited | Bypass all IP-based limits + DoS innocent users | Low (single header) |
| 2 | **In-memory rate limiter default** — Multiple instances each have independent counters | N× rate limit bypass | Low (just deploy N instances) |
| 3 | **Worker has no throttle enforcement** — `ThrottleManager` exists but isn't used at delivery time | Downstream endpoint flooding | None (current state) |
| 4 | **Redis failure = open floodgates** — Fail-open on any Redis error | Unlimited requests during outage | Low (brief Redis blip) |

### 🟡 Medium Bypasses

| # | Bypass | Impact | Effort |
|---|--------|--------|--------|
| 5 | **IP rotation** defeats per-IP auth rate limits (when X-Real-IP is properly set) | Brute-force login, registration spam | Low (proxy rotation) |
| 6 | **Batch endpoint amplification** — 100 requests/min × 100 webhooks/batch = 10K webhooks/min | Monthly quota consumed in 1 min | Low |
| 7 | **No throttle max per plan** — Free customer sets `throttle_rate=100000` | Unlimited delivery rate | Low (API call) |
| 8 | **Rate limit headers missing on handler 429s** — Client can't implement backoff properly | Client-side abuse | N/A |

### 🟢 Low Risk

| # | Issue | Impact |
|---|-------|--------|
| 9 | API key prefix collision (15 chars) | Cross-customer rate limit interference |
| 10 | `/contact` endpoint unrate-limited | Spam submissions |
| 11 | Dashboard shows fake throttle metrics | Misleading user experience |

---

## 9. Recommendations (Priority Order)

### P0 — Must Fix Before Production

1. **Fix IP extraction for rate limiting** — Use FIRST entry from X-Forwarded-For (or CF-Connecting-IP behind Cloudflare); only trust headers from known proxy IPs
2. **Make Redis mandatory in production** — Fail to start or loudly warn if `RATE_LIMIT_STORE` ≠ `redis` in production
3. **Implement worker-side throttling** — Use `ThrottleManager` (or Redis-based equivalent) in the worker before each delivery
4. **Add circuit breaker for Redis failures** — After N consecutive failures, switch to conservative in-memory fallback instead of fully open

### P1 — Should Fix Soon

5. **Unify 429 response format** — Both middleware and handler should return consistent JSON body + rate limit headers
6. **Add per-plan throttle maximums** — Prevent Free-tier customers from setting unlimited delivery rates
7. **Reduce batch size for lower tiers** — Free: max 10/batch, Pro: max 50/batch, Business: max 100/batch
8. **Surface real metrics in dashboard** — Connect rate limiting page to actual usage data from `/billing/usage`

### P2 — Nice to Have

9. **Add CAPTCHA to registration** — Prevent automated account creation even with IP rotation
10. **Use customer ID instead of API key prefix** for rate limit key — Eliminates collision risk
11. **Add rate limiting to `/contact` and `/oauth` endpoints**
12. **Add plan-based webhook creation rate limit** — Separate from general API rate limit
13. **Dashboard inline configuration** — Allow editing rate limits from the UI

---

## 10. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                             │
│                                                              │
│  Request → rate_limit_middleware (sliding window, Redis/IM)  │
│           → auth_middleware (API key / JWT)                  │
│           → route handler                                    │
│              → webhook_count atomic check (PostgreSQL)       │
│              → publish to webhook_queue                      │
│                                                              │
│  Auth routes have additional per-IP rate limits:             │
│    register: 5/hr, login: 10/15min, reset: 5/hr             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Worker Layer                           │
│                                                              │
│  webhook_queue → FOR UPDATE SKIP LOCKED (50 batch)          │
│               → deliver_http()                               │
│               → update status / retry / dead letter          │
│                                                              │
│  ⚠️ NO per-endpoint throttle check                          │
│  ⚠️ NO per-customer delivery rate limit                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Throttle Manager (UNUSED)                  │
│                                                              │
│  Exists in API layer: ThrottleManager::check()              │
│  Per-endpoint, in-memory sliding window                      │
│  Never called in worker → EFFECTIVELY DEAD CODE              │
└─────────────────────────────────────────────────────────────┘
```

---

## Files Reviewed

| File | Lines | Key Finding |
|------|-------|-------------|
| `api/src/rate_limit.rs` | ~490 | Sliding window, dual backend, fail-open on Redis error |
| `api/src/throttle/mod.rs` | ~370 | In-memory only, not used in worker |
| `api/src/routes/rate_limits.rs` | ~240 | Per-endpoint config CRUD, ownership verified |
| `api/src/middleware/mod.rs` | ~340 | Auth middleware, API key verification |
| `api/src/middleware/idempotency.rs` | ~310 | Idempotency + replay protection |
| `api/src/middleware/webhook_verify.rs` | ~200 | Standard Webhooks signature verification |
| `api/src/routes/auth.rs` | ~1100 | Per-IP rate limits on auth endpoints |
| `api/src/routes/endpoints.rs` | ~450 | Endpoint creation limit enforced |
| `api/src/routes/webhooks.rs` | ~1000 | Atomic webhook_count enforcement |
| `api/src/billing/mod.rs` | ~410 | Plan definitions (limits higher than spec) |
| `api/src/error.rs` | ~250 | 429 response without rate limit headers |
| `dashboard/.../rate-limiting/page.tsx` | ~200 | Fake throttle metrics |
| `worker/src/main.rs` | ~430 | No throttle enforcement |
| `worker/src/delivery/http.rs` | ~100 | Clean HTTP delivery |
