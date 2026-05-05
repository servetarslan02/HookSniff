use axum::{extract::Request, http::StatusCode, middleware::Next, response::Response};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::Mutex;

// FIX: Track insertion order to enable LRU-style eviction
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
    max_entries: usize, // FIX: Maximum number of tracked keys to prevent unbounded growth
}

impl RateLimiter {
    pub fn new(max_requests: u32, window_duration: Duration) -> Self {
        let limiter = Self {
            requests: Arc::new(Mutex::new(HashMap::new())),
            max_requests,
            window_duration,
            // FIX: Cap the map at 10,000 entries to prevent memory leaks
            max_entries: 10_000,
        };

        // FIX: More aggressive cleanup — runs every window/4 instead of every window
        // This keeps the map smaller and catches stale entries faster
        let requests = limiter.requests.clone();
        let window = window_duration;
        let max_entries = limiter.max_entries;
        tokio::spawn(async move {
            loop {
                tokio::time::sleep(window / 4).await;
                let mut map = requests.lock().await;
                let now = Instant::now();

                // Remove entries older than 2x window (was 2x, keeping same threshold)
                map.retain(|_, entry| now.duration_since(entry.window_start) < window * 2);

                // FIX: If still over limit after cleanup, evict oldest entries
                if map.len() > max_entries {
                    // Collect keys sorted by last_seen (oldest first)
                    let mut entries: Vec<(String, Instant)> = map
                        .iter()
                        .map(|(k, v)| (k.clone(), v.last_seen))
                        .collect();
                    entries.sort_by_key(|(_, ts)| *ts);

                    // Remove oldest entries until we're under the limit
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

    pub async fn check(&self, key: &str) -> bool {
        let mut map = self.requests.lock().await;
        let now = Instant::now();

        // FIX: If map is at capacity and this is a new key, evict oldest entry first
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

        if now.duration_since(entry.window_start) >= self.window_duration {
            entry.count = 0;
            entry.window_start = now;
        }

        entry.last_seen = now; // FIX: Track last access time for LRU eviction

        if entry.count >= self.max_requests {
            return false;
        }

        entry.count += 1;
        true
    }
}

pub async fn rate_limit_middleware(
    limiter: axum::extract::Extension<RateLimiter>,
    req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    // Use API key prefix or IP as rate limit key
    let key = req
        .headers()
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
        });

    if limiter.check(&key).await {
        Ok(next.run(req).await)
    } else {
        Err(StatusCode::TOO_MANY_REQUESTS)
    }
}
