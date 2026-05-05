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
    pub signing_secret: String,
    pub retry_policy: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub allowed_ips: Option<serde_json::Value>,
    pub event_filter: Option<Vec<String>>,
    pub custom_headers: Option<serde_json::Value>,
    pub old_signing_secret: Option<String>,
    pub secret_rotated_at: Option<DateTime<Utc>>,
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

#[derive(Debug, Deserialize)]
pub struct CreateEndpointRequest {
    pub url: String,
    pub description: Option<String>,
    pub allowed_ips: Option<Vec<String>>,
    pub event_filter: Option<Vec<String>>,
    pub custom_headers: Option<serde_json::Value>,
    pub retry_policy: Option<RetryPolicy>,
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

        filters.iter().any(|pattern| matches_wildcard(pattern, event_type))
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
        value.starts_with(prefix) && value.ends_with(suffix) && value.len() >= prefix.len() + suffix.len()
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
}
