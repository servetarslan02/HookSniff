# Deep Code Review: HookSniff Worker

**Reviewer:** Deep Worker Subagent  
**Date:** 2026-05-10  
**Scope:** All files in `worker/src/`  
**Severity Scale:** 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low · ⚪ Info

---

## Executive Summary

The worker is a PostgreSQL-polling webhook delivery engine using `LISTEN/NOTIFY` for low-latency wake-up with 1-second fallback polling. The architecture is **simple and mostly sound** — good use of `FOR UPDATE SKIP LOCKED`, transactions for state updates, and structured tracing. However, there are **several critical reliability gaps** that can cause webhook loss, and a few correctness bugs.

**Critical findings: 3 | High: 5 | Medium: 7 | Low: 4**

---

## File-by-File Analysis

### 1. `main.rs` — Worker Entry Point & Job Processing Loop

#### 🔴 CRITICAL: No Concurrency Limit on Deliveries

```rust
for item in items {
    let handle = tokio::spawn(async move { ... });
    handles.push(handle);
}
```

All 50 items (batch size) are spawned simultaneously with **no semaphore or concurrency cap**. With multiple workers or bursty traffic, this can:
- Overwhelm downstream webhook endpoints
- Exhaust the DB connection pool (each spawned task may acquire a connection)
- Cause OOM under extreme load

**Fix:** Add a `tokio::sync::Semaphore` (e.g., 10-20 concurrent deliveries per worker).

#### 🔴 CRITICAL: Zombie Reaper Increments Attempt Count Without Delivery

```rust
// In reap_zombies:
sqlx::query(
    "UPDATE webhook_queue SET status = 'pending', attempt_count = attempt_count + 1 WHERE id = $1"
)
```

When a zombie is recovered, `attempt_count` is incremented **without actually attempting delivery**. This means:
- A delivery that was stuck at attempt 2/5 gets re-queued as attempt 3/5
- The zombie reaper can consume attempts, causing premature dead-lettering
- The same logic applies to the `dead_letter` path: `attempt_count + 1` without delivery

**Fix:** Don't increment `attempt_count` in the reaper — just reset to `pending`. The actual delivery loop will increment it properly.

#### 🔴 CRITICAL: No Idempotency — Webhooks Can Be Duplicated

The `FOR UPDATE SKIP LOCKED` pattern prevents concurrent duplicate processing across workers, but there's **no idempotency at the delivery level**:

1. Worker fetches item, sets status to `processing`
2. Worker delivers HTTP webhook successfully
3. Worker crashes before committing the DB transaction
4. Zombie reaper resets the item to `pending`
5. Worker re-delivers the same webhook

The receiving endpoint gets the webhook twice. There's no `delivery_id`-based deduplication on the HTTP call itself.

**Fix:** Acceptable for at-least-once delivery, but document this clearly. For exactly-once, the receiving endpoint must implement idempotency using `webhook-id` header.

#### 🟠 HIGH: No Retry for DB Commit Failures

```rust
tx.commit().await?;
```

If the commit fails (e.g., connection pool exhausted, network blip), the entire delivery result is lost. The HTTP call succeeded, but the DB doesn't know. The zombie reaper will eventually recover it, but there's a 5-minute gap of uncertainty.

**Fix:** Add retry logic for DB commits (at least 2-3 retries with backoff).

#### 🟠 HIGH: `avg_response_ms` Overwritten, Not Averaged

```rust
sqlx::query(
    "UPDATE endpoints SET failure_streak = 0, avg_response_ms = $2 WHERE id = $1"
)
.bind(item.endpoint_id)
.bind(duration_ms)
```

This sets `avg_response_ms` to the **latest** duration, not a running average. Historical response time data is lost on every success.

**Fix:** Use an exponential moving average: `avg_response_ms = avg_response_ms * 0.8 + $2 * 0.2`.

#### 🟡 MEDIUM: No Backoff Jitter

```rust
fn calculate_backoff(attempt: i32) -> i64 {
    let base = 30_i64;
    let delay = base * 2_i64.pow((attempt - 1).max(0) as u32);
    delay.min(1800)
}
```

Pure exponential backoff without jitter. When multiple deliveries fail simultaneously (e.g., endpoint down), they all retry at the same time, causing **thundering herd**.

**Fix:** Add jitter: `delay + rand(0, delay/4)`.

#### 🟡 MEDIUM: Zombie Reaper Runs Without Transaction

The zombie reaper performs multiple queries (find stuck → update queue → insert dead_letter → update delivery) without a transaction. If the process crashes mid-reaper, records can be left in inconsistent states.

