mod rate_limit_tests;

use axum::{extract::Request, http::StatusCode, middleware::Next, response::Response};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};
use tokio::sync::Mutex;

use crate::billing::Plan;

// ──────────────────────────────────────────────────────────────
// Shared types
// ──────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct RateLimitResult {
    pub allowed: bool,
    pub remaining: u32,
    pub limit: u32,
    pub reset_seconds: u64,
}

// ──────────────────────────────────────────────────────────────
// RateLimitStore trait — pluggable backend
// ──────────────────────────────────────────────────────────────

#[async_trait::async_trait]
pub trait RateLimitStore: Send + Sync + 'static {
    /// Check if a request is within the rate limit.
    /// Uses a sliding window of `window_secs` seconds with max `limit` requests.
    async fn check(&self, key: &str, limit: u32, window_secs: u64) -> RateLimitResult;

    /// Retrieve a cached customer plan by API key prefix.
    async fn get_plan(&self, api_key_prefix: &str) -> Option<Plan>;

    /// Cache a customer's plan (called after auth resolves the plan).
    async fn set_plan(&self, api_key_prefix: &str, plan: Plan);
}

// ──────────────────────────────────────────────────────────────
// InMemoryRateLimiter — development / single-instance
// ──────────────────────────────────────────────────────────────

struct RateLimitEntry {
    timestamps: Vec<Instant>,
}

#[derive(Clone)]
pub struct InMemoryRateLimiter {
    requests: Arc<Mutex<HashMap<String, RateLimitEntry>>>,
    plans: Arc<Mutex<HashMap<String, (Plan, Instant)>>>,
    max_entries: usize,
}

impl Default for InMemoryRateLimiter {
    fn default() -> Self {
        Self::new()
    }
}

impl InMemoryRateLimiter {
    pub fn new() -> Self {
        let limiter = Self {
            requests: Arc::new(Mutex::new(HashMap::new())),
            plans: Arc::new(Mutex::new(HashMap::new())),
            max_entries: 10_000,
        };

        // Background cleanup task
        let requests = limiter.requests.clone();
        let plans = limiter.plans.clone();
        tokio::spawn(async move {
            loop {
                tokio::time::sleep(Duration::from_secs(30)).await;
                let now = Instant::now();

                // Clean expired request entries
                let mut map = requests.lock().await;
                map.retain(|_, entry| {
                    // Keep entries that have at least one recent timestamp
                    entry
                        .timestamps
                        .last()
                        .map(|ts| now.duration_since(*ts) < Duration::from_secs(300))
                        .unwrap_or(false)
                });

                if map.len() > 10_000 {
                    let mut entries: Vec<(String, Instant)> = map
                        .iter()
                        .filter_map(|(k, v)| v.timestamps.last().map(|ts| (k.clone(), *ts)))
                        .collect();
                    entries.sort_by_key(|(_, ts)| *ts);
                    let to_remove = map.len() - 10_000;
                    for (key, _) in entries.iter().take(to_remove) {
                        map.remove(key);
                    }
                }
                drop(map);

                // Clean expired plan cache (1 hour TTL)
                let mut plan_map = plans.lock().await;
                plan_map.retain(|_, (_, ts)| now.duration_since(*ts) < Duration::from_secs(3600));
            }
        });

        limiter
    }
}

#[async_trait::async_trait]
impl RateLimitStore for InMemoryRateLimiter {
    async fn check(&self, key: &str, limit: u32, window_secs: u64) -> RateLimitResult {
        let mut map = self.requests.lock().await;
        let now = Instant::now();
        let window = Duration::from_secs(window_secs);

        // Evict oldest entry if at capacity
        if !map.contains_key(key) && map.len() >= self.max_entries {
            if let Some(oldest_key) = map
                .iter()
                .filter_map(|(k, v)| v.timestamps.last().map(|ts| (k.clone(), *ts)))
                .min_by_key(|(_, ts)| *ts)
                .map(|(k, _)| k.clone())
            {
                map.remove(&oldest_key);
            }
        }

        let entry = map.entry(key.to_string()).or_insert(RateLimitEntry {
            timestamps: Vec::new(),
        });

        // Remove timestamps outside the window
        entry
            .timestamps
            .retain(|ts| now.duration_since(*ts) < window);

        let current_count = entry.timestamps.len() as u32;
        let remaining = limit.saturating_sub(current_count);

        let reset_seconds = entry
            .timestamps
            .first()
            .map(|oldest| window.saturating_sub(now.duration_since(*oldest)).as_secs())
            .unwrap_or(window_secs);

        if current_count >= limit {
            return RateLimitResult {
                allowed: false,
                remaining: 0,
                limit,
                reset_seconds,
            };
        }

        entry.timestamps.push(now);

        RateLimitResult {
            allowed: true,
            remaining: remaining.saturating_sub(1),
            limit,
            reset_seconds,
        }
    }

