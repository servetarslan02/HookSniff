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
    #[serde(skip_serializing)]
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

// ── Signature Verification ──

fn verify_stripe(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    if secret.is_empty() {
        return Err("Inbound webhook secret not configured");
    }

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

    if constant_time_eq(&expected, signature) {
        Ok(())
    } else {
        Err("Stripe signature mismatch")
    }
}

fn verify_github(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    if secret.is_empty() {
        return Err("Inbound webhook secret not configured");
    }

    let sig_header = headers
        .get("x-hub-signature-256")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-hub-signature-256 header")?;

    let signature = sig_header.strip_prefix("sha256=").ok_or("Invalid format")?;
    let expected = compute_hmac_hex(secret.as_bytes(), body);

    if constant_time_eq(&expected, signature) {
        Ok(())
    } else {
        Err("GitHub signature mismatch")
    }
}

fn verify_shopify(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    if secret.is_empty() {
        return Err("Inbound webhook secret not configured");
    }

    let sig_header = headers
        .get("x-shopify-hmac-sha256")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-shopify-hmac-sha256 header")?;

    use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
    let expected_bytes = compute_hmac_raw(secret.as_bytes(), body);
    let expected = BASE64.encode(&expected_bytes);

    if constant_time_eq(&expected, sig_header) {
        Ok(())
    } else {
        Err("Shopify signature mismatch")
    }
}

fn verify_generic(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    let sig_header = headers
        .get("x-hooksniff-signature")
        .and_then(|v| v.to_str().ok());

    let Some(sig) = sig_header else {
        // No signature header — reject if secret is configured
        if secret.is_empty() {
            return Err("No secret configured — cannot verify webhook authenticity");
        }
        return Err("No signature header found");
    };

    let signature = sig
        .strip_prefix("sha256=")
        .or_else(|| sig.strip_prefix("v1,"))
        .unwrap_or(sig);

    let expected = compute_hmac_hex(secret.as_bytes(), body);

    if constant_time_eq(&expected, signature) {
        Ok(())
    } else {
        Err("Signature mismatch")
    }
}

/// Slack webhook signature verification (v0).
/// Header: X-Slack-Signature: v0=<hex>
/// Payload: v0:<timestamp>:<body>
fn verify_slack(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    if secret.is_empty() {
        return Err("Inbound webhook secret not configured");
    }

    let sig_header = headers
        .get("x-slack-signature")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-slack-signature header")?;

    let timestamp = headers
        .get("x-slack-request-timestamp")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-slack-request-timestamp header")?;

    let signature = sig_header.strip_prefix("v0=").ok_or("Invalid Slack signature format")?;

    let payload = format!("v0:{}:{}", timestamp, String::from_utf8_lossy(body));
    let expected = compute_hmac_hex(secret.as_bytes(), payload.as_bytes());

    if constant_time_eq(&expected, signature) {
        Ok(())
    } else {
        Err("Slack signature mismatch")
    }
}

/// Twilio webhook signature verification.
/// Header: X-Twilio-Signature (Base64 of HMAC-SHA1)
/// Signed data: URL + sorted POST params
fn verify_twilio(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    if secret.is_empty() {
        return Err("Inbound webhook secret not configured");
    }

    let sig_header = headers
        .get("x-twilio-signature")
        .or_else(|| headers.get("x-twilio-signature-env"))
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-twilio-signature header")?;

    // Twilio uses SHA1 for signature (not SHA256)
    use hmac::{Hmac, Mac};
    use sha1::Sha1;
    type HmacSha1 = Hmac<Sha1>;

    // Parse form body and build sorted signature base
    let body_str = String::from_utf8_lossy(body);
    let url = headers
        .get("x-forwarded-uri")
        .or_else(|| headers.get("x-original-uri"))
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    // Build signed data: URL + sorted params
    let mut params: Vec<(&str, &str)> = body_str
        .split('&')
        .filter_map(|pair| {
            let mut parts = pair.splitn(2, '=');
            Some((parts.next()?, parts.next().unwrap_or("")))
        })
        .collect();
    params.sort_by_key(|(k, _)| *k);

    let mut signed_data = url.to_string();
    for (k, v) in &params {
        signed_data.push_str(k);
        signed_data.push_str(v);
    }

    let mut mac =
        HmacSha1::new_from_slice(secret.as_bytes()).expect("HMAC can take key of any size");
    mac.update(signed_data.as_bytes());
    let expected_bytes = mac.finalize().into_bytes();

    use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
    let expected = BASE64.encode(&expected_bytes);

    if constant_time_eq(&expected, sig_header) {
        Ok(())
    } else {
        Err("Twilio signature mismatch")
    }
}

