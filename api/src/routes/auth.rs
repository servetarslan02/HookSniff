use axum::extract::Extension;
use axum::routing::{get, post, put};
use axum::{Json, Router};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::jwt;
use crate::config::Config;
use crate::error::AppError;
use crate::middleware::{generate_api_key, hash_api_key};
use crate::models::customer::{
    AuthResponse, ChangePasswordRequest, CreateCustomerRequest, Customer, CustomerResponse,
    LoginRequest, UpdateProfileRequest,
};

pub fn router() -> Router {
    let public = Router::new()
        .route("/register", post(register))
        .route("/login", post(login));

    let protected = Router::new()
        .route("/me", get(get_me))
        .route("/profile", put(update_profile))
        .route("/password", put(change_password))
        .layer(axum::middleware::from_fn(crate::middleware::auth_middleware));

    public.merge(protected)
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
        "INSERT INTO customers (email, api_key_hash, api_key_prefix, password_hash, name, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING *",
    )
    .bind(&req.email)
    .bind(&api_key_hash)
    .bind(&api_key_prefix)
    .bind(&password_hash)
    .bind(&req.name)
    .fetch_one(&pool)
    .await?;

    // Generate JWT token
    let token = jwt::generate_token(customer.id, &customer.email, &customer.plan, &cfg.jwt_secret)?;

    tracing::info!("✅ New customer registered: {}", req.email);

    // Send welcome email (fire-and-forget, don't fail registration on email errors)
    if let Some(email_client) = crate::email::ResendClient::from_config(&cfg) {
        let to = req.email.clone();
        let name = req.name.clone();
        tokio::spawn(async move {
            if let Err(e) = email_client
                .send_welcome_email(&to, name.as_deref())
                .await
            {
                tracing::warn!("Failed to send welcome email to {}: {:?}", to, e);
            }
        });
    }

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
    let customer = sqlx::query_as::<_, Customer>("SELECT * FROM customers WHERE email = $1")
        .bind(&req.email)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::Unauthorized)?;

    // Check if user is active
    if !customer.is_active {
        return Err(AppError::Forbidden("Account has been deactivated".into()));
    }

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

/// GET /v1/auth/me — Return current user info
async fn get_me(Extension(customer): Extension<Customer>) -> Result<Json<CustomerResponse>, AppError> {
    Ok(Json(customer.to_response(None)))
}

/// PUT /v1/auth/profile — Update name and email
async fn update_profile(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<UpdateProfileRequest>,
) -> Result<Json<CustomerResponse>, AppError> {
    if req.name.trim().is_empty() {
        return Err(AppError::BadRequest("Name cannot be empty".into()));
    }
    if !req.email.contains('@') {
        return Err(AppError::BadRequest("Invalid email".into()));
    }

    // Check if new email is taken by another user
    if req.email != customer.email {
        let existing: Option<(Uuid,)> =
            sqlx::query_as("SELECT id FROM customers WHERE email = $1 AND id != $2")
                .bind(&req.email)
                .bind(customer.id)
                .fetch_optional(&pool)
                .await?;
        if existing.is_some() {
            return Err(AppError::BadRequest("Email already in use".into()));
        }
    }

    let updated = sqlx::query_as::<_, Customer>(
        "UPDATE customers SET name = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
    )
    .bind(&req.name)
    .bind(&req.email)
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    tracing::info!("✅ Profile updated for customer {}", customer.id);

    Ok(Json(updated.to_response(None)))
}

/// PUT /v1/auth/password — Change password
async fn change_password(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<ChangePasswordRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    if req.new_password.len() < 8 {
        return Err(AppError::BadRequest(
            "Password must be at least 8 characters".into(),
        ));
    }

    let hash = customer
        .password_hash
        .as_ref()
        .ok_or(AppError::BadRequest(
            "Password login not set up for this account".into(),
        ))?;

    if !jwt::verify_password(&req.current_password, hash)? {
        return Err(AppError::BadRequest("Current password is incorrect".into()));
    }

    let new_hash = jwt::hash_password(&req.new_password)?;

    sqlx::query("UPDATE customers SET password_hash = $1 WHERE id = $2")
        .bind(&new_hash)
        .bind(customer.id)
        .execute(&pool)
        .await?;

    tracing::info!("✅ Password changed for customer {}", customer.id);

    Ok(Json(serde_json::json!({"message": "Password updated successfully"})))
}
