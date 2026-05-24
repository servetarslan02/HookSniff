//! Inbound Webhook Proxy
//!
//! Harici servislerden (Stripe, GitHub, Shopify vb.) gelen webhook'ları
//! alır, doğrular ve HookSniff endpoint'lerine yönlendirir.
//!
// TODO (Item 287): Local compute_hmac_raw/compute_hmac_hex duplicate hooksniff_common::signing.
//                 Refactor inbound providers to use the shared signing crate.
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
//! - Slack (HMAC-SHA256, v0 signature)
//! - Twilio (HMAC-SHA1)
//! - Discord (Ed25519)
//! - Linear (HMAC-SHA256)
//! - Notion (HMAC-SHA256 with timestamp)
//! - Generic (custom header + HMAC)

pub mod signature;
pub mod handlers;

use signature::*;
use handlers::*;

use axum::body::Bytes;
use axum::extract::{Extension, Path};
use axum::http::HeaderMap;
use axum::response::IntoResponse;
use axum::routing::{get, post, put};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::db;
use crate::routes::auth::CUSTOMER_SELECT;
use crate::error::AppError;
use crate::models::customer::Customer;
use crate::models::delivery::Delivery;
use crate::models::endpoint::Endpoint;

pub fn router() -> Router {
    Router::new()
        .route("/configs", get(list_configs).post(create_config))
        .route(
            "/configs/{id}",
            put(update_config).delete(delete_config),
        )
}

/// Public router — no auth middleware. External services call these.
/// Provider endpoints verify signatures themselves.
pub fn public_router() -> Router {
    Router::new()
        .route("/{provider}", post(handle_inbound))
        .route(
            "/{provider}/{endpoint_id}",
            post(handle_inbound_to_endpoint),
        )
}

/// Inbound provider configuration stored per customer.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct InboundConfig {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub provider: String,
    #[serde(skip_serializing, default)]
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
    Slack,
    Twilio,
    Discord,
    Linear,
    Notion,
    Generic,
}

impl std::fmt::Display for Provider {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Provider::Stripe => write!(f, "stripe"),
            Provider::GitHub => write!(f, "github"),
            Provider::Shopify => write!(f, "shopify"),
            Provider::Slack => write!(f, "slack"),
            Provider::Twilio => write!(f, "twilio"),
            Provider::Discord => write!(f, "discord"),
            Provider::Linear => write!(f, "linear"),
            Provider::Notion => write!(f, "notion"),
            Provider::Generic => write!(f, "generic"),
        }
    }
}

impl Provider {
    pub fn parse_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "stripe" => Self::Stripe,
            "github" => Self::GitHub,
            "shopify" => Self::Shopify,
            "slack" => Self::Slack,
            "twilio" => Self::Twilio,
            "discord" => Self::Discord,
            "linear" => Self::Linear,
            "notion" => Self::Notion,
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
            Provider::Slack => verify_slack(secret, headers, body),
            Provider::Twilio => verify_twilio(secret, headers, body),
            Provider::Discord => verify_discord(secret, headers, body),
            Provider::Linear => verify_linear(secret, headers, body),
            Provider::Notion => verify_notion(secret, headers, body),
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
            Provider::Shopify => json
                .get("topic")
                .or_else(|| json.get("event"))
                .and_then(|v| v.as_str())
                .map(String::from),
            Provider::Slack => json
                .get("event")
                .and_then(|e| e.get("type"))
                .and_then(|v| v.as_str())
                .map(String::from)
                .or_else(|| json.get("type").and_then(|v| v.as_str()).map(String::from)),
            Provider::Twilio => json
                .get("SmsStatus")
                .or_else(|| json.get("MessageStatus"))
                .or_else(|| json.get("CallStatus"))
                .and_then(|v| v.as_str())
                .map(String::from),
            Provider::Discord => json
                .get("t")
                .and_then(|v| v.as_str())
                .map(String::from),
            Provider::Linear => json
                .get("type")
                .and_then(|v| v.as_str())
                .map(String::from)
                .or_else(|| json.get("action").and_then(|v| v.as_str()).map(String::from)),
            Provider::Notion => json
                .get("type")
                .and_then(|v| v.as_str())
                .map(String::from),
            Provider::Generic => json.get("event").and_then(|v| v.as_str()).map(String::from),
        }
    }
}

// ── Config CRUD ──

#[derive(Debug, Deserialize)]
struct CreateConfigRequest {
    provider: String,
    secret: String,
    endpoint_id: Option<Uuid>,
    enabled: Option<bool>,
}

#[derive(Debug, Deserialize)]
struct UpdateConfigRequest {
    secret: Option<String>,
    endpoint_id: Option<Option<Uuid>>,
    enabled: Option<bool>,
}

/// GET /v1/inbound/configs — List inbound configs for the current customer
pub async fn list_configs(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<InboundConfig>>, AppError> {
    let configs = sqlx::query_as::<_, InboundConfig>(
        "SELECT id, customer_id, provider, secret, endpoint_id, enabled, created_at FROM inbound_configs WHERE customer_id = $1 ORDER BY created_at DESC",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(configs))
}

/// POST /v1/inbound/configs — Create a new inbound config
pub async fn create_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<CreateConfigRequest>,
) -> Result<Json<InboundConfig>, AppError> {
    let config = sqlx::query_as::<_, InboundConfig>(
        "INSERT INTO inbound_configs (id, customer_id, provider, secret, endpoint_id, enabled, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id, customer_id, provider, secret, endpoint_id, enabled, created_at",
    )
    .bind(Uuid::new_v4())
    .bind(customer.id)
    .bind(&req.provider)
    .bind(&req.secret)
    .bind(req.endpoint_id)
    .bind(req.enabled.unwrap_or(true))
    .fetch_one(&pool)
    .await?;

    Ok(Json(config))
}

/// PUT /v1/inbound/configs/{id} — Update an inbound config
pub async fn update_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateConfigRequest>,
) -> Result<Json<InboundConfig>, AppError> {
    // Verify ownership
    let existing = sqlx::query_as::<_, InboundConfig>(
        "SELECT id, customer_id, provider, secret, endpoint_id, enabled, created_at FROM inbound_configs WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let secret = req.secret.unwrap_or(existing.secret);
    let endpoint_id = req.endpoint_id.unwrap_or(existing.endpoint_id);
    let enabled = req.enabled.unwrap_or(existing.enabled);

    let config = sqlx::query_as::<_, InboundConfig>(
        "UPDATE inbound_configs SET secret = $1, endpoint_id = $2, enabled = $3 WHERE id = $4 RETURNING id, customer_id, provider, secret, endpoint_id, enabled, created_at",
    )
    .bind(&secret)
    .bind(endpoint_id)
    .bind(enabled)
    .bind(id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(config))
}

/// DELETE /v1/inbound/configs/{id} — Delete an inbound config
pub async fn delete_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let deleted = sqlx::query(
        "DELETE FROM inbound_configs WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .execute(&pool)
    .await?;

    if deleted.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({"deleted": true})))
}

