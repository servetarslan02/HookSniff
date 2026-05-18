# Deep Async Rust Audit — HookSniff API & Worker

**Auditor:** Subagent (deep-async-rust)
**Date:** 2026-05-10
**Scope:** Full async/await safety, concurrency, resource management

---

## Executive Summary

The codebase is generally well-structured for async Rust. The worker's LISTEN/NOTIFY + polling loop is solid, the rate limiter correctly uses `tokio::sync::Mutex`, and the WebSocket gateway uses proper `RwLock`. However, there are **3 critical issues** and **5 high-severity issues** that could cause production hangs, deadlocks, or resource leaks under load.

---

## 🔴 CRITICAL Issues (Production Hangs / Deadlocks)

### C1: `std::sync::Mutex` Held Across `.await` in Auth Middleware

**File:** `api/src/middleware/mod.rs:130-190`
**Severity:** 🔴 Critical — Can hang all requests on cache miss

```rust
static AUTH_CACHE: once_cell::sync::Lazy<Mutex<AuthCache>> =
    once_cell::sync::Lazy::new(|| Mutex::new(AuthCache::new()));

// In auth_middleware (async fn):
{
    let cache = AUTH_CACHE.lock().unwrap(); // std::sync::Mutex!
    if let Some(cached) = cache.get(&prefix) {
        cached
    } else {
        // ❌ std::sync::Mutex guard held across DB queries!
        let candidates = sqlx::query_as(...)
            .fetch_all(&*pool)
            .await?;  // ← blocks executor thread while holding mutex
        // ... more .await calls ...
        let customer = found.ok_or(AppError::Unauthorized)?;

        if let Ok(mut cache) = AUTH_CACHE.lock() { // ← second lock attempt!
            cache.insert(prefix, customer.clone());
        }
        customer
    }
}
```

**Problem:**
1. `std::sync::Mutex` is held across multiple `.await` points (DB queries, Argon2 verification)
2. While the mutex is held, the executor thread is blocked — no other async task can make progress on that thread
3. Under load with cache misses, this serializes ALL auth requests through a single thread
4. The `.unwrap()` on line 136 panics on poisoned mutex — a single panic in any request crashes all subsequent auth
5. The second `.lock()` on line 186 is a nested lock attempt (non-reentrant) — will deadlock if the first guard is still alive

**The scoping makes this subtle:** The `{...}` block creates a scope, but the `if let ... else` is an expression — the first mutex guard lives until the expression evaluates. The DB queries in the `else` branch execute while holding the guard.

**Fix:**
```rust
// Option A: Use tokio::sync::Mutex
static AUTH_CACHE: Lazy<tokio::sync::Mutex<AuthCache>> = ...;

// Option B (better): Clone what you need, drop the guard immediately
let cached = {
    let cache = AUTH_CACHE.lock().unwrap();
    cache.get(&prefix) // returns Option<Customer>, guard dropped here
};
if let Some(customer) = cached {
    // proceed without holding lock
} else {
    // DB queries happen without any lock held
    let customer = lookup_customer(&pool, &prefix).await?;
    {
        let mut cache = AUTH_CACHE.lock().unwrap();
        cache.insert(prefix, customer.clone());
    }
    customer
}
```

**Impact:** Under moderate load with cache misses, this will block Tokio worker threads, causing request latency spikes and potential cascading timeouts.

---

### C2: Unbounded Auth Cache Growth (Memory Leak)

**File:** `api/src/middleware/mod.rs:30-60`
**Severity:** 🔴 Critical — OOM over time

```rust
struct AuthCache {
    entries: HashMap<String, (Customer, Instant)>,
}

impl AuthCache {
    fn cleanup(&mut self) {
        self.entries.retain(|_, (_, expiry)| Instant::now() < *expiry);
    }
}
```

The `cleanup()` method exists but **is never called**. There is no background task that periodically calls it. With `AUTH_CACHE_TTL = 30s`, entries expire but are never removed. Over days/weeks, the HashMap grows unbounded.

