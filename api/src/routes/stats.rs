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
    // RBAC: analyst or higher required to view stats
    super::teams::check_user_team_role(&pool, customer.id, "analyst").await?;

    let stats: (i64, i64, i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'delivered'),
            COUNT(*) FILTER (WHERE status = 'failed'),
            COUNT(*) FILTER (WHERE status = 'pending')
        FROM deliveries WHERE customer_id = $1
        "#,
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    let endpoints_count: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM endpoints WHERE customer_id = $1")
            .bind(customer.id)
            .fetch_one(&pool)
            .await?;

    let success_rate = if stats.0 > 0 {
        (stats.1 as f64 / stats.0 as f64) * 100.0
    } else {
        100.0
    };

    Ok(Json(StatsResponse {
        total_deliveries: stats.0,
        delivered: stats.1,
        failed: stats.2,
        pending: stats.3,
        success_rate,
        endpoints_count: endpoints_count.0,
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
