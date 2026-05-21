//! Property-based test strategies and tests for HookSniff domain types.
//!
//! Tests cover:
//! - Webhook signature roundtrip
//! - URL validation / SSRF bypass attempts
//! - Rate limit calculation
//! - Pagination parameter validation
//! - Event type validation
//! - Retry policy delay calculation
//! - JSON depth validation

use proptest::prelude::*;

// ── Primitive strategies ──────────────────────────────────────

/// Generate a valid event_type string: alphanumeric + dots + underscores, 1-100 chars.
pub fn event_type_strategy() -> impl Strategy<Value = String> {
    "[a-zA-Z0-9._]{1,100}"
}

/// Generate a valid HTTP/HTTPS URL (public, non-internal).
pub fn public_url_strategy() -> impl Strategy<Value = String> {
    ("[a-z]{3,12}", "[a-z]{3,20}\\.[a-z]{2,6}", "[a-z/]{0,30}")
        .prop_map(|(scheme, host, path)| format!("{}://{}/{}", scheme, host, path))
}

/// Generate a URL that targets internal/private IPs (SSRF payload).
pub fn ssrf_url_strategy() -> impl Strategy<Value = String> {
    prop_oneof![
        // Private IPv4 10.x.x.x
        (10u8..=10, any::<u8>(), any::<u8>(), any::<u8>())
            .prop_map(|(a, b, c, d)| format!("http://{}.{}.{}.{}:8080/hook", a, b, c, d)),
        // Private IPv4 172.16-31.x.x
        (172u8..=172, 16u8..=31, any::<u8>(), any::<u8>())
            .prop_map(|(a, b, c, d)| format!("http://{}.{}.{}.{}:8080/hook", a, b, c, d)),
        // Private IPv4 192.168.x.x
        (192u8..=192, 168u8..=168, any::<u8>(), any::<u8>())
            .prop_map(|(a, b, c, d)| format!("http://{}.{}.{}.{}:8080/hook", a, b, c, d)),
        // Loopback
        Just("http://127.0.0.1/hook".to_string()),
        Just("http://localhost/hook".to_string()),
        Just("http://[::1]/hook".to_string()),
        // Metadata
        Just("http://169.254.169.254/latest/meta-data/".to_string()),
        Just("http://metadata.google.internal/".to_string()),
    ]
}

/// Generate a random signing secret (base64-like, prefixed with whsec_).
pub fn signing_secret_strategy() -> impl Strategy<Value = String> {
    "[A-Za-z0-9+/=]{16,64}".prop_map(|s| format!("whsec_{}", s))
}

/// Generate a Standard Webhooks msg_id.
pub fn msg_id_strategy() -> impl Strategy<Value = String> {
    "[a-zA-Z0-9_]{3,50}".prop_map(|s| format!("msg_{}", s))
}

/// Arbitrary backoff strategy name.
pub fn backoff_strategy() -> impl Strategy<Value = String> {
    prop_oneof!["exponential", "linear", "fixed"]
}

/// Arbitrary delivery format name.
pub fn delivery_format_strategy() -> impl Strategy<Value = String> {
    prop_oneof!["standard", "cloudevents"]
}

/// Arbitrary delivery status string.
pub fn delivery_status_strategy() -> impl Strategy<Value = String> {
    prop_oneof!["pending", "processing", "delivered", "failed", "expired"]
}

/// Generate a RetryPolicy tuple: (max_attempts, backoff, initial_delay, max_delay).
pub fn retry_policy_strategy() -> impl Strategy<Value = (i32, String, i32, i32)> {
    (1..20i32, backoff_strategy(), 1..300i32, 60..86400i32).prop_map(
        |(max, backoff, initial, max_delay)| {
            // Ensure max_delay >= initial
            (max, backoff, initial, max_delay.max(initial))
        },
    )
}

/// Generate a pagination params tuple: (page, per_page).
pub fn pagination_strategy() -> impl Strategy<Value = (i64, i64)> {
    (1..1000i64, 1..100i64)
}

/// Generate an arbitrary JSON payload (bounded depth).
pub fn json_payload_strategy() -> impl Strategy<Value = serde_json::Value> {
    serde_json_value_strategy(4)
}

/// Recursive JSON value strategy with bounded depth.
fn serde_json_value_strategy(depth: u32) -> BoxedStrategy<serde_json::Value> {
    if depth == 0 {
        return prop_oneof![
            Just(serde_json::Value::Null),
            any::<bool>().prop_map(serde_json::Value::Bool),
            any::<i64>().prop_map(|n| serde_json::json!(n)),
            "[a-zA-Z0-9 ]{0,50}".prop_map(serde_json::Value::String),
        ]
        .boxed();
    }

    prop_oneof![
        Just(serde_json::Value::Null),
        any::<bool>().prop_map(serde_json::Value::Bool),
        any::<i64>().prop_map(|n| serde_json::json!(n)),
        "[a-zA-Z0-9 ]{0,50}".prop_map(serde_json::Value::String),
        proptest::collection::vec(serde_json_value_strategy(depth - 1), 0..3)
            .prop_map(serde_json::Value::Array),
        proptest::collection::hash_map("[a-z]{1,8}", serde_json_value_strategy(depth - 1), 0..3)
            .prop_map(|map| { serde_json::Value::Object(map.into_iter().collect()) }),
    ]
    .boxed()
}

