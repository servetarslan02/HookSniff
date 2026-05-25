# Deep Code Review: HookSniff Rust API Backend

**Reviewer:** AI Code Auditor  
**Date:** 2026-05-10  
**Files Reviewed:** 80+ Rust source files across `api/src/`  
**Codebase Size:** ~15,000+ lines of Rust  

---

## Executive Summary

HookSniff is a well-structured webhook delivery platform built with Axum + SQLx + Tokio. The codebase demonstrates solid engineering practices: parameterized SQL queries, SSRF protection, Standard Webhooks signature verification, proper JWT auth, and comprehensive test coverage. However, several security vulnerabilities and code quality issues were identified that should be addressed before production deployment.

**Overall Risk Rating: MEDIUM** — No critical SQL injection or auth bypass, but several high-severity issues exist.

---

## 1. SQL Injection

### ✅ PASS — All queries are parameterized

Every SQL query across all route files uses `$1`, `$2`, etc. bind parameters with `sqlx::query` / `sqlx::query_as`. No string interpolation is used for query values.

**Verified files:**
- `routes/auth.rs` — All queries use `$1`, `$2` bindings
- `routes/endpoints.rs` — All queries parameterized
- `routes/events.rs` — Dynamic WHERE clause built with `format!()` but values are bound via `$N` placeholders (safe pattern)
- `routes/webhooks.rs` — All queries parameterized
- `routes/billing.rs` — All queries parameterized
- `routes/admin.rs` — Dynamic WHERE with `$N` bindings (safe)
- `routes/search.rs` — Dynamic WHERE with `$N` bindings (safe)
- `routes/teams.rs` — All queries parameterized
- `routes/notifications.rs` — All queries parameterized
- `routes/alerts.rs` — All queries parameterized
- `routes/sso.rs` — All queries parameterized
- `routes/inbound.rs` — All queries parameterized
- `routes/api_keys.rs` — All queries parameterized
- `db.rs` — Migrations use `raw_sql` but contain only static DDL (no user input)

**Dynamic query pattern (events.rs, search.rs, admin.rs):**
```rust
let mut conditions = vec!["customer_id = $1".to_string()];
let mut bind_idx: i32 = 2;
if params.status.is_some() {
    conditions.push(format!("status = ${}", bind_idx));
    bind_idx += 1;
}
// Values are always bound via .bind()
```
This pattern is safe — the `format!()` only injects positional parameter numbers, not user values.

### ⚠️ Minor Concern: ILIKE pattern in admin.rs
```rust
conditions.push(format!("(email ILIKE ${0} OR name ILIKE ${0})", bind_idx));
// ...
let search_pattern = params.search.as_ref().map(|s| {
    let escaped = s.replace('\\', "\\\\").replace('%', "\\%").replace('_', "\\_");
    format!("%{}%", escaped)
});
```
The `%` and `_` wildcards are properly escaped before being passed as a bind parameter. This is correct.

---

## 2. Authentication Bypass

### ✅ Mitigated — Inbound webhook handler does redundant weaker auth

**File:** `routes/inbound.rs` — `handle_inbound_to_endpoint`

The handler does its own customer lookup by prefix only (no Argon2 verification), BUT the inbound routes are wrapped with `auth_middleware` in `routes/mod.rs`:

```rust
let inbound_routes = Router::new()
    .nest("/inbound", inbound::router())
    .layer(axum_middleware::from_fn(crate::middleware::auth_middleware));
```

The middleware already verifies the API key with Argon2 before the handler runs. However, the handler ignores the `Customer` extension from the middleware and does its own redundant (weaker) lookup. This is a **code quality issue** — the handler should extract `Extension<Customer>` instead of re-querying.

**Impact:** LOW — Auth is enforced by middleware. But if someone removes the middleware layer, the handler would be vulnerable.

### ✅ PASS — Auth middleware properly validates

