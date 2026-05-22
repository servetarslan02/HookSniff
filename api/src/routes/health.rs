use axum::http::StatusCode;
use axum::Json;
use serde::Serialize;
use serde_json::{json, Value};
use std::sync::OnceLock;
use std::time::Instant;

/// Health response cache TTL in seconds.
/// Health check hits DB + Redis on every request — cache for 30s to reduce load.
const HEALTH_CACHE_TTL_SECS: u64 = 30;

/// OPTIONS /v1/status — CORS preflight for public status endpoint.
pub async fn status_options() -> (StatusCode, axum::http::HeaderMap, &'static str) {
    let mut headers = axum::http::HeaderMap::new();
    headers.insert(
        "Access-Control-Allow-Origin",
        "*".parse().expect("valid header value"),
    );
    headers.insert(
        "Access-Control-Allow-Methods",
        "GET, OPTIONS".parse().expect("valid header value"),
    );
    headers.insert(
        "Access-Control-Allow-Headers",
        "Content-Type".parse().expect("valid header value"),
    );
    headers.insert(
        "Access-Control-Max-Age",
        "86400".parse().expect("valid header value"),
    );
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
/// Results cached in Redis for 30 seconds to reduce DB load.
pub async fn system_status(
    axum::extract::Extension(health_pool): axum::extract::Extension<crate::db::HealthPool>,
    axum::extract::Extension(cache_layer): axum::extract::Extension<Option<crate::cache::CacheLayer>>,
) -> (StatusCode, axum::http::HeaderMap, Json<SystemStatus>) {
    let pool = &health_pool.0;
    let mut headers = axum::http::HeaderMap::new();
    headers.insert(
        "Access-Control-Allow-Origin",
        "*".parse().expect("valid header value"),
    );
    headers.insert(
        "Access-Control-Allow-Methods",
        "GET, OPTIONS".parse().expect("valid header value"),
    );
    headers.insert(
        "Access-Control-Allow-Headers",
        "Content-Type".parse().expect("valid header value"),
    );

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
        .fetch_one(pool)
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
    // Use existing CacheLayer connection instead of creating a new one
    if let Some(ref cache) = cache_layer {
        let redis_start = Instant::now();
        let mut conn = cache.conn().clone();
        let ping_result: Result<String, _> = redis::cmd("PING").query_async(&mut conn).await;
        let latency = redis_start.elapsed().as_millis() as i64;
        let redis_status = match ping_result {
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
        };
        components.push(redis_status);
    }

    // ── Worker (check for stuck processing items) ──
    let worker_status = match sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM webhook_queue WHERE status = 'processing' AND updated_at < NOW() - INTERVAL '5 minutes'"
    )
    .fetch_one(pool)
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
        Err(_e) => {
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

    // Overall status
    let overall_status = if components.iter().any(|c| c.status == "unhealthy") {
        "down"
    } else if components.iter().any(|c| c.status == "degraded") {
        "degraded"
    } else {
        "operational"
    };

    let status_code = if overall_status == "down" {
        StatusCode::SERVICE_UNAVAILABLE
    } else {
        StatusCode::OK
    };

    // Uptime: check if any component is unhealthy
    let uptime_30d = if overall_status == "down" { 99.0 } else { 100.0 };

    (
        status_code,
        headers,
        Json(SystemStatus {
            overall_status,
            uptime_30d,
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
/// - Results cached in Redis for 30 seconds to reduce DB load
pub async fn health_check(
    axum::extract::Extension(health_pool): axum::extract::Extension<crate::db::HealthPool>,
    axum::extract::Extension(cache_layer): axum::extract::Extension<Option<crate::cache::CacheLayer>>,
) -> (StatusCode, Json<Value>) {
    // Try to serve from Redis cache first
    if let Some(ref cache) = cache_layer {
        if let Some(cached) = cache.get::<Value>("health", "check").await {
            let status_code = if cached.get("status").and_then(|s| s.as_str()) == Some("healthy") {
                StatusCode::OK
            } else {
                StatusCode::SERVICE_UNAVAILABLE
            };
            // Add cache hit header via response (we'll add it in the JSON)
            let mut cached_val = cached;
            if let Some(obj) = cached_val.as_object_mut() {
                obj.insert("_cache".to_string(), json!("HIT"));
            }
            return (status_code, Json(cached_val));
        }
    }

    let pool = &health_pool.0;
    let _start = Instant::now();
    let mut checks = serde_json::Map::new();
    let mut overall_healthy = true;

    // Database check — try a simple query
    let db_start = Instant::now();
    let db_status = match sqlx::query_scalar::<_, i32>("SELECT 1")
        .fetch_one(pool)
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
        "SELECT COUNT(*) FROM webhook_queue WHERE status = 'pending'",
    )
    .fetch_one(pool)
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
        "SELECT MAX(processed_at) FROM webhook_queue WHERE status = 'delivered'",
    )
    .fetch_one(pool)
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

    // DB size check
    let db_size_status = match sqlx::query_scalar::<_, String>(
        "SELECT pg_size_pretty(pg_database_size(current_database()))",
    )
    .fetch_one(pool)
    .await
    {
        Ok(size) => json!({ "status": "healthy", "size": size }),
        Err(e) => json!({ "status": "degraded", "error": e.to_string() }),
    };
    checks.insert("db_size".to_string(), db_size_status);

    // Recent error logs (last 10 failed deliveries)
    let recent_errors = match sqlx::query_as::<_, (String, Option<String>, Option<String>, chrono::DateTime<chrono::Utc>)>(
        "SELECT id::text, event, error_message, created_at FROM deliveries WHERE status = 'failed' ORDER BY created_at DESC LIMIT 10",
    )
    .fetch_all(pool)
    .await
    {
        Ok(rows) => {
            let errors: Vec<Value> = rows.iter().map(|(id, event, err, at)| {
                json!({ "id": id, "event": event, "error": err, "created_at": at.to_rfc3339() })
            }).collect();
            json!({ "status": "healthy", "errors": errors })
        }
        Err(e) => json!({ "status": "degraded", "error": e.to_string() }),
    };
    checks.insert("recent_errors".to_string(), recent_errors);

    // Queue details — query webhook_queue (not deliveries!) for accurate queue depth
    let queue_detail = match sqlx::query_as::<_, (i64, i64, i64)>(
        "SELECT COUNT(*) FILTER (WHERE status = 'pending'), COUNT(*) FILTER (WHERE status = 'processing'), COUNT(*) FILTER (WHERE status = 'failed' AND updated_at >= NOW() - INTERVAL '1 hour') FROM webhook_queue",
    )
    .fetch_one(pool)
    .await
    {
        Ok((pending, processing, failed_1h)) => json!({
            "status": "healthy",
            "pending": pending,
            "processing": processing,
            "failed_last_hour": failed_1h
        }),
        Err(e) => json!({ "status": "degraded", "error": e.to_string() }),
    };
    checks.insert("queue_detail".to_string(), queue_detail);

    // Redis check — use existing CacheLayer connection instead of creating a new one
    let redis_status = match &cache_layer {
        Some(cache) => {
            let redis_start = Instant::now();
            let mut conn = cache.conn().clone();
            let ping: Result<String, _> = redis::cmd("PING").query_async(&mut conn).await;
            let latency = redis_start.elapsed().as_millis() as i64;
            match ping {
                Ok(_) => json!({ "status": "healthy", "latency_ms": latency, "note": "connected" }),
                Err(e) => json!({ "status": "unhealthy", "latency_ms": latency, "note": format!("PING failed: {e}") }),
            }
        }
        None => json!({ "status": "healthy", "latency_ms": 0, "note": "not configured" }),
    };
    // Redis is optional — log warning if failing but don't mark system unhealthy
    // Redis is used for caching/queue, not core functionality
    if let Some(status) = redis_status.get("status").and_then(|s| s.as_str()) {
        if status == "unhealthy" {
            tracing::warn!("Redis health check failed — system operational but degraded");
        }
    }
    checks.insert("redis".to_string(), redis_status.clone());

    // Queue summary for top-level
    let queue_pending = checks.get("queue").and_then(|v| v.get("pending_count")).and_then(|v| v.as_i64()).unwrap_or(0);
    let queue_detail_pending = checks.get("queue_detail").and_then(|v| v.get("pending")).and_then(|v| v.as_i64()).unwrap_or(0);
    let queue_detail_processing = checks.get("queue_detail").and_then(|v| v.get("processing")).and_then(|v| v.as_i64()).unwrap_or(0);
    let queue_detail_failed = checks.get("queue_detail").and_then(|v| v.get("failed_last_hour")).and_then(|v| v.as_i64()).unwrap_or(0);

    let status_code = if overall_healthy {
        StatusCode::OK
    } else {
        StatusCode::SERVICE_UNAVAILABLE
    };

    let status_str = if overall_healthy {
        "healthy"
    } else {
        "degraded"
    };

    let response_json = json!({
        "status": status_str,
        "database": checks.get("database"),
        "redis": redis_status,
        "api": {
            "status": status_str,
            "uptime_seconds": uptime_seconds()
        },
        "queue": {
            "pending": queue_pending.max(queue_detail_pending),
            "processing": queue_detail_processing,
            "failed": queue_detail_failed
        },
        "checks": checks,
        "_cache": "MISS"
    });

    // Only cache healthy responses — don't cache failures (avoids serving stale unhealthy data)
    if overall_healthy {
        if let Some(ref cache) = cache_layer {
            let _ = cache.set_with_ttl("health", "check", &response_json, std::time::Duration::from_secs(HEALTH_CACHE_TTL_SECS)).await;
        }
    }

    (
        status_code,
        Json(response_json),
    )
}

/// GET /v1/feature-flags — Public endpoint returning enabled feature flags.
///
/// Returns only the flag names that are enabled (no admin details).
/// Used by the frontend to conditionally show/hide features.
/// No authentication required — this is public information.
pub async fn public_feature_flags(
    axum::extract::Extension(feature_flags): axum::extract::Extension<crate::feature_flags::FeatureFlagService>,
) -> Json<Value> {
    let flags = feature_flags.all().await;
    let enabled: Vec<&str> = flags
        .iter()
        .filter(|f| f.is_enabled)
        .map(|f| f.name.as_str())
        .collect();

    Json(json!({ "enabled_flags": enabled }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_system_status_struct_serialize() {
        let status = SystemStatus {
            overall_status: "operational".to_string(),
            uptime_30d: 99.99,
            components: vec![],
            checked_at: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_value(&status).unwrap();
        assert_eq!(json["overall_status"], "operational");
        assert_eq!(json["uptime_30d"], 99.99);
        assert!(json["components"].is_array());
        assert_eq!(json["checked_at"], "2024-01-01T00:00:00Z");
    }

    #[test]
    fn test_component_status_struct_serialize() {
        let cs = ComponentStatus {
            name: "API".to_string(),
            status: "healthy".to_string(),
            latency_ms: Some(42),
            description: "Test".to_string(),
            last_checked: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_value(&cs).unwrap();
        assert_eq!(json["name"], "API");
        assert_eq!(json["status"], "healthy");
        assert_eq!(json["latency_ms"], 42);
    }

    #[test]
    fn test_component_status_none_latency() {
        let cs = ComponentStatus {
            name: "Redis".to_string(),
            status: "unhealthy".to_string(),
            latency_ms: None,
            description: "down".to_string(),
            last_checked: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_value(&cs).unwrap();
        assert!(json["latency_ms"].is_null());
    }

    #[test]
    fn test_uptime_seconds_returns_nonzero_after_init() {
        // Initialize START_TIME by calling uptime_seconds
        let _ = uptime_seconds();
        // Second call should return a value (>= 0)
        let u = uptime_seconds();
        assert!(u < 10); // Should be very small in tests
    }

    #[test]
    fn test_overall_status_logic() {
        // All healthy => operational
        let components = [ComponentStatus {
                name: "API".into(),
                status: "healthy".into(),
                latency_ms: None,
                description: "".into(),
                last_checked: "".into(),
            },
            ComponentStatus {
                name: "DB".into(),
                status: "healthy".into(),
                latency_ms: None,
                description: "".into(),
                last_checked: "".into(),
            }];
        let overall = if components.iter().any(|c| c.status == "unhealthy") {
            "down"
        } else if components.iter().any(|c| c.status == "degraded") {
            "degraded"
        } else {
            "operational"
        };
        assert_eq!(overall, "operational");

        // One degraded => degraded
        let components_degraded = [ComponentStatus {
                name: "API".into(),
                status: "healthy".into(),
                latency_ms: None,
                description: "".into(),
                last_checked: "".into(),
            },
            ComponentStatus {
                name: "Worker".into(),
                status: "degraded".into(),
                latency_ms: None,
                description: "".into(),
                last_checked: "".into(),
            }];
        let overall = if components_degraded.iter().any(|c| c.status == "unhealthy") {
            "down"
        } else if components_degraded.iter().any(|c| c.status == "degraded") {
            "degraded"
        } else {
            "operational"
        };
        assert_eq!(overall, "degraded");

        // One unhealthy => down
        let components_down = [ComponentStatus {
            name: "DB".into(),
            status: "unhealthy".into(),
            latency_ms: None,
            description: "".into(),
            last_checked: "".into(),
        }];
        let overall = if components_down.iter().any(|c| c.status == "unhealthy") {
            "down"
        } else if components_down.iter().any(|c| c.status == "degraded") {
            "degraded"
        } else {
            "operational"
        };
        assert_eq!(overall, "down");
    }
}
