use axum::{
    extract::Request,
    http::header::AUTHORIZATION,
    middleware::Next,
    response::Response,
};
use sqlx::PgPool;

use crate::error::AppError;
use crate::models::customer::Customer;

pub async fn auth_middleware(
    pool: axum::extract::Extension<PgPool>,
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
    let auth_header = req
        .headers()
        .get(AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .ok_or(AppError::Unauthorized)?;

    let api_key = auth_header
        .strip_prefix("Bearer ")
        .ok_or(AppError::Unauthorized)?;

    if !api_key.starts_with("hr_live_") {
        return Err(AppError::Unauthorized);
    }

    let key_hash = hash_api_key(api_key);

    let customer = sqlx::query_as::<_, Customer>(
        "SELECT * FROM customers WHERE api_key_hash = $1"
    )
    .bind(&key_hash)
    .fetch_optional(&*pool)
    .await?
    .ok_or(AppError::Unauthorized)?;

    req.extensions_mut().insert(customer);
    Ok(next.run(req).await)
}

pub fn hash_api_key(key: &str) -> String {
    use sha2::{Sha256, Digest};
    let mut hasher = Sha256::new();
    hasher.update(key.as_bytes());
    format!("{:x}", hasher.finalize())
}

pub fn generate_api_key() -> String {
    use uuid::Uuid;
    format!("hr_live_{}", Uuid::new_v4().to_string().replace('-', ""))
}