The `auth_middleware` in `middleware/mod.rs` correctly:
- Checks API key prefix → Argon2 hash verification
- Falls back to JWT verification
- Handles both cookie and Authorization header
- Caches validated customers (30s TTL)
- Rejects placeholder tokens ("cookie", "null", "undefined")

### ⚠️ MEDIUM — Auth cache uses Mutex (blocking in async context)

```rust
static AUTH_CACHE: once_cell::sync::Lazy<Mutex<AuthCache>> = ...;
```

Using `std::sync::Mutex` in async code can cause deadlocks if the lock is held across `.await` points. The current code acquires the lock, does DB queries inside the critical section, and then releases. This is a performance bottleneck and potential deadlock risk.

**Recommendation:** Use `tokio::sync::Mutex` or `RwLock` instead, or better yet, use a proper async cache like `moka`.

### ✅ PASS — Admin middleware

Admin routes are properly layered:
```rust
let admin_routes = Router::new()
    .nest("/admin", admin::router())
    .layer(axum_middleware::from_fn(crate::middleware::admin_middleware))
    .layer(axum_middleware::from_fn(crate::middleware::auth_middleware));
```

Auth runs first, then admin check. The `require_admin` function in `admin.rs` provides a second check.

### ⚠️ MEDIUM — Billing webhooks have no auth middleware

The billing webhook endpoints (`/v1/billing/webhook`, `/v1/billing/webhook/polar`, `/v1/billing/webhook/iyzico`) are registered in the main router without auth middleware (correct — they verify via provider-specific signatures). However:

**`handle_stripe_webhook`:**
```rust
if webhook_secret.is_empty() {
    tracing::warn!("Stripe webhook secret not configured, skipping verification");
}
stripe::handle_webhook_event(&pool, &body, signature, webhook_secret, ...).await?;
```

If `STRIPE_WEBHOOK_SECRET` is not set, verification is skipped entirely. An attacker could send arbitrary webhook events.

---

## 3. Input Validation

### ✅ PASS — Comprehensive validation

**Event types:** `validation.rs` validates with regex `^[a-zA-Z0-9._]{1,100}$`

