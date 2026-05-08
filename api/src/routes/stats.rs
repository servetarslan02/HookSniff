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
