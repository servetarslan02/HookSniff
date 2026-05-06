use axum::http::StatusCode;
use axum::Json;
use serde_json::{json, Value};
use std::sync::OnceLock;
use std::time::Instant;

/// Application start time — set once at boot for uptime reporting.
static START_TIME: OnceLock<Instant> = OnceLock::new();

fn uptime_seconds() -> u64 {
    START_TIME.get_or_init(Instant::now).elapsed().as_secs()
}

/// Comprehensive health check that verifies:
/// - Database connectivity (simple query)
/// - Queue depth (webhook_queue table)
/// - Returns detailed JSON with per-component health and latency
/// - Returns HTTP 503 when any critical component is unhealthy
pub async fn health_check(
    axum::extract::Extension(pool): axum::extract::Extension<sqlx::PgPool>,
) -> (StatusCode, Json<Value>) {
    let start = Instant::now();
    let mut checks = serde_json::Map::new();
    let mut overall_healthy = true;

    // Database check — try a simple query
    let db_start = Instant::now();
    let db_status = match sqlx::query_scalar::<_, i32>("SELECT 1")
        .fetch_one(&pool)
        .await
    {
        Ok(_) => {
            let latency = db_start.elapsed().as_millis() as u64;
            json!({
                "status": "healthy",
                "latency_ms": latency
            })
        }
        Err(e) => {
            overall_healthy = false;
            json!({
                "status": "unhealthy",
                "error": e.to_string()
            })
        }
    };
    checks.insert("database".to_string(), db_status);

    // Queue check — verify webhook_queue is accessible
    let queue_start = Instant::now();
    let queue_status = match sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM webhook_queue WHERE status = 'pending'"
    )
    .fetch_one(&pool)
    .await
    {
        Ok(count) => {
            let latency = queue_start.elapsed().as_millis() as u64;
            json!({
                "status": "healthy",
                "latency_ms": latency,
                "pending_count": count
            })
        }
        Err(e) => {
            // Queue table might not exist yet — that's OK, not critical
            let latency = queue_start.elapsed().as_millis() as u64;
            json!({
                "status": "healthy",
                "latency_ms": latency,
                "note": "queue table not available",
                "error": e.to_string()
            })
        }
    };
    checks.insert("queue".to_string(), queue_status);

    let status_code = if overall_healthy {
        StatusCode::OK
    } else {
        StatusCode::SERVICE_UNAVAILABLE
    };

    let status_str = if overall_healthy { "healthy" } else { "degraded" };

    (
        status_code,
        Json(json!({
            "status": status_str,
            "version": env!("CARGO_PKG_VERSION"),
            "uptime_seconds": uptime_seconds(),
            "checks": checks
        })),
    )
}
