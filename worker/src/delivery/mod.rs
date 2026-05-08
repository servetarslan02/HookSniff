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
                "http" => http::deliver_http(&self.http_client, webhook, 1).await,
                "email" => deliver_email(&target.config, webhook).await,
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
        let ep_uuid = uuid::Uuid::parse_str(endpoint_id).context("Invalid endpoint_id UUID")?;

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

/// Deliver a webhook payload via email using Google Cloud Gmail API.
///
/// Requires GCP_SERVICE_ACCOUNT_PATH environment variable pointing to a service
/// account JSON file with Gmail send permissions (domain-wide delegation).
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

    let sa_path = match std::env::var("GCP_SERVICE_ACCOUNT_PATH") {
        Ok(path) => path,
        Err(_) => {
            warn!("GCP_SERVICE_ACCOUNT_PATH not set — email delivery unavailable");
            return Ok(DeliveryResult {
                success: false,
                status_code: 0,
                response_body: String::new(),
                response_headers: serde_json::json!({}),
                duration_ms: 0,
                error: "GCP_SERVICE_ACCOUNT_PATH not configured".to_string(),
            });
        }
    };

    let from_email = std::env::var("NOTIFY_FROM_EMAIL")
        .unwrap_or_else(|_| "noreply@hooksniff.is-a.dev".to_string());

    // Read and parse service account key
    let sa_json = match std::fs::read_to_string(&sa_path) {
        Ok(json) => json,
        Err(e) => {
            warn!("Failed to read service account file {}: {}", sa_path, e);
            return Ok(DeliveryResult {
                success: false,
                status_code: 0,
                response_body: String::new(),
                response_headers: serde_json::json!({}),
                duration_ms: 0,
                error: format!("Failed to read service account: {}", e),
            });
        }
    };

    let sa_key: serde_json::Value = match serde_json::from_str(&sa_json) {
        Ok(v) => v,
        Err(e) => {
            warn!("Failed to parse service account JSON: {}", e);
            return Ok(DeliveryResult {
                success: false,
                status_code: 0,
                response_body: String::new(),
                response_headers: serde_json::json!({}),
                duration_ms: 0,
                error: format!("Invalid service account JSON: {}", e),
            });
        }
    };

    let start = std::time::Instant::now();

    // Build OAuth2 JWT and exchange for access token
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    let client_email = sa_key["client_email"].as_str().unwrap_or("");
    let private_key = sa_key["private_key"].as_str().unwrap_or("");
    let token_uri = sa_key["token_uri"].as_str().unwrap_or("https://oauth2.googleapis.com/token");

    let header = jsonwebtoken::Header::new(jsonwebtoken::Algorithm::RS256);
    let claims = serde_json::json!({
        "iss": client_email,
        "scope": "https://www.googleapis.com/auth/gmail.send",
        "aud": token_uri,
        "exp": now + 3600,
        "iat": now,
    });

    let encoding_key = match jsonwebtoken::EncodingKey::from_rsa_pem(private_key.as_bytes()) {
        Ok(key) => key,
        Err(e) => {
            warn!("Failed to create RSA key from service account: {}", e);
            return Ok(DeliveryResult {
                success: false,
                status_code: 0,
                response_body: String::new(),
                response_headers: serde_json::json!({}),
                duration_ms: 0,
                error: format!("RSA key error: {}", e),
            });
        }
    };

    let jwt = match jsonwebtoken::encode(&header, &claims, &encoding_key) {
        Ok(j) => j,
        Err(e) => {
            warn!("Failed to sign JWT: {}", e);
            return Ok(DeliveryResult {
                success: false,
                status_code: 0,
                response_body: String::new(),
                response_headers: serde_json::json!({}),
                duration_ms: 0,
                error: format!("JWT signing error: {}", e),
            });
        }
    };

    // Exchange JWT for access token
    let http_client = reqwest::Client::new();
    let token_result = http_client
        .post(token_uri)
        .form(&[
            ("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer"),
            ("assertion", jwt.as_str()),
        ])
        .send()
        .await;

    let access_token = match token_result {
        Ok(resp) if resp.status().is_success() => {
            let body: serde_json::Value = resp.text().await
                .and_then(|t| serde_json::from_str(&t).map_err(|e| reqwest::Error::from(e)))
                .unwrap_or_default();
            body["access_token"].as_str().unwrap_or("").to_string()
        }
        Ok(resp) => {
            let status = resp.status().as_u16() as i32;
            let text = resp.text().await.unwrap_or_default();
            warn!("GCloud token exchange failed: status={}, body={}", status, text);
            return Ok(DeliveryResult {
                success: false,
                status_code: status,
                response_body: truncate_str(&text, 1000),
                response_headers: serde_json::json!({}),
                duration_ms: start.elapsed().as_millis() as i32,
                error: format!("Token exchange HTTP {}", status),
            });
        }
        Err(e) => {
            warn!("GCloud token exchange request failed: {}", e);
            return Ok(DeliveryResult {
                success: false,
                status_code: 0,
                response_body: String::new(),
                response_headers: serde_json::json!({}),
                duration_ms: start.elapsed().as_millis() as i32,
                error: e.to_string(),
            });
        }
    };

    // Build MIME message
    let html_body = format!(
        "<h2>Webhook Delivery</h2><p><strong>Event:</strong> {}</p><p><strong>Endpoint:</strong> {}</p><pre>{}</pre>",
        webhook.delivery_id, webhook.endpoint_url, webhook.payload
    );
    let mime = format!(
        "From: {}\r\nTo: {}\r\nSubject: {}\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n{}",
        from_email, to, subject, html_body
    );
    use base64::Engine;
    let raw = base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(mime.as_bytes());

    let msg_body = serde_json::json!({ "raw": raw });

    let result = http_client
        .post("https://gmail.googleapis.com/gmail/v1/users/me/messages/send")
        .bearer_auth(&access_token)
        .json(&msg_body)
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
                warn!(
                    "⚠️ Email delivery got status {}: {}",
                    status_code, resp_body
                );
            }

            Ok(DeliveryResult {
                success,
                status_code,
                response_body: truncate_str(&resp_body, 1000),
                response_headers: serde_json::json!({}),
                duration_ms,
                error: if success {
                    String::new()
                } else {
                    format!("HTTP {}", status_code)
                },
            })
        }
        Err(e) => {
            warn!(
                "❌ Email delivery failed for {}: {:?}",
                webhook.delivery_id, e
            );
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
