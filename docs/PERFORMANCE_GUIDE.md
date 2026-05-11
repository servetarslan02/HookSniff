# HookSniff — Performance Guide

> Son güncelleme: 2026-05-12

---

## Table of Contents

- [Database Query Optimization](#database-query-optimization)
- [Index Strategy](#index-strategy)
- [Caching Strategies](#caching-strategies)
- [Connection Pool Tuning](#connection-pool-tuning)
- [Webhook Delivery Optimization](#webhook-delivery-optimization)
- [Memory Management (Rust)](#memory-management-rust)
- [Monitoring Metrics](#monitoring-metrics)
- [SLA Targets](#sla-targets)

---

## Database Query Optimization

### Using EXPLAIN ANALYZE

Always profile queries before optimizing. Use `EXPLAIN ANALYZE` on Neon:

```sql
-- Basic analysis
EXPLAIN ANALYZE
SELECT * FROM webhook_queue
WHERE status = 'pending'
ORDER BY created_at ASC
LIMIT 100;

-- With buffers (shows I/O)
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT w.*, e.url
FROM webhook_queue w
JOIN endpoints e ON w.endpoint_id = e.id
WHERE w.status = 'pending'
AND w.scheduled_at <= NOW()
ORDER BY w.created_at ASC
LIMIT 100;
```

### Reading the Output

```
Seq Scan on webhook_queue  (cost=0.00..1520.00 rows=100 width=64)
  Filter: (status = 'pending')
  Rows Removed by Filter: 49900
```

**Red flags:**
- `Seq Scan` on large tables → missing index
- `Rows Removed by Filter` >> `rows` → filter too selective, needs index
- `cost` first number (startup) is high → consider index or LIMIT
- `actual time` >> estimated time → statistics out of date, run `ANALYZE`

### Common Optimizations

```sql
-- 1. Update table statistics (run after bulk inserts/deletes)
ANALYZE webhook_queue;

-- 2. Check for missing indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname = 'public'
ORDER BY tablename;

-- 3. Find slow queries (Neon dashboard or pg_stat_statements)
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- 4. Check table bloat
SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::text))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::text) DESC;
```

### Query Patterns to Avoid

```sql
-- ❌ SELECT * (fetches all columns)
SELECT * FROM endpoints WHERE user_id = $1;

-- ✅ Select only needed columns
SELECT id, url, description, created_at FROM endpoints WHERE user_id = $1;

-- ❌ LIKE with leading wildcard
SELECT * FROM webhooks WHERE event_type LIKE '%order%';

-- ✅ Use prefix match or full-text search
SELECT * FROM webhooks WHERE event_type LIKE 'order.%';

-- ❌ Subquery in WHERE
SELECT * FROM endpoints WHERE id IN (SELECT endpoint_id FROM webhook_queue WHERE status = 'failed');

-- ✅ JOIN
SELECT DISTINCT e.* FROM endpoints e
JOIN webhook_queue w ON e.id = w.endpoint_id
WHERE w.status = 'failed';

-- ❌ OFFSET for pagination (scans all skipped rows)
SELECT * FROM webhooks ORDER BY created_at DESC OFFSET 1000 LIMIT 50;

-- ✅ Keyset pagination
SELECT * FROM webhooks
WHERE created_at < $last_seen_timestamp
ORDER BY created_at DESC
LIMIT 50;
```

---

## Index Strategy

### Current Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| `webhook_queue` | `idx_queue_status_scheduled` | `(status, scheduled_at)` | Worker dequeue query |
| `webhook_queue` | `idx_queue_endpoint` | `(endpoint_id)` | Lookups by endpoint |
| `webhook_queue` | `idx_queue_created` | `(created_at)` | Time-range queries |
| `endpoints` | `idx_endpoints_user` | `(user_id)` | User's endpoints |
| `webhooks` | `idx_webhooks_endpoint` | `(endpoint_id)` | Webhooks by endpoint |
| `webhooks` | `idx_webhooks_created` | `(created_at)` | Time-range queries |
| `api_keys` | `idx_api_keys_key` | `(key_hash)` | API key lookup |
| `users` | `idx_users_email` | `(email)` | Login lookup |

### When to Add a New Index

Add an index when:
1. **EXPLAIN shows Seq Scan** on a table with >1000 rows
2. **Query is in hot path** (API endpoint, worker loop)
3. **Filter column has good selectivity** (not boolean, not low-cardinality enum)
4. **Write frequency is low** relative to reads

Don't add an index when:
1. Table is small (<1000 rows) — Seq Scan is faster
2. Column is updated frequently — index maintenance overhead
3. Already have a covering index that works
4. Write-heavy table with few reads on that column

### Composite Index Rules

```sql
-- Put equality columns first, range columns last
CREATE INDEX idx_queue_status_created ON webhook_queue (status, created_at);
-- ✅ WHERE status = 'pending' AND created_at > '2026-01-01'

-- For ORDER BY + LIMIT, include sort column
CREATE INDEX idx_queue_status_sched ON webhook_queue (status, scheduled_at);
-- ✅ WHERE status = 'pending' ORDER BY scheduled_at LIMIT 100
```

### Index Monitoring

```sql
-- Find unused indexes (candidates for removal)
SELECT indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND idx_scan < 100
ORDER BY idx_scan ASC;

-- Find missing indexes (high sequential scans)
SELECT relname, seq_scan, seq_tup_read, idx_scan
FROM pg_stat_user_tables
WHERE seq_scan > 1000
AND schemaname = 'public'
ORDER BY seq_tup_read DESC;
```

---

## Caching Strategies

### Redis (Upstash) Architecture

```
┌──────────┐     ┌───────────┐     ┌──────────┐
│  API     │────►│   Redis   │────►│  Postgres│
│  Request │     │  (cache)  │     │  (source)│
└──────────┘     └───────────┘     └──────────┘
```

### What to Cache

| Data | TTL | Strategy | Notes |
|------|-----|----------|-------|
| API key → user mapping | 5 min | Write-through | Invalidate on key rotation |
| User plan/limits | 5 min | Cache-aside | Invalidate on plan change |
| Endpoint list (per user) | 30 sec | Cache-aside | Short TTL, frequent reads |
| Delivery stats (counts) | 1 min | Cache-aside | Acceptable staleness |
| Rate limit counters | 1 hour | Sliding window | Already implemented |
| Feature flags | 5 min | Cache-aside | Low write frequency |

### What NOT to Cache

- **Webhook payloads** — too large, one-time use
- **Authentication tokens** — security risk
- **Real-time delivery status** — must be fresh
- **Billing data** — must be accurate

### Cache Implementation Pattern

```rust
// Cache-aside pattern (pseudocode)
async fn get_user_with_cache(user_id: &str) -> Result<User> {
    // 1. Try cache
    let cache_key = format!("user:{}", user_id);
    if let Some(cached) = redis.get(&cache_key).await? {
        return serde_json::from_str(&cached);
    }

    // 2. Cache miss — query database
    let user = db.get_user(user_id).await?;

    // 3. Populate cache
    redis.set_ex(&cache_key, serde_json::to_string(&user)?, 300).await?;

    Ok(user)
}
```

### Cache Invalidation

```rust
// Invalidate on write
async fn update_user(user_id: &str, data: UpdateUser) -> Result<()> {
    db.update_user(user_id, data).await?;
    redis.del(format!("user:{}", user_id)).await?;
    Ok(())
}
```

### Upstash Free Tier Limits

- **10,000 commands/day** — monitor usage in Upstash dashboard
- **256 MB storage** — more than enough for caching
- **1 concurrent connection** — use connection pooling

---

## Connection Pool Tuning

### SQLx Pool Configuration

```rust
// In config.rs or db.rs
let pool = PgPoolOptions::new()
    .max_connections(20)           // Max connections per instance
    .min_connections(5)            // Keep warm connections
    .acquire_timeout(Duration::from_secs(5))  // Fail fast
    .idle_timeout(Duration::from_secs(300))   // Close idle connections
    .max_lifetime(Duration::from_secs(1800))  // Recycle connections
    .connect(&database_url)
    .await?;
```

### Neon Connection Limits

| Plan | Max Connections | Notes |
|------|----------------|-------|
| Free | 100 | Shared across all compute |
| Pro | 200+ | Depends on compute size |

**Rule of thumb:** `max_connections_per_instance × num_instances < 80% of Neon limit`

With 2 Cloud Run instances × 20 connections = 40 connections. Safe for free tier.

### Monitoring Pool Health

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Connections by state
SELECT state, count(*) FROM pg_stat_activity GROUP BY state;

-- Long-running queries (potential connection holders)
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
AND now() - query_start > interval '30 seconds'
ORDER BY duration DESC;
```

---

## Webhook Delivery Optimization

### Batching

When sending multiple webhooks to the same endpoint, batch them:

```rust
// ❌ Individual deliveries (N network calls)
for event in events {
    deliver_webhook(endpoint, event).await?;
}

// ✅ Batched delivery (1 network call)
let batch = WebhookBatch {
    events: events.to_vec(),
    endpoint_id: endpoint.id,
};
deliver_batch(endpoint, batch).await?;
```

### Concurrency Control

```rust
// Control concurrent deliveries per endpoint
let semaphore = Arc::new(Semaphore::new(MAX_CONCURRENT_PER_ENDPOINT)); // e.g., 5

async fn deliver_with_limit(permit: OwnedSemaphorePermit, webhook: Webhook) -> Result<()> {
    let _permit = permit;
    deliver_webhook(webhook).await
}
```

### Worker Tuning

| Parameter | Default | Description |
|-----------|---------|-------------|
| `WORKER_CONCURRENCY` | 50 | Max concurrent deliveries globally |
| `WORKER_BATCH_SIZE` | 100 | Webhooks to dequeue per batch |
| `WORKER_POLL_INTERVAL_MS` | 1000 | How often to check queue |
| `DELIVERY_TIMEOUT_SECS` | 30 | HTTP timeout per delivery |
| `MAX_RETRIES` | 5 | Retry attempts before dead letter |

### Delivery Pipeline

```
Dequeue → Validate → Sign → HTTP POST → Record Result → Update Status
  │                                      │
  │         ┌────────────────────────────┘
  │         │
  │    2xx → success
  │    4xx → dead letter (don't retry client errors)
  │    5xx → retry with backoff
  │    timeout → retry with backoff
  │    network error → retry with backoff
  └──── next batch
```

### Backoff Strategy

```
Attempt 1: immediate
Attempt 2: 5 seconds
Attempt 3: 30 seconds
Attempt 4: 2 minutes
Attempt 5: 10 minutes
Attempt 6: 30 minutes (final)
```

---

## Memory Management (Rust)

### Avoid Unnecessary Allocations

```rust
// ❌ Allocates new String for each request
fn get_header(headers: &HeaderMap, name: &str) -> String {
    headers.get(name).unwrap().to_str().unwrap().to_string()
}

// ✅ Returns &str (zero allocation)
fn get_header<'a>(headers: &'a HeaderMap, name: &str) -> Option<&'a str> {
    headers.get(name)?.to_str().ok()
}
```

### Use Bytes for Payloads

```rust
// ❌ Vec<u8> copies data
let body: Vec<u8> = hyper::body::to_bytes(request).await?.to_vec();

// ✅ Bytes is reference-counted, zero-copy
let body: Bytes = hyper::body::to_bytes(request).await?;
```

### Bounded Caches

```rust
// ❌ Unbounded HashMap (memory leak)
let mut cache: HashMap<String, CachedData> = HashMap::new();

// ✅ LRU cache with max size
use lru::LruCache;
let mut cache: LruCache<String, CachedData> = LruCache::new(1000);
```

### Avoid Cloning in Hot Paths

```rust
// ❌ Clones entire payload
async fn process(payload: Payload) -> Result<()> {
    let cloned = payload.clone();
    send_to_worker(cloned).await?;
    process_locally(payload).await?;
}

// ✅ Use Arc for shared ownership
async fn process(payload: Arc<Payload>) -> Result<()> {
    let shared = payload.clone(); // Cheap Arc clone
    send_to_worker(shared).await?;
    process_locally(payload).await?;
}
```

### Profile Memory

```bash
# Using dhat (add to Cargo.toml)
# [dependencies]
# dhat = "0.3"

# In main.rs
#[cfg(feature = "dhat-heap")]
#[global_allocator]
static ALLOC: dhat::Alloc = dhat::Alloc;

# Run with profiling
cargo run --features dhat-heap
# Produces dhat-heap.json — view with dhat/dh_view.html
```

---

## Monitoring Metrics

### Key Grafana Dashboards

| Dashboard | Metrics | Alert Threshold |
|-----------|---------|-----------------|
| **API Latency** | `http_request_duration_seconds` | p99 > 2s |
| **Error Rate** | `http_requests_total{status=~"5.."}` | > 1% of requests |
| **Webhook Queue Depth** | `webhook_queue_pending_count` | > 10,000 |
| **Delivery Success Rate** | `webhook_delivery_success_total` | < 95% |
| **Database Connections** | `db_connections_active` | > 80% of pool |
| **Redis Commands** | `redis_commands_total` | > 8,000/day (free tier) |
| **Memory Usage** | `process_resident_memory_bytes` | > 80% of limit |
| **CPU Usage** | `process_cpu_seconds_total` | > 80% sustained |

### Setting Up Grafana Alerts

1. Go to Grafana → Alerting → Alert rules
2. Create rule for each metric above
3. Set notification channel (Discord webhook or email)
4. Test with `grafana-cli alerts test`

### OpenTelemetry Traces

HookSniff exports traces via OTLP to Grafana Cloud:

```rust
// In telemetry.rs
// Traces include:
// - HTTP request span (method, path, status, duration)
// - Database query span (query text, duration)
// - Redis command span (command, duration)
// - Webhook delivery span (endpoint, status, duration)
```

### Custom Metrics to Track

```rust
// Business metrics
webhook_ingested_total        // Total webhooks received
webhook_delivered_total       // Total successfully delivered
webhook_failed_total          // Total failed deliveries
endpoint_count                // Active endpoints
user_count                    // Total users
revenue_mrr                   // Monthly recurring revenue

// Operational metrics
queue_depth                   // Pending webhooks in queue
delivery_latency_seconds      // Time from ingest to delivery
retry_count                   // Number of retries per delivery
circuit_breaker_state         // Open/closed per endpoint
```

---

## SLA Targets

### Response Time

| Metric | Target | Measurement |
|--------|--------|-------------|
| API p50 latency | < 100ms | Grafana: `http_request_duration_seconds` |
| API p95 latency | < 500ms | Grafana: `http_request_duration_seconds` |
| API p99 latency | < 2000ms | Grafana: `http_request_duration_seconds` |
| Webhook ingest latency | < 200ms | Time from POST to queue insertion |
| Webhook delivery latency | < 5s | Time from queue to HTTP response |

### Throughput

| Metric | Target | Measurement |
|--------|--------|-------------|
| API requests/second | 1000+ | Grafana: `rate(http_requests_total[1m])` |
| Webhook ingest rate | 500+/sec | Grafana: `rate(webhook_ingested_total[1m])` |
| Delivery rate | 200+/sec | Grafana: `rate(webhook_delivered_total[1m])` |

### Error Rates

| Metric | Target | Measurement |
|--------|--------|-------------|
| API error rate | < 0.1% | 5xx / total requests |
| Delivery error rate | < 1% | Failed / total deliveries |
| Queue backlog | < 1000 | Pending items in webhook_queue |
| Dead letter rate | < 0.1% | Permanently failed / total |

### Availability

| Metric | Target | Notes |
|--------|--------|-------|
| API uptime | 99.9% | ~8.7h downtime/year |
| Dashboard uptime | 99.5% | Vercel SLA |
| Delivery success rate | 99.9% | After retries |

### Uptime Calculation

```
99.9% = 8.76 hours downtime/year = 43.83 minutes/month
99.95% = 4.38 hours downtime/year = 21.92 minutes/month
99.99% = 52.6 minutes/year = 4.38 minutes/month
```

---

## Performance Checklist (Pre-Launch)

- [ ] All hot-path queries have appropriate indexes
- [ ] EXPLAIN ANALYZE run on top 10 queries
- [ ] Connection pool sized correctly (not exceeding Neon limits)
- [ ] Redis caching for repeated reads (API keys, user data)
- [ ] Webhook payload size limits enforced (1MB default)
- [ ] Rate limiting tested under load
- [ ] Memory profiling done (no leaks in 1-hour test)
- [ ] Grafana dashboards configured with alerts
- [ ] Load testing completed (target: 1000 req/s)
- [ ] Cloud Run autoscaling configured (min 1, max 10 instances)
