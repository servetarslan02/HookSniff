use anyhow::{Context, Result};
use std::fmt;

/// Resolve Redis URL from environment variables.
///
/// Priority:
/// 1. `REDIS_URL` — explicit connection string (e.g. `rediss://default:password@host:port`)
/// 2. Construct from `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
///    Upstash REST URL format: `https://host.upstash.io`
///    → TCP URL: `rediss://default:<token>@host:6379`
///
/// Returns `None` if neither is available.
pub fn resolve_redis_url() -> Option<String> {
    // 1. Explicit REDIS_URL takes priority
    if let Ok(url) = std::env::var("REDIS_URL") {
        if !url.is_empty() {
            return Some(url);
        }
    }

    // 2. Construct from Upstash env vars
    let rest_url = std::env::var("UPSTASH_REDIS_REST_URL").ok()?;
    let token = std::env::var("UPSTASH_REDIS_REST_TOKEN").ok()?;

    if rest_url.is_empty() || token.is_empty() {
        return None;
    }

    // Parse host from REST URL: https://<host>.upstash.io → <host>.upstash.io
    let host = rest_url
        .trim_start_matches("https://")
        .trim_start_matches("http://")
        .trim_end_matches('/');

    let redis_url = format!("rediss://default:{}@{}:6379", token, host);
    tracing::info!(
        "🔧 Redis URL constructed from UPSTASH_REDIS_REST_URL (host: {})",
        host
    );
    Some(redis_url)
}

#[derive(Clone)]
pub struct Config {
    pub port: u16,
    pub database_url: String,
    pub hmac_secret: String,
    pub max_webhook_payload_bytes: usize,
    pub jwt_secret: String,
    pub retention_days: i64,
    pub rust_log: String,
    /// Event delivery format: "standard" or "cloudevents".
    pub webhook_format: String,
    /// Timestamp tolerance for replay protection in seconds.
    pub webhook_timestamp_tolerance_secs: i64,
    /// Stripe secret key (optional — billing disabled if not set)
    pub stripe_secret_key: Option<String>,
    /// Stripe webhook secret for signature verification
    pub stripe_webhook_secret: Option<String>,
    /// Base URL of the dashboard (for Stripe redirect URLs)
    pub app_url: Option<String>,
    /// OpenTelemetry: enable OTLP exporter
    pub otel_enabled: bool,
    /// OpenTelemetry: OTLP collector endpoint (e.g. http://localhost:4317)
    pub otel_exporter_otlp_endpoint: Option<String>,
    /// OpenTelemetry: OTLP headers (comma-separated key=value pairs)
    pub otel_exporter_otlp_headers: Option<String>,
    /// Polar.sh access token (optional — billing disabled if not set)
    pub polar_access_token: Option<String>,
    /// Polar.sh webhook secret for signature verification
    pub polar_webhook_secret: Option<String>,
    /// iyzico API key (optional — billing disabled if not set)
    pub iyzico_api_key: Option<String>,
    /// iyzico secret key for signature verification
    pub iyzico_secret_key: Option<String>,
    /// GCP service account JSON path for Gmail API email sending
    pub gcp_service_account_path: Option<String>,
    /// CORS allowed origins (comma-separated). Empty = allow all in dev, deny in prod.
    pub cors_origins: Vec<String>,
    /// Sender email address for notifications
    pub notify_from_email: String,
    /// Admin notification email address (optional)
    pub notify_email: Option<String>,
    /// FCM server key for push notifications (optional)
    pub fcm_server_key: Option<String>,
    /// Base URL for email links (password reset, verification)
    pub email_base_url: String,
    /// QStash token for reliable message delivery (optional)
    pub qstash_token: Option<String>,
    /// QStash base URL (defaults to EU region)
    pub qstash_url: Option<String>,
}

