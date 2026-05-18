# HookSniff — Deep Database Query Performance Audit

**Date:** 2026-05-10  
**Scope:** All SQL queries in `api/src/routes/`, `api/src/models/`, `worker/src/`, `api/src/db.rs`, `migrations/`  
**Database:** PostgreSQL (via sqlx)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Connection Pool Analysis](#2-connection-pool-analysis)
3. [Index Coverage Audit](#3-index-coverage-audit)
4. [Query-by-Query Analysis](#4-query-by-query-analysis)
5. [N+1 Query Detection](#5-n1-query-detection)
6. [Pagination Audit](#6-pagination-audit)
7. [Large Table Strategy](#7-large-table-strategy)
8. [Critical Issues & Recommendations](#8-critical-issues--recommendations)
9. [EXPLAIN ANALYZE Suggestions](#9-explain-analyze-suggestions)

---

## 1. Executive Summary

| Severity | Count | Category |
|----------|-------|----------|
| 🔴 Critical | 4 | Missing indexes on hot paths, unbounded queries |
| 🟠 High | 6 | SELECT *, N+1 patterns, OFFSET pagination |
| 🟡 Medium | 8 | Suboptimal queries, missing composite indexes |
| 🔵 Low | 5 | Minor optimizations, unused columns |

**Top 3 Risks:**
1. **`deliveries` table has no index on `(customer_id, created_at DESC)`** — every paginated delivery list query does a sequential scan
2. **`SELECT *` used extensively** — fetches large JSONB `payload` column unnecessarily on list endpoints
3. **OFFSET-based pagination** on the largest table — degrades linearly with offset size

---

## 2. Connection Pool Analysis

### API Pool (`api/src/db.rs`)
```rust
PgPoolOptions::new()
    .max_connections(20)
```

### Worker Pool (`worker/src/main.rs`)
```rust
PgPoolOptions::new()
    .max_connections(10)
```

### Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| Pool size (API) | ✅ Adequate | 20 connections is reasonable for API workload |
| Pool size (Worker) | ✅ Adequate | 10 connections, worker uses concurrent tasks |
| Connection leak detection | ⚠️ Missing | No `min_connections`, `acquire_timeout`, or `idle_timeout` configured |
| Connection lifecycle | ⚠️ Missing | No `max_lifetime` — long-running processes may hold stale connections |

### Recommendations

```rust
PgPoolOptions::new()
    .max_connections(20)
    .min_connections(2)           // Keep warm connections
    .acquire_timeout(Duration::from_secs(5))  // Fail fast instead of queueing
    .idle_timeout(Duration::from_secs(300))   // Return idle connections
    .max_lifetime(Duration::from_secs(1800))  // Recycle connections every 30min
```

---

## 3. Index Coverage Audit

### 3.1 Existing Indexes (from migrations)

| Table | Index | Type | Source |
|-------|-------|------|--------|
| `customers` | `email` (UNIQUE) | B-tree | 001 |
| `customers` | `api_key_prefix` | B-tree | implicit (used in queries) |
| `customers` | `stripe_customer_id` | — | ❌ **Missing** |
| `customers` | `polar_customer_id` | Partial | 009 |
| `customers` | `iyzico_customer_id` | Partial | 009 |
| `customers` | `payment_provider` | B-tree | 009 |
| `endpoints` | `customer_id` | B-tree | 001 |
| `endpoints` | `failure_streak` (partial) | B-tree | 006 |
| `deliveries` | `status` | B-tree | 001 |
| `deliveries` | `customer_id` | B-tree | 001 |
| `deliveries` | `next_retry_at` (partial, status='pending') | B-tree | 001 |
| `deliveries` | `endpoint_id, sequence_num` (partial) | B-tree | 007 |
| `deliveries` | `is_test` (partial) | B-tree | 035 |
| `delivery_attempts` | `delivery_id` | B-tree | 001 |
| `webhook_queue` | `(status, next_retry_at)` (partial) | B-tree | 009 |
| `webhook_queue` | `delivery_id` | B-tree | 009 |
| `webhook_queue` | `trace_id` (partial) | B-tree | 012 |
| `webhook_queue` | `(status, updated_at)` | B-tree | 010 |
| `dead_letters` | — | — | ❌ **No indexes** |
| `idempotency_keys` | `expires_at` | B-tree | 001 |
| `idempotency_keys` | `(key, customer_id, body_hash)` | B-tree | 034 |
| `seen_webhooks` | `expires_at` | B-tree | 011 |
| `api_keys` | `customer_id` | B-tree | 015 |
| `api_keys` | `api_key_hash` | B-tree | 015 |
| `alert_rules` | `customer_id` | B-tree | 016 |
| `notifications` | `(customer_id, created_at DESC)` | B-tree | 033 |
| `notifications` | `(customer_id, is_read)` (partial) | B-tree | 033 |
| `invoices` | `customer_id` | B-tree | 028 |
| `payment_transactions` | `customer_id` | B-tree | 029 |
| `payment_transactions` | `(provider, provider_tx_id)` | B-tree | 029 |
| `teams` | `owner_id` | B-tree | 032 |
| `team_members` | `team_id` | B-tree | 032 |
| `team_members` | `customer_id` | B-tree | 032 |
| `team_invites` | `team_id` | B-tree | 032 |
| `team_invites` | `token` (UNIQUE) | B-tree | 032 |
| `audit_log` | — | — | ❌ **No indexes** |
| `sso_configs` | — | — | ❌ **No indexes** |
| `custom_domains` | — | — | ❌ **No indexes** |
| `portal_configs` | — | — | ❌ **No indexes** |
| `rate_limit_configs` | — | — | ❌ **No indexes** |
| `fifo_queue` | `(endpoint_id, sequence_num)` | B-tree | 020 |
| `fifo_queue` | `status` (partial) | B-tree | 020 |
| `delivery_targets` | `endpoint_id` | B-tree | 021 |
| `fanout_rules` | `customer_id` | B-tree | 021 |
| `retry_policies` | `endpoint_id` | B-tree | 012 |
| `transform_rules` | `endpoint_id` | B-tree | 013 |
| `event_schemas` | `(customer_id, name)` | B-tree | 014 |
| `ai_events` | `created_at DESC` | B-tree | 017 |
| `risk_scores` | `(target_id, created_at DESC)` | B-tree | 017 |
| `ai_actions` | `status` | B-tree | 017 |
| `ai_blocklist` | `expires_at` (partial) | B-tree | 017 |
| `ai_agent_executions` | `agent_id` | B-tree | 018 |
| `ai_agent_executions` | `customer_id` | B-tree | 018 |
| `installed_agents` | `customer_id` | B-tree | 019 |
| `device_tokens` | `customer_id` | B-tree | 042 |
| `device_tokens` | `token` | B-tree | 042 |
| `password_reset_tokens` | `token_hash` | B-tree | 039 |
| `password_reset_tokens` | `customer_id` | B-tree | 039 |
| `email_verification_tokens` | `token_hash` | B-tree | 040 |
| `email_verification_tokens` | `customer_id` | B-tree | 040 |
| `refresh_tokens` | `token_hash` | B-tree | 041 |
| `refresh_tokens` | `customer_id` | B-tree | 041 |
| `inbound_configs` | `customer_id` | B-tree | 036 |
| `notification_preferences` | `customer_id` | B-tree | 037 |

### 3.2 🔴 Critical Missing Indexes

#### 3.2.1 `deliveries(customer_id, created_at DESC)` — **CRITICAL**
**Impact:** Every delivery listing, search, analytics, and export query filters by `customer_id` and orders by `created_at DESC`. Without a composite index, PostgreSQL does:
1. Index scan on `idx_deliveries_customer` → gets all deliveries for customer
2. Sort all results by `created_at DESC`

For customers with 100k+ deliveries, this is extremely slow.

**Queries affected:**
- `api/src/routes/webhooks.rs:61` — `SELECT * FROM deliveries WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`
- `api/src/routes/webhooks.rs:81` — same pattern
- `api/src/routes/events.rs:83` — `SELECT * FROM deliveries WHERE customer_id = $1 ORDER BY created_at DESC`
- `api/src/routes/analytics.rs:93` — `GROUP BY bucket` on deliveries by customer
- `api/src/routes/stats.rs` — `COUNT(*) FILTER` on deliveries by customer
- `api/src/routes/search.rs` — dynamic WHERE + ORDER BY created_at DESC
- `api/src/routes/admin.rs` — `ORDER BY created_at DESC LIMIT 50`

**Fix:**
```sql
CREATE INDEX CONCURRENTLY idx_deliveries_customer_created
    ON deliveries(customer_id, created_at DESC);
```

#### 3.2.2 `deliveries(endpoint_id, created_at DESC)` — **HIGH**
**Impact:** Health endpoint stats query filters by `endpoint_id` and counts by status.

**Query affected:**
- `api/src/routes/health_endpoints.rs:65` — `SELECT endpoint_id, COUNT(*)... FROM deliveries WHERE endpoint_id = ANY($1) GROUP BY endpoint_id`

**Fix:**
```sql
CREATE INDEX CONCURRENTLY idx_deliveries_endpoint_created
    ON deliveries(endpoint_id, created_at DESC);
```

#### 3.2.3 `dead_letters(customer_id)` — **HIGH**
**Impact:** Dead letters table has zero indexes. Any query filtering by customer or delivery will seq-scan.

**Fix:**
```sql
CREATE INDEX CONCURRENTLY idx_dead_letters_customer
    ON dead_letters(customer_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_dead_letters_delivery
    ON dead_letters(delivery_id);
```

#### 3.2.4 `audit_log(customer_id, created_at DESC)` — **HIGH**
**Impact:** Audit log listing queries filter by `customer_id` with ORDER BY and pagination.

**Query affected:**
- `api/src/routes/audit_log.rs` — `SELECT ... FROM audit_log WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`

**Fix:**
```sql
CREATE INDEX CONCURRENTLY idx_audit_log_customer_created
    ON audit_log(customer_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_audit_log_action
    ON audit_log(customer_id, action) WHERE action IS NOT NULL;
```

### 3.3 🟠 Missing Indexes (Medium Priority)

| Table | Missing Index | Reason |
|-------|--------------|--------|
| `sso_configs` | `(customer_id)` | Looked up by customer_id in SSO routes |
| `custom_domains` | `(customer_id)`, `(domain)` | Looked up by customer_id and domain uniqueness check |
| `portal_configs` | `(customer_id)` | Looked up by customer_id |
| `rate_limit_configs` | `(endpoint_id)` | Looked up by endpoint_id (PK covers this if endpoint_id is PK) |
| `customers` | `(stripe_customer_id)` | Webhook handlers look up by `stripe_customer_id` |
| `customers` | `(stripe_subscription_id)` | Webhook handlers look up by `stripe_subscription_id` |
| `customers` | `(polar_subscription_id)` | Webhook handlers look up by `polar_subscription_id` |
| `customers` | `(iyzico_subscription_id)` | Webhook handlers look up by `iyzico_subscription_id` |
| `delivery_attempts` | `(delivery_id, attempt_number)` | Ordered by attempt_number after filtering by delivery_id |
| `webhook_queue` | `(delivery_id, status)` | Orphaned delivery reaper queries this |

### 3.4 Potentially Unused Indexes

| Index | Concern |
|-------|---------|
| `idx_deliveries_status` | Only used when filtering by status alone (rare — usually combined with customer_id) |
| `idx_deliveries_next_retry` | Partial index on `status = 'pending'` — useful for worker but overlaps with composite `(status, next_retry_at)` on webhook_queue |
| `idx_endpoints_failure_streak` | Partial index — only useful if querying endpoints with failure_streak > 0 directly (worker does this via endpoint updates, not reads) |

---

## 4. Query-by-Query Analysis

### 4.1 🔴 Critical Queries

#### Q1: `SELECT * FROM deliveries WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`
**File:** `api/src/routes/webhooks.rs:81`, `events.rs:83`  
**Problems:**
- `SELECT *` fetches the entire `payload` JSONB column (can be huge) for every row
- No composite index on `(customer_id, created_at DESC)`
- OFFSET pagination is O(offset) — page 100 with 20 per_page reads 2000 rows then discards 1980

**Fix:**
```sql
-- Replace SELECT * with specific columns:
SELECT id, endpoint_id, event_type, status, attempt_count,
       response_status, replay_count, created_at, is_test
FROM deliveries
WHERE customer_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

#### Q2: `SELECT COUNT(*) FROM deliveries WHERE customer_id = $1`
**File:** `api/src/routes/webhooks.rs:90`, `events.rs:110`, `stats.rs`  
**Problems:**
- COUNT(*) on a large table with no covering index requires scanning all matching rows
- Called on every paginated request (doubles the query cost)

**Fix:** Use estimated count for large tables or cache the count:
```sql
-- Fast approximate count using pg_stat
SELECT reltuples::bigint AS estimate
FROM pg_class WHERE relname = 'deliveries';

-- Or use a materialized counter with periodic refresh
```

#### Q3: `SELECT * FROM deliveries WHERE customer_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4`
**File:** `api/src/routes/webhooks.rs:61`  
**Problems:**
- Same as Q1 but with additional status filter
- `idx_deliveries_status` exists but doesn't include `customer_id` or `created_at`

**Fix:**
```sql
CREATE INDEX CONCURRENTLY idx_deliveries_customer_status_created
    ON deliveries(customer_id, status, created_at DESC);
```

#### Q4: `SELECT * FROM endpoints WHERE customer_id = $1`
**File:** `api/src/routes/endpoints.rs:31`, `health_endpoints.rs:52`  
**Problems:**
- `SELECT *` fetches `signing_secret` which should never leave the database for list views
- Returns all columns including large JSONB fields

**Fix:**
```sql
SELECT id, url, description, is_active, routing_strategy,
       fallback_url, avg_response_ms, failure_streak, format,
       created_at
FROM endpoints WHERE customer_id = $1 ORDER BY created_at DESC;
```

### 4.2 🟠 High-Priority Queries

#### Q5: `SELECT * FROM customers WHERE api_key_prefix = $1`
**File:** `api/src/middleware/mod.rs:142`  
**Problems:**
- `SELECT *` on every authenticated request (middleware!)
- Returns `totp_secret`, `password_hash` etc. that aren't needed for auth
- No index on `api_key_prefix` as standalone column

**Fix:**
```sql
-- Create index
CREATE INDEX CONCURRENTLY idx_customers_api_key_prefix
    ON customers(api_key_prefix);

-- Select only needed columns
SELECT id, email, api_key_hash, api_key_prefix, plan,
       webhook_limit, webhook_count, is_active, is_admin,
       totp_enabled, password_hash
FROM customers WHERE api_key_prefix = $1;
```

#### Q6: `SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2`
**File:** Appears 15+ times across `transforms.rs`, `routing.rs`, `endpoints.rs`, `webhooks.rs`  
**Problems:**
- `SELECT *` every time — fetches `signing_secret` unnecessarily in most contexts
- Repeated in loops (see N+1 section)

**Fix:** Create a helper function that selects only needed columns:
```rust
async fn get_endpoint_summary(pool: &PgPool, id: Uuid, customer_id: Uuid) -> Option<Endpoint> {
    sqlx::query_as::<_, Endpoint>(
        "SELECT id, customer_id, url, description, is_active, retry_policy,
                created_at, allowed_ips, event_filter, custom_headers,
                routing_strategy, fallback_url, avg_response_ms, failure_streak,
                last_failure_at, format, fifo_enabled, fifo_sequence,
                fifo_group_by_customer, fifo_max_wait_secs,
                throttle_rate, throttle_period_secs, throttle_strategy
         FROM endpoints WHERE id = $1 AND customer_id = $2"
    )
    .bind(id)
    .bind(customer_id)
    .fetch_optional(pool)
    .await
}
```

#### Q7: `SELECT * FROM delivery_attempts WHERE delivery_id = $1 ORDER BY attempt_number ASC`
**File:** `api/src/routes/webhooks.rs:812`, `delivery_details.rs:86`  
**Problems:**
- `SELECT *` includes `response_body` (TEXT, potentially large) and `response_headers` (JSONB)
- For a delivery with 10 attempts, this could be 100KB+ of response bodies

**Fix:**
```sql
SELECT id, attempt_number, status_code, duration_ms,
       error_message, created_at
FROM delivery_attempts
WHERE delivery_id = $1
ORDER BY attempt_number ASC;
-- Only fetch full response_body/headers on demand (single attempt detail)
```

#### Q8: `SELECT d.*, e.url FROM deliveries d JOIN endpoints e ... WHERE ... ORDER BY d.created_at DESC LIMIT 10000`
**File:** `api/src/routes/webhooks.rs:706` (export endpoint)  
**Problems:**
- Hard-coded `LIMIT 10000` — no streaming, loads all into memory
- `SELECT *` on deliveries (includes payload JSONB)
- For customers with 100k deliveries, this is a massive query

**Fix:** Use cursor-based streaming or `COPY TO`:
```sql
-- Use cursor or stream results
DECLARE export_cursor CURSOR FOR
    SELECT d.id, d.event_type, e.url, d.status,
           d.attempt_count, d.response_status, d.created_at
    FROM deliveries d
    JOIN endpoints e ON d.endpoint_id = e.id
    WHERE d.customer_id = $1
    ORDER BY d.created_at DESC;
```

### 4.3 🟡 Medium-Priority Queries

#### Q9: Analytics queries (time-bucketed aggregations)
**File:** `api/src/routes/analytics.rs:91-211`  
**Problems:**
- `date_trunc('hour', created_at) - (EXTRACT(HOUR FROM created_at)::int % $3) * INTERVAL '1 hour'` — complex expression can't use indexes
- `PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY da.duration_ms)` — expensive aggregation on delivery_attempts
- Two separate queries for latency trend + overall average (could be combined)

**Fix:**
```sql
-- Add expression index for time bucketing
CREATE INDEX CONCURRENTLY idx_deliveries_customer_hourly
    ON deliveries(customer_id, date_trunc('hour', created_at));

-- Combine latency queries into one using CTE
WITH bucketed AS (
    SELECT date_trunc('hour', da.created_at) AS bucket,
           AVG(da.duration_ms) AS avg_ms,
           PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY da.duration_ms) AS p95_ms
    FROM delivery_attempts da
    JOIN deliveries d ON d.id = da.delivery_id
    WHERE d.customer_id = $1
      AND da.created_at >= now() - INTERVAL '1 hour' * $2
      AND da.duration_ms IS NOT NULL
    GROUP BY bucket
)
SELECT bucket, avg_ms, p95_ms FROM bucketed ORDER BY bucket;
-- Overall average is just AVG(avg_ms) from the result set
```

#### Q10: `SELECT * FROM customers WHERE api_key_prefix = $1` (multiple rows)
**File:** `api/src/routes/inbound.rs:251`, `middleware/mod.rs:142`  
**Problems:**
- `api_key_prefix` is only 15 chars — collision probability is non-zero at scale
- Fetches ALL customers with that prefix, then verifies hash in a loop

**Fix:** Add index on `api_key_prefix` and consider using the full hash for lookup:
```sql
CREATE INDEX CONCURRENTLY idx_customers_api_key_prefix
    ON customers(api_key_prefix);
```

#### Q11: Admin revenue_by_month query
**File:** `api/src/routes/admin.rs`  
**Problems:**
- Correlated subquery inside `generate_series` — runs the customer SUM query 12 times
- No index to support the `is_active = TRUE AND created_at <= ...` filter

**Fix:**
```sql
-- Pre-compute monthly revenue with a single scan
WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month,
           SUM(CASE plan WHEN 'pro' THEN 29.0 WHEN 'business' THEN 99.0 ELSE 0.0 END) AS revenue
    FROM customers
    WHERE is_active = TRUE
    GROUP BY month
)
SELECT TO_CHAR(gs.month, 'YYYY-MM') AS month,
       COALESCE(m.revenue, 0.0) AS revenue
FROM generate_series(
    date_trunc('month', now() - INTERVAL '11 months'),
    date_trunc('month', now()),
    INTERVAL '1 month'
) gs(month)
LEFT JOIN monthly m ON m.month = gs.month
ORDER BY gs.month;
```

#### Q12: `SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND created_at > now() - interval '24 hours'`
**File:** `api/src/routes/customer_portal.rs:187`  
**Problems:**
- Full scan of customer's deliveries to count last 24h
- Called on every dashboard page load

**Fix:** The composite index `(customer_id, created_at DESC)` from 3.2.1 covers this.

---

## 5. N+1 Query Detection

### 5.1 🔴 N+1 in Team Listing (`api/src/routes/teams.rs:210-226`)
```rust
let teams = sqlx::query_as::<_, Team>(
    "SELECT * FROM teams WHERE owner_id = $1 ..."
).fetch_all(&pool).await?;

for team in &teams {
    // N+1: one COUNT query per team!
    let count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM team_members WHERE team_id = $1"
    ).bind(team.id).fetch_one(&pool).await?;
}
```

**Fix:** Use a single query with JOIN:
```sql
SELECT t.*, COUNT(tm.id) AS member_count
FROM teams t
LEFT JOIN team_members tm ON tm.team_id = t.id
WHERE t.owner_id = $1
GROUP BY t.id
ORDER BY t.created_at DESC;
```

### 5.2 🟠 N+1 in Admin User Detail (`api/src/routes/admin.rs:193-260`)
```rust
let endpoints = sqlx::query_as::<_, EndpointSummary>(...).fetch_all(&pool).await?;
let recent_deliveries = sqlx::query_as::<_, DeliverySummary>(...).fetch_all(&pool).await?;
let total_deliveries: (i64,) = sqlx::query_as("SELECT COUNT(*) ...").fetch_one(&pool).await?;
let successful: (i64,) = sqlx::query_as("SELECT COUNT(*) ...").fetch_one(&pool).await?;
let endpoints_count: (i64,) = sqlx::query_as("SELECT COUNT(*) ...").fetch_one(&pool).await?;
```

**Fix:** Combine into 2 queries max (one for data, one for stats):
```sql
-- Single stats query
SELECT
    COUNT(*) AS total_deliveries,
    COUNT(*) FILTER (WHERE status = 'delivered') AS successful,
    (SELECT COUNT(*) FROM endpoints WHERE customer_id = $1) AS endpoints_count
FROM deliveries WHERE customer_id = $1;
```

### 5.3 🟠 N+1 in Webhook Replay (`api/src/routes/webhooks.rs:585-650`)
```rust
for item in &items {
    let original = sqlx::query_as::<_, Delivery>(...).fetch_optional(&pool).await?;
    let endpoint = sqlx::query_as::<_, Endpoint>(...).fetch_optional(&pool).await?;
    let updated: Option<Customer> = sqlx::query_as(...).fetch_optional(&pool).await?;
    let new_delivery = sqlx::query_as::<_, Delivery>(...).fetch_one(&pool).await?;
    // 4 queries per item in the batch!
}
```

**Fix:** Batch the lookups:
```rust
// Pre-fetch all originals in one query
let originals: Vec<Delivery> = sqlx::query_as::<_, Delivery>(
    "SELECT * FROM deliveries WHERE id = ANY($1) AND customer_id = $2"
).bind(&delivery_ids).bind(customer.id).fetch_all(&pool).await?;

// Pre-fetch all endpoints in one query
let endpoints: Vec<Endpoint> = sqlx::query_as::<_, Endpoint>(
    "SELECT * FROM endpoints WHERE id = ANY($1) AND customer_id = $2 AND is_active = true"
).bind(&endpoint_ids).bind(customer.id).fetch_all(&pool).await?;
```

### 5.4 🟠 N+1 in Orphaned Delivery Reaper (`worker/src/main.rs:703-750`)
```rust
for (delivery_id,) in &orphaned {
    // Query 1: Fetch delivery
    let delivery = sqlx::query_as(...).fetch_optional(pool).await?;
    // Query 2: Fetch endpoint URL
    let endpoint_url = sqlx::query_as(...).fetch_optional(pool).await?;
    // Query 3: Insert into queue
    sqlx::query(...).execute(pool).await?;
}
```

**Fix:** Batch-fetch all orphaned deliveries and endpoints:
```sql
-- Single query to get all orphaned deliveries with endpoint URLs
SELECT d.id, d.endpoint_id, d.customer_id, d.payload, d.custom_headers,
       e.url AS endpoint_url
FROM deliveries d
JOIN endpoints e ON e.id = d.endpoint_id
WHERE d.status = 'pending'
  AND d.created_at < now() - interval '10 minutes'
  AND NOT EXISTS (
      SELECT 1 FROM webhook_queue wq
      WHERE wq.delivery_id = d.id AND wq.status IN ('pending', 'processing')
  );
```

### 5.5 🟡 N+1 in Auth Middleware (`api/src/middleware/mod.rs:142-178`)
```rust
// Query 1: Get candidates by prefix
let candidates = sqlx::query_as::<_, Customer>(...).fetch_all(&*pool).await?;
// Query 2: Get api_keys by prefix
let api_key_candidates = sqlx::query_as(...).fetch_all(&*pool).await?;
// Query 3: If not found, look up owner by hash
let owner = sqlx::query_as(...).fetch_optional(&*pool).await?;
```

**Mitigation:** Already has in-memory cache (30s TTL). The cache hit rate should be high for active customers. Consider extending cache TTL to 60s.

### 5.6 🟡 N+1 in Admin SDK Notification (`api/src/routes/admin.rs:495-514`)
```rust
let admins = sqlx::query_as(...).fetch_all(&pool).await?;
for (admin_id,) in &admins {
    sqlx::query("INSERT INTO notifications ...").execute(&pool).await?;
}
```

**Fix:** Use batch insert:
```sql
INSERT INTO notifications (customer_id, type, title, message, is_read, link)
SELECT id, 'system', $1, $2, FALSE, '/admin'
FROM customers WHERE is_admin = TRUE AND is_active = TRUE;
```

---

## 6. Pagination Audit

### 6.1 Current Implementation: OFFSET-Based

All paginated endpoints use `LIMIT $n OFFSET $m`:

| Endpoint | File | Table |
|----------|------|-------|
| `GET /v1/webhooks` | webhooks.rs | deliveries |
| `GET /v1/events` | events.rs | deliveries |
| `GET /v1/search` | search.rs | deliveries |
| `GET /v1/admin/users` | admin.rs | customers |
| `GET /v1/audit-log` | audit_log.rs | audit_log |
| `GET /v1/notifications` | notifications.rs | notifications |

### 6.2 Problem: OFFSET is O(offset)

```
Page 1:   OFFSET 0   → reads 20 rows     ✅ Fast
Page 10:  OFFSET 180 → reads 200 rows    ✅ OK
Page 100: OFFSET 1980 → reads 2000 rows  ⚠️ Slower
Page 500: OFFSET 9980 → reads 10000 rows 🔴 Slow
Page 1000: OFFSET 19980 → reads 20000 rows 🔴🔴 Very slow
```

### 6.3 Fix: Cursor-Based Pagination

For the `deliveries` table (largest), switch to cursor-based pagination:

```sql
-- Instead of OFFSET:
SELECT id, endpoint_id, event_type, status, attempt_count,
       response_status, created_at
FROM deliveries
WHERE customer_id = $1
  AND created_at < $cursor  -- cursor is the created_at of the last item
ORDER BY created_at DESC
LIMIT $2;
```

**Benefits:**
- Constant-time regardless of page depth
- No need for separate COUNT query
- Stable results even when new rows are inserted

**Implementation note:** The `total` count can be cached or computed asynchronously.

### 6.4 Total Count Efficiency

Every paginated endpoint runs `SELECT COUNT(*)` on every request. For large tables:

```sql
-- Slow: full scan
SELECT COUNT(*) FROM deliveries WHERE customer_id = $1;

-- Fast: approximate count from pg_stat
SELECT reltuples::bigint FROM pg_class WHERE relname = 'deliveries';

-- Or cache the count in the customer record (update on insert/delete)
```

---

## 7. Large Table Strategy

### 7.1 `deliveries` Table Analysis

**Growth rate:** Each webhook creates 1 delivery + 1 queue item + N delivery_attempts  
**Estimated size:** At 1M webhooks/month: ~1M rows/month in deliveries, ~3M in delivery_attempts

### 7.2 Current Retention Strategy (`api/src/jobs/retention.rs`)

```rust
pub async fn run_retention(pool: &PgPool, retention_days: i64) -> Result<()> {
    let cutoff = Utc::now() - chrono::Duration::days(retention_days);
    archive_deliveries(pool, cutoff).await?;  // Move to dead_letters
    cleanup_idempotency_keys(pool).await?;
    cleanup_webhook_queue(pool).await?;       // 7-day cleanup
    cleanup_seen_webhooks(pool).await?;
    reset_monthly_webhook_counts(pool).await?;
}
```

**Assessment:**
- ✅ Retention job exists and runs every 24 hours
- ✅ Archives to dead_letters before deleting
- ⚠️ Archive + delete in separate statements (not atomic — could lose data on crash)
- ⚠️ `DELETE FROM deliveries WHERE ... AND id IN (SELECT delivery_id FROM dead_letters)` — could be slow with millions of rows
- ❌ No partitioning on deliveries table
- ❌ No partitioning on delivery_attempts table

### 7.3 🔴 Missing: Table Partitioning

For high-volume deployments, the `deliveries` table should be partitioned by `created_at`:

```sql
-- Create partitioned table
CREATE TABLE deliveries_partitioned (
    LIKE deliveries INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE deliveries_2024_01 PARTITION OF deliveries_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE deliveries_2024_02 PARTITION OF deliveries_partitioned
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- ... etc

-- Partition maintenance: drop old partitions instead of DELETE
DROP TABLE deliveries_2023_01; -- Instant, no vacuum needed
```

### 7.4 🔴 Missing: `delivery_attempts` Cleanup

The `delivery_attempts` table grows faster than `deliveries` (multiple attempts per delivery) but has **no retention job**. Old delivery attempts accumulate indefinitely.

**Fix:**
```sql
-- Add to retention job
DELETE FROM delivery_attempts
WHERE delivery_id IN (
    SELECT id FROM deliveries
    WHERE status IN ('delivered', 'failed')
      AND created_at < $cutoff
);
```

### 7.5 🟠 Zombie Reaper Query Performance

```sql
SELECT id, delivery_id, endpoint_id, attempt_count, max_attempts
FROM webhook_queue
WHERE status = 'processing'
  AND updated_at < now() - interval '5 minutes';
```

**Index exists:** `idx_webhook_queue_status_updated_at` ✅  
**But:** This runs every 30 seconds. If the table has many 'processing' rows (stuck workers), the index helps but the row count could still be large.

### 7.6 🟠 Orphaned Delivery Reaper Performance

```sql
SELECT d.id FROM deliveries d
WHERE d.status = 'pending'
  AND d.created_at < now() - interval '10 minutes'
  AND NOT EXISTS (
      SELECT 1 FROM webhook_queue wq
      WHERE wq.delivery_id = d.id AND wq.status IN ('pending', 'processing')
  );
```

**Problem:** The `NOT EXISTS` correlated subquery requires checking webhook_queue for every pending delivery. No index on `webhook_queue(delivery_id, status)`.

**Fix:**
```sql
CREATE INDEX CONCURRENTLY idx_webhook_queue_delivery_status
    ON webhook_queue(delivery_id, status);
```

---

## 8. Critical Issues & Recommendations

### Priority 1: Immediate (This Sprint)

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 1 | Missing `(customer_id, created_at DESC)` on deliveries | Every delivery list query is slow | Add composite index |
| 2 | `SELECT *` on deliveries (fetches payload JSONB) | 10-100x more data transferred than needed | Select specific columns |
| 3 | Missing `(customer_id, created_at DESC)` on audit_log | Audit log queries seq-scan | Add composite index |
| 4 | Missing indexes on dead_letters | All dead letter queries seq-scan | Add indexes |

### Priority 2: Next Sprint

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 5 | N+1 in team listing | 1 extra query per team | Use JOIN with COUNT |
| 6 | N+1 in webhook replay batch | 4 queries per item in batch | Batch lookups |
| 7 | COUNT(*) on every paginated request | Doubles query cost | Cache or approximate |
| 8 | OFFSET pagination on deliveries | Degrades linearly | Switch to cursor-based |
| 9 | Missing `delivery_attempts` retention | Unbounded growth | Add cleanup job |
| 10 | Missing `webhook_queue(delivery_id, status)` index | Orphaned reaper slow | Add index |

### Priority 3: Backlog

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 11 | No connection pool tuning | Potential connection exhaustion under load | Add timeouts |
| 12 | `delivery_attempts` response_body in list queries | Unnecessary data transfer | Lazy-load on detail view |
| 13 | Admin revenue correlated subquery | 12x scan of customers table | Rewrite with CTE |
| 14 | No partitioning on deliveries | Table grows unbounded | Add monthly partitions |
| 15 | Auth middleware SELECT * | Fetches unnecessary columns | Select auth-specific columns |

---

## 9. EXPLAIN ANALYZE Suggestions

Run these against a production-like dataset to identify bottlenecks:

### 9.1 Delivery Listing (Most Critical)
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM deliveries
WHERE customer_id = 'some-uuid'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

**Expected issue:** `Seq Scan on deliveries` or `Index Scan using idx_deliveries_customer` + `Sort`

### 9.2 Delivery Listing with Status Filter
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM deliveries
WHERE customer_id = 'some-uuid' AND status = 'delivered'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

### 9.3 Analytics Time Bucket Query
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
    date_trunc('hour', created_at) - (EXTRACT(HOUR FROM created_at)::int % 1) * INTERVAL '1 hour' AS bucket,
    COUNT(*) FILTER (WHERE status = 'delivered') AS successful,
    COUNT(*) FILTER (WHERE status = 'failed') AS failed,
    COUNT(*) AS total
FROM deliveries
WHERE customer_id = 'some-uuid'
  AND created_at >= now() - INTERVAL '24 hours'
GROUP BY bucket
ORDER BY bucket ASC;
```

### 9.4 Latency Trend (JOIN-heavy)
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
    date_trunc('hour', da.created_at) AS bucket,
    COALESCE(AVG(da.duration_ms), 0)::FLOAT AS avg_ms,
    COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY da.duration_ms), 0)::FLOAT AS p95_ms
FROM delivery_attempts da
JOIN deliveries d ON d.id = da.delivery_id
WHERE d.customer_id = 'some-uuid'
  AND da.created_at >= now() - INTERVAL '24 hours'
  AND da.duration_ms IS NOT NULL
GROUP BY bucket
ORDER BY bucket ASC;
```

### 9.5 Webhook Queue Pending Fetch (Worker Hot Path)
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
UPDATE webhook_queue
SET status = 'processing'
WHERE id IN (
    SELECT id FROM webhook_queue
    WHERE status = 'pending'
      AND (next_retry_at IS NULL OR next_retry_at <= now())
    ORDER BY created_at
    LIMIT 50
    FOR UPDATE SKIP LOCKED
)
RETURNING id, delivery_id, endpoint_id, endpoint_url, payload, custom_headers,
          attempt_count, max_attempts, next_retry_at, trace_id;
```

### 9.6 Orphaned Delivery Reaper
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT d.id FROM deliveries d
WHERE d.status = 'pending'
  AND d.created_at < now() - interval '10 minutes'
  AND NOT EXISTS (
      SELECT 1 FROM webhook_queue wq
      WHERE wq.delivery_id = d.id
        AND wq.status IN ('pending', 'processing')
  );
```

### 9.7 Search with ILIKE
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT d.id, d.event_type, d.status, d.attempt_count,
       d.response_status, d.created_at, e.url
FROM deliveries d
JOIN endpoints e ON d.endpoint_id = e.id
WHERE d.customer_id = 'some-uuid'
  AND (d.event_type ILIKE '%order%' OR d.id::text ILIKE '%order%' OR e.url ILIKE '%order%')
ORDER BY d.created_at DESC
LIMIT 20 OFFSET 0;
```

**Expected issue:** `ILIKE '%pattern%'` can't use btree indexes. Consider `pg_trgm` extension:
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX CONCURRENTLY idx_deliveries_event_type_trgm
    ON deliveries USING gin (event_type gin_trgm_ops);
```

### 9.8 Auth Middleware (Every Request)
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM customers WHERE api_key_prefix = 'hr_live_abc1234';
```

---

## Appendix: Complete Query Inventory

### By Table

| Table | SELECT | INSERT | UPDATE | DELETE | Total |
|-------|--------|--------|--------|--------|-------|
| `customers` | 18 | 2 | 15 | 2 | 37 |
| `deliveries` | 16 | 6 | 6 | 2 | 30 |
| `endpoints` | 14 | 2 | 5 | 1 | 22 |
| `webhook_queue` | 3 | 2 | 6 | 1 | 12 |
| `delivery_attempts` | 4 | 3 | 0 | 0 | 7 |
| `dead_letters` | 0 | 4 | 0 | 0 | 4 |
| `notifications` | 4 | 1 | 2 | 1 | 8 |
| `api_keys` | 3 | 1 | 1 | 1 | 6 |
| `idempotency_keys` | 2 | 1 | 0 | 1 | 4 |
| `refresh_tokens` | 1 | 1 | 2 | 0 | 4 |
| `password_reset_tokens` | 1 | 1 | 1 | 0 | 3 |
| `email_verification_tokens` | 1 | 1 | 1 | 0 | 3 |
| `teams` | 4 | 1 | 0 | 0 | 5 |
| `team_members` | 4 | 1 | 1 | 1 | 7 |
| `team_invites` | 2 | 1 | 0 | 0 | 3 |
| `alert_rules` | 3 | 1 | 0 | 1 | 5 |
| `audit_log` | 2 | 1 | 0 | 0 | 3 |
| `invoices` | 1 | 0 | 0 | 0 | 1 |
| `payment_transactions` | 0 | 1 | 0 | 0 | 1 |
| `device_tokens` | 1 | 1 | 0 | 1 | 3 |
| `event_schemas` | 3 | 1 | 1 | 0 | 5 |
| `transform_rules` | 3 | 1 | 0 | 2 | 6 |
| `fifo_queue` | 5 | 1 | 4 | 0 | 10 |
| `fanout_rules` | 1 | 0 | 0 | 0 | 1 |
| `delivery_targets` | 2 | 0 | 0 | 0 | 2 |
| `seen_webhooks` | 1 | 1 | 0 | 1 | 3 |
| `sso_configs` | 2 | 1 | 0 | 1 | 4 |
| `custom_domains` | 3 | 1 | 1 | 1 | 6 |
| `portal_configs` | 1 | 1 | 0 | 0 | 2 |
| `rate_limit_configs` | 2 | 1 | 0 | 1 | 4 |
| `inbound_configs` | 2 | 0 | 0 | 0 | 2 |
| `notification_preferences` | 1 | 1 | 0 | 0 | 2 |
| `ai_*` tables | 0 | 0 | 0 | 0 | 0 |

**Total queries in codebase: ~200+**

---

*Report generated by deep database query performance audit.*
