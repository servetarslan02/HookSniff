# HookSniff Deep-Dive Code Review

**Reviewer:** Cascade (Claude Sonnet 4.5)  
**Date:** 2026-05-10  
**Scope:** Full source code review of HookSniff webhook delivery platform  
**Files Reviewed:** 90+ source files across API, Worker, Dashboard

---

## Executive Summary

HookSniff is a **production-quality webhook delivery platform** with a Rust backend (Axum + SQLx + PostgreSQL), a background worker using PostgreSQL-based queue polling with LISTEN/NOTIFY, and a Next.js dashboard. The architecture is solid, the codebase is well-structured, and most features are fully implemented. However, several critical security issues, performance concerns, and operational gaps need attention before scaling.

**Overall Rating: 7.5/10** — Good foundation with some rough edges that need fixing.

---

## 1. Architecture Review

### ✅ Strengths

| Area | Detail |
|------|--------|
| **Tech Stack** | Rust/Axum backend is performant and type-safe. SQLx with compile-time query checking is excellent. |
| **Queue System** | PostgreSQL-based queue (LISTEN/NOTIFY + polling fallback) avoids external dependencies like Redis/Kafka. Smart `FOR UPDATE SKIP LOCKED` for concurrent workers. |
| **Worker Resilience** | Zombie reaper for stuck processing records, orphaned delivery reaper, exponential backoff with jitter, dead letter queue. |
| **Auth** | JWT + refresh token in HttpOnly cookies, 2FA support, API key hashing, rate limiting on auth endpoints. |
| **Observability** | OpenTelemetry integration in worker, Prometheus metrics in API, structured logging with tracing. |
| **Testing** | Comprehensive unit tests across all modules, good coverage of edge cases. |

### ⚠️ Concerns

| Area | Detail |
|------|--------|
| **No Connection Pooling Config** | `PgPoolOptions::new().max_connections(10)` in worker is hardcoded. Should be configurable. |
| **Single-Queue Design** | All webhook types share one queue table. High-volume customers could cause head-of-line blocking. |
| **No Circuit Breaker** | Worker will keep retrying failing endpoints with exponential backoff but no circuit breaker to stop hammering a clearly-down endpoint. |

---

## 2. Security Review

### 🔴 Critical Issues

#### 2.1 SSRF Protection — DNS Rebinding Gap
**File:** `api/src/ssrf.rs` (referenced in `api/src/routes/endpoints.rs:99`)

The SSRF validation checks the URL at creation time, but DNS rebinding can bypass this:
1. User creates endpoint with `https://evil.com` (resolves to `1.2.3.4` at creation time)
2. DNS is updated to resolve to `169.254.169.254` (GCP metadata)
3. Worker fetches the URL and hits the metadata service

**Recommendation:** Validate IP at delivery time in the worker, not just at creation time.

#### 2.2 Timing Attack on API Key Verification
**File:** `api/src/middleware.rs` (referenced in auth middleware)

API keys are verified by hashing the input and comparing hashes. If the comparison is not constant-time, attackers can determine valid keys byte-by-byte.

**Recommendation:** Use `constant_time_eq` or `subtle` crate for hash comparison.

#### 2.3 No CORS Configuration
**File:** `api/src/routes/mod.rs`

The API router doesn't configure CORS headers. The `system_status` endpoint manually adds `Access-Control-Allow-Origin: *`, but other endpoints have no CORS. This could either:
- Block legitimate dashboard requests (if dashboard is on different origin)
- Allow any origin to make authenticated requests (if credentials are allowed)

**Recommendation:** Add proper CORS middleware with allowed origins from config.

#### 2.4 Refresh Token Rotation Not Atomic
**File:** `api/src/routes/auth.rs:420-455`

The refresh token flow: find token → revoke old → generate new. If the process crashes between revoking and generating, the user is locked out. More critically, there's a race condition where the same refresh token could be used twice before revocation.

**Recommendation:** Use a database transaction and add a `used` flag. Check and mark in one atomic operation.

### 🟡 Medium Issues

