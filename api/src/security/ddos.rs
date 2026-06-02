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
}

impl DdosProtection {
    pub fn new() -> Self {
        Self {
            memory_limits: Arc::new(RwLock::new(HashMap::new())),
        }
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

    /// Redis-based rate limiting using INCR + EXPIRE
    async fn check_redis(&self, redis_url: &str, key: &str, max: usize, window_secs: u64) -> Result<RateLimitResult, ()> {
        let client = redis::Client::open(redis_url).map_err(|_| ())?;
        let mut conn = redis::aio::ConnectionManager::new(client).await.map_err(|_| ())?;

        let redis_key = format!("ddos:{}:{}", key, window_secs);
        let count: i64 = redis::cmd("INCR")
            .arg(&redis_key)
            .query_async(&mut conn)
            .await
            .map_err(|_| ())?;

        if count == 1 {
            // First request in window — set expiry
            let _: () = redis::cmd("EXPIRE")
                .arg(&redis_key)
                .arg(window_secs)
                .query_async(&mut conn)
                .await
                .map_err(|_| ())?;
        }

        if count as usize > max {
            // Get TTL for retry-after
            let ttl: i64 = redis::cmd("TTL")
                .arg(&redis_key)
                .query_async(&mut conn)
                .await
                .unwrap_or(window_secs as i64);

            Ok(RateLimitResult {
                allowed: false,
                remaining: 0,
                retry_after: Some(Duration::from_secs(ttl.max(1) as u64)),
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
