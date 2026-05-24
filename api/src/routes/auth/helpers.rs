//! Helper functions for auth routes.

use chrono::{Duration, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::jwt;
use crate::config::Config;
use crate::error::AppError;

use super::send_email_with_fallback;

/// Create a refresh token for a customer.
pub async fn create_refresh_token(pool: &PgPool, customer_id: Uuid) -> Result<String, AppError> {
    let token = jwt::generate_random_token();
    let token_hash = jwt::hash_token(&token);
    let expires_at = Utc::now() + Duration::days(30);
    sqlx::query("INSERT INTO refresh_tokens (customer_id, token_hash, expires_at) VALUES ($1, $2, $3)")
        .bind(customer_id)
        .bind(&token_hash)
        .bind(expires_at)
        .execute(pool)
        .await?;
    Ok(token)
}

/// Send a verification email to a customer.
pub async fn send_verification_email_for_customer(
    pool: &PgPool,
    cfg: &Config,
    email_provider: &crate::email::EmailProvider,
    job_queue: Option<&crate::jobs::job_queue::JobQueue>,
    customer_id: Uuid,
    email: &str,
    lang: crate::email::Language,
) {
    let token = jwt::generate_random_token();
    let token_hash = jwt::hash_token(&token);
    let expires_at = Utc::now() + Duration::hours(24);

    if let Err(e) = sqlx::query(
        "INSERT INTO email_verification_tokens (customer_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    )
    .bind(customer_id)
    .bind(&token_hash)
    .bind(expires_at)
    .execute(pool)
    .await
    {
        tracing::warn!("Failed to store verification token for {}: {:?}", email, e);
        return;
    }

    let verify_url = format!("{}/verify-email?token={}", cfg.email_base_url, token);
    let verify_url_clone = verify_url.clone();
    send_email_with_fallback(
        job_queue,
        email_provider,
        email,
        crate::jobs::job_queue::EmailTemplate::Verification { verify_url },
        lang,
        move |ep, to, lang| {
            tokio::spawn(async move {
                if let Err(e) = ep.send_verification_email(&to, &verify_url_clone, lang).await {
                    tracing::warn!("Failed to send verification email to {}: {:?}", to, e);
                }
            });
        },
    )
    .await;
}

/// Generate a 6-digit email change verification code.
pub fn generate_email_change_code() -> String {
    use rand::RngExt;
    let mut rng = rand::rng();
    let code: u32 = rng.random_range(100_000u32..999_999u32);
    code.to_string()
}