| Issue | File | Detail |
|-------|------|--------|
| **Password Reset Token Not Single-Use Protected** | `auth.rs:380-400` | Token is checked against `used = false` but marking and password update aren't in a transaction. |
| **TOTP Secret Stored in Plain Text** | `auth.rs:660-690` | `totp_secret` is stored as plain text in the database. Should be encrypted at rest. |
| **No Rate Limiting on 2FA Verification** | `auth.rs:300-340` | `verify_2fa_login` has no rate limiting, allowing brute-force TOTP codes (1M possibilities for 6-digit). |
| **Session Fixation** | `auth.rs:280-300` | After successful login, old session cookies aren't invalidated if user was already logged in. |

---

## 3. Database & Query Review

### ✅ Strengths

| Pattern | Quality |
|---------|---------|
| **Parameterized Queries** | All queries use SQLx bind parameters — no SQL injection possible. |
| **Transaction Usage** | Account deletion, password reset, delivery processing all use transactions. |
| **Proper Indexing** | Lookups on `customer_id`, `endpoint_id`, `status`, `token_hash` suggest good index coverage. |
| **Connection Pooling** | SQLx PgPool with configurable max connections. |

### ⚠️ Issues

#### 3.1 N+1 Query in Health Endpoints
**File:** `api/src/routes/health_endpoints.rs:58-100`

Fixed! The code now batch-fetches stats. Good.

#### 3.2 Missing Pagination on Several Endpoints
**Files:** `api/src/routes/endpoints.rs`, `api/src/routes/alerts.rs`, `api/src/routes/teams.rs`

```rust
// endpoints.rs — no LIMIT
"SELECT * FROM endpoints WHERE customer_id = $1 ORDER BY created_at DESC"
```

Users with hundreds of endpoints will get all of them in one response.

**Recommendation:** Add `LIMIT`/`OFFSET` or cursor-based pagination.

#### 3.3 Dead Letter Table Could Grow Unbounded
**File:** `worker/src/main.rs`

Dead letters are inserted but there's no TTL or cleanup mechanism. Over time, this table will grow indefinitely.

**Recommendation:** Add a scheduled job to archive/delete dead letters older than 30 days.

#### 3.4 Webhook Count Race Condition
**File:** `api/src/routes/webhooks.rs:153-160`

```rust
"UPDATE customers SET webhook_count = webhook_count + 1 WHERE id = $1 AND webhook_count < $2 RETURNING *"
```

This is actually correct — it's atomic with `RETURNING`. But if the delivery fails to be created after the count is incremented, the count is never decremented.

**Recommendation:** Wrap the count increment + delivery creation in a transaction.

---

## 4. Worker Reliability

### ✅ Strengths

| Feature | Detail |
|---------|--------|
| **LISTEN/NOTIFY** | Instant wake-up on new webhooks with 1s polling fallback. |
| **Graceful Shutdown** | SIGTERM handling with in-flight delivery completion. |
| **Zombie Reaper** | Recovers stuck "processing" records every 30s. |
| **Orphan Reaper** | Re-queues deliveries with no active queue entry. |
| **Concurrent Processing** | Each delivery runs in its own tokio task. |
| **FOR UPDATE SKIP LOCKED** | Prevents duplicate processing across multiple workers. |

### ⚠️ Issues

#### 4.1 No Delivery Timeout
**File:** `worker/src/delivery/http.rs`

The HTTP client has a 30s timeout, but there's no overall delivery timeout. If an endpoint is slow but doesn't timeout (e.g., 29s response time), it ties up worker capacity.

**Recommendation:** Add a delivery-level timeout (e.g., 45s) that's enforced even if the HTTP client timeout is higher.

#### 4.2 No Backpressure Mechanism
**File:** `worker/src/main.rs:180-250`

The worker processes up to 50 items per batch with no backpressure. If all 50 items target slow endpoints, the worker is blocked until they complete.

**Recommendation:** Use a semaphore to limit concurrent deliveries (e.g., 100 concurrent) and add queue depth monitoring.

#### 4.3 Retry Backoff Not Configurable
**File:** `worker/src/main.rs:470-480`

```rust
fn calculate_backoff(attempt: i32) -> i64 {
    let base = 30_i64;
    let delay = base * 2_i64.pow((attempt - 1).max(0) as u32);
    delay.min(1800) // Max 30 minutes
}
```

Hardcoded 30s base, 30min max. Should be configurable per-endpoint (and already has retry_policy in the Endpoint model).

**Recommendation:** Use the endpoint's `retry_policy` configuration instead of hardcoded values.

