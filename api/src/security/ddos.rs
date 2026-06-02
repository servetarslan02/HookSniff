//! DDoS Protection — Multi-Layer Rate Limiting
//!
//! Provides 4-layer DDoS protection:
//! 1. IP-based rate limiting
//! 2. Endpoint-based rate limiting  
//! 3. Global rate limiting
//! 4. Behavioral analysis

use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

/// Sliding window rate limiter entry
struct RateLimitEntry {
    requests: Vec<Instant>,
}

impl RateLimitEntry {
    fn new() -> Self {
        Self { requests: Vec::new() }
    }

    /// Count requests within the window and prune old entries
    fn count_in_window(&mut self, window: Duration) -> usize {
        let cutoff = Instant::now() - window;
        self.requests.retain(|t| *t > cutoff);
        self.requests.len()
    }

    fn add_request(&mut self) {
        self.requests.push(Instant::now());
    }
}

/// Rate limiter result
pub struct RateLimitResult {
    pub allowed: bool,
    pub remaining: u64,
    pub retry_after: Option<Duration>,
}

/// Multi-layer DDoS protection
pub struct DdosProtection {
    /// Layer 1: Per-IP limits
    ip_limits: Arc<RwLock<HashMap<String, RateLimitEntry>>>,
    /// Layer 2: Per-endpoint limits
    endpoint_limits: Arc<RwLock<HashMap<String, RateLimitEntry>>>,
    /// Layer 3: Global limits
    global_limit: Arc<RwLock<RateLimitEntry>>,
    /// Layer 4: Per-customer limits
    customer_limits: Arc<RwLock<HashMap<String, RateLimitEntry>>>,
}

impl DdosProtection {
    pub fn new() -> Self {
        Self {
            ip_limits: Arc::new(RwLock::new(HashMap::new())),
            endpoint_limits: Arc::new(RwLock::new(HashMap::new())),
            global_limit: Arc::new(RwLock::new(RateLimitEntry::new())),
            customer_limits: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Check IP rate limit (1000 req/min)
    pub async fn check_ip(&self, ip: &str) -> RateLimitResult {
        let mut limits = self.ip_limits.write().await;
        let entry = limits.entry(ip.to_string()).or_insert_with(RateLimitEntry::new);
        let count = entry.count_in_window(Duration::from_secs(60));
        
        if count >= 1000 {
            RateLimitResult {
                allowed: false,
                remaining: 0,
                retry_after: Some(Duration::from_secs(60)),
            }
        } else {
            entry.add_request();
            RateLimitResult {
                allowed: true,
                remaining: (1000 - count - 1) as u64,
                retry_after: None,
            }
        }
    }

    /// Check endpoint rate limit (100 req/min per endpoint)
    pub async fn check_endpoint(&self, endpoint_id: &str) -> RateLimitResult {
        let mut limits = self.endpoint_limits.write().await;
        let entry = limits.entry(endpoint_id.to_string()).or_insert_with(RateLimitEntry::new);
        let count = entry.count_in_window(Duration::from_secs(60));
        
        if count >= 100 {
            RateLimitResult {
                allowed: false,
                remaining: 0,
                retry_after: Some(Duration::from_secs(60)),
            }
        } else {
            entry.add_request();
            RateLimitResult {
                allowed: true,
                remaining: (100 - count - 1) as u64,
                retry_after: None,
            }
        }
    }

    /// Check global rate limit (10000 req/min)
    pub async fn check_global(&self) -> RateLimitResult {
        let mut limit = self.global_limit.write().await;
        let count = limit.count_in_window(Duration::from_secs(60));
        
        if count >= 10000 {
            RateLimitResult {
                allowed: false,
                remaining: 0,
                retry_after: Some(Duration::from_secs(60)),
            }
        } else {
            limit.add_request();
            RateLimitResult {
                allowed: true,
                remaining: (10000 - count - 1) as u64,
                retry_after: None,
            }
        }
    }

    /// Check customer rate limit (plan-based)
    pub async fn check_customer(&self, customer_id: &str, limit_per_min: usize) -> RateLimitResult {
        let mut limits = self.customer_limits.write().await;
        let entry = limits.entry(customer_id.to_string()).or_insert_with(RateLimitEntry::new);
        let count = entry.count_in_window(Duration::from_secs(60));
        
        if count >= limit_per_min {
            RateLimitResult {
                allowed: false,
                remaining: 0,
                retry_after: Some(Duration::from_secs(60)),
            }
        } else {
            entry.add_request();
            RateLimitResult {
                allowed: true,
                remaining: (limit_per_min - count - 1) as u64,
                retry_after: None,
            }
        }
    }

    /// Periodic cleanup of stale entries (call every 5 minutes)
    pub async fn cleanup(&self) {
        let cutoff = Instant::now() - Duration::from_secs(300);
        
        self.ip_limits.write().await.retain(|_, entry| {
            entry.requests.retain(|t| *t > cutoff);
            !entry.requests.is_empty()
        });
        
        self.endpoint_limits.write().await.retain(|_, entry| {
            entry.requests.retain(|t| *t > cutoff);
            !entry.requests.is_empty()
        });
        
        self.customer_limits.write().await.retain(|_, entry| {
            entry.requests.retain(|t| *t > cutoff);
            !entry.requests.is_empty()
        });
    }
}
