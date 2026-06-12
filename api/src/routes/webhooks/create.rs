//! Single and batch webhook creation handlers.

use axum::extract::Extension;
use axum::Json;
use chrono::Utc;
use sqlx::PgPool;
use uuid::Uuid;

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

/// Type alias for Redis queue extension — simplifies handler signatures
#[allow(dead_code)]
type RedisQueueExt = Extension<std::sync::Arc<std::sync::Mutex<Option<crate::queue::RedisQueue>>>>;

use super::helpers::resolve_team_tracking;

pub async fn create_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(cache): Extension<Option<crate::cache::CacheLayer>>,
    Extension(is_test): Extension<crate::middleware::IsTestKey>,
    Extension(event_publisher): Extension<Option<crate::events::EventPublisher>>,
    Extension(feature_flags): Extension<FeatureFlagService>,
    Extension(count_buffer): Extension<crate::webhook_count_buffer::WebhookCountBuffer>,
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

    // Content-based deduplication (skip if idempotency key is present — already handles dupes)
    if idempotency_key.is_none() && feature_flags.is_enabled("deduplication").await {
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
    if payload_size > 1_048_576 { // 1MB default max payload
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

    // ── Combined limit check + INSERT in a single CTE (1 round-trip instead of 2) ──
    // This atomically checks the customer's webhook limit and inserts the delivery.
    let tracking_info = resolve_team_tracking(&pool, &cache, &customer, team_id).await;
    let tracking_id = tracking_info.tracking_id;

    let delivery: Delivery = if tracking_info.allow_overage {
        // Overage allowed: just INSERT (no limit check needed)
        db::timed_query("webhook_create_delivery", async {
            sqlx::query_as::<_, Delivery>(
                "INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status, max_attempts, is_test) \
                 VALUES ($1, $2, $3, $4, 'pending', $5, $6) RETURNING *"
            )
            .bind(endpoint.id)
            .bind(customer.id)
            .bind(&payload)
            .bind(&req.event)
            .bind(retry_policy.max_attempts)
            .bind(is_test.0)
            .fetch_one(&pool)
            .await
        }).await?
    } else {
        // No overage: CTE checks limit AND inserts in one round-trip
        db::timed_query("webhook_create_with_limit", async {
            sqlx::query_as::<_, Delivery>(
                "WITH limit_check AS ( \
                    SELECT id, webhook_count, webhook_limit FROM customers \
                    WHERE id = $1 AND webhook_count < webhook_limit \
                ), \
                insert_delivery AS ( \
                    INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status, max_attempts, is_test) \
                    SELECT $2, $1, $3, $4, 'pending', $5, $6 \
                    FROM limit_check \
                    RETURNING * \
                ) \
                SELECT * FROM insert_delivery"
            )
            .bind(tracking_id)                // $1
            .bind(endpoint.id)                // $2
            .bind(&payload)                   // $3
            .bind(&req.event)                 // $4
            .bind(retry_policy.max_attempts)  // $5
            .bind(is_test.0)                  // $6
            .fetch_one(&pool)
            .await
        }).await.map_err(|e| {
            let err_str = e.to_string();
            if err_str.contains("no rows") || err_str.contains("RowNotFound") {
                AppError::RateLimitExceeded
            } else {
                AppError::Internal(e)
            }
        })?
    };

    // Buffer the increment (non-blocking, flushed every 5s)
    count_buffer.increment(tracking_id, 1);

    // ── Fire-and-forget: queue publish + idempotency + event (don't block response) ──
    let delivery_id = delivery.id;
    let delivery_resp = delivery.to_response();
    let endpoint_clone = endpoint.clone();
    let customer_id = customer.id;
    let event_type = req.event.clone();
    let pool_bg = pool.clone();
    let event_publisher_bg = event_publisher.clone();

    tokio::spawn(async move {
        // Publish to queue (Redis-first, PG fallback)
        let mut rq_clone = match crate::db::REDIS_QUEUE.lock() {
            Ok(guard) => guard.clone(),
            Err(poisoned) => poisoned.into_inner().clone(),
        };
        if let Err(e) = db::publish_to_queue_fast(
            &pool_bg,
            &mut rq_clone,
            delivery_id,
            endpoint_clone.id,
            &endpoint_clone.url,
            &payload_str,
            endpoint_clone.custom_headers.as_ref(),
            &endpoint_clone.signing_secret,
            retry_policy.max_attempts,
            endpoint_clone.fifo_enabled.unwrap_or(false),
        ).await {
            tracing::error!("Background queue publish failed for {}: {:?}", delivery_id, e);
            let _ = sqlx::query("UPDATE deliveries SET status = 'failed', error_message = 'Queue publish failed' WHERE id = $1")
                .bind(delivery_id).execute(&pool_bg).await;
        }

        // Publish event (best-effort)
        if let Some(ref publisher) = event_publisher_bg {
            publisher.publish(crate::events::AppEvent::DeliveryCreated {
                delivery_id,
                endpoint_id: endpoint_clone.id,
                customer_id,
                event_type,
            }).await.ok();
        }
    });

    // Store idempotency key in background (don't block response)
    if let Some(key) = idempotency_key {
        let pool_idem = pool.clone();
        let resp_value = serde_json::to_value(&delivery_resp).unwrap_or(serde_json::Value::Null);
        let key_owned = key.to_string();
        tokio::spawn(async move {
            if let Err(e) = idempotency::store_idempotency(
                &pool_idem, &key_owned, customer_id, resp_value, 200, body_hash.as_deref(),
            ).await {
                tracing::warn!("Background idempotency store failed: {:?}", e);
            }
        });
    }

    // Test mode: mark as delivered immediately
    if is_test.0 {
        sqlx::query(
            "UPDATE deliveries SET status = 'delivered', attempt_count = 0, response_status = 200, response_body = '{\"test\": true}' WHERE id = $1",
        )
        .bind(delivery_id)
        .execute(&pool)
        .await?;

        tracing::info!("🧪 Test delivery {} marked as delivered", delivery_id);
        let mut resp = delivery_resp;
        resp.status = "delivered".to_string();
        resp.response_status = Some(200);
        return Ok(Json(resp));
    }

    Ok(Json(delivery_resp))
}

pub async fn batch_webhooks(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(cache): Extension<Option<crate::cache::CacheLayer>>,
    Extension(event_publisher): Extension<Option<crate::events::EventPublisher>>,
    Extension(count_buffer): Extension<crate::webhook_count_buffer::WebhookCountBuffer>,
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

    let batch_count = req.webhooks.len() as i64;

    // Fast limit check with buffer
    {
        let info = resolve_team_tracking(&pool, &cache, &customer, team_id).await;
        if !info.allow_overage {
            let current: (i64,) = sqlx::query_as(
                "SELECT webhook_count FROM customers WHERE id = $1"
            )
            .bind(info.tracking_id)
            .fetch_one(&pool)
            .await?;
            let buffered = count_buffer.pending_count(&info.tracking_id);
            if current.0 + buffered + batch_count > info.webhook_limit {
                return Err(AppError::RateLimitExceeded);
            }
        }
        count_buffer.increment(info.tracking_id, batch_count);
    }

    // Track daily event usage (best-effort, once per batch)
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

    // ── Pre-validate and prepare all webhooks before bulk insert ──
    struct ValidWebhook {
        endpoint: Endpoint,
        event: Option<String>,
        payload_json: serde_json::Value,
        payload_str: String,
        retry_policy: RetryPolicy,
    }
    let mut valid_webhooks: Vec<ValidWebhook> = Vec::new();
    let mut deliveries = Vec::new();
    let mut errors = Vec::new();
    let mut created_count: i64 = 0;

    for (i, webhook_req) in req.webhooks.iter().enumerate() {
        let payload_size = serde_json::to_string(&webhook_req.data)
            .map(|s| s.len())
            .unwrap_or(0);
        if payload_size > 1_048_576 {
            errors.push(BatchError { index: i, error: "Payload too large".to_string() });
            continue;
        }

        let endpoint = match endpoint_map.get(&webhook_req.endpoint_id) {
            Some(ep) => ep.clone(),
            None => {
                errors.push(BatchError { index: i, error: "Endpoint not found or inactive".to_string() });
                continue;
            }
        };

        if let Some(ref event) = webhook_req.event {
            if !endpoint.matches_event_filter(event) {
                continue;
            }
        }

        let payload = serde_json::json!({
            "event": webhook_req.event,
            "data": webhook_req.data,
            "timestamp": Utc::now().to_rfc3339(),
        });

        let payload_str = match serde_json::to_string(&payload) {
            Ok(s) => s,
            Err(_e) => {
                errors.push(BatchError { index: i, error: "Invalid payload format".to_string() });
                continue;
            }
        };

        let retry_policy = RetryPolicy::from_value(endpoint.retry_policy.as_ref());

        valid_webhooks.push(ValidWebhook {
            endpoint,
            event: webhook_req.event.clone(),
            payload_json: payload,
            payload_str,
            retry_policy,
        });
    }

    // ── Bulk INSERT all valid deliveries in one query (eliminates N round-trips) ──
    if !valid_webhooks.is_empty() {
        // Build multi-row INSERT
        let mut query = String::from(
            "INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status, max_attempts) VALUES "
        );
        let mut params: Vec<String> = Vec::new();
        for (i, _) in valid_webhooks.iter().enumerate() {
            let base = i * 6;
            params.push(format!("(${}, ${}, ${}, ${}, 'pending', ${})", 
                base + 1, base + 2, base + 3, base + 4, base + 5));
        }
        query.push_str(&params.join(", "));
        query.push_str(" RETURNING id, endpoint_id, event_type, status, created_at");

        let mut q = sqlx::query_as::<_, (Uuid, Uuid, Option<String>, String, chrono::DateTime<Utc>)>(&query);
        for vw in &valid_webhooks {
            q = q.bind(vw.endpoint.id)
                .bind(customer.id)
                .bind(&vw.payload_json)
                .bind(&vw.event)
                .bind(vw.retry_policy.max_attempts);
        }

        let rows = db::timed_query("webhook_batch_bulk_insert", async {
            q.fetch_all(&pool).await
        }).await?;

        // Map rows back to deliveries and publish to queue
        for (row_idx, (delivery_id, _endpoint_id, _event_type, status, created_at)) in rows.into_iter().enumerate() {
            let vw = &valid_webhooks[row_idx];

            let queue_result = {
                let mut rq_clone = match crate::db::REDIS_QUEUE.lock() {
                    Ok(guard) => guard.clone(),
                    Err(poisoned) => poisoned.into_inner().clone(),
                };
                db::publish_to_queue_fast(
                    &pool,
                    &mut rq_clone,
                    delivery_id,
                    vw.endpoint.id,
                    &vw.endpoint.url,
                    &vw.payload_str,
                    vw.endpoint.custom_headers.as_ref(),
                    &vw.endpoint.signing_secret,
                    vw.retry_policy.max_attempts,
                    vw.endpoint.fifo_enabled.unwrap_or(false),
                ).await
            };

            if let Err(e) = queue_result {
                tracing::error!("Failed to publish batch delivery {} to queue: {:?}", delivery_id, e);
                let _ = sqlx::query("UPDATE deliveries SET status = 'failed', error_message = 'Queue publish failed' WHERE id = $1")
                    .bind(delivery_id).execute(&pool).await;
                errors.push(BatchError { index: row_idx, error: "Failed to queue delivery".to_string() });
            } else {
                if let Some(ref publisher) = event_publisher {
                    publisher.publish(crate::events::AppEvent::DeliveryCreated {
                        delivery_id,
                        endpoint_id: vw.endpoint.id,
                        customer_id: customer.id,
                        event_type: vw.event.clone(),
                    }).await.ok();
                }
                created_count += 1;
                deliveries.push(DeliveryResponse {
                    id: delivery_id,
                    endpoint_id: vw.endpoint.id,
                    event: vw.event.clone(),
                    status,
                    attempt_count: 0,
                    response_status: None,
                    replay_count: Some(0),
                    created_at,
                    is_test: None,
                });
            }
        }
    }

    // Rollback excess webhook_count for failed/filtered items via buffer
    let excess = batch_count - created_count;
    if excess > 0 {
        let info = resolve_team_tracking(&pool, &cache, &customer, team_id).await;
        count_buffer.increment(info.tracking_id, -excess);
    }

    Ok(Json(BatchResponse { deliveries, errors }))
}


