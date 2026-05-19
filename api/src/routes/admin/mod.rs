pub mod alerts;
pub mod audit;
pub mod broadcasts;
pub mod customers;
pub mod delivery;
pub mod export;
pub mod feature_flags;
pub mod gdpr;
pub mod monitoring;
pub mod refunds;
pub mod revenue;
pub mod security;
pub mod settings;
pub mod stats;
pub mod users;

use axum::routing::{delete, get, post, put};
use axum::Router;
use serde::Deserialize;
use sqlx::FromRow;

use crate::error::AppError;
use crate::models::customer::Customer;

// Re-export for backward compatibility (routes/mod.rs uses admin::public_plans)
pub use settings::public_plans;

/// Build the admin router with all sub-routes.
pub fn router() -> Router {
    Router::new()
        // ── Users ──
        .route("/users", get(users::list_users))
        .route("/users/export", get(export::export_users_csv))
        .route("/users/{id}", get(users::get_user_detail))
        .route("/users/{id}/plan", put(users::change_plan))
        .route("/users/{id}/plan-history", get(users::user_plan_history))
        .route("/users/{id}/send-email", post(users::send_user_email))
        .route("/users/{id}/status", put(users::change_status))
        .route("/users/{id}/impersonate", post(users::impersonate_user))
        .route("/users/{id}/analytics", get(users::user_analytics))
        .route("/users/{id}/endpoints", get(users::admin_user_endpoints))
        .route("/users/{id}/webhooks", get(users::admin_user_webhooks))
        .route("/users/{id}/api-keys", get(users::admin_user_api_keys))
        .route("/users/{id}/applications", get(users::admin_user_applications))
        .route("/users/{id}/usage", get(users::admin_user_usage))
        .route("/users/{id}/test-webhook", post(users::admin_user_test_webhook))
        .route(
            "/users/{id}/webhooks/{delivery_id}/replay",
            post(users::admin_user_replay_delivery),
        )
        // ── Stats & Revenue ──
        .route("/stats", get(stats::system_stats))
        .route("/revenue", get(stats::revenue_by_month))
        .route("/revenue/export", get(export::export_revenue_csv))
        .route("/churn", get(stats::churn_report))
        // ── Audit ──
        .route("/audit-logs", get(audit::admin_audit_logs))
        // ── Delivery ──
        .route("/deliveries/{id}/replay", post(delivery::replay_delivery))
        .route("/test-webhook", post(delivery::test_webhook))
        // ── SDK ──
        .route("/sdk-update", post(settings::notify_sdk_update))
        // ── Settings ──
        .route(
            "/settings",
            get(settings::get_settings).put(settings::update_settings),
        )
        // ── Alerts ──
        .route(
            "/alerts",
            get(alerts::list_all_alerts).post(alerts::create_platform_alert),
        )
        .route(
            "/alerts/{id}",
            put(alerts::update_alert_admin).delete(alerts::delete_alert_admin),
        )
        // ── Feature Flags ──
        .route(
            "/feature-flags",
            get(feature_flags::list_feature_flags).post(feature_flags::create_feature_flag),
        )
        .route(
            "/feature-flags/{id}",
            put(feature_flags::update_feature_flag).delete(feature_flags::delete_feature_flag),
        )
        // ── Deploy Info ──
        .route("/deploy-info", get(settings::deploy_info))
        // ── System Monitoring ──
        .route(
            "/deliveries/failed",
            get(monitoring::admin_failed_deliveries),
        )
        .route(
            "/deliveries/dead-letters",
            get(monitoring::admin_dead_letters),
        )
        .route("/queue/status", get(monitoring::admin_queue_status))
        .route(
            "/rate-limit-violations",
            get(monitoring::admin_rate_limit_violations),
        )
        .route("/api-latency", get(monitoring::admin_api_latency))
        // ── Customer Relations ──
        .route(
            "/users/{id}/notes",
            get(customers::admin_list_notes).post(customers::admin_add_note),
        )
        .route(
            "/users/{id}/tags",
            get(customers::admin_list_tags).post(customers::admin_add_tag),
        )
        .route(
            "/users/{id}/tags/{tag}",
            delete(customers::admin_remove_tag),
        )
        .route(
            "/users/{id}/communications",
            get(customers::admin_list_communications),
        )
        // ── Invoices, Payments, Revenue Metrics ──
        .route("/users/{id}/invoices", get(revenue::admin_user_invoices))
        .route("/users/{id}/payments", get(revenue::admin_user_payments))
        .route("/revenue/metrics", get(revenue::admin_revenue_metrics))
        .route("/revenue/cohorts", get(revenue::admin_revenue_cohorts))
        // ── Refunds ──
        .route("/users/{id}/refund", post(refunds::admin_refund_user))
        .route("/users/{id}/refunds", get(refunds::admin_user_refunds))
        .route("/refunds", get(refunds::admin_all_refunds))
        // ── GDPR + Bulk Email + Broadcasts ──
        .route(
            "/users/{id}/export",
            get(gdpr::admin_export_user_data),
        )
        .route(
            "/users/{id}/data",
            delete(gdpr::admin_delete_user_data),
        )
        .route("/bulk-email", post(gdpr::admin_bulk_email))
        // ── Broadcasts (global announcements) ──
        .route(
            "/broadcasts",
            get(broadcasts::list_broadcasts).post(broadcasts::create_broadcast),
        )
        .route(
            "/broadcasts/{id}",
            get(broadcasts::get_broadcast)
                .put(broadcasts::update_broadcast)
                .delete(broadcasts::delete_broadcast),
        )
        // ── Security Monitoring ──
        .route("/security/events", get(security::list_security_events))
        .route("/security/stats", get(security::security_stats))
        .route("/security/events/{id}/resolve", put(security::resolve_security_event))
        .route("/security/resolve-all", post(security::resolve_all_security_events))
        // ── IP Blocklist ──
        .route("/security/blocklist", get(security::list_ip_blocklist).post(security::block_ip))
        .route("/security/blocklist/{id}", delete(security::unblock_ip))
        .route("/security/blocklist/check", post(security::check_ip_blocked))
}

