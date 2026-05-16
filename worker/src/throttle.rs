//! Per-endpoint webhook delivery throttle.
//!
//! Tracks delivery attempt rates and enforces backoff for endpoints
//! that are being retried. Prevents overwhelming endpoints that are
//! experiencing transient failures.
//!
//! BUG-024: State is persisted to Redis when available, surviving worker restarts.
//! Falls back to in-memory-only when Redis unavailable.

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Per-endpoint throttle state.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct EndpointThrottle {
    /// Number of recent delivery attempts.
    pub attempt_count: u32,
    /// Epoch millis of the first attempt in the current window.
    pub window_start_epoch_ms: u64,
    /// Epoch millis when the next delivery is allowed (backoff until).
    pub next_allowed_epoch_ms: u64,
}

impl Default for EndpointThrottle {
    fn default() -> Self {
        let now_ms = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("system clock is after UNIX epoch")
            .as_millis() as u64;
        Self {
            attempt_count: 0,
            window_start_epoch_ms: now_ms,
            next_allowed_epoch_ms: 0,
        }
    }
}

/// Throttle configuration.
#[derive(Clone)]
pub struct ThrottleConfig {
    /// Maximum attempts per window before throttling kicks in.
    pub max_attempts_per_window: u32,
    /// Window duration in seconds.
    pub window_secs: u64,
    /// Base backoff in seconds when throttled.
    pub base_backoff_secs: u64,
}

impl Default for ThrottleConfig {
    fn default() -> Self {
        Self {
            max_attempts_per_window: 10,
            window_secs: 60,
            base_backoff_secs: 5,
        }
    }
}

/// Thread-safe throttle manager with optional Redis persistence.
#[derive(Clone)]
pub struct ThrottleManager {
    throttles: Arc<RwLock<HashMap<Uuid, EndpointThrottle>>>,
    config: ThrottleConfig,
    /// Redis connection for state persistence. None = in-memory only.
    redis: Option<redis::aio::ConnectionManager>,
}

/// Redis key prefix for throttle state.
const REDIS_KEY_PREFIX: &str = "hooksniff:throttle:";

#[allow(dead_code)]
impl ThrottleManager {
    /// Create a new throttle manager with in-memory-only state.
    pub fn new(config: ThrottleConfig) -> Self {
        Self {
            throttles: Arc::new(RwLock::new(HashMap::new())),
            config,
            redis: None,
        }
    }

    /// Create a throttle manager with Redis persistence.
    /// Loads existing state from Redis on init.
    /// Falls back to in-memory if Redis connection fails.
    pub async fn with_redis(config: ThrottleConfig, redis_url: &str) -> Self {
        match redis::aio::ConnectionManager::new(
            redis::Client::open(redis_url).expect("Invalid Redis URL"),
        )
        .await
        {
            Ok(mut conn) => {
                tracing::info!("🚦 Throttle: Redis connected, loading persisted state");
                let throttles = Self::load_from_redis(&mut conn).await;
                let count = throttles.len();
                if count > 0 {
                    tracing::info!("🚦 Throttle: restored {} endpoint states from Redis", count);
                }
                Self {
                    throttles: Arc::new(RwLock::new(throttles)),
                    config,
                    redis: Some(conn),
                }
            }
            Err(e) => {
                tracing::warn!(
                    "🚦 Throttle: Redis connection failed ({}), using in-memory only",
                    e
                );
                Self::new(config)
            }
        }
    }

    /// Load all throttle states from Redis.
    async fn load_from_redis(
        conn: &mut redis::aio::ConnectionManager,
    ) -> HashMap<Uuid, EndpointThrottle> {
        let mut throttles = HashMap::new();

        let keys: Vec<String> = match redis::cmd("KEYS")
            .arg(format!("{}*", REDIS_KEY_PREFIX))
            .query_async(conn)
            .await
        {
            Ok(keys) => keys,
            Err(e) => {
                tracing::warn!("🚦 Failed to scan Redis throttle keys: {}", e);
                return throttles;
            }
        };

        for key in &keys {
            let endpoint_id_str = match key.strip_prefix(REDIS_KEY_PREFIX) {
                Some(s) => s,
                None => continue,
            };
            let endpoint_id = match Uuid::parse_str(endpoint_id_str) {
                Ok(id) => id,
                Err(_) => continue,
            };

            let data: Option<String> = match redis::cmd("GET")
                .arg(key)
                .query_async(conn)
                .await
            {
                Ok(d) => d,
                Err(_) => continue,
            };

            if let Some(json_str) = data {
                if let Ok(throttle) = serde_json::from_str::<EndpointThrottle>(&json_str) {
                    throttles.insert(endpoint_id, throttle);
                }
            }
        }

        throttles
    }

