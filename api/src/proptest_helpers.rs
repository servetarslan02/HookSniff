//! Property-based test strategies for HookSniff domain types.
//!
//! Used by `tests/property_tests.rs` via `use hooksniff_api::proptest_helpers::*`.

use proptest::prelude::*;
use uuid::Uuid;

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
        // Private IPv4
        (10u8..=10, any::<u8>(), any::<u8>(), any::<u8>())
            .prop_map(|(a, b, c, d)| format!("http://{}.{}.{}.{}:8080/hook", a, b, c, d)),
        (172u8..=172, 16u8..=31, any::<u8>(), any::<u8>())
            .prop_map(|(a, b, c, d)| format!("http://{}.{}.{}.{}:8080/hook", a, b, c, d)),
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

// ── Domain strategies ─────────────────────────────────────────

/// Arbitrary backoff strategy name.
pub fn backoff_strategy() -> impl Strategy<Value = String> {
    prop_oneof!["exponential", "linear", "fixed"]
}

/// Arbitrary routing strategy name.
pub fn routing_strategy() -> impl Strategy<Value = String> {
    prop_oneof!["round-robin", "latency", "failover"]
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
    (
        1..20i32,
        backoff_strategy(),
        1..300i32,
        60..86400i32,
    )
        .prop_map(|(max, backoff, initial, max_delay)| {
            // Ensure max_delay >= initial
            (max, backoff, initial, max_delay.max(initial))
        })
}

/// Generate a pagination params tuple: (page, per_page).
pub fn pagination_strategy() -> impl Strategy<Value = (i64, i64)> {
    (1..1000i64, 1..100i64)
}

/// Generate a valid UUID.
pub fn uuid_strategy() -> impl Strategy<Value = Uuid> {
    any::<[u8; 16]>().prop_map(|bytes| Uuid::from_bytes(bytes))
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
        proptest::collection::hash_map(
            "[a-z]{1,8}",
            serde_json_value_strategy(depth - 1),
            0..3
        )
        .prop_map(|map| {
            serde_json::Value::Object(map.into_iter().collect())
        }),
    ]
    .boxed()
}
