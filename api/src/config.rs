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
    /// Cloudflare account ID for R2 storage (optional)
    pub cf_account_id: Option<String>,
    /// Cloudflare R2 API token (optional)
    pub cf_r2_token: Option<String>,
    /// R2 bucket name (default: hooksniff-storage)
    pub cf_r2_bucket: Option<String>,
    /// Enable the event publisher (Redis Streams + local broadcast).
    /// Default: true. Set EVENT_PUBLISHER_ENABLED=false to disable.
    pub event_publisher_enabled: bool,
    /// Enable WebSocket endpoint. Default: true.
    pub ws_enabled: bool,
    /// Maximum concurrent WebSocket connections. Default: 100.
    pub ws_max_connections: usize,
    /// Maximum WebSocket connections per user. Default: 5.
    pub ws_max_connections_per_user: usize,
    /// WebSocket heartbeat interval in seconds. Default: 30.
    pub ws_heartbeat_interval_secs: u64,
    /// WebSocket graceful shutdown timeout in seconds. Default: 10.
    pub ws_shutdown_timeout_secs: u64,
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
            .field("event_publisher_enabled", &self.event_publisher_enabled)
            .field("ws_enabled", &self.ws_enabled)
            .field("ws_max_connections", &self.ws_max_connections)
            .field("ws_max_connections_per_user", &self.ws_max_connections_per_user)
            .field("ws_heartbeat_interval_secs", &self.ws_heartbeat_interval_secs)
            .field("ws_shutdown_timeout_secs", &self.ws_shutdown_timeout_secs)
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
            cf_account_id: std::env::var("CF_ACCOUNT_ID").ok(),
            cf_r2_token: std::env::var("CF_R2_TOKEN").ok(),
            cf_r2_bucket: std::env::var("CF_R2_BUCKET").ok(),
            event_publisher_enabled: std::env::var("EVENT_PUBLISHER_ENABLED")
                .map(|v| v != "false" && v != "0")
                .unwrap_or(true),
            ws_enabled: std::env::var("WS_ENABLED")
                .map(|v| v != "false" && v != "0")
                .unwrap_or(true),
            ws_max_connections: std::env::var("WS_MAX_CONNECTIONS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(100),
            ws_max_connections_per_user: std::env::var("WS_MAX_CONNECTIONS_PER_USER")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(5),
            ws_heartbeat_interval_secs: std::env::var("WS_HEARTBEAT_INTERVAL_SECS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(30),
            ws_shutdown_timeout_secs: std::env::var("WS_SHUTDOWN_TIMEOUT_SECS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(10),
        })
    }
}