    /// Persist a single throttle state to Redis.
    async fn persist_throttle(&self, endpoint_id: Uuid, throttle: &EndpointThrottle) {
        if let Some(ref _redis) = self.redis {
            let key = format!("{}{}", REDIS_KEY_PREFIX, endpoint_id);
            let json = match serde_json::to_string(throttle) {
                Ok(j) => j,
                Err(_) => return,
            };

            let mut conn = self.redis.as_ref().expect("redis connection required for persistence").clone();
            let ttl_secs = self.config.window_secs * 3; // Auto-expire stale entries
            let result: Result<(), redis::RedisError> = redis::cmd("SETEX")
                .arg(&key)
                .arg(ttl_secs)
                .arg(&json)
                .query_async(&mut conn)
                .await;

            if let Err(e) = result {
                tracing::warn!("🚦 Failed to persist throttle state to Redis: {}", e);
            }
        }
    }

    /// Check if delivery is allowed for this endpoint.
    /// Returns Ok(()) if allowed, Err(duration) with the wait time if throttled.
    pub async fn check_allowed(&self, endpoint_id: Uuid) -> Result<(), std::time::Duration> {
        let now_ms = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("system clock is after UNIX epoch")
            .as_millis() as u64;

        let throttles = self.throttles.read().await;
        if let Some(throttle) = throttles.get(&endpoint_id) {
            // Check if backoff period is still active
            if now_ms < throttle.next_allowed_epoch_ms {
                let wait_ms = throttle.next_allowed_epoch_ms - now_ms;
                return Err(std::time::Duration::from_millis(wait_ms));
            }
        }
        Ok(())
    }

    /// Record a delivery attempt. Increments the counter and may trigger throttling.
    pub async fn record_attempt(&self, endpoint_id: Uuid) {
        let now_ms = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("system clock is after UNIX epoch")
            .as_millis() as u64;

        let window_ms = self.config.window_secs * 1000;

        let mut throttles = self.throttles.write().await;
        let throttle = throttles
            .entry(endpoint_id)
            .or_insert_with(EndpointThrottle::default);

        // Reset window if it has expired
        if now_ms.saturating_sub(throttle.window_start_epoch_ms) > window_ms {
            throttle.window_start_epoch_ms = now_ms;
            throttle.attempt_count = 0;
        }

        throttle.attempt_count += 1;

        // If we've exceeded the window limit, apply backoff
        if throttle.attempt_count > self.config.max_attempts_per_window {
            let overflow = throttle.attempt_count - self.config.max_attempts_per_window;
            let backoff_ms =
                (self.config.base_backoff_secs * 2u64.pow(overflow.saturating_sub(1).min(5)))
                    * 1000;
            throttle.next_allowed_epoch_ms = now_ms + backoff_ms;

            tracing::warn!(
                "🚦 Throttle active for endpoint {}: {} attempts in window, backoff {}ms",
                endpoint_id,
                throttle.attempt_count,
                backoff_ms
            );
        }

        // Persist the updated state
        self.persist_throttle(endpoint_id, throttle).await;
    }

    /// Record a successful delivery — resets throttle for this endpoint.
    pub async fn record_success(&self, endpoint_id: Uuid) {
        let mut throttles = self.throttles.write().await;
        if let Some(throttle) = throttles.get_mut(&endpoint_id) {
            throttle.attempt_count = 0;
            throttle.next_allowed_epoch_ms = 0;
            self.persist_throttle(endpoint_id, throttle).await;
        }
    }

    /// Get the current throttle state for an endpoint.
    #[allow(dead_code)]
    pub async fn get_state(&self, endpoint_id: Uuid) -> EndpointThrottle {
        let throttles = self.throttles.read().await;
        throttles.get(&endpoint_id).cloned().unwrap_or_default()
    }

    /// Get all throttle states (for monitoring/dashboard).
    #[allow(dead_code)]
    pub async fn get_all(&self) -> HashMap<Uuid, EndpointThrottle> {
        let throttles = self.throttles.read().await;
        throttles.clone()
    }
}
