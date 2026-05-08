//! Circuit breaker for endpoint delivery.
//!
//! Tracks consecutive failures per endpoint. When failures exceed the threshold,
//! the circuit "opens" and rejects deliveries for a cooldown period.
//! After the cooldown, the circuit enters "half-open" and allows one test request.

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

/// Thread-safe circuit breaker manager.
#[derive(Clone)]
pub struct CircuitBreaker {
    circuits: Arc<RwLock<HashMap<Uuid, EndpointCircuit>>>,
    config: CircuitBreakerConfig,
}

impl CircuitBreaker {
    pub fn new(config: CircuitBreakerConfig) -> Self {
        Self {
            circuits: Arc::new(RwLock::new(HashMap::new())),
            config,
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
    }

    /// Get the current state of an endpoint's circuit.
    pub async fn get_state(&self, endpoint_id: Uuid) -> EndpointCircuit {
        let circuits = self.circuits.read().await;
        circuits.get(&endpoint_id).cloned().unwrap_or_default()
    }

    /// Get all circuit states (for monitoring/dashboard).
    pub async fn get_all(&self) -> HashMap<Uuid, EndpointCircuit> {
        let circuits = self.circuits.read().await;
        circuits.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_circuit_starts_closed() {
        let cb = CircuitBreaker::new(CircuitBreakerConfig::default());
        let ep_id = Uuid::new_v4();
        assert!(cb.allow_request(ep_id).await);
        assert_eq!(cb.get_state(ep_id).await.state, CircuitState::Closed);
    }

    #[tokio::test]
    async fn test_circuit_opens_after_threshold() {
        let cb = CircuitBreaker::new(CircuitBreakerConfig {
            failure_threshold: 3,
            cooldown_secs: 60,
        });
        let ep_id = Uuid::new_v4();

        cb.record_failure(ep_id).await;
        cb.record_failure(ep_id).await;
        assert!(cb.allow_request(ep_id).await); // still closed

        cb.record_failure(ep_id).await;
        assert!(!cb.allow_request(ep_id).await); // now open
    }

    #[tokio::test]
    async fn test_circuit_resets_on_success() {
        let cb = CircuitBreaker::new(CircuitBreakerConfig {
            failure_threshold: 2,
            cooldown_secs: 60,
        });
        let ep_id = Uuid::new_v4();

        cb.record_failure(ep_id).await;
        cb.record_success(ep_id).await;
        assert_eq!(cb.get_state(ep_id).await.consecutive_failures, 0);
        assert!(cb.allow_request(ep_id).await);
    }

    #[tokio::test]
    async fn test_circuit_half_open_after_cooldown() {
        let cb = CircuitBreaker::new(CircuitBreakerConfig {
            failure_threshold: 1,
            cooldown_secs: 1,
        });
        let ep_id = Uuid::new_v4();

        cb.record_failure(ep_id).await;
        assert!(!cb.allow_request(ep_id).await); // open

        tokio::time::sleep(std::time::Duration::from_secs(1)).await;
        assert!(cb.allow_request(ep_id).await); // half-open
    }
}
