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
    name: Option<String>,
    plan: String,
    webhook_limit: i64,
    webhook_count: i64,
    created_at: String,
}

async fn get_profile(Extension(customer): Extension<Customer>) -> Json<ProfileResponse> {
    Json(ProfileResponse {
        id: customer.id,
        email: customer.email.clone(),
        name: customer.name.clone(),
        plan: customer.plan.clone(),
        webhook_limit: customer.webhook_limit,
        webhook_count: customer.webhook_count,
        created_at: customer.created_at.to_rfc3339(),
    })
}

/// Profil güncelleme
#[derive(serde::Deserialize)]
#[serde(deny_unknown_fields)]
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
        name: customer.name,
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
    #[serde(rename = "api_key_prefix")]
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
    let api_key_prefix = api_key[..24].to_string();

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
    let new_prefix = new_key[..24].to_string();

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
    webhooks_used: i64,
    webhook_limit: i64,
    endpoints_count: i64,
    success_rate: f64,
    plan: String,
    api_calls_today: i64,
    total_deliveries: i64,
    delivered: i64,
    failed: i64,
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

    let failed_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = 'failed' AND created_at > now() - interval '24 hours'"
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    let total_deliveries: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1"
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    let total = webhook_count.0.max(1);
    let success_rate = (success_count.0 as f64 / total as f64) * 100.0;

    Ok(Json(UsageResponse {
        webhooks_used: webhook_count.0,
        webhook_limit: customer.webhook_limit,
        endpoints_count: endpoint_count.0,
        success_rate,
        plan: customer.plan,
        api_calls_today: webhook_count.0,
        total_deliveries: total_deliveries.0,
        delivered: success_count.0,
        failed: failed_count.0,
    }))
}

/// Plan bilgisi
async fn get_plan(Extension(customer): Extension<Customer>) -> Json<serde_json::Value> {
    let plan = crate::billing::Plan::parse_str(&customer.plan);
    Json(serde_json::json!({
        "plan": customer.plan,
        "max_webhooks_per_day": plan.max_webhooks_per_day(),
        "max_endpoints": plan.max_endpoints(),
        "max_requests_per_minute": plan.max_requests_per_minute(),
        "retention_days": plan.retention_days(),
        "monthly_price_cents": plan.monthly_price_cents(),
    }))
}

/// Bildirim tercihleri
async fn get_notifications(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    let prefs = sqlx::query_as::<_, (bool, bool, bool, bool, Option<String>, Option<String>, Option<String>)>(
        "SELECT email_on_failure, email_on_dead_letter, email_on_success, COALESCE(email_on_weekly_digest, false), slack_webhook_url, discord_webhook_url, webhook_url FROM notification_preferences WHERE customer_id = $1"
    )
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?;

    match prefs {
        Some((
            email_on_failure,
            email_on_dead_letter,
            email_on_success,
            email_on_weekly_digest,
            slack,
            discord,
            webhook,
        )) => Ok(Json(serde_json::json!({
            "email_on_failure": email_on_failure,
            "email_on_dead_letter": email_on_dead_letter,
            "email_on_success": email_on_success,
            "email_on_weekly_digest": email_on_weekly_digest,
            "slack_webhook_url": slack,
            "discord_webhook_url": discord,
            "webhook_url": webhook,
        }))),
        None => {
            // Return defaults if no preferences saved yet
            Ok(Json(serde_json::json!({
                "email_on_failure": true,
                "email_on_dead_letter": true,
                "email_on_success": false,
                "email_on_weekly_digest": false,
                "slack_webhook_url": null,
                "discord_webhook_url": null,
                "webhook_url": null,
            })))
        }
    }
}

