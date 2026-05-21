// TODO (Item 254): Implement background alert evaluation worker.
//
// The alert_rules table stores conditions (failure_rate, latency, consecutive_failures)
// and notification channels (slack, email, webhook), but there's no background worker
// that periodically evaluates these rules against actual delivery stats.
//
// Implementation needed:
// 1. Background job (runs every 1-5 minutes) that:
//    a. Fetches all active alert_rules
//    b. For each rule, queries delivery stats (last N minutes/hours)
//    c. Compares stats against threshold
//    d. If threshold exceeded, sends notification via configured channels
//    e. Tracks last_triggered_at to avoid duplicate alerts (cooldown period)
// 2. Notification dispatchers:
//    a. Slack: POST to webhook_url with alert payload
//    b. Email: use existing email provider
//    c. Webhook: POST to customer's configured webhook URL
// 3. Add cooldown period (e.g., 15 min) to prevent alert storms

use axum::extract::Extension;
use axum::routing::{get, post};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::error::ErrorCode;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_alerts).post(create_alert))
        .route("/{id}", get(get_alert).put(update_alert).delete(delete_alert))
        .route("/{id}/test", post(test_alert))
}

#[derive(Serialize)]
struct AlertRule {
    id: Uuid,
    name: String,
    condition: String,
    threshold: i32,
    channels: Vec<String>,
    is_active: bool,
    created_at: String,
}

#[derive(Deserialize)]
struct CreateAlertRequest {
    name: String,
    condition: String, // "failure_rate", "latency", "consecutive_failures"
    threshold: i32,
    channels: Vec<String>, // "slack", "email", "webhook"
}

