use anyhow::{Context, Result};

#[derive(Debug, Clone)]
pub struct Config {
    pub port: u16,
    pub database_url: String,
    pub kafka_brokers: String,
    pub kafka_topic: String,
    pub hmac_secret: String,
    pub max_webhook_payload_bytes: usize,
    pub jwt_secret: String,
    pub retention_days: i64,
    pub rust_log: String,
    /// Event delivery format: "standard" or "cloudevents".
    pub webhook_format: String,
    /// Timestamp tolerance for replay protection in seconds.
    pub webhook_timestamp_tolerance_secs: i64,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        dotenvy::dotenv().ok();

        let rust_log = std::env::var("RUST_LOG")
            .unwrap_or_else(|_| "info".into());

        let hmac_secret = std::env::var("HMAC_SECRET")
            .unwrap_or_else(|_| "change-me-in-production".into());
        let jwt_secret = std::env::var("JWT_SECRET")
            .unwrap_or_else(|_| "change-me-jwt-secret-in-production".into());

        let env = std::env::var("APP_ENV")
            .unwrap_or_else(|_| "development".into());

        // Warn if running in production with default secrets
        if env == "production" || env == "prod" {
            if hmac_secret == "change-me-in-production" {
                tracing::warn!(
                    "⚠️ HMAC_SECRET is using the default value! \
                     Set a unique secret before deploying to production."
                );
            }
            if jwt_secret == "change-me-jwt-secret-in-production" {
                tracing::warn!(
                    "⚠️ JWT_SECRET is using the default value! \
                     Set a unique secret before deploying to production."
                );
            }
        }

        Ok(Self {
            port: std::env::var("PORT")
                .unwrap_or_else(|_| "3000".into())
                .parse()
                .context("PORT must be a number")?,
            database_url: std::env::var("DATABASE_URL")
                .unwrap_or_else(|_| {
                    "postgresql://root@localhost:26257/hookrelay?sslmode=disable".into()
                }),
            kafka_brokers: std::env::var("KAFKA_BROKERS")
                .unwrap_or_else(|_| "localhost:9092".into()),
            kafka_topic: std::env::var("KAFKA_TOPIC")
                .unwrap_or_else(|_| "webhook-deliveries".into()),
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
        })
    }
}