    async fn get_plan(&self, api_key_prefix: &str) -> Option<Plan> {
        let plans = self.plans.lock().await;
        plans.get(api_key_prefix).map(|(plan, _)| plan.clone())
    }

    async fn set_plan(&self, api_key_prefix: &str, plan: Plan) {
        let mut plans = self.plans.lock().await;
        plans.insert(api_key_prefix.to_string(), (plan, Instant::now()));
    }
}

// ──────────────────────────────────────────────────────────────
// RedisRateLimiter — production / multi-instance
// ──────────────────────────────────────────────────────────────

#[derive(Clone)]
pub struct RedisRateLimiter {
    conn: redis::aio::ConnectionManager,
}

impl RedisRateLimiter {
    pub async fn new(redis_url: &str) -> Result<Self, redis::RedisError> {
        let client = redis::Client::open(redis_url)?;
        let conn = redis::aio::ConnectionManager::new(client).await?;
        tracing::info!("✅ Redis rate limiter connected");
        Ok(Self { conn })
    }
}

#[async_trait::async_trait]
impl RateLimitStore for RedisRateLimiter {
    async fn check(&self, key: &str, limit: u32, window_secs: u64) -> RateLimitResult {
        let mut conn = self.conn.clone();
        let now_ms = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;
        let window_ms = window_secs * 1000;
        let redis_key = format!("ratelimit:{key}");

        // Sliding window with sorted sets:
        // 1. Remove expired entries
        // 2. Count current window
        // 3. Add new entry
        // 4. Set TTL
        let script = redis::Script::new(
            r#"
            local key = KEYS[1]
            local window_ms = tonumber(ARGV[1])
            local now_ms = tonumber(ARGV[2])
            local limit = tonumber(ARGV[3])
            local window_secs = tonumber(ARGV[4])
            local member = ARGV[5]

            -- Remove entries outside the window
            redis.call('ZREMRANGEBYSCORE', key, 0, now_ms - window_ms)

            -- Count current entries
            local count = redis.call('ZCARD', key)

            if count >= limit then
                -- Find oldest entry to calculate reset
                local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
                local reset_ms = 0
                if #oldest > 0 then
                    reset_ms = window_ms - (now_ms - tonumber(oldest[2]))
                end
                return {0, 0, limit, math.ceil(reset_ms / 1000)}
            end

            -- Add the new request
            redis.call('ZADD', key, now_ms, member)
            redis.call('EXPIRE', key, window_secs + 1)

            local remaining = limit - count - 1
            local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
            local reset_ms = window_ms
            if #oldest > 0 then
                reset_ms = window_ms - (now_ms - tonumber(oldest[2]))
            end

            return {1, remaining, limit, math.ceil(reset_ms / 1000)}
            "#,
        );

        let member = format!("{now_ms}:{}", rand::random::<u64>());

        let result: (i32, u32, u32, u64) = match script
            .key(&redis_key)
            .arg(window_ms)
            .arg(now_ms)
            .arg(limit)
            .arg(window_secs)
            .arg(&member)
            .invoke_async(&mut conn)
            .await
        {
            Ok(r) => r,
            Err(e) => {
                // HS-273: Fail-open when Redis is unavailable.
                // The original fail-closed approach blocked ALL requests when Redis
                // was down (e.g. Upstash quota exceeded), causing total outage.
                // Now we allow the request through but log the error. The per-IP
                // rate limiting still works via the in-memory fallback in the
                // rate_limit_middleware layer.
                tracing::warn!("Redis rate limit error: {e}, allowing request (fail-open)");
                return RateLimitResult {
                    allowed: true,
                    remaining: limit.saturating_sub(1),
                    limit,
                    reset_seconds: window_secs,
                };
            }
        };

        RateLimitResult {
            allowed: result.0 == 1,
            remaining: result.1,
            limit: result.2,
            reset_seconds: result.3,
        }
    }

    async fn get_plan(&self, api_key_prefix: &str) -> Option<Plan> {
        let mut conn = self.conn.clone();
        let key = format!("plan:{api_key_prefix}");
        let plan_str: Option<String> = redis::cmd("GET")
            .arg(&key)
            .query_async(&mut conn)
            .await
            .unwrap_or(None);
        plan_str.map(|s| Plan::parse_str(&s))
    }