/// Custom Debug implementation that masks secret fields.
impl fmt::Debug for Config {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("Config")
            .field("port", &self.port)
            .field("database_url", &"[REDACTED]")
            .field("hmac_secret", &"[REDACTED]")
            .field("max_webhook_payload_bytes", &self.max_webhook_payload_bytes)
            .field("jwt_secret", &"[REDACTED]")
            .field("retention_days", &self.retention_days)
            .field("rust_log", &self.rust_log)
            .field("webhook_format", &self.webhook_format)
            .field(
                "webhook_timestamp_tolerance_secs",
                &self.webhook_timestamp_tolerance_secs,
            )
            .field(
                "stripe_secret_key",
                &self.stripe_secret_key.as_ref().map(|_| "[REDACTED]"),
            )
            .field(
                "stripe_webhook_secret",
                &self.stripe_webhook_secret.as_ref().map(|_| "[REDACTED]"),
            )
            .field("app_url", &self.app_url)
            .field("otel_enabled", &self.otel_enabled)
            .field(
                "otel_exporter_otlp_endpoint",
                &self.otel_exporter_otlp_endpoint,
            )
            .field(
                "otel_exporter_otlp_headers",
                &self
                    .otel_exporter_otlp_headers
                    .as_ref()
                    .map(|_| "[REDACTED]"),
            )
            .field(
                "polar_access_token",
                &self.polar_access_token.as_ref().map(|_| "[REDACTED]"),
            )
            .field(
                "polar_webhook_secret",
                &self.polar_webhook_secret.as_ref().map(|_| "[REDACTED]"),
            )
            .field(
                "iyzico_api_key",
                &self.iyzico_api_key.as_ref().map(|_| "[REDACTED]"),
            )
            .field(
                "iyzico_secret_key",
                &self.iyzico_secret_key.as_ref().map(|_| "[REDACTED]"),
            )
            .field("gcp_service_account_path", &self.gcp_service_account_path)
            .field("cors_origins", &self.cors_origins)
            .field("notify_from_email", &"[REDACTED]")
            .field(
                "notify_email",
                &self.notify_email.as_ref().map(|_| "[REDACTED]"),
            )
            .field(
                "fcm_server_key",
                &self.fcm_server_key.as_ref().map(|_| "[REDACTED]"),
            )
            .field("email_base_url", &self.email_base_url)
            .finish()
    }
}

/// Patterns that look like placeholder / throwaway secrets (case-insensitive).
const PLACEHOLDER_PATTERNS: &[&str] = &[
    "change",
    "secret",
    "test-",
    "test_",
    "example",
    "default",
    "placeholder",
    "dummy",
    "your-",
    "todo",
    "fixme",
    "xxx",
];

/// Validate that a secret is production-ready.
///
/// - Must be at least 32 characters.
/// - Must not contain common placeholder patterns.
fn validate_secret(value: &str, name: &str) -> Result<()> {
    if value.len() < 32 {
        anyhow::bail!(
            "🚫 {name} must be at least 32 characters (got {}). \
             Generate one with: openssl rand -hex 32",
            value.len()
        );
    }

    let lower = value.to_lowercase();
    for pattern in PLACEHOLDER_PATTERNS {
        if lower.contains(&pattern.to_lowercase()) {
            anyhow::bail!(
                "🚫 {name} contains a placeholder pattern ('{pattern}'). \
                 Set a unique secret before deploying to production. \
                 Generate one with: openssl rand -hex 32"
            );
        }
    }

    Ok(())
}

impl Config {
    /// Returns true when APP_ENV indicates a production environment.
    pub fn is_production(&self) -> bool {
        matches!(
            std::env::var("APP_ENV").as_deref(),
            Ok("production" | "prod")
        )
    }

    pub fn from_env() -> Result<Self> {
        dotenvy::dotenv().ok();

        let rust_log = std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into());

        let hmac_secret = std::env::var("HMAC_SECRET").unwrap_or_else(|_| {
            let random = format!("dev-{}", uuid::Uuid::new_v4());
            tracing::warn!("⚠️ HMAC_SECRET not set, using random secret (will change on restart!)");
            random
        });