/// Bildirim tercihlerini güncelle
async fn update_notifications(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    let email_on_failure = req
        .get("email_on_failure")
        .and_then(|v| v.as_bool())
        .unwrap_or(true);
    let email_on_dead_letter = req
        .get("email_on_dead_letter")
        .and_then(|v| v.as_bool())
        .unwrap_or(true);
    let email_on_success = req
        .get("email_on_success")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);
    let email_on_weekly_digest = req
        .get("email_on_weekly_digest")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);
    let slack_webhook_url = req
        .get("slack_webhook_url")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());
    let discord_webhook_url = req
        .get("discord_webhook_url")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());
    let webhook_url = req
        .get("webhook_url")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    // SSRF validation — block private/internal IPs on notification webhook URLs
    for (name, url) in [
        ("slack_webhook_url", &slack_webhook_url),
        ("discord_webhook_url", &discord_webhook_url),
        ("webhook_url", &webhook_url),
    ] {
        if let Some(u) = url {
            if !u.is_empty() {
                if let Err(e) = crate::ssrf::validate_url(u) {
                    tracing::warn!("SSRF blocked notification URL {}: {}", name, e);
                    return Err(AppError::BadRequest("Invalid notification URL".into()));
                }
            }
        }
    }

    sqlx::query(
        r#"INSERT INTO notification_preferences (customer_id, email_on_failure, email_on_dead_letter, email_on_success, email_on_weekly_digest, slack_webhook_url, discord_webhook_url, webhook_url, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
           ON CONFLICT (customer_id) DO UPDATE SET
               email_on_failure = EXCLUDED.email_on_failure,
               email_on_dead_letter = EXCLUDED.email_on_dead_letter,
               email_on_success = EXCLUDED.email_on_success,
               email_on_weekly_digest = EXCLUDED.email_on_weekly_digest,
               slack_webhook_url = EXCLUDED.slack_webhook_url,
               discord_webhook_url = EXCLUDED.discord_webhook_url,
               webhook_url = EXCLUDED.webhook_url,
               updated_at = now()"#
    )
    .bind(customer.id)
    .bind(email_on_failure)
    .bind(email_on_dead_letter)
    .bind(email_on_success)
    .bind(email_on_weekly_digest)
    .bind(&slack_webhook_url)
    .bind(&discord_webhook_url)
    .bind(&webhook_url)
    .execute(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "updated": true,
        "preferences": {
            "email_on_failure": email_on_failure,
            "email_on_dead_letter": email_on_dead_letter,
            "email_on_success": email_on_success,
            "slack_webhook_url": slack_webhook_url,
            "discord_webhook_url": discord_webhook_url,
            "webhook_url": webhook_url,
        }
    })))
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── ProfileResponse ─────────────────────────────────────

    #[test]
    fn test_profile_response_serialization() {
        let resp = ProfileResponse {
            id: Uuid::new_v4(),
            email: "user@test.com".to_string(),
            name: Some("Servet".to_string()),
            plan: "pro".to_string(),
            webhook_limit: 50_000,
            webhook_count: 100,
            created_at: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["email"], "user@test.com");
        assert_eq!(json["plan"], "pro");
        assert_eq!(json["webhook_limit"], 50_000);
        assert_eq!(json["webhook_count"], 100);
    }

    // ── UpdateProfileRequest ────────────────────────────────

    #[test]
    fn test_update_profile_request_with_email() {
        let json = r#"{"email":"new@test.com"}"#;
        let req: UpdateProfileRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.email, Some("new@test.com".to_string()));
    }

    #[test]
    fn test_update_profile_request_empty() {
        let json = r#"{}"#;
        let req: UpdateProfileRequest = serde_json::from_str(json).unwrap();
        assert!(req.email.is_none());
    }

    // ── ApiKeyInfo ──────────────────────────────────────────

    #[test]
    fn test_api_key_info_serialization() {
        let info = ApiKeyInfo {
            id: "key_123".to_string(),
            prefix: "hr_live_abc...".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            last_used_at: Some("2024-06-01T12:00:00Z".to_string()),
        };
        let json = serde_json::to_value(&info).unwrap();
        assert_eq!(json["prefix"], "hr_live_abc...");
        assert_eq!(json["last_used_at"], "2024-06-01T12:00:00Z");
    }

    #[test]
    fn test_api_key_info_no_last_used() {
        let info = ApiKeyInfo {
            id: "key_456".to_string(),
            prefix: "hr_live_xyz...".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            last_used_at: None,
        };
        let json = serde_json::to_value(&info).unwrap();
        assert!(json["last_used_at"].is_null());
    }

    // ── UsageResponse ───────────────────────────────────────

    #[test]
    fn test_portal_usage_response_serialization() {
        let resp = UsageResponse {
            webhooks_used: 42,
            webhook_limit: 1000,
            endpoints_count: 5,
            success_rate: 99.5,
            plan: "pro".to_string(),
            api_calls_today: 42,
            total_deliveries: 500,
            delivered: 498,
            failed: 2,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["webhooks_used"], 42);
        assert_eq!(json["webhook_limit"], 1000);
        assert_eq!(json["success_rate"], 99.5);
        assert_eq!(json["plan"], "pro");
        assert_eq!(json["api_calls_today"], 42);
        assert_eq!(json["total_deliveries"], 500);
        assert_eq!(json["delivered"], 498);
        assert_eq!(json["failed"], 2);
    }

    // ── Router construction ─────────────────────────────────

    #[test]
    fn test_customer_portal_router_construction() {
        let _router = router();
    }
}
