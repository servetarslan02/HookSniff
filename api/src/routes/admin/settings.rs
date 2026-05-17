//! Platform settings, deploy info, SDK update notifications, public plans.

use axum::extract::Extension;
use axum::Json;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

use super::{require_admin, require_admin_write};

// ── Platform Settings ─────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(deny_unknown_fields)]
pub struct PlatformSettings {
    pub default_plan: String,
    pub max_endpoints_free: i32,
    pub max_endpoints_startup: i32,
    pub max_endpoints_pro: i32,
    pub max_endpoints_enterprise: i32,
    pub max_webhooks_free: i32,
    pub max_webhooks_startup: i32,
    pub max_webhooks_pro: i32,
    pub max_webhooks_enterprise: i32,
    pub rate_limit_free: i32,
    pub rate_limit_startup: i32,
    pub rate_limit_pro: i32,
    pub rate_limit_enterprise: i32,
    pub retention_days_free: i32,
    pub retention_days_startup: i32,
    pub retention_days_pro: i32,
    pub retention_days_enterprise: i32,
    pub retry_max_attempts: i32,
    pub maintenance_mode: bool,
    pub signup_enabled: bool,
    #[serde(default = "default_price_startup")]
    pub plan_price_startup: f64,
    #[serde(default = "default_price_pro")]
    pub plan_price_pro: f64,
    #[serde(default = "default_price_enterprise")]
    pub plan_price_enterprise: f64,
    #[serde(default = "default_price_enterprise")]
    pub plan_price_business: f64,
    #[serde(default)]
    pub resend_api_key: Option<String>,
    #[serde(default)]
    pub email_sender: Option<String>,
    #[serde(default)]
    pub webhook_secret: Option<String>,
    #[serde(default = "default_backup_retention")]
    pub backup_retention_days: i32,
    #[serde(default = "default_global_rate_limit")]
    pub global_rate_limit: i32,
    #[serde(default)]
    pub cors_origins: Option<String>,
}

fn default_price_startup() -> f64 { 14.0 }
fn default_price_pro() -> f64 { 29.0 }
fn default_price_enterprise() -> f64 { 99.0 }
fn default_backup_retention() -> i32 { 30 }
fn default_global_rate_limit() -> i32 { 1000 }

impl Default for PlatformSettings {
    fn default() -> Self {
        Self {
            default_plan: "developer".into(),
            max_endpoints_free: 5,
            max_endpoints_startup: 20,
            max_endpoints_pro: 50,
            max_endpoints_enterprise: 200,
            max_webhooks_free: 1000,
            max_webhooks_startup: 10000,
            max_webhooks_pro: 50000,
            max_webhooks_enterprise: 500000,
            rate_limit_free: 100,
            rate_limit_startup: 500,
            rate_limit_pro: 1000,
            rate_limit_enterprise: 5000,
            retention_days_free: 7,
            retention_days_startup: 14,
            retention_days_pro: 180,
            retention_days_enterprise: 365,
            retry_max_attempts: 3,
            maintenance_mode: false,
            signup_enabled: true,
            plan_price_startup: 14.0,
            plan_price_pro: 29.0,
            plan_price_enterprise: 99.0,
            plan_price_business: 99.0,
            resend_api_key: None,
            email_sender: None,
            webhook_secret: None,
            backup_retention_days: 30,
            global_rate_limit: 1000,
            cors_origins: None,
        }
    }
}

/// Fetch platform settings from DB, falling back to defaults.
pub async fn fetch_platform_settings(pool: &sqlx::PgPool) -> PlatformSettings {
    let row: Option<(serde_json::Value,)> =
        sqlx::query_as("SELECT value FROM platform_settings WHERE key = 'main'")
            .fetch_optional(pool)
            .await
            .ok()
            .flatten();

    if let Some((value,)) = row {
        if let Ok(settings) = serde_json::from_value::<PlatformSettings>(value) {
            return settings;
        }
    }
    PlatformSettings::default()
}

// ── Public Plans (no auth) ────────────────────────────────

#[derive(Debug, Serialize)]
pub struct PublicPlanInfo {
    pub plans: Vec<PublicPlan>,
}

#[derive(Debug, Serialize)]
pub struct PublicPlan {
    pub id: String,
    pub name: String,
    pub price_monthly: f64,
    pub price_yearly: f64,
    pub max_endpoints: i32,
    pub max_webhooks: i32,
    pub rate_limit: i32,
    pub retention_days: i32,
    pub popular: bool,
}

