//! Cortex API routes — admin-only endpoints for platform-wide intelligence.
//!
//! These endpoints expose the Cortex brain's data: all customers, all endpoints.
//! Only accessible to admin users. The brain sees everything.

use axum::{extract::Extension, Json, routing::get, Router};
use axum::extract::Path;
use sqlx::PgPool;
use uuid::Uuid;
use crate::models::customer::Customer;
use crate::error::AppError;

pub fn router() -> Router {
    Router::new()
        .route("/stats", get(get_hourly_stats))
        .route("/stats/{endpoint_id}", get(get_endpoint_stats))
        .route("/profiles", get(get_profiles))
        .route("/profiles/{endpoint_id}", get(get_endpoint_profile))
        .route("/anomalies", get(get_anomalies))
        .route("/anomalies/high", get(get_high_anomalies))
        .route("/correlations", get(get_correlations))
        .route("/healing/actions", get(get_healing_actions))
        .route("/memory", get(get_action_history))
        .route("/memory/{endpoint_id}/strategy", get(get_strategy_weights))
        .route("/surge/status", get(get_surge_status))
        .route("/predictions", get(get_predictions))
        .route("/predictions/capacity/{endpoint_id}", get(get_capacity_forecast))
        .route("/insights", get(get_insights))
        .route("/reports", get(get_weekly_reports))
        .route("/routing/decisions", get(get_routing_decisions))
        .route("/health", get(get_cortex_health))
}

fn require_admin(c: &Customer) -> Result<(), AppError> {
    if !c.is_admin { return Err(AppError::Forbidden); }
    Ok(())
}

async fn get_hourly_stats(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let stats = sqlx::query_scalar::<_, serde_json::Value>(
        "SELECT jsonb_build_object('endpoint_id', ehs.endpoint_id, 'hour_start', ehs.hour_start, 'total', ehs.total_deliveries, 'ok', ehs.successful, 'fail', ehs.failed, 'avg_ms', ehs.avg_latency_ms, 'p50_ms', ehs.p50_latency_ms, 'p95_ms', ehs.p95_latency_ms, 'p99_ms', ehs.p99_latency_ms, 'errors', ehs.error_breakdown) FROM endpoint_hourly_stats ehs ORDER BY ehs.hour_start DESC LIMIT 200"
    ).fetch_all(&pool).await.unwrap_or_default();
    Ok(Json(serde_json::json!({ "stats": stats })))
}

async fn get_endpoint_stats(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>, Path(eid): Path<Uuid>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let stats = sqlx::query_as::<_, (chrono::DateTime<chrono::Utc>, i32, i32, i32, i32, i32, i32, i32, serde_json::Value)>(
        "SELECT hour_start, total_deliveries, successful, failed, avg_latency_ms, p50_latency_ms, p95_latency_ms, p99_latency_ms, error_breakdown FROM endpoint_hourly_stats WHERE endpoint_id = $1 ORDER BY hour_start DESC LIMIT 168"
    ).bind(eid).fetch_all(&pool).await.unwrap_or_default();
    Ok(Json(serde_json::json!({ "endpoint_id": eid, "stats": stats })))
}

async fn get_profiles(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let profiles = sqlx::query_scalar::<_, serde_json::Value>(
        "SELECT row_to_json(ep) FROM endpoint_profiles ep ORDER BY ep.updated_at DESC LIMIT 200"
    ).fetch_all(&pool).await.unwrap_or_default();
    Ok(Json(serde_json::json!({ "profiles": profiles })))
}

async fn get_endpoint_profile(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>, Path(eid): Path<Uuid>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let profile = sqlx::query_scalar::<_, serde_json::Value>(
        "SELECT row_to_json(ep) FROM endpoint_profiles ep WHERE ep.endpoint_id = $1"
    ).bind(eid).fetch_optional(&pool).await.unwrap_or(None);
    Ok(Json(serde_json::json!({ "profile": profile })))
}

async fn get_anomalies(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let rows = sqlx::query_as::<_, (i64, Uuid, Uuid, i32, serde_json::Value, String, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, endpoint_id, customer_id, score, factors, category, created_at FROM anomaly_scores ORDER BY created_at DESC LIMIT 100"
    ).fetch_all(&pool).await.unwrap_or_default();
    Ok(Json(serde_json::json!({ "anomalies": rows })))
}

async fn get_high_anomalies(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let rows = sqlx::query_as::<_, (i64, Uuid, Uuid, i32, serde_json::Value, String, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, endpoint_id, customer_id, score, factors, category, created_at FROM anomaly_scores WHERE score > 70 ORDER BY score DESC LIMIT 50"
    ).fetch_all(&pool).await.unwrap_or_default();
    Ok(Json(serde_json::json!({ "high_anomalies": rows })))
}

async fn get_correlations(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let rows = sqlx::query_as::<_, (i64, Option<String>, serde_json::Value, i32, String, bool, chrono::DateTime<chrono::Utc>, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, root_cause, affected_endpoints, alert_count, severity, resolved, first_seen, last_seen FROM alert_correlations ORDER BY last_seen DESC LIMIT 50"
    ).fetch_all(&pool).await.unwrap_or_default();
    Ok(Json(serde_json::json!({ "correlations": rows })))
}

async fn get_healing_actions(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let rows = sqlx::query_as::<_, (i64, Uuid, String, Option<String>, serde_json::Value, String, serde_json::Value, chrono::DateTime<chrono::Utc>, Option<chrono::DateTime<chrono::Utc>>)>(
        "SELECT id, endpoint_id, action_type, reason, details, outcome, outcome_details, created_at, resolved_at FROM healing_actions ORDER BY created_at DESC LIMIT 100"
    ).fetch_all(&pool).await.unwrap_or_default();
    Ok(Json(serde_json::json!({ "actions": rows })))
}