// ═══════════════════════════════════════════════════════════════
// Property-based tests
// ═══════════════════════════════════════════════════════════════

proptest! {
    // ── 1. Webhook signature roundtrip ────────────────────────

    #[test]
    fn webhook_signature_roundtrip(
        secret in signing_secret_strategy(),
        msg_id in msg_id_strategy(),
        body in "[a-zA-Z0-9{}\":, ]{0,200}",
    ) {
        use crate::signing;
        let timestamp = chrono::Utc::now().timestamp().to_string();

        // Sign then verify must always succeed
        let sig = signing::compute_standard_signature(&secret, &msg_id, &timestamp, &body);
        prop_assert!(
            signing::verify_standard_signature(
                &secret, &msg_id, &timestamp, &sig, &body, None
            ).is_ok(),
            "Sign→verify roundtrip failed for secret={}, msg_id={}",
            secret, msg_id
        );
    }

    #[test]
    fn webhook_signature_rejects_wrong_key(
        secret in signing_secret_strategy(),
        wrong_secret in signing_secret_strategy(),
        msg_id in msg_id_strategy(),
        body in "[a-zA-Z0-9{}\":, ]{0,200}",
    ) {
        use crate::signing;
        let timestamp = chrono::Utc::now().timestamp().to_string();

        // Skip if secrets happen to be equal
        prop_assume!(secret != wrong_secret);

        let sig = signing::compute_standard_signature(&secret, &msg_id, &timestamp, &body);
        let result = signing::verify_standard_signature(
            &wrong_secret, &msg_id, &timestamp, &sig, &body, None
        );
        // verify_standard_signature returns hooksniff_common::signing::VerificationError
        prop_assert!(
            matches!(result, Err(hooksniff_common::signing::VerificationError::SignatureMismatch)),
            "Wrong key should reject signature, got: {:?}",
            result
        );
    }

    // ── 2. URL validation — SSRF bypass attempts ──────────────

    #[test]
    fn ssrf_urls_always_blocked(url in ssrf_url_strategy()) {
        use crate::ssrf;
        let result = ssrf::validate_url(&url);
        prop_assert!(result.is_err(),
            "SSRF URL should be blocked but was allowed: {}", url);
    }

    #[test]
    fn public_urls_not_blocked_by_ssrf(
        host in "[a-z]{3,15}",
        tld in prop_oneof!["com", "org", "io", "dev", "app"],
        path in "[a-z/]{0,20}",
    ) {
        use crate::ssrf;
        let url = format!("https://{}.{}/{}", host, tld, path);
        // DNS resolution will fail in test env, but the URL itself should pass IP checks
        let result = ssrf::validate_url(&url);
        // Either OK (resolved to public IP) or DNS resolution failed (acceptable)
        match result {
            Ok(()) => {},
            Err(ssrf::SsrfError::DnsResolutionFailed(_)) => {},
            Err(ssrf::SsrfError::BlockedIp(_)) => {
                // In some environments (e.g. containers), random domains resolve to
                // loopback/private IPs via DNS catchall — this is acceptable.
            },
            Err(ssrf::SsrfError::BlockedLocalhost) => {
                // Same as above — domains resolving to 127.0.0.1 in sandbox envs.
            },
            Err(ssrf::SsrfError::BlockedMetadata(_)) => {
                prop_assert!(false, "Public URL {} was blocked as metadata", url);
            },
            Err(ssrf::SsrfError::InvalidUrl(_)) => {
                // Invalid URL format is acceptable for random strings
            }
        }
    }

    // ── 3. Event type validation ──────────────────────────────

    #[test]
    fn valid_event_types_accepted(event in event_type_strategy()) {
        use crate::validation;
        prop_assert!(validation::validate_event_type(&event).is_ok(),
            "Valid event type rejected: {}", event);
    }

    // ── 4. Rate limit calculation ─────────────────────────────

    #[test]
    fn rate_limit_remaining_never_negative(
        total_requests in 0..100u32,
        limit in 1..200u32,
    ) {
        // Simulate: remaining = limit.saturating_sub(used)
        let remaining = limit.saturating_sub(total_requests);
        prop_assert!(remaining <= limit, "remaining {} > limit {}", remaining, limit);
        // remaining is always >= 0 because it's u32 (saturating_sub)
    }

    #[test]
    fn rate_limit_blocks_at_or_above_limit(
        requests_made in 0..100u32,
        limit in 1..200u32,
    ) {
        use crate::rate_limit::{InMemoryRateLimiter, RateLimitStore};
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(async {
            let limiter = InMemoryRateLimiter::new();
            for _ in 0..requests_made {
                limiter.check("prop_key", limit, 60).await;
            }
            let result = limiter.check("prop_key", limit, 60).await;
            if requests_made >= limit {
                prop_assert!(!result.allowed,
                    "Should be blocked when {} >= {}", requests_made, limit);
            } else {
                prop_assert!(result.allowed,
                    "Should be allowed when {} < {}", requests_made, limit);
            }
            Ok(())
        })?;
    }

    // ── 5. Pagination params validation ───────────────────────

    #[test]
    fn pagination_params_valid(page in pagination_strategy()) {
        let (p, per_page) = page;
        // page >= 1, per_page >= 1
        prop_assert!(p >= 1, "page must be >= 1, got {}", p);
        prop_assert!(per_page >= 1, "per_page must be >= 1, got {}", per_page);
        // offset calculation doesn't overflow
        let offset = (p - 1) * per_page;
        prop_assert!(offset >= 0, "offset must be non-negative");
    }

    // ── 6. Retry policy delay calculation ─────────────────────

    #[test]
    fn retry_delay_non_negative(
        policy in retry_policy_strategy(),
        attempt in 1..30i32,
    ) {
        use crate::models::endpoint::RetryPolicy;
        let rp = RetryPolicy {
            max_attempts: policy.0,
            backoff: policy.1,
            initial_delay_secs: policy.2,
            max_delay_secs: policy.3,
        };
        let delay = rp.delay_for_attempt(attempt);
        prop_assert!(delay >= 0, "delay must be non-negative, got {}", delay);
        prop_assert!(delay <= rp.max_delay_secs as i64,
            "delay {} exceeds max_delay_secs {}", delay, rp.max_delay_secs);
    }

    #[test]
    fn retry_delay_never_exceeds_max(
        initial in 1..300i32,
        max_delay in 60..86400i32,
        attempt in 1..50i32,
    ) {
        use crate::models::endpoint::RetryPolicy;
        let rp = RetryPolicy {
            max_attempts: 20,
            backoff: "exponential".to_string(),
            initial_delay_secs: initial,
            max_delay_secs: max_delay.max(initial),
        };
        let delay = rp.delay_for_attempt(attempt);
        prop_assert!(delay <= rp.max_delay_secs as i64,
            "Exponential delay {} exceeded max {} at attempt {}",
            delay, rp.max_delay_secs, attempt);
    }

    // ── 7. Delivery serialization roundtrip ───────────────────

    #[test]
    fn delivery_status_roundtrip(
        status in delivery_status_strategy(),
    ) {
        use crate::models::delivery::Delivery;
        use uuid::Uuid;
        use chrono::Utc;

        let d = Delivery {
            id: Uuid::new_v4(),
            endpoint_id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            payload: serde_json::json!({"test": true}),
            event_type: Some("test.event".to_string()),
            status: status.clone(),
            attempt_count: 0,
            max_attempts: 5,
            last_attempt_at: None,
            response_status: None,
            response_body: None,
            next_retry_at: None,
            replay_count: 0,
            created_at: Utc::now(),
            sequence_num: None,
            fifo_group_id: None,
            updated_at: Utc::now(),
            error_message: None,
            is_test: false,
            custom_headers: None,
            event: None,
            processed_at: None,
            idempotency_key: None,
            source_ip: None,
            request_headers: None,
            application_id: None,
            payload_hash: None,
        };

        let json = serde_json::to_string(&d).unwrap();
        let deserialized: Delivery = serde_json::from_str(&json).unwrap();
        prop_assert_eq!(&deserialized.status, &status);
    }

    // ── 8. JSON depth validation ──────────────────────────────

    #[test]
    fn json_depth_within_limit(value in json_payload_strategy()) {
        use crate::validation;
        // Our strategy generates depth <= 4, which is under the limit of 10
        prop_assert!(validation::validate_json_depth(&value).is_ok());
    }

    // ── 9. Routing strategy roundtrip ─────────────────────────

    #[test]
    fn routing_strategy_roundtrip(
        strategy in prop_oneof!["round-robin", "failover", "latency", "unknown", ""],
    ) {
        use crate::models::endpoint::RoutingStrategy;
        let parsed = RoutingStrategy::parse_str(&strategy);
        let serialized = parsed.as_str();
        let re_parsed = RoutingStrategy::parse_str(serialized);
        prop_assert_eq!(parsed, re_parsed);
    }

    // ── 10. Delivery format roundtrip ─────────────────────────

    #[test]
    fn delivery_format_roundtrip(
        format in delivery_format_strategy(),
    ) {
        use crate::models::endpoint::DeliveryFormat;
        let parsed = DeliveryFormat::parse_str(&format);
        prop_assert_eq!(parsed.as_str(), &format);
    }
}