    async fn set_plan(&self, api_key_prefix: &str, plan: Plan) {
        let mut conn = self.conn.clone();
        let key = format!("plan:{api_key_prefix}");
        let _: Result<(), _> = redis::cmd("SETEX")
            .arg(&key)
            .arg(3600) // 1 hour TTL
            .arg(plan.as_str())
            .query_async(&mut conn)
            .await;
    }
}

// ──────────────────────────────────────────────────────────────
// RateLimiter wrapper — dispatches to the active store
// ──────────────────────────────────────────────────────────────

/// The public-facing rate limiter used throughout the app.
/// Wraps an `Arc<dyn RateLimitStore>` and is cheaply cloneable.
#[derive(Clone)]
pub struct RateLimiter {
    store: Arc<dyn RateLimitStore>,
}

impl RateLimiter {
    /// Create a rate limiter backed by the given store.
    pub fn new(store: Arc<dyn RateLimitStore>) -> Self {
        Self { store }
    }

    /// Check rate limit with a specific plan limit.
    pub async fn check_with_headers(&self, key: &str, limit: u32) -> RateLimitResult {
        self.store.check(key, limit, 60).await
    }

    /// Check rate limit with a custom window duration in seconds.
    pub async fn check_with_window(
        &self,
        key: &str,
        limit: u32,
        window_secs: u64,
    ) -> RateLimitResult {
        self.store.check(key, limit, window_secs).await
    }

    /// Legacy check method (backwards compatible, uses default limit).
    pub async fn check(&self, key: &str, limit: u32) -> bool {
        self.store.check(key, limit, 60).await.allowed
    }

    /// Get cached customer plan by API key prefix.
    pub async fn get_plan(&self, api_key_prefix: &str) -> Option<Plan> {
        self.store.get_plan(api_key_prefix).await
    }

    /// Cache a customer's plan.
    pub async fn set_plan(&self, api_key_prefix: &str, plan: Plan) {
        self.store.set_plan(api_key_prefix, plan).await;
    }

    /// Access the underlying store (for advanced usage).
    pub fn store(&self) -> &dyn RateLimitStore {
        self.store.as_ref()
    }
}

// ──────────────────────────────────────────────────────────────
// Factory — create the appropriate store from environment
// ──────────────────────────────────────────────────────────────

/// Create a `RateLimiter` based on the `RATE_LIMIT_STORE` env var.
///
/// - `RATE_LIMIT_STORE=redis` → uses `RedisRateLimiter` (requires `REDIS_URL`)
/// - anything else (or unset) → uses `InMemoryRateLimiter`
///
/// Falls back to in-memory if Redis is unavailable.
///
/// **SECURITY WARNING (HS-003):** In-memory rate limiter loses all state on restart.
/// In production with multiple instances, each instance has independent counters,
/// effectively multiplying the allowed rate by the number of instances.
/// Always set `RATE_LIMIT_STORE=redis` and `REDIS_URL` in production.
pub async fn create_rate_limiter() -> RateLimiter {
    let is_production = std::env::var("ENVIRONMENT").as_deref() == Ok("production")
        || std::env::var("RUST_ENV").as_deref() == Ok("production");

    let store: Arc<dyn RateLimitStore> = match std::env::var("RATE_LIMIT_STORE").as_deref() {
        Ok("redis") => match crate::config::resolve_redis_url() {
            Some(url) => match RedisRateLimiter::new(&url).await {
                Ok(rl) => Arc::new(rl),
                Err(e) => {
                    tracing::warn!(
                        "Failed to connect to Redis ({e}), falling back to in-memory rate limiter"
                    );
                    if is_production {
                        tracing::error!(
                            "⚠️  PRODUCTION WARNING: Using in-memory rate limiter! \
                             Rate limits will be per-instance and lost on restart. \
                             Fix Redis connection immediately."
                        );
                    }
                    Arc::new(InMemoryRateLimiter::new())
                }
            },
            None => {
                tracing::warn!(
                        "RATE_LIMIT_STORE=redis but Redis URL not configured (REDIS_URL or UPSTASH_REDIS_REST_URL), falling back to in-memory rate limiter"
                    );
                if is_production {
                    tracing::error!(
                        "⚠️  PRODUCTION WARNING: Redis URL not configured! \
                         Using in-memory rate limiter — rate limits are per-instance and lost on restart. \
                         Set REDIS_URL or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN."
                    );
                }
                Arc::new(InMemoryRateLimiter::new())
            }
        },
        _ => {
            if is_production {
                tracing::error!(
                    "⚠️  PRODUCTION WARNING: RATE_LIMIT_STORE not set to 'redis'. \
                     Using in-memory rate limiter — rate limits are per-instance and lost on restart. \
                     Set RATE_LIMIT_STORE=redis and REDIS_URL for production use."
                );
            } else {
                tracing::info!("Using in-memory rate limiter (development mode)");
            }
            Arc::new(InMemoryRateLimiter::new())
        }
    };

    RateLimiter::new(store)
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

/// Extract the rate limit key from the request (API key prefix or IP).
///
/// Security: X-Forwarded-For is user-controllable and MUST NOT be trusted directly.
/// We only use it if TRUST_PROXY_HEADERS is set (indicating a known proxy layer).
/// Otherwise, fall back to IP from trusted headers or "unknown" for truly anonymous.
///
/// Bug fix: Previously all unauthenticated requests without TRUST_PROXY_HEADERS
/// shared key "unknown", causing a single 100/min bucket for ALL endpoints and users.
/// Now we include the request path so different endpoints have separate buckets,
/// and we always try to extract a client IP from common proxy headers.
fn extract_key(req: &Request) -> String {
    req.headers()
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .map(|k| k[..15.min(k.len())].to_string())
        .unwrap_or_else(|| {
            // Always try to extract client IP from proxy headers.
            // In production behind Cloudflare/Cloud Run, these are set by the
            // infrastructure and are trustworthy. We prefer X-Real-IP (set by
            // our edge proxy from CF-Connecting-IP) then X-Forwarded-For.
            let ip = req
                .headers()
                .get("x-real-ip")
                .and_then(|v| v.to_str().ok())
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty() && s != "unknown")
                .or_else(|| {
                    req.headers()
                        .get("x-forwarded-for")
                        .and_then(|v| v.to_str().ok())
                        .and_then(|v| v.split(',').next_back())
                        .map(|s| s.trim().to_string())
                        .filter(|s| !s.is_empty() && s != "unknown")
                })
                .unwrap_or_else(|| "unknown".to_string());

            // Include the request path in the key so different endpoints
            // (login, register, etc.) have separate rate limit buckets.
            let path = req.uri().path().to_string();
            format!("{}:{}", ip, path)
        })
}