/// GET /v1/plans — Public plan pricing (no auth).
pub async fn public_plans(Extension(pool): Extension<PgPool>) -> Json<PublicPlanInfo> {
    let settings = fetch_platform_settings(&pool).await;
    let plans = vec![
        PublicPlan {
            id: "developer".into(),
            name: "Developer".into(),
            price_monthly: 0.0,
            price_yearly: 0.0,
            max_endpoints: settings.max_endpoints_free,
            max_webhooks: settings.max_webhooks_free,
            rate_limit: settings.rate_limit_free,
            retention_days: settings.retention_days_free,
            popular: false,
        },
        PublicPlan {
            id: "startup".into(),
            name: "Startup".into(),
            price_monthly: settings.plan_price_startup,
            price_yearly: (settings.plan_price_startup * 12.0 * 0.8).round(),
            max_endpoints: settings.max_endpoints_startup,
            max_webhooks: settings.max_webhooks_startup,
            rate_limit: settings.rate_limit_startup,
            retention_days: settings.retention_days_startup,
            popular: false,
        },
        PublicPlan {
            id: "pro".into(),
            name: "Pro".into(),
            price_monthly: settings.plan_price_pro,
            price_yearly: (settings.plan_price_pro * 12.0 * 0.8).round(),
            max_endpoints: settings.max_endpoints_pro,
            max_webhooks: settings.max_webhooks_pro,
            rate_limit: settings.rate_limit_pro,
            retention_days: settings.retention_days_pro,
            popular: true,
        },
        PublicPlan {
            id: "enterprise".into(),
            name: "Enterprise".into(),
            price_monthly: settings.plan_price_enterprise,
            price_yearly: (settings.plan_price_enterprise * 12.0 * 0.8).round(),
            max_endpoints: settings.max_endpoints_enterprise,
            max_webhooks: settings.max_webhooks_enterprise,
            rate_limit: settings.rate_limit_enterprise,
            retention_days: settings.retention_days_enterprise,
            popular: false,
        },
    ];
    Json(PublicPlanInfo { plans })
}

// ── Admin Settings ────────────────────────────────────────

/// GET /v1/admin/settings — Get platform settings.
pub async fn get_settings(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<PlatformSettings>, AppError> {
    require_admin(&customer)?;

    let row: Option<(serde_json::Value,)> =
        sqlx::query_as("SELECT value FROM platform_settings WHERE key = 'main'")
            .fetch_optional(&pool)
            .await?;

    if let Some((value,)) = row {
        if let Ok(mut settings) = serde_json::from_value::<PlatformSettings>(value) {
            settings.resend_api_key = settings.resend_api_key.map(|_| "***".to_string());
            settings.webhook_secret = settings.webhook_secret.map(|_| "***".to_string());
            return Ok(Json(settings));
        }
    }

    Ok(Json(PlatformSettings::default()))
}

/// PUT /v1/admin/settings — Update platform settings.
pub async fn update_settings(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(settings): Json<PlatformSettings>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    if settings.max_endpoints_free < 1 || settings.max_endpoints_startup < 1 || settings.max_endpoints_pro < 1 || settings.max_endpoints_enterprise < 1 {
        return Err(AppError::BadRequest("max_endpoints must be at least 1".into()));
    }
    if settings.max_webhooks_free < 0 || settings.max_webhooks_startup < 0 || settings.max_webhooks_pro < 0 || settings.max_webhooks_enterprise < 0 {
        return Err(AppError::BadRequest("max_webhooks cannot be negative".into()));
    }
    if settings.rate_limit_free < 1 || settings.rate_limit_startup < 1 || settings.rate_limit_pro < 1 || settings.rate_limit_enterprise < 1 {
        return Err(AppError::BadRequest("rate_limit must be at least 1".into()));
    }
    if settings.retention_days_free < 1 || settings.retention_days_startup < 1 || settings.retention_days_pro < 1 || settings.retention_days_enterprise < 1 {
        return Err(AppError::BadRequest("retention_days must be at least 1".into()));
    }
    if settings.retry_max_attempts < 0 || settings.retry_max_attempts > 10 {
        return Err(AppError::BadRequest("retry_max_attempts must be 0-10".into()));
    }
    if settings.plan_price_startup < 0.0 || settings.plan_price_pro < 0.0 || settings.plan_price_enterprise < 0.0 {
        return Err(AppError::BadRequest("plan prices cannot be negative".into()));
    }

    let mut saved_settings = settings;
    let current: Option<(serde_json::Value,)> =
        sqlx::query_as("SELECT value FROM platform_settings WHERE key = 'main'")
            .fetch_optional(&pool)
            .await?;
    if let Some((value,)) = current {
        if let Ok(current_settings) = serde_json::from_value::<PlatformSettings>(value) {
            if saved_settings.resend_api_key.as_deref() == Some("***") {
                saved_settings.resend_api_key = current_settings.resend_api_key;
            }
            if saved_settings.webhook_secret.as_deref() == Some("***") {
                saved_settings.webhook_secret = current_settings.webhook_secret;
            }
        }
    }

    let value = serde_json::to_value(&saved_settings)
        .map_err(|e| AppError::BadRequest(format!("Invalid settings: {}", e)))?;

    sqlx::query(
        r#"INSERT INTO platform_settings (key, value, updated_at)
           VALUES ('main', $1, NOW())
           ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()"#,
    )
    .bind(value)
    .execute(&pool)
    .await?;

    tracing::info!("✅ Admin updated platform settings");

    let startup_price = saved_settings.plan_price_startup;
    let pro_price = saved_settings.plan_price_pro;
    let enterprise_price = saved_settings.plan_price_enterprise;
    tokio::spawn(async move {
        match crate::billing::polar::PolarConfig::from_env() {
            Some(config) => {
                let provider = crate::billing::polar::PolarProvider::new(config);
                let results = provider.sync_prices_to_polar(startup_price, pro_price, enterprise_price).await;
                for (plan, result) in &results {
                    match result {
                        Ok(()) => tracing::info!("Polar sync: {} price updated", plan),
                        Err(e) => tracing::warn!("Polar sync: {} failed — {}", plan, e),
                    }
                }
            }
            None => tracing::debug!("Polar not configured, skipping price sync"),
        }
    });

    Ok(Json(serde_json::json!({
        "message": "Settings updated",
    })))
}

// ── Deploy Info ───────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct DeployInfo {
    pub version: String,
    pub git_commit: Option<String>,
    pub build_time: Option<String>,
    pub environment: String,
}