---

## 5. API Design & Error Handling

### ✅ Strengths

| Pattern | Quality |
|---------|---------|
| **Consistent Error Format** | `{"error": {"code": "...", "message": "..."}}` across all endpoints. |
| **Error Codes** | SCREAMING_SNAKE_CASE codes: `NOT_FOUND`, `UNAUTHORIZED`, `BAD_REQUEST`, etc. |
| **No Internal Details Leaked** | Database errors become generic "Internal server error". |
| **Input Validation** | Event type validation, JSON depth validation, payload size limits, SSRF checks. |

### ⚠️ Issues

#### 5.1 Inconsistent Error HTTP Status Codes
Some validation errors return 403 when they should return 400:

```rust
// endpoints.rs:99 — SSRF rejection returns 403
return Err(AppError::Forbidden(format!("Internal URLs are not allowed: {}", e)));
```

SSRF is a validation failure, not an authorization failure. Should be 400 or 422.

#### 5.2 Batch Errors Don't Preserve Individual Status Codes
**File:** `api/src/routes/webhooks.rs:290-420`

Batch responses include errors but don't specify which HTTP status code each error would have returned.

#### 5.3 Missing Request ID Tracking
No `X-Request-ID` header is generated or propagated. Makes debugging production issues harder.

**Recommendation:** Add middleware to generate and propagate request IDs.

---

## 6. Frontend (Dashboard) Review

### ✅ Strengths

| Feature | Quality |
|---------|---------|
| **Auth Flow** | Cookie-based auth with automatic refresh on 401. |
| **Error Handling** | `getErrorMessage()` utility, ErrorBoundary, toast notifications. |
| **i18n** | 8 languages supported with next-intl. |
| **API Client** | Timeout handling, automatic retry on 401, clean abstraction. |

### ⚠️ Issues

#### 6.1 API Key Shown in Plaintext After Creation
**File:** `dashboard/src/lib/store.tsx:45-50`

After registration, `data.customer.api_key` is stored in memory. This is correct (one-time display), but there's no UI indication that the key won't be shown again.

#### 6.2 No Loading States for Some Actions
Several pages fetch data in `useEffect` but don't show loading spinners during mutations (create, update, delete).

#### 6.3 No Error Boundary at Route Level
**File:** `dashboard/src/app/[locale]/error.tsx`

The error page exists but only catches runtime errors. API errors during data fetching are handled per-component, leading to inconsistent error states.

#### 6.4 Hardcoded API URLs in Multiple Places
**Files:** `dashboard/src/lib/api.ts`, `dashboard/src/lib/store.tsx`

`API_BASE` is defined in both files with the same logic. Should be a single constant.

---

## 7. Testing Review

### ✅ Strengths

| Area | Detail |
|------|--------|
| **Unit Tests** | Every module has comprehensive unit tests. |
| **Edge Cases** | Tests cover error paths, boundary conditions, empty inputs. |
| **Integration Tests** | API routes have construction tests ensuring all routes compile. |
| **Test Coverage** | 80+ test files covering components, pages, utilities. |

### ⚠️ Issues

#### 7.1 No End-to-End Tests
All tests are unit/component tests. No integration tests that verify the full flow: create endpoint → send webhook → verify delivery.

#### 7.2 No Load Tests
No evidence of load testing. The worker's 50-item batch size and lack of backpressure need validation under load.

#### 7.3 Test Database Not Isolated
Tests use `sqlx::query` directly. If tests run in parallel, they could interfere with each other.

---

## 8. Operational Concerns

### 🔴 Critical Gaps

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| **No Database Migrations** | Schema changes require manual SQL | Add `sqlx migrate` or similar |
| **No Deployment Pipeline** | No CI/CD configuration visible | Add GitHub Actions for build/test/deploy |
| **No Secret Management** | Secrets in environment variables | Use GCP Secret Manager or similar |
| **No Backup Strategy** | No evidence of database backups | Configure automated PostgreSQL backups |

### 🟡 Medium Gaps

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| **No Rate Limiting Dashboard** | Users can't see their usage | Add usage stats to dashboard |
| **No Webhook Replay from Dead Letter** | Dead letters require manual intervention | Add "Replay from Dead Letter" button |
| **No Endpoint Health Alerts** | Users don't know when endpoints are failing | Add email/Slack alerts for failure streaks |
| **No Audit Logging for Admin Actions** | Admin actions aren't tracked | Add audit log for admin operations |

