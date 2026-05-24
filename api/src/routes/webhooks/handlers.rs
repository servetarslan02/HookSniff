use axum::body::Body;
use axum::extract::{Extension, Path, Query};
use axum::http::{header, StatusCode};
use axum::response::Response;
use axum::Json;
use chrono::Utc;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::config::Config;
use crate::db;
use crate::error::{AppError, ErrorCode};
use crate::events::overage::track_daily_event;
use crate::feature_flags::FeatureFlagService;
use crate::middleware::idempotency;
use crate::models::customer::Customer;
use crate::models::delivery::{
    BatchError, BatchResponse, BatchWebhookRequest, CreateWebhookRequest, Delivery,
    DeliveryAttempt, DeliveryAttemptResponse, DeliveryListResponse, DeliveryListRow,
    DeliveryResponse, ExportDelivery,
};
use crate::models::endpoint::{Endpoint, RetryPolicy};
use crate::validation;

use super::helpers::{
    escape_csv_cell, parse_date_from_str, parse_date_to_str, reserve_webhook_slot,
    resolve_team_tracking,
};
use super::{ExportParams, ListParams};

pub async fn list_deliveries(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Query(params): Query<ListParams>,
) -> Result<Json<DeliveryListResponse>, AppError> {
    // ── Role enforcement: analyst can view deliveries ──
    if let Some(Extension(ref scope)) = service_token {
        crate::routes::teams::require_team_analyst(&pool, scope.team_id, customer.id).await?;
    }

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).min(200);
    let offset = (page - 1) * per_page;

    // Performance: select only columns needed for list view (skip payload + response_body)
    const LIST_COLUMNS: &str = "id, endpoint_id, customer_id, event_type, status, attempt_count, max_attempts, last_attempt_at, response_status, next_retry_at, replay_count, created_at, sequence_num, fifo_group_id, updated_at, error_message, is_test";

    // Team filter: use subquery with bind parameter for safety
    let team_id_filter: Option<Uuid> = service_token.as_ref().map(|s| s.team_id);

    let (deliveries, total) = if let Some(status) = &params.status {
        let (query, total_query) = if let Some(_tid) = team_id_filter {
            (
                format!("SELECT {} FROM deliveries WHERE customer_id = $1 AND status = $2 AND endpoint_id IN (SELECT id FROM endpoints WHERE team_id = $3) ORDER BY created_at DESC LIMIT $4 OFFSET $5", LIST_COLUMNS),
                "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = $2 AND endpoint_id IN (SELECT id FROM endpoints WHERE team_id = $3)".to_string(),
            )
        } else {
            (
                format!("SELECT {} FROM deliveries WHERE customer_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4", LIST_COLUMNS),
                "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = $2".to_string(),
            )
        };

        let mut q = sqlx::query_as::<_, DeliveryListRow>(&query)
            .bind(customer.id)
            .bind(status);
        let mut tq = sqlx::query_as(&total_query)
            .bind(customer.id)
            .bind(status);

        if let Some(_tid) = team_id_filter {
            q = q.bind(_tid);
            tq = tq.bind(_tid);
        }

        let deliveries = q.bind(per_page).bind(offset).fetch_all(&pool).await?;
        let total: (i64,) = tq.fetch_one(&pool).await?;
        (deliveries, total.0)
    } else {
        let (query, total_query) = if let Some(_tid) = team_id_filter {
            (
                format!("SELECT {} FROM deliveries WHERE customer_id = $1 AND endpoint_id IN (SELECT id FROM endpoints WHERE team_id = $2) ORDER BY created_at DESC LIMIT $3 OFFSET $4", LIST_COLUMNS),
                "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND endpoint_id IN (SELECT id FROM endpoints WHERE team_id = $2)".to_string(),
            )
        } else {
            (
                format!("SELECT {} FROM deliveries WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3", LIST_COLUMNS),
                "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1".to_string(),
            )
        };

        let mut q = sqlx::query_as::<_, DeliveryListRow>(&query)
            .bind(customer.id);
        let mut tq = sqlx::query_as(&total_query)
            .bind(customer.id);

        if let Some(_tid) = team_id_filter {
            q = q.bind(_tid);
            tq = tq.bind(_tid);
        }

        let deliveries = q.bind(per_page).bind(offset).fetch_all(&pool).await?;
        let total: (i64,) = tq.fetch_one(&pool).await?;
        (deliveries, total.0)
    };

    Ok(Json(DeliveryListResponse {
        deliveries: deliveries.into_iter().map(|d| d.to_response()).collect(),
        total,
        page,
        per_page,
    }))
}

