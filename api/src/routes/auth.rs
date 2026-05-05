use axum::extract::Extension;
use axum::routing::post;
use axum::{Json, Router};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::jwt;
use crate::config::Config;
use crate::error::AppError;
use crate::middleware::{generate_api_key, hash_api_key};
use crate::models::customer::{
    AuthResponse, CreateCustomerRequest, Customer, CustomerResponse, LoginRequest,
};

pub fn router() -> Router {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
}

async fn register(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Json(req): Json<CreateCustomerRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    // Validate email
    if !req.email.contains('@') {
        return Err(AppError::BadRequest("Invalid email".into()));
    }

    // Password is required
    let password = req
        .password
        .ok_or_else(|| AppError::BadRequest("Password is required".into()))?;

    if password.len() < 8 {
        return Err(AppError::BadRequest(
            "Password must be at least 8 characters".into(),
        ));
    }

    // Check if email exists
    let existing: Option<(Uuid,)> = sqlx::query_as("SELECT id FROM customers WHERE email = $1")
        .bind(&req.email)
        .fetch_optional(&pool)
        .await?;

    if existing.is_some() {
        return Err(AppError::BadRequest("Email already registered".into()));
    }

    // Generate API key
    let api_key = generate_api_key();
    let api_key_hash = hash_api_key(&api_key);
    let api_key_prefix = api_key[..15].to_string();

    // Hash password
    let password_hash = jwt::hash_password(&password)?;

    let customer = sqlx::query_as::<_, Customer>(
        "INSERT INTO customers (email, api_key_hash, api_key_prefix, password_hash) VALUES ($1, $2, $3, $4) RETURNING *",
    )
    .bind(&req.email)
    .bind(&api_key_hash)
    .bind(&api_key_prefix)
    .bind(&password_hash)
    .fetch_one(&pool)
    .await?;

    // Generate JWT token
    let token = jwt::generate_token(customer.id, &customer.email, &customer.plan, &cfg.jwt_secret)?;

    tracing::info!("✅ New customer registered: {}", req.email);

    Ok(Json(AuthResponse {
        token,
        customer: customer.to_response(Some(api_key)),
    }))
}

async fn login(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Json(req): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    let customer = sqlx::query_as::<_, Customer>(
        "SELECT * FROM customers WHERE email = $1",
    )
    .bind(&req.email)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::Unauthorized)?;

    // Verify password
    let hash = customer
        .password_hash
        .as_ref()
        .ok_or(AppError::BadRequest(
            "Password login not set up for this account. Use API key auth.".into(),
        ))?;

    if !jwt::verify_password(&req.password, hash)? {
        return Err(AppError::Unauthorized);
    }

    // Generate JWT token
    let token = jwt::generate_token(customer.id, &customer.email, &customer.plan, &cfg.jwt_secret)?;

    tracing::info!("✅ Customer logged in: {}", req.email);

    Ok(Json(AuthResponse {
        token,
        customer: customer.to_response(None),
    }))
}
