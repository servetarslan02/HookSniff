//! Circuit breaker for webhook delivery.
//!
//! Tracks consecutive failures per endpoint. When failures exceed the threshold,
//! the circuit "opens" and rejects deliveries for a cooldown period.
//! After the cooldown, the circuit enters "half-open" and allows one test request.
//!
//! BUG-023: State is persisted to Redis when available, surviving worker restarts.
//! Falls back to in-memory-only when Redis is unavailable.

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Circuit state for an endpoint.
#[derive(Debug, Clone, PartialEq)]
pub enum CircuitState {
    /// Normal operation — deliveries allowed.
    Closed,
    /// Too many failures — deliveries rejected.
    Open {
        /// When the circuit opened (for cooldown calculation).
        opened_at: std::time::Instant,
    },
    /// Cooldown expired — allowing one test delivery.
    HalfOpen,
}

/// Serializable representation of a circuit for Redis persistence.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct PersistedCircuit {
    state: String,           // "closed", "open", "half_open"
    consecutive_failures: u32,
    total_opens: u64,
    /// Epoch millis when the circuit opened (for Open state).
    opened_at_epoch_ms: Option<u64>,
}

/// Circuit breaker configuration.
#[derive(Clone)]
pub struct CircuitBreakerConfig {
    /// Number of consecutive failures before opening the circuit.
    pub failure_threshold: u32,
    /// How long to keep the circuit open before moving to half-open.
    pub cooldown_secs: u64,
}

impl Default for CircuitBreakerConfig {
    fn default() -> Self {
        Self {
            failure_threshold: 5,
            cooldown_secs: 60,
        }
    }
}

/// Per-endpoint circuit state.
#[derive(Debug, Clone)]
pub struct EndpointCircuit {
    pub state: CircuitState,
    pub consecutive_failures: u32,
    pub total_opens: u64,
}

impl Default for EndpointCircuit {
    fn default() -> Self {
        Self {
            state: CircuitState::Closed,
            consecutive_failures: 0,
            total_opens: 0,
        }
    }
}

/// Thread-safe circuit breaker manager with optional Redis persistence.
#[derive(Clone)]
pub struct CircuitBreaker {
    circuits: Arc<RwLock<HashMap<Uuid, EndpointCircuit>>>,
    config: CircuitBreakerConfig,
    /// Redis connection for state persistence. None = in-memory only.
    redis: Option<redis::aio::ConnectionManager>,
}

/// Redis key prefix for circuit breaker state.
const REDIS_KEY_PREFIX: &str = "hooksniff:circuit:";

#[allow(dead_code)]
impl CircuitBreaker {
    /// Create a new circuit breaker with in-memory-only state.
    pub fn new(config: CircuitBreakerConfig) -> Self {
        Self {
            circuits: Arc::new(RwLock::new(HashMap::new())),
            config,
            redis: None,
        }
    }

    /// Create a circuit breaker with Redis persistence.
    /// Loads existing state from Redis on init.
    /// Falls back to in-memory if Redis connection fails.
    pub async fn with_redis(config: CircuitBreakerConfig, redis_url: &str) -> Self {
        match redis::aio::ConnectionManager::new(
            redis::Client::open(redis_url).expect("Invalid Redis URL"),
        )
        .await
        {
            Ok(mut conn) => {
                tracing::info!("⚡ Circuit breaker: Redis connected, loading persisted state");
                let circuits = Self::load_from_redis(&mut conn).await;
                let count = circuits.len();
                if count > 0 {
                    tracing::info!("⚡ Circuit breaker: restored {} endpoint states from Redis", count);
                }
                Self {
                    circuits: Arc::new(RwLock::new(circuits)),
                    config,
                    redis: Some(conn),
                }
            }
            Err(e) => {
                tracing::warn!(
                    "⚡ Circuit breaker: Redis connection failed ({}), using in-memory only",
                    e
                );
                Self::new(config)
            }
        }
    }

    /// Load all circuit states from Redis.
    async fn load_from_redis(
        conn: &mut redis::aio::ConnectionManager,
    ) -> HashMap<Uuid, EndpointCircuit> {
        let mut circuits = HashMap::new();

        // Scan for all circuit breaker keys
        let keys: Vec<String> = match redis::cmd("KEYS")
            .arg(format!("{}*", REDIS_KEY_PREFIX))
            .query_async(conn)
            .await
        {
            Ok(keys) => keys,
            Err(e) => {
                tracing::warn!("⚡ Failed to scan Redis keys: {}", e);
                return circuits;
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
                if let Ok(persisted) = serde_json::from_str::<PersistedCircuit>(&json_str) {
                    let state = match persisted.state.as_str() {
                        "open" => {
                            let opened_at = persisted
                                .opened_at_epoch_ms
                                .map(|ms| {
                                    let now_ms = std::time::SystemTime::now()
                                        .duration_since(std::time::UNIX_EPOCH)
                                        .expect("system clock is after UNIX epoch")
                                        .as_millis() as u64;
                                    let elapsed_ms = now_ms.saturating_sub(ms);
                                    std::time::Instant::now() - std::time::Duration::from_millis(elapsed_ms)
                                })
                                .unwrap_or_else(std::time::Instant::now);
                            CircuitState::Open { opened_at }
                        }
                        "half_open" => CircuitState::HalfOpen,
                        _ => CircuitState::Closed,
                    };

                    circuits.insert(
                        endpoint_id,
                        EndpointCircuit {
                            state,
                            consecutive_failures: persisted.consecutive_failures,
                            total_opens: persisted.total_opens,
                        },
                    );
                }
            }
        }

        circuits
    }