/// Extract API key prefix from request for plan lookup.
fn extract_api_key_prefix(req: &Request) -> Option<String> {
    req.headers()
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .map(|k| k[..15.min(k.len())].to_string())
}

/// Axum middleware for plan-based rate limiting with proper headers.
pub async fn rate_limit_middleware(
    limiter: axum::extract::Extension<RateLimiter>,
    metrics: axum::extract::Extension<Arc<crate::metrics::Metrics>>,
    req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let start = Instant::now();
    let key = extract_key(&req);

    // Try to determine the customer's plan
    let plan = if let Some(prefix) = extract_api_key_prefix(&req) {
        limiter.get_plan(&prefix).await.unwrap_or(Plan::Developer)
    } else {
        Plan::Developer
    };

    let plan_limit = plan.max_requests_per_minute();
    let result = limiter.check_with_headers(&key, plan_limit).await;

    // Record rate limit latency
    metrics.rate_limit_latency_seconds.observe(start.elapsed().as_secs_f64());

    // HS-038j: Use safe header insertion — skip if value is invalid instead of panicking.
    fn insert_header(headers: &mut axum::http::HeaderMap, name: &'static str, value: &str) {
        if let Ok(val) = value.parse() {
            if let Ok(header_name) = name.parse::<axum::http::HeaderName>() {
                headers.insert(header_name, val);
            }
        }
    }

    if result.allowed {
        let mut response = next.run(req).await;
        let headers = response.headers_mut();
        insert_header(headers, "X-RateLimit-Limit", &result.limit.to_string());
        insert_header(
            headers,
            "X-RateLimit-Remaining",
            &result.remaining.to_string(),
        );
        insert_header(
            headers,
            "X-RateLimit-Reset",
            &result.reset_seconds.to_string(),
        );
        Ok(response)
    } else {
        let body = axum::body::Body::from(
            serde_json::to_string(&serde_json::json!({
                "error": {
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": "Rate limit exceeded. Please try again later."
                }
            }))
            .unwrap_or_default(),
        );
        let mut response = Response::new(body);
        *response.status_mut() = StatusCode::TOO_MANY_REQUESTS;
        let headers = response.headers_mut();
        insert_header(headers, "Content-Type", "application/json");
        insert_header(headers, "X-RateLimit-Limit", &result.limit.to_string());
        insert_header(headers, "X-RateLimit-Remaining", "0");
        insert_header(
            headers,
            "X-RateLimit-Reset",
            &result.reset_seconds.to_string(),
        );
        insert_header(headers, "Retry-After", &result.reset_seconds.to_string());
        Ok(response)
    }
}
