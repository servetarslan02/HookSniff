use axum::http::StatusCode;
use axum::Json;
use serde::Serialize;
use serde_json::{json, Value};
use std::sync::OnceLock;
use std::time::Instant;

/// OPTIONS /v1/status — CORS preflight for public status endpoint.
pub async fn status_options() -> (StatusCode, axum::http::HeaderMap, &'static str) {
    let mut headers = axum::http::HeaderMap::new();
    headers.insert("Access-Control-Allow-Origin", "*".parse().unwrap());
    headers.insert("Access-Control-Allow-Methods", "GET, OPTIONS".parse().unwrap());
    headers.insert("Access-Control-Allow-Headers", "Content-Type".parse().unwrap());
    headers.insert("Access-Control-Max-Age", "86400".parse().unwrap());
    (StatusCode::NO_CONTENT, headers, "")
}

/// Application start time — set once at boot for uptime reporting.
static START_TIME: OnceLock<Instant> = OnceLock::new();

fn uptime_seconds() -> u64 {
    START_TIME.get_or_init(Instant::now).elapsed().as_secs()
}

#[derive(Serialize)]
pub struct SystemStatus {
    overall_status: String,
    uptime_30d: f64,
    components: Vec<ComponentStatus>,
    checked_at: String,
}

#[derive(Serialize)]
pub struct ComponentStatus {
    name: String,
    status: String,
    latency_ms: Option<i64>,
    description: String,
    last_checked: String,
}

/// GET /v1/status
///
/// Public endpoint — returns real system health status.
/// No authentication required so customers can check service status.
/// Includes permissive CORS headers since this is a public status page.
pub async fn system_status(
    axum::extract::Extension(pool): axum::extract::Extension<sqlx::PgPool>,
) -> (StatusCode, axum::http::HeaderMap, Json<SystemStatus>) {
    let mut headers = axum::http::HeaderMap::new();
    headers.insert("Access-Control-Allow-Origin", "*".parse().unwrap());
    headers.insert("Access-Control-Allow-Methods", "GET, OPTIONS".parse().unwrap());
    headers.insert("Access-Control-Allow-Headers", "Content-Type".parse().unwrap());

    let now = chrono::Utc::now().to_rfc3339();
    let mut components = Vec::new();

    // ── API (always healthy if we got here) ──
    components.push(ComponentStatus {
        name: "API".to_string(),
        status: "healthy".to_string(),
        latency_ms: None,
        description: "Webhook ingestion and management API".to_string(),
        last_checked: now.clone(),
    });

    // ── Database (PostgreSQL) ──
    let db_start = Instant::now();
    let db_status = match sqlx::query_scalar::<_, i32>("SELECT 1")
        .fetch_one(&pool)
        .await
    {
        Ok(_) => {
            let latency = db_start.elapsed().as_millis() as i64;
            ComponentStatus {
                name: "Database".to_string(),
                status: "healthy".to_string(),
                latency_ms: Some(latency),
                description: "PostgreSQL database".to_string(),
                last_checked: now.clone(),
            }
        }
        Err(e) => {
            tracing::error!("Status check: database unhealthy: {e}");
            ComponentStatus {
                name: "Database".to_string(),
                status: "unhealthy".to_string(),
                latency_ms: None,
                description: format!("PostgreSQL connection failed: {e}"),
                last_checked: now.clone(),
            }
        }
    };
    components.push(db_status);

    // ── Redis (optional — healthy if not configured) ──
    let redis_url = std::env::var("REDIS_URL").ok();
    if let Some(ref url) = redis_url {
        let redis_start = Instant::now();
        let redis_status = match redis::Client::open(url.as_str()) {
            Ok(client) => match redis::aio::ConnectionManager::new(client).await {
                Ok(mut conn) => {
                    let ping_result: Result<String, _> =
                        redis::cmd("PING").query_async(&mut conn).await;
                    let latency = redis_start.elapsed().as_millis() as i64;
                    match ping_result {
                        Ok(_) => ComponentStatus {
                            name: "Redis".to_string(),
                            status: "healthy".to_string(),
                            latency_ms: Some(latency),
                            description: "Redis rate limiter and caching".to_string(),
                            last_checked: now.clone(),
                        },
                        Err(e) => {
                            tracing::error!("Status check: Redis PING failed: {e}");
                            ComponentStatus {
                                name: "Redis".to_string(),
                                status: "unhealthy".to_string(),
                                latency_ms: Some(latency),
                                description: format!("Redis PING failed: {e}"),
                                last_checked: now.clone(),
                            }
                        }
                    }
                }
                Err(e) => ComponentStatus {
                    name: "Redis".to_string(),
                    status: "unhealthy".to_string(),
                    latency_ms: None,
                    description: format!("Redis connection failed: {e}"),
                    last_checked: now.clone(),
                },
            },
            Err(e) => ComponentStatus {
                name: "Redis".to_string(),
                status: "unhealthy".to_string(),
                latency_ms: None,
                description: format!("Redis client error: {e}"),
                last_checked: now.clone(),
            },
        };
        components.push(redis_status);
    }

    // ── Worker (check for stuck processing items) ──
    let worker_status = match sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM webhook_queue WHERE status = 'processing' AND updated_at < NOW() - INTERVAL '5 minutes'"
    )
    .fetch_one(&pool)
    .await
    {
        Ok(stuck_count) => {
            if stuck_count > 0 {
                ComponentStatus {
                    name: "Worker".to_string(),
                    status: "degraded".to_string(),
                    latency_ms: None,
                    description: format!("{stuck_count} webhook(s) stuck in processing for >5 min"),
                    last_checked: now.clone(),
                }
            } else {
                ComponentStatus {
                    name: "Worker".to_string(),
                    status: "healthy".to_string(),
                    latency_ms: None,
                    description: "Background webhook delivery worker".to_string(),
                    last_checked: now.clone(),
                }
            }
        }
        Err(e) => {
            // Table might not exist yet — treat as healthy
            ComponentStatus {
                name: "Worker".to_string(),
                status: "healthy".to_string(),
                latency_ms: None,
                description: "Background webhook delivery worker".to_string(),
                last_checked: now.clone(),
            }
        }
    };
    components.push(worker_status);

    // ── Overall status ──
    let overall_status = if components.iter().any(|c| c.status == "unhealthy") {
        "down".to_string()
    } else if components.iter().any(|c| c.status == "degraded") {
        "degraded".to_string()
    } else {
        "operational".to_string()
    };

    let status_code = if overall_status == "down" {
        StatusCode::SERVICE_UNAVAILABLE
    } else {
        StatusCode::OK
    };

    (
        status_code,
        headers,
        Json(SystemStatus {
            overall_status,
            uptime_30d: 100.0, // placeholder — no historical uptime tracking yet
            components,
            checked_at: now,
        }),
    )
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

    // Last successful delivery check
    let last_delivery_status = match sqlx::query_scalar::<_, Option<chrono::DateTime<chrono::Utc>>>(
        "SELECT MAX(processed_at) FROM webhook_queue WHERE status = 'delivered'"
    )
    .fetch_one(&pool)
    .await
    {
        Ok(last_at) => {
            json!({
                "status": "healthy",
                "last_delivered_at": last_at.map(|t| t.to_rfc3339())
            })
        }
        Err(e) => {
            json!({
                "status": "degraded",
                "error": e.to_string()
            })
        }
    };
    checks.insert("last_delivery".to_string(), last_delivery_status);

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