    /// Persist a single circuit state to Redis.
    async fn persist_circuit(&self, endpoint_id: Uuid, circuit: &EndpointCircuit) {
        if let Some(ref _redis) = self.redis {
            let state_str = match &circuit.state {
                CircuitState::Closed => "closed",
                CircuitState::Open { .. } => "open",
                CircuitState::HalfOpen => "half_open",
            };

            let opened_at_epoch_ms = match &circuit.state {
                CircuitState::Open { opened_at } => {
                    let now = std::time::Instant::now();
                    let elapsed = if now > *opened_at {
                        now.duration_since(*opened_at).as_millis() as u64
                    } else {
                        0
                    };
                    let now_epoch = std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .expect("system clock is after UNIX epoch")
                        .as_millis() as u64;
                    Some(now_epoch.saturating_sub(elapsed))
                }
                _ => None,
            };

            let persisted = PersistedCircuit {
                state: state_str.to_string(),
                consecutive_failures: circuit.consecutive_failures,
                total_opens: circuit.total_opens,
                opened_at_epoch_ms,
            };

            let key = format!("{}{}", REDIS_KEY_PREFIX, endpoint_id);
            let json = match serde_json::to_string(&persisted) {
                Ok(j) => j,
                Err(_) => return,
            };

            // Fire-and-forget with error logging — don't block delivery
            let mut conn = self.redis.as_ref().expect("redis connection required for persistence").clone();
            let ttl_secs = self.config.cooldown_secs * 3; // Auto-expire stale entries
            let result: Result<(), redis::RedisError> = redis::cmd("SETEX")
                .arg(&key)
                .arg(ttl_secs)
                .arg(&json)
                .query_async(&mut conn)
                .await;

            if let Err(e) = result {
                tracing::warn!("⚡ Failed to persist circuit state to Redis: {}", e);
            }
        }
    }

    /// Check if delivery is allowed for this endpoint.
    /// Returns true if the circuit is closed or half-open.
    pub async fn allow_request(&self, endpoint_id: Uuid) -> bool {
        let mut circuits = self.circuits.write().await;
        let circuit = circuits
            .entry(endpoint_id)
            .or_insert_with(EndpointCircuit::default);

        match &circuit.state {
            CircuitState::Closed => true,
            CircuitState::HalfOpen => true,
            CircuitState::Open { opened_at } => {
                if opened_at.elapsed().as_secs() >= self.config.cooldown_secs {
                    circuit.state = CircuitState::HalfOpen;
                    let circuit_clone = circuit.clone();
                    drop(circuits); // Release lock before async persist
                    self.persist_circuit(endpoint_id, &circuit_clone).await;
                    true
                } else {
                    false
                }
            }
        }
    }

    /// Record a successful delivery — resets the circuit to closed.
    pub async fn record_success(&self, endpoint_id: Uuid) {
        let mut circuits = self.circuits.write().await;
        if let Some(circuit) = circuits.get_mut(&endpoint_id) {
            circuit.state = CircuitState::Closed;
            circuit.consecutive_failures = 0;
            let circuit_clone = circuit.clone();
            drop(circuits);
            self.persist_circuit(endpoint_id, &circuit_clone).await;
        }
    }

    /// Record a failed delivery — may open the circuit.
    pub async fn record_failure(&self, endpoint_id: Uuid) {
        let mut circuits = self.circuits.write().await;
        let circuit = circuits
            .entry(endpoint_id)
            .or_insert_with(EndpointCircuit::default);

        circuit.consecutive_failures += 1;

        if circuit.consecutive_failures >= self.config.failure_threshold {
            circuit.state = CircuitState::Open {
                opened_at: std::time::Instant::now(),
            };
            circuit.total_opens += 1;
            tracing::warn!(
                "⚡ Circuit OPENED for endpoint {} after {} consecutive failures (total opens: {})",
                endpoint_id,
                circuit.consecutive_failures,
                circuit.total_opens
            );
        }

        let circuit_clone = circuit.clone();
        drop(circuits);
        self.persist_circuit(endpoint_id, &circuit_clone).await;
    }

    /// Get the current state of an endpoint's circuit.
    #[allow(dead_code)] // Used in integration tests; may be needed for admin API
    pub async fn get_state(&self, endpoint_id: Uuid) -> EndpointCircuit {
        let circuits = self.circuits.read().await;
        circuits.get(&endpoint_id).cloned().unwrap_or_default()
    }

    /// Get all circuit states (for monitoring/dashboard).
    #[allow(dead_code)] // Reserved for future monitoring/dashboard endpoint
    pub async fn get_all(&self) -> HashMap<Uuid, EndpointCircuit> {
        let circuits = self.circuits.read().await;
        circuits.clone()
    }
}