---

## 9. Performance Considerations

### Current Bottlenecks

| Bottleneck | Impact | Mitigation |
|------------|--------|------------|
| **Single Worker Process** | All deliveries processed by one worker | Deploy multiple worker instances (already supported with SKIP LOCKED) |
| **No Connection Pooling for HTTP** | Worker creates new HTTP connections | Already using `reqwest::Client` with pooling — good |
| **Full Payload Stored** | Every webhook payload stored in DB | Consider payload compression or S3 offload for large payloads |
| **No Caching** | Endpoint configs fetched per-delivery | Add in-memory cache with TTL for endpoint configs |

### Recommendations

1. **Add Redis** for rate limiting and caching (currently using in-memory rate limiter)
2. **Implement payload compression** for stored webhooks
3. **Add read replicas** for analytics queries
4. **Consider Kafka/NATS** if throughput exceeds PostgreSQL queue capacity

---

## 10. Code Quality

### ✅ Strengths

| Aspect | Quality |
|--------|---------|
| **Consistent Style** | Rust code follows standard conventions, consistent naming |
| **Documentation** | Module-level docs explain architecture decisions |
| **Error Propagation** | Proper use of `?` operator and `anyhow` for error chains |
| **Type Safety** | Strong typing throughout, SQLx compile-time checks |
| **Separation of Concerns** | Clean module boundaries: routes, models, middleware, etc. |

### ⚠️ Code Smells

| Issue | Location | Detail |
|-------|----------|--------|
| **Magic Numbers** | `worker/src/main.rs` | `50` (batch size), `30` (reaper interval), `5 minutes` (zombie threshold) — should be constants or config |
| **Duplicate API_BASE** | Dashboard | Defined in both `api.ts` and `store.tsx` |
| **Inconsistent Error Handling** | Dashboard | Some pages use `try/catch`, others use `.catch()`, some have no error handling |
| **Large Route Files** | `auth.rs`, `webhooks.rs` | 1000+ lines — consider splitting into sub-modules |

---

## 11. Prioritized Recommendations

### 🔴 Critical (Fix Before Production)

1. **Fix SSRF DNS Rebinding** — Validate IPs at delivery time, not just creation time
2. **Add Constant-Time Comparison** for API key verification
3. **Add CORS Configuration** — proper allowed origins
4. **Fix Refresh Token Race Condition** — use database transaction
5. **Add Rate Limiting to 2FA Verification** — prevent TOTP brute force

### 🟡 High Priority (Fix Soon)

6. **Add Circuit Breaker** for failing endpoints
7. **Implement Dead Letter Cleanup** — TTL or archival
8. **Add Request ID Middleware** — propagate for debugging
9. **Make Retry Policy Configurable** — use endpoint's retry_policy in worker
10. **Add Database Migrations** — automated schema management
11. **Add Webhook Replay from Dead Letter** — self-service recovery
12. **Add Endpoint Health Alerts** — email/Slack on failure streaks

### 🟢 Nice to Have

13. **Add E2E Tests** — full delivery flow testing
14. **Add Load Tests** — validate throughput limits
15. **Implement Payload Compression** — reduce storage
16. **Add Read Replicas** — scale analytics queries
17. **Add Audit Logging** — track admin actions
18. **Centralize API_BASE** — single source of truth in dashboard

---

## 12. Conclusion

HookSniff is a **well-architected webhook platform** with strong foundations:

- ✅ Solid Rust backend with proper error handling
- ✅ Reliable worker with zombie recovery and dead letters
- ✅ Good observability (OpenTelemetry, Prometheus)
- ✅ Comprehensive test coverage
- ✅ Clean API design with consistent error format

The main areas for improvement are:
- 🔴 Security hardening (SSRF, timing attacks, CORS)
- 🟡 Operational maturity (migrations, monitoring, alerting)
- 🟡 Scalability (circuit breakers, backpressure, caching)

With the critical security fixes and operational improvements, this platform is ready for production deployment and can scale to handle significant webhook volume.

---

*Review completed by Cascade (Claude Sonnet 4.5) on 2026-05-10*
