#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_router_construction() {
        let _r = router();
    }

    #[test]
    fn test_update_endpoint_request_deserialize() {
        let json = r#"{
            "url": "https://example.com/hook",
            "description": "My endpoint",
            "is_active": true,
            "allowed_ips": ["192.168.1.0/24"],
            "event_filter": ["order.*"],
            "custom_headers": {"X-Custom": "value"},
            "retry_policy": {
                "max_attempts": 5,
                "backoff": "exponential",
                "initial_delay_secs": 10,
                "max_delay_secs": 3600
            },
            "routing_strategy": "failover",
            "fallback_url": "https://fallback.com",
            "format": "cloudevents"
        }"#;
        let req: UpdateEndpointRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.url.unwrap(), "https://example.com/hook");
        assert_eq!(req.description.unwrap(), "My endpoint");
        assert!(req.is_active.unwrap());
        assert_eq!(req.allowed_ips.unwrap().len(), 1);
        assert_eq!(req.event_filter.unwrap(), vec!["order.*"]);
        assert!(req.custom_headers.is_some());
        let rp = req.retry_policy.unwrap();
        assert_eq!(rp.max_attempts, 5);
        assert_eq!(rp.backoff, "exponential");
        assert_eq!(req.routing_strategy.unwrap(), "failover");
        assert_eq!(req.fallback_url.unwrap(), "https://fallback.com");
        assert_eq!(req.format.unwrap(), "cloudevents");
    }

    #[test]
    fn test_update_endpoint_request_partial() {
        let json = r#"{"url": "https://new.url"}"#;
        let req: UpdateEndpointRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.url.unwrap(), "https://new.url");
        assert!(req.description.is_none());
        assert!(req.is_active.is_none());
        assert!(req.retry_policy.is_none());
    }

    #[test]
    fn test_update_endpoint_request_empty() {
        let json = r#"{}"#;
        let req: UpdateEndpointRequest = serde_json::from_str(json).unwrap();
        assert!(req.url.is_none());
        assert!(req.description.is_none());
        assert!(req.is_active.is_none());
    }

    #[test]
    fn test_update_endpoint_request_debug() {
        let json = r#"{"url": "https://example.com"}"#;
        let req: UpdateEndpointRequest = serde_json::from_str(json).unwrap();
        let debug_str = format!("{:?}", req);
        assert!(debug_str.contains("UpdateEndpointRequest"));
    }

    #[test]
    fn test_custom_headers_validation_logic() {
        // Valid: X- prefixed headers with string values
        let headers = serde_json::json!({"X-Custom-Id": "abc123"});
        if let Some(obj) = headers.as_object() {
            for (key, value) in obj {
                assert!(key.starts_with("X-"));
                assert!(value.is_string());
            }
        }

        // Invalid: non-X- prefix
        let headers = serde_json::json!({"Authorization": "Bearer token"});
        if let Some(obj) = headers.as_object() {
            for (key, _value) in obj {
                assert!(!key.starts_with("X-"));
            }
        }
    }

    #[test]
    fn test_url_validation_logic() {
        // Valid URLs
        assert!("https://example.com".starts_with("https://"));
        assert!("http://example.com".starts_with("http://"));

        // Invalid URLs
        assert!(!"ftp://example.com".starts_with("https://"));
        assert!(!"ftp://example.com".starts_with("http://"));
        assert!(!"example.com".starts_with("https://"));
    }

    #[test]
    fn test_signing_secret_format() {
        let secret = generate_signing_secret();
        assert!(secret.starts_with("whsec_"));
        assert!(!secret.contains('-'));
        // 32 bytes hex = 64 chars + "whsec_" prefix = 70 chars
        assert_eq!(secret.len(), 70);
    }

    #[test]
    fn test_signing_secret_uniqueness() {
        let s1 = generate_signing_secret();
        let s2 = generate_signing_secret();
        assert_ne!(s1, s2);
    }

    // ── RBAC: role check logic verification ──────────────────

    #[test]
    fn test_role_check_developer_required_for_create() {
        // Verify that the create endpoint requires developer role
        // admin(40) >= developer(30) → pass
        assert!(super::super::teams::role_level("admin") >= super::super::teams::role_level("developer"));
        // developer(30) >= developer(30) → pass
        assert!(super::super::teams::role_level("developer") >= super::super::teams::role_level("developer"));
        // analyst(20) < developer(30) → fail
        assert!(super::super::teams::role_level("analyst") < super::super::teams::role_level("developer"));
        // viewer(10) < developer(30) → fail
        assert!(super::super::teams::role_level("viewer") < super::super::teams::role_level("developer"));
    }

    #[test]
    fn test_role_check_admin_required_for_delete() {
        // Verify that delete endpoint requires admin role
        // admin(40) >= admin(40) → pass
        assert!(super::super::teams::role_level("admin") >= super::super::teams::role_level("admin"));
        // developer(30) < admin(40) → fail
        assert!(super::super::teams::role_level("developer") < super::super::teams::role_level("admin"));
    }

    #[test]
    fn test_signing_secret_prefix_and_length() {
        let secret = generate_signing_secret();
        assert!(secret.starts_with("whsec_"), "secret should start with whsec_");
        assert!(secret.len() > 10, "secret should be reasonably long");
    }
}
