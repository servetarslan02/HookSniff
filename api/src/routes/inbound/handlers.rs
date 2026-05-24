use axum::body::Bytes;
use axum::extract::{Extension, Path};
use axum::http::HeaderMap;
use axum::response::IntoResponse;
use axum::Json;
use sqlx::PgPool;
use uuid::Uuid;

use crate::db;
use crate::error::AppError;
use crate::models::customer::Customer;
use crate::models::delivery::Delivery;
use crate::models::endpoint::Endpoint;
use crate::routes::auth::CUSTOMER_SELECT;

use super::{InboundConfig, Provider};

// ── Handlers ──

/// Resolve customer from API key (header or query param).
/// Returns None if no API key provided or not found.
pub async fn resolve_customer_from_api_key(
    pool: &PgPool,
    headers: &HeaderMap,
) -> Option<Customer> {
    // Try header first, then query param
    let api_key = headers
        .get("x-api-key")
        .or_else(|| headers.get("authorization"))
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .map(|s| s.to_string())
        .or_else(|| {
            // Try query param (useful for provider dashboards that can't set custom headers)
            None // TODO: extract from URI query string if needed
        });

    let api_key = api_key?;
    let prefix = &api_key[..24.min(api_key.len())];

    // Check customers table
    let candidates =
        sqlx::query_as::<_, Customer>(&format!("{} WHERE api_key_prefix = $1", CUSTOMER_SELECT))
            .bind(prefix)
            .fetch_all(pool)
            .await
            .ok()?;

    for c in &candidates {
        if crate::middleware::verify_api_key(&api_key, &c.api_key_hash) {
            return Some(c.clone());
        }
    }

    // Check api_keys table
    let api_key_rows: Vec<(String, uuid::Uuid)> = sqlx::query_as(
        "SELECT api_key_hash, customer_id FROM api_keys WHERE api_key_prefix = $1 AND is_active = true",
    )
    .bind(prefix)
    .fetch_all(pool)
    .await
    .ok()?;

    for (hash, customer_id) in &api_key_rows {
        if crate::middleware::verify_api_key(&api_key, hash) {
            return sqlx::query_as::<_, Customer>(&format!("{} WHERE id = $1", CUSTOMER_SELECT))
                .bind(customer_id)
                .fetch_optional(pool)
                .await
                .ok()
                .flatten();
        }
    }

    None
}

/// Resolve customer from endpoint_id in URL path.
/// Looks up the endpoint's owner. Used when external providers can't send API keys.
pub async fn resolve_customer_from_endpoint(
    pool: &PgPool,
    endpoint_id: Uuid,
) -> Option<(Customer, Endpoint)> {
    let endpoint = sqlx::query_as::<_, Endpoint>(
        "SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = $1 AND is_active = true",
    )
    .bind(endpoint_id)
    .fetch_optional(pool)
    .await
    .ok()?;

    let endpoint = endpoint?;
    let customer = sqlx::query_as::<_, Customer>(&format!("{} WHERE id = $1", CUSTOMER_SELECT))
        .bind(endpoint.customer_id)
        .fetch_optional(pool)
        .await
        .ok()?;

    customer.map(|c| (c, endpoint))
}

/// Process an inbound webhook: verify signature, create delivery, publish to queue.
pub async fn process_inbound(
    pool: &PgPool,
    provider: &Provider,
    customer: &Customer,
    config: &InboundConfig,
    endpoint: &Endpoint,
    headers: &HeaderMap,
    body: &Bytes,
) -> Result<serde_json::Value, AppError> {
    // Verify signature — reject if secret is empty
    if config.secret.is_empty() {
        tracing::warn!(
            "❌ Inbound config for provider '{}' has empty secret — rejecting (customer={})",
            provider,
            customer.id
        );
        return Err(AppError::Forbidden);
    }

    provider
        .verify_signature(&config.secret, headers, body)
        .map_err(|e| {
            tracing::warn!("Inbound webhook signature verification failed: {:?}", e);
            AppError::Unauthorized
        })?;

    // Create delivery
    let event_type = provider
        .extract_event_type(body)
        .unwrap_or_else(|| format!("inbound.{}", provider));

    let payload: serde_json::Value = serde_json::from_slice(body)
        .unwrap_or_else(|_| serde_json::json!({"raw": String::from_utf8_lossy(body).to_string()}));

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
    .fetch_one(pool)
    .await?;

    let payload_str = serde_json::to_string(&payload).unwrap_or_default();

    db::publish_to_queue(
        pool,
        delivery.id,
        endpoint.id,
        &endpoint.url,
        &payload_str,
        endpoint.custom_headers.as_ref(),
    )
    .await?;

    Ok(serde_json::json!({
        "received": true,
        "delivery_id": delivery.id,
        "event": event_type,
        "provider": provider.to_string(),
    }))
}

