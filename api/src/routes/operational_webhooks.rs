use axum::extract::{Extension, Path};
use axum::routing::get;
use axum::{Json, Router};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;
use crate::models::operational_webhook::{
    CreateOpWebhookEndpointRequest, OpWebhookEndpointResponse, OperationalWebhookEndpoint,
    UpdateOpWebhookEndpointRequest,
};
use crate::models::operational_webhook_delivery::{OpWebhookDeliveryResponse, OperationalWebhookDelivery};

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_endpoints).post(create_endpoint))
        .route(
            "/{id}",
            get(get_endpoint)
                .put(update_endpoint)
                .delete(delete_endpoint),
        )
        .route("/{id}/deliveries", get(list_deliveries))
}

fn generate_signing_secret() -> String {
    use aes_gcm::aead::rand_core::RngCore;
    let mut bytes = [0u8; 32];
    aes_gcm::aead::OsRng.fill_bytes(&mut bytes);
    format!("whsec_{}", hex::encode(bytes))
}

/// List all operational webhook endpoints.
async fn list_endpoints(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<OpWebhookEndpointResponse>>, AppError> {
    let endpoints = sqlx::query_as::<_, OperationalWebhookEndpoint>(
        "SELECT id, customer_id, url, description, is_active, signing_secret, event_types, created_at, updated_at \
         FROM operational_webhook_endpoints WHERE customer_id = $1 ORDER BY created_at DESC",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(endpoints.into_iter().map(|e| e.to_response()).collect()))
}

/// Get a single endpoint.
async fn get_endpoint(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<OpWebhookEndpointResponse>, AppError> {
    let endpoint = sqlx::query_as::<_, OperationalWebhookEndpoint>(
        "SELECT id, customer_id, url, description, is_active, signing_secret, event_types, created_at, updated_at \
         FROM operational_webhook_endpoints WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(endpoint.to_response()))
}

/// Create a new operational webhook endpoint.
async fn create_endpoint(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<CreateOpWebhookEndpointRequest>,
) -> Result<Json<OpWebhookEndpointResponse>, AppError> {
    req.validate().map_err(AppError::BadRequest)?;

    let secret = generate_signing_secret();

    let endpoint = sqlx::query_as::<_, OperationalWebhookEndpoint>(
        "INSERT INTO operational_webhook_endpoints (id, customer_id, url, description, is_active, signing_secret, event_types) \
         VALUES ($1, $2, $3, $4, $5, $6, $7) \
         RETURNING id, customer_id, url, description, is_active, signing_secret, event_types, created_at, updated_at",
    )
    .bind(Uuid::new_v4())
    .bind(customer.id)
    .bind(&req.url)
    .bind(&req.description)
    .bind(req.is_active.unwrap_or(true))
    .bind(&secret)
    .bind(&req.event_types)
    .fetch_one(&pool)
    .await?;

    Ok(Json(endpoint.to_response()))
}

/// Update an endpoint.
async fn update_endpoint(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateOpWebhookEndpointRequest>,
) -> Result<Json<OpWebhookEndpointResponse>, AppError> {
    let _existing = sqlx::query_as::<_, OperationalWebhookEndpoint>(
        "SELECT id, customer_id, url, description, is_active, signing_secret, event_types, created_at, updated_at \
         FROM operational_webhook_endpoints WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let endpoint = sqlx::query_as::<_, OperationalWebhookEndpoint>(
        "UPDATE operational_webhook_endpoints SET \
         url = COALESCE($3, url), \
         description = COALESCE($4, description), \
         is_active = COALESCE($5, is_active), \
         event_types = COALESCE($6, event_types), \
         updated_at = now() \
         WHERE id = $1 AND customer_id = $2 \
         RETURNING id, customer_id, url, description, is_active, signing_secret, event_types, created_at, updated_at",
    )
    .bind(id)
    .bind(customer.id)
    .bind(&req.url)
    .bind(&req.description)
    .bind(req.is_active)
    .bind(&req.event_types)
    .fetch_one(&pool)
    .await?;

    Ok(Json(endpoint.to_response()))
}

/// Delete an endpoint.
async fn delete_endpoint(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query(
        "DELETE FROM operational_webhook_endpoints WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({ "deleted": true })))
}

/// List deliveries for an endpoint.
async fn list_deliveries(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<OpWebhookDeliveryResponse>>, AppError> {
    // Verify endpoint ownership
    let _endpoint = sqlx::query_as::<_, OperationalWebhookEndpoint>(
        "SELECT id, customer_id, url, description, is_active, signing_secret, event_types, created_at, updated_at \
         FROM operational_webhook_endpoints WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let deliveries = sqlx::query_as::<_, OperationalWebhookDelivery>(
        "SELECT id, endpoint_id, customer_id, event_type, payload, response_status, response_body, attempt_count, status, created_at, delivered_at \
         FROM operational_webhook_deliveries WHERE endpoint_id = $1 ORDER BY created_at DESC LIMIT 100",
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(deliveries.into_iter().map(|d| d.to_response()).collect()))
}