**Fix:** Wrap each zombie's recovery in a transaction.

#### 🟡 MEDIUM: Orphaned Delivery Reaper Has N+1 Query Pattern

```rust
for (delivery_id,) in &orphaned {
    let delivery = sqlx::query_as("SELECT ... FROM deliveries WHERE id = $1")
        .bind(delivery_id)
        .fetch_optional(pool)
        .await?;
    // ...
    let endpoint_url = sqlx::query_as("SELECT url FROM endpoints WHERE id = $1")
        .bind(endpoint_id)
        .fetch_optional(pool)
        .await?;
}
```

Each orphaned delivery triggers 2 additional queries. With many orphans, this is slow.

**Fix:** Batch-fetch deliveries and endpoint URLs with `WHERE id = ANY($1)`.

#### 🟡 MEDIUM: `process_pending` Returns Fetched Count, Not Processed Count

```rust
let count = items.len();
// ... spawn tasks ...
Ok(count)
```

The function returns the count of **fetched** items, not successfully processed ones. A task panic is logged but the count still includes it.

#### ⚪ INFO: Health Server Error Handling

The health server fails silently on bind error (returns without crashing the worker). This is intentional for Cloud Run but means the worker could run without health checks if port 8080 is in use.

---

### 2. `config.rs` — Worker Configuration

#### 🟡 MEDIUM: Hardcoded Default Credentials

```rust
database_url: std::env::var("DATABASE_URL")
    .unwrap_or_else(|_| {
        "postgresql://hooksniff:hooksniff_local@localhost:5432/hooksniff?sslmode=disable".into()
    }),
```

Default database URL contains credentials. If `DATABASE_URL` is accidentally unset in production, the worker connects with development credentials.

**Fix:** `panic!` or `return Err` if `DATABASE_URL` is not set in production environments.

#### 🔵 LOW: No Config Validation

No validation that `database_url` is a valid URL, or that OTel endpoints are reachable. Failures happen at runtime.

---

### 3. `delivery/mod.rs` — Delivery Router

#### 🟠 HIGH: Email Delivery Uses Blocking I/O in Async Context

```rust
let sa_json = match std::fs::read_to_string(&sa_path) {
```

`std::fs::read_to_string` is a **blocking call** inside an async function. This blocks the tokio runtime thread, potentially starving other tasks.

**Fix:** Use `tokio::fs::read_to_string` or `tokio::task::spawn_blocking`.

#### 🟠 HIGH: Email Delivery Creates New HTTP Client Per Call

```rust
let http_client = reqwest::Client::new();
```

A new `reqwest::Client` is created for every email delivery. This means:
- New TLS session for each call (no connection reuse)
- No connection pooling
- TLS handshake overhead on every request

**Fix:** Pass the shared `http_client` from the caller, or create a static/shared client.

#### 🟡 MEDIUM: Service Account File Read on Every Delivery

The Gmail service account JSON file is read from disk on every email delivery attempt. This is wasteful and introduces a file I/O dependency on every call.

**Fix:** Cache the parsed service account key at startup or on first use.

#### 🟡 MEDIUM: Fan-out Bug — Target Config Not Used

In `FanoutEngine::deliver_to_target`:
```rust
let (target_type, config) = match target { ... };
// ^ loaded but never used!

let results = self.delivery_router.deliver(webhook).await?;
// ^ uses default routing, ignores target_type and config
```

The target-specific configuration (`target_type`, `config`) is loaded from the database but **never passed** to the delivery router. All targets get the same default HTTP delivery.

**Fix:** Pass `target_type` and `config` to the delivery router, or use them to select the correct delivery method.

#### 🟡 MEDIUM: Dead Letter Customer ID is `Uuid::nil()`

```rust
.bind(Uuid::nil()) // customer_id from webhook context
```

Fan-out dead letters are inserted with a nil customer ID, making them untraceable to the originating customer.

**Fix:** Pass `customer_id` through the webhook context or fan-out rule.

---

### 4. `delivery/http.rs` — HTTP Webhook Delivery

#### 🟠 HIGH: No Response Body Size Limit on Receive

```rust
let body = response.text().await.unwrap_or_default();
```

The entire response body is read into memory. A malicious or buggy endpoint could return a multi-GB response, causing OOM.

**Fix:** Use `response.bytes().await` with a size limit (e.g., 1MB), or use `tokio::io::AsyncRead` with a limit.

#### 🟡 MEDIUM: `unwrap_or_default()` Swallows Errors