// ── Common Types ──────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PaginationParams {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub search: Option<String>,
    pub plan: Option<String>,
    pub status: Option<String>,
    pub created_after: Option<String>,
    pub created_before: Option<String>,
    pub sort_field: Option<String>,
    pub sort_dir: Option<String>,
}

#[derive(Debug, serde::Serialize)]
pub struct PaginatedUsers {
    pub users: Vec<UserSummary>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}

#[derive(Debug, serde::Serialize, FromRow)]
pub struct UserSummary {
    pub id: uuid::Uuid,
    pub email: String,
    pub name: Option<String>,
    pub plan: String,
    #[serde(default = "default_role_summary")]
    pub role: String,
    #[serde(rename = "status", serialize_with = "serialize_status")]
    pub is_active: bool,
    pub is_admin: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

fn default_role_summary() -> String {
    "member".to_string()
}

fn serialize_status<S: serde::Serializer>(is_active: &bool, s: S) -> Result<S::Ok, S::Error> {
    if *is_active {
        s.serialize_str("active")
    } else {
        s.serialize_str("banned")
    }
}

#[derive(Debug, serde::Serialize)]
pub struct UserDetailResponse {
    pub user: UserSummary,
    pub endpoints: Vec<EndpointSummary>,
    pub recent_deliveries: Vec<DeliverySummary>,
    pub usage_stats: UsageStats,
}

#[derive(Debug, serde::Serialize, FromRow)]
pub struct EndpointSummary {
    pub id: uuid::Uuid,
    pub url: String,
    pub description: Option<String>,
    pub is_active: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, serde::Serialize, FromRow)]
pub struct DeliverySummary {
    pub id: uuid::Uuid,
    pub endpoint_id: uuid::Uuid,
    pub status: String,
    #[serde(rename = "event")]
    pub event_type: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub attempt_count: i32,
}

#[derive(Debug, serde::Serialize)]
pub struct UsageStats {
    pub total_deliveries: i64,
    pub success_rate: f64,
    pub endpoints_count: i64,
}

#[derive(Debug, Deserialize)]
pub struct PlanRequest {
    pub plan: String,
}

#[derive(Debug, Deserialize)]
pub struct StatusRequest {
    pub is_active: bool,
    pub reason: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SendEmailRequest {
    pub subject: String,
    pub body: String,
}

// ── Common Helpers ──────────────────────────────────────────

/// Require admin or support role for read operations.
pub fn require_admin(customer: &Customer) -> Result<(), AppError> {
    if !customer.is_admin && !matches!(customer.role.as_str(), "admin" | "support") {
        return Err(AppError::Forbidden("Admin access required".into()));
    }
    Ok(())
}

/// Require admin role (not support) for write operations.
pub fn require_admin_write(customer: &Customer) -> Result<(), AppError> {
    if !customer.is_admin && customer.role != "admin" {
        return Err(AppError::Forbidden("Admin write access required".into()));
    }
    Ok(())
}

// ── Tests ──────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{TimeZone, Utc};

    #[test]
    fn test_pagination_params_all_none() {
        let json = r#"{}"#;
        let params: PaginationParams = serde_json::from_str(json).unwrap();
        assert!(params.page.is_none());
        assert!(params.per_page.is_none());
        assert!(params.search.is_none());
        assert!(params.plan.is_none());
        assert!(params.status.is_none());
    }

