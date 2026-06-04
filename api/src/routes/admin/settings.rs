//! Platform settings, deploy info, SDK update notifications, public plans.

use axum::extract::Extension;
use axum::Json;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::error::ErrorCode;
use crate::models::customer::Customer;

use super::{require_admin, require_admin_write};

// ── Platform Settings ─────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(default)]
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
            max_endpoints_free: i32::MAX,
            max_endpoints_startup: i32::MAX,
            max_endpoints_pro: i32::MAX,
            max_endpoints_enterprise: i32::MAX,
            max_webhooks_free: 1000,
            max_webhooks_startup: 30000,
            max_webhooks_pro: 100000,
            max_webhooks_enterprise: i32::MAX,
            rate_limit_free: 100,
            rate_limit_startup: 1000,
            rate_limit_pro: 10000,
            rate_limit_enterprise: i32::MAX,
            retention_days_free: 7,
            retention_days_startup: 14,
            retention_days_pro: 180,
            retention_days_enterprise: 365,
            retry_max_attempts: 3,
            maintenance_mode: false,
            signup_enabled: true,
            plan_price_startup: 24.0,
            plan_price_pro: 49.0,
            plan_price_enterprise: 149.0,
            plan_price_business: 149.0,
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

/// PUT /v1/admin/settings — Update platform settings (partial update supported).
pub async fn update_settings(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(incoming): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    // Load current settings
    let current: Option<(serde_json::Value,)> =
        sqlx::query_as("SELECT value FROM platform_settings WHERE key = 'main'")
            .fetch_optional(&pool)
            .await?;

    let mut settings: PlatformSettings = if let Some((value,)) = current {
        serde_json::from_value(value).unwrap_or_default()
    } else {
        PlatformSettings::default()
    };

    // Merge incoming fields into current settings
    if let Some(obj) = incoming.as_object() {
        for (key, value) in obj {
            match key.as_str() {
                "default_plan" => { if let Some(v) = value.as_str() { settings.default_plan = v.to_string(); } }
                "max_endpoints_free" => { if let Some(v) = value.as_i64() { settings.max_endpoints_free = v as i32; } }
                "max_endpoints_startup" => { if let Some(v) = value.as_i64() { settings.max_endpoints_startup = v as i32; } }
                "max_endpoints_pro" => { if let Some(v) = value.as_i64() { settings.max_endpoints_pro = v as i32; } }
                "max_endpoints_enterprise" => { if let Some(v) = value.as_i64() { settings.max_endpoints_enterprise = v as i32; } }
                "max_webhooks_free" => { if let Some(v) = value.as_i64() { settings.max_webhooks_free = v as i32; } }
                "max_webhooks_startup" => { if let Some(v) = value.as_i64() { settings.max_webhooks_startup = v as i32; } }
                "max_webhooks_pro" => { if let Some(v) = value.as_i64() { settings.max_webhooks_pro = v as i32; } }
                "max_webhooks_enterprise" => { if let Some(v) = value.as_i64() { settings.max_webhooks_enterprise = v as i32; } }
                "rate_limit_free" => { if let Some(v) = value.as_i64() { settings.rate_limit_free = v as i32; } }
                "rate_limit_startup" => { if let Some(v) = value.as_i64() { settings.rate_limit_startup = v as i32; } }
                "rate_limit_pro" => { if let Some(v) = value.as_i64() { settings.rate_limit_pro = v as i32; } }
                "rate_limit_enterprise" => { if let Some(v) = value.as_i64() { settings.rate_limit_enterprise = v as i32; } }
                "retention_days_free" => { if let Some(v) = value.as_i64() { settings.retention_days_free = v as i32; } }
                "retention_days_startup" => { if let Some(v) = value.as_i64() { settings.retention_days_startup = v as i32; } }
                "retention_days_pro" => { if let Some(v) = value.as_i64() { settings.retention_days_pro = v as i32; } }
                "retention_days_enterprise" => { if let Some(v) = value.as_i64() { settings.retention_days_enterprise = v as i32; } }
                "retry_max_attempts" => { if let Some(v) = value.as_i64() { settings.retry_max_attempts = v as i32; } }
                "maintenance_mode" => { if let Some(v) = value.as_bool() { settings.maintenance_mode = v; } }
                "signup_enabled" => { if let Some(v) = value.as_bool() { settings.signup_enabled = v; } }
                "plan_price_startup" => { if let Some(v) = value.as_f64() { settings.plan_price_startup = v; } }
                "plan_price_pro" => { if let Some(v) = value.as_f64() { settings.plan_price_pro = v; } }
                "plan_price_enterprise" => { if let Some(v) = value.as_f64() { settings.plan_price_enterprise = v; } }
                "plan_price_business" => { if let Some(v) = value.as_f64() { settings.plan_price_business = v; } }
                "resend_api_key" => { if let Some(v) = value.as_str() { settings.resend_api_key = Some(v.to_string()); } }
                "email_sender" => { if let Some(v) = value.as_str() { settings.email_sender = Some(v.to_string()); } }
                "webhook_secret" => { if let Some(v) = value.as_str() { settings.webhook_secret = Some(v.to_string()); } }
                "backup_retention_days" => { if let Some(v) = value.as_i64() { settings.backup_retention_days = v as i32; } }
                "global_rate_limit" => { if let Some(v) = value.as_i64() { settings.global_rate_limit = v as i32; } }
                "cors_origins" => { if let Some(v) = value.as_str() { settings.cors_origins = Some(v.to_string()); } }
                _ => {} // Ignore unknown fields
            }
        }
    }

    let value = serde_json::to_value(&settings)
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

    let startup_price = settings.plan_price_startup;
    let pro_price = settings.plan_price_pro;
    let enterprise_price = settings.plan_price_enterprise;
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

    // Batch INSERT — tek sorguyla tüm kullanıcılara notification gönder (N+1 fix)
    if !users.is_empty() {
        let mut query = String::from(
            "INSERT INTO notifications (customer_id, type, title, message, is_read, link) VALUES "
        );
        let mut params: Vec<String> = Vec::new();
        for (i, (_user_id,)) in users.iter().enumerate() {
            let base = i * 5;
            params.push(format!(
                "(${}, 'system', ${}, ${}, FALSE, ${})",
                base + 1, base + 2, base + 3, base + 4
            ));
        }
        query.push_str(&params.join(", "));

        let mut q = sqlx::query(&query);
        for (user_id,) in &users {
            q = q.bind(user_id).bind(&title).bind(&message).bind(&link);
        }
        q.execute(&pool).await?;
    }

    tracing::info!("📢 SDK update notification sent to {} users", users.len());

    Ok(Json(serde_json::json!({
        "message": format!("Notification sent to {} user(s)", users.len()),
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
