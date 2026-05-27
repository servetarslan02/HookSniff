use axum::extract::Extension;
use axum::routing::get;
use axum::{Json, Router};
use serde::Serialize;
use sqlx::PgPool;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new().route("/", get(get_stats))
}

#[derive(Debug, Serialize)]
pub struct StatsResponse {
    pub total_deliveries: i64,
    pub delivered: i64,
    pub failed: i64,
    pub pending: i64,
    pub success_rate: f64,
    pub endpoints_count: i64,
}

async fn get_stats(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<StatsResponse>, AppError> {
    // RBAC: viewer or higher required to view stats
    super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;

    // Single query: delivery counts + endpoint count via CTE
    #[derive(sqlx::FromRow)]
    struct StatsRow {
        total: i64,
        delivered: i64,
        failed: i64,
        pending: i64,
        endpoints_count: i64,
    }

    let row: StatsRow = sqlx::query_as::<_, StatsRow>(
        r#"
        WITH
          delivery_stats AS (
            SELECT
              COUNT(*)                                    AS total,
              COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
              COUNT(*) FILTER (WHERE status = 'failed')    AS failed,
              COUNT(*) FILTER (WHERE status = 'pending')   AS pending
            FROM deliveries WHERE customer_id = $1
          ),
          ep_count AS (
            SELECT COUNT(*) AS c FROM endpoints WHERE customer_id = $1
          )
        SELECT
          delivery_stats.total,
          delivery_stats.delivered,
          delivery_stats.failed,
          delivery_stats.pending,
          ep_count.c AS endpoints_count
        FROM delivery_stats, ep_count
        "#,
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    let success_rate = if row.total > 0 {
        (row.delivered as f64 / row.total as f64) * 100.0
    } else {
        100.0
    };

    Ok(Json(StatsResponse {
        total_deliveries: row.total,
        delivered: row.delivered,
        failed: row.failed,
        pending: row.pending,
        success_rate,
        endpoints_count: row.endpoints_count,
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_router_construction() {
        let _r = router();
    }

    #[test]
    fn test_stats_response_serialize() {
        let resp = StatsResponse {
            total_deliveries: 1000,
            delivered: 950,
            failed: 40,
            pending: 10,
            success_rate: 95.0,
            endpoints_count: 5,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["total_deliveries"], 1000);
        assert_eq!(json["delivered"], 950);
        assert_eq!(json["failed"], 40);
        assert_eq!(json["pending"], 10);
        assert_eq!(json["success_rate"], 95.0);
        assert_eq!(json["endpoints_count"], 5);
    }

    #[test]
    fn test_stats_response_debug() {
        let resp = StatsResponse {
            total_deliveries: 0,
            delivered: 0,
            failed: 0,
            pending: 0,
            success_rate: 100.0,
            endpoints_count: 0,
        };
        let debug = format!("{:?}", resp);
        assert!(debug.contains("StatsResponse"));
    }

    #[test]
    fn test_success_rate_calculation() {
        // With deliveries
        let total = 100i64;
        let delivered = 95i64;
        let rate = if total > 0 {
            (delivered as f64 / total as f64) * 100.0
        } else {
            100.0
        };
        assert_eq!(rate, 95.0);

        // No deliveries
        let total = 0i64;
        let rate = if total > 0 {
            (delivered as f64 / total as f64) * 100.0
        } else {
            100.0
        };
        assert_eq!(rate, 100.0);
    }
}