    #[test]
    fn test_pagination_params_all_some() {
        let json = r#"{"page":2,"per_page":50,"search":"test","plan":"pro","status":"active"}"#;
        let params: PaginationParams = serde_json::from_str(json).unwrap();
        assert_eq!(params.page, Some(2));
        assert_eq!(params.per_page, Some(50));
        assert_eq!(params.search, Some("test".to_string()));
        assert_eq!(params.plan, Some("pro".to_string()));
        assert_eq!(params.status, Some("active".to_string()));
    }

    #[test]
    fn test_plan_request_deserialization() {
        let json = r#"{"plan":"pro"}"#;
        let req: PlanRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.plan, "pro");
    }

    #[test]
    fn test_status_request_deserialization() {
        let json_true = r#"{"is_active":true}"#;
        let req: StatusRequest = serde_json::from_str(json_true).unwrap();
        assert!(req.is_active);

        let json_false = r#"{"is_active":false}"#;
        let req: StatusRequest = serde_json::from_str(json_false).unwrap();
        assert!(!req.is_active);
    }

    #[test]
    fn test_user_summary_serialization() {
        let user = UserSummary {
            id: uuid::Uuid::parse_str("11111111-1111-1111-1111-111111111111").unwrap(),
            email: "test@example.com".to_string(),
            name: Some("Test User".to_string()),
            plan: "pro".to_string(),
            role: "member".to_string(),
            is_active: true,
            is_admin: false,
            created_at: Utc.with_ymd_and_hms(2024, 1, 1, 0, 0, 0).unwrap(),
        };
        let json = serde_json::to_value(&user).unwrap();
        assert_eq!(json["email"], "test@example.com");
        assert_eq!(json["plan"], "pro");
        assert!(!json["is_admin"].as_bool().unwrap());
    }

    #[test]
    fn test_paginated_users_serialization() {
        let resp = PaginatedUsers {
            users: vec![],
            total: 0,
            page: 1,
            per_page: 20,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["total"], 0);
        assert_eq!(json["page"], 1);
        assert_eq!(json["per_page"], 20);
        assert!(json["users"].as_array().unwrap().is_empty());
    }

    #[test]
    fn test_endpoint_summary_serialization() {
        let ep = EndpointSummary {
            id: uuid::Uuid::new_v4(),
            url: "https://example.com/webhook".to_string(),
            description: Some("Main endpoint".to_string()),
            is_active: true,
            created_at: Utc::now(),
        };
        let json = serde_json::to_value(&ep).unwrap();
        assert_eq!(json["url"], "https://example.com/webhook");
        assert!(json["is_active"].as_bool().unwrap());
    }

    #[test]
    fn test_delivery_summary_serialization() {
        let d = DeliverySummary {
            id: uuid::Uuid::new_v4(),
            endpoint_id: uuid::Uuid::new_v4(),
            status: "delivered".to_string(),
            event_type: Some("order.created".to_string()),
            created_at: Utc::now(),
            attempt_count: 1,
        };
        let json = serde_json::to_value(&d).unwrap();
        assert_eq!(json["status"], "delivered");
        assert_eq!(json["event"], "order.created");
        assert_eq!(json["attempt_count"], 1);
    }

    #[test]
    fn test_usage_stats_serialization() {
        let stats = UsageStats {
            total_deliveries: 1000,
            success_rate: 98.5,
            endpoints_count: 5,
        };
        let json = serde_json::to_value(&stats).unwrap();
        assert_eq!(json["total_deliveries"], 1000);
        assert_eq!(json["success_rate"], 98.5);
    }

    #[test]
    fn test_admin_router_construction() {
        let _router = router();
    }
}

    #[test]
    fn test_user_summary_banned_status() {
        let user = UserSummary {
            id: uuid::Uuid::new_v4(),
            email: "banned@x.com".to_string(),
            name: None,
            plan: "developer".to_string(),
            role: "member".to_string(),
            is_active: false,
            is_admin: false,
            created_at: chrono::Utc::now(),
        };
        let json = serde_json::to_value(&user).unwrap();
        assert_eq!(json["status"], "banned");
    }

    #[test]
    fn test_delivery_summary_event_alias() {
        let d = DeliverySummary {
            id: uuid::Uuid::new_v4(),
            endpoint_id: uuid::Uuid::new_v4(),
            status: "pending".to_string(),
            event_type: Some("user.signup".to_string()),
            created_at: chrono::Utc::now(),
            attempt_count: 0,
        };
        let json = serde_json::to_value(&d).unwrap();
        let json_str = json.to_string();
        let from_json: serde_json::Value = serde_json::from_str(&json_str).unwrap();
        assert_eq!(from_json["event"], "user.signup");
    }
