//! GET /v1/admin/dashboard — Batch endpoint for all admin dashboard data.
//!
//! Returns stats, revenue, audit logs, feature flags, queue status,
//! failed deliveries, rate limits, deploy info, alerts, broadcasts,
//! security stats, and users in a single response.
//! Cached in Redis for 30 seconds.

use axum::extract::Extension;
use axum::Json;
use serde::Serialize;
use sqlx::PgPool;

use crate::error::AppError;
use crate::models::customer::Customer;

use super::require_admin;
use super::stats::{SystemStats, RevenueResponse, PlanCount, RecentSignup, StatsTrends, RevenueRow, RevenueByPlan, ChurnedUser};
use super::audit;
use super::feature_flags;
use super::monitoring;
use super::settings;
use super::alerts;
use super::broadcasts;
use super::security;
use super::users;

// ── Response Type ──────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct DashboardResponse {
    pub stats: SystemStats,
    pub revenue: RevenueResponse,
    pub audit_logs: AuditLogsSummary,
    pub feature_flags: FeatureFlagsSummary,
    pub queue_status: QueueStatusSummary,
    pub failed_deliveries: FailedDeliveriesSummary,
    pub rate_limit_violations: RateLimitSummary,
    pub deploy_info: DeployInfoSummary,
    pub alerts: Vec<AlertSummary>,
    pub broadcasts: Vec<BroadcastSummary>,
    pub security_stats: SecurityStatsSummary,
    pub users: UsersSummary,
}

#[derive(Debug, Serialize)]
pub struct AuditLogsSummary {
    pub entries: Vec<serde_json::Value>,
    pub total: i64,
}

#[derive(Debug, Serialize)]
pub struct FeatureFlagsSummary {
    pub flags: Vec<serde_json::Value>,
    pub enabled_flags: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct QueueStatusSummary {
    pub pending: i64,
    pub processing: i64,
    pub failed: i64,
    pub dead_letter: i64,
    pub oldest_pending_age_seconds: Option<i64>,
    pub total: i64,
}

#[derive(Debug, Serialize)]
pub struct FailedDeliveriesSummary {
    pub deliveries: Vec<serde_json::Value>,
    pub total: i64,
}

#[derive(Debug, Serialize)]
pub struct RateLimitSummary {
    pub violations: Vec<serde_json::Value>,
    pub total: i64,
}

#[derive(Debug, Serialize)]
pub struct DeployInfoSummary {
    pub version: Option<String>,
    pub commit: Option<String>,
    pub deployed_at: Option<String>,
    pub environment: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct AlertSummary {
    pub id: String,
    pub name: String,
    pub condition: String,
    pub threshold: f64,
    pub is_active: bool,
}

#[derive(Debug, Serialize)]
pub struct BroadcastSummary {
    pub id: String,
    pub title: String,
    pub broadcast_type: String,
    pub severity: String,
    pub is_active: bool,
}

#[derive(Debug, Serialize)]
pub struct SecurityStatsSummary {
    pub total_events: i64,
    pub unresolved_events: i64,
    pub critical_events: i64,
    pub high_events: i64,
    pub recent_brute_force: i64,
    pub recent_credential_stuffing: i64,
    pub recent_injection_attempts: i64,
}

#[derive(Debug, Serialize)]
pub struct UsersSummary {
    pub users: Vec<serde_json::Value>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}

// ── Handler ────────────────────────────────────────────────

/// GET /v1/admin/dashboard — All admin data in one request (cached 30s).
pub async fn admin_dashboard(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(cache_layer): Extension<Option<crate::cache::CacheLayer>>,
) -> Result<Json<DashboardResponse>, AppError> {
    require_admin(&customer)?;

    // Check cache first
    if let Some(ref cache) = cache_layer {
        if let Some(cached) = cache.get::<DashboardResponse>("admin_dashboard", "all").await {
            return Ok(Json(cached));
        }
    }

    // Run all queries in parallel using tokio::join!
    let (
        stats_result,
        revenue_result,
        audit_result,
        flags_result,
        queue_result,
        failed_result,
        rlv_result,
        alerts_result,
        broadcasts_result,
        security_result,
        users_result,
    ) = tokio::join!(
        // 1. System stats
        fetch_stats(&pool),
        // 2. Revenue
        fetch_revenue(&pool),
        // 3. Audit logs (recent 5)
        fetch_audit_logs(&pool),
        // 4. Feature flags
        fetch_feature_flags(&pool),
        // 5. Queue status
        fetch_queue_status(&pool),
        // 6. Failed deliveries (recent 5)
        fetch_failed_deliveries(&pool),
        // 7. Rate limit violations (recent 5)
        fetch_rate_limit_violations(&pool),
        // 8. Alerts
        fetch_alerts(&pool),
        // 9. Broadcasts
        fetch_broadcasts(&pool),
        // 10. Security stats
        fetch_security_stats(&pool),
        // 11. Users (first page)
        fetch_users(&pool),
    );

    let response = DashboardResponse {
        stats: stats_result?,
        revenue: revenue_result?,
        audit_logs: audit_result?,
        feature_flags: flags_result?,
        queue_status: queue_result?,
        failed_deliveries: failed_result?,
        rate_limit_violations: rlv_result?,
        deploy_info: DeployInfoSummary {
            version: option_env!("CARGO_PKG_VERSION").map(|v| v.to_string()),
            commit: option_env!("GIT_SHA").map(|s| s.to_string()),
            deployed_at: None,
            environment: std::env::var("ENVIRONMENT").ok(),
        },
        alerts: alerts_result?,
        broadcasts: broadcasts_result?,
        security_stats: security_result?,
        users: users_result?,
    };

    // Cache for 30 seconds
    if let Some(ref cache) = cache_layer {
        cache.set_with_ttl("admin_dashboard", "all", &response, std::time::Duration::from_secs(30)).await;
    }

    Ok(Json(response))
}

// ── Fetch Functions (parallel) ─────────────────────────────

async fn fetch_stats(pool: &PgPool) -> Result<SystemStats, AppError> {
    let total_users: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM customers")
        .fetch_one(pool).await?;
    let total_deliveries: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM deliveries")
        .fetch_one(pool).await?;
    let revenue: (Option<f64>,) = sqlx::query_as(
        "SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0) FROM invoices WHERE status = 'paid'"
    ).fetch_one(pool).await?;
    let active_today: (i64,) = sqlx::query_as(
        "SELECT COUNT(DISTINCT customer_id) FROM deliveries WHERE created_at >= CURRENT_DATE"
    ).fetch_one(pool).await?;
    let total_endpoints: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM endpoints")
        .fetch_one(pool).await?;
    let active_endpoints: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM endpoints WHERE is_active = true"
    ).fetch_one(pool).await?;

