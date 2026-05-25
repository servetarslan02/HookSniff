//! Single and batch webhook replay handlers.

use axum::extract::{Extension, Path};
use axum::Json;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::config::Config;
use crate::db;
use crate::error::{AppError, ErrorCode};
use crate::events::overage::track_daily_event;
use crate::feature_flags::FeatureFlagService;
use crate::models::customer::Customer;
use crate::models::delivery::{Delivery, DeliveryResponse};
use crate::models::endpoint::{Endpoint, RetryPolicy};

use super::helpers::reserve_webhook_slot;

pub async fn replay_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(_cfg): Extension<Config>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Path(id): Path<Uuid>,
) -> Result<Json<DeliveryResponse>, AppError> {
    let team_id = service_token.as_ref().map(|s| s.team_id);

    // ── Role enforcement: require at least developer for write ops ──
    if let Some(tid) = team_id {
        crate::routes::teams::require_team_developer(&pool, tid, customer.id).await?;
    } else {
        crate::routes::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    let original = sqlx::query_as::<_, Delivery>(
        "SELECT id, endpoint_id, customer_id, payload, event_type, status, attempt_count, max_attempts, last_attempt_at, response_status, response_body, next_retry_at, replay_count, created_at, sequence_num, fifo_group_id, updated_at, error_message, is_test, event, processed_at, idempotency_key, source_ip, request_headers, application_id, payload_hash, custom_headers FROM deliveries WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let endpoint = sqlx::query_as::<_, Endpoint>(
        "SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = $1 AND customer_id = $2 AND is_active = true",
    )
    .bind(original.endpoint_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::coded(ErrorCode::EndpointInactive))?;

    let retry_policy = RetryPolicy::from_value(endpoint.retry_policy.as_ref());

    let payload_str =
        serde_json::to_string(&original.payload).map_err(|e| AppError::Internal(e.into()))?;

    // Atomic check-and-increment: reserve webhook slot before creating replay delivery
    reserve_webhook_slot(&pool, &customer, 1, team_id).await?;

    // Track daily event usage for overage notifications (best-effort)
    let _ = track_daily_event(&pool, &customer, None, team_id).await;

    let new_delivery = sqlx::query_as::<_, Delivery>(
        "INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status, max_attempts, replay_count) VALUES ($1, $2, $3, $4, 'pending', $5, 1) RETURNING *",
    )
    .bind(original.endpoint_id)
    .bind(customer.id)
    .bind(&original.payload)
    .bind(&original.event_type)
    .bind(retry_policy.max_attempts)
    .fetch_one(&pool)
    .await?;

    db::publish_to_queue(
        &pool,
        new_delivery.id,
        endpoint.id,
        &endpoint.url,
        &payload_str,
        endpoint.custom_headers.as_ref(),
    )
    .await
    .map_err(|e| {
        tracing::error!("Failed to publish replay to queue: {:?}", e);
        AppError::Internal(e)
    })?;

    Ok(Json(new_delivery.to_response()))
}

// ── Batch Replay ──

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub(crate) struct BatchReplayRequest {
    delivery_ids: Vec<Uuid>,
}

pub async fn batch_replay(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(_cfg): Extension<Config>,
    Extension(feature_flags): Extension<FeatureFlagService>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Json(req): Json<BatchReplayRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let team_id = service_token.as_ref().map(|s| s.team_id);

    // ── Role enforcement: require at least developer for write ops ──
    if let Some(tid) = team_id {
        crate::routes::teams::require_team_developer(&pool, tid, customer.id).await?;
    } else {
        crate::routes::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    // Gate behind bulk_replay feature flag
    if !feature_flags.is_enabled("bulk_replay").await {
        return Err(AppError::coded(ErrorCode::BulkReplayDisabled));
    }

    if req.delivery_ids.is_empty() {
        return Err(AppError::coded(ErrorCode::NoDeliveryIds));
    }
    if req.delivery_ids.len() > 100 {
        return Err(AppError::BadRequest(
            "Cannot replay more than 100 deliveries at once".into(),
        ));
    }

    let mut replayed = Vec::new();
    let mut errors = Vec::new();

    for id in &req.delivery_ids {
        let original = sqlx::query_as::<_, Delivery>(
            "SELECT id, endpoint_id, customer_id, payload, event_type, status, attempt_count, max_attempts, last_attempt_at, response_status, response_body, next_retry_at, replay_count, created_at, sequence_num, fifo_group_id, updated_at, error_message, is_test, event, processed_at, idempotency_key, source_ip, request_headers, application_id, payload_hash, custom_headers FROM deliveries WHERE id = $1 AND customer_id = $2",
        )
        .bind(id)
        .bind(customer.id)
        .fetch_optional(&pool)
        .await?;

        let Some(original) = original else {
            errors.push(serde_json::json!({ "id": id, "error": "Not found" }));
            continue;
        };

        let endpoint = sqlx::query_as::<_, Endpoint>(
            "SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = $1 AND customer_id = $2 AND is_active = true",
        )
        .bind(original.endpoint_id)
        .bind(customer.id)
        .fetch_optional(&pool)
        .await?;

        let Some(endpoint) = endpoint else {
            errors.push(serde_json::json!({ "id": id, "error": "Endpoint inactive" }));
            continue;
        };

        // Rate limit check — never-blocked mode support
        if reserve_webhook_slot(&pool, &customer, 1, team_id).await.is_err() {
            errors.push(serde_json::json!({ "id": id, "error": "Rate limit exceeded" }));
            continue;
        }

        let retry_policy = RetryPolicy::from_value(endpoint.retry_policy.as_ref());
        let payload_str =
            serde_json::to_string(&original.payload).map_err(|e| AppError::Internal(e.into()))?;

        let new_delivery = sqlx::query_as::<_, Delivery>(
            "INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status, max_attempts, replay_count) VALUES ($1, $2, $3, $4, 'pending', $5, 1) RETURNING *",
        )
        .bind(original.endpoint_id)
        .bind(customer.id)
        .bind(&original.payload)
        .bind(&original.event_type)
        .bind(retry_policy.max_attempts)
        .fetch_one(&pool)
        .await?;

        db::publish_to_queue(
            &pool,
            new_delivery.id,
            endpoint.id,
            &endpoint.url,
            &payload_str,
            endpoint.custom_headers.as_ref(),
        )
        .await?;

        replayed.push(serde_json::json!({
            "original_id": original.id,
            "new_id": new_delivery.id,
            "status": "pending"
        }));
    }

    Ok(Json(serde_json::json!({
        "replayed": replayed.len(),
        "errors": errors.len(),
        "results": replayed,
        "failures": errors,
    })))
}
