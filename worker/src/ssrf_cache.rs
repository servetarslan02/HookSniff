//! Caches SSRF validation results to avoid repeated DNS resolution
//! and IP validation for the same endpoint host.
//!
//! When a webhook URL is validated once (allowed/blocked), the result
//! is cached for 5 minutes. Subsequent deliveries to the same host
//! skip the expensive SSRF check.

use std::collections::HashMap;
use std::time::{Duration, Instant};

pub struct SsrfCache {
    entries: HashMap<String, SsrfEntry>,
    ttl: Duration,
}

struct SsrfEntry {
    allowed: bool,
    cached_at: Instant,
}

impl SsrfCache {
    pub fn new(ttl: Duration) -> Self {
        Self {
            entries: HashMap::new(),
            ttl,
        }
    }

    /// Check if a URL's host has a cached SSRF result.
    /// Returns `Some(allowed)` if cached and not expired, `None` if miss.
    pub fn is_allowed(&self, url: &str) -> Option<bool> {
        let host = extract_host(url)?;
        self.entries.get(host).and_then(|entry| {
            if entry.cached_at.elapsed() < self.ttl {
                Some(entry.allowed)
            } else {
                None
            }
        })
    }

    /// Record an SSRF check result for a URL's host.
    pub fn record_result(&mut self, url: &str, allowed: bool) {
        if let Some(host) = extract_host(url) {
            self.entries.insert(
                host.to_string(),
                SsrfEntry {
                    allowed,
                    cached_at: Instant::now(),
                },
            );
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
}

/// Extract hostname from a URL string.
fn extract_host(url: &str) -> Option<&str> {
    let url = url.trim();
    let without_scheme = url
        .strip_prefix("https://")
        .or_else(|| url.strip_prefix("http://"))?;
    let host = without_scheme.split('/').next()?;
    let host = host.split(':').next()?; // strip port
    if host.is_empty() {
        None
    } else {
        Some(host)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cache_hit() {
        let mut cache = SsrfCache::new(Duration::from_secs(300));
        cache.record_result("https://example.com/webhook", true);
        assert_eq!(cache.is_allowed("https://example.com/other"), Some(true));
    }

    #[test]
    fn test_cache_miss() {
        let cache = SsrfCache::new(Duration::from_secs(300));
        assert_eq!(cache.is_allowed("https://example.com/webhook"), None);
    }

    #[test]
    fn test_blocked_url() {
        let mut cache = SsrfCache::new(Duration::from_secs(300));
        cache.record_result("http://169.254.169.254/latest/meta-data", false);
        assert_eq!(
            cache.is_allowed("http://169.254.169.254/other"),
            Some(false)
        );
    }

    #[test]
    fn test_extract_host() {
        assert_eq!(extract_host("https://example.com/path"), Some("example.com"));
        assert_eq!(extract_host("http://host.com:8080/"), Some("host.com"));
        assert_eq!(extract_host("invalid"), None);
    }
}