pub async fn create_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(cfg): Extension<Config>,
    Extension(is_test): Extension<crate::middleware::IsTestKey>,
    Extension(event_publisher): Extension<Option<crate::events::EventPublisher>>,
    Extension(feature_flags): Extension<FeatureFlagService>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    headers: axum::http::header::HeaderMap,
    Json(req): Json<CreateWebhookRequest>,
) -> Result<Json<DeliveryResponse>, AppError> {
    let team_id = service_token.as_ref().map(|s| s.team_id);

    // ── Role enforcement: require at least developer for write ops ──
    if let Some(tid) = team_id {
        crate::routes::teams::require_team_developer(&pool, tid, customer.id).await?;
    } else {
        crate::routes::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    // Check idempotency key
    let idempotency_key = headers.get("Idempotency-Key").and_then(|v| v.to_str().ok());

    // Compute body hash for idempotency validation
    let body_hash = idempotency_key.map(|_| idempotency::compute_body_hash(&req.data));

    if let Some(key) = idempotency_key {
        if let Some(cached) =
            idempotency::check_idempotency(&pool, key, customer.id, body_hash.as_deref()).await
        {
            tracing::info!("♻️ Returning cached response for idempotency key: {}", key);
            return Ok(Json(
                serde_json::from_value(cached.response_body).unwrap_or_else(|_| DeliveryResponse {
                    id: Uuid::nil(),
                    endpoint_id: Uuid::nil(),
                    event: None,
                    status: "cached".to_string(),
                    attempt_count: 0,
                    response_status: Some(cached.status_code),
                    replay_count: Some(0),
                    created_at: cached.created_at,
                    is_test: None,
                }),
            ));
        }
    }

    // Content-based deduplication (when feature flag is enabled)
    if feature_flags.is_enabled("deduplication").await {
        let content_hash = idempotency::compute_body_hash(&req.data);
        let dedup_window = chrono::Duration::seconds(60); // 60s dedup window
        let cutoff = Utc::now() - dedup_window;

        let duplicate = sqlx::query_as::<_, (Uuid, String, chrono::DateTime<Utc>)>(
            "SELECT id, status, created_at FROM deliveries \
             WHERE endpoint_id = $1 AND customer_id = $2 AND payload_hash = $3 \
             AND created_at >= $4 ORDER BY created_at DESC LIMIT 1"
        )
        .bind(req.endpoint_id)
        .bind(customer.id)
        .bind(&content_hash)
        .bind(cutoff)
        .fetch_optional(&pool)
        .await?;

        if let Some((dup_id, dup_status, dup_created)) = duplicate {
            tracing::info!(
                "🔁 Dedup: returning existing delivery {} for content hash (flag enabled)",
                dup_id
            );
            return Ok(Json(DeliveryResponse {
                id: dup_id,
                endpoint_id: req.endpoint_id,
                event: req.event,
                status: dup_status,
                attempt_count: 0,
                response_status: None,
                replay_count: Some(0),
                created_at: dup_created,
                is_test: None,
            }));
        }
    }

    // Validate event_type if provided
    if let Some(ref event) = req.event {
        validation::validate_event_type(event).map_err(AppError::BadRequest)?;
    }

    // Validate JSON payload depth
    validation::validate_json_depth(&req.data).map_err(AppError::BadRequest)?;

    // Check payload size
    let payload_size = serde_json::to_string(&req.data)
        .map(|s| s.len())
        .unwrap_or(0);
    if payload_size > cfg.max_webhook_payload_bytes {
        return Err(AppError::PayloadTooLarge);
    }

    // Verify endpoint exists and belongs to customer
    let endpoint = sqlx::query_as::<_, Endpoint>(
        "SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = $1 AND customer_id = $2 AND is_active = true",
    )
    .bind(req.endpoint_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    // Check event filter
    if let Some(ref event) = req.event {
        if !endpoint.matches_event_filter(event) {
            tracing::info!(
                "⏭️ Event '{}' does not match filter for endpoint {}, skipping",
                event,
                endpoint.id
            );
            let response = serde_json::json!({
                "id": Uuid::nil(),
                "endpoint_id": endpoint.id,
                "event": event,
                "status": "filtered",
                "attempt_count": 0,
                "response_status": null,
                "replay_count": 0,
                "created_at": Utc::now().to_rfc3339(),
            });
            return Ok(Json(serde_json::from_value(response).unwrap_or_else(
                |_| DeliveryResponse {
                    id: Uuid::nil(),
                    endpoint_id: endpoint.id,
                    event: Some(event.clone()),
                    status: "filtered".to_string(),
                    attempt_count: 0,
                    response_status: None,
                    replay_count: Some(0),
                    created_at: Utc::now(),
                    is_test: None,
                },
            )));
        }
    }

    let payload = serde_json::json!({
        "event": req.event,
        "data": req.data,
        "timestamp": Utc::now().to_rfc3339(),
    });

    let payload_str = serde_json::to_string(&payload).map_err(|e| AppError::Internal(e.into()))?;

    // Get retry policy from endpoint, or use defaults
    let retry_policy = RetryPolicy::from_value(endpoint.retry_policy.as_ref());

    // Atomic check-and-increment: reserve webhook slot before creating delivery
    reserve_webhook_slot(&pool, &customer, 1, team_id).await?;

    // Track daily event usage for overage notifications (best-effort)
    // TODO: Pass EmailProvider from Extension when wiring up email notifications
    let _ = track_daily_event(&pool, &customer, None, team_id).await;

    let delivery = sqlx::query_as::<_, Delivery>(
        "INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status, max_attempts, is_test) VALUES ($1, $2, $3, $4, 'pending', $5, $6) RETURNING *",
    )
    .bind(endpoint.id)
    .bind(customer.id)
    .bind(&payload)
    .bind(&req.event)
    .bind(retry_policy.max_attempts)
    .bind(is_test.0)
    .fetch_one(&pool)
    .await?;

    // Publish DeliveryCreated event (best-effort)
    if let Some(ref publisher) = event_publisher {
        publisher.publish(crate::events::AppEvent::DeliveryCreated {
            delivery_id: delivery.id,
            endpoint_id: endpoint.id,
            customer_id: customer.id,
            event_type: req.event.clone(),
        }).await.ok();
    }

    // Test mode: mark as delivered immediately, skip real delivery
    if is_test.0 {
        sqlx::query(
            "UPDATE deliveries SET status = 'delivered', attempt_count = 0, response_status = 200, response_body = '{\"test\": true}' WHERE id = $1",
        )
        .bind(delivery.id)
        .execute(&pool)
        .await?;

        tracing::info!(
            "🧪 Test delivery {} created with hr_test_ key — marked as delivered (no real HTTP)",
            delivery.id
        );

        // Return the test delivery
        let mut resp = delivery.to_response();
        resp.status = "delivered".to_string();
        resp.response_status = Some(200);
        return Ok(Json(resp));
    }

    db::publish_to_queue(
        &pool,
        delivery.id,
        endpoint.id,
        &endpoint.url,
        &payload_str,
        endpoint.custom_headers.as_ref(),
    )
    .await
    .map_err(|e| {
        tracing::error!("Failed to publish to queue: {:?}", e);
        AppError::Internal(e)
    })?;

    // Store idempotency key if provided
    if let Some(key) = idempotency_key {
        let response_body =
            serde_json::to_value(delivery.to_response()).unwrap_or(serde_json::Value::Null);
        if let Err(e) = idempotency::store_idempotency(
            &pool,
            key,
            customer.id,
            response_body,
            200,
            body_hash.as_deref(),
        )
        .await
        {
            tracing::warn!("Failed to store idempotency key: {:?}", e);
        }
    }

    Ok(Json(delivery.to_response()))
}

pub async fn batch_webhooks(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(cfg): Extension<Config>,
    Extension(event_publisher): Extension<Option<crate::events::EventPublisher>>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Json(req): Json<BatchWebhookRequest>,
) -> Result<Json<BatchResponse>, AppError> {
    let team_id = service_token.as_ref().map(|s| s.team_id);

    // ── Role enforcement: require at least developer for write ops ──
    if let Some(tid) = team_id {
        crate::routes::teams::require_team_developer(&pool, tid, customer.id).await?;
    } else {
        crate::routes::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    if req.webhooks.len() > 100 {
        return Err(AppError::coded(ErrorCode::BatchTooLarge));
    }

    // Atomic check-and-increment for batch: reserve slots for all webhooks in the batch
    let batch_count = req.webhooks.len() as i64;
    reserve_webhook_slot(&pool, &customer, batch_count, team_id).await?;

    // Track daily event usage for overage notifications (best-effort, once per batch)
    let _ = track_daily_event(&pool, &customer, None, team_id).await;

    // Collect unique endpoint IDs and fetch all in one query (eliminates N+1)
    let endpoint_ids: Vec<Uuid> = req
        .webhooks
        .iter()
        .map(|w| w.endpoint_id)
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect();

    let endpoints: Vec<Endpoint> = sqlx::query_as::<_, Endpoint>(
        "SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = ANY($1) AND customer_id = $2 AND is_active = true",
    )
    .bind(&endpoint_ids)
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    let endpoint_map: std::collections::HashMap<Uuid, Endpoint> =
        endpoints.into_iter().map(|e| (e.id, e)).collect();

    let mut deliveries = Vec::new();
    let mut errors = Vec::new();
    let mut created_count: i64 = 0;

    for (i, webhook_req) in req.webhooks.iter().enumerate() {
        let payload_size = serde_json::to_string(&webhook_req.data)
            .map(|s| s.len())
            .unwrap_or(0);
        if payload_size > cfg.max_webhook_payload_bytes {
            errors.push(BatchError {
                index: i,
                error: "Payload too large".to_string(),
            });
            continue;
        }

        let endpoint = match endpoint_map.get(&webhook_req.endpoint_id) {
            Some(ep) => ep.clone(),
            None => {
                errors.push(BatchError {
                    index: i,
                    error: "Endpoint not found or inactive".to_string(),
                });
                continue;
            }
        };

        // Check event filter
        if let Some(ref event) = webhook_req.event {
            if !endpoint.matches_event_filter(event) {
                continue; // Silently skip filtered events in batch
            }
        }

        let payload = serde_json::json!({
            "event": webhook_req.event,
            "data": webhook_req.data,
            "timestamp": Utc::now().to_rfc3339(),
        });

        let payload_str = match serde_json::to_string(&payload) {
            Ok(s) => s,
            Err(e) => {
                tracing::warn!("Batch webhook serialization error at index {}: {:?}", i, e);
                errors.push(BatchError {
                    index: i,
                    error: "Invalid payload format".to_string(),
                });
                continue;
            }
        };

        let retry_policy = RetryPolicy::from_value(endpoint.retry_policy.as_ref());

        match sqlx::query_as::<_, Delivery>(
            "INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status, max_attempts) VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING *",
        )
        .bind(endpoint.id)
        .bind(customer.id)
        .bind(&payload)
        .bind(&webhook_req.event)
        .bind(retry_policy.max_attempts)
        .fetch_one(&pool)
        .await
        {
            Ok(delivery) => {
                // Publish to queue immediately — fail the delivery if publish fails
                if let Err(e) = db::publish_to_queue(
                    &pool,
                    delivery.id,
                    endpoint.id,
                    &endpoint.url,
                    &payload_str,
                    endpoint.custom_headers.as_ref(),
                )
                .await
                {
                    tracing::error!(
                        "Failed to publish batch delivery {} to queue: {:?} — marking as failed",
                        delivery.id,
                        e
                    );
                    // Mark delivery as failed so it doesn't stay stuck in 'pending'
                    let _ = sqlx::query(
                        "UPDATE deliveries SET status = 'failed', error_message = 'Queue publish failed' WHERE id = $1"
                    )
                    .bind(delivery.id)
                    .execute(&pool)
                    .await;

                    errors.push(BatchError {
                        index: i,
                        error: "Failed to queue delivery".to_string(),
                    });
                } else {
                    // Publish DeliveryCreated event (best-effort)
                    if let Some(ref publisher) = event_publisher {
                        publisher.publish(crate::events::AppEvent::DeliveryCreated {
                            delivery_id: delivery.id,
                            endpoint_id: endpoint.id,
                            customer_id: customer.id,
                            event_type: webhook_req.event.clone(),
                        }).await.ok();
                    }
                    created_count += 1;
                    deliveries.push(delivery.to_response());
                }
            }
            Err(e) => {
                errors.push(BatchError {
                    index: i,
                    error: format!("Failed to create delivery: {}", e),
                });
            }
        }
    }

    // Rollback excess webhook_count for failed/filtered items
    // When in team context, rollback on the team owner's record (not the individual member)
    let excess = batch_count - created_count;
    if excess > 0 {
        let (tracking_id, _, _) = resolve_team_tracking(&pool, &customer, team_id).await;
        let _ = sqlx::query(
            "UPDATE customers SET webhook_count = GREATEST(0, webhook_count - $1) WHERE id = $2",
        )
        .bind(excess)
        .bind(tracking_id)
        .execute(&pool)
        .await;
    }

    Ok(Json(BatchResponse { deliveries, errors }))
}

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
        // Get original delivery
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

        // Get endpoint
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

pub async fn export_deliveries(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<ExportParams>,
) -> Result<Response, AppError> {
    let format = params.format.unwrap_or_else(|| "json".to_string());

    let deliveries: Vec<ExportDelivery> = sqlx::query_as::<_, ExportDelivery>(
        "SELECT d.id, d.event_type as event, e.url as endpoint_url, d.status, d.attempt_count, d.response_status, d.created_at \
         FROM deliveries d JOIN endpoints e ON d.endpoint_id = e.id WHERE d.customer_id = $1 ORDER BY d.created_at DESC LIMIT 10000",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    let filtered: Vec<ExportDelivery> = deliveries
        .into_iter()
        .filter(|d| {
            if let Some(ref status) = params.status {
                if d.status != *status {
                    return false;
                }
            }
            if let Some(ref from) = params.date_from {
                if let Some(from_dt) = parse_date_from_str(from) {
                    if d.created_at < from_dt {
                        return false;
                    }
                }
            }
            if let Some(ref to) = params.date_to {
                if let Some(to_dt) = parse_date_to_str(to) {
                    if d.created_at > to_dt {
                        return false;
                    }
                }
            }
            true
        })
        .collect();

    match format.as_str() {
        "csv" => {
            let mut csv = String::from(
                "id,event,endpoint_url,status,attempt_count,response_status,created_at\n",
            );
            for d in &filtered {
                csv.push_str(&format!(
                    "{},{},{},{},{},{},{}\n",
                    escape_csv_cell(&d.id.to_string()),
                    escape_csv_cell(d.event.as_deref().unwrap_or("")),
                    escape_csv_cell(&d.endpoint_url),
                    escape_csv_cell(&d.status),
                    escape_csv_cell(&d.attempt_count.to_string()),
                    escape_csv_cell(&d.response_status.map(|s| s.to_string()).unwrap_or_default()),
                    escape_csv_cell(&d.created_at.to_rfc3339())
                ));
            }

            Ok(Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, "text/csv")
                .header(
                    header::CONTENT_DISPOSITION,
                    "attachment; filename=\"webhook_logs.csv\"",
                )
                .body(Body::from(csv))
                .map_err(|e| AppError::Internal(e.into()))?)
        }
        _ => {
            let body =
                serde_json::to_string(&filtered).map_err(|e| AppError::Internal(e.into()))?;

            Ok(Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(body))
                .map_err(|e| AppError::Internal(e.into()))?)
        }
    }
}

pub async fn get_delivery(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<DeliveryResponse>, AppError> {
    let delivery = sqlx::query_as::<_, Delivery>(
        "SELECT id, endpoint_id, customer_id, payload, event_type, status, attempt_count, max_attempts, last_attempt_at, response_status, response_body, next_retry_at, replay_count, created_at, sequence_num, fifo_group_id, updated_at, error_message, is_test, event, processed_at, idempotency_key, source_ip, request_headers, application_id, payload_hash, custom_headers FROM deliveries WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(delivery.to_response()))
}

pub async fn get_delivery_attempts(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<DeliveryAttemptResponse>>, AppError> {
    let _delivery = sqlx::query_as::<_, Delivery>(
        "SELECT id, endpoint_id, customer_id, payload, event_type, status, attempt_count, max_attempts, last_attempt_at, response_status, response_body, next_retry_at, replay_count, created_at, sequence_num, fifo_group_id, updated_at, error_message, is_test, event, processed_at, idempotency_key, source_ip, request_headers, application_id, payload_hash, custom_headers FROM deliveries WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let attempts = sqlx::query_as::<_, DeliveryAttempt>(
        "SELECT id, delivery_id, attempt_number, status_code, response_body, duration_ms, error_message, created_at, trace_id, response_headers FROM delivery_attempts WHERE delivery_id = $1 ORDER BY attempt_number ASC LIMIT 100",
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(attempts.iter().map(|a| a.to_response()).collect()))
}