If `response.text()` fails (e.g., non-UTF8 response), the error is silently swallowed and the body is empty. This loses diagnostic information.

**Fix:** Log the error and store a placeholder like `"[non-UTF8 response, {} bytes]"`.

#### 🔵 LOW: Custom Headers Don't Validate Header Names

```rust
for (key, value) in obj {
    if let Some(val) = value.as_str() {
        req_builder = req_builder.header(key.as_str(), val);
    }
}
```

No validation that `key` is a valid HTTP header name. Malicious custom headers could inject headers like `Host` or `Authorization`.

**Fix:** Validate header names against a whitelist or reject known-sensitive headers.

---

### 5. `signing.rs` — HMAC-SHA256 Signature Generation

#### ⚪ INFO: Signing Implementation is Correct

The HMAC-SHA256 implementation follows the Standard Webhooks spec correctly:
- Signed payload: `{msg_id}.{timestamp}.{body}`
- `whsec_` prefix handling
- Base64 encoding for Standard Webhooks format
- Hex encoding for legacy format
- Key can be any size (HMAC handles this)

#### ⚪ INFO: Timing-Safe Comparison in Tests

The test code uses `hmac::digest::CtOutput` comparison for timing-safe verification. This is correct for the verification side (which would be done by the receiving endpoint, not this worker).

#### 🔵 LOW: Secret Decoding Fallback

```rust
fn decode_secret(secret: &str) -> Vec<u8> {
    let stripped = secret.strip_prefix("whsec_").unwrap_or(secret);
    BASE64.decode(stripped).unwrap_or_else(|_| secret.as_bytes().to_vec())
}
```

If the secret is neither valid base64 nor has the `whsec_` prefix, it falls back to raw bytes. This is good for backward compat but means malformed secrets silently "work" with incorrect signing.

---

### 6. `telemetry.rs` — Metrics & Observability

#### 🟡 MEDIUM: Synchronous Span Exporter

```rust
let provider = TracerProvider::builder()
    .with_simple_exporter(exporter)
    .build();
```

`with_simple_exporter` exports spans **synchronously** on every span completion. This blocks the delivery task while traces are sent to the OTLP collector.

**Fix:** Use `BatchSpanProcessor` for async, batched export.

#### 🔵 LOW: No Metrics Endpoint

There's no Prometheus/metrics endpoint for monitoring delivery rates, latencies, error rates, etc. The only observability is through OTel traces and logs.

---

### 7. `fanout.rs` — Event Fan-Out Engine

#### 🟠 HIGH: Fan-Out Conditions Evaluate Against Raw String

```rust
fn evaluate_conditions(conditions: &Value, payload: &str) -> Result<bool> {
    let payload_value: Value = serde_json::from_str(payload)?;
```

The payload is parsed from string on every condition evaluation. If the same payload is evaluated against multiple rules, it's parsed repeatedly.

**Fix:** Parse once and pass the `Value` reference.

#### 🟡 MEDIUM: Pattern Matching Edge Cases

The glob implementation has issues:
- `*.*` matches `order.created` but also `a.b.c.d` (greedy)
- `*` alone matches everything (correct)
- Empty pattern parts (`**`) are skipped, which could cause unexpected matches
- No escaping for literal `*` in patterns

#### ⚪ INFO: Condition Operators Are Limited

Only supports: `equals`, `not_equals`, `gt`, `lt`, `contains`, `exists`. No regex, no compound conditions (AND/OR), no array operations.

---

### 8. `activities/mod.rs` — Activity Definitions

#### ⚪ INFO: Mostly Unused

The activity types are defined but the main processing loop in `main.rs` doesn't use them. They appear to be leftovers from the Temporal migration. The `record_delivery_attempt` function here lacks `trace_id` and `response_headers` fields that the main.rs version includes.

#### ⚪ INFO: `trigger_agents` is a No-Op

AI agent triggering is stubbed out. This is fine for MVP.

---

### 9. `workflows/mod.rs` — Placeholder

Empty module. No issues.

---

## Cross-Cutting Concerns

### Delivery Reliability Matrix