**Fix:** Add a periodic cleanup task:
```rust
tokio::spawn(async loop {
    tokio::time::sleep(Duration::from_secs(60)).await;
    if let Ok(mut cache) = AUTH_CACHE.lock() {
        cache.cleanup();
    }
});
```

Or better: use an LRU cache (e.g., `lru` crate) with a max capacity.

---

### C3: Argon2 (CPU-bound) in Async Context Without `spawn_blocking`

**File:** `api/src/middleware/mod.rs` — `verify_api_key()` calls
**Severity:** 🔴 Critical — Thread starvation under load

`verify_api_key` uses Argon2id, which is intentionally CPU-expensive (~100ms+ per call). It's called inside `auth_middleware` (an async fn) on cache misses. This blocks the Tokio executor thread for the duration of the hash verification.

Under load with 100 concurrent requests hitting cache misses, 100 Tokio threads are blocked doing Argon2 computation. With the default Tokio thread pool size (typically 8-16), this causes severe thread starvation.

**Fix:**
```rust
let verified = tokio::task::spawn_blocking(move || {
    verify_api_key(&token, &hash)
}).await.unwrap_or(false);
```

The same applies to `hash_api_key()` in registration handlers.

---

## 🟠 HIGH Issues (Resource Leaks / Correctness)

### H1: `reqwest::Client` Created Per-Request in Multiple Modules

**Files:**
- `worker/src/delivery/mod.rs:293` — `deliver_email()`
- `api/src/routes/oauth.rs:349,387,421,465` — OAuth handlers
- `api/src/billing/stripe.rs:127,165` — Stripe handlers

**Severity:** 🟠 High — Connection leak, performance degradation

`reqwest::Client` manages a connection pool internally. Creating a new one per request means:
- Each client creates its own DNS resolver, TLS context, and connection pool
- TCP connections are never reused (defeating HTTP keep-alive)
- Under load, this creates thousands of ephemeral connections

The worker correctly creates a shared `http_client` in `main.rs` and passes it around — but `deliver_email()` creates its own.

**Fix:** Pass the shared `reqwest::Client` to all functions that need HTTP access.

---

### H2: Blocking File I/O in Async Context

**Files:**
- `worker/src/delivery/mod.rs:209` — `std::fs::read_to_string(&sa_path)`
- `api/src/email.rs:57` — `std::fs::read_to_string(path)`

**Severity:** 🟠 High — Thread blocking

Both files use `std::fs::read_to_string` inside async functions. While these are typically fast (small JSON files), they block the executor thread during disk I/O.

**Fix:** Use `tokio::fs::read_to_string` or `tokio::task::spawn_blocking`.

---

### H3: Unbounded `mpsc::UnboundedChannel` in WebSocket Handler

**File:** `api/src/ws/handler.rs:110`
**Severity:** 🟠 High — Memory pressure under slow consumers

```rust
let (tx, mut rx) = mpsc::unbounded_channel::<WsMessage>();
```

Each WebSocket connection gets an unbounded channel. If a client is slow to read messages (e.g., mobile network), the channel accumulates messages in memory without limit. With many slow connections, this can cause OOM.

**Fix:** Use `mpsc::channel(bounded_size)` and handle `SendError` by disconnecting slow clients:
```rust
let (tx, mut rx) = mpsc::channel::<WsMessage>(256);
```

---

### H4: Broadcast Channel Overflow Silently Drops Events

**File:** `api/src/ws/mod.rs:97`
**Severity:** 🟠 Medium-High — Silent event loss

```rust
let (event_tx, _) = broadcast::channel(1024);
// ...
let _ = self.event_tx.send(event); // silently drops on overflow
```

The `broadcast::channel(1024)` is bounded. If receivers are slow and the channel fills, `send()` returns `Err` containing the lagged message. The code uses `let _ =` to silently discard this.

**Fix:** Log the error and consider disconnecting lagging receivers:
```rust
if let Err(e) = self.event_tx.send(event) {
    tracing::warn!("Broadcast channel overflow: {}", e);
}
```

---

### H5: Poisoned Mutex Panics Crash the Server

