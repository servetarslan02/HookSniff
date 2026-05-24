//! Tests for config module.

use crate::config::*;

// ── validate_secret tests ──

#[test]
fn test_validate_secret_too_short() {
    let result = validate_secret("short", "TEST_SECRET");
    assert!(result.is_err());
    let msg = result.unwrap_err().to_string();
    assert!(msg.contains("must be at least 32 characters"));
}

#[test]
fn test_validate_secret_exactly_32_chars() {
    let secret = "a".repeat(32);
    assert!(validate_secret(&secret, "TEST_SECRET").is_ok());
}

#[test]
fn test_validate_secret_placeholder_change() {
    let secret = format!("change-me-{}", "x".repeat(25));
    let result = validate_secret(&secret, "TEST_SECRET");
    assert!(result.is_err());
    assert!(result
        .unwrap_err()
        .to_string()
        .contains("placeholder pattern"));
}

#[test]
fn test_validate_secret_placeholder_test_prefix() {
    let secret = format!("test-{}", "x".repeat(30));
    let result = validate_secret(&secret, "TEST_SECRET");
    assert!(result.is_err());
}

#[test]
fn test_validate_secret_placeholder_example() {
    let secret = format!("example-key-{}", "x".repeat(22));
    let result = validate_secret(&secret, "TEST_SECRET");
    assert!(result.is_err());
}

#[test]
fn test_validate_secret_placeholder_dummy() {
    let secret = format!("dummy-value-{}", "x".repeat(21));
    let result = validate_secret(&secret, "TEST_SECRET");
    assert!(result.is_err());
}

#[test]
fn test_validate_secret_placeholder_todo() {
    let secret = format!("todo-fix-later-{}", "x".repeat(18));
    let result = validate_secret(&secret, "TEST_SECRET");
    assert!(result.is_err());
}

#[test]
fn test_validate_secret_placeholder_xxx() {
    let secret = format!("xxx-replace-me-{}", "x".repeat(18));
    let result = validate_secret(&secret, "TEST_SECRET");
    assert!(result.is_err());
}

#[test]
fn test_validate_secret_good_secret() {
    let secret = "abcdef1234567890abcdef1234567890ab";
    assert!(validate_secret(secret, "TEST_SECRET").is_ok());
}

#[test]
fn test_validate_secret_case_insensitive_placeholder() {
    let secret = format!("CHANGE-{}", "x".repeat(28));
    let result = validate_secret(&secret, "TEST_SECRET");
    assert!(result.is_err());
}

#[test]
fn test_validate_secret_name_appears_in_error() {
    let result = validate_secret("short", "MY_HMAC_SECRET");
    let msg = result.unwrap_err().to_string();
    assert!(msg.contains("MY_HMAC_SECRET"));
}

// ── Config helper tests ──

fn make_test_config() -> Config {
    Config {
        port: 3000,
        database_url: String::new(),
        hmac_secret: String::new(),
        max_webhook_payload_bytes: 0,
        jwt_secret: String::new(),
        retention_days: 0,
        rust_log: String::new(),
        webhook_format: String::new(),
        webhook_timestamp_tolerance_secs: 0,
        stripe_secret_key: None,
        stripe_webhook_secret: None,
        app_url: None,
        otel_enabled: false,
        otel_exporter_otlp_endpoint: None,
        otel_exporter_otlp_headers: None,
        polar_access_token: None,
        polar_webhook_secret: None,
        iyzico_api_key: None,
        iyzico_secret_key: None,
        gcp_service_account_path: None,
        cors_origins: vec![],
        notify_from_email: String::new(),
        notify_email: None,
        fcm_server_key: None,
        email_base_url: String::new(),
        qstash_token: None,
        qstash_url: None,
        cf_account_id: None,
        cf_r2_token: None,
        cf_r2_bucket: None,
        event_publisher_enabled: true,
        ws_enabled: true,
        ws_max_connections: 100,
        ws_max_connections_per_user: 5,
        ws_heartbeat_interval_secs: 30,
        ws_shutdown_timeout_secs: 10,
    }
}

