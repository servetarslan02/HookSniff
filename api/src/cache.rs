use redis::aio::ConnectionManager;
use serde::{de::DeserializeOwned, Serialize};
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::Duration;

// ──────────────────────────────────────────────────────────────
// Cache statistics — lightweight atomic counters
// ──────────────────────────────────────────────────────────────

static CACHE_HITS: AtomicU64 = AtomicU64::new(0);
static CACHE_MISSES: AtomicU64 = AtomicU64::new(0);

/// Get cache hit/miss statistics. Returns (hits, misses).
pub fn cache_stats() -> (u64, u64) {
    (
        CACHE_HITS.load(Ordering::Relaxed),
        CACHE_MISSES.load(Ordering::Relaxed),
    )
}

/// Cache hit rate as a percentage (0.0 - 100.0).
pub fn cache_hit_rate() -> f64 {
    let (hits, misses) = cache_stats();
    let total = hits + misses;
    if total == 0 {
        return 0.0;
    }
    (hits as f64 / total as f64) * 100.0
}

// ──────────────────────────────────────────────────────────────
// Cache key format: hooksniff:{resource}:{id}
// ──────────────────────────────────────────────────────────────

fn cache_key(resource: &str, id: &str) -> String {
    format!("hooksniff:{resource}:{id}")
}

// ──────────────────────────────────────────────────────────────
// Default TTLs for different resource types
// ──────────────────────────────────────────────────────────────

/// Endpoint metadata TTL: 5 minutes
pub const ENDPOINT_TTL: Duration = Duration::from_secs(300);

/// Customer plan TTL: 1 minute
pub const PLAN_TTL: Duration = Duration::from_secs(60);

/// API key validation TTL: 30 seconds
pub const API_KEY_TTL: Duration = Duration::from_secs(30);

// ──────────────────────────────────────────────────────────────
// CacheLayer — generic Redis caching layer
// ──────────────────────────────────────────────────────────────

#[derive(Clone)]
pub struct CacheLayer {
    conn: ConnectionManager,
    default_ttl: Duration,
}

impl CacheLayer {
    /// Create a new cache layer connected to the given Redis URL.
    /// `default_ttl` is used when no explicit TTL is provided to `set`.
    pub async fn new(redis_url: &str, default_ttl: Duration) -> Result<Self, redis::RedisError> {
        let client = redis::Client::open(redis_url)?;
        let conn = ConnectionManager::new(client).await?;
        tracing::info!("✅ Redis cache layer connected");
        Ok(Self { conn, default_ttl })
    }

    /// Get a cached value by resource and id.
    /// Returns `None` on cache miss or deserialization failure.
    pub async fn get<T: DeserializeOwned>(
        &self,
        resource: &str,
        id: &str,
    ) -> Option<T> {
        let key = cache_key(resource, id);
        let mut conn = self.conn.clone();
        let result: Option<String> = redis::cmd("GET")
            .arg(&key)
            .query_async(&mut conn)
            .await
            .unwrap_or(None);

        match result {
            Some(s) => match serde_json::from_str::<T>(&s) {
                Ok(val) => {
                    CACHE_HITS.fetch_add(1, Ordering::Relaxed);
                    Some(val)
                }
                Err(e) => {
                    CACHE_MISSES.fetch_add(1, Ordering::Relaxed);
                    tracing::warn!("Cache deserialization failed for key {key}: {e}");
                    None
                }
            },
            None => {
                CACHE_MISSES.fetch_add(1, Ordering::Relaxed);
                None
            }
        }
    }

    /// Set a cached value with the default TTL.
    pub async fn set<T: Serialize + Send>(
        &self,
        resource: &str,
        id: &str,
        value: &T,
    ) {
        self.set_with_ttl(resource, id, value, self.default_ttl).await;
    }

    /// Set a cached value with an explicit TTL.
    pub async fn set_with_ttl<T: Serialize + Send>(
        &self,
        resource: &str,
        id: &str,
        value: &T,
        ttl: Duration,
    ) {
        let key = cache_key(resource, id);
        let mut conn = self.conn.clone();
        let json = match serde_json::to_string(value) {
            Ok(j) => j,
            Err(e) => {
                tracing::warn!("Cache serialization failed for key {key}: {e}");
                return;
            }
        };
        let _: Result<(), _> = redis::cmd("SETEX")
            .arg(&key)
            .arg(ttl.as_secs())
            .arg(&json)
            .query_async(&mut conn)
            .await
            .map_err(|e| tracing::warn!("Cache SET failed for key {key}: {e}"));
    }

    /// Invalidate (delete) a specific cache entry.
    pub async fn invalidate(&self, resource: &str, id: &str) {
        let key = cache_key(resource, id);
        let mut conn = self.conn.clone();
        let _: Result<i32, _> = redis::cmd("DEL")
            .arg(&key)
            .query_async(&mut conn)
            .await
            .map_err(|e| tracing::warn!("Cache DEL failed for key {key}: {e}"));
    }

    /// Invalidate all cache entries matching a pattern.
    /// Uses SCAN to avoid blocking the server (unlike KEYS).
    ///
    /// Pattern example: `hooksniff:endpoint:*` invalidates all endpoint caches.
    pub async fn invalidate_pattern(&self, pattern: &str) {
        let mut conn = self.conn.clone();
        let mut cursor: u64 = 0;
        let mut total_deleted: u64 = 0;

        loop {
            let scan_result: Result<(u64, Vec<String>), _> = redis::cmd("SCAN")
                .arg(cursor)
                .arg("MATCH")
                .arg(pattern)
                .arg("COUNT")
                .arg(100)
                .query_async(&mut conn)
                .await;

            match scan_result {
                Ok((next_cursor, keys)) => {
                    cursor = next_cursor;
                    if !keys.is_empty() {
                        let _: Result<(), _> = redis::cmd("DEL")
                            .arg(&keys)
                            .query_async(&mut conn)
                            .await
                            .map_err(|e| tracing::warn!("Cache batch DEL failed: {e}"));
                        total_deleted += keys.len() as u64;
                    }
                    if cursor == 0 {
                        break;
                    }
                }
                Err(e) => {
                    tracing::warn!("Cache SCAN failed for pattern {pattern}: {e}");
                    break;
                }
            }
        }

        if total_deleted > 0 {
            tracing::info!("Cache: invalidated {total_deleted} keys matching {pattern}");
        }
    }

    /// Get the underlying Redis connection manager (for advanced usage).
    pub fn conn(&self) -> &ConnectionManager {
        &self.conn
    }
}

// ──────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cache_key_format() {
        assert_eq!(cache_key("endpoint", "ep_123"), "hooksniff:endpoint:ep_123");
        assert_eq!(cache_key("plan", "cust_456"), "hooksniff:plan:cust_456");
        assert_eq!(cache_key("apikey", "sk_abc"), "hooksniff:apikey:sk_abc");
    }

    #[test]
    fn default_ttl_values() {
        assert_eq!(ENDPOINT_TTL, Duration::from_secs(300));
        assert_eq!(PLAN_TTL, Duration::from_secs(60));
        assert_eq!(API_KEY_TTL, Duration::from_secs(30));
    }
}
