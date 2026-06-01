//! System stats, revenue by month, churn report.

use axum::extract::Extension;
use axum::Json;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use sqlx::PgPool;

use crate::error::AppError;
use crate::models::customer::Customer;

use super::require_admin;

// ── Types ──────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemStats {
    pub total_users: i64,
    pub total_deliveries: i64,
    pub total_revenue: f64,
    pub active_users_today: i64,
    pub total_endpoints: i64,
    pub active_endpoints: i64,
    pub users_by_plan: Vec<PlanCount>,
    pub recent_signups: Vec<RecentSignup>,
    pub trends: StatsTrends,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StatsTrends {
    pub total_users_yesterday: i64,
    pub total_deliveries_yesterday: i64,
    pub revenue_yesterday: f64,
    pub active_users_yesterday: i64,
    pub active_webhooks: i64,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct PlanCount {
    pub plan: String,
    pub count: i64,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct RecentSignup {
    pub id: uuid::Uuid,
    pub email: String,
    pub name: Option<String>,
    pub plan: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct RevenueRow {
    pub month: String,
    pub revenue: f64,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct RevenueByPlan {
    pub plan: String,
    pub revenue: f64,
    pub count: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RevenueResponse {
    pub monthly_revenue: Vec<RevenueRow>,
    pub revenue_by_plan: Vec<RevenueByPlan>,
    pub mrr: f64,
    pub churn_rate: f64,
    pub mrr_trend: f64,
    pub collected_revenue: f64,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ChurnedUser {
    pub id: uuid::Uuid,
    pub email: String,
    pub name: Option<String>,
    pub plan: String,
    pub amount: f64,
    pub churn_date: chrono::DateTime<chrono::Utc>,
}

// ── Handlers ──────────────────────────────────────────────

/// GET /v1/admin/stats — System-wide stats (cached 60s in Redis).
///
/// Performance: consolidated from 12 separate queries into 3 batch queries using CTEs.
/// - Query 1: Aggregate counts (users, deliveries, endpoints, revenue, active users)
/// - Query 2: Users by plan breakdown
/// - Query 3: Recent signups
pub async fn system_stats(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(cache_layer): Extension<Option<crate::cache::CacheLayer>>,
) -> Result<Json<SystemStats>, AppError> {
    require_admin(&customer)?;

    if let Some(ref cache) = cache_layer {
        if let Some(cached) = cache.get::<SystemStats>("admin_stats", "all").await {
            return Ok(Json(cached));
        }
    }

    // ── Query 1: All aggregate counts in a single round-trip ──
    #[derive(sqlx::FromRow)]
    struct AggRow {
        total_users: i64,
        total_deliveries: i64,
        total_revenue: f64,
        active_users_today: i64,
        total_endpoints: i64,
        active_endpoints: i64,
        users_yesterday: i64,
        deliveries_yesterday: i64,
        revenue_yesterday: f64,
        active_users_yesterday: i64,
        active_webhooks: i64,
    }

    let agg: AggRow = sqlx::query_as::<_, AggRow>(
        r#"
        WITH
          u_count AS (SELECT COUNT(*) AS c FROM customers),
          d_count AS (SELECT COUNT(*) AS c FROM deliveries),
          rev AS (
            SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0) AS c
            FROM invoices WHERE status = 'paid'
          ),
          active_today AS (
            SELECT COUNT(DISTINCT customer_id) AS c
            FROM deliveries WHERE created_at >= CURRENT_DATE
          ),
          ep AS (
            SELECT
              COUNT(*) AS total,
              COUNT(*) FILTER (WHERE is_active = TRUE) AS active
            FROM endpoints
          ),
          u_yesterday AS (
            SELECT COUNT(*) AS c FROM customers WHERE created_at < CURRENT_DATE
          ),
          d_yesterday AS (
            SELECT COUNT(*) AS c FROM deliveries WHERE created_at < CURRENT_DATE
          ),
          rev_yesterday AS (
            SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0) AS c
            FROM invoices WHERE status = 'paid' AND paid_at < CURRENT_DATE
          ),
          active_yesterday AS (
            SELECT COUNT(DISTINCT customer_id) AS c
            FROM deliveries
            WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
              AND created_at < CURRENT_DATE
          ),
          pending_wh AS (
            SELECT COUNT(*) AS c FROM deliveries WHERE status = 'pending'
          )
        SELECT
          u_count.c                       AS total_users,
          d_count.c                       AS total_deliveries,
          rev.c                           AS total_revenue,
          active_today.c                  AS active_users_today,
          ep.total                        AS total_endpoints,
          ep.active                       AS active_endpoints,
          u_yesterday.c                   AS users_yesterday,
          d_yesterday.c                   AS deliveries_yesterday,
          rev_yesterday.c                 AS revenue_yesterday,
          active_yesterday.c              AS active_users_yesterday,
          pending_wh.c                    AS active_webhooks
        FROM u_count, d_count, rev, active_today, ep,
             u_yesterday, d_yesterday, rev_yesterday,
             active_yesterday, pending_wh
        "#,
    )
    .fetch_one(&pool)
    .await?;

    // ── Query 2: Users by plan ──
    let users_by_plan = sqlx::query_as::<_, PlanCount>(
        "SELECT plan, COUNT(*) as count FROM customers GROUP BY plan ORDER BY count DESC",
    )
    .fetch_all(&pool)
    .await?;

    // ── Query 3: Recent signups ──
    let recent_signups = sqlx::query_as::<_, RecentSignup>(
        "SELECT id, email, name, plan, created_at FROM customers ORDER BY created_at DESC LIMIT 10",
    )
    .fetch_all(&pool)
    .await?;

    let stats = SystemStats {
        total_users: agg.total_users,
        total_deliveries: agg.total_deliveries,
        total_revenue: agg.total_revenue,
        active_users_today: agg.active_users_today,
        total_endpoints: agg.total_endpoints,
        active_endpoints: agg.active_endpoints,
        users_by_plan,
        recent_signups,
        trends: StatsTrends {
            total_users_yesterday: agg.users_yesterday,
            total_deliveries_yesterday: agg.deliveries_yesterday,
            revenue_yesterday: agg.revenue_yesterday,
            active_users_yesterday: agg.active_users_yesterday,
            active_webhooks: agg.active_webhooks,
        },
    };

    if let Some(ref cache) = cache_layer {
        let _ = cache
            .set_with_ttl(
                "admin_stats",
                "all",
                &stats,
                std::time::Duration::from_secs(60),
            )
            .await;
    }

    Ok(Json(stats))
}

/// GET /v1/admin/revenue — Full revenue response (cached 60s in Redis).
///
/// Performance: consolidated from 5 queries into 3:
/// - Query 1: Monthly revenue (last 12 months) + MRR + collected revenue in one scan
/// - Query 2: Revenue by plan
/// - Query 3: Customer counts (total + churned) for churn rate
pub async fn revenue_by_month(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(cache_layer): Extension<Option<crate::cache::CacheLayer>>,
) -> Result<Json<RevenueResponse>, AppError> {
    require_admin(&customer)?;

    if let Some(ref cache) = cache_layer {
        if let Some(cached) = cache
            .get::<RevenueResponse>("admin_revenue", "all")
            .await
        {
            return Ok(Json(cached));
        }
    }

    // ── Query 1: Monthly revenue breakdown (last 12 months) ──
    let monthly_revenue = sqlx::query_as::<_, RevenueRow>(
        r#"SELECT
            TO_CHAR(DATE_TRUNC('month', NOW()) - (n || ' months')::interval, 'YYYY-MM') as month,
            COALESCE(
                (SELECT SUM(amount_cents::double precision / 100.0)
                 FROM invoices
                 WHERE status = 'paid'
                   AND paid_at >= DATE_TRUNC('month', NOW()) - (n || ' months')::interval
                   AND paid_at < DATE_TRUNC('month', NOW()) - ((n - 1) || ' months')::interval),
                0.0
            ) as revenue
        FROM generate_series(0, 11) as n
        ORDER BY month"#,
    )
    .fetch_all(&pool)
    .await?;

    // ── Query 2: Revenue by plan (single scan) ──
    let revenue_by_plan = sqlx::query_as::<_, RevenueByPlan>(
        r#"SELECT
            plan,
            COALESCE(SUM(amount_cents::double precision / 100.0), 0.0) as revenue,
            COUNT(*) as count
        FROM invoices
        WHERE status = 'paid'
          AND paid_at >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
        GROUP BY plan
        ORDER BY revenue DESC"#,
    )
    .fetch_all(&pool)
    .await?;

    // ── Query 3: MRR + collected + customer counts in one CTE ──
    #[derive(sqlx::FromRow)]
    struct RevenueAgg {
        mrr: f64,
        collected_revenue: f64,
        total_customers: i64,
        churned: i64,
    }

    let agg: RevenueAgg = sqlx::query_as::<_, RevenueAgg>(
        r#"
        WITH
          mrr AS (
            SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0) AS v
            FROM invoices
            WHERE status = 'paid' AND paid_at >= DATE_TRUNC('month', NOW())
          ),
          collected AS (
            SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0) AS v
            FROM invoices WHERE status = 'paid'
          ),
          customers AS (
            SELECT COUNT(*) AS total FROM customers
          ),
          churned AS (
            SELECT COUNT(*) AS c
            FROM customers
            WHERE is_active = FALSE AND updated_at >= NOW() - INTERVAL '30 days'
          )
        SELECT
          mrr.v             AS mrr,
          collected.v       AS collected_revenue,
          customers.total   AS total_customers,
          churned.c         AS churned
        FROM mrr, collected, customers, churned
        "#,
    )
    .fetch_one(&pool)
    .await?;

    let churn_rate = if agg.total_customers > 0 {
        (agg.churned as f64 / agg.total_customers as f64) * 100.0
    } else {
        0.0
    };

    let mrr_trend = if monthly_revenue.len() >= 2 {
        let current = monthly_revenue.last().map(|r| r.revenue).unwrap_or(0.0);
        let previous = monthly_revenue[monthly_revenue.len() - 2].revenue;
        if previous > 0.0 {
            ((current - previous) / previous) * 100.0
        } else if current > 0.0 {
            100.0
        } else {
            0.0
        }
    } else {
        0.0
    };

    let revenue_response = RevenueResponse {
        monthly_revenue,
        revenue_by_plan,
        mrr: agg.mrr,
        churn_rate,
        mrr_trend,
        collected_revenue: agg.collected_revenue,
    };

    if let Some(ref cache) = cache_layer {
        let _ = cache
            .set_with_ttl(
                "admin_revenue",
                "all",
                &revenue_response,
                std::time::Duration::from_secs(60),
            )
            .await;
    }

    Ok(Json(revenue_response))
}

/// GET /v1/admin/churn — List users who became inactive in last 30 days.
pub async fn churn_report(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let churned = sqlx::query_as::<_, ChurnedUser>(
        r#"SELECT
            c.id,
            c.email,
            c.name,
            c.plan,
            COALESCE(inv.total_paid, 0.0) as amount,
            c.updated_at as churn_date
        FROM customers c
        LEFT JOIN LATERAL (
            SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0) as total_paid
            FROM invoices
            WHERE customer_id = c.id AND status = 'paid'
        ) inv ON TRUE
        WHERE c.is_active = FALSE
          AND c.updated_at >= NOW() - INTERVAL '30 days'
        ORDER BY c.updated_at DESC
        LIMIT 1000"#,
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(serde_json::json!({ "users": churned })))
}

// ── Tests ──────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_system_stats_serialization() {
        let stats = SystemStats {
            total_users: 500,
            total_deliveries: 10000,
            total_revenue: 25000.0,
            active_users_today: 50,
            total_endpoints: 200,
            active_endpoints: 180,
            users_by_plan: vec![],
            recent_signups: vec![],
            trends: StatsTrends {
                total_users_yesterday: 490,
                total_deliveries_yesterday: 9800,
                revenue_yesterday: 24000.0,
                active_users_yesterday: 45,
                active_webhooks: 12,
            },
        };
        let json = serde_json::to_value(&stats).unwrap();
        assert_eq!(json["total_users"], 500);
        assert_eq!(json["total_revenue"], 25000.0);
        assert_eq!(json["trends"]["active_webhooks"], 12);
    }

    #[test]
    fn test_plan_count_serialization() {
        let pc = PlanCount {
            plan: "pro".to_string(),
            count: 42,
        };
        let json = serde_json::to_value(&pc).unwrap();
        assert_eq!(json["plan"], "pro");
        assert_eq!(json["count"], 42);
    }

    #[test]
    fn test_revenue_response_serialization() {
        let resp = RevenueResponse {
            monthly_revenue: vec![],
            revenue_by_plan: vec![],
            mrr: 1280.0,
            churn_rate: 2.5,
            mrr_trend: 5.0,
            collected_revenue: 2500.0,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["mrr"], 1280.0);
        assert_eq!(json["churn_rate"], 2.5);
        assert_eq!(json["collected_revenue"], 2500.0);
    }

    #[test]
    fn test_churned_user_serialization() {
        let user = ChurnedUser {
            id: uuid::Uuid::new_v4(),
            email: "churned@x.com".to_string(),
            name: None,
            plan: "pro".to_string(),
            amount: 29.0,
            churn_date: chrono::Utc::now(),
        };
        let json = serde_json::to_value(&user).unwrap();
        assert_eq!(json["email"], "churned@x.com");
        assert_eq!(json["amount"], 29.0);
    }
}

    #[test]
    fn test_recent_signup_serialization() {
        let signup = RecentSignup {
            id: uuid::Uuid::new_v4(),
            email: "new@user.com".to_string(),
            name: Some("New User".to_string()),
            plan: "developer".to_string(),
            created_at: chrono::Utc::now(),
        };
        let json = serde_json::to_value(&signup).unwrap();
        assert_eq!(json["email"], "new@user.com");
        assert_eq!(json["plan"], "developer");
    }

    #[test]
    fn test_revenue_by_plan_serialization() {
        let rbp = RevenueByPlan {
            plan: "pro".to_string(),
            revenue: 580.0,
            count: 20,
        };
        let json = serde_json::to_value(&rbp).unwrap();
        assert_eq!(json["plan"], "pro");
        assert_eq!(json["revenue"], 580.0);
        assert_eq!(json["count"], 20);
    }

    #[test]
    fn test_revenue_row_serialization() {
        let row = RevenueRow {
            month: "2024-01".to_string(),
            revenue: 5000.0,
        };
        let json = serde_json::to_value(&row).unwrap();
        assert_eq!(json["month"], "2024-01");
        assert_eq!(json["revenue"], 5000.0);
    }
