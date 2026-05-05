use axum::Json;
use serde_json::{json, Value};
use std::time::Instant;

pub async fn health_check(
    axum::extract::Extension(pool): axum::extract::Extension<sqlx::PgPool>,
    axum::extract::Extension(kafka_producer): axum::extract::Extension<rdkafka::producer::FutureProducer>,
) -> Json<Value> {
    let start = Instant::now();
    let mut checks = serde_json::Map::new();
    let mut overall_healthy = true;

    // Database check
    let db_start = Instant::now();
    let db_status = match sqlx::query("SELECT 1").execute(&pool).await {
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

    // Kafka check (via client metadata)
    let kafka_start = Instant::now();
    let kafka_status = match kafka_producer.client().fetch_metadata(None, std::time::Duration::from_secs(3)) {
        Ok(_) => {
            let latency = kafka_start.elapsed().as_millis() as u64;
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
    checks.insert("kafka".to_string(), kafka_status);

    let status = if overall_healthy { "healthy" } else { "degraded" };

    Json(json!({
        "status": status,
        "version": env!("CARGO_PKG_VERSION"),
        "uptime_seconds": start.elapsed().as_secs(),
        "checks": checks
    }))
}