    let users_by_plan: Vec<PlanCount> = sqlx::query_as(
        "SELECT plan, COUNT(*) as count FROM customers GROUP BY plan ORDER BY count DESC"
    ).fetch_all(pool).await?;

    let recent_signups: Vec<RecentSignup> = sqlx::query_as(
        "SELECT id, email, name, plan, created_at FROM customers ORDER BY created_at DESC LIMIT 5"
    ).fetch_all(pool).await?;

    let users_yesterday: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM customers WHERE created_at < CURRENT_DATE"
    ).fetch_one(pool).await?;
    let deliveries_yesterday: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE created_at < CURRENT_DATE"
    ).fetch_one(pool).await?;
    let revenue_yesterday: (Option<f64>,) = sqlx::query_as(
        "SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0) FROM invoices WHERE status = 'paid' AND created_at < CURRENT_DATE"
    ).fetch_one(pool).await?;
    let active_yesterday: (i64,) = sqlx::query_as(
        "SELECT COUNT(DISTINCT customer_id) FROM deliveries WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' AND created_at < CURRENT_DATE"
    ).fetch_one(pool).await?;
    let active_webhooks: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE status = 'pending' OR status = 'processing'"
    ).fetch_one(pool).await?;

    Ok(SystemStats {
        total_users: total_users.0,
        total_deliveries: total_deliveries.0,
        total_revenue: revenue.0.unwrap_or(0.0),
        active_users_today: active_today.0,
        total_endpoints: total_endpoints.0,
        active_endpoints: active_endpoints.0,
        users_by_plan,
        recent_signups,
        trends: StatsTrends {
            total_users_yesterday: users_yesterday.0,
            total_deliveries_yesterday: deliveries_yesterday.0,
            revenue_yesterday: revenue_yesterday.0.unwrap_or(0.0),
            active_users_yesterday: active_yesterday.0,
            active_webhooks: active_webhooks.0,
        },
    })
}

