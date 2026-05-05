use axum::extract::{Extension, Path, Query};
use axum::routing::{get, post};
use axum::{Json, Router};
use chrono::Utc;
use rdkafka::producer::FutureProducer;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::config::Config;
use crate::error::AppError;
use crate::kafka;
use crate::middleware::idempotency;
use crate::models::customer::Customer;
use crate::models::delivery::{CreateWebhookRequest, Delivery, DeliveryListResponse, DeliveryResponse};
use crate::models::endpoint::Endpoint;
use crate::validation;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_deliveries).post(create_webhook))
        .route("/{id}", get(get_delivery))
}

#[derive(Debug, Deserialize)]
struct ListParams {
    page: Option<i64>,
    per_page: Option<i64>,
    status: Option<String>,
}

async fn list_deliveries(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<ListParams>,
) -> Result<Json<DeliveryListResponse>, AppError> {
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).min(100);
    let offset = (page - 1) * per_page;

    let (deliveries, total) = if let Some(status) = &params.status {
        let deliveries = sqlx::query_as::<_, Delivery>(
            "SELECT * FROM deliveries WHERE customer_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4",
        )
        .bind(customer.id)
        .bind(status)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await?;

        let total: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = $2",
        )
        .bind(customer.id)
        .bind(status)
        .fetch_one(&pool)
        .await?;

        (deliveries, total.0)
    } else {
        let deliveries = sqlx::query_as::<_, Delivery>(
            "SELECT * FROM deliveries WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
        )
        .bind(customer.id)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await?;

        let total: (i64,) =
            sqlx::query_as("SELECT COUNT(*) FROM deliveries WHERE customer_id = $1")
                .bind(customer.id)
                .fetch_one(&pool)
                .await?;

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
    Extension(producer): Extension<FutureProducer>,
    Extension(customer): Extension<Customer>,
    Extension(cfg): Extension<Config>,
    headers: axum::http::header::HeaderMap,
    Json(req): Json<CreateWebhookRequest>,
) -> Result<Json<DeliveryResponse>, AppError> {
    // Check idempotency key
    let idempotency_key = headers
        .get("Idempotency-Key")
        .and_then(|v| v.to_str().ok());

    if let Some(key) = idempotency_key {
        if let Some(cached) = idempotency::check_idempotency(&pool, key, customer.id).await {
            tracing::info!("♻️ Returning cached response for idempotency key: {}", key);
            // Return the cached response with the original status code
            return Ok(Json(serde_json::from_value(cached.response_body).unwrap_or_else(|_| {
                DeliveryResponse {
                    id: Uuid::nil(),
                    endpoint_id: Uuid::nil(),
                    event: None,
                    status: "cached".to_string(),
                    attempt_count: 0,
                    response_status: Some(cached.status_code),
                    created_at: cached.created_at,
                }
            })));
        }
    }

    // Validate event_type if provided
    if let Some(ref event) = req.event {
        validation::validate_event_type(event)?;
    }

    // Validate JSON payload depth
    validation::validate_json_depth(&req.data)?;

    // Check payload size
    let payload_size = serde_json::to_string(&req.data)
        .map(|s| s.len())
        .unwrap_or(0);
    if payload_size > cfg.max_webhook_payload_bytes {
        return Err(AppError::PayloadTooLarge);
    }

    // Check rate limit
    if customer.webhook_count >= customer.webhook_limit {
        return Err(AppError::RateLimitExceeded);
    }

    // Verify endpoint exists and belongs to customer
    let endpoint = sqlx::query_as::<_, Endpoint>(
        "SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2 AND is_active = true",
    )
    .bind(req.endpoint_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    // Check event filter - skip delivery if event doesn't match
    if let Some(ref event) = req.event {
        if !endpoint.matches_event_filter(event) {
            tracing::info!(
                "⏭️ Event '{}' does not match filter for endpoint {}, skipping",
                event,
                endpoint.id
            );
            // Return a response indicating the event was filtered
            let response = serde_json::json!({
                "id": Uuid::nil(),
                "endpoint_id": endpoint.id,
                "event": event,
                "status": "filtered",
                "attempt_count": 0,
                "response_status": null,
                "created_at": Utc::now().to_rfc3339(),
            });
            return Ok(Json(serde_json::from_value(response).unwrap_or_else(|_| {
                DeliveryResponse {
                    id: Uuid::nil(),
                    endpoint_id: endpoint.id,
                    event: Some(event.clone()),
                    status: "filtered".to_string(),
                    attempt_count: 0,
                    response_status: None,
                    created_at: Utc::now(),
                }
            })));
        }
    }

    // Build payload
    let payload = serde_json::json!({
        "event": req.event,
        "data": req.data,
        "timestamp": Utc::now().to_rfc3339(),
    });

    let payload_str =
        serde_json::to_string(&payload).map_err(|e| AppError::Internal(e.into()))?;

    // Create delivery record
    let delivery = sqlx::query_as::<_, Delivery>(
        "INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING *",
    )
    .bind(endpoint.id)
    .bind(customer.id)
    .bind(&payload)
    .bind(&req.event)
    .fetch_one(&pool)
    .await?;

    // Increment customer webhook count
    sqlx::query("UPDATE customers SET webhook_count = webhook_count + 1 WHERE id = $1")
        .bind(customer.id)
        .execute(&pool)
        .await?;

    // Publish to Kafka (include custom_headers for worker)
    kafka::publish_webhook(
        &producer,
        &cfg.kafka_topic,
        &delivery.id.to_string(),
        &customer.id.to_string(),
        &serde_json::json!({
            "delivery_id": delivery.id,
            "endpoint_id": endpoint.id,
            "endpoint_url": endpoint.url,
            "signing_secret": endpoint.signing_secret,
            "old_signing_secret": endpoint.old_signing_secret,
            "secret_rotated_at": endpoint.secret_rotated_at.map(|t| t.to_rfc3339()),
            "custom_headers": endpoint.custom_headers,
            "payload": payload_str,
        })
        .to_string(),
    )
    .await
    .map_err(|e| {
        tracing::error!("Failed to publish to Kafka: {:?}", e);
        AppError::Internal(e)
    })?;

    // Store idempotency key if provided
    if let Some(key) = idempotency_key {
        let response_body = serde_json::to_value(&delivery.to_response())
            .unwrap_or(serde_json::Value::Null);
        if let Err(e) =
            idempotency::store_idempotency(&pool, key, customer.id, response_body, 200).await
        {
            tracing::warn!("Failed to store idempotency key: {:?}", e);
        }
    }

    Ok(Json(delivery.to_response()))
}

async fn get_delivery(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<DeliveryResponse>, AppError> {
    let delivery = sqlx::query_as::<_, Delivery>(
        "SELECT * FROM deliveries WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(delivery.to_response()))
}
