//! Cortex API routes — read-only endpoints for all cortex data.

use axum::{extract::Extension, Json, routing::get, Router};
use axum::extract::Path;
use sqlx::PgPool;
use uuid::Uuid;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        // Stage 1: Hourly Stats
        .route("/stats", get(get_hourly_stats))
        .route("/stats/{endpoint_id}", get(get_endpoint_stats))
        // Stage 2: Profiles
        .route("/profiles", get(get_profiles))
        .route("/profiles/{endpoint_id}", get(get_endpoint_profile))
        // Stage 3: Anomalies
        .route("/anomalies", get(get_anomalies))
        .route("/anomalies/high", get(get_high_anomalies))
        // Stage 3b: Correlations
        .route("/correlations", get(get_correlations))
        // Stage 4: Healing
        .route("/healing/actions", get(get_healing_actions))
        // Stage 5: Action Memory
        .route("/memory", get(get_action_history))
        .route("/memory/{endpoint_id}/strategy", get(get_strategy_weights))
        // Stage 6: Recovery Surge
        .route("/surge/status", get(get_surge_status))
        // Stage 7: Predictions
        .route("/predictions", get(get_predictions))
        .route("/predictions/capacity/{endpoint_id}", get(get_capacity_forecast))
        // Stage 8: Insights
        .route("/insights", get(get_insights))
        .route("/reports", get(get_weekly_reports))
        // Stage 9: Routing
        .route("/routing/decisions", get(get_routing_decisions))
        // Health
        .route("/health", get(get_cortex_health))
}

// ── Stage 1: Hourly Stats ──