        let jwt_secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| {
            let random = format!("dev-{}", uuid::Uuid::new_v4());
            tracing::warn!("⚠️ JWT_SECRET not set, using random secret (will change on restart!)");
            random
        });

        let env = std::env::var("APP_ENV").unwrap_or_else(|_| "development".into());

        // In production, reject default/placeholder secrets
        if env == "production" || env == "prod" {
            validate_secret(&hmac_secret, "HMAC_SECRET")?;
            validate_secret(&jwt_secret, "JWT_SECRET")?;
        }

        // OpenTelemetry configuration
        let otel_enabled = std::env::var("OTEL_ENABLED")
            .map(|v| v == "true" || v == "1")
            .unwrap_or(false);
        let otel_exporter_otlp_endpoint = std::env::var("OTEL_EXPORTER_OTLP_ENDPOINT").ok();
        let otel_exporter_otlp_headers = std::env::var("OTEL_EXPORTER_OTLP_HEADERS").ok();

        Ok(Self {
            port: std::env::var("PORT")
                .unwrap_or_else(|_| "3000".into())
                .parse()
                .context("PORT must be a number")?,
            database_url: std::env::var("DATABASE_URL")
                .unwrap_or_else(|_| {
                    // Item 175: No hardcoded credentials — require DATABASE_URL in production
                    tracing::warn!("DATABASE_URL not set, using localhost default (development only)");
                    "postgresql://localhost:5432/hooksniff?sslmode=disable".into()
                }),
            hmac_secret,
            max_webhook_payload_bytes: std::env::var("MAX_PAYLOAD_BYTES")
                .unwrap_or_else(|_| "1048576".into()) // 1MB
                .parse()
                .context("MAX_PAYLOAD_BYTES must be a number")?,
            jwt_secret,
            retention_days: std::env::var("RETENTION_DAYS")
                .unwrap_or_else(|_| "30".into())
                .parse()
                .context("RETENTION_DAYS must be a number")?,
            rust_log,
            webhook_format: std::env::var("WEBHOOK_FORMAT")
                .unwrap_or_else(|_| "standard".into()),
            webhook_timestamp_tolerance_secs: std::env::var("WEBHOOK_TIMESTAMP_TOLERANCE_SECS")
                .unwrap_or_else(|_| "300".into())
                .parse()
                .context("WEBHOOK_TIMESTAMP_TOLERANCE_SECS must be a number")?,
            stripe_secret_key: std::env::var("STRIPE_SECRET_KEY").ok(),
            stripe_webhook_secret: std::env::var("STRIPE_WEBHOOK_SECRET").ok(),
            app_url: std::env::var("APP_URL").ok(),
            otel_enabled,
            otel_exporter_otlp_endpoint,
            otel_exporter_otlp_headers,
            polar_access_token: std::env::var("POLAR_ACCESS_TOKEN").ok(),
            polar_webhook_secret: std::env::var("POLAR_WEBHOOK_SECRET").ok(),
            iyzico_api_key: std::env::var("IYZICO_API_KEY").ok(),
            iyzico_secret_key: std::env::var("IYZICO_SECRET_KEY").ok(),
            gcp_service_account_path: std::env::var("GCP_SERVICE_ACCOUNT_PATH").ok(),
            cors_origins: std::env::var("CORS_ORIGINS")
                .unwrap_or_default()
                .split(',')
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect(),
            notify_from_email: std::env::var("NOTIFY_FROM_EMAIL")
                .unwrap_or_else(|_| "onboarding@resend.dev".into()),
            notify_email: std::env::var("NOTIFY_EMAIL").ok(),
            fcm_server_key: std::env::var("FCM_SERVER_KEY").ok(),
            email_base_url: std::env::var("EMAIL_BASE_URL")
                .unwrap_or_else(|_| "https://hooksniff.vercel.app".into()),
            qstash_token: std::env::var("QSTASH_TOKEN").ok(),
            qstash_url: std::env::var("QSTASH_URL").ok(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

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

    #[test]
    fn test_is_production_true_production() {
        std::env::set_var("APP_ENV", "production");
        let cfg = Config {
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
        };
        assert!(cfg.is_production());
        std::env::remove_var("APP_ENV");
    }

    #[test]
    fn test_is_production_true_prod() {
        std::env::set_var("APP_ENV", "prod");
        let cfg = Config {
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
        };
        assert!(cfg.is_production());
        std::env::remove_var("APP_ENV");
    }

    #[test]
    fn test_is_production_false_development() {
        std::env::set_var("APP_ENV", "development");
        let cfg = Config {
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
        };
        assert!(!cfg.is_production());
        std::env::remove_var("APP_ENV");
    }

    #[test]
    fn test_is_production_false_staging() {
        std::env::set_var("APP_ENV", "staging");
        let cfg = Config {
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
        };
        assert!(!cfg.is_production());
        std::env::remove_var("APP_ENV");
    }

    #[test]
    fn test_is_production_false_no_env() {
        std::env::remove_var("APP_ENV");
        let cfg = Config {
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
        };
        assert!(!cfg.is_production());
    }

    // Helper: clear all config-related env vars
    fn clear_config_env() {
        let vars = [
            "APP_ENV",
            "PORT",
            "DATABASE_URL",
            "HMAC_SECRET",
            "JWT_SECRET",
            "RUST_LOG",
            "MAX_PAYLOAD_BYTES",
            "RETENTION_DAYS",
            "WEBHOOK_FORMAT",
            "WEBHOOK_TIMESTAMP_TOLERANCE_SECS",
            "STRIPE_SECRET_KEY",
            "STRIPE_WEBHOOK_SECRET",
            "APP_URL",
            "OTEL_ENABLED",
            "OTEL_EXPORTER_OTLP_ENDPOINT",
            "OTEL_EXPORTER_OTLP_HEADERS",
            "POLAR_ACCESS_TOKEN",
            "POLAR_WEBHOOK_SECRET",
            "IYZICO_API_KEY",
            "IYZICO_SECRET_KEY",
            "GCP_SERVICE_ACCOUNT_PATH",
            "CORS_ORIGINS",
            "NOTIFY_FROM_EMAIL",
            "NOTIFY_EMAIL",
            "FCM_SERVER_KEY",
            "EMAIL_BASE_URL",
        ];
        for var in &vars {
            std::env::remove_var(var);
        }
    }

    #[test]
    fn test_from_env_defaults() {
        clear_config_env();
        // Ensure APP_ENV is not production so validation is skipped
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
        assert_eq!(
            cfg.hmac_secret,
            "my-hmac-secret-value-for-testing-1234567890"
        );
        assert_eq!(cfg.jwt_secret, "my-jwt-secret-value-for-testing-1234567890");
        assert_eq!(cfg.rust_log, "debug");
        assert_eq!(cfg.retention_days, 90);
        assert_eq!(cfg.webhook_format, "cloudevents");
        assert_eq!(cfg.webhook_timestamp_tolerance_secs, 600);
        assert_eq!(cfg.max_webhook_payload_bytes, 2_097_152);
        assert_eq!(cfg.stripe_secret_key, Some("sk_test_123".into()));
        assert_eq!(cfg.app_url, Some("https://example.com".into()));
        assert!(cfg.otel_enabled);
        assert_eq!(
            cfg.otel_exporter_otlp_endpoint,
            Some("http://otel:4317".into())
        );
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
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("MAX_PAYLOAD_BYTES"));

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

        // "1" also enables
        std::env::set_var("OTEL_ENABLED", "1");
        let cfg = Config::from_env().unwrap();
        assert!(cfg.otel_enabled);
        clear_config_env();

        // "false" disables
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
        std::env::set_var(
            "OTEL_EXPORTER_OTLP_HEADERS",
            "Authorization=Bearer token123",
        );

        let cfg = Config::from_env().unwrap();
        assert_eq!(
            cfg.otel_exporter_otlp_headers,
            Some("Authorization=Bearer token123".into())
        );

        clear_config_env();
    }

    #[test]
    fn test_config_clone() {
        let cfg = Config {
            port: 3000,
            database_url: "pg://localhost".into(),
            hmac_secret: "secret".into(),
            max_webhook_payload_bytes: 1024,
            jwt_secret: "jwt".into(),
            retention_days: 30,
            rust_log: "info".into(),
            webhook_format: "standard".into(),
            webhook_timestamp_tolerance_secs: 300,
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
            notify_from_email: "test@test.com".into(),
            notify_email: None,
            fcm_server_key: None,
            email_base_url: "https://test.com".into(),
        };
        let cfg2 = cfg.clone();
        assert_eq!(cfg2.port, 3000);
        assert_eq!(cfg2.database_url, "pg://localhost");
    }

    #[test]
    fn test_config_debug() {
        let cfg = Config {
            port: 3000,
            database_url: "pg://localhost".into(),
            hmac_secret: "secret".into(),
            max_webhook_payload_bytes: 1024,
            jwt_secret: "jwt".into(),
            retention_days: 30,
            rust_log: "info".into(),
            webhook_format: "standard".into(),
            webhook_timestamp_tolerance_secs: 300,
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
            notify_from_email: "test@test.com".into(),
            notify_email: None,
            fcm_server_key: None,
            email_base_url: "https://test.com".into(),
        };
        let dbg = format!("{:?}", cfg);
        assert!(dbg.contains("Config"));
        assert!(dbg.contains("3000"));
    }
}