async fn list_alerts(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<AlertRule>>, AppError> {
    // Show both user's own alerts AND platform-level alerts (customer_id IS NULL)
    let alerts = sqlx::query_as::<_, (Uuid, String, String, i32, serde_json::Value, bool, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, name, condition, threshold, channels, is_active, created_at FROM alert_rules WHERE customer_id = $1 OR customer_id IS NULL ORDER BY created_at DESC LIMIT 100"
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(
        alerts
            .into_iter()
            .map(
                |(id, name, condition, threshold, channels, active, created)| {
                    let channel_list: Vec<String> = channels
                        .as_array()
                        .map(|arr| {
                            arr.iter()
                                .filter_map(|v| v.as_str().map(String::from))
                                .collect()
                        })
                        .unwrap_or_default();
                    AlertRule {
                        id,
                        name,
                        condition,
                        threshold,
                        channels: channel_list,
                        is_active: active,
                        created_at: created.to_rfc3339(),
                    }
                },
            )
            .collect(),
    ))
}

async fn create_alert(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Json(req): Json<CreateAlertRequest>,
) -> Result<Json<AlertRule>, AppError> {
    // ── Role enforcement: require at least developer ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_developer(&pool, scope.team_id, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    // HS-038k: Validate condition string against allowed values
    let valid_conditions = ["failure_rate", "latency", "consecutive_failures"];
    if !valid_conditions.contains(&req.condition.as_str()) {
        return Err(AppError::coded(ErrorCode::InvalidAlertCondition));
    }

    // Validate threshold is positive
    if req.threshold <= 0 {
        return Err(AppError::BadRequest(
            "Threshold must be a positive integer".into(),
        ));
    }

    // Validate channels
    let valid_channels = ["slack", "email", "webhook"];
    for ch in &req.channels {
        if !valid_channels.contains(&ch.as_str()) {
            return Err(AppError::coded(ErrorCode::InvalidNotificationChannel));
        }
    }

    let channels_json = serde_json::json!(req.channels);

    let alert = sqlx::query_as::<_, (Uuid, String, String, i32, serde_json::Value, bool, chrono::DateTime<chrono::Utc>)>(
        "INSERT INTO alert_rules (customer_id, name, condition, threshold, channels, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING id, name, condition, threshold, channels, is_active, created_at"
    )
    .bind(customer.id)
    .bind(&req.name)
    .bind(&req.condition)
    .bind(req.threshold)
    .bind(&channels_json)
    .fetch_one(&pool)
    .await?;

    tracing::info!(
        "🔔 Alert rule created: {} for customer {}",
        req.name,
        customer.id
    );

    Ok(Json(AlertRule {
        id: alert.0,
        name: alert.1,
        condition: alert.2,
        threshold: alert.3,
        channels: req.channels,
        is_active: alert.5,
        created_at: alert.6.to_rfc3339(),
    }))
}

#[derive(Deserialize)]
struct UpdateAlertRequest {
    name: Option<String>,
    condition: Option<String>,
    threshold: Option<i32>,
    channels: Option<Vec<String>>,
    is_active: Option<bool>,
}

async fn update_alert(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    axum::extract::Path(id): axum::extract::Path<Uuid>,
    Json(req): Json<UpdateAlertRequest>,
) -> Result<Json<AlertRule>, AppError> {
    // ── Role enforcement: require at least developer ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_developer(&pool, scope.team_id, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    // Verify ownership (allow platform alerts too)
    let _existing: (Uuid,) =
        sqlx::query_as("SELECT id FROM alert_rules WHERE id = $1 AND (customer_id = $2 OR customer_id IS NULL)")
            .bind(id)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?
            .ok_or(AppError::NotFound)?;

    // Validate condition if provided
    if let Some(ref cond) = req.condition {
        let valid_conditions = ["failure_rate", "latency", "consecutive_failures"];
        if !valid_conditions.contains(&cond.as_str()) {
            return Err(AppError::coded(ErrorCode::InvalidAlertCondition));
        }
    }

    // Validate threshold if provided
    if let Some(thresh) = req.threshold {
        if thresh <= 0 {
            return Err(AppError::BadRequest(
                "Threshold must be a positive integer".into(),
            ));
        }
    }

    // Validate channels if provided
    if let Some(ref channels) = req.channels {
        let valid_channels = ["slack", "email", "webhook"];
        for ch in channels {
            if !valid_channels.contains(&ch.as_str()) {
                return Err(AppError::coded(ErrorCode::InvalidNotificationChannel));
            }
        }
    }

    let alert = sqlx::query_as::<_, (Uuid, String, String, i32, serde_json::Value, bool, chrono::DateTime<chrono::Utc>)>(
        "UPDATE alert_rules SET
            name = COALESCE($1, name),
            condition = COALESCE($2, condition),
            threshold = COALESCE($3, threshold),
            channels = COALESCE($4, channels),
            is_active = COALESCE($5, is_active),
            updated_at = NOW()
         WHERE id = $6 AND (customer_id = $7 OR customer_id IS NULL)
         RETURNING id, name, condition, threshold, channels, is_active, created_at"
    )
    .bind(req.name.as_deref())
    .bind(req.condition.as_deref())
    .bind(req.threshold)
    .bind(req.channels.as_ref().map(|c| serde_json::json!(c)))
    .bind(req.is_active)
    .bind(id)
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    let channels: Vec<String> = alert
        .4
        .as_array()
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default();

    Ok(Json(AlertRule {
        id: alert.0,
        name: alert.1,
        condition: alert.2,
        threshold: alert.3,
        channels,
        is_active: alert.5,
        created_at: alert.6.to_rfc3339(),
    }))
}

async fn get_alert(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    axum::extract::Path(id): axum::extract::Path<Uuid>,
) -> Result<Json<AlertRule>, AppError> {
    // Allow viewing both user's own alerts AND platform alerts (customer_id IS NULL)
    let alert = sqlx::query_as::<_, (Uuid, String, String, i32, serde_json::Value, bool, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, name, condition, threshold, channels, is_active, created_at FROM alert_rules WHERE id = $1 AND (customer_id = $2 OR customer_id IS NULL)"
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let channels: Vec<String> = alert
        .4
        .as_array()
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default();

    Ok(Json(AlertRule {
        id: alert.0,
        name: alert.1,
        condition: alert.2,
        threshold: alert.3,
        channels,
        is_active: alert.5,
        created_at: alert.6.to_rfc3339(),
    }))
}

async fn delete_alert(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    axum::extract::Path(id): axum::extract::Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    // ── Role enforcement: require admin for destructive ops ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_admin(&pool, scope.team_id, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "admin").await?;
    }

    // Allow deleting both user's own alerts AND platform alerts (customer_id IS NULL)
    let result = sqlx::query("DELETE FROM alert_rules WHERE id = $1 AND (customer_id = $2 OR customer_id IS NULL)")
        .bind(id)
        .bind(customer.id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({"deleted": true})))
}