async fn get_action_history(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let rows = sqlx::query_as::<_, (i64, Uuid, Option<Uuid>, String, Option<String>, serde_json::Value, String, serde_json::Value, Option<i32>, Option<f64>, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, endpoint_id, customer_id, action_type, reason, context, outcome, outcome_details, time_to_resolution_secs, success_score, created_at FROM cortex_action_history ORDER BY created_at DESC LIMIT 200"
    ).fetch_all(&pool).await.unwrap_or_default();
    Ok(Json(serde_json::json!({ "history": rows })))
}

async fn get_strategy_weights(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>, Path(eid): Path<Uuid>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let rows = sqlx::query_as::<_, (Uuid, String, i32, i32, f64, f64, Option<chrono::DateTime<chrono::Utc>>)>(
        "SELECT endpoint_id, strategy_name, attempts, successes, avg_resolution_secs, weight, last_used FROM endpoint_strategy_weights WHERE endpoint_id = $1 ORDER BY weight DESC"
    ).bind(eid).fetch_all(&pool).await.unwrap_or_default();
    Ok(Json(serde_json::json!({ "strategies": rows })))
}

async fn get_surge_status(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let rows = sqlx::query_as::<_, (i64, Uuid, Option<String>, i32, i32, i32, f64, f64, i32, i32, String, chrono::DateTime<chrono::Utc>, Option<chrono::DateTime<chrono::Utc>>)>(
        "SELECT id, endpoint_id, trigger_reason, queued_count, processed_count, failed_count, current_rate_per_min, target_rate_per_min, ramp_step, total_steps, status, started_at, completed_at FROM recovery_surges ORDER BY started_at DESC LIMIT 50"
    ).fetch_all(&pool).await.unwrap_or_default();
    Ok(Json(serde_json::json!({ "surges": rows })))
}

async fn get_predictions(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let rows = sqlx::query_as::<_, (i64, Uuid, Option<Uuid>, String, f64, serde_json::Value, i32, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, endpoint_id, customer_id, prediction_type, probability, factors, time_horizon_mins, created_at FROM predictions ORDER BY created_at DESC LIMIT 100"
    ).fetch_all(&pool).await.unwrap_or_default();
    Ok(Json(serde_json::json!({ "predictions": rows })))
}

async fn get_capacity_forecast(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>, Path(eid): Path<Uuid>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let forecast = crate::cortex::predictive_engine::capacity_forecast(&pool, eid).await.unwrap_or(None);
    Ok(Json(serde_json::json!({ "forecast": forecast })))
}

async fn get_insights(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let rows = sqlx::query_as::<_, (i64, Option<Uuid>, String, String, Option<String>, String, Option<String>, serde_json::Value, bool, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, customer_id, insight_type, title, body, severity, action_url, data, dismissed, created_at FROM cortex_insights WHERE dismissed = false ORDER BY created_at DESC LIMIT 100"
    ).fetch_all(&pool).await.unwrap_or_default();
    Ok(Json(serde_json::json!({ "insights": rows })))
}

async fn get_weekly_reports(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let rows = sqlx::query_as::<_, (i64, Uuid, chrono::NaiveDate, serde_json::Value, Option<chrono::DateTime<chrono::Utc>>, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, customer_id, week_start, report, sent_at, created_at FROM weekly_reports ORDER BY week_start DESC LIMIT 50"
    ).fetch_all(&pool).await.unwrap_or_default();
    Ok(Json(serde_json::json!({ "reports": rows })))
}

async fn get_routing_decisions(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let rows = sqlx::query_as::<_, (i64, Uuid, Option<String>, Option<String>, serde_json::Value, Option<i32>, Option<bool>, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, endpoint_id, selected_url, reason, alternatives, latency_ms, success, created_at FROM routing_decisions ORDER BY created_at DESC LIMIT 100"
    ).fetch_all(&pool).await.unwrap_or_default();
    Ok(Json(serde_json::json!({ "decisions": rows })))
}

async fn get_cortex_health(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let stats_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM endpoint_hourly_stats").fetch_one(&pool).await.unwrap_or((0,));
    let profiles_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM endpoint_profiles").fetch_one(&pool).await.unwrap_or((0,));
    let anomalies_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM anomaly_scores WHERE created_at > NOW() - INTERVAL '24 hours'").fetch_one(&pool).await.unwrap_or((0,));
    let healing_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM healing_actions WHERE created_at > NOW() - INTERVAL '24 hours'").fetch_one(&pool).await.unwrap_or((0,));
    let memory_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM cortex_action_history").fetch_one(&pool).await.unwrap_or((0,));
    let predictions_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM predictions WHERE created_at > NOW() - INTERVAL '24 hours'").fetch_one(&pool).await.unwrap_or((0,));
    let insights_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM cortex_insights WHERE dismissed = false").fetch_one(&pool).await.unwrap_or((0,));

    Ok(Json(serde_json::json!({
        "status": "healthy",
        "metrics": {
            "hourly_stats_total": stats_count.0,
            "profiles_total": profiles_count.0,
            "anomalies_24h": anomalies_count.0,
            "healing_actions_24h": healing_count.0,
            "action_memory_total": memory_count.0,
            "predictions_24h": predictions_count.0,
            "active_insights": insights_count.0,
        },
    })))
}