async fn get_hourly_stats(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Json<serde_json::Value> {
    let stats = sqlx::query_scalar::<_, serde_json::Value>(
        "SELECT jsonb_build_object('endpoint_id', ehs.endpoint_id, 'hour_start', ehs.hour_start, 'total', ehs.total_deliveries, 'ok', ehs.successful, 'fail', ehs.failed, 'avg_ms', ehs.avg_latency_ms, 'p50_ms', ehs.p50_latency_ms, 'p95_ms', ehs.p95_latency_ms, 'p99_ms', ehs.p99_latency_ms, 'errors', ehs.error_breakdown) FROM endpoint_hourly_stats ehs JOIN endpoints e ON e.id = ehs.endpoint_id WHERE e.customer_id = $1 ORDER BY ehs.hour_start DESC LIMIT 100"
    ).bind(customer.id).fetch_all(&pool).await.unwrap_or_default();

    Json(serde_json::json!({ "stats": stats }))
}

async fn get_endpoint_stats(
    Extension(pool): Extension<PgPool>,
    Path(endpoint_id): Path<Uuid>,
) -> Json<serde_json::Value> {
    let stats: Vec<(chrono::DateTime<chrono::Utc>, i32, i32, i32, i32, i32, i32, i32, serde_json::Value)> = sqlx::query_as(
        "SELECT hour_start, total_deliveries, successful, failed, avg_latency_ms, p50_latency_ms, p95_latency_ms, p99_latency_ms, error_breakdown FROM endpoint_hourly_stats WHERE endpoint_id = $1 ORDER BY hour_start DESC LIMIT 168"
    ).bind(endpoint_id).fetch_all(&pool).await.unwrap_or_default();

    Json(serde_json::json!({ "endpoint_id": endpoint_id, "stats": stats }))
}

// ── Stage 2: Profiles ──

async fn get_profiles(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Json<serde_json::Value> {
    let profiles = sqlx::query_scalar::<_, serde_json::Value>(
        "SELECT row_to_json(ep) FROM endpoint_profiles ep JOIN endpoints e ON e.id = ep.endpoint_id WHERE e.customer_id = $1 ORDER BY ep.updated_at DESC"
    ).bind(customer.id).fetch_all(&pool).await.unwrap_or_default();

    Json(serde_json::json!({ "profiles": profiles }))
}

async fn get_endpoint_profile(
    Extension(pool): Extension<PgPool>,
    Path(endpoint_id): Path<Uuid>,
) -> Json<serde_json::Value> {
    let profile = sqlx::query_scalar::<_, serde_json::Value>(
        "SELECT row_to_json(ep) FROM endpoint_profiles ep WHERE ep.endpoint_id = $1"
    ).bind(endpoint_id).fetch_optional(&pool).await.unwrap_or(None);

    Json(serde_json::json!({ "profile": profile }))
}

// ── Stage 3: Anomalies ──

async fn get_anomalies(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Json<serde_json::Value> {
    let anomalies = sqlx::query_as::<_, (i64, Uuid, i32, serde_json::Value, String, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, endpoint_id, score, factors, category, created_at FROM anomaly_scores WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 50"
    ).bind(customer.id).fetch_all(&pool).await.unwrap_or_default();

    Json(serde_json::json!({ "anomalies": anomalies }))
}

async fn get_high_anomalies(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Json<serde_json::Value> {
    let anomalies = sqlx::query_as::<_, (i64, Uuid, i32, serde_json::Value, String, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, endpoint_id, score, factors, category, created_at FROM anomaly_scores WHERE customer_id = $1 AND score > 70 ORDER BY score DESC LIMIT 20"
    ).bind(customer.id).fetch_all(&pool).await.unwrap_or_default();

    Json(serde_json::json!({ "high_anomalies": anomalies }))
}

// ── Stage 3b: Correlations ──

async fn get_correlations(
    Extension(pool): Extension<PgPool>,
) -> Json<serde_json::Value> {
    let correlations = sqlx::query_as::<_, (i64, Option<String>, serde_json::Value, i32, String, bool, chrono::DateTime<chrono::Utc>, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, root_cause, affected_endpoints, alert_count, severity, resolved, first_seen, last_seen FROM alert_correlations ORDER BY last_seen DESC LIMIT 20"
    ).fetch_all(&pool).await.unwrap_or_default();

    Json(serde_json::json!({ "correlations": correlations }))
}

// ── Stage 4: Healing ──

async fn get_healing_actions(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Json<serde_json::Value> {
    let actions = sqlx::query_as::<_, (i64, Uuid, String, Option<String>, serde_json::Value, String, serde_json::Value, chrono::DateTime<chrono::Utc>, Option<chrono::DateTime<chrono::Utc>>)>(
        "SELECT ha.id, ha.endpoint_id, ha.action_type, ha.reason, ha.details, ha.outcome, ha.outcome_details, ha.created_at, ha.resolved_at FROM healing_actions ha JOIN endpoints e ON e.id = ha.endpoint_id WHERE e.customer_id = $1 ORDER BY ha.created_at DESC LIMIT 50"
    ).bind(customer.id).fetch_all(&pool).await.unwrap_or_default();

    Json(serde_json::json!({ "actions": actions }))
}

// ── Stage 5: Action Memory ──

async fn get_action_history(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Json<serde_json::Value> {
    let history = sqlx::query_as::<_, (i64, Uuid, String, Option<String>, serde_json::Value, String, serde_json::Value, Option<i32>, Option<f64>, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, endpoint_id, action_type, reason, context, outcome, outcome_details, time_to_resolution_secs, success_score, created_at FROM cortex_action_history WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 100"
    ).bind(customer.id).fetch_all(&pool).await.unwrap_or_default();

    Json(serde_json::json!({ "history": history }))
}

async fn get_strategy_weights(
    Extension(pool): Extension<PgPool>,
    Path(endpoint_id): Path<Uuid>,
) -> Json<serde_json::Value> {
    let weights = sqlx::query_as::<_, (Uuid, String, i32, i32, f64, f64, Option<chrono::DateTime<chrono::Utc>>)>(
        "SELECT endpoint_id, strategy_name, attempts, successes, avg_resolution_secs, weight, last_used FROM endpoint_strategy_weights WHERE endpoint_id = $1 ORDER BY weight DESC"
    ).bind(endpoint_id).fetch_all(&pool).await.unwrap_or_default();

    Json(serde_json::json!({ "strategies": weights }))
}

// ── Stage 6: Recovery Surge ──

async fn get_surge_status(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Json<serde_json::Value> {
    let surges = sqlx::query_as::<_, (i64, Uuid, String, i32, i32, i32, f64, f64, i32, i32, String, chrono::DateTime<chrono::Utc>, Option<chrono::DateTime<chrono::Utc>>)>(
        "SELECT rs.id, rs.endpoint_id, COALESCE(rs.trigger_reason,''), rs.queued_count, rs.processed_count, rs.failed_count, rs.current_rate_per_min, rs.target_rate_per_min, rs.ramp_step, rs.total_steps, rs.status, rs.started_at, rs.completed_at FROM recovery_surges rs JOIN endpoints e ON e.id = rs.endpoint_id WHERE e.customer_id = $1 ORDER BY rs.started_at DESC LIMIT 20"
    ).bind(customer.id).fetch_all(&pool).await.unwrap_or_default();

    Json(serde_json::json!({ "surges": surges }))
}

// ── Stage 7: Predictions ──

async fn get_predictions(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Json<serde_json::Value> {
    let predictions = sqlx::query_as::<_, (i64, Uuid, String, f64, serde_json::Value, i32, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, endpoint_id, prediction_type, probability, factors, time_horizon_mins, created_at FROM predictions WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 50"
    ).bind(customer.id).fetch_all(&pool).await.unwrap_or_default();

    Json(serde_json::json!({ "predictions": predictions }))
}

async fn get_capacity_forecast(
    Extension(pool): Extension<PgPool>,
    Path(endpoint_id): Path<Uuid>,
) -> Json<serde_json::Value> {
    let forecast = crate::cortex::predictive_engine::capacity_forecast(&pool, endpoint_id).await.unwrap_or(None);
    Json(serde_json::json!({ "forecast": forecast }))
}

// ── Stage 8: Insights ──

async fn get_insights(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Json<serde_json::Value> {
    let insights = sqlx::query_as::<_, (i64, String, String, Option<String>, String, Option<String>, serde_json::Value, bool, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, insight_type, title, body, severity, action_url, data, dismissed, created_at FROM cortex_insights WHERE customer_id = $1 AND dismissed = false ORDER BY created_at DESC LIMIT 50"
    ).bind(customer.id).fetch_all(&pool).await.unwrap_or_default();

    Json(serde_json::json!({ "insights": insights }))
}

async fn get_weekly_reports(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Json<serde_json::Value> {
    let reports = sqlx::query_as::<_, (i64, chrono::NaiveDate, serde_json::Value, Option<chrono::DateTime<chrono::Utc>>, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, week_start, report, sent_at, created_at FROM weekly_reports WHERE customer_id = $1 ORDER BY week_start DESC LIMIT 12"
    ).bind(customer.id).fetch_all(&pool).await.unwrap_or_default();

    Json(serde_json::json!({ "reports": reports }))
}

// ── Stage 9: Routing ──

async fn get_routing_decisions(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Json<serde_json::Value> {
    let decisions = sqlx::query_as::<_, (i64, Uuid, Option<String>, Option<String>, serde_json::Value, Option<i32>, Option<bool>, chrono::DateTime<chrono::Utc>)>(
        "SELECT rd.id, rd.endpoint_id, rd.selected_url, rd.reason, rd.alternatives, rd.latency_ms, rd.success, rd.created_at FROM routing_decisions rd JOIN endpoints e ON e.id = rd.endpoint_id WHERE e.customer_id = $1 ORDER BY rd.created_at DESC LIMIT 50"
    ).bind(customer.id).fetch_all(&pool).await.unwrap_or_default();

    Json(serde_json::json!({ "decisions": decisions }))
}

// ── Cortex Health ──

async fn get_cortex_health(
    Extension(pool): Extension<PgPool>,
) -> Json<serde_json::Value> {
    let stats_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM endpoint_hourly_stats").fetch_one(&pool).await.unwrap_or((0,));
    let profiles_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM endpoint_profiles").fetch_one(&pool).await.unwrap_or((0,));
    let anomalies_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM anomaly_scores WHERE created_at > NOW() - INTERVAL '24 hours'").fetch_one(&pool).await.unwrap_or((0,));
    let healing_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM healing_actions WHERE created_at > NOW() - INTERVAL '24 hours'").fetch_one(&pool).await.unwrap_or((0,));
    let memory_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM cortex_action_history").fetch_one(&pool).await.unwrap_or((0,));
    let predictions_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM predictions WHERE created_at > NOW() - INTERVAL '24 hours'").fetch_one(&pool).await.unwrap_or((0,));
    let insights_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM cortex_insights WHERE dismissed = false").fetch_one(&pool).await.unwrap_or((0,));

    Json(serde_json::json!({
        "status": "healthy",
        "metrics_24h": {
            "hourly_stats": stats_count.0,
            "profiles": profiles_count.0,
            "anomalies": anomalies_count.0,
            "healing_actions": healing_count.0,
            "action_memory": memory_count.0,
            "predictions": predictions_count.0,
            "active_insights": insights_count.0,
        },
        "prometheus": crate::cortex::CORTEX_METRICS.to_prometheus(),
    }))
}