/// Discord webhook signature verification (Ed25519).
/// Header: X-Signature-Ed25519 (hex), X-Signature-Timestamp
/// Signed data: timestamp + body
fn verify_discord(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    if secret.is_empty() {
        return Err("Inbound webhook secret not configured");
    }

    let signature_hex = headers
        .get("x-signature-ed25519")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-signature-ed25519 header")?;

    let timestamp = headers
        .get("x-signature-timestamp")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-signature-timestamp header")?;

    // Discord uses Ed25519 — the "secret" is the hex-encoded public key
    // Parse public key from hex (32 bytes)
    let public_key_bytes = hex::decode(secret).map_err(|_| "Invalid Discord public key hex")?;
    if public_key_bytes.len() != 32 {
        return Err("Discord public key must be 32 bytes (64 hex chars)");
    }

    // Parse signature from hex (64 bytes)
    let signature_bytes = hex::decode(signature_hex).map_err(|_| "Invalid Discord signature hex")?;
    if signature_bytes.len() != 64 {
        return Err("Discord signature must be 64 bytes (128 hex chars)");
    }

    // Build signed message: timestamp + body
    let mut message = timestamp.as_bytes().to_vec();
    message.extend_from_slice(body);

    // Verify Ed25519 signature
    use ed25519_dalek::{Signature, Verifier, VerifyingKey};
    let verifying_key =
        VerifyingKey::from_bytes(&public_key_bytes.try_into().map_err(|_| "Invalid key length")?)
            .map_err(|_| "Invalid Discord public key")?;
    let signature = Signature::from_bytes(&signature_bytes.try_into().map_err(|_| "Invalid signature length")?);

    verifying_key
        .verify(&message, &signature)
        .map_err(|_| "Discord signature mismatch")
}

/// Linear webhook signature verification.
/// Header: Linear-Signature (hex HMAC-SHA256)
/// Signed data: raw body
fn verify_linear(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    if secret.is_empty() {
        return Err("Inbound webhook secret not configured");
    }

    let sig_header = headers
        .get("linear-signature")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing linear-signature header")?;

    let expected = compute_hmac_hex(secret.as_bytes(), body);

    if constant_time_eq(&expected, sig_header) {
        Ok(())
    } else {
        Err("Linear signature mismatch")
    }
}

/// Notion webhook signature verification.
/// Header: X-Notion-Signature (hex HMAC-SHA256 with timestamp prefix)
/// Signed data: timestamp.body
fn verify_notion(secret: &str, headers: &HeaderMap, body: &[u8]) -> Result<(), &'static str> {
    if secret.is_empty() {
        return Err("Inbound webhook secret not configured");
    }

    let sig_header = headers
        .get("x-notion-signature")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-notion-signature header")?;

    let timestamp = headers
        .get("x-notion-timestamp")
        .and_then(|v| v.to_str().ok())
        .ok_or("Missing x-notion-timestamp header")?;

    // Notion signature: HMAC-SHA256(secret, "timestamp.body")
    let payload = format!("{}.{}", timestamp, String::from_utf8_lossy(body));
    let expected = compute_hmac_hex(secret.as_bytes(), payload.as_bytes());

    // Notion may prefix with sha256=
    let signature = sig_header
        .strip_prefix("sha256=")
        .unwrap_or(sig_header);

    if constant_time_eq(&expected, signature) {
        Ok(())
    } else {
        Err("Notion signature mismatch")
    }
}

fn compute_hmac_raw(key: &[u8], data: &[u8]) -> Vec<u8> {
    use hmac::{Hmac, KeyInit, Mac};
    use sha2::Sha256;
    type HmacSha256 = Hmac<Sha256>;

    let mut mac = HmacSha256::new_from_slice(key).expect("HMAC can take key of any size");
    mac.update(data);
    mac.finalize().into_bytes().to_vec()
}

fn compute_hmac_hex(key: &[u8], data: &[u8]) -> String {
    hex::encode(compute_hmac_raw(key, data))
}