async fn test_alert(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(event_publisher): Extension<Option<crate::events::EventPublisher>>,
    axum::extract::Path(id): axum::extract::Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Verify ownership and fetch alert details
    let alert_info: Option<(Uuid, String, String)> = sqlx::query_as(
        "SELECT id, name, condition FROM alert_rules WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?;

    let (alert_id, alert_name, alert_condition) = alert_info.ok_or(AppError::NotFound)?;

    // Publish AlertTriggered event (best-effort)
    if let Some(ref publisher) = event_publisher {
        if let Err(e) = publisher.publish(crate::events::AppEvent::AlertTriggered {
            alert_id,
            customer_id: customer.id,
            name: alert_name.clone(),
            condition: alert_condition.clone(),
        }).await {
            tracing::warn!("Failed to publish AlertTriggered event: {:?}", e);
        }
    }

    // Log the test alert trigger for debugging
    tracing::info!("🔔 Test alert triggered: '{}' (condition: {}, customer: {})", alert_name, alert_condition, customer.id);

    // Create an in-app notification for the user
    let _ = sqlx::query(
        "INSERT INTO notifications (customer_id, type, title, message, is_read) VALUES ($1, 'alert', $2, $3, false)"
    )
    .bind(customer.id)
    .bind(format!("🚨 Test Alert: {}", alert_name))
    .bind(format!("Condition '{}' would be evaluated. This is a test notification.", alert_condition))
    .execute(&pool)
    .await;

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Test alert sent. Check your notification inbox."
    })))
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── AlertRule ───────────────────────────────────────────

    #[test]
    fn test_alert_rule_serialization() {
        let rule = AlertRule {
            id: Uuid::new_v4(),
            name: "High failure rate".to_string(),
            condition: "failure_rate".to_string(),
            threshold: 5,
            channels: vec!["slack".to_string(), "email".to_string()],
            is_active: true,
            created_at: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_value(&rule).unwrap();
        assert_eq!(json["name"], "High failure rate");
        assert_eq!(json["condition"], "failure_rate");
        assert_eq!(json["threshold"], 5);
        assert!(json["is_active"].as_bool().unwrap());
        let channels = json["channels"].as_array().unwrap();
        assert_eq!(channels.len(), 2);
        assert_eq!(channels[0], "slack");
        assert_eq!(channels[1], "email");
    }

    #[test]
    fn test_alert_rule_inactive() {
        let rule = AlertRule {
            id: Uuid::new_v4(),
            name: "Latency alert".to_string(),
            condition: "latency".to_string(),
            threshold: 5000,
            channels: vec!["webhook".to_string()],
            is_active: false,
            created_at: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_value(&rule).unwrap();
        assert!(!json["is_active"].as_bool().unwrap());
    }

    // ── CreateAlertRequest ──────────────────────────────────

    #[test]
    fn test_create_alert_request_deserialization() {
        let json = r#"{
            "name":"High failure rate",
            "condition":"failure_rate",
            "threshold":5,
            "channels":["slack","email"],
            "_endpoint_id":null
        }"#;
        let req: CreateAlertRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, "High failure rate");
        assert_eq!(req.condition, "failure_rate");
        assert_eq!(req.threshold, 5);
        assert_eq!(req.channels, vec!["slack", "email"]);
    }

    #[test]
    fn test_create_alert_request_with_endpoint_id() {
        let json = r#"{
            "name":"Endpoint latency",
            "condition":"latency",
            "threshold":3000,
            "channels":["webhook"],
            "_endpoint_id":"11111111-1111-1111-1111-111111111111"
        }"#;
        let req: CreateAlertRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, "Endpoint latency");
    }

    #[test]
    fn test_create_alert_request_consecutive_failures() {
        let json = r#"{
            "name":"Consecutive failures",
            "condition":"consecutive_failures",
            "threshold":3,
            "channels":["email"]
        }"#;
        let req: CreateAlertRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.condition, "consecutive_failures");
        assert_eq!(req.threshold, 3);
    }

    // ── Router construction ─────────────────────────────────

    #[test]
    fn test_alerts_router_construction() {
        let _router = router();
    }
}