#[test]
fn test_is_production_true_production() {
    std::env::set_var("APP_ENV", "production");
    let cfg = make_test_config();
    assert!(cfg.is_production());
    std::env::remove_var("APP_ENV");
}

#[test]
fn test_is_production_true_prod() {
    std::env::set_var("APP_ENV", "prod");
    let cfg = make_test_config();
    assert!(cfg.is_production());
    std::env::remove_var("APP_ENV");
}

#[test]
fn test_is_production_false_development() {
    std::env::set_var("APP_ENV", "development");
    let cfg = make_test_config();
    assert!(!cfg.is_production());
    std::env::remove_var("APP_ENV");
}

#[test]
fn test_is_production_false_staging() {
    std::env::set_var("APP_ENV", "staging");
    let cfg = make_test_config();
    assert!(!cfg.is_production());
    std::env::remove_var("APP_ENV");
}

#[test]
fn test_is_production_false_no_env() {
    std::env::remove_var("APP_ENV");
    let cfg = make_test_config();
    assert!(!cfg.is_production());
}

// Helper: clear all config-related env vars
fn clear_config_env() {
    let vars = [
        "APP_ENV", "PORT", "DATABASE_URL", "HMAC_SECRET", "JWT_SECRET", "RUST_LOG",
        "MAX_PAYLOAD_BYTES", "RETENTION_DAYS", "WEBHOOK_FORMAT",
        "WEBHOOK_TIMESTAMP_TOLERANCE_SECS", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET",
        "APP_URL", "OTEL_ENABLED", "OTEL_EXPORTER_OTLP_ENDPOINT", "OTEL_EXPORTER_OTLP_HEADERS",
        "POLAR_ACCESS_TOKEN", "POLAR_WEBHOOK_SECRET", "IYZICO_API_KEY", "IYZICO_SECRET_KEY",
        "GCP_SERVICE_ACCOUNT_PATH", "CORS_ORIGINS", "NOTIFY_FROM_EMAIL", "NOTIFY_EMAIL",
        "FCM_SERVER_KEY", "EMAIL_BASE_URL", "EVENT_PUBLISHER_ENABLED", "WS_ENABLED",
        "WS_MAX_CONNECTIONS", "WS_MAX_CONNECTIONS_PER_USER", "WS_HEARTBEAT_INTERVAL_SECS",
        "WS_SHUTDOWN_TIMEOUT_SECS",
    ];
    for var in &vars {
        std::env::remove_var(var);
    }
}

#[test]
fn test_from_env_defaults() {
    clear_config_env();
    std::env::set_var("APP_ENV", "development");

    let cfg = Config::from_env().expect("from_env should succeed with defaults");
    assert_eq!(cfg.port, 3000);
    assert!(cfg.database_url.contains("hooksniff"));
    assert_eq!(cfg.retention_days, 30);
    assert_eq!(cfg.rust_log, "info");
    assert_eq!(cfg.webhook_format, "standard");
    assert_eq!(cfg.webhook_timestamp_tolerance_secs, 300);
    assert_eq!(cfg.max_webhook_payload_bytes, 1_048_576);
    assert!(!cfg.otel_enabled);
    assert!(cfg.stripe_secret_key.is_none());
    assert!(cfg.app_url.is_none());
    assert!(cfg.polar_access_token.is_none());
    assert!(cfg.iyzico_api_key.is_none());
    assert!(cfg.gcp_service_account_path.is_none());
    assert!(cfg.cors_origins.is_empty());
    assert_eq!(cfg.notify_from_email, "onboarding@resend.dev");
    assert!(cfg.notify_email.is_none());
    assert!(cfg.fcm_server_key.is_none());
    assert_eq!(cfg.email_base_url, "https://hooksniff.vercel.app");

    clear_config_env();
}