/// Constant-time hex string comparison to prevent timing attacks.
fn constant_time_eq(a: &str, b: &str) -> bool {
    if a.len() != b.len() {
        return false;
    }
    let mut diff = 0u8;
    for (x, y) in a.bytes().zip(b.bytes()) {
        diff |= x ^ y;
    }
    diff == 0
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
async fn list_configs(
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
async fn create_config(
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
async fn update_config(
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
async fn delete_config(
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

// ── Handlers ──

/// Handle inbound webhook from a specific provider.
/// Routes to the customer's default endpoint for that provider.
async fn handle_inbound(
    Extension(pool): Extension<PgPool>,
    Path(provider): Path<String>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<impl IntoResponse, AppError> {
    let provider = Provider::parse_str(&provider);

    // Extract API key from query param or header
    let api_key = headers
        .get("x-api-key")
        .or_else(|| headers.get("authorization"))
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or(AppError::BadRequest("Missing API key".into()))?;

    // Find customer by API key (prefix-based lookup + Argon2 verification)
    // Use 24-char prefix to match DB storage (api_key_prefix)
    let prefix = &api_key[..24.min(api_key.len())];
    let candidates =
        sqlx::query_as::<_, Customer>(&format!("{} WHERE api_key_prefix = $1", CUSTOMER_SELECT))
            .bind(prefix)
            .fetch_all(&pool)
            .await?;

    let mut customer = None;
    for c in &candidates {
        if crate::middleware::verify_api_key(api_key, &c.api_key_hash) {
            customer = Some(c.clone());
            break;
        }
    }

    // Also check api_keys table
    if customer.is_none() {
        let api_key_rows: Vec<(String, uuid::Uuid)> = sqlx::query_as(
            "SELECT key_hash, customer_id FROM api_keys WHERE api_key_prefix = $1 AND is_active = true",
        )
        .bind(prefix)
        .fetch_all(&pool)
        .await?;

        for (hash, customer_id) in &api_key_rows {
            if crate::middleware::verify_api_key(api_key, hash) {
                customer = sqlx::query_as::<_, Customer>(&format!("{} WHERE id = $1", CUSTOMER_SELECT))
                    .bind(customer_id)
                    .fetch_optional(&pool)
                    .await?;
                break;
            }
        }
    }

    let customer = customer.ok_or(AppError::Unauthorized)?;

    // Find inbound config for this provider
    let config = sqlx::query_as::<_, InboundConfig>(
        "SELECT id, customer_id, provider, secret, endpoint_id, enabled, created_at FROM inbound_configs WHERE customer_id = $1 AND provider = $2 AND enabled = true",
    )
    .bind(customer.id)
    .bind(provider.to_string())
    .fetch_optional(&pool)
    .await?;

    let Some(config) = config else {
        tracing::warn!("No inbound config for provider '{}'", provider);
        return Err(AppError::BadRequest(
            "No inbound configuration found for this provider".into(),
        ));
    };

    // Verify signature — reject if secret is empty (signature verification must be configured)
    if config.secret.is_empty() {
        tracing::warn!(
            "❌ Inbound config for provider '{}' has empty secret — rejecting request (customer={})",
            provider,
            customer.id
        );
        return Err(AppError::Forbidden(
            "Webhook secret not configured. Set a secret in your inbound config.".into(),
        ));
    }

    provider
        .verify_signature(&config.secret, &headers, &body)
        .map_err(|e| {
            tracing::warn!("Inbound webhook signature verification failed: {:?}", e);
            AppError::Unauthorized
        })?;

    // Find target endpoint
    let endpoint_id = config.endpoint_id.ok_or(AppError::BadRequest(
        "No default endpoint configured for this provider".into(),
    ))?;

    let endpoint = sqlx::query_as::<_, Endpoint>(
        "SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = $1 AND customer_id = $2 AND is_active = true",
    )
    .bind(endpoint_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::BadRequest(
        "Target endpoint not found or inactive".into(),
    ))?;

    // Create delivery
    let event_type = provider
        .extract_event_type(&body)
        .unwrap_or_else(|| format!("inbound.{}", provider));

    let payload: serde_json::Value = serde_json::from_slice(&body)
        .unwrap_or_else(|_| serde_json::json!({"raw": String::from_utf8_lossy(&body).to_string()}));

    let retry_policy =
        crate::models::endpoint::RetryPolicy::from_value(endpoint.retry_policy.as_ref());

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
    let provider = Provider::parse_str(&provider);

    // Extract API key
    let api_key = headers
        .get("x-api-key")
        .or_else(|| headers.get("authorization"))
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or(AppError::BadRequest("Missing API key".into()))?;

    // Find customer by API key (prefix-based lookup + Argon2 verification)
    // Use 24-char prefix to match DB storage (api_key_prefix)
    let prefix = &api_key[..24.min(api_key.len())];
    let candidates =
        sqlx::query_as::<_, Customer>(&format!("{} WHERE api_key_prefix = $1", CUSTOMER_SELECT))
            .bind(prefix)
            .fetch_all(&pool)
            .await?;

    let mut customer = None;
    for c in &candidates {
        if crate::middleware::verify_api_key(api_key, &c.api_key_hash) {
            customer = Some(c.clone());
            break;
        }
    }

    // Also check api_keys table
    if customer.is_none() {
        let api_key_rows: Vec<(String, uuid::Uuid)> = sqlx::query_as(
            "SELECT key_hash, customer_id FROM api_keys WHERE api_key_prefix = $1 AND is_active = true",
        )
        .bind(prefix)
        .fetch_all(&pool)
        .await?;

        for (hash, customer_id) in &api_key_rows {
            if crate::middleware::verify_api_key(api_key, hash) {
                customer = sqlx::query_as::<_, Customer>(&format!("{} WHERE id = $1", CUSTOMER_SELECT))
                    .bind(customer_id)
                    .fetch_optional(&pool)
                    .await?;
                break;
            }
        }
    }

    let customer = customer.ok_or(AppError::Unauthorized)?;

    // Find endpoint
    let endpoint = sqlx::query_as::<_, Endpoint>(
        "SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = $1 AND customer_id = $2 AND is_active = true",
    )
    .bind(endpoint_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    // Verify signature if config exists — reject if secret is empty
    if let Ok(config) = sqlx::query_as::<_, InboundConfig>(
        "SELECT id, customer_id, provider, secret, endpoint_id, enabled, created_at FROM inbound_configs WHERE customer_id = $1 AND provider = $2 AND enabled = true",
    )
    .bind(customer.id)
    .bind(provider.to_string())
    .fetch_one(&pool)
    .await
    {
        if config.secret.is_empty() {
            tracing::warn!(
                "❌ Inbound config for provider '{}' has empty secret — rejecting request (customer={})",
                provider,
                customer.id
            );
            return Err(AppError::Forbidden(
                "Webhook secret not configured. Set a secret in your inbound config.".into(),
            ));
        }
        if let Err(e) = provider.verify_signature(&config.secret, &headers, &body) {
            tracing::warn!(
                "❌ Inbound webhook signature verification failed for provider={} customer={}: {}",
                provider,
                customer.id,
                e
            );
            return Err(AppError::Unauthorized);
        }
    } else {
        // No inbound config found — reject the request
        tracing::warn!("No inbound config for provider '{}'", provider);
        return Err(AppError::BadRequest(
            "No inbound configuration found for this provider".into(),
        ));
    }

    // Create delivery
    let event_type = provider
        .extract_event_type(&body)
        .unwrap_or_else(|| format!("inbound.{}", provider));

    let payload: serde_json::Value = serde_json::from_slice(&body)
        .unwrap_or_else(|_| serde_json::json!({"raw": String::from_utf8_lossy(&body).to_string()}));

    let retry_policy =
        crate::models::endpoint::RetryPolicy::from_value(endpoint.retry_policy.as_ref());

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

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::HeaderValue;

    // ── Provider enum ───────────────────────────────────────

    #[test]
    fn test_provider_parse_str() {
        assert_eq!(Provider::parse_str("stripe"), Provider::Stripe);
        assert_eq!(Provider::parse_str("STRIPE"), Provider::Stripe);
        assert_eq!(Provider::parse_str("Stripe"), Provider::Stripe);
        assert_eq!(Provider::parse_str("github"), Provider::GitHub);
        assert_eq!(Provider::parse_str("GitHub"), Provider::GitHub);
        assert_eq!(Provider::parse_str("shopify"), Provider::Shopify);
        assert_eq!(Provider::parse_str("SHOPIFY"), Provider::Shopify);
        assert_eq!(Provider::parse_str("slack"), Provider::Slack);
        assert_eq!(Provider::parse_str("SLACK"), Provider::Slack);
        assert_eq!(Provider::parse_str("twilio"), Provider::Twilio);
        assert_eq!(Provider::parse_str("TWILIO"), Provider::Twilio);
        assert_eq!(Provider::parse_str("discord"), Provider::Discord);
        assert_eq!(Provider::parse_str("DISCORD"), Provider::Discord);
        assert_eq!(Provider::parse_str("linear"), Provider::Linear);
        assert_eq!(Provider::parse_str("LINEAR"), Provider::Linear);
        assert_eq!(Provider::parse_str("notion"), Provider::Notion);
        assert_eq!(Provider::parse_str("NOTION"), Provider::Notion);
        assert_eq!(Provider::parse_str("unknown"), Provider::Generic);
        assert_eq!(Provider::parse_str(""), Provider::Generic);
        assert_eq!(Provider::parse_str("random"), Provider::Generic);
    }

    #[test]
    fn test_provider_display() {
        assert_eq!(Provider::Stripe.to_string(), "stripe");
        assert_eq!(Provider::GitHub.to_string(), "github");
        assert_eq!(Provider::Shopify.to_string(), "shopify");
        assert_eq!(Provider::Slack.to_string(), "slack");
        assert_eq!(Provider::Twilio.to_string(), "twilio");
        assert_eq!(Provider::Discord.to_string(), "discord");
        assert_eq!(Provider::Linear.to_string(), "linear");
        assert_eq!(Provider::Notion.to_string(), "notion");
        assert_eq!(Provider::Generic.to_string(), "generic");
    }

    #[test]
    fn test_provider_serialization_roundtrip() {
        let providers = vec![
            Provider::Stripe,
            Provider::GitHub,
            Provider::Shopify,
            Provider::Slack,
            Provider::Twilio,
            Provider::Discord,
            Provider::Linear,
            Provider::Notion,
            Provider::Generic,
        ];
        for p in providers {
            let json = serde_json::to_string(&p).unwrap();
            let deserialized: Provider = serde_json::from_str(&json).unwrap();
            assert_eq!(deserialized, p);
        }
    }

    #[test]
    fn test_provider_deserialization_lowercase() {
        let p: Provider = serde_json::from_str(r#""stripe""#).unwrap();
        assert_eq!(p, Provider::Stripe);
        let p: Provider = serde_json::from_str(r#""github""#).unwrap();
        assert_eq!(p, Provider::GitHub);
        let p: Provider = serde_json::from_str(r#""shopify""#).unwrap();
        assert_eq!(p, Provider::Shopify);
        let p: Provider = serde_json::from_str(r#""slack""#).unwrap();
        assert_eq!(p, Provider::Slack);
        let p: Provider = serde_json::from_str(r#""twilio""#).unwrap();
        assert_eq!(p, Provider::Twilio);
        let p: Provider = serde_json::from_str(r#""discord""#).unwrap();
        assert_eq!(p, Provider::Discord);
        let p: Provider = serde_json::from_str(r#""linear""#).unwrap();
        assert_eq!(p, Provider::Linear);
        let p: Provider = serde_json::from_str(r#""notion""#).unwrap();
        assert_eq!(p, Provider::Notion);
        let p: Provider = serde_json::from_str(r#""generic""#).unwrap();
        assert_eq!(p, Provider::Generic);
    }

    #[test]
    fn test_provider_partial_eq() {
        assert_eq!(Provider::Stripe, Provider::Stripe);
        assert_ne!(Provider::Stripe, Provider::GitHub);
        assert_ne!(Provider::Generic, Provider::Shopify);
    }

    #[test]
    fn test_provider_clone() {
        let p = Provider::Stripe;
        let cloned = p.clone();
        assert_eq!(p, cloned);
    }

    #[test]
    fn test_provider_debug() {
        let _ = format!("{:?}", Provider::GitHub);
    }

    // ── Provider::extract_event_type ────────────────────────

    #[test]
    fn test_extract_event_type_stripe() {
        let body = r#"{"type":"checkout.session.completed","data":{}}"#;
        let event = Provider::Stripe.extract_event_type(body.as_bytes());
        assert_eq!(event, Some("checkout.session.completed".to_string()));
    }

    #[test]
    fn test_extract_event_type_github_always_none() {
        // GitHub uses header, not body
        let body = r#"{"action":"opened"}"#;
        let event = Provider::GitHub.extract_event_type(body.as_bytes());
        assert!(event.is_none());
    }

    #[test]
    fn test_extract_event_type_shopify_topic() {
        let body = r#"{"topic":"orders/create"}"#;
        let event = Provider::Shopify.extract_event_type(body.as_bytes());
        assert_eq!(event, Some("orders/create".to_string()));
    }

    #[test]
    fn test_extract_event_type_shopify_event() {
        let body = r#"{"event":"orders/create"}"#;
        let event = Provider::Shopify.extract_event_type(body.as_bytes());
        assert_eq!(event, Some("orders/create".to_string()));
    }

    #[test]
    fn test_extract_event_type_generic() {
        let body = r#"{"event":"custom.event"}"#;
        let event = Provider::Generic.extract_event_type(body.as_bytes());
        assert_eq!(event, Some("custom.event".to_string()));
    }

    #[test]
    fn test_extract_event_type_generic_no_event() {
        let body = r#"{"data":"something"}"#;
        let event = Provider::Generic.extract_event_type(body.as_bytes());
        assert!(event.is_none());
    }

    #[test]
    fn test_extract_event_type_invalid_json() {
        let body = b"not json";
        let event = Provider::Stripe.extract_event_type(body);
        assert!(event.is_none());
    }

    // ── New provider extract_event_type ─────────────────────

    #[test]
    fn test_extract_event_type_slack_event_type() {
        let body = r#"{"type":"event_callback","event":{"type":"message"}}"#;
        let event = Provider::Slack.extract_event_type(body.as_bytes());
        assert_eq!(event, Some("message".to_string()));
    }

    #[test]
    fn test_extract_event_type_slack_fallback_type() {
        let body = r#"{"type":"url_verification"}"#;
        let event = Provider::Slack.extract_event_type(body.as_bytes());
        assert_eq!(event, Some("url_verification".to_string()));
    }

    #[test]
    fn test_extract_event_type_twilio_sms() {
        let body = r#"{"SmsStatus":"delivered","MessageSid":"SM123"}"#;
        let event = Provider::Twilio.extract_event_type(body.as_bytes());
        assert_eq!(event, Some("delivered".to_string()));
    }

    #[test]
    fn test_extract_event_type_twilio_call() {
        let body = r#"{"CallStatus":"completed","CallSid":"CA123"}"#;
        let event = Provider::Twilio.extract_event_type(body.as_bytes());
        assert_eq!(event, Some("completed".to_string()));
    }

    #[test]
    fn test_extract_event_type_discord() {
        let body = r#"{"t":"MESSAGE_CREATE","d":{"content":"hello"}}"#;
        let event = Provider::Discord.extract_event_type(body.as_bytes());
        assert_eq!(event, Some("MESSAGE_CREATE".to_string()));
    }

    #[test]
    fn test_extract_event_type_linear_type() {
        let body = r#"{"type":"Issue","action":"create"}"#;
        let event = Provider::Linear.extract_event_type(body.as_bytes());
        assert_eq!(event, Some("Issue".to_string()));
    }

    #[test]
    fn test_extract_event_type_linear_action_fallback() {
        let body = r#"{"action":"update"}"#;
        let event = Provider::Linear.extract_event_type(body.as_bytes());
        assert_eq!(event, Some("update".to_string()));
    }

    #[test]
    fn test_extract_event_type_notion() {
        let body = r#"{"type":"page.created"}"#;
        let event = Provider::Notion.extract_event_type(body.as_bytes());
        assert_eq!(event, Some("page.created".to_string()));
    }

    // ── Slack signature verification ────────────────────────

    #[test]
    fn test_verify_slack_missing_header() {
        let headers = HeaderMap::new();
        let result = verify_slack("secret", &headers, b"body");
        assert!(result.is_err());
    }

    #[test]
    fn test_verify_slack_valid_signature() {
        let secret = "slack_secret";
        let body = b"payload";
        let timestamp = "1234567890";
        let payload = format!("v0:{}:{}", timestamp, String::from_utf8_lossy(body));
        let sig = compute_hmac_hex(secret.as_bytes(), payload.as_bytes());

        let mut headers = HeaderMap::new();
        headers.insert("x-slack-signature", HeaderValue::from_str(&format!("v0={}", sig)).unwrap());
        headers.insert("x-slack-request-timestamp", HeaderValue::from_str(timestamp).unwrap());
        let result = verify_slack(secret, &headers, body);
        assert!(result.is_ok());
    }

    #[test]
    fn test_verify_slack_signature_mismatch() {
        let mut headers = HeaderMap::new();
        headers.insert("x-slack-signature", HeaderValue::from_static("v0=wrong"));
        headers.insert("x-slack-request-timestamp", HeaderValue::from_static("123"));
        let result = verify_slack("secret", &headers, b"body");
        assert!(result.is_err());
    }

    // ── Linear signature verification ───────────────────────

    #[test]
    fn test_verify_linear_missing_header() {
        let headers = HeaderMap::new();
        let result = verify_linear("secret", &headers, b"body");
        assert!(result.is_err());
    }

    #[test]
    fn test_verify_linear_valid_signature() {
        let secret = "linear_secret";
        let body = b"payload";
        let sig = compute_hmac_hex(secret.as_bytes(), body);

        let mut headers = HeaderMap::new();
        headers.insert("linear-signature", HeaderValue::from_str(&sig).unwrap());
        let result = verify_linear(secret, &headers, body);
        assert!(result.is_ok());
    }

    #[test]
    fn test_verify_linear_signature_mismatch() {
        let mut headers = HeaderMap::new();
        headers.insert("linear-signature", HeaderValue::from_static("wrong_sig"));
        let result = verify_linear("secret", &headers, b"body");
        assert!(result.is_err());
    }

    // ── Notion signature verification ───────────────────────

    #[test]
    fn test_verify_notion_missing_header() {
        let headers = HeaderMap::new();
        let result = verify_notion("secret", &headers, b"body");
        assert!(result.is_err());
    }

    #[test]
    fn test_verify_notion_valid_signature() {
        let secret = "notion_secret";
        let body = b"payload";
        let timestamp = "1234567890";
        let payload = format!("{}.{}", timestamp, String::from_utf8_lossy(body));
        let sig = compute_hmac_hex(secret.as_bytes(), payload.as_bytes());

        let mut headers = HeaderMap::new();
        headers.insert("x-notion-signature", HeaderValue::from_str(&format!("sha256={}", sig)).unwrap());
        headers.insert("x-notion-timestamp", HeaderValue::from_str(timestamp).unwrap());
        let result = verify_notion(secret, &headers, body);
        assert!(result.is_ok());
    }

    #[test]
    fn test_verify_notion_signature_mismatch() {
        let mut headers = HeaderMap::new();
        headers.insert("x-notion-signature", HeaderValue::from_static("sha256=wrong"));
        headers.insert("x-notion-timestamp", HeaderValue::from_static("123"));
        let result = verify_notion("secret", &headers, b"body");
        assert!(result.is_err());
    }

    // ── HMAC computation ────────────────────────────────────

    #[test]
    fn test_compute_hmac_hex_deterministic() {
        let h1 = compute_hmac_hex(b"secret", b"data");
        let h2 = compute_hmac_hex(b"secret", b"data");
        assert_eq!(h1, h2);
    }

    #[test]
    fn test_compute_hmac_hex_different_keys() {
        let h1 = compute_hmac_hex(b"key1", b"data");
        let h2 = compute_hmac_hex(b"key2", b"data");
        assert_ne!(h1, h2);
    }

    #[test]
    fn test_compute_hmac_hex_different_data() {
        let h1 = compute_hmac_hex(b"key", b"data1");
        let h2 = compute_hmac_hex(b"key", b"data2");
        assert_ne!(h1, h2);
    }

    #[test]
    fn test_compute_hmac_raw_returns_bytes() {
        let raw = compute_hmac_raw(b"key", b"data");
        assert_eq!(raw.len(), 32); // SHA-256 = 32 bytes
    }

    #[test]
    fn test_compute_hmac_hex_is_hex_string() {
        let hex = compute_hmac_hex(b"key", b"data");
        assert_eq!(hex.len(), 64); // 32 bytes * 2 hex chars
        assert!(hex.chars().all(|c| c.is_ascii_hexdigit()));
    }

    // ── GitHub signature verification ───────────────────────

    #[test]
    fn test_verify_github_missing_header() {
        let headers = HeaderMap::new();
        let result = verify_github("secret", &headers, b"body");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Missing x-hub-signature-256 header");
    }

    #[test]
    fn test_verify_github_invalid_format() {
        let mut headers = HeaderMap::new();
        headers.insert("x-hub-signature-256", HeaderValue::from_static("invalid"));
        let result = verify_github("secret", &headers, b"body");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Invalid format");
    }

    #[test]
    fn test_verify_github_signature_mismatch() {
        let mut headers = HeaderMap::new();
        headers.insert(
            "x-hub-signature-256",
            HeaderValue::from_static(
                "sha256=0000000000000000000000000000000000000000000000000000000000000000",
            ),
        );
        let result = verify_github("secret", &headers, b"body");
        assert!(result.is_err());
    }

    #[test]
    fn test_verify_github_signature_valid() {
        let secret = "my_github_secret";
        let body = b"webhook payload";
        let expected = compute_hmac_hex(secret.as_bytes(), body);
        let header_value = format!("sha256={}", expected);

        let mut headers = HeaderMap::new();
        headers.insert(
            "x-hub-signature-256",
            HeaderValue::from_str(&header_value).unwrap(),
        );
        let result = verify_github(secret, &headers, body);
        assert!(result.is_ok());
    }

    // ── Stripe signature verification ───────────────────────

    #[test]
    fn test_verify_stripe_missing_header() {
        let headers = HeaderMap::new();
        let result = verify_stripe("secret", &headers, b"body");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Missing stripe-signature header");
    }

    #[test]
    fn test_verify_stripe_invalid_format() {
        let mut headers = HeaderMap::new();
        headers.insert("stripe-signature", HeaderValue::from_static("invalid"));
        let result = verify_stripe("secret", &headers, b"body");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Invalid stripe-signature format");
    }

    #[test]
    fn test_verify_stripe_valid_signature() {
        let secret = "whsec_test123";
        let body = b"stripe payload";
        let timestamp = "1234567890";
        let payload = format!("{}.{}", timestamp, String::from_utf8_lossy(body));
        let sig = compute_hmac_hex(secret.as_bytes(), payload.as_bytes());
        let header_value = format!("t={},v1={}", timestamp, sig);

        let mut headers = HeaderMap::new();
        headers.insert(
            "stripe-signature",
            HeaderValue::from_str(&header_value).unwrap(),
        );
        let result = verify_stripe(secret, &headers, body);
        assert!(result.is_ok());
    }

    #[test]
    fn test_verify_stripe_signature_mismatch() {
        let mut headers = HeaderMap::new();
        headers.insert(
            "stripe-signature",
            HeaderValue::from_static("t=123,v1=wrong"),
        );
        let result = verify_stripe("secret", &headers, b"body");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Stripe signature mismatch");
    }

    // ── Shopify signature verification ──────────────────────

    #[test]
    fn test_verify_shopify_missing_header() {
        let headers = HeaderMap::new();
        let result = verify_shopify("secret", &headers, b"body");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Missing x-shopify-hmac-sha256 header");
    }

    #[test]
    fn test_verify_shopify_signature_mismatch() {
        let mut headers = HeaderMap::new();
        headers.insert(
            "x-shopify-hmac-sha256",
            HeaderValue::from_static("dGVzdA=="),
        );
        let result = verify_shopify("secret", &headers, b"body");
        assert!(result.is_err());
    }

    // ── Generic signature verification ──────────────────────

    #[test]
    fn test_verify_generic_no_header_no_secret() {
        let headers = HeaderMap::new();
        // Empty secret with no header — should fail (can't verify authenticity)
        let result = verify_generic("", &headers, b"body");
        assert!(result.is_err());
        assert_eq!(
            result.unwrap_err(),
            "No secret configured — cannot verify webhook authenticity"
        );
    }

    #[test]
    fn test_verify_generic_no_header_with_secret() {
        let headers = HeaderMap::new();
        let result = verify_generic("secret", &headers, b"body");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "No signature header found");
    }

    #[test]
    fn test_verify_generic_valid_signature() {
        let secret = "generic_secret";
        let body = b"payload";
        let sig = compute_hmac_hex(secret.as_bytes(), body);
        let header_value = format!("sha256={}", sig);

        let mut headers = HeaderMap::new();
        headers.insert(
            "x-hooksniff-signature",
            HeaderValue::from_str(&header_value).unwrap(),
        );
        let result = verify_generic(secret, &headers, body);
        assert!(result.is_ok());
    }

    #[test]
    fn test_verify_generic_x_signature_256_header() {
        let secret = "generic_secret";
        let body = b"payload";
        let sig = compute_hmac_hex(secret.as_bytes(), body);

        let mut headers = HeaderMap::new();
        headers.insert("x-hooksniff-signature", HeaderValue::from_str(&sig).unwrap());
        let result = verify_generic(secret, &headers, body);
        assert!(result.is_ok());
    }

    // ── Provider::verify_signature ──────────────────────────

    #[test]
    fn test_provider_verify_signature_delegates_correctly() {
        let headers = HeaderMap::new();
        // GitHub with missing header should fail
        let result = Provider::GitHub.verify_signature("secret", &headers, b"body");
        assert!(result.is_err());
    }

    // ── InboundConfig ───────────────────────────────────────

    #[test]
    fn test_inbound_config_serialization_roundtrip() {
        let config = InboundConfig {
            id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            provider: "stripe".to_string(),
            secret: "whsec_abc".to_string(),
            endpoint_id: Some(Uuid::new_v4()),
            enabled: true,
            created_at: chrono::Utc::now(),
        };
        let json = serde_json::to_string(&config).unwrap();
        let deserialized: InboundConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.provider, "stripe");
        assert!(deserialized.enabled);
    }

    #[test]
    fn test_inbound_config_none_endpoint() {
        let config = InboundConfig {
            id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            provider: "github".to_string(),
            secret: "secret".to_string(),
            endpoint_id: None,
            enabled: false,
            created_at: chrono::Utc::now(),
        };
        let json = serde_json::to_value(&config).unwrap();
        assert!(json["endpoint_id"].is_null());
        assert!(!json["enabled"].as_bool().unwrap());
    }

    // ── INBOUND_MIGRATION_SQL ───────────────────────────────

    #[test]
    fn test_inbound_migration_sql_not_empty() {
        assert!(!INBOUND_MIGRATION_SQL.is_empty());
        assert!(INBOUND_MIGRATION_SQL.contains("inbound_configs"));
        assert!(INBOUND_MIGRATION_SQL.contains("CREATE TABLE"));
    }

    // ── Router construction ─────────────────────────────────

    #[test]
    fn test_inbound_router_construction() {
        let _router = router();
    }
}
