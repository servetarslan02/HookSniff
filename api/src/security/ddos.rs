//! DDoS Protection — Multi-Layer Rate Limiting
//!
//! Uses Upstash Redis for distributed rate limiting across instances.
//! Falls back to in-memory if Redis unavailable.

use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

/// Rate limiter result
pub struct RateLimitResult {
    pub allowed: bool,
    pub remaining: u64,
    pub retry_after: Option<Duration>,
}

/// Multi-layer DDoS protection with Redis backing and adaptive thresholds
pub struct DdosProtection {
    /// In-memory fallback for when Redis is unavailable
    memory_limits: Arc<RwLock<HashMap<String, Vec<Instant>>>>,
    /// Shared Redis connection (lazy-initialized once)
    redis_conn: Arc<RwLock<Option<redis::aio::ConnectionManager>>>,
    /// Adaptive baseline: EWMA of requests per minute
    baseline_rpm: Arc<RwLock<f64>>,
    /// Adaptive multiplier: how many times above baseline triggers block
    adaptive_multiplier: Arc<RwLock<f64>>,
    /// Last baseline update
    last_baseline_update: Arc<RwLock<Instant>>,
}

impl DdosProtection {
    pub fn new() -> Self {
        Self {
            memory_limits: Arc::new(RwLock::new(HashMap::new())),
            redis_conn: Arc::new(RwLock::new(None)),
            baseline_rpm: Arc::new(RwLock::new(1000.0)),  // Start with 1000 RPM baseline
            adaptive_multiplier: Arc::new(RwLock::new(3.0)),  // 3x baseline = block
            last_baseline_update: Arc::new(RwLock::new(Instant::now())),
        }
    }

    /// Get or create shared Redis connection
    async fn get_redis_conn(&self, redis_url: &str) -> Option<redis::aio::ConnectionManager> {
        // Check if we already have a connection
        {
            let conn = self.redis_conn.read().await;
            if conn.is_some() {
                return conn.clone();
            }
        }
        // Create new connection (only happens once)
        let client = redis::Client::open(redis_url).ok()?;
        let conn = redis::aio::ConnectionManager::new(client).await.ok()?;
        *self.redis_conn.write().await = Some(conn.clone());
        Some(conn)
    }

    /// Check IP rate limit — adaptive: uses baseline * multiplier
    pub async fn check_ip(&self, ip: &str) -> RateLimitResult {
        let baseline = *self.baseline_rpm.read().await;
        let multiplier = *self.adaptive_multiplier.read().await;
        let adaptive_limit = (baseline * multiplier) as usize;
        // Minimum 500, maximum 5000 — prevents too low or too high limits
        let limit = adaptive_limit.clamp(500, 5000);
        self.check_rate_limit(ip, limit, 60).await
    }

    /// Check global rate limit — adaptive: 10x the per-IP limit
    pub async fn check_global(&self) -> RateLimitResult {
        let baseline = *self.baseline_rpm.read().await;
        let global_limit = (baseline * 10.0) as usize;
        let limit = global_limit.clamp(5000, 50000);
        self.check_rate_limit("global", limit, 60).await
    }

    /// Update baseline using EWMA (called periodically by Cortex scheduler)
    pub async fn update_baseline(&self, current_rpm: f64) {
        let mut baseline = self.baseline_rpm.write().await;
        let alpha = 0.1; // Slow adaptation — 90% old, 10% new
        *baseline = alpha * current_rpm + (1.0 - alpha) * *baseline;
        // Floor at 100 to prevent zero baseline
        if *baseline < 100.0 { *baseline = 100.0; }
        *self.last_baseline_update.write().await = Instant::now();
    }

    /// Get current adaptive limit for monitoring
    pub async fn get_adaptive_limit(&self) -> usize {
        let baseline = *self.baseline_rpm.read().await;
        let multiplier = *self.adaptive_multiplier.read().await;
        (baseline * multiplier).clamp(500.0, 5000.0) as usize
    }

    /// Generic rate limit check
    async fn check_rate_limit(&self, key: &str, max: usize, window_secs: u64) -> RateLimitResult {
        // Try Redis first
        if let Some(redis_url) = crate::config::resolve_redis_url() {
            if let Ok(result) = self.check_redis(&redis_url, key, max, window_secs).await {
                return result;
            }
        }
        // Fallback to in-memory
        self.check_memory(key, max, window_secs).await
    }

    /// Redis-based rate limiting — atomic Lua script (INCR + EXPIRE in one call, no race)
    async fn check_redis(&self, redis_url: &str, key: &str, max: usize, window_secs: u64) -> Result<RateLimitResult, ()> {
        let mut conn = match self.get_redis_conn(redis_url).await {
            Some(c) => c,
            None => return Err(()),
        };

        let redis_key = format!("ddos:{}:{}", key, window_secs);

        // Atomic Lua script: INCR + conditional EXPIRE (no race condition)
        let lua = redis::Script::new(
            r#"
            local current = redis.call('INCR', KEYS[1])
            if current == 1 then
                redis.call('EXPIRE', KEYS[1], ARGV[1])
            end
            local ttl = redis.call('TTL', KEYS[1])
            return {current, ttl}
            "#,
        );

        let result: Vec<i64> = lua
            .key(&redis_key)
            .arg(window_secs as i64)
            .invoke_async(&mut conn)
            .await
            .map_err(|_| ())?;

        let count = result[0];
        let ttl = result[1].max(1) as u64;

        if count as usize > max {
            Ok(RateLimitResult {
                allowed: false,
                remaining: 0,
                retry_after: Some(Duration::from_secs(ttl)),
            })
        } else {
            Ok(RateLimitResult {
                allowed: true,
                remaining: (max as i64 - count).max(0) as u64,
                retry_after: None,
            })
        }
    }

    /// In-memory fallback rate limiting
    async fn check_memory(&self, key: &str, max: usize, window_secs: u64) -> RateLimitResult {
        let mut limits = self.memory_limits.write().await;
        let entry = limits.entry(key.to_string()).or_insert_with(Vec::new);
        let cutoff = Instant::now() - Duration::from_secs(window_secs);
        entry.retain(|t| *t > cutoff);

        if entry.len() >= max {
            RateLimitResult {
                allowed: false,
                remaining: 0,
                retry_after: Some(Duration::from_secs(window_secs)),
            }
        } else {
            entry.push(Instant::now());
            RateLimitResult {
                allowed: true,
                remaining: (max - entry.len()) as u64,
                retry_after: None,
            }
        }
    }

    /// Periodic cleanup of stale in-memory entries
    pub async fn cleanup(&self) {
        let cutoff = Instant::now() - Duration::from_secs(300);
        self.memory_limits.write().await.retain(|_, entries| {
            entries.retain(|t| *t > cutoff);
            !entries.is_empty()
        });
    }
}
