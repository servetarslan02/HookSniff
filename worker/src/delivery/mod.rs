//! Delivery router for HookSniff.
//!
//! Routes webhook events to the appropriate delivery mechanism.
//! Currently supports HTTP delivery only.

pub mod http;

// Re-export commonly used items so callers can use `delivery::deliver_http` etc.
pub use http::{deliver_http, truncate_str};

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tracing::{info, warn};

use crate::WebhookMessage;

/// Supported delivery target types.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum DeliveryTargetType {
    Http,
    Email,
}

impl std::fmt::Display for DeliveryTargetType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Http => write!(f, "http"),
            Self::Email => write!(f, "email"),
        }
    }
}

impl std::str::FromStr for DeliveryTargetType {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self> {
        match s.to_lowercase().as_str() {
            "http" => Ok(Self::Http),
            "email" => Ok(Self::Email),
            other => Err(anyhow::anyhow!("Unknown delivery target type: {}", other)),
        }
    }
}

/// Configuration for a delivery target, stored in `delivery_targets.config`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliveryTargetConfig {
    pub target_type: DeliveryTargetType,
    /// Protocol-specific configuration (URL, queue ARN, topic, etc.)
    pub config: serde_json::Value,
}

/// Result of a delivery attempt through any protocol.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliveryResult {
    pub success: bool,
    pub status_code: i32,
    pub response_body: String,
    pub response_headers: serde_json::Value,
    pub duration_ms: i32,
    pub error: String,
}

/// The delivery router selects the appropriate protocol handler and
/// dispatches the event.
pub struct DeliveryRouter {
    pool: PgPool,
    http_client: reqwest::Client,
}

impl DeliveryRouter {
    pub fn new(pool: PgPool, http_client: reqwest::Client) -> Self {
        Self { pool, http_client }
    }

    /// Route a webhook message to the appropriate delivery target(s).
    ///
    /// First checks if the endpoint has custom delivery targets configured
    /// in `delivery_targets`. If so, uses those. Otherwise falls back to
    /// the default HTTP webhook delivery.
    pub async fn deliver(&self, webhook: &WebhookMessage) -> Result<Vec<DeliveryResult>> {
        let targets = self.load_targets(&webhook.endpoint_id).await?;

        if targets.is_empty() {
            // No custom targets — use default HTTP delivery
            info!(
                "No custom delivery targets for endpoint {}, using default HTTP",
                webhook.endpoint_id
            );
            let result = http::deliver_http(&self.http_client, webhook, 1).await?;
            return Ok(vec![result]);
        }

        let mut results = Vec::with_capacity(targets.len());

        for target in targets {
            if !target.enabled {
                continue;
            }

            let result = match target.target_type.as_str() {
                "http" => {
                    http::deliver_http(&self.http_client, webhook, 1).await
                }
                "email" => {
                    deliver_email(&target.config, webhook).await
                }
                other => {
                    warn!(
                        "Unsupported delivery target type '{}' for target {}",
                        other, target.id
                    );
                    Ok(DeliveryResult {
                        success: false,
                        status_code: 0,
                        response_body: String::new(),
                        response_headers: serde_json::json!({}),
                        duration_ms: 0,
                        error: format!("Unsupported delivery target type: {}", other),
                    })
                }
            };

            match result {
                Ok(delivery_result) => results.push(delivery_result),
                Err(e) => {
                    warn!(
                        "Delivery target {} ({}) failed for delivery {}: {:?}",
                        target.id, target.target_type, webhook.delivery_id, e
                    );
                    results.push(DeliveryResult {
                        success: false,
                        status_code: 0,
                        response_body: String::new(),
                        response_headers: serde_json::json!({}),
                        duration_ms: 0,
                        error: e.to_string(),
                    });
                }
            }
        }

        Ok(results)
    }

    /// Load delivery targets for an endpoint from the database.
    async fn load_targets(&self, endpoint_id: &str) -> Result<Vec<DeliveryTargetRow>> {
        let ep_uuid = uuid::Uuid::parse_str(endpoint_id)
            .context("Invalid endpoint_id UUID")?;

        let rows: Vec<DeliveryTargetRow> = sqlx::query_as(
            "SELECT id, endpoint_id, target_type, config, enabled \
             FROM delivery_targets WHERE endpoint_id = $1 ORDER BY created_at",
        )
        .bind(ep_uuid)
        .fetch_all(&self.pool)
        .await
        .context("Failed to load delivery targets")?;

        Ok(rows)
    }
}

/// Row from the `delivery_targets` table.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct DeliveryTargetRow {
    pub id: uuid::Uuid,
    pub endpoint_id: uuid::Uuid,
    pub target_type: String,
    pub config: serde_json::Value,
    pub enabled: bool,
}

/// Deliver a webhook payload via email using Resend API.
///
/// Requires RESEND_API_KEY environment variable to be set.
/// Config should include "to" (recipient email) and optionally "subject".
async fn deliver_email(
    config: &serde_json::Value,
    webhook: &WebhookMessage,
) -> Result<DeliveryResult> {
    let to = config
        .get("to")
        .and_then(|v| v.as_str())
        .unwrap_or("unknown@example.com");

    let subject = config
        .get("subject")
        .and_then(|v| v.as_str())
        .unwrap_or("Webhook Delivery Notification");

    let api_key = match std::env::var("RESEND_API_KEY") {
        Ok(key) => key,
        Err(_) => {
            warn!("RESEND_API_KEY not set — email delivery unavailable");
            return Ok(DeliveryResult {
                success: false,
                status_code: 0,
                response_body: String::new(),
                response_headers: serde_json::json!({}),
                duration_ms: 0,
                error: "RESEND_API_KEY not configured".to_string(),
            });
        }
    };

    let from_email = std::env::var("NOTIFY_FROM_EMAIL")
        .unwrap_or_else(|_| "noreply@hooksniff.is-a.dev".to_string());

    let start = std::time::Instant::now();

    let body = serde_json::json!({
        "from": from_email,
        "to": [to],
        "subject": subject,
        "html": format!(
            "<h2>Webhook Delivery</h2><p><strong>Event:</strong> {}</p><p><strong>Endpoint:</strong> {}</p><pre>{}</pre>",
            webhook.delivery_id, webhook.endpoint_url, webhook.payload
        )
    });

    let client = reqwest::Client::new();
    let result = client
        .post("https://api.resend.com/emails")
        .bearer_auth(&api_key)
        .json(&body)
        .send()
        .await;

    let duration_ms = start.elapsed().as_millis() as i32;

    match result {
        Ok(resp) => {
            let status_code = resp.status().as_u16() as i32;
            let resp_body = resp.text().await.unwrap_or_default();
            let success = (200..300).contains(&status_code);

            if success {
                info!("✅ Email delivered to {} for {}", to, webhook.delivery_id);
            } else {
                warn!("⚠️ Email delivery got status {}: {}", status_code, resp_body);
            }

            Ok(DeliveryResult {
                success,
                status_code,
                response_body: truncate_str(&resp_body, 1000),
                response_headers: serde_json::json!({}),
                duration_ms,
                error: if success { String::new() } else { format!("HTTP {}", status_code) },
            })
        }
        Err(e) => {
            warn!("❌ Email delivery failed for {}: {:?}", webhook.delivery_id, e);
            Ok(DeliveryResult {
                success: false,
                status_code: 0,
                response_body: String::new(),
                response_headers: serde_json::json!({}),
                duration_ms,
                error: e.to_string(),
            })
        }
    }
}