**File:** `api/src/middleware/mod.rs:136`
**Severity:** 🟠 High — Server crash propagation

```rust
let cache = AUTH_CACHE.lock().unwrap(); // panics if poisoned
```

If any thread panics while holding the `AUTH_CACHE` mutex, the mutex becomes "poisoned." Every subsequent `.lock().unwrap()` call panics, crashing every auth request. One bad request can take down the entire API.

**Fix:** Use `.lock().unwrap_or_else(|e| e.into_inner())` to recover from poisoned mutexes, or switch to `tokio::sync::Mutex` which doesn't have poisoning semantics.

---

## 🟡 MEDIUM Issues (Correctness / Best Practices)

### M1: Background Task Errors Not Propagated

**File:** `api/src/main.rs:35-90` — `tokio::spawn` for retention/cleanup jobs
**Severity:** 🟡 Medium

```rust
tokio::spawn(async move {
    loop {
        tokio::time::sleep(...).await;
        if let Err(e) = jobs::retention::run_retention(...).await {
            tracing::error!("❌ Retention job failed: {:?}", e);
        }
    }
});
```

The spawned tasks handle errors via logging, which is correct. However, if the task panics, the `JoinHandle` is discarded — the panic is silently lost. The server continues running without the background job.

**Fix:** Store `JoinHandle`s and periodically check they're alive:
```rust
let handles = vec![
    tokio::spawn(retention_loop(...)),
    tokio::spawn(cleanup_loop(...)),
];
// In a monitoring task:
for h in &handles {
    if h.is_finished() {
        tracing::error!("Background task died!");
    }
}
```

---

### M2: Worker `process_pending` Can Overwhelm Connection Pool

**File:** `worker/src/main.rs:process_pending()`
**Severity:** 🟡 Medium

The function fetches up to 50 items and spawns a concurrent task for each. Each task opens a database transaction. With `max_connections(10)` on the pool, this means 40+ tasks queue for connections simultaneously.

While `FOR UPDATE SKIP LOCKED` prevents lock contention at the DB level, the application-level connection pool can become a bottleneck. Under high webhook volume, tasks may wait longer for connections than the actual HTTP delivery takes.

**Fix:** Either increase `max_connections` or use a semaphore to limit concurrency:
```rust
let sem = Arc::new(tokio::sync::Semaphore::new(10));
for item in items {
    let permit = sem.clone().acquire_owned().await.unwrap();
    tokio::spawn(async move {
        let _permit = permit; // held until task completes
        // ... process item ...
    });
}
```

---

### M3: PgListener Reconnect Can Miss Notifications

**File:** `worker/src/main.rs:130-150`
**Severity:** 🟡 Medium

When the PgListener disconnects and reconnects, there's a window where notifications are missed. The 1-second poll fallback mitigates this, but during the reconnect window, deliveries could be delayed by up to 1 second.

The reconnect logic is good, but there's no exponential backoff on repeated failures — it always waits 1 second.

**Fix:** Add exponential backoff:
```rust
let mut reconnect_delay = Duration::from_secs(1);
// On failure:
tokio::time::sleep(reconnect_delay).await;
reconnect_delay = (reconnect_delay * 2).min(Duration::from_secs(30));
// On success:
reconnect_delay = Duration::from_secs(1);
```

---

### M4: `tokio::spawn` in `notify_customer` Without Backpressure

**File:** `api/src/notifications/mod.rs:60-80`
**Severity:** 🟡 Medium

```rust
for (token,) in tokens {
    tokio::spawn(async move {
        fcm.send(...).await;
    });
}
```

For a customer with many device tokens, this spawns unbounded concurrent tasks. Each FCM call takes ~100-500ms. With 1000 tokens, this creates 1000 concurrent outbound connections.

**Fix:** Use `futures::stream::iter(tokens).buffer_unordered(10).for_each(...)` to limit concurrency.

---

### M5: `record_attempt` Takes `&mut PgConnection` but Caller Uses Transactions

