//! Admin alert rule management.

use axum::extract::{Extension, Path};
use axum::Json;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

use super::{require_admin, require_admin_write};

#[derive(Debug, Serialize)]
pub struct AdminAlertRule {
    pub id: Uuid,
    pub customer_id: Option<Uuid>,
    pub customer_email: Option<String>,
    pub name: String,
    pub condition: String,
    pub threshold: i32,
    pub channels: Vec<String>,
    pub is_active: bool,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AdminCreateAlertRequest {
    pub customer_id: Option<Uuid>,
    pub name: String,
    pub condition: String,
    pub threshold: i32,
    pub channels: Vec<String>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AdminUpdateAlertRequest {
    pub name: Option<String>,
    pub condition: Option<String>,
    pub threshold: Option<i32>,
    pub channels: Option<Vec<String>>,
    pub is_active: Option<bool>,
}

/// GET /v1/admin/alerts — List all alert rules.
pub async fn list_all_alerts(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<AdminAlertRule>>, AppError> {
    require_admin(&customer)?;

    let alerts = sqlx::query_as::<_, (Uuid, Option<Uuid>, Option<String>, String, String, i32, serde_json::Value, bool, chrono::DateTime<chrono::Utc>)>(
        r#"SELECT ar.id, ar.customer_id, c.email, ar.name, ar.condition, ar.threshold, ar.channels, ar.is_active, ar.created_at
           FROM alert_rules ar
           LEFT JOIN customers c ON ar.customer_id = c.id
           ORDER BY ar.created_at DESC
           LIMIT 200"#
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(
        alerts
            .into_iter()
            .map(|(id, cid, email, name, condition, threshold, channels, active, created)| {
                let channel_list: Vec<String> = channels
                    .as_array()
                    .map(|arr| arr.iter().filter_map(|v| v.as_str().map(String::from)).collect())
                    .unwrap_or_default();
                AdminAlertRule {
                    id,
                    customer_id: cid,
                    customer_email: email,
                    name,
                    condition,
                    threshold,
                    channels: channel_list,
                    is_active: active,
                    created_at: created.to_rfc3339(),
                }
            })
            .collect(),
    ))
}

/// POST /v1/admin/alerts — Create a platform alert rule.
pub async fn create_platform_alert(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<AdminCreateAlertRequest>,
) -> Result<Json<AdminAlertRule>, AppError> {
    require_admin_write(&customer)?;

    let valid_conditions = ["failure_rate", "latency", "consecutive_failures"];
    if !valid_conditions.contains(&req.condition.as_str()) {
        return Err(AppError::BadRequest("Invalid alert condition".into()));
    }
    if req.threshold <= 0 {
        return Err(AppError::BadRequest("Threshold must be positive".into()));
    }
    let valid_channels = ["slack", "email", "webhook"];
    for ch in &req.channels {
        if !valid_channels.contains(&ch.as_str()) {
            return Err(AppError::BadRequest("Invalid notification channel".into()));
        }
    }

    let channels_json = serde_json::json!(req.channels);
    let target_customer_id: Option<Uuid> = req.customer_id;

    let alert = sqlx::query_as::<_, (Uuid, Option<Uuid>, String, String, i32, serde_json::Value, bool, chrono::DateTime<chrono::Utc>)>(
        "INSERT INTO alert_rules (customer_id, name, condition, threshold, channels, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING id, customer_id, name, condition, threshold, channels, is_active, created_at"
    )
    .bind(target_customer_id)
    .bind(&req.name)
    .bind(&req.condition)
    .bind(req.threshold)
    .bind(&channels_json)
    .fetch_one(&pool)
    .await?;

    tracing::info!("🔔 Admin created alert rule: {}", req.name);

    Ok(Json(AdminAlertRule {
        id: alert.0,
        customer_id: alert.1,
        customer_email: None,
        name: alert.2,
        condition: alert.3,
        threshold: alert.4,
        channels: req.channels,
        is_active: alert.6,
        created_at: alert.7.to_rfc3339(),
    }))
}

/// PUT /v1/admin/alerts/:id — Update an alert rule.
pub async fn update_alert_admin(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<AdminUpdateAlertRequest>,
) -> Result<Json<AdminAlertRule>, AppError> {
    require_admin_write(&customer)?;

    if let Some(ref cond) = req.condition {
        let valid_conditions = ["failure_rate", "latency", "consecutive_failures"];
        if !valid_conditions.contains(&cond.as_str()) {
            return Err(AppError::BadRequest("Invalid alert condition".into()));
        }
    }
    if let Some(thresh) = req.threshold {
        if thresh <= 0 {
            return Err(AppError::BadRequest("Threshold must be positive".into()));
        }
    }
    if let Some(ref channels) = req.channels {
        let valid_channels = ["slack", "email", "webhook"];
        for ch in channels {
            if !valid_channels.contains(&ch.as_str()) {
                return Err(AppError::BadRequest("Invalid notification channel".into()));
            }
        }
    }

    let alert = sqlx::query_as::<_, (Uuid, Option<Uuid>, String, String, i32, serde_json::Value, bool, chrono::DateTime<chrono::Utc>)>(
        "UPDATE alert_rules SET
            name = COALESCE($1, name),
            condition = COALESCE($2, condition),
            threshold = COALESCE($3, threshold),
            channels = COALESCE($4, channels),
            is_active = COALESCE($5, is_active),
            updated_at = NOW()
         WHERE id = $6 AND (customer_id = $7 OR customer_id IS NULL)
         RETURNING id, customer_id, name, condition, threshold, channels, is_active, created_at"
    )
    .bind(req.name.as_deref())
    .bind(req.condition.as_deref())
    .bind(req.threshold)
    .bind(req.channels.as_ref().map(|c| serde_json::json!(c)))
    .bind(req.is_active)
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let channels: Vec<String> = alert
        .5
        .as_array()
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default();

    Ok(Json(AdminAlertRule {
        id: alert.0,
        customer_id: alert.1,
        customer_email: None,
        name: alert.2,
        condition: alert.3,
        threshold: alert.4,
        channels,
        is_active: alert.6,
        created_at: alert.7.to_rfc3339(),
    }))
}

/// DELETE /v1/admin/alerts/:id — Delete an alert rule.
pub async fn delete_alert_admin(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    let result =
        sqlx::query("DELETE FROM alert_rules WHERE id = $1 AND (customer_id = $2 OR customer_id IS NULL)")
            .bind(id)
            .bind(customer.id)
            .execute(&pool)
            .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({"deleted": true})))
}
