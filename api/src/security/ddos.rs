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

/// Multi-layer DDoS protection with Redis backing
pub struct DdosProtection {
    /// In-memory fallback for when Redis is unavailable
    memory_limits: Arc<RwLock<HashMap<String, Vec<Instant>>>>,
    /// Shared Redis connection (lazy-initialized once)
    redis_conn: Arc<RwLock<Option<redis::aio::ConnectionManager>>>,
}

impl DdosProtection {
    pub fn new() -> Self {
        Self {
            memory_limits: Arc::new(RwLock::new(HashMap::new())),
            redis_conn: Arc::new(RwLock::new(None)),
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

    /// Check IP rate limit (1000 req/min) — uses Redis if available, memory fallback
    pub async fn check_ip(&self, ip: &str) -> RateLimitResult {
        self.check_rate_limit(ip, 1000, 60).await
    }

    /// Check global rate limit (10000 req/min)
    pub async fn check_global(&self) -> RateLimitResult {
        self.check_rate_limit("global", 10000, 60).await
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