#[test]
fn test_from_env_custom_values() {
    clear_config_env();
    std::env::set_var("APP_ENV", "development");
    std::env::set_var("PORT", "8080");
    std::env::set_var("DATABASE_URL", "postgres://custom");
    std::env::set_var("HMAC_SECRET", "my-hmac-secret-value-for-testing-1234567890");
    std::env::set_var("JWT_SECRET", "my-jwt-secret-value-for-testing-1234567890");
    std::env::set_var("RUST_LOG", "debug");
    std::env::set_var("RETENTION_DAYS", "90");
    std::env::set_var("WEBHOOK_FORMAT", "cloudevents");
    std::env::set_var("WEBHOOK_TIMESTAMP_TOLERANCE_SECS", "600");
    std::env::set_var("MAX_PAYLOAD_BYTES", "2097152");
    std::env::set_var("STRIPE_SECRET_KEY", "sk_test_123");
    std::env::set_var("APP_URL", "https://example.com");
    std::env::set_var("OTEL_ENABLED", "true");
    std::env::set_var("OTEL_EXPORTER_OTLP_ENDPOINT", "http://otel:4317");
    std::env::set_var("CORS_ORIGINS", "https://a.com, https://b.com");
    std::env::set_var("NOTIFY_FROM_EMAIL", "hello@example.com");
    std::env::set_var("NOTIFY_EMAIL", "admin@example.com");
    std::env::set_var("EMAIL_BASE_URL", "https://custom.com");

    let cfg = Config::from_env().expect("from_env should succeed");
    assert_eq!(cfg.port, 8080);
    assert_eq!(cfg.database_url, "postgres://custom");
    assert_eq!(cfg.hmac_secret, "my-hmac-secret-value-for-testing-1234567890");
    assert_eq!(cfg.jwt_secret, "my-jwt-secret-value-for-testing-1234567890");
    assert_eq!(cfg.rust_log, "debug");
    assert_eq!(cfg.retention_days, 90);
    assert_eq!(cfg.webhook_format, "cloudevents");
    assert_eq!(cfg.webhook_timestamp_tolerance_secs, 600);
    assert_eq!(cfg.max_webhook_payload_bytes, 2_097_152);
    assert_eq!(cfg.stripe_secret_key, Some("sk_test_123".into()));
    assert_eq!(cfg.app_url, Some("https://example.com".into()));
    assert!(cfg.otel_enabled);
    assert_eq!(cfg.otel_exporter_otlp_endpoint, Some("http://otel:4317".into()));
    assert_eq!(cfg.cors_origins, vec!["https://a.com", "https://b.com"]);
    assert_eq!(cfg.notify_from_email, "hello@example.com");
    assert_eq!(cfg.notify_email, Some("admin@example.com".into()));
    assert_eq!(cfg.email_base_url, "https://custom.com");

    clear_config_env();
}

#[test]
fn test_from_env_production_rejects_short_secret() {
    clear_config_env();
    std::env::set_var("APP_ENV", "production");
    std::env::set_var("HMAC_SECRET", "short");
    std::env::set_var("JWT_SECRET", "a".repeat(64));

    let result = Config::from_env();
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("HMAC_SECRET"));

    clear_config_env();
}

#[test]
fn test_from_env_production_rejects_placeholder_secret() {
    clear_config_env();
    std::env::set_var("APP_ENV", "production");
    std::env::set_var("HMAC_SECRET", "change-me-to-a-real-secret-1234567890");
    std::env::set_var("JWT_SECRET", "a".repeat(64));

    let result = Config::from_env();
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("HMAC_SECRET"));

    clear_config_env();
}

#[test]
fn test_from_env_production_accepts_valid_secrets() {
    clear_config_env();
    std::env::set_var("APP_ENV", "production");
    std::env::set_var(
        "HMAC_SECRET",
        "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
    );
    std::env::set_var(
        "JWT_SECRET",
        "f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5",
    );

    let cfg = Config::from_env().expect("should accept valid production secrets");
    assert!(cfg.is_production());

    clear_config_env();
}

#[test]
fn test_from_env_prod_alias() {
    clear_config_env();
    std::env::set_var("APP_ENV", "prod");
    std::env::set_var("HMAC_SECRET", "short");
    std::env::set_var("JWT_SECRET", "a".repeat(64));

    let result = Config::from_env();
    assert!(result.is_err());

    clear_config_env();
}

