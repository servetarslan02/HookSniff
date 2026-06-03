//! Single and batch webhook creation handlers.

use axum::extract::Extension;
use axum::Json;
use chrono::Utc;
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
    BatchError, BatchResponse, BatchWebhookRequest, CreateWebhookRequest, Delivery, DeliveryResponse,
};
use crate::models::endpoint::{Endpoint, RetryPolicy};
use crate::validation;

use super::helpers::{reserve_webhook_slot, resolve_team_tracking};

pub async fn create_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(cfg): Extension<Config>,
    Extension(cache): Extension<Option<crate::cache::CacheLayer>>,
    Extension(is_test): Extension<crate::middleware::IsTestKey>,
    Extension(event_publisher): Extension<Option<crate::events::EventPublisher>>,
    Extension(feature_flags): Extension<FeatureFlagService>,
    Extension(redis_queue): Extension<std::sync::Arc<std::sync::Mutex<Option<crate::queue::RedisQueue>>>>,
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

        let duplicate = db::timed_query("webhook_dedup_check", async {
            sqlx::query_as::<_, (Uuid, String, chrono::DateTime<Utc>)>(
                "SELECT id, status, created_at FROM deliveries \
                 WHERE endpoint_id = $1 AND customer_id = $2 AND payload_hash = $3 \
                 AND created_at >= $4 ORDER BY created_at DESC LIMIT 1"
            )
            .bind(req.endpoint_id)
            .bind(customer.id)
            .bind(&content_hash)
            .bind(cutoff)
            .fetch_optional(&pool)
            .await
        })
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

    // Verify endpoint exists and belongs to customer (Use cache for Phase 3)
    let endpoint_key = format!("{}:{}", customer.id, req.endpoint_id);
    let endpoint: Endpoint = if let Some(ref c) = cache {
        if let Some(cached) = c.get::<Endpoint>("endpoint", &endpoint_key).await {
            cached
        } else {
            let ep = sqlx::query_as::<_, Endpoint>(
                "SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = $1 AND customer_id = $2 AND is_active = true",
            )
            .bind(req.endpoint_id)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?
            .ok_or(AppError::NotFound)?;
            
            c.set_with_ttl("endpoint", &endpoint_key, &ep, crate::cache::ENDPOINT_TTL).await;
            ep
        }
    } else {
        sqlx::query_as::<_, Endpoint>(
            "SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = $1 AND customer_id = $2 AND is_active = true",
        )
        .bind(req.endpoint_id)
        .bind(customer.id)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::NotFound)?
    };

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
    reserve_webhook_slot(&pool, &cache, &customer, 1, team_id).await?;

    // Track daily event usage for overage notifications (best-effort)
    let _ = track_daily_event(&pool, &customer, &cache, None, team_id).await;

    let delivery = db::timed_query("webhook_create_delivery", async {
        sqlx::query_as::<_, Delivery>(
            "INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status, max_attempts, is_test) VALUES ($1, $2, $3, $4, 'pending', $5, $6) RETURNING *",
        )
        .bind(endpoint.id)
        .bind(customer.id)
        .bind(&payload)
        .bind(&req.event)
        .bind(retry_policy.max_attempts)
        .bind(is_test.0)
        .fetch_one(&pool)
        .await
    })
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

        let mut resp = delivery.to_response();
        resp.status = "delivered".to_string();
        resp.response_status = Some(200);
        return Ok(Json(resp));
    }

    // ── Publish to queue: Redis-first, PG fallback ──
    // If USE_REDIS_QUEUE is enabled and Redis is available, use Redis Streams
    // for < 10ms delivery latency. Otherwise, fall back to PostgreSQL queue.
    let redis_guard = redis_queue.lock().await;
    let redis_available = redis_guard.as_ref().map(|r| r.is_available()).unwrap_or(false);
    drop(redis_guard);

    if cfg.use_redis_queue && redis_available {
        if let Some(ref mut rq) = *redis_queue.lock().await {
            let msg = crate::queue::WebhookMessage {
                delivery_id: delivery.id.to_string(),
                endpoint_id: endpoint.id.to_string(),
                url: endpoint.url.clone(),
                payload: payload_str.clone(),
                custom_headers: endpoint.custom_headers.clone(),
                attempt: 1,
            };
            if let Ok(msg_id) = rq.enqueue(&msg).await {
                tracing::info!(
                    "⚡ Redis enqueue: delivery={} msg_id={} ({}ms)",
                    delivery.id, msg_id, start.elapsed().as_millis()
                );
                // Update delivery status to queued
                sqlx::query("UPDATE deliveries SET status = 'queued' WHERE id = $1")
                    .bind(delivery.id)
                    .execute(&pool)
                    .await
                    .ok();
            } else {
                tracing::warn!("Redis enqueue failed, falling back to PG queue");
                db::publish_to_queue(&pool, delivery.id, endpoint.id, &endpoint.url, &payload_str, endpoint.custom_headers.as_ref())
                    .await
                    .map_err(|e| {
                        tracing::error!("Failed to publish to queue: {:?}", e);
                        AppError::Internal(e)
                    })?;
            }
        } else {
            db::publish_to_queue(&pool, delivery.id, endpoint.id, &endpoint.url, &payload_str, endpoint.custom_headers.as_ref())
                .await
                .map_err(|e| {
                    tracing::error!("Failed to publish to queue: {:?}", e);
                    AppError::Internal(e)
                })?;
        }
    } else {
        db::publish_to_queue(&pool, delivery.id, endpoint.id, &endpoint.url, &payload_str, endpoint.custom_headers.as_ref())
            .await
            .map_err(|e| {
                tracing::error!("Failed to publish to queue: {:?}", e);
                AppError::Internal(e)
            })?;
    }

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
    Extension(cache): Extension<Option<crate::cache::CacheLayer>>,
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
    reserve_webhook_slot(&pool, &cache, &customer, batch_count, team_id).await?;

    // Track daily event usage for overage notifications (best-effort, once per batch)
    let _ = track_daily_event(&pool, &customer, &cache, None, team_id).await;

    // Collect unique endpoint IDs and fetch all in one query (eliminates N+1)
    let endpoint_ids: Vec<Uuid> = req
        .webhooks
        .iter()
        .map(|w| w.endpoint_id)
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect();

    let endpoints: Vec<Endpoint> = db::timed_query("webhook_batch_endpoints", async {
        sqlx::query_as::<_, Endpoint>(
            "SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = ANY($1) AND customer_id = $2 AND is_active = true",
        )
        .bind(&endpoint_ids)
        .bind(customer.id)
        .fetch_all(&pool)
        .await
    })
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

        match db::timed_query("webhook_batch_create_delivery", async {
            sqlx::query_as::<_, Delivery>(
                "INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status, max_attempts) VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING *",
            )
            .bind(endpoint.id)
            .bind(customer.id)
            .bind(&payload)
            .bind(&webhook_req.event)
            .bind(retry_policy.max_attempts)
            .fetch_one(&pool)
            .await
        })
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
    let excess = batch_count - created_count;
    if excess > 0 {
        let info = resolve_team_tracking(&pool, &cache, &customer, team_id).await;
        let _ = sqlx::query(
            "UPDATE customers SET webhook_count = GREATEST(0, webhook_count - $1) WHERE id = $2",
        )
        .bind(excess)
        .bind(info.tracking_id)
        .execute(&pool)
        .await;
    }

    Ok(Json(BatchResponse { deliveries, errors }))
}