/// Handle inbound webhook from a specific provider (without endpoint_id).
/// Tries API key first, then returns helpful error if no config found.
pub async fn handle_inbound(
    Extension(pool): Extension<PgPool>,
    Path(provider): Path<String>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<impl IntoResponse, AppError> {
    let provider = Provider::parse_str(&provider);

    // Try to resolve customer from API key
    let customer = resolve_customer_from_api_key(&pool, &headers).await;

    let Some(customer) = customer else {
        // No API key or not found — return helpful message
        tracing::info!(
            "Inbound webhook for '{}' received without valid API key",
            provider
        );
        return Err(AppError::BadRequest(
            format!(
                "This inbound URL requires authentication. Include your API key as 'x-api-key' header, \
                or use the endpoint-specific URL: /v1/inbound/{provider}/{{endpoint_id}} which verifies \
                via {} signature only.",
                provider
            ),
        ));
    };

    // Find inbound config for this provider
    let config = sqlx::query_as::<_, InboundConfig>(
        "SELECT id, customer_id, provider, secret, endpoint_id, enabled, created_at FROM inbound_configs WHERE customer_id = $1 AND provider = $2 AND enabled = true",
    )
    .bind(customer.id)
    .bind(provider.to_string())
    .fetch_optional(&pool)
    .await?;

    let Some(config) = config else {
        return Err(AppError::BadRequest(
            format!(
                "No inbound configuration found for provider '{}'. \
                Go to Dashboard → Inbound Webhooks → Add Provider to create one.",
                provider
            ),
        ));
    };

    // Find target endpoint
    let endpoint_id = config.endpoint_id.ok_or(AppError::BadRequest(
        "No default endpoint configured for this provider. Edit your inbound config to set one.".into(),
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

    let result = process_inbound(&pool, &provider, &customer, &config, &endpoint, &headers, &body).await?;
    Ok(Json(result))
}

/// Handle inbound webhook directed to a specific endpoint.
/// Endpoint_id in URL identifies the customer — no API key needed.
/// This is the preferred URL for external providers (Stripe, GitHub, etc.)
pub async fn handle_inbound_to_endpoint(
    Extension(pool): Extension<PgPool>,
    Path((provider, endpoint_id)): Path<(String, Uuid)>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<impl IntoResponse, AppError> {
    let provider = Provider::parse_str(&provider);

    // Resolve customer + endpoint from URL path (no API key needed)
    let (customer, endpoint) = resolve_customer_from_endpoint(&pool, endpoint_id)
        .await
        .ok_or(AppError::BadRequest(
            "Endpoint not found or inactive. Check your endpoint_id in the URL.".into(),
        ))?;

    // Find inbound config for this provider + customer
    let config = sqlx::query_as::<_, InboundConfig>(
        "SELECT id, customer_id, provider, secret, endpoint_id, enabled, created_at FROM inbound_configs WHERE customer_id = $1 AND provider = $2 AND enabled = true",
    )
    .bind(customer.id)
    .bind(provider.to_string())
    .fetch_one(&pool)
    .await
    .map_err(|_| {
        AppError::BadRequest(
            format!(
                "No inbound configuration for provider '{}'. \
                Go to Dashboard → Inbound Webhooks → Add Provider to create one.",
                provider
            ),
        )
    })?;

    let result = process_inbound(&pool, &provider, &customer, &config, &endpoint, &headers, &body).await?;
    Ok(Json(result))
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

