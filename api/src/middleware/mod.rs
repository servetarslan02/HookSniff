pub mod idempotency;
pub mod webhook_verify;

use axum::{
    extract::Request,
    http::header::AUTHORIZATION,
    middleware::Next,
    response::Response,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

/// Middleware that assigns a unique request ID to every request and adds it to tracing context
pub async fn request_id_middleware(mut req: Request, next: Next) -> Response {
    let request_id = req
        .headers()
        .get("X-Request-ID")
        .and_then(|v| v.to_str().ok().map(|s| s.to_string()))
        .unwrap_or_else(|| Uuid::new_v4().to_string());

    // Insert request ID into extensions for downstream handlers
    req.extensions_mut().insert(request_id.clone());

    // Add request ID to tracing span
    let span = tracing::info_span!("request", request_id = %request_id);
    let _guard = span.enter();

    let mut response = next.run(req).await;

    // Add request ID to response headers
    response
        .headers_mut()
        .insert("X-Request-ID", request_id.parse().unwrap());

    response
}

/// Authenticate requests via API key (hr_live_*) or JWT token.
///
/// Supports two authentication methods:
/// 1. API key: `Authorization: Bearer hr_live_...` — looks up `api_key_hash` in customers table
/// 2. JWT token: `Authorization: Bearer eyJ...` — verifies JWT and loads customer by `sub` claim
pub async fn auth_middleware(
    pool: axum::extract::Extension<PgPool>,
    cfg: axum::extract::Extension<crate::config::Config>,
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
    let auth_header = req
        .headers()
        .get(AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .ok_or(AppError::Unauthorized)?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or(AppError::Unauthorized)?;

    let customer = if token.starts_with("hr_live_") {
        // API key authentication — lookup by prefix, then verify full key against Argon2 hash
        let prefix = &token[..15.min(token.len())];
        let customer = sqlx::query_as::<_, Customer>(
            "SELECT * FROM customers WHERE api_key_prefix = $1",
        )
        .bind(prefix)
        .fetch_optional(&*pool)
        .await?
        .ok_or(AppError::Unauthorized)?;

        if !verify_api_key(token, &customer.api_key_hash) {
            return Err(AppError::Unauthorized);
        }
        customer
    } else {
        // JWT token authentication
        let claims = crate::auth::jwt::verify_token(token, &cfg.jwt_secret)?;
        sqlx::query_as::<_, Customer>(
            "SELECT * FROM customers WHERE id = $1",
        )
        .bind(claims.sub)
        .fetch_optional(&*pool)
        .await?
        .ok_or(AppError::Unauthorized)?
    };

    req.extensions_mut().insert(customer);
    Ok(next.run(req).await)
}

/// JWT-based auth middleware for dashboard routes
pub async fn jwt_auth_middleware(
    pool: axum::extract::Extension<PgPool>,
    cfg: axum::extract::Extension<crate::config::Config>,
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
    let auth_header = req
        .headers()
        .get(AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .ok_or(AppError::Unauthorized)?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or(AppError::Unauthorized)?;

    let claims = crate::auth::jwt::verify_token(token, &cfg.jwt_secret)?;

    let customer = sqlx::query_as::<_, Customer>(
        "SELECT * FROM customers WHERE id = $1",
    )
    .bind(claims.sub)
    .fetch_optional(&*pool)
    .await?
    .ok_or(AppError::Unauthorized)?;

    req.extensions_mut().insert(customer);
    Ok(next.run(req).await)
}

/// Admin-only middleware — must be layered AFTER auth_middleware.
/// Checks that the authenticated customer has `is_admin: true`.
pub async fn admin_middleware(
    req: Request,
    next: Next,
) -> Result<Response, AppError> {
    let customer = req
        .extensions()
        .get::<Customer>()
        .ok_or(AppError::Unauthorized)?;

    if !customer.is_admin {
        return Err(AppError::Forbidden("Admin access required".into()));
    }

    Ok(next.run(req).await)
}

/// Hash an API key using Argon2id with a random salt.
/// The salt is embedded in the returned hash string (PHC format).
pub fn hash_api_key(key: &str) -> String {
    use argon2::password_hash::SaltString;
    use argon2::{Argon2, PasswordHasher};
    use rand::rngs::OsRng;
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    argon2
        .hash_password(key.as_bytes(), &salt)
        .expect("Argon2 hashing failed")
        .to_string()
}

/// Verify an API key against a stored Argon2id hash.
pub fn verify_api_key(key: &str, hash: &str) -> bool {
    use argon2::password_hash::PasswordHash;
    use argon2::{Argon2, PasswordVerifier};
    let parsed_hash = match PasswordHash::new(hash) {
        Ok(h) => h,
        Err(_) => return false,
    };
    Argon2::default()
        .verify_password(key.as_bytes(), &parsed_hash)
        .is_ok()
}

pub fn generate_api_key() -> String {
    use uuid::Uuid;
    format!("hr_live_{}", Uuid::new_v4().to_string().replace('-', ""))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_api_key_generation() {
        let key = generate_api_key();
        assert!(key.starts_with("hr_live_"));
    }

    #[test]
    fn test_api_key_hashing_and_verification() {
        let key = "hr_live_test123";
        let hash = hash_api_key(key);
        assert!(verify_api_key(key, &hash));
        assert!(!verify_api_key("hr_live_wrong", &hash));
    }
}
