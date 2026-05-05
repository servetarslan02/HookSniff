use axum::extract::Extension;
use axum::routing::post;
use axum::{Json, Router};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::middleware::{generate_api_key, hash_api_key};
use crate::models::customer::{CreateCustomerRequest, Customer, CustomerResponse};

pub fn router() -> Router {
    Router::new().route("/", post(register))
}

async fn register(
    Extension(pool): Extension<PgPool>,
    Json(req): Json<CreateCustomerRequest>,
) -> Result<Json<CustomerResponse>, AppError> {
    // Validate email
    if !req.email.contains('@') {
        return Err(AppError::BadRequest("Invalid email".into()));
    }

    // Check if email exists
    let existing: Option<(Uuid,)> = sqlx::query_as(
        "SELECT id FROM customers WHERE email = $1"
    )
    .bind(&req.email)
    .fetch_optional(&pool)
    .await?;

    if existing.is_some() {
        return Err(AppError::BadRequest("Email already registered".into()));
    }

    // Generate API key
    let api_key = generate_api_key();
    let api_key_hash = hash_api_key(&api_key);
    let api_key_prefix = api_key[..15].to_string(); // hr_live_xxxx...

    let customer = sqlx::query_as::<_, Customer>(
        "INSERT INTO customers (email, api_key_hash, api_key_prefix) VALUES ($1, $2, $3) RETURNING *"
    )
    .bind(&req.email)
    .bind(&api_key_hash)
    .bind(&api_key_prefix)
    .fetch_one(&pool)
    .await?;

    tracing::info!("✅ New customer registered: {}", req.email);

    Ok(Json(customer.to_response(Some(api_key))))
}
