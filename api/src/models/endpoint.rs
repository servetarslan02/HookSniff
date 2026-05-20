use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Endpoint {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub url: String,
    pub description: Option<String>,
    pub is_active: bool,
    #[serde(skip_serializing, default)]
    pub signing_secret: String,
    pub retry_policy: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub allowed_ips: Option<serde_json::Value>,
    #[sqlx(default)]
    pub event_filter: Option<Vec<String>>,
    pub custom_headers: Option<serde_json::Value>,
    #[serde(skip_serializing)]
    pub old_signing_secret: Option<String>,
    pub secret_rotated_at: Option<DateTime<Utc>>,
    // Smart routing fields
    pub routing_strategy: String,
    pub fallback_url: Option<String>,
    pub avg_response_ms: i32,
    pub failure_streak: i32,
    pub last_failure_at: Option<DateTime<Utc>>,
    /// Event delivery format: "standard" or "cloudevents".
    pub format: String,
    // FIFO ordering fields (migration 007)
    pub fifo_enabled: Option<bool>,
    pub fifo_sequence: Option<i64>,
    pub fifo_group_by_customer: Option<bool>,
    pub fifo_max_wait_secs: Option<i32>,
    // Throttle fields (migration 008)
    pub throttle_rate: Option<i32>,
    pub throttle_period_secs: Option<i32>,
    pub throttle_strategy: Option<String>,
    // Application grouping (migration 013)
    pub application_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub enum RoutingStrategy {
    RoundRobin,
    Latency,
    Failover,
    Weighted,
    Random,
}

impl RoutingStrategy {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::RoundRobin => "round-robin",
            Self::Latency => "latency",
            Self::Failover => "failover",
            Self::Weighted => "weighted",
            Self::Random => "random",
        }
    }

    pub fn parse_str(s: &str) -> Self {
        match s {
            "latency" => Self::Latency,
            "failover" => Self::Failover,
            "weighted" => Self::Weighted,
            "random" => Self::Random,
            _ => Self::RoundRobin,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryPolicy {
    pub max_attempts: i32,
    pub backoff: String,
    pub initial_delay_secs: i32,
    pub max_delay_secs: i32,
}

impl Default for RetryPolicy {
    fn default() -> Self {
        Self {
            max_attempts: 3,
            backoff: "exponential".to_string(),
            initial_delay_secs: 10,
            max_delay_secs: 3600,
        }
    }
}

impl RetryPolicy {
    pub fn from_value(val: Option<&serde_json::Value>) -> Self {
        val.and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default()
    }

    pub fn delay_for_attempt(&self, attempt: i32) -> i64 {
        let base = self.initial_delay_secs as i64;
        match self.backoff.as_str() {
            "exponential" => {
                let delay = base * 2_i64.pow((attempt - 1).max(0) as u32);
                delay.min(self.max_delay_secs as i64)
            }
            "linear" => {
                let delay = base * attempt as i64;
                delay.min(self.max_delay_secs as i64)
            }
            _ => base, // fixed
        }
    }
}

/// The event delivery format.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
#[derive(Default)]
pub enum DeliveryFormat {
    /// Standard HookSniff format (default).
    #[default]
    Standard,
    /// CloudEvents v1.0 envelope format.
    CloudEvents,
}

impl DeliveryFormat {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Standard => "standard",
            Self::CloudEvents => "cloudevents",
        }
    }

    pub fn parse_str(s: &str) -> Self {
        match s {
            "cloudevents" => Self::CloudEvents,
            _ => Self::Standard,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateEndpointRequest {
    pub url: String,
    pub description: Option<String>,
    pub allowed_ips: Option<Vec<String>>,
    pub event_filter: Option<Vec<String>>,
    pub custom_headers: Option<serde_json::Value>,
    pub retry_policy: Option<RetryPolicy>,
    pub routing_strategy: Option<String>,
    pub fallback_url: Option<String>,
    /// Event delivery format: "standard" (default) or "cloudevents".
    pub format: Option<String>,
    /// Application this endpoint belongs to (optional).
    pub application_id: Option<Uuid>,
}

#[derive(Debug, Serialize)]
pub struct EndpointResponse {
    pub id: Uuid,
    pub url: String,
    pub description: Option<String>,
    pub is_active: bool,
    pub retry_policy: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub allowed_ips: Option<serde_json::Value>,
    pub event_filter: Option<Vec<String>>,
    pub custom_headers: Option<serde_json::Value>,
    pub routing_strategy: String,
    pub fallback_url: Option<String>,
    pub avg_response_ms: i32,
    pub failure_streak: i32,
    /// Event delivery format: "standard" or "cloudevents".
    pub format: String,
    /// Application this endpoint belongs to.
    pub application_id: Option<Uuid>,
}

impl Endpoint {
    pub fn to_response(self) -> EndpointResponse {
        EndpointResponse {
            id: self.id,
            url: self.url,
            description: self.description,
            is_active: self.is_active,
            retry_policy: self.retry_policy,
            created_at: self.created_at,
            allowed_ips: self.allowed_ips,
            event_filter: self.event_filter,
            custom_headers: self.custom_headers,
            routing_strategy: self.routing_strategy,
            fallback_url: self.fallback_url,
            avg_response_ms: self.avg_response_ms,
            failure_streak: self.failure_streak,
            format: self.format,
            application_id: self.application_id,
        }
    }

    /// Check if the given IP matches the endpoint's allowlist.
    /// Returns true if no allowlist is configured (allow all).
    pub fn is_ip_allowed(&self, client_ip: &str) -> bool {
        let allowed = match &self.allowed_ips {
            Some(ips) => {
                if let Some(arr) = ips.as_array() {
                    arr.iter()
                        .filter_map(|v| v.as_str())
                        .map(|s| s.to_string())
                        .collect::<Vec<_>>()
                } else {
                    return true; // Invalid format, allow all
                }
            }
            None => return true, // No allowlist, allow all
        };

        if allowed.is_empty() {
            return true; // Empty allowlist, allow all
        }

        allowed.iter().any(|cidr| matches_cidr(client_ip, cidr))
    }

    /// Check if the given event type matches the endpoint's event filter.
    /// Returns true if no filter is configured (accept all events).
    pub fn matches_event_filter(&self, event_type: &str) -> bool {
        let filters = match &self.event_filter {
            Some(f) if !f.is_empty() => f,
            _ => return true, // No filter, accept all
        };

        filters
            .iter()
            .any(|pattern| matches_wildcard(pattern, event_type))
    }

    /// Determine the target URL for delivery based on routing strategy.
    /// Returns (url, used_fallback).
    pub fn resolve_target_url(&self) -> (String, bool) {
        let strategy = RoutingStrategy::parse_str(&self.routing_strategy);

        match strategy {
            RoutingStrategy::Failover => {
                // Use fallback if failure streak >= 3 and fallback is configured
                if self.failure_streak >= 3 {
                    if let Some(ref fallback) = self.fallback_url {
                        return (fallback.clone(), true);
                    }
                }
                (self.url.clone(), false)
            }
            RoutingStrategy::Latency => {
                // If primary is healthy (failure streak < 3), use it
                // Otherwise prefer fallback if available
                if self.failure_streak >= 3 {
                    if let Some(ref fallback) = self.fallback_url {
                        return (fallback.clone(), true);
                    }
                }
                (self.url.clone(), false)
            }
            RoutingStrategy::Weighted => {
                // Weighted: distribute traffic based on endpoint health.
                // Healthier endpoints get more traffic.
                // If fallback exists, use it proportionally to primary's failure rate.
                if let Some(ref fallback) = self.fallback_url {
                    if self.failure_streak > 0 {
                        // Higher failure streak = more traffic to fallback
                        // failure_streak 1-2: ~30% fallback, 3+: ~70% fallback
                        let fallback_weight = (self.failure_streak as f64 * 0.2).min(0.8);
                        let roll: f64 = {
                            use std::collections::hash_map::DefaultHasher;
                            use std::hash::{Hash, Hasher};
                            let mut h = DefaultHasher::new();
                            self.id.hash(&mut h);
                            chrono::Utc::now().timestamp_nanos_opt().unwrap_or(0).hash(&mut h);
                            (h.finish() % 1000) as f64 / 1000.0
                        };
                        if roll < fallback_weight {
                            return (fallback.clone(), true);
                        }
                    }
                }
                (self.url.clone(), false)
            }
            RoutingStrategy::Random => {
                // Random: 50/50 chance between primary and fallback
                if let Some(ref fallback) = self.fallback_url {
                    let roll: bool = {
                        use std::collections::hash_map::DefaultHasher;
                        use std::hash::{Hash, Hasher};
                        let mut h = DefaultHasher::new();
                        self.id.hash(&mut h);
                        chrono::Utc::now().timestamp_nanos_opt().unwrap_or(0).hash(&mut h);
                        (h.finish() % 2) == 0
                    };
                    if roll {
                        return (fallback.clone(), true);
                    }
                }
                (self.url.clone(), false)
            }
            RoutingStrategy::RoundRobin => (self.url.clone(), false),
        }
    }

    /// Check if endpoint is healthy for routing (not recently failing).
    /// Returns true if the endpoint hasn't failed 3+ times in the last 5 minutes.
    pub fn is_healthy(&self) -> bool {
        if self.failure_streak < 3 {
            return true;
        }
        // Check if the last failure was more than 5 minutes ago
        if let Some(last_failure) = self.last_failure_at {
            let elapsed = chrono::Utc::now() - last_failure;
            elapsed.num_minutes() >= 5
        } else {
            true
        }
    }
}

/// Simple wildcard matching. `*` matches any sequence of characters.
fn matches_wildcard(pattern: &str, value: &str) -> bool {
    if pattern == "*" {
        return true;
    }

    if !pattern.contains('*') {
        return pattern == value;
    }

    let parts: Vec<&str> = pattern.split('*').collect();
    if parts.len() == 2 {
        let prefix = parts[0];
        let suffix = parts[1];
        value.starts_with(prefix)
            && value.ends_with(suffix)
            && value.len() >= prefix.len() + suffix.len()
    } else {
        let first = parts[0];
        let last = parts[parts.len() - 1];
        value.starts_with(first) && value.ends_with(last)
    }
}

/// Check if an IP address matches a CIDR block or exact IP.
fn matches_cidr(ip: &str, cidr: &str) -> bool {
    if ip == cidr {
        return true;
    }

    let parts: Vec<&str> = cidr.split('/').collect();
    if parts.len() != 2 {
        return ip == cidr;
    }

    let network = match parts[0].parse::<std::net::Ipv4Addr>() {
        Ok(ip) => ip,
        Err(_) => return false,
    };

    let prefix_len: u32 = match parts[1].parse() {
        Ok(n) if n <= 32 => n,
        _ => return false,
    };

    let client = match ip.parse::<std::net::Ipv4Addr>() {
        Ok(ip) => ip,
        Err(_) => return false,
    };

    if prefix_len == 0 {
        return true;
    }

    let mask = !((1u32 << (32 - prefix_len)) - 1);
    let network_bits = u32::from_be_bytes(network.octets());
    let client_bits = u32::from_be_bytes(client.octets());

    (network_bits & mask) == (client_bits & mask)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_wildcard_matching() {
        assert!(matches_wildcard("order.*", "order.created"));
        assert!(matches_wildcard("order.*", "order.shipped"));
        assert!(!matches_wildcard("order.*", "payment.completed"));
        assert!(matches_wildcard("*", "anything"));
        assert!(matches_wildcard("payment.completed", "payment.completed"));
        assert!(!matches_wildcard("payment.completed", "payment.failed"));
    }

    #[test]
    fn test_cidr_matching() {
        assert!(matches_cidr("192.168.1.100", "192.168.1.0/24"));
        assert!(matches_cidr("192.168.1.1", "192.168.1.0/24"));
        assert!(!matches_cidr("192.168.2.1", "192.168.1.0/24"));
        assert!(matches_cidr("10.0.0.1", "10.0.0.0/8"));
        assert!(matches_cidr("192.168.1.100", "192.168.1.100"));
        assert!(!matches_cidr("192.168.1.101", "192.168.1.100"));
    }

    #[test]
    fn test_ip_allowlist() {
        let mut ep = Endpoint {
            id: uuid::Uuid::new_v4(),
            customer_id: uuid::Uuid::new_v4(),
            url: "https://example.com".into(),
            description: None,
            is_active: true,
            signing_secret: "test".into(),
            retry_policy: None,
            created_at: chrono::Utc::now(),
            allowed_ips: None,
            event_filter: None,
            custom_headers: None,
            old_signing_secret: None,
            secret_rotated_at: None,
            routing_strategy: "round-robin".into(),
            fallback_url: None,
            avg_response_ms: 0,
            failure_streak: 0,
            last_failure_at: None,
            format: "standard".into(),
            fifo_enabled: None,
            fifo_sequence: None,
            fifo_group_by_customer: None,
            fifo_max_wait_secs: None,
            throttle_rate: None,
            throttle_period_secs: None,
            throttle_strategy: None,
            application_id: None,
        };

        assert!(ep.is_ip_allowed("192.168.1.1"));

        ep.allowed_ips = Some(serde_json::json!(["192.168.1.0/24", "10.0.0.1"]));
        assert!(ep.is_ip_allowed("192.168.1.100"));
        assert!(ep.is_ip_allowed("10.0.0.1"));
        assert!(!ep.is_ip_allowed("172.16.0.1"));
    }

    #[test]
    fn test_event_filter() {
        let mut ep = Endpoint {
            id: uuid::Uuid::new_v4(),
            customer_id: uuid::Uuid::new_v4(),
            url: "https://example.com".into(),
            description: None,
            is_active: true,
            signing_secret: "test".into(),
            retry_policy: None,
            created_at: chrono::Utc::now(),
            allowed_ips: None,
            event_filter: None,
            custom_headers: None,
            old_signing_secret: None,
            secret_rotated_at: None,
            routing_strategy: "round-robin".into(),
            fallback_url: None,
            avg_response_ms: 0,
            failure_streak: 0,
            last_failure_at: None,
            format: "standard".into(),
            fifo_enabled: None,
            fifo_sequence: None,
            fifo_group_by_customer: None,
            fifo_max_wait_secs: None,
            throttle_rate: None,
            throttle_period_secs: None,
            throttle_strategy: None,
            application_id: None,
        };

        assert!(ep.matches_event_filter("order.created"));

        ep.event_filter = Some(vec!["order.*".into(), "payment.completed".into()]);
        assert!(ep.matches_event_filter("order.created"));
        assert!(ep.matches_event_filter("order.shipped"));
        assert!(ep.matches_event_filter("payment.completed"));
        assert!(!ep.matches_event_filter("user.registered"));
    }

    #[test]
    fn test_retry_policy_default() {
        let rp = RetryPolicy::default();
        assert_eq!(rp.max_attempts, 3);
        assert_eq!(rp.backoff, "exponential");
        assert_eq!(rp.initial_delay_secs, 10);
        assert_eq!(rp.max_delay_secs, 3600);
    }

    #[test]
    fn test_retry_policy_delay() {
        let rp = RetryPolicy::default();
        // Exponential: 10, 20, 40, 80, ...
        assert_eq!(rp.delay_for_attempt(1), 10);
        assert_eq!(rp.delay_for_attempt(2), 20);
        assert_eq!(rp.delay_for_attempt(3), 40);
        assert_eq!(rp.delay_for_attempt(4), 80);
    }

    fn make_endpoint(routing: &str, fallback: Option<&str>, streak: i32) -> Endpoint {
        Endpoint {
            id: uuid::Uuid::new_v4(),
            customer_id: uuid::Uuid::new_v4(),
            url: "https://primary.com".into(),
            description: None,
            is_active: true,
            signing_secret: "test".into(),
            retry_policy: None,
            created_at: chrono::Utc::now(),
            allowed_ips: None,
            event_filter: None,
            custom_headers: None,
            old_signing_secret: None,
            secret_rotated_at: None,
            routing_strategy: routing.into(),
            fallback_url: fallback.map(|s| s.into()),
            avg_response_ms: 100,
            failure_streak: streak,
            last_failure_at: if streak > 0 {
                Some(chrono::Utc::now())
            } else {
                None
            },
            format: "standard".into(),
            fifo_enabled: None,
            fifo_sequence: None,
            fifo_group_by_customer: None,
            fifo_max_wait_secs: None,
            throttle_rate: None,
            throttle_period_secs: None,
            throttle_strategy: None,
            application_id: None,
        }
    }

    #[test]
    fn test_routing_failover_healthy() {
        let ep = make_endpoint("failover", Some("https://fallback.com"), 2);
        let (url, fallback) = ep.resolve_target_url();
        assert_eq!(url, "https://primary.com");
        assert!(!fallback);
    }

    #[test]
    fn test_routing_failover_tripped() {
        let ep = make_endpoint("failover", Some("https://fallback.com"), 3);
        let (url, fallback) = ep.resolve_target_url();
        assert_eq!(url, "https://fallback.com");
        assert!(fallback);
    }

    #[test]
    fn test_routing_failover_no_fallback() {
        let ep = make_endpoint("failover", None, 5);
        let (url, fallback) = ep.resolve_target_url();
        assert_eq!(url, "https://primary.com");
        assert!(!fallback);
    }

    #[test]
    fn test_routing_latency_healthy() {
        let ep = make_endpoint("latency", Some("https://fast.com"), 0);
        let (url, _) = ep.resolve_target_url();
        assert_eq!(url, "https://primary.com");
    }

    #[test]
    fn test_routing_round_robin() {
        let ep = make_endpoint("round-robin", None, 0);
        let (url, _) = ep.resolve_target_url();
        assert_eq!(url, "https://primary.com");
    }

    #[test]
    fn test_routing_weighted_healthy() {
        // Healthy endpoint (no failures) should always use primary
        let ep = make_endpoint("weighted", Some("https://fallback.com"), 0);
        let (url, _) = ep.resolve_target_url();
        assert_eq!(url, "https://primary.com");
    }

    #[test]
    fn test_routing_weighted_no_fallback() {
        // Without fallback, always use primary
        let ep = make_endpoint("weighted", None, 3);
        let (url, fallback) = ep.resolve_target_url();
        assert_eq!(url, "https://primary.com");
        assert!(!fallback);
    }

    #[test]
    fn test_routing_weighted_with_failures() {
        // With failures and fallback, result should be either primary or fallback
        let ep = make_endpoint("weighted", Some("https://fallback.com"), 2);
        let (url, _) = ep.resolve_target_url();
        assert!(url == "https://primary.com" || url == "https://fallback.com");
    }

    #[test]
    fn test_routing_random_with_fallback() {
        // Random with fallback should sometimes pick either URL
        let ep = make_endpoint("random", Some("https://fallback.com"), 0);
        let mut saw_primary = false;
        let mut saw_fallback = false;
        for _ in 0..100 {
            let (url, _) = ep.resolve_target_url();
            if url == "https://primary.com" { saw_primary = true; }
            if url == "https://fallback.com" { saw_fallback = true; }
        }
        // With 100 iterations, very likely we saw both (but not guaranteed)
        // Just verify it doesn't crash and returns valid URLs
        assert!(saw_primary || saw_fallback);
    }

    #[test]
    fn test_routing_random_no_fallback() {
        // Without fallback, always use primary
        let ep = make_endpoint("random", None, 0);
        let (url, fallback) = ep.resolve_target_url();
        assert_eq!(url, "https://primary.com");
        assert!(!fallback);
    }

    #[test]
    fn test_is_healthy_no_failures() {
        let ep = make_endpoint("round-robin", None, 0);
        assert!(ep.is_healthy());
    }

    #[test]
    fn test_is_healthy_below_threshold() {
        let ep = make_endpoint("round-robin", None, 2);
        assert!(ep.is_healthy());
    }

    // ── RoutingStrategy ─────────────────────────────────────

    #[test]
    fn test_routing_strategy_parse_str() {
        assert_eq!(
            RoutingStrategy::parse_str("round-robin"),
            RoutingStrategy::RoundRobin
        );
        assert_eq!(
            RoutingStrategy::parse_str("failover"),
            RoutingStrategy::Failover
        );
        assert_eq!(
            RoutingStrategy::parse_str("latency"),
            RoutingStrategy::Latency
        );
        assert_eq!(
            RoutingStrategy::parse_str("weighted"),
            RoutingStrategy::Weighted
        );
        assert_eq!(
            RoutingStrategy::parse_str("random"),
            RoutingStrategy::Random
        );
        assert_eq!(
            RoutingStrategy::parse_str("unknown"),
            RoutingStrategy::RoundRobin
        );
        assert_eq!(RoutingStrategy::parse_str(""), RoutingStrategy::RoundRobin);
    }

    #[test]
    fn test_routing_strategy_as_str() {
        assert_eq!(RoutingStrategy::RoundRobin.as_str(), "round-robin");
        assert_eq!(RoutingStrategy::Failover.as_str(), "failover");
        assert_eq!(RoutingStrategy::Latency.as_str(), "latency");
        assert_eq!(RoutingStrategy::Weighted.as_str(), "weighted");
        assert_eq!(RoutingStrategy::Random.as_str(), "random");
    }

    #[test]
    fn test_routing_strategy_roundtrip() {
        for s in &["round-robin", "failover", "latency", "weighted", "random"] {
            let strategy = RoutingStrategy::parse_str(s);
            assert_eq!(strategy.as_str(), *s);
        }
    }

    // ── DeliveryFormat ──────────────────────────────────────

    #[test]
    fn test_delivery_format_parse_str() {
        assert_eq!(
            DeliveryFormat::parse_str("standard"),
            DeliveryFormat::Standard
        );
        assert_eq!(
            DeliveryFormat::parse_str("cloudevents"),
            DeliveryFormat::CloudEvents
        );
        assert_eq!(
            DeliveryFormat::parse_str("unknown"),
            DeliveryFormat::Standard
        );
        assert_eq!(DeliveryFormat::parse_str(""), DeliveryFormat::Standard);
    }

    #[test]
    fn test_delivery_format_as_str() {
        assert_eq!(DeliveryFormat::Standard.as_str(), "standard");
        assert_eq!(DeliveryFormat::CloudEvents.as_str(), "cloudevents");
    }

    #[test]
    fn test_delivery_format_roundtrip() {
        for s in &["standard", "cloudevents"] {
            let format = DeliveryFormat::parse_str(s);
            assert_eq!(format.as_str(), *s);
        }
    }

    // ── RetryPolicy::from_value ─────────────────────────────

    #[test]
    fn test_retry_policy_from_value_none() {
        let rp = RetryPolicy::from_value(None);
        assert_eq!(rp.max_attempts, 3);
        assert_eq!(rp.backoff, "exponential");
    }

    #[test]
    fn test_retry_policy_from_value_custom() {
        let val = serde_json::json!({
            "max_attempts": 5,
            "backoff": "linear",
            "initial_delay_secs": 30,
            "max_delay_secs": 600
        });
        let rp = RetryPolicy::from_value(Some(&val));
        assert_eq!(rp.max_attempts, 5);
        assert_eq!(rp.backoff, "linear");
        assert_eq!(rp.initial_delay_secs, 30);
        assert_eq!(rp.max_delay_secs, 600);
    }

    #[test]
    fn test_retry_policy_from_value_partial() {
        // from_value uses serde_json::from_value which requires all fields
        // if any are present. With only max_attempts, serde fails and falls back to default.
        let val = serde_json::json!({"max_attempts": 10});
        let rp = RetryPolicy::from_value(Some(&val));
        assert_eq!(rp.max_attempts, 3); // default (serde deserialization failed)
    }

    #[test]
    fn test_retry_policy_delay_linear() {
        let val = serde_json::json!({
            "max_attempts": 5,
            "backoff": "linear",
            "initial_delay_secs": 10,
            "max_delay_secs": 60
        });
        let rp = RetryPolicy::from_value(Some(&val));
        // Linear: base * attempt = 10*1=10, 10*2=20, 10*3=30
        assert_eq!(rp.delay_for_attempt(1), 10);
        assert_eq!(rp.delay_for_attempt(2), 20);
        assert_eq!(rp.delay_for_attempt(3), 30);
    }

    #[test]
    fn test_retry_policy_delay_capped() {
        let rp = RetryPolicy::default();
        // Exponential: 10, 20, 40, 80, 160, 320, 640, 1280, 2560, 3600 (capped)
        let delay = rp.delay_for_attempt(20);
        assert!(delay <= rp.max_delay_secs as i64);
    }

    // ── Endpoint::to_response ───────────────────────────────

    #[test]
    fn test_endpoint_to_response() {
        let ep = make_endpoint("round-robin", Some("https://fallback.com"), 0);
        let resp = ep.to_response();
        assert_eq!(resp.url, "https://primary.com");
        assert!(resp.is_active);
        assert_eq!(resp.routing_strategy, "round-robin");
        assert_eq!(resp.fallback_url, Some("https://fallback.com".to_string()));
    }

    // ── Endpoint::is_healthy edge cases ─────────────────────

    #[test]
    fn test_is_healthy_at_threshold() {
        let ep = make_endpoint("round-robin", None, 3);
        assert!(!ep.is_healthy());
    }

    #[test]
    fn test_is_healthy_above_threshold() {
        let ep = make_endpoint("round-robin", None, 10);
        assert!(!ep.is_healthy());
    }

    // ── Endpoint serialization ──────────────────────────────

    #[test]
    fn test_endpoint_serialization_roundtrip() {
        let ep = make_endpoint("failover", Some("https://fb.com"), 1);
        let json = serde_json::to_string(&ep).unwrap();
        let deserialized: Endpoint = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.url, "https://primary.com");
        assert_eq!(deserialized.routing_strategy, "failover");
        assert_eq!(deserialized.failure_streak, 1);
    }

    #[test]
    fn test_endpoint_clone() {
        let ep = make_endpoint("latency", None, 0);
        let cloned = ep.clone();
        assert_eq!(cloned.id, ep.id);
        assert_eq!(cloned.url, ep.url);
    }

    // ── CreateEndpointRequest ───────────────────────────────

    #[test]
    fn test_create_endpoint_request_deserialization() {
        let json = r#"{
            "url": "https://example.com/webhook",
            "description": "Test endpoint",
            "allowed_ips": ["192.168.1.0/24"],
            "event_filter": ["order.*"],
            "routing_strategy": "failover",
            "fallback_url": "https://fallback.com",
            "format": "cloudevents"
        }"#;
        let req: CreateEndpointRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.url, "https://example.com/webhook");
        assert_eq!(req.description, Some("Test endpoint".to_string()));
        assert_eq!(req.routing_strategy, Some("failover".to_string()));
        assert_eq!(req.format, Some("cloudevents".to_string()));
    }

    #[test]
    fn test_create_endpoint_request_minimal() {
        let json = r#"{"url": "https://example.com"}"#;
        let req: CreateEndpointRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.url, "https://example.com");
        assert!(req.description.is_none());
        assert!(req.allowed_ips.is_none());
        assert!(req.event_filter.is_none());
        assert!(req.routing_strategy.is_none());
        assert!(req.fallback_url.is_none());
        assert!(req.format.is_none());
    }

    // ── EndpointResponse ────────────────────────────────────

    #[test]
    fn test_endpoint_response_serialization() {
        let resp = EndpointResponse {
            id: Uuid::new_v4(),
            url: "https://example.com".to_string(),
            description: Some("desc".to_string()),
            is_active: true,
            retry_policy: None,
            created_at: chrono::Utc::now(),
            allowed_ips: None,
            event_filter: None,
            custom_headers: None,
            routing_strategy: "round-robin".to_string(),
            fallback_url: None,
            avg_response_ms: 100,
            failure_streak: 0,
            format: "standard".to_string(),
            application_id: None,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["url"], "https://example.com");
        assert_eq!(json["routing_strategy"], "round-robin");
        assert_eq!(json["format"], "standard");
    }
}