| Scenario | Behavior | Risk |
|---|---|---|
| Worker crashes during HTTP call | Zombie reaper recovers after 5min | 🟡 5-min delay, attempt count inflated |
| Worker crashes after HTTP, before DB commit | Zombie reaper re-delivers (duplicate) | 🟠 Duplicate delivery |
| DB connection lost | `process_pending` returns error, logged | 🟡 Delivery delayed until reconnect |
| Endpoint returns 500 | Retry with exponential backoff | ✅ Correct |
| Endpoint times out (30s) | Retry with exponential backoff | ✅ Correct |
| Endpoint unreachable | Retry with exponential backoff | ✅ Correct |
| Max attempts exceeded | Dead letter + delivery marked failed | ✅ Correct |
| Multiple workers running | `FOR UPDATE SKIP LOCKED` prevents duplicates | ✅ Correct |
| NOTIFY missed | 1s fallback poll catches it | ✅ Correct |
| PgListener disconnects | Auto-reconnect with 1s backoff | ✅ Correct |

### Missing Components (from task checklist)

| Component | Status |
|---|---|
| Circuit breaker | ❌ **Not implemented** — `circuit_breaker.rs` doesn't exist |
| Dead letter queue | ✅ Implemented (DB table) |
| Metrics collection | ❌ `metrics.rs` doesn't exist |
| Transform/routing | ❌ `transform.rs`, `routing.rs` don't exist |
| DB access layer | ❌ `db.rs` doesn't exist (inline SQL in main.rs) |

### Concurrency Model

```
Main Loop (1 task)
  ├── process_pending() — fetches up to 50 items
  │     └── tokio::spawn() × N — concurrent HTTP deliveries (NO LIMIT)
  ├── reap_zombies() — every 30s
  └── reap_orphaned_deliveries() — every 30s
```

**Problem:** No bounded concurrency. A burst of 500 queued webhooks spawns 500 concurrent HTTP calls (across 10 poll cycles), potentially overwhelming endpoints and the DB pool.

### Memory Profile

- **Bounded:** Batch size capped at 50 items per poll cycle
- **Unbounded:** Response bodies from endpoints (no size limit)
- **Bounded:** `handles` vector capped at 50 per cycle
- **Risk:** If an endpoint returns a massive response, it's held in memory until the delivery task completes

---

## Prioritized Recommendations

### 🔴 Must Fix (Before Production)

1. **Add concurrency limit** — Use `tokio::sync::Semaphore` with 10-20 concurrent deliveries per worker
2. **Don't inflate attempt count in zombie reaper** — Reset to `pending` without incrementing
3. **Document at-least-once semantics** — Webhooks can be duplicated; receivers must use `webhook-id` for dedup

### 🟠 Should Fix (Soon)

4. **Wrap zombie recovery in transactions** — Prevent inconsistent state on crash
5. **Add retry for DB commits** — At least 2 retries with backoff
6. **Fix email delivery blocking I/O** — Use `tokio::fs` or `spawn_blocking`
7. **Reuse HTTP client for email** — Don't create new client per call
8. **Limit response body size** — Cap at 1MB to prevent OOM
9. **Fix fan-out target config bug** — Pass target_type and config to delivery router

### 🟡 Nice to Have

10. **Add backoff jitter** — Prevent thundering herd on retries
11. **Fix `avg_response_ms`** — Use exponential moving average
12. **Use `BatchSpanProcessor`** — Don't block on trace export
13. **Cache service account key** — Don't read file on every email delivery
14. **Batch orphaned delivery queries** — Eliminate N+1 pattern
15. **Validate custom header names** — Prevent header injection

---

## Test Coverage Assessment

**Unit tests exist for:**
- ✅ Signing (HMAC computation, verification, rotation, secret decoding)
- ✅ Fan-out conditions (gt, nested fields)
- ✅ Fan-out pattern matching (glob)

**Missing tests for:**
- ❌ `process_pending` (integration test with DB)
- ❌ `calculate_backoff` (boundary values)
- ❌ `reap_zombies` (various states)
- ❌ `reap_orphaned_deliveries`
- ❌ `deliver_http` (mock HTTP)
- ❌ `truncate_str` (edge cases: empty, exact boundary, multi-byte chars)
- ❌ `DeliveryRouter::deliver` (with/without targets)
- ❌ Email delivery flow
- ❌ Error recovery scenarios

---

## Summary

The worker's architecture is **pragmatic and simple** — PostgreSQL polling with `LISTEN/NOTIFY` is a reasonable choice that avoids Kafka/Redis complexity. The use of `FOR UPDATE SKIP LOCKED` is correct for multi-worker concurrency. The signing implementation follows the Standard Webhooks spec properly.

The main risks are around **delivery reliability under failure conditions**: no concurrency limits, attempt count inflation in the zombie reaper, and duplicate delivery on crash recovery. These are fixable with relatively small changes. The missing circuit breaker and metrics are notable gaps for a production webhook delivery system.

**Overall: Good foundation, needs hardening before production traffic.**
