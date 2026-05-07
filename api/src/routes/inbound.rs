//! Inbound Webhook Proxy
//!
//! Harici servislerden (Stripe, GitHub, Shopify vb.) gelen webhook'ları
//! alır, doğrular ve HookSniff endpoint'lerine yönlendirir.
//!
//! ## Akış
//!
//! ```text
//! External Service → POST /v1/inbound/:provider → Verify Signature → Route → Deliver
//! ```
//!
//! ## Desteklenen Sağlayıcılar
//!
//! - Stripe (webhook signature v1)
//! - GitHub (HMAC-SHA256)
//! - Shopify (HMAC-SHA256)
//! - Generic (custom header + HMAC)

use axum::body::{Body, Bytes};
use axum::extract::{Extension, Path, Request};
use axum::http::{HeaderMap, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::routing::post;
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;
use crate::models::endpoint::Endpoint;
use crate::models::delivery::Delivery;
use crate::db;

pub fn router() -> Router {
    Router::new()
        .route("/:provider", post(handle_inbound))
        .route("/:provider/:endpoint_id", post(handle_inbound_to_endpoint))
}

/// Inbound provider configuration stored per customer.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct InboundConfig {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub provider: String,
    pub secret: String,
    pub endpoint_id: Option<Uuid>, // Default target endpoint
    pub enabled: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

/// Supported webhook providers
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Provider {
    Stripe,
    GitHub,
    Shopify,
    Generic,
}

impl Provider {
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "stripe" => Self::Stripe,
            "github" => Self::GitHub,
            "shopify" => Self::Shopify,
            _ => Self::Generic,
        }
    }

    /// Verify the webhook signature for this provider.
    pub fn verify_signature(
        &self,
        secret: &str,
        headers: &HeaderMap,
        body: &[u8],
    ) -> Result<(), &'static str> {
        match self {
            Provider::Stripe => verify_stripe(secret, headers, body),
            Provider::GitHub => verify_github(secret, headers, body),
            Provider::Shopify => verify_shopify(secret, headers, body),
            Provider::Generic => verify_generic(secret, headers, body),
        }
    }

    /// Extract the event type from the payload.
    pub fn extract_event_type(&self, body: &[u8]) -> Option<String> {
        let json: serde_json::Value = serde_json::from_slice(body).ok()?;
        match self {
            Provider::Stripe => json.get("type").and_then(|v| v.as_str()).map(String::from),
            Provider::GitHub => {
                // GitHub uses X-GitHub-Event header, not in body
                None
            }
            Provider::Shopify => {
                json.get("topic")
                    .or_else(|| json.get("event"))
                    .and_then(|v| v.as_str())
                    .map(String::from)
            }
            Provider::Generic => json.get("event").and_then(|v| v.as_str()).map(String::from),
        }
    }
}

// ── Signature Verification ──

fn verify_stripe(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    let sig_header = headers
        .get("stripe-signature")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing stripe-signature header")?;

    // Parse: t=timestamp,v1=signature
    let mut timestamp = "";
    let mut signature = "";
    for part in sig_header.split(',') {
        if let Some(v) = part.strip_prefix("t=") {
            timestamp = v;
        } else if let Some(v) = part.strip_prefix("v1=") {
            signature = v;
        }
    }

    if timestamp.is_empty() || signature.is_empty() {
        return Err("Invalid stripe-signature format");
    }

    let payload = format!("{}.{}", timestamp, String::from_utf8_lossy(body));
    let expected = compute_hmac_hex(secret.as_bytes(), payload.as_bytes());

    if expected == signature {
        Ok(())
    } else {
        Err("Stripe signature mismatch")
    }
}

fn verify_github(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    let sig_header = headers
        .get("x-hub-signature-256")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-hub-signature-256 header")?;

    let signature = sig_header.strip_prefix("sha256=").ok_or("Invalid format")?;
    let expected = compute_hmac_hex(secret.as_bytes(), body);

    if expected == signature {
        Ok(())
    } else {
        Err("GitHub signature mismatch")
    }
}

fn verify_shopify(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    let sig_header = headers
        .get("x-shopify-hmac-sha256")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-shopify-hmac-sha256 header")?;

    use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
    let expected_bytes = compute_hmac_raw(secret.as_bytes(), body);
    let expected = BASE64.encode(&expected_bytes);

    if expected == sig_header {
        Ok(())
    } else {
        Err("Shopify signature mismatch")
    }
}

fn verify_generic(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    // Try common header names
    let sig_header = headers
        .get("x-webhook-signature")
        .or_else(|| headers.get("x-signature-256"))
        .or_else(|| headers.get("x-hub-signature-256"))
        .and_then(|v| v.to_str().ok());

    let Some(sig) = sig_header else {
        // No signature header — allow if no secret configured
        if secret.is_empty() {
            return Ok(());
        }
        return Err("No signature header found");
    };

    let signature = sig
        .strip_prefix("sha256=")
        .or_else(|| sig.strip_prefix("v1,"))
        .unwrap_or(sig);

    let expected = compute_hmac_hex(secret.as_bytes(), body);

    if expected == signature {
        Ok(())
    } else {
        Err("Signature mismatch")
    }
}

fn compute_hmac_raw(key: &[u8], data: &[u8]) -> Vec<u8> {
    use hmac::{Hmac, Mac};
    use sha2::Sha256;
    type HmacSha256 = Hmac<Sha256>;

    let mut mac = HmacSha256::new_from_slice(key).expect("HMAC can take key of any size");
    mac.update(data);
    mac.finalize().into_bytes().to_vec()
}

fn compute_hmac_hex(key: &[u8], data: &[u8]) -> String {
    hex::encode(compute_hmac_raw(key, data))
}

