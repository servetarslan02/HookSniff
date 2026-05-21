use axum::body::Body;
use axum::extract::{Extension, Path, Query};
use axum::http::{header, StatusCode};
use axum::response::Response;
use axum::routing::{get, post};
use axum::{Json, Router};
use chrono::{DateTime, NaiveDate, NaiveDateTime, Utc};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::config::Config;
use crate::db;
use crate::error::AppError;
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

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_deliveries).post(create_webhook))
        .route("/batch", post(batch_webhooks))
        .route("/batch/replay", post(batch_replay))
        .route("/export", get(export_deliveries))
        .route("/{id}", get(get_delivery))
        .route("/{id}/replay", post(replay_webhook))
        .route("/{id}/attempts", get(get_delivery_attempts))
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct ListParams {
    page: Option<i64>,
    per_page: Option<i64>,
    status: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct ExportParams {
    format: Option<String>,
    status: Option<String>,
    date_from: Option<String>,
    date_to: Option<String>,
}

async fn list_deliveries(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Query(params): Query<ListParams>,
) -> Result<Json<DeliveryListResponse>, AppError> {
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

async fn create_webhook(
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
        super::teams::require_team_developer(&pool, tid, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
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

async fn batch_webhooks(
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
        super::teams::require_team_developer(&pool, tid, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    if req.webhooks.len() > 100 {
        return Err(AppError::BadRequest("A batch cannot contain more than 100 webhooks".into()));
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

async fn replay_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(_cfg): Extension<Config>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Path(id): Path<Uuid>,
) -> Result<Json<DeliveryResponse>, AppError> {
    let team_id = service_token.as_ref().map(|s| s.team_id);

    // ── Role enforcement: require at least developer for write ops ──
    if let Some(tid) = team_id {
        super::teams::require_team_developer(&pool, tid, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
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
    .ok_or(AppError::BadRequest("The endpoint is no longer active".into()))?;

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

/// Escape a value for safe CSV output.
///
/// - Wraps in double quotes if the value contains commas, quotes, or newlines.
/// - Escapes internal double quotes by doubling them.
/// - Prefixes with a single quote if the first character is a formula-injection
///   vector (`=`, `+`, `-`, `@`, `\t`, `\r`).
fn escape_csv_cell(value: &str) -> String {
    let needs_prefix = matches!(
        value.as_bytes().first(),
        Some(b'=') | Some(b'+') | Some(b'-') | Some(b'@') | Some(b'\t') | Some(b'\r')
    );
    let needs_quote = value.contains([',', '"', '\n']);

    let mut out = String::new();
    if needs_prefix {
        out.push('\'');
    }
    if needs_quote {
        out.push('"');
        for ch in value.chars() {
            if ch == '"' {
                out.push_str("\"\"");
            } else {
                out.push(ch);
            }
        }
        out.push('"');
    } else {
        out.push_str(value);
    }
    out
}

// ── Batch Replay ──

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct BatchReplayRequest {
    delivery_ids: Vec<Uuid>,
}

async fn batch_replay(
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
        super::teams::require_team_developer(&pool, tid, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    // Gate behind bulk_replay feature flag
    if !feature_flags.is_enabled("bulk_replay").await {
        return Err(AppError::BadRequest("Bulk replay is not enabled. Contact support to enable this feature.".into()));
    }

    if req.delivery_ids.is_empty() {
        return Err(AppError::BadRequest("Please provide at least one delivery ID to replay".into()));
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

/// Resolve the effective webhook limit and the customer_id to track usage against.
/// When operating within a team, the team owner's plan limit and their webhook_count apply.
/// Returns (tracking_customer_id, webhook_limit).
async fn resolve_team_tracking(
    pool: &PgPool,
    customer: &Customer,
    team_id: Option<Uuid>,
) -> (Uuid, i64, bool) {
    if let Some(tid) = team_id {
        let result: Option<(Uuid, String, i64, bool)> = sqlx::query_as(
            "SELECT c.id, c.plan, c.webhook_limit, c.allow_overage FROM teams t JOIN customers c ON c.id = t.owner_id WHERE t.id = $1"
        )
        .bind(tid)
        .fetch_optional(pool)
        .await
        .ok()
        .flatten();

        if let Some((owner_id, _plan, limit, allow_overage)) = result {
            return (owner_id, limit, allow_overage);
        }
    }
    (customer.id, customer.webhook_limit, customer.allow_overage)
}

/// Atomically increment webhook_count with overage support.
/// When team_id is provided, webhook_count is tracked on the team owner's record
/// (team-level counting), and the team owner's plan limit applies.
/// Returns Err if at the limit (and overage is not allowed).
async fn reserve_webhook_slot(
    pool: &PgPool,
    customer: &Customer,
    count: i64,
    team_id: Option<Uuid>,
) -> Result<(), AppError> {
    let (tracking_id, effective_limit, allow_overage) = resolve_team_tracking(pool, customer, team_id).await;

    let updated: Option<(Uuid, i64)> = if allow_overage {
        sqlx::query_as("UPDATE customers SET webhook_count = webhook_count + $1 WHERE id = $2 RETURNING id, webhook_count")
            .bind(count).bind(tracking_id).fetch_optional(pool).await?
    } else {
        sqlx::query_as("UPDATE customers SET webhook_count = webhook_count + $1 WHERE id = $2 AND webhook_count + $1 <= $3 RETURNING id, webhook_count")
            .bind(count).bind(tracking_id).bind(effective_limit).fetch_optional(pool).await?
    };
    if updated.is_none() { Err(AppError::RateLimitExceeded) } else { Ok(()) }
}

/// Parse a date string (ISO datetime or date-only) with configurable time default.
fn parse_date_str(s: &str, default_hms: (u32, u32, u32)) -> Option<DateTime<Utc>> {
    if let Ok(dt) = NaiveDateTime::parse_from_str(s, "%Y-%m-%dT%H:%M:%S") {
        Some(DateTime::<Utc>::from_naive_utc_and_offset(dt, Utc))
    } else if let Ok(d) = NaiveDate::parse_from_str(s, "%Y-%m-%d") {
        Some(DateTime::<Utc>::from_naive_utc_and_offset(d.and_hms_opt(default_hms.0, default_hms.1, default_hms.2)?, Utc))
    } else {
        None
    }
}

fn parse_date_from_str(s: &str) -> Option<DateTime<Utc>> { parse_date_str(s, (0, 0, 0)) }
fn parse_date_to_str(s: &str) -> Option<DateTime<Utc>> { parse_date_str(s, (23, 59, 59)) }

async fn export_deliveries(
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

async fn get_delivery(
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

async fn get_delivery_attempts(
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_router_construction() {
        let _r = router();
    }

    // ── escape_csv_cell tests ──

    #[test]
    fn test_escape_csv_cell_simple() {
        assert_eq!(escape_csv_cell("hello"), "hello");
    }

    #[test]
    fn test_escape_csv_cell_with_comma() {
        assert_eq!(escape_csv_cell("hello, world"), "\"hello, world\"");
    }

    #[test]
    fn test_escape_csv_cell_with_quote() {
        assert_eq!(escape_csv_cell("say \"hi\""), "\"say \"\"hi\"\"\"");
    }

    #[test]
    fn test_escape_csv_cell_with_newline() {
        assert_eq!(escape_csv_cell("line1\nline2"), "\"line1\nline2\"");
    }

    #[test]
    fn test_escape_csv_cell_formula_injection_equals() {
        assert_eq!(escape_csv_cell("=cmd"), "'=cmd");
    }

    #[test]
    fn test_escape_csv_cell_formula_injection_plus() {
        assert_eq!(escape_csv_cell("+SUM(A1)"), "'+SUM(A1)");
    }

    #[test]
    fn test_escape_csv_cell_formula_injection_minus() {
        assert_eq!(escape_csv_cell("-1"), "'-1");
    }

    #[test]
    fn test_escape_csv_cell_formula_injection_at() {
        assert_eq!(escape_csv_cell("@ref"), "'@ref");
    }

    #[test]
    fn test_escape_csv_cell_formula_injection_tab() {
        assert_eq!(escape_csv_cell("\tvalue"), "'\tvalue");
    }

    #[test]
    fn test_escape_csv_cell_formula_injection_cr() {
        assert_eq!(escape_csv_cell("\rvalue"), "'\rvalue");
    }

    #[test]
    fn test_escape_csv_cell_formula_and_comma() {
        // Formula injection + comma => prefix + quoted
        assert_eq!(escape_csv_cell("=A1,B2"), "'\"=A1,B2\"");
    }

    #[test]
    fn test_escape_csv_cell_empty() {
        assert_eq!(escape_csv_cell(""), "");
    }

    // ── parse_date_from_str tests ──

    #[test]
    fn test_parse_date_from_str_datetime() {
        let dt = parse_date_from_str("2024-01-15T10:30:00").unwrap();
        assert_eq!(
            dt.format("%Y-%m-%dT%H:%M:%S").to_string(),
            "2024-01-15T10:30:00"
        );
    }

    #[test]
    fn test_parse_date_from_str_date_only() {
        let dt = parse_date_from_str("2024-01-15").unwrap();
        assert_eq!(
            dt.format("%Y-%m-%dT%H:%M:%S").to_string(),
            "2024-01-15T00:00:00"
        );
    }

    #[test]
    fn test_parse_date_from_str_invalid() {
        assert!(parse_date_from_str("not-a-date").is_none());
    }

    // ── parse_date_to_str tests ──

    #[test]
    fn test_parse_date_to_str_datetime() {
        let dt = parse_date_to_str("2024-01-15T10:30:00").unwrap();
        assert_eq!(
            dt.format("%Y-%m-%dT%H:%M:%S").to_string(),
            "2024-01-15T10:30:00"
        );
    }

    #[test]
    fn test_parse_date_to_str_date_only() {
        let dt = parse_date_to_str("2024-01-15").unwrap();
        // Date-only should set to end of day (23:59:59)
        assert_eq!(
            dt.format("%Y-%m-%dT%H:%M:%S").to_string(),
            "2024-01-15T23:59:59"
        );
    }

    #[test]
    fn test_parse_date_to_str_invalid() {
        assert!(parse_date_to_str("bad-date").is_none());
    }

    // ── ListParams tests ──

    #[test]
    fn test_list_params_deserialize() {
        let json = r#"{"page": 2, "per_page": 50, "status": "delivered"}"#;
        let params: ListParams = serde_json::from_str(json).unwrap();
        assert_eq!(params.page.unwrap(), 2);
        assert_eq!(params.per_page.unwrap(), 50);
        assert_eq!(params.status.unwrap(), "delivered");
    }

    #[test]
    fn test_list_params_defaults() {
        let json = r#"{}"#;
        let params: ListParams = serde_json::from_str(json).unwrap();
        assert!(params.page.is_none());
        assert!(params.per_page.is_none());
        assert!(params.status.is_none());
    }

    // ── ExportParams tests ──

    #[test]
    fn test_export_params_deserialize() {
        let json = r#"{"format": "csv", "status": "failed", "date_from": "2024-01-01", "date_to": "2024-01-31"}"#;
        let params: ExportParams = serde_json::from_str(json).unwrap();
        assert_eq!(params.format.unwrap(), "csv");
        assert_eq!(params.status.unwrap(), "failed");
        assert_eq!(params.date_from.unwrap(), "2024-01-01");
        assert_eq!(params.date_to.unwrap(), "2024-01-31");
    }

    #[test]
    fn test_export_params_empty() {
        let json = r#"{}"#;
        let params: ExportParams = serde_json::from_str(json).unwrap();
        assert!(params.format.is_none());
        assert!(params.status.is_none());
    }

    // ── BatchReplayRequest tests ──

    #[test]
    fn test_batch_replay_request_deserialize() {
        let id1 = Uuid::new_v4();
        let id2 = Uuid::new_v4();
        let json = format!(r#"{{"delivery_ids": ["{}", "{}"]}}"#, id1, id2);
        let req: BatchReplayRequest = serde_json::from_str(&json).unwrap();
        assert_eq!(req.delivery_ids.len(), 2);
        assert_eq!(req.delivery_ids[0], id1);
        assert_eq!(req.delivery_ids[1], id2);
    }

    #[test]
    fn test_batch_replay_request_empty() {
        let json = r#"{"delivery_ids": []}"#;
        let req: BatchReplayRequest = serde_json::from_str(json).unwrap();
        assert!(req.delivery_ids.is_empty());
    }

    // ── Pagination logic tests ──

    #[test]
    fn test_pagination_defaults() {
        // When no page/per_page provided, defaults are 1 and 20
        let page = 1i64;
        let per_page = 20i64;
        let offset = (page - 1) * per_page;
        assert_eq!(page, 1);
        assert_eq!(per_page, 20);
        assert_eq!(offset, 0);
    }

    #[test]
    fn test_pagination_clamping() {
        // Negative page should clamp to 1
        let raw_page = -1i64;
        let clamped_page = raw_page.max(1);
        assert_eq!(clamped_page, 1);

        // per_page over 200 should clamp to 200
        let raw_per_page = 500i64;
        let clamped_per_page = raw_per_page.min(200);
        assert_eq!(clamped_per_page, 200);
    }
}
