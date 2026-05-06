use anyhow::{Context, Result};

#[derive(Debug, Clone)]
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
}

/// Patterns that look like placeholder / throwaway secrets (case-insensitive).
const PLACEHOLDER_PATTERNS: &[&str] = &[
    "change", "secret", "test-", "test_", "example", "default",
    "placeholder", "dummy", "your-", "todo", "fixme", "xxx",
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

        let rust_log = std::env::var("RUST_LOG")
            .unwrap_or_else(|_| "info".into());

        let hmac_secret = std::env::var("HMAC_SECRET").unwrap_or_else(|| {
            let random = format!("dev-{}", uuid::Uuid::new_v4());
            tracing::warn!(
                "⚠️ HMAC_SECRET not set, using random secret (will change on restart!)"
            );
            random
        });

        let jwt_secret = std::env::var("JWT_SECRET").unwrap_or_else(|| {
            let random = format!("dev-{}", uuid::Uuid::new_v4());
            tracing::warn!(
                "⚠️ JWT_SECRET not set, using random secret (will change on restart!)"
            );
            random
        });

        let env = std::env::var("APP_ENV")
            .unwrap_or_else(|_| "development".into());

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
                    "postgresql://hookrelay:hookrelay_local@localhost:5432/hookrelay?sslmode=disable".into()
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
        })
    }
}
