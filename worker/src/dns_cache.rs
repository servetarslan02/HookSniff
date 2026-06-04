//! Avoids repeated DNS lookups for the same endpoint host.
//! Each entry caches the resolved IP with a configurable TTL (default 5 min).
//! Evicts oldest entry when cache is full.

use std::collections::HashMap;
use std::net::IpAddr;
use std::time::{Duration, Instant};

pub struct DnsCache {
    entries: HashMap<String, CacheEntry>,
    ttl: Duration,
    max_entries: usize,
}

struct CacheEntry {
    ip: IpAddr,
    cached_at: Instant,
}

impl DnsCache {
    pub fn new(ttl: Duration, max_entries: usize) -> Self {
        Self {
            entries: HashMap::new(),
            ttl,
            max_entries,
        }
    }

    pub fn get(&self, host: &str) -> Option<IpAddr> {
        self.entries.get(host).and_then(|entry| {
            if entry.cached_at.elapsed() < self.ttl {
                Some(entry.ip)
            } else {
                None
            }
        })
    }

    pub fn insert(&mut self, host: String, ip: IpAddr) {
        if self.entries.len() >= self.max_entries {
            self.evict_oldest();
        }
        self.entries.insert(
            host,
            CacheEntry {
                ip,
                cached_at: Instant::now(),
            },
        );
    }

    fn evict_oldest(&mut self) {
        if let Some(oldest_key) = self
            .entries
            .iter()
            .min_by_key(|(_, e)| e.cached_at)
            .map(|(k, _)| k.clone())
        {
            self.entries.remove(&oldest_key);
        }
    }

    /// Remove expired entries. Call periodically.
    pub fn cleanup(&mut self) {
        self.entries.retain(|_, e| e.cached_at.elapsed() < self.ttl);
    }

    #[allow(dead_code)]
    pub fn len(&self) -> usize {
        self.entries.len()
    }

    #[allow(dead_code)]
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::Ipv4Addr;

    #[test]
    fn test_cache_hit() {
        let mut cache = DnsCache::new(Duration::from_secs(300), 1000);
        cache.insert("example.com".into(), IpAddr::V4(Ipv4Addr::new(1, 2, 3, 4)));
        assert_eq!(cache.get("example.com"), Some(IpAddr::V4(Ipv4Addr::new(1, 2, 3, 4))));
    }

    #[test]
    fn test_cache_miss() {
        let cache = DnsCache::new(Duration::from_secs(300), 1000);
        assert_eq!(cache.get("example.com"), None);
    }

    #[test]
    fn test_eviction() {
        let mut cache = DnsCache::new(Duration::from_secs(300), 2);
        cache.insert("a.com".into(), IpAddr::V4(Ipv4Addr::new(1, 1, 1, 1)));
        cache.insert("b.com".into(), IpAddr::V4(Ipv4Addr::new(2, 2, 2, 2)));
        cache.insert("c.com".into(), IpAddr::V4(Ipv4Addr::new(3, 3, 3, 3)));
        assert_eq!(cache.len(), 2);
        assert!(cache.get("a.com").is_none()); // evicted
    }
}