#[test]
fn test_from_env_invalid_port() {
    clear_config_env();
    std::env::set_var("APP_ENV", "development");
    std::env::set_var("PORT", "not_a_number");

    let result = Config::from_env();
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("PORT"));

    clear_config_env();
}

#[test]
fn test_from_env_invalid_max_payload() {
    clear_config_env();
    std::env::set_var("APP_ENV", "development");
    std::env::set_var("MAX_PAYLOAD_BYTES", "abc");

    let result = Config::from_env();
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("MAX_PAYLOAD_BYTES"));

    clear_config_env();
}

#[test]
fn test_from_env_invalid_retention_days() {
    clear_config_env();
    std::env::set_var("APP_ENV", "development");
    std::env::set_var("RETENTION_DAYS", "xyz");

    let result = Config::from_env();
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("RETENTION_DAYS"));

    clear_config_env();
}

#[test]
fn test_from_env_otel_enabled_values() {
    clear_config_env();
    std::env::set_var("APP_ENV", "development");

    std::env::set_var("OTEL_ENABLED", "1");
    let cfg = Config::from_env().unwrap();
    assert!(cfg.otel_enabled);
    clear_config_env();

    std::env::set_var("APP_ENV", "development");
    std::env::set_var("OTEL_ENABLED", "false");
    let cfg = Config::from_env().unwrap();
    assert!(!cfg.otel_enabled);
    clear_config_env();
}

#[test]
fn test_from_env_cors_origins_empty() {
    clear_config_env();
    std::env::set_var("APP_ENV", "development");
    std::env::set_var("CORS_ORIGINS", "");

    let cfg = Config::from_env().unwrap();
    assert!(cfg.cors_origins.is_empty());

    clear_config_env();
}

#[test]
fn test_from_env_cors_origins_with_whitespace() {
    clear_config_env();
    std::env::set_var("APP_ENV", "development");
    std::env::set_var("CORS_ORIGINS", "  https://a.com , , https://b.com  ");

    let cfg = Config::from_env().unwrap();
    assert_eq!(cfg.cors_origins, vec!["https://a.com", "https://b.com"]);

    clear_config_env();
}

#[test]
fn test_from_env_stripe_and_polar_and_iyzico() {
    clear_config_env();
    std::env::set_var("APP_ENV", "development");
    std::env::set_var("STRIPE_SECRET_KEY", "sk_test");
    std::env::set_var("STRIPE_WEBHOOK_SECRET", "whsec_test");
    std::env::set_var("POLAR_ACCESS_TOKEN", "polar_token");
    std::env::set_var("POLAR_WEBHOOK_SECRET", "polar_secret");
    std::env::set_var("IYZICO_API_KEY", "iyzico_key");
    std::env::set_var("IYZICO_SECRET_KEY", "iyzico_secret");

    let cfg = Config::from_env().unwrap();
    assert_eq!(cfg.stripe_secret_key, Some("sk_test".into()));
    assert_eq!(cfg.stripe_webhook_secret, Some("whsec_test".into()));
    assert_eq!(cfg.polar_access_token, Some("polar_token".into()));
    assert_eq!(cfg.polar_webhook_secret, Some("polar_secret".into()));
    assert_eq!(cfg.iyzico_api_key, Some("iyzico_key".into()));
    assert_eq!(cfg.iyzico_secret_key, Some("iyzico_secret".into()));

    clear_config_env();
}

#[test]
fn test_from_env_otel_headers() {
    clear_config_env();
    std::env::set_var("APP_ENV", "development");
    std::env::set_var("OTEL_EXPORTER_OTLP_HEADERS", "Authorization=Bearer token123");

    let cfg = Config::from_env().unwrap();
    assert_eq!(
        cfg.otel_exporter_otlp_headers,
        Some("Authorization=Bearer token123".into())
    );

    clear_config_env();
}

#[test]
fn test_config_clone() {
    let cfg = make_test_config();
    let cfg2 = cfg.clone();
    assert_eq!(cfg2.port, 3000);
}

#[test]
fn test_config_debug() {
    let cfg = make_test_config();
    let dbg = format!("{:?}", cfg);
    assert!(dbg.contains("Config"));
    assert!(dbg.contains("3000"));
}