**URLs:** `ssrf.rs` provides thorough SSRF protection:
- Blocks private IPs (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
- Blocks loopback (127.0.0.0/8, ::1)
- Blocks link-local (169.254.0.0/16, fe80::/10)
- Blocks metadata endpoints (169.254.169.254, metadata.google.internal)
- DNS resolution with IP validation
- IPv6 support

**JSON depth:** `validation.rs` enforces max 10 levels of nesting

**Payload size:** Configurable via `MAX_PAYLOAD_BYTES` (default 1MB)

**Custom headers:** Validated to start with `X-` prefix

**Email:** Basic `contains('@')` check — **⚠️ Weak, should use regex or email crate**

**Passwords:** Minimum 8 characters

**Descriptions:** HTML tags stripped, max 500 chars

### ⚠️ LOW — CSV export has formula injection protection
`webhooks.rs` properly escapes CSV cells to prevent formula injection (`=`, `+`, `-`, `@`, `\t`, `\r` prefixes are escaped with `'`).

### ⚠️ MEDIUM — Team invite email validation is weak
```rust
if !req.email.contains('@') {
    return Err(AppError::BadRequest("Invalid email".into()));
}
```
Same weak check used across auth, teams, and other routes.

---

## 4. Error Handling

### ✅ PASS — Errors don't leak internals

`error.rs` maps errors to appropriate HTTP status codes:
- `Internal` → 500 with generic message (no stack trace)
- `Database` → 500 with generic message
- `Serialization` → 400 with error details (acceptable)
- `NotFound` → 404
- `Unauthorized` → 401
- `Forbidden` → 403

### ✅ PASS — Proper error propagation

All route handlers use `Result<T, AppError>` with `?` operator. Database errors are converted via `#[from] sqlx::Error`.

### ⚠️ LOW — Some errors silently swallowed

**`webhooks.rs` — idempotency key storage:**
```rust
if let Err(e) = idempotency::store_idempotency(...).await {
    tracing::warn!("Failed to store idempotency key: {:?}", e);
}
```
Non-critical, but worth noting.

**`main.rs` — background job errors:**
```rust
if let Err(e) = jobs::retention::run_retention(&retention_pool, retention_days).await {
    tracing::error!("❌ Retention job failed: {:?}", e);
}
```
Correctly logged but not retried.

### ✅ PASS — Batch webhook error handling
`batch_webhooks` properly handles partial failures, returning both successful deliveries and errors with indices.

---

## 5. Race Conditions

### ⚠️ HIGH — Auth cache race condition

The `AUTH_CACHE` uses `std::sync::Mutex<AuthCache>` and is accessed in async middleware. If two requests arrive simultaneously for the same API key prefix:
1. Both miss the cache
2. Both acquire the mutex (sequentially)
3. Both query the DB
4. Both insert into cache

This is functionally correct (last-write-wins with identical data) but causes unnecessary DB queries under load.

### ✅ PASS — Atomic webhook count increment

```rust
let updated: Option<Customer> = sqlx::query_as(
    "UPDATE customers SET webhook_count = webhook_count + 1 WHERE id = $1 AND webhook_count < $2 RETURNING *",
)
```
This is an atomic check-and-increment, preventing race conditions on webhook limits.

### ✅ PASS — Idempotency key insertion

Uses `ON CONFLICT (key) DO NOTHING` — safe for concurrent requests.

### ⚠️ MEDIUM — Batch webhook count rollback

```rust
let excess = batch_count - created_count;
if excess > 0 {
    let _ = sqlx::query(
        "UPDATE customers SET webhook_count = GREATEST(0, webhook_count - $1) WHERE id = $2"
    )
```
The `let _ =` discards the result. If this fails, the customer's webhook count will be permanently inflated. Should at least log the error.

### ⚠️ LOW — Password reset token race

If a user requests multiple password resets simultaneously, multiple tokens could be valid. The `reset_password` handler marks the token as used atomically, so only one can succeed.

---

## 6. Memory Leaks

### ⚠️ MEDIUM — Auth cache has no size limit

```rust
struct AuthCache {
    entries: HashMap<String, (Customer, Instant)>,
}

fn cleanup(&mut self) {
    self.entries.retain(|_, (_, expiry)| Instant::now() < *expiry);
}
```

The `cleanup()` method exists but is **never called**. The cache only grows until the process restarts. With 30-second TTL, entries should be cleaned up periodically.

**Recommendation:** Add a periodic cleanup task or use `moka` cache with automatic eviction.

### ✅ PASS — Rate limiter has cleanup

`InMemoryRateLimiter` spawns a background cleanup task every 30 seconds that evicts expired entries and caps at 10,000 entries.

### ✅ PASS — Background jobs are bounded

Retention, cleanup, and count reset jobs run on fixed intervals with bounded queries.

### ⚠️ LOW — Webhook queue grows unbounded between cleanups

The `seen_webhooks` and `idempotency_keys` tables are cleaned every 6 hours. Under high load, these could grow significantly.

---

## 7. API Consistency

### ✅ PASS — Consistent patterns across all routes

All route files follow the same structure:
1. `pub fn router() -> Router` — route registration
2. Request/response structs with `Deserialize`/`Serialize`
3. Handler functions with `Extension<Pool>`, `Extension<Customer>`, etc.
4. `AppError` return type
5. `#[cfg(test)] mod tests` with construction and serialization tests

### ✅ PASS — Consistent pagination

All paginated endpoints use the same pattern:
```rust
let page = params.page.unwrap_or(1).max(1);
let per_page = params.per_page.unwrap_or(20).min(100);
let offset = (page - 1) * per_page;
```

### ⚠️ LOW — Inconsistent error messages

Some endpoints return detailed error messages (e.g., "Endpoint limit reached (3/5)") while others return generic ones. This is acceptable for UX but could leak plan details.

### ✅ PASS — Consistent ownership checks

All protected endpoints verify `customer_id` matches:
```rust
sqlx::query_as::<_, Endpoint>("SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2")
```

---

## 8. Missing Features / TODOs

### ⚠️ No TODO/FIXME comments found

The codebase has no `TODO`, `FIXME`, `HACK`, or `XXX` comments, which is either very disciplined or suggests they were cleaned up.

### ⚠️ MEDIUM — Alert test endpoint is a no-op

```rust
async fn test_alert(...) -> Result<Json<serde_json::Value>, AppError> {
    let _alert = sqlx::query_as(...).fetch_optional(...).await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Test alert sent. Check your notification channels."
    })))
}
```
The endpoint claims to send a test alert but doesn't actually send anything.

### ⚠️ LOW — Export data references wrong column

In `auth.rs` `export_data`:
```rust
"SELECT id, endpoint_id, event, status, attempt_count, ... FROM deliveries"
```
The column is `event_type`, not `event`. This will fail at runtime.

### ⚠️ LOW — Delete account may miss some tables

The GDPR delete function doesn't clean up:
- `team_members` / `team_invites` (teams the user belongs to)
- `ai_agent_configs`
- `notification_preferences`
- `alert_rules`
- `inbound_configs`
- `transform_rules`
- `event_schemas`
- `fifo_queue`

---

## 9. Performance

### ⚠️ MEDIUM — N+1 query in `list_teams`

```rust
for team in teams {
    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM team_members WHERE team_id = $1")
        .bind(team.id)
        .fetch_one(&pool)
        .await?;
    result.push(TeamResponse { ... member_count: count.0, ... });
}
```
Each team triggers a separate COUNT query. Should use a JOIN or subquery.

### ⚠️ MEDIUM — N+1 in admin `get_user_detail`

```rust
let total_deliveries: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM deliveries WHERE customer_id = $1")...
let successful: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = 'delivered'")...
let endpoints_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM endpoints WHERE customer_id = $1")...
```
Three separate queries that could be combined into one.

### ⚠️ MEDIUM — Auth cache DB query under mutex

As noted in race conditions, the auth middleware queries the DB while holding a `Mutex`, blocking all other auth checks.

### ✅ PASS — Batch webhook optimization

`batch_webhooks` fetches all endpoints in a single query:
```rust
let endpoints: Vec<Endpoint> = sqlx::query_as::<_, Endpoint>(
    "SELECT * FROM endpoints WHERE id = ANY($1) AND customer_id = $2 AND is_active = true",
)
.bind(&endpoint_ids)
```
Good use of `ANY` to avoid N+1.

### ⚠️ LOW — Export query fetches 10,000 rows

```rust
"SELECT ... FROM deliveries d JOIN endpoints e ... WHERE d.customer_id = $1 ORDER BY d.created_at DESC LIMIT 10000"
```
Filters are applied in Rust after fetching, not in SQL. Should push `status`, `date_from`, `date_to` into the query.

### ✅ PASS — Database connection pool

`db.rs` uses `PgPoolOptions::new().max_connections(20)` — reasonable for a single-instance deployment.

---

## 10. Dead Code

### ✅ PASS — Minimal dead code

The `lib.rs` exports all modules and they appear to be used. No obviously unused functions found.

### ⚠️ LOW — `SEEN_WEBHOOKS_MIGRATION` constant

```rust
pub const SEEN_WEBHOOKS_MIGRATION: &str = r#"..."#;
```
This migration SQL is defined as a constant but the actual migration is run in `db.rs`. The constant appears unused.

### ⚠️ LOW — `INBOUND_MIGRATION_SQL` constant

Same issue — defined in `inbound.rs` but migration runs in `db.rs`.

### ⚠️ LOW — Duplicate `parse_date_from_str` / `parse_date_to_str`

These functions are defined identically in both `routes/webhooks.rs` and `routes/search.rs`. Should be extracted to a shared utility module.

---

## Additional Security Findings

### ⚠️ HIGH — Stripe webhook verifies against empty key when secret not configured

**File:** `routes/billing.rs` — `handle_stripe_webhook`

```rust
// routes/billing.rs
let webhook_secret = cfg.stripe_webhook_secret.as_deref().unwrap_or("");
if webhook_secret.is_empty() {
    tracing::warn!("Stripe webhook secret not configured, skipping verification");
}
stripe::handle_webhook_event(&pool, &body, signature, webhook_secret, ...).await?;
```

The code warns but still calls `handle_webhook_event` with an empty secret. Inside `billing/stripe.rs`, `verify_webhook_signature` will base64-decode the empty string to an empty byte vec, creating an HMAC with a known zero-length key. An attacker can compute the expected signature and send fake Stripe events to upgrade/downgrade any customer's plan.

**Fix:** Return an error when the webhook secret is not configured instead of continuing.

### ⚠️ MEDIUM — TOTP secret stored in plaintext

```rust
sqlx::query("UPDATE customers SET totp_secret = $1, updated_at = NOW() WHERE id = $2")
    .bind(&secret)
```
TOTP secrets are stored as plaintext in the database. If the DB is compromised, all 2FA is bypassed. Should be encrypted at rest.

### ⚠️ MEDIUM — OAuth state cookie not HttpOnly in all paths

The OAuth state cookie is set with `HttpOnly; Secure; SameSite=None` which is correct, but the state verification reads from the cookie header manually rather than using a proper cookie jar, which could miss edge cases.

### ⚠️ LOW — JWT secret validation only in production

```rust
if env == "production" || env == "prod" {
    validate_secret(&hmac_secret, "HMAC_SECRET")?;
    validate_secret(&jwt_secret, "JWT_SECRET")?;
}
```
Short/placeholder secrets are allowed in development. While reasonable, staging environments might not be caught.

### ✅ PASS — CORS configuration

CORS is properly configured with explicit origin allowlists. Production defaults to dashboard origins. Development allows localhost.

### ✅ PASS — Graceful shutdown

The server handles SIGINT and SIGTERM, flushes OpenTelemetry traces, and shuts down gracefully.

### ✅ PASS — Password hashing

Uses Argon2id (via `argon2` crate) for both password hashing and API key hashing. This is the industry standard.

---

## Summary of Findings by Severity

| Severity | Count | Key Issues |
|----------|-------|------------|
| **HIGH** | 3 | Auth cache race/deadlock, Stripe webhook bypass, Auth cache under mutex |
| **MEDIUM** | 8 | TOTP plaintext, weak email validation, N+1 queries, batch count rollback, auth cache no cleanup, test alert no-op, wrong column in export, GDPR delete incomplete |
| **LOW** | 8 | Duplicate date parsers, unused migration constants, silent error swallowing, export LIMIT 10000, JWT dev validation |

## Recommendations (Priority Order)

1. **Replace `std::sync::Mutex` with `tokio::sync::RwLock` for auth cache** — Prevents deadlocks in async context
2. **Add periodic cleanup for auth cache** — Or switch to `moka` crate
3. **Refuse to process Stripe webhooks when secret not configured** — Return 503
4. **Fix `handle_inbound_to_endpoint` to use Argon2 verification** — Match `handle_inbound` pattern
5. **Encrypt TOTP secrets at rest** — Use the existing `crypto::encrypt` function
6. **Fix `export_data` column name** — `event` → `event_type`
7. **Implement actual test alert sending** — Or remove the misleading response
8. **Use proper email validation** — Consider the `email_address` crate
9. **Fix N+1 queries** — `list_teams`, `get_user_detail`
10. **Push export filters into SQL** — Don't fetch 10K rows and filter in Rust
11. **Complete GDPR delete** — Add missing tables
12. **Extract duplicate date parsing** — Create shared utility module
13. **Log batch count rollback errors** — Don't silently discard