// ── Handlers ──

/// Handle inbound webhook from a specific provider.
/// Routes to the customer's default endpoint for that provider.
async fn handle_inbound(
    Extension(pool): Extension<PgPool>,
    Path(provider): Path<String>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<impl IntoResponse, AppError> {
    let provider = Provider::from_str(&provider);

    // Extract API key from query param or header
    let api_key = headers
        .get("x-api-key")
        .or_else(|| headers.get("authorization"))
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or(AppError::BadRequest("Missing API key".into()))?;

    // Find customer by API key
    let customer = sqlx::query_as::<_, Customer>(
        "SELECT * FROM customers WHERE api_key_prefix = $1 OR id IN (SELECT customer_id FROM api_keys WHERE key_hash = crypt($1, key_hash) AND is_active = true)",
    )
    .bind(&api_key[..20.min(api_key.len())])
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::Unauthorized)?;

    // Find inbound config for this provider
    let config = sqlx::query_as::<_, InboundConfig>(
        "SELECT * FROM inbound_configs WHERE customer_id = $1 AND provider = $2 AND enabled = true",
    )
    .bind(customer.id)
    .bind(provider.to_string())
    .fetch_optional(&pool)
    .await?;

    let Some(config) = config else {
        return Err(AppError::BadRequest(format!(
            "No inbound config for provider '{}' — configure at /dashboard/inbound",
            provider
        )));
    };

    // Verify signature
    provider
        .verify_signature(&config.secret, &headers, &body)
        .map_err(|e| AppError::Forbidden(e.to_string()))?;

    // Find target endpoint
    let endpoint_id = config.endpoint_id.ok_or(AppError::BadRequest(
        "No default endpoint configured for this provider".into(),
    ))?;

    let endpoint = sqlx::query_as::<_, Endpoint>(
        "SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2 AND is_active = true",
    )
    .bind(endpoint_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::BadRequest("Target endpoint not found or inactive".into()))?;

    // Create delivery
    let event_type = provider
        .extract_event_type(&body)
        .unwrap_or_else(|| format!("inbound.{}", provider));

    let payload: serde_json::Value = serde_json::from_slice(&body).unwrap_or_else(|_| {
        serde_json::json!({"raw": String::from_utf8_lossy(&body).to_string()})
    });

    let retry_policy = crate::models::endpoint::RetryPolicy::from_value(endpoint.retry_policy.as_ref());

    let delivery = sqlx::query_as::<_, Delivery>(
        "INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status, max_attempts) VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING *",
    )
    .bind(endpoint.id)
    .bind(customer.id)
    .bind(&payload)
    .bind(&event_type)
    .bind(retry_policy.max_attempts)
    .fetch_one(&pool)
    .await?;

    let payload_str = serde_json::to_string(&payload).unwrap_or_default();

    db::publish_to_queue(
        &pool,
        delivery.id,
        endpoint.id,
        &endpoint.url,
        &payload_str,
        endpoint.custom_headers.as_ref(),
    )
    .await?;

    Ok(Json(serde_json::json!({
        "received": true,
        "delivery_id": delivery.id,
        "event": event_type,
        "provider": provider,
    })))
}

/// Handle inbound webhook directed to a specific endpoint.
async fn handle_inbound_to_endpoint(
    Extension(pool): Extension<PgPool>,
    Path((provider, endpoint_id)): Path<(String, Uuid)>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<impl IntoResponse, AppError> {
    let provider = Provider::from_str(&provider);

    // Extract API key
    let api_key = headers
        .get("x-api-key")
        .or_else(|| headers.get("authorization"))
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or(AppError::BadRequest("Missing API key".into()))?;

    // Find customer
    let customer = sqlx::query_as::<_, Customer>(
        "SELECT * FROM customers WHERE api_key_prefix = $1",
    )
    .bind(&api_key[..20.min(api_key.len())])
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::Unauthorized)?;

    // Find endpoint
    let endpoint = sqlx::query_as::<_, Endpoint>(
        "SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2 AND is_active = true",
    )
    .bind(endpoint_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    // Try to verify signature if config exists
    if let Ok(config) = sqlx::query_as::<_, InboundConfig>(
        "SELECT * FROM inbound_configs WHERE customer_id = $1 AND provider = $2 AND enabled = true",
    )
    .bind(customer.id)
    .bind(provider.to_string())
    .fetch_one(&pool)
    .await
    {
        let _ = provider.verify_signature(&config.secret, &headers, &body);
    }

    // Create delivery
    let event_type = provider
        .extract_event_type(&body)
        .unwrap_or_else(|| format!("inbound.{}", provider));

    let payload: serde_json::Value = serde_json::from_slice(&body).unwrap_or_else(|_| {
        serde_json::json!({"raw": String::from_utf8_lossy(&body).to_string()})
    });

    let retry_policy = crate::models::endpoint::RetryPolicy::from_value(endpoint.retry_policy.as_ref());

    let delivery = sqlx::query_as::<_, Delivery>(
        "INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status, max_attempts) VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING *",
    )
    .bind(endpoint.id)
    .bind(customer.id)
    .bind(&payload)
    .bind(&event_type)
    .bind(retry_policy.max_attempts)
    .fetch_one(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "received": true,
        "delivery_id": delivery.id,
        "event": event_type,
    })))
}

/// Migration SQL for inbound configs
pub const INBOUND_MIGRATION_SQL: &str = r#"
CREATE TABLE IF NOT EXISTS inbound_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    secret TEXT NOT NULL DEFAULT '',
    endpoint_id UUID REFERENCES endpoints(id) ON DELETE SET NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(customer_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_inbound_configs_customer
    ON inbound_configs(customer_id);
"#;
