//! Signing secret in-memory cache with TTL.
//!
//! Avoids a DB query on every webhook delivery by caching
//! endpoint signing secrets in memory with a configurable TTL (default 5 min).
//!
//! Used by the Redis Streams consumer path where we don't have the
//! batch-fetch optimization that the PG `process_pending` path uses.

use std::collections::HashMap;
use std::time::{Duration, Instant};

/// In-memory signing secret cache.
///
/// Thread-safe via `tokio::sync::Mutex` — safe to share across tasks.
pub struct SecretCache {
    entries: HashMap<String, (String, Instant)>,
    ttl: Duration,
}

impl SecretCache {
    /// Create a new cache with the given TTL.
    pub fn new(ttl: Duration) -> Self {
        Self {
            entries: HashMap::new(),
            ttl,
        }
    }

    /// Get a cached signing secret, or `None` if missing/expired.
    pub fn get(&self, endpoint_id: &str) -> Option<&str> {
        self.entries.get(endpoint_id).and_then(|(secret, cached_at)| {
            if cached_at.elapsed() < self.ttl {
                Some(secret.as_str())
            } else {
                None
            }
        })
    }

    /// Insert or update a signing secret.
    pub fn insert(&mut self, endpoint_id: String, secret: String) {
        self.entries.insert(endpoint_id, (secret, Instant::now()));
    }

    /// Remove expired entries. Call periodically (e.g. every 5 min).
    pub fn cleanup(&mut self) {
        self.entries
            .retain(|_, (_, cached_at)| cached_at.elapsed() < self.ttl);
    }

    /// Number of entries in the cache (including expired ones).
    #[allow(dead_code)]
    pub fn len(&self) -> usize {
        self.entries.len()
    }

    /// Whether the cache is empty.
    #[allow(dead_code)]
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;

    #[test]
    fn test_cache_hit() {
        let mut cache = SecretCache::new(Duration::from_secs(300));
        cache.insert("ep-1".into(), "secret123".into());
        assert_eq!(cache.get("ep-1"), Some("secret123"));
    }

    #[test]
    fn test_cache_miss() {
        let cache = SecretCache::new(Duration::from_secs(300));
        assert_eq!(cache.get("ep-1"), None);
    }

    #[test]
    fn test_cache_update() {
        let mut cache = SecretCache::new(Duration::from_secs(300));
        cache.insert("ep-1".into(), "old".into());
        cache.insert("ep-1".into(), "new".into());
        assert_eq!(cache.get("ep-1"), Some("new"));
    }

    #[test]
    fn test_cleanup_preserves_valid() {
        let mut cache = SecretCache::new(Duration::from_secs(300));
        cache.insert("ep-1".into(), "secret".into());
        cache.cleanup();
        assert_eq!(cache.get("ep-1"), Some("secret"));
    }
}
