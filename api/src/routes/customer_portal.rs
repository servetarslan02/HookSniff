//! Customer Self-Service Portal API
//!
//! Müşterilerin kendi webhook'larını, endpoint'lerini ve
//! teslimatlarını yönetmesini sağlar.
//!
//! Svix, Hookdeck ve Hook0'un hepsinde var — bizde yok.
//! Bu eksiklik yüzünden her müşteri desteği elle yapmak zorundayız.

use axum::{
    extract::{Extension, Path},
    routing::{delete, get, post, put},
    Json, Router,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        // Customer profile
        .route("/me", get(get_profile))
        .route("/me", put(update_profile))
        // API keys
        .route("/api-keys", get(list_api_keys))
        .route("/api-keys", post(create_api_key))
        .route("/api-keys/{key_id}", delete(revoke_api_key))
        // Usage & limits
        .route("/usage", get(get_usage))
        .route("/plan", get(get_plan))
        // Notification preferences
        .route("/notifications", get(get_notifications))
        .route("/notifications", put(update_notifications))
}

/// Müşteri profil bilgileri
#[derive(serde::Serialize)]
struct ProfileResponse {
    id: Uuid,
    email: String,
    plan: String,
    webhook_limit: i32,
    webhook_count: i32,
    created_at: String,
}

async fn get_profile(Extension(customer): Extension<Customer>) -> Json<ProfileResponse> {
    Json(ProfileResponse {
        id: customer.id,
        email: customer.email.clone(),
        plan: customer.plan.clone(),
        webhook_limit: customer.webhook_limit,
        webhook_count: customer.webhook_count,
        created_at: customer.created_at.to_rfc3339(),
    })
}

/// Profil güncelleme
#[derive(serde::Deserialize)]
struct UpdateProfileRequest {
    email: Option<String>,
}

async fn update_profile(
    Extension(pool): Extension<PgPool>,
    Extension(mut customer): Extension<Customer>,
    Json(req): Json<UpdateProfileRequest>,
) -> Result<Json<ProfileResponse>, AppError> {
    if let Some(email) = &req.email {
        if !email.contains('@') {
            return Err(AppError::BadRequest("Invalid email".into()));
        }
        sqlx::query("UPDATE customers SET email = $1 WHERE id = $2")
            .bind(email)
            .bind(customer.id)
            .execute(&pool)
            .await?;
        customer.email = email.clone();
    }

    Ok(Json(ProfileResponse {
        id: customer.id,
        email: customer.email,
        plan: customer.plan,
        webhook_limit: customer.webhook_limit,
        webhook_count: customer.webhook_count,
        created_at: customer.created_at.to_rfc3339(),
    }))
}

/// API key listesi
#[derive(serde::Serialize)]
struct ApiKeyInfo {
    id: String,
    prefix: String,
    created_at: String,
    last_used_at: Option<String>,
}

async fn list_api_keys(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Json<Vec<ApiKeyInfo>> {
    // API key'leri göster (sadece prefix, tam key gösterilmez)
    let keys = sqlx::query_as::<_, (String, String, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, api_key_prefix, created_at FROM customers WHERE id = $1",
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await;

    match keys {
        Ok((id, prefix, created_at)) => Json(vec![ApiKeyInfo {
            id: id.to_string(),
            prefix: format!("{}...", &prefix),
            created_at: created_at.to_rfc3339(),
            last_used_at: None,
        }]),
        Err(_) => Json(vec![]),
    }
}

/// Yeni API key oluştur
async fn create_api_key(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    let api_key = crate::middleware::generate_api_key();
    let api_key_hash = crate::middleware::hash_api_key(&api_key);
    let api_key_prefix = api_key[..15].to_string();

    sqlx::query("UPDATE customers SET api_key_hash = $1, api_key_prefix = $2 WHERE id = $3")
        .bind(&api_key_hash)
        .bind(&api_key_prefix)
        .bind(customer.id)
        .execute(&pool)
        .await?;

    Ok(Json(serde_json::json!({
        "api_key": api_key,
        "prefix": api_key_prefix,
        "message": "Save this key securely — it won't be shown again"
    })))
}

/// API key iptal et
async fn revoke_api_key(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(_key_id): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Yeni bir key oluştur (eskiyi geçersiz kılar)
    let new_key = crate::middleware::generate_api_key();
    let new_hash = crate::middleware::hash_api_key(&new_key);
    let new_prefix = new_key[..15].to_string();

    sqlx::query("UPDATE customers SET api_key_hash = $1, api_key_prefix = $2 WHERE id = $3")
        .bind(&new_hash)
        .bind(&new_prefix)
        .bind(customer.id)
        .execute(&pool)
        .await?;

    Ok(Json(serde_json::json!({
        "revoked": true,
        "new_api_key": new_key,
        "message": "Old key revoked. Save the new key securely."
    })))
}

/// Kullanım istatistikleri
#[derive(serde::Serialize)]
struct UsageResponse {
    webhooks_today: i64,
    webhook_limit: i32,
    endpoints_count: i64,
    success_rate: f64,
    plan: String,
}

async fn get_usage(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<UsageResponse>, AppError> {
    let webhook_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND created_at > now() - interval '24 hours'"
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    let endpoint_count: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM endpoints WHERE customer_id = $1")
            .bind(customer.id)
            .fetch_one(&pool)
            .await?;

    let success_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = 'delivered' AND created_at > now() - interval '24 hours'"
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    let total = webhook_count.0.max(1);
    let success_rate = (success_count.0 as f64 / total as f64) * 100.0;

    Ok(Json(UsageResponse {
        webhooks_today: webhook_count.0,
        webhook_limit: customer.webhook_limit,
        endpoints_count: endpoint_count.0,
        success_rate,
        plan: customer.plan,
    }))
}

/// Plan bilgisi
async fn get_plan(Extension(customer): Extension<Customer>) -> Json<serde_json::Value> {
    let plan = crate::billing::Plan::parse_str(&customer.plan);
    Json(serde_json::json!({
        "plan": customer.plan,
        "max_webhooks_per_month": plan.max_webhooks_per_month(),
        "max_endpoints": plan.max_endpoints(),
        "max_requests_per_minute": plan.max_requests_per_minute(),
        "retention_days": plan.retention_days(),
        "monthly_price_cents": plan.monthly_price_cents(),
    }))
}

/// Bildirim tercihleri
async fn get_notifications(Extension(customer): Extension<Customer>) -> Json<serde_json::Value> {
    // TODO: Bildirim tercihlerini veritabanından al
    Json(serde_json::json!({
        "email_on_failure": true,
        "email_on_dead_letter": true,
        "slack_webhook_url": null,
    }))
}

/// Bildirim tercihlerini güncelle
async fn update_notifications(
    Extension(_customer): Extension<Customer>,
    Json(req): Json<serde_json::Value>,
) -> Json<serde_json::Value> {
    // TODO: Bildirim tercihlerini veritabanına kaydet
    Json(serde_json::json!({
        "updated": true,
        "preferences": req,
    }))
}
