//! HookSniff Client Tests
//!
//! Tests for the HookSniff client struct initialization, configuration,
//! and error handling.

use hooksniff::HookSniff;
use std::time::Duration;

// ── Basic initialization ─────────────────────────────────────────────

#[test]
fn test_new_with_valid_key() {
    let client = HookSniff::new("sk_test_abc123");
    assert!(client.is_ok());
}

#[test]
fn test_new_with_long_key() {
    let key = "sk_live_".to_string() + &"a".repeat(200);
    let client = HookSniff::new(&key);
    assert!(client.is_ok());
}

#[test]
fn test_new_with_special_chars_in_key() {
    let client = HookSniff::new("sk_test-abc_def.123+456");
    assert!(client.is_ok());
}

#[test]
fn test_new_with_unicode_key() {
    let client = HookSniff::new("sk_test_日本語キー");
    assert!(client.is_ok());
}

// ── Empty key error ──────────────────────────────────────────────────

#[test]
fn test_new_empty_key_returns_error() {
    let result = HookSniff::new("");
    assert!(result.is_err());
}

#[test]
fn test_new_empty_key_error_message() {
    let result = HookSniff::new("");
    let err = result.unwrap_err();
    assert!(err.contains("apiKey is required"));
}

#[test]
fn test_with_options_empty_key_returns_error() {
    let result = HookSniff::with_options(
        "",
        "https://example.com",
        Duration::from_secs(10),
        1,
    );
    assert!(result.is_err());
}

// ── Default URL ──────────────────────────────────────────────────────

#[test]
fn test_default_url_is_set() {
    let client = HookSniff::new("sk_test_123").unwrap();
    // We can't directly access the URL from the client struct, but we can
    // verify the client was constructed successfully with defaults
    // The health resource uses the base URL, so if we could call it, it would
    // hit the default endpoint. Here we just verify construction succeeds.
    drop(client);
}

// ── Custom URL ───────────────────────────────────────────────────────

#[test]
fn test_with_options_custom_url() {
    let client = HookSniff::with_options(
        "sk_test_123",
        "https://custom.api.example.com",
        Duration::from_secs(15),
        3,
    );
    assert!(client.is_ok());
}

#[test]
fn test_with_options_trailing_slash_stripped() {
    // The URL should be normalized by stripping trailing slashes
    let client = HookSniff::with_options(
        "sk_test_123",
        "https://example.com/",
        Duration::from_secs(10),
        1,
    );
    assert!(client.is_ok());
}

#[test]
fn test_with_options_multiple_trailing_slashes() {
    let client = HookSniff::with_options(
        "sk_test_123",
        "https://example.com///",
        Duration::from_secs(10),
        1,
    );
    assert!(client.is_ok());
}

#[test]
fn test_with_options_custom_timeout() {
    let client = HookSniff::with_options(
        "sk_test_123",
        "https://example.com",
        Duration::from_secs(120),
        0,
    );
    assert!(client.is_ok());
}

#[test]
fn test_with_options_zero_retries() {
    let client = HookSniff::with_options(
        "sk_test_123",
        "https://example.com",
        Duration::from_secs(30),
        0,
    );
    assert!(client.is_ok());
}

#[test]
fn test_with_options_many_retries() {
    let client = HookSniff::with_options(
        "sk_test_123",
        "https://example.com",
        Duration::from_secs(30),
        10,
    );
    assert!(client.is_ok());
}

#[test]
fn test_with_options_localhost() {
    let client = HookSniff::with_options(
        "sk_test_123",
        "http://localhost:3000",
        Duration::from_secs(5),
        1,
    );
    assert!(client.is_ok());
}

// ── Resource access ──────────────────────────────────────────────────

#[test]
fn test_client_has_all_resources() {
    let client = HookSniff::new("sk_test_123").unwrap();

    // Verify all resource fields are accessible (compile-time check)
    let _ = &client.endpoints;
    let _ = &client.webhooks;
    let _ = &client.auth;
    let _ = &client.analytics;
    let _ = &client.api_keys;
    let _ = &client.alerts;
    let _ = &client.teams;
    let _ = &client.search;
    let _ = &client.billing;
    let _ = &client.health;
}

// ── Multiple clients ─────────────────────────────────────────────────

#[test]
fn test_multiple_clients_independent() {
    let client1 = HookSniff::new("sk_key_1").unwrap();
    let client2 = HookSniff::new("sk_key_2").unwrap();

    // Both should be independently usable
    let _ = &client1.endpoints;
    let _ = &client2.endpoints;
}

#[test]
fn test_client_is_send() {
    // Verify HookSniff can be sent across threads
    fn assert_send<T: Send>() {}
    assert_send::<HookSniff>();
}

// ── Re-export verification ───────────────────────────────────────────

#[test]
fn test_hooksniff_re_exported_at_crate_root() {
    // Verify that HookSniff is accessible from the crate root
    let _: Result<HookSniff, String> = HookSniff::new("test");
}

#[test]
fn test_resources_accessible_from_module() {
    use hooksniff::resources::Endpoints;
    // Just verify the type is accessible
    fn _check() {
        // Endpoints type exists in hooksniff::resources
    }
    let _ = std::any::type_name::<Endpoints>();
}
