use axum::extract::{Extension, Path};
use axum::routing::{delete, get, post};
use axum::{Json, Router};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::middleware::generate_api_key;
use crate::models::customer::Customer;
use crate::models::endpoint::{CreateEndpointRequest, Endpoint, EndpointResponse};

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_endpoints).post(create_endpoint))
        .route("/{id}", get(get_endpoint).delete(delete_endpoint))
}

async fn list_endpoints(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<EndpointResponse>>, AppError> {
    let endpoints = sqlx::query_as::<_, Endpoint>(
        "SELECT * FROM endpoints WHERE customer_id = $1 ORDER BY created_at DESC"
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(endpoints.into_iter().map(|e| e.to_response()).collect()))
}

async fn create_endpoint(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<CreateEndpointRequest>,
) -> Result<Json<EndpointResponse>, AppError> {
    // Validate URL
    if !req.url.starts_with("https://") && !req.url.starts_with("http://") {
        return Err(AppError::BadRequest("URL must start with http:// or https://".into()));
    }

    // SSRF protection: block internal IPs
    if is_internal_url(&req.url) {
        return Err(AppError::Forbidden("Internal URLs are not allowed".into()));
    }

    let signing_secret = format!("whsec_{}", Uuid::new_v4().to_string().replace('-', ""));

    let endpoint = sqlx::query_as::<_, Endpoint>(
        "INSERT INTO endpoints (customer_id, url, description, signing_secret) VALUES ($1, $2, $3, $4) RETURNING *"
    )
    .bind(customer.id)
    .bind(&req.url)
    .bind(&req.description)
    .bind(&signing_secret)
    .fetch_one(&pool)
    .await?;

    Ok(Json(endpoint.to_response()))
}

async fn get_endpoint(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<EndpointResponse>, AppError> {
    let endpoint = sqlx::query_as::<_, Endpoint>(
        "SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2"
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(endpoint.to_response()))
}

async fn delete_endpoint(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query(
        "DELETE FROM endpoints WHERE id = $1 AND customer_id = $2"
    )
    .bind(id)
    .bind(customer.id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({"deleted": true})))
}

fn is_internal_url(url: &str) -> bool {
    let blocked = ["localhost", "127.0.0.1", "0.0.0.0", "10.", "172.16.", "192.168.", "169.254."];
    blocked.iter().any(|b| url.contains(b))
}