async fn fetch_revenue(pool: &PgPool) -> Result<RevenueResponse, AppError> {
    let monthly: Vec<RevenueRow> = sqlx::query_as(
        "SELECT TO_CHAR(created_at, 'YYYY-MM') as month, \
         COALESCE(SUM(amount_cents::double precision / 100.0), 0.0) as revenue \
         FROM invoices WHERE status = 'paid' \
         GROUP BY month ORDER BY month DESC LIMIT 12"
    ).fetch_all(pool).await?;

    let by_plan: Vec<RevenueByPlan> = sqlx::query_as(
        "SELECT c.plan, COALESCE(SUM(i.amount_cents::double precision / 100.0), 0.0) as revenue, COUNT(DISTINCT c.id) as count \
         FROM invoices i JOIN customers c ON i.customer_id = c.id \
         WHERE i.status = 'paid' GROUP BY c.plan ORDER BY revenue DESC"
    ).fetch_all(pool).await?;

    let mrr: (Option<f64>,) = sqlx::query_as(
        "SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0) \
         FROM invoices WHERE status = 'paid' AND created_at >= date_trunc('month', NOW())"
    ).fetch_one(pool).await?;

    let collected: (Option<f64>,) = sqlx::query_as(
        "SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0) FROM invoices WHERE status = 'paid'"
    ).fetch_one(pool).await?;

    let total_customers: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM customers").fetch_one(pool).await?;
    let churned: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM customers WHERE is_active = false"
    ).fetch_one(pool).await?;

    let churn_rate = if total_customers.0 > 0 {
        (churned.0 as f64 / total_customers.0 as f64) * 100.0
    } else { 0.0 };

    let prev_mrr: (Option<f64>,) = sqlx::query_as(
        "SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0) \
         FROM invoices WHERE status = 'paid' AND created_at >= date_trunc('month', NOW() - INTERVAL '1 month') \
         AND created_at < date_trunc('month', NOW())"
    ).fetch_one(pool).await?;

    let mrr_trend = if prev_mrr.0.unwrap_or(0.0) > 0.0 {
        ((mrr.0.unwrap_or(0.0) - prev_mrr.0.unwrap_or(0.0)) / prev_mrr.0.unwrap_or(0.0)) * 100.0
    } else { 0.0 };

    Ok(RevenueResponse {
        monthly_revenue: monthly,
        revenue_by_plan: by_plan,
        mrr: mrr.0.unwrap_or(0.0),
        churn_rate,
        mrr_trend,
        collected_revenue: collected.0.unwrap_or(0.0),
    })
}

async fn fetch_audit_logs(pool: &PgPool) -> Result<AuditLogsSummary, AppError> {
    let rows: Vec<(uuid::Uuid, String, String, Option<String>, Option<String>, chrono::DateTime<chrono::Utc>)> = sqlx::query_as(
        "SELECT id, action, resource_type, resource_id, details, created_at \
         FROM audit_logs ORDER BY created_at DESC LIMIT 5"
    ).fetch_all(pool).await?;

    let entries: Vec<serde_json::Value> = rows.iter().map(|r| {
        serde_json::json!({
            "id": r.0, "action": r.1, "resource_type": r.2,
            "resource_id": r.3, "details": r.4, "created_at": r.5
        })
    }).collect();

    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM audit_logs").fetch_one(pool).await?;

    Ok(AuditLogsSummary { entries, total: total.0 })
}

async fn fetch_feature_flags(pool: &PgPool) -> Result<FeatureFlagsSummary, AppError> {
    let rows: Vec<(uuid::Uuid, String, String, bool, Option<String>, chrono::DateTime<chrono::Utc>)> = sqlx::query_as(
        "SELECT id, name, description, is_enabled, allowed_plans, created_at \
         FROM feature_flags ORDER BY created_at DESC"
    ).fetch_all(pool).await?;

    let flags: Vec<serde_json::Value> = rows.iter().map(|r| {
        serde_json::json!({
            "id": r.0, "name": r.1, "description": r.2,
            "is_enabled": r.3, "allowed_plans": r.4, "created_at": r.5
        })
    }).collect();

    let enabled: Vec<String> = rows.iter().filter(|r| r.3).map(|r| r.1.clone()).collect();

    Ok(FeatureFlagsSummary { flags, enabled_flags: enabled })
}

async fn fetch_queue_status(pool: &PgPool) -> Result<QueueStatusSummary, AppError> {
    let pending: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM deliveries WHERE status = 'pending'").fetch_one(pool).await?;
    let processing: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM deliveries WHERE status = 'processing'").fetch_one(pool).await?;
    let failed: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM deliveries WHERE status = 'failed'").fetch_one(pool).await?;
    let dead_letter: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM deliveries WHERE status = 'dead'").fetch_one(pool).await?;
    let oldest: (Option<chrono::DateTime<chrono::Utc>>,) = sqlx::query_as(
        "SELECT MIN(created_at) FROM deliveries WHERE status = 'pending'"
    ).fetch_one(pool).await?;

    let age = oldest.0.map(|t| (chrono::Utc::now() - t).num_seconds());

    Ok(QueueStatusSummary {
        pending: pending.0,
        processing: processing.0,
        failed: failed.0,
        dead_letter: dead_letter.0,
        oldest_pending_age_seconds: age,
        total: pending.0 + processing.0 + failed.0 + dead_letter.0,
    })
}

