//! Tests for email module.

use super::*;
use crate::config::Config;
use base64::Engine;

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
        notify_from_email: "noreply@example.com".into(),
        notify_email: None,
        fcm_server_key: None,
        email_base_url: "https://example.com".into(),
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

/// Helper: generate a valid service account JSON string.
fn valid_sa_json() -> String {
    serde_json::json!({
        "_type": "service_account",
        "_project_id": "test-project",
        "_private_key_id": "key-id-123",
        "private_key": "-----BEGIN RSA PRIVATE KEY-----\nMIIBogIBAAJBALRiMLAHudeSA/x3hB2f+2NRkJLA\n-----END RSA PRIVATE KEY-----\n",
        "client_email": "test@test-project.iam.gserviceaccount.com",
        "_client_id": "123456789",
        "_auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token"
    })
    .to_string()
}

#[test]
fn test_from_config_no_env_no_path() {
    std::env::remove_var("GCP_SA_JSON");
    let cfg = make_test_config();
    let client = GCloudEmailClient::from_config(&cfg);
    assert!(client.is_none());
}

#[test]
fn test_from_config_invalid_json() {
    std::env::set_var("GCP_SA_JSON", "not valid json {{{");
    let cfg = make_test_config();
    let client = GCloudEmailClient::from_config(&cfg);
    assert!(client.is_none());
    std::env::remove_var("GCP_SA_JSON");
}

#[test]
fn test_from_config_missing_required_fields() {
    std::env::set_var("GCP_SA_JSON", r#"{"_type": "service_account"}"#);
    let cfg = make_test_config();
    let client = GCloudEmailClient::from_config(&cfg);
    assert!(client.is_none());
    std::env::remove_var("GCP_SA_JSON");
}

#[test]
fn test_from_config_nonexistent_file() {
    std::env::remove_var("GCP_SA_JSON");
    let mut cfg = make_test_config();
    cfg.gcp_service_account_path = Some("/nonexistent/path/sa.json".into());
    let client = GCloudEmailClient::from_config(&cfg);
    assert!(client.is_none());
}

#[test]
fn test_from_config_valid_sa_json() {
    std::env::set_var("GCP_SA_JSON", valid_sa_json());
    let cfg = make_test_config();
    let client = GCloudEmailClient::from_config(&cfg);
    assert!(client.is_some());
    let client = client.unwrap();
    assert_eq!(client.from_email, "HookSniff <noreply@example.com>");
    std::env::remove_var("GCP_SA_JSON");
}

#[test]
fn test_build_raw_message_structure() {
    std::env::set_var("GCP_SA_JSON", valid_sa_json());
    let cfg = make_test_config();
    let client = GCloudEmailClient::from_config(&cfg).unwrap();
    std::env::remove_var("GCP_SA_JSON");

    let raw = client.build_raw_message("user@example.com", "Test Subject", "<h1>Hello</h1>");

    assert!(!raw.contains('+'));
    assert!(!raw.contains('/'));
    assert!(!raw.contains('='));

    let decoded = base64::engine::general_purpose::URL_SAFE_NO_PAD
        .decode(&raw)
        .expect("should be valid base64url");
    let mime = String::from_utf8(decoded).expect("should be valid UTF-8");

    assert!(mime.contains("From: HookSniff <noreply@example.com>"));
    assert!(mime.contains("To: user@example.com"));
    assert!(mime.contains("Subject: Test Subject"));
    assert!(mime.contains("MIME-Version: 1.0"));
    assert!(mime.contains("Content-Type: multipart/alternative"));
    assert!(mime.contains("boundary=\"boundary_hooksniff_email\""));
    assert!(mime.contains("Content-Type: text/html; charset=UTF-8"));
    assert!(mime.contains("<h1>Hello</h1>"));
}

#[test]
fn test_build_raw_message_with_special_chars() {
    std::env::set_var("GCP_SA_JSON", valid_sa_json());
    let cfg = make_test_config();
    let client = GCloudEmailClient::from_config(&cfg).unwrap();
    std::env::remove_var("GCP_SA_JSON");

    let raw = client.build_raw_message(
        "user+tag@example.com",
        "Ünïcödé Subject 🎉",
        "<p>Café & résumé</p>",
    );

    let decoded = base64::engine::general_purpose::URL_SAFE_NO_PAD
        .decode(&raw)
        .expect("should be valid base64url");
    let mime = String::from_utf8(decoded).expect("should be valid UTF-8");

    assert!(mime.contains("To: user+tag@example.com"));
    assert!(mime.contains("Subject: Ünïcödé Subject 🎉"));
    assert!(mime.contains("<p>Café & résumé</p>"));
}

#[test]
fn test_build_raw_message_boundary_present() {
    std::env::set_var("GCP_SA_JSON", valid_sa_json());
    let cfg = make_test_config();
    let client = GCloudEmailClient::from_config(&cfg).unwrap();
    std::env::remove_var("GCP_SA_JSON");

    let raw = client.build_raw_message("a@b.com", "S", "<p>H</p>");
    let decoded = base64::engine::general_purpose::URL_SAFE_NO_PAD
        .decode(&raw)
        .unwrap();
    let mime = String::from_utf8(decoded).unwrap();

    assert!(mime.contains("--boundary_hooksniff_email\r\n"));
    assert!(mime.contains("--boundary_hooksniff_email--"));
}

#[test]
fn test_from_config_reads_from_file() {
    use std::io::Write;

    std::env::remove_var("GCP_SA_JSON");

    let dir = std::env::temp_dir().join("hooksniff_test_email");
    std::fs::create_dir_all(&dir).unwrap();
    let path = dir.join("sa.json");
    let mut f = std::fs::File::create(&path).unwrap();
    f.write_all(valid_sa_json().as_bytes()).unwrap();

    let mut cfg = make_test_config();
    cfg.gcp_service_account_path = Some(path.to_str().unwrap().into());
    let client = GCloudEmailClient::from_config(&cfg);
    assert!(client.is_some());

    std::fs::remove_dir_all(&dir).ok();
}