/// GET /v1/admin/deploy-info — Returns current deployment version and metadata.
pub async fn deploy_info(
    Extension(customer): Extension<Customer>,
) -> Result<Json<DeployInfo>, AppError> {
    require_admin(&customer)?;

    Ok(Json(DeployInfo {
        version: env!("CARGO_PKG_VERSION").to_string(),
        git_commit: std::env::var("GIT_SHA").ok().or_else(|| {
            std::env::var("VERCEL_GIT_COMMIT_SHA")
                .ok()
                .or_else(|| std::env::var("CLOUD_BUILD_COMMIT").ok())
        }),
        build_time: std::env::var("BUILD_TIME").ok(),
        environment: std::env::var("ENVIRONMENT")
            .unwrap_or_else(|_| "production".to_string()),
    }))
}

// ── SDK Update Notifications ──────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SdkUpdateRequest {
    pub updates: Vec<SdkUpdateItem>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SdkUpdateItem {
    pub sdk: String,
    pub local_version: String,
    pub published_version: String,
}

/// POST /v1/admin/sdk-update — Create SDK update notifications for all users.
pub async fn notify_sdk_update(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<SdkUpdateRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    if req.updates.is_empty() {
        return Ok(Json(
            serde_json::json!({ "message": "No updates to notify" }),
        ));
    }

    let title = format!("🚀 {} SDK güncellemesi mevcut", req.updates.len());
    let details: Vec<String> = req
        .updates
        .iter()
        .map(|u| format!("• {} {} → {}", u.sdk, u.local_version, u.published_version))
        .collect();
    let message = format!(
        "Aşağıdaki SDK'lar için yeni versiyon yayınlandı:\n{}\n\nDetaylar için bildirime tıklayın.",
        details.join("\n")
    );

    let users: Vec<(Uuid,)> =
        sqlx::query_as("SELECT id FROM customers WHERE is_active = TRUE")
            .fetch_all(&pool)
            .await?;

    let sdk_list: Vec<String> = req.updates.iter().map(|u| format!("{}:{}", u.sdk, u.published_version)).collect();
    let link = format!("/settings?sdk_updates={}", sdk_list.join(","));

    let mut count = 0;
    for (user_id,) in &users {
        sqlx::query(
            r#"INSERT INTO notifications (customer_id, type, title, message, is_read, link)
               VALUES ($1, 'system', $2, $3, FALSE, $4)"#,
        )
        .bind(user_id)
        .bind(&title)
        .bind(&message)
        .bind(&link)
        .execute(&pool)
        .await?;
        count += 1;
    }

    tracing::info!("📢 SDK update notification sent to {} users", count);

    Ok(Json(serde_json::json!({
        "message": format!("Notification sent to {} user(s)", count),
        "title": title,
        "updates_count": req.updates.len(),
    })))
}

// ── Tests ──────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sdk_update_request_deserialization() {
        let json = r#"{
            "updates": [
                {"sdk": "python", "local_version": "1.0.0", "published_version": "1.1.0"},
                {"sdk": "node", "local_version": "2.0.0", "published_version": "2.1.0"}
            ]
        }"#;
        let req: SdkUpdateRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.updates.len(), 2);
        assert_eq!(req.updates[0].sdk, "python");
    }

    #[test]
    fn test_sdk_update_item_deserialization() {
        let json = r#"{"sdk":"rust","local_version":"0.1.0","published_version":"0.2.0"}"#;
        let item: SdkUpdateItem = serde_json::from_str(json).unwrap();
        assert_eq!(item.sdk, "rust");
    }

    #[test]
    fn test_sdk_update_request_empty() {
        let json = r#"{"updates":[]}"#;
        let req: SdkUpdateRequest = serde_json::from_str(json).unwrap();
        assert!(req.updates.is_empty());
    }

    #[test]
    fn test_deploy_info_serialization() {
        let info = DeployInfo {
            version: "0.1.0".to_string(),
            git_commit: Some("abc123".to_string()),
            build_time: Some("2024-01-01".to_string()),
            environment: "production".to_string(),
        };
        let json = serde_json::to_value(&info).unwrap();
        assert_eq!(json["version"], "0.1.0");
        assert_eq!(json["environment"], "production");
    }
}