async fn fetch_failed_deliveries(pool: &PgPool) -> Result<FailedDeliveriesSummary, AppError> {
    let rows: Vec<serde_json::Value> = sqlx::query_as::<_, (uuid::Uuid, String, String, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, status, event_type, created_at FROM deliveries \
         WHERE status = 'failed' ORDER BY created_at DESC LIMIT 5"
    ).fetch_all(pool).await.iter().map(|r| {
        r.iter().map(|row| serde_json::json!({
            "id": row.0, "status": row.1, "event_type": row.2, "created_at": row.3
        })).collect()
    }).unwrap_or_default();

    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM deliveries WHERE status = 'failed'").fetch_one(pool).await?;

    Ok(FailedDeliveriesSummary { deliveries: rows, total: total.0 })
}

async fn fetch_rate_limit_violations(pool: &PgPool) -> Result<RateLimitSummary, AppError> {
    let rows: Vec<serde_json::Value> = sqlx::query_as::<_, (uuid::Uuid, String, String, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, ip_address, reason, created_at FROM ip_blocklist \
         WHERE auto_blocked = true ORDER BY created_at DESC LIMIT 5"
    ).fetch_all(pool).await.iter().map(|r| {
        r.iter().map(|row| serde_json::json!({
            "id": row.0, "ip": row.1, "reason": row.2, "created_at": row.3
        })).collect()
    }).unwrap_or_default();

    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM ip_blocklist WHERE auto_blocked = true").fetch_one(pool).await?;

    Ok(RateLimitSummary { violations: rows, total: total.0 })
}

async fn fetch_alerts(pool: &PgPool) -> Result<Vec<AlertSummary>, AppError> {
    let rows: Vec<(uuid::Uuid, String, String, f64, bool)> = sqlx::query_as(
        "SELECT id, name, condition, threshold, is_active FROM alert_rules ORDER BY created_at DESC LIMIT 10"
    ).fetch_all(pool).await?;

    Ok(rows.iter().map(|r| AlertSummary {
        id: r.0.to_string(),
        name: r.1.clone(),
        condition: r.2.clone(),
        threshold: r.3,
        is_active: r.4,
    }).collect())
}

async fn fetch_broadcasts(pool: &PgPool) -> Result<Vec<BroadcastSummary>, AppError> {
    let rows: Vec<(uuid::Uuid, String, String, String, bool)> = sqlx::query_as(
        "SELECT id, title, broadcast_type, severity, is_active \
         FROM broadcasts ORDER BY created_at DESC LIMIT 10"
    ).fetch_all(pool).await?;

    Ok(rows.iter().map(|r| BroadcastSummary {
        id: r.0.to_string(),
        title: r.1.clone(),
        broadcast_type: r.2.clone(),
        severity: r.3.clone(),
        is_active: r.4,
    }).collect())
}

async fn fetch_security_stats(pool: &PgPool) -> Result<SecurityStatsSummary, AppError> {
    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM security_events").fetch_one(pool).await?;
    let unresolved: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM security_events WHERE resolved = false").fetch_one(pool).await?;
    let critical: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM security_events WHERE severity = 'critical' AND created_at >= NOW() - INTERVAL '7 days'"
    ).fetch_one(pool).await?;
    let high: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM security_events WHERE severity = 'high' AND created_at >= NOW() - INTERVAL '7 days'"
    ).fetch_one(pool).await?;
    let brute: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM security_events WHERE event_type LIKE 'brute_force%' AND created_at >= NOW() - INTERVAL '1 day'"
    ).fetch_one(pool).await?;
    let cred: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM security_events WHERE event_type = 'credential_stuffing' AND created_at >= NOW() - INTERVAL '1 day'"
    ).fetch_one(pool).await?;
    let inject: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM security_events WHERE event_type LIKE '%injection%' AND created_at >= NOW() - INTERVAL '1 day'"
    ).fetch_one(pool).await?;

    Ok(SecurityStatsSummary {
        total_events: total.0,
        unresolved_events: unresolved.0,
        critical_events: critical.0,
        high_events: high.0,
        recent_brute_force: brute.0,
        recent_credential_stuffing: cred.0,
        recent_injection_attempts: inject.0,
    })
}

async fn fetch_users(pool: &PgPool) -> Result<UsersSummary, AppError> {
    let rows: Vec<serde_json::Value> = sqlx::query_as::<_, (uuid::Uuid, String, Option<String>, String, bool, bool, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, email, name, plan, is_active, is_admin, created_at \
         FROM customers ORDER BY created_at DESC LIMIT 25"
    ).fetch_all(pool).await.iter().map(|r| {
        r.iter().map(|row| serde_json::json!({
            "id": row.0, "email": row.1, "name": row.2, "plan": row.3,
            "status": if row.4 { "active" } else { "banned" },
            "is_admin": row.5, "created_at": row.6
        })).collect()
    }).unwrap_or_default();

    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM customers").fetch_one(pool).await?;

    Ok(UsersSummary { users: rows, total: total.0, page: 1, per_page: 25 })
}
