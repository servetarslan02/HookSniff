use axum::{extract::Request, http::StatusCode, middleware::Next, response::Response};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::Mutex;

use crate::billing::Plan;

// ──────────────────────────────────────────────────────────────
// Rate limit entry with sliding window
// ──────────────────────────────────────────────────────────────
// Rate limit entry with sliding window
// ──────────────────────────────────────────────────────────────

struct RateLimitEntry {
    count: u32,
    window_start: Instant,
    last_seen: Instant,
}

#[derive(Clone)]
pub struct RateLimiter {
    requests: Arc<Mutex<HashMap<String, RateLimitEntry>>>,
    max_requests: u32,
    window_duration: Duration,
    max_entries: usize,
}

impl RateLimiter {
    pub fn new(max_requests: u32, window_duration: Duration) -> Self {
        let limiter = Self {
            requests: Arc::new(Mutex::new(HashMap::new())),
            max_requests,
            window_duration,
            max_entries: 10_000,
        };

        // Background cleanup task
        let requests = limiter.requests.clone();
        let window = window_duration;
        let max_entries = limiter.max_entries;
        tokio::spawn(async move {
            loop {
                tokio::time::sleep(window / 4).await;
                let mut map = requests.lock().await;
                let now = Instant::now();
                map.retain(|_, entry| now.duration_since(entry.window_start) < window * 2);

                if map.len() > max_entries {
                    let mut entries: Vec<(String, Instant)> = map
                        .iter()
                        .map(|(k, v)| (k.clone(), v.last_seen))
                        .collect();
                    entries.sort_by_key(|(_, ts)| *ts);
                    let to_remove = map.len() - max_entries;
                    for (key, _) in entries.iter().take(to_remove) {
                        map.remove(key);
                    }
                    tracing::debug!(
                        "Rate limiter eviction: removed {} entries, {} remaining",
                        to_remove,
                        map.len()
                    );
                }
            }
        });

        limiter
    }

    /// Check if the request is within rate limits.
    /// Returns (allowed, remaining, limit, reset_seconds)
    pub async fn check_with_headers(&self, key: &str, limit: u32) -> (bool, u32, u32, u64) {
        let mut map = self.requests.lock().await;
        let now = Instant::now();

        if !map.contains_key(key) && map.len() >= self.max_entries {
            if let Some(oldest_key) = map
                .iter()
                .min_by_key(|(_, v)| v.last_seen)
                .map(|(k, _)| k.clone())
            {
                map.remove(&oldest_key);
            }
        }

        let entry = map.entry(key.to_string()).or_insert(RateLimitEntry {
            count: 0,
            window_start: now,
            last_seen: now,
        });

        // Reset window if expired
        if now.duration_since(entry.window_start) >= self.window_duration {
            entry.count = 0;
            entry.window_start = now;
        }

        entry.last_seen = now;

        let remaining = limit.saturating_sub(entry.count);
        let reset_seconds = self
            .window_duration
            .saturating_sub(now.duration_since(entry.window_start))
            .as_secs();

        if entry.count >= limit {
            return (false, 0, limit, reset_seconds);
        }

        entry.count += 1;
        let remaining_after = limit.saturating_sub(entry.count);
        (true, remaining_after, limit, reset_seconds)
    }

    /// Legacy check method (backwards compatible)
    pub async fn check(&self, key: &str) -> bool {
        let (allowed, _, _, _) = self.check_with_headers(key, self.max_requests).await;
        allowed
    }
}

/// Extract the rate limit key from the request (API key prefix or IP)
fn extract_key(req: &Request) -> String {
    req.headers()
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .map(|k| k[..15.min(k.len())].to_string())
        .unwrap_or_else(|| {
            req.headers()
                .get("x-forwarded-for")
                .and_then(|v| v.to_str().ok())
                .unwrap_or("unknown")
                .to_string()
        })
}

/// Axum middleware for plan-based rate limiting with proper headers
pub async fn rate_limit_middleware(
    limiter: axum::extract::Extension<RateLimiter>,
    req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let key = extract_key(&req);

    // TODO: Look up the customer's plan from the database/cache
    // For now, use the default rate limit from the limiter config
    let plan_limit = limiter.max_requests;

    let (allowed, remaining, limit, reset_seconds) =
        limiter.check_with_headers(&key, plan_limit).await;

    if allowed {
        let mut response = next.run(req).await;
        let headers = response.headers_mut();
        headers.insert("X-RateLimit-Limit", limit.to_string().parse().unwrap());
        headers.insert(
            "X-RateLimit-Remaining",
            remaining.to_string().parse().unwrap(),
        );
        headers.insert(
            "X-RateLimit-Reset",
            reset_seconds.to_string().parse().unwrap(),
        );
        Ok(response)
    } else {
        let mut response = Response::new(axum::body::Body::empty());
        *response.status_mut() = StatusCode::TOO_MANY_REQUESTS;
        let headers = response.headers_mut();
        headers.insert("X-RateLimit-Limit", limit.to_string().parse().unwrap());
        headers.insert("X-RateLimit-Remaining", "0".parse().unwrap());
        headers.insert(
            "X-RateLimit-Reset",
            reset_seconds.to_string().parse().unwrap(),
        );
        headers.insert(
            "Retry-After",
            reset_seconds.to_string().parse().unwrap(),
        );
        Ok(response)
    }
}
