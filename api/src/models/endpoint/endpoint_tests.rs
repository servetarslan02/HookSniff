//! Tests for endpoint model.

#[cfg(test)]
mod endpoint_tests {
    use crate::models::endpoint::*;

    #[test]
    fn test_wildcard_matching() {
        assert!(matches_wildcard("order.*", "order.created"));
        assert!(matches_wildcard("order.*", "order.shipped"));
        assert!(!matches_wildcard("order.*", "payment.completed"));
        assert!(matches_wildcard("*", "anything"));
        assert!(matches_wildcard("payment.completed", "payment.completed"));
    }

    #[test]
    fn test_wildcard_multi_segment() {
        assert!(matches_wildcard("order.*.*", "order.created.fast"));
        assert!(!matches_wildcard("order.*.*", "order.created"));
        assert!(matches_wildcard("*.*", "a.b"));
    }

    #[test]
    fn test_endpoint_in_validation() {
        let valid = EndpointIn {
            url: "https://example.com/webhook".to_string(),
            description: Some("Test endpoint".to_string()),
            event_types: Some(vec!["order.created".to_string()]),
            application_id: None,
            format: None,
            routing_strategy: None,
            fallback_url: None,
            custom_headers: None,
            allowed_ips: None,
        };
        assert!(valid.validate().is_ok());

        let invalid = EndpointIn {
            url: "not-a-url".to_string(),
            description: None,
            event_types: None,
            application_id: None,
            format: None,
            routing_strategy: None,
            fallback_url: None,
            custom_headers: None,
            allowed_ips: None,
        };
        assert!(invalid.validate().is_err());
    }

    #[test]
    fn test_endpoint_in_url_with_trailing_slash() {
        let ep = EndpointIn {
            url: "https://example.com/webhook/".to_string(),
            description: None,
            event_types: None,
            application_id: None,
            format: None,
            routing_strategy: None,
            fallback_url: None,
            custom_headers: None,
            allowed_ips: None,
        };
        assert!(ep.validate().is_ok());
    }

    #[test]
    fn test_endpoint_in_max_description_length() {
        let long_desc = "a".repeat(501);
        let ep = EndpointIn {
            url: "https://example.com".to_string(),
            description: Some(long_desc),
            event_types: None,
            application_id: None,
            format: None,
            routing_strategy: None,
            fallback_url: None,
            custom_headers: None,
            allowed_ips: None,
        };
        assert!(ep.validate().is_err());
    }

    #[test]
    fn test_retry_policy_defaults() {
        let policy = RetryPolicy::default();
        assert_eq!(policy.max_attempts, 3);
        assert_eq!(policy.backoff, "exponential");
        assert_eq!(policy.initial_delay_secs, 10);
        assert_eq!(policy.max_delay_secs, 3600);
    }

    #[test]
    fn test_retry_policy_validation() {
        let valid = RetryPolicy {
            max_attempts: 5,
            backoff: "exponential".to_string(),
            initial_delay_secs: 10,
            max_delay_secs: 3600,
        };
        assert!(valid.validate().is_ok());

        let invalid_backoff = RetryPolicy {
            max_attempts: 3,
            backoff: "invalid".to_string(),
            initial_delay_secs: 10,
            max_delay_secs: 3600,
        };
        assert!(invalid_backoff.validate().is_err());

        let too_many = RetryPolicy {
            max_attempts: 100,
            backoff: "linear".to_string(),
            initial_delay_secs: 10,
            max_delay_secs: 3600,
        };
        assert!(too_many.validate().is_err());
    }

    #[test]
    fn test_endpoint_response_serialization() {
        let resp = EndpointResponse {
            id: "ep-123".to_string(),
            url: "https://example.com".to_string(),
            description: Some("Test".to_string()),
            is_active: true,
            created_at: "2025-01-01T00:00:00Z".to_string(),
            signing_secret: Some("whsec_test".to_string()),
            event_types: vec!["order.created".to_string()],
            routing_strategy: Some("round-robin".to_string()),
            fallback_url: None,
            retry_policy: RetryPolicy::default(),
            format: Some("standard".to_string()),
            application_id: None,
            custom_headers: None,
            allowed_ips: None,
            avg_response_ms: Some(150),
            failure_streak: 0,
        };

        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["id"], "ep-123");
        assert_eq!(json["url"], "https://example.com");
        assert_eq!(json["is_active"], true);
        assert_eq!(json["signing_secret"], "whsec_test");
    }

    #[test]
    fn test_endpoint_response_secret_skipped() {
        let resp = EndpointResponse {
            id: "ep-123".to_string(),
            url: "https://example.com".to_string(),
            description: None,
            is_active: true,
            created_at: "2025-01-01T00:00:00Z".to_string(),
            signing_secret: None,
            event_types: vec![],
            routing_strategy: None,
            fallback_url: None,
            retry_policy: RetryPolicy::default(),
            format: None,
            application_id: None,
            custom_headers: None,
            allowed_ips: None,
            avg_response_ms: None,
            failure_streak: 0,
        };

        let json = serde_json::to_value(&resp).unwrap();
        assert!(json.get("signing_secret").is_none() || json["signing_secret"].is_null());
    }

    #[test]
    fn test_endpoint_in_empty_event_types() {
        let ep = EndpointIn {
            url: "https://example.com".to_string(),
            description: None,
            event_types: Some(vec![]),
            application_id: None,
            format: None,
            routing_strategy: None,
            fallback_url: None,
            custom_headers: None,
            allowed_ips: None,
        };
        // Empty event types is valid (matches nothing)
        assert!(ep.validate().is_ok());
    }

    #[test]
    fn test_endpoint_response_routing_fields() {
        let resp = EndpointResponse {
            id: "ep-456".to_string(),
            url: "https://example.com".to_string(),
            description: None,
            is_active: true,
            created_at: "2025-01-01T00:00:00Z".to_string(),
            signing_secret: None,
            event_types: vec![],
            routing_strategy: Some("failover".to_string()),
            fallback_url: Some("https://fallback.example.com".to_string()),
            retry_policy: RetryPolicy::default(),
            format: Some("standard".to_string()),
            application_id: None,
            custom_headers: None,
            allowed_ips: None,
            avg_response_ms: None,
            failure_streak: 0,
        };

        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["url"], "https://example.com");
        assert_eq!(json["routing_strategy"], "round-robin");
        assert_eq!(json["format"], "standard");
    }
}