**File:** `worker/src/main.rs:record_attempt()`
**Severity:** 🟡 Low (correctness)

The function signature takes `&mut sqlx::PgConnection` but callers pass `&mut *tx` (dereferenced transaction). This works because `PgTransaction` derefs to `PgConnection`, but it's fragile — if the function ever needs to be used outside a transaction, the signature is misleading.

This is a minor code quality issue, not a bug.

---

## ✅ Good Patterns Found

| Pattern | Location | Notes |
|---------|----------|-------|
| `tokio::sync::Mutex` for rate limiter | `rate_limit.rs` | Correct async mutex usage |
| `tokio::sync::RwLock` for WS connections | `ws/mod.rs` | Read-heavy workload, correct choice |
| `FOR UPDATE SKIP LOCKED` | `worker/main.rs` | Safe concurrent queue processing |
| Shared `reqwest::Client` in worker | `worker/main.rs` | Connection pooling, proper reuse |
| Graceful shutdown signal | Both `main.rs` | Proper SIGTERM/SIGINT handling |
| Error handling in spawned tasks | `worker/main.rs` | `JoinHandle.await` catches panics |
| Bounded `broadcast::channel` | `ws/mod.rs` | Prevents unbounded memory growth |
| Zombie reaper | `worker/main.rs` | Recovers stuck processing records |
| Redis fallback for rate limiter | `rate_limit.rs` | Graceful degradation |
| LISTEN/NOTIFY + poll fallback | `worker/main.rs` | Reliable with instant wake-up |

---

## Summary Table

| ID | Severity | Component | Issue | Impact |
|----|----------|-----------|-------|--------|
| C1 | 🔴 Critical | `middleware/mod.rs` | `std::sync::Mutex` held across `.await` | Thread starvation, potential deadlock |
| C2 | 🔴 Critical | `middleware/mod.rs` | Auth cache never cleaned up | Memory leak (OOM) |
| C3 | 🔴 Critical | `middleware/mod.rs` | Argon2 in async without `spawn_blocking` | Thread starvation under load |
| H1 | 🟠 High | Multiple files | `reqwest::Client::new()` per request | Connection leak, no reuse |
| H2 | 🟠 High | `delivery/mod.rs`, `email.rs` | `std::fs::read_to_string` in async | Thread blocking |
| H3 | 🟠 High | `ws/handler.rs` | Unbounded channel per WS connection | Memory pressure |
| H4 | 🟠 Medium-High | `ws/mod.rs` | Broadcast overflow silently drops events | Silent event loss |
| H5 | 🟠 High | `middleware/mod.rs` | Poisoned mutex `.unwrap()` panics | Server crash propagation |
| M1 | 🟡 Medium | `main.rs` | Background task panics silently lost | Jobs silently stop |
| M2 | 🟡 Medium | `worker/main.rs` | 50 concurrent tasks vs 10 DB connections | Connection pool bottleneck |
| M3 | 🟡 Medium | `worker/main.rs` | PgListener reconnect no backoff | Notification gaps |
| M4 | 🟡 Medium | `notifications/mod.rs` | Unbounded FCM spawns | Connection storms |
| M5 | 🟡 Low | `worker/main.rs` | `record_attempt` signature | Code quality |

---

## Recommended Fix Priority

1. **Immediate (this sprint):** Fix C1, C2, C3 — These will cause production incidents under load
2. **Next sprint:** Fix H1, H3, H5 — Resource leaks and crash resilience
3. **Backlog:** Fix H2, H4, M1-M4 — Improvements for robustness

## Key Files Modified (for reference)

- `api/src/middleware/mod.rs` — C1, C2, C3, H5 (all related to AUTH_CACHE)
- `api/src/routes/oauth.rs` — H1 (reqwest::Client per request)
- `worker/src/delivery/mod.rs` — H1, H2 (blocking I/O + Client per request)
- `api/src/ws/handler.rs` — H3 (unbounded channel)
- `api/src/ws/mod.rs` — H4 (broadcast overflow)
- `api/src/notifications/mod.rs` — M4 (unbounded spawns)
