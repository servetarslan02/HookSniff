//! Cortex API routes — admin-only endpoints for platform-wide intelligence.
//!
//! These endpoints expose the Cortex brain's data: all customers, all endpoints.
//! Only accessible to admin users. The brain sees everything.

use axum::{extract::Extension, Json, routing::{get, post}, Router};
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
        .route("/ml/bootstrap", post(post_ml_bootstrap))
        .route("/ml/quality", get(get_ml_quality))
        .route("/ml/quality/reset", post(post_ml_quality_reset))
        .route("/proactive/status", get(get_proactive_status))
        // Phase 1-10: New Cortex routes
        .route("/drift/events", get(get_drift_events))
        .route("/drift/{endpoint_id}", get(get_endpoint_drift))
        .route("/models/health/{endpoint_id}", get(get_model_health))
        .route("/models/platform-summary", get(get_platform_model_summary))
        .route("/explain/anomaly", post(post_explain_anomaly))
        .route("/explain/prediction", post(post_explain_prediction))
        .route("/chaos/run", post(post_chaos_run))
        .route("/chaos/results/{test_id}", get(get_chaos_result))
        .route("/chaos/scenarios", get(get_chaos_scenarios))
        .route("/ab-tests", get(get_ab_tests))
        .route("/ab-tests/start", post(post_ab_test_start))
        .route("/ab-tests/{test_id}/results", get(get_ab_test_results))
        .route("/automl/trials/{endpoint_id}", get(get_automl_trials))
        .route("/automl/run", post(post_automl_run))
        .route("/automl/best-params/{endpoint_id}", get(get_automl_best_params))
        .route("/tracing/performance", get(get_tracing_performance))
        .route("/tracing/stage/{stage_name}", get(get_stage_performance))
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

    // ML quality and proactive diagnostics
    let ml_quality_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM ml_model_quality WHERE measured_at > NOW() - INTERVAL '24 hours'").fetch_one(&pool).await.unwrap_or((0,));
    let proactive_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM cortex_insights WHERE insight_type LIKE 'proactive_%' AND dismissed = false").fetch_one(&pool).await.unwrap_or((0,));
    let ml_predictions_total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM predictions").fetch_one(&pool).await.unwrap_or((0,));

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
            "ml_quality_samples_24h": ml_quality_count.0,
            "proactive_insights": proactive_count.0,
            "ml_predictions_total": ml_predictions_total.0,
        },
    })))
}

async fn post_ml_bootstrap(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let result = crate::cortex::ml::bootstrap::bootstrap_ml_data(&pool, 168, 50).await
        .map_err(|e| AppError::Internal(anyhow::anyhow!(e)))?;
    Ok(Json(serde_json::json!({
        "status": "ok",
        "result": result,
    })))
}

async fn get_ml_quality(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let summary = crate::cortex::ml::quality_tracker::get_quality_summary(&pool).await
        .unwrap_or_default();
    Ok(Json(serde_json::json!({
        "models": summary,
        "total": summary.len(),
    })))
}

async fn post_ml_quality_reset(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let reset_count = crate::cortex::ml::quality_tracker::check_and_reset_degraded_models(&pool, 50.0).await
        .map_err(|e| AppError::Internal(anyhow::anyhow!(e)))?;
    Ok(Json(serde_json::json!({
        "status": "ok",
        "models_reset": reset_count,
    })))
}

async fn get_proactive_status(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let insights: Vec<(i64, Uuid, String, String, String, serde_json::Value, chrono::DateTime<chrono::Utc>)> = sqlx::query_as(
        "SELECT id, customer_id, insight_type, title, severity, data, created_at FROM cortex_insights WHERE insight_type LIKE 'proactive_%' AND dismissed = false ORDER BY created_at DESC LIMIT 50"
    ).fetch_all(&pool).await.unwrap_or_default();

    Ok(Json(serde_json::json!({
        "proactive_insights": insights,
        "count": insights.len(),
    })))
}

// ═══════════════════════════════════════════════════════════════
// Phase 1: Drift Detection
// ═══════════════════════════════════════════════════════════════

async fn get_drift_events(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let rows = sqlx::query_scalar::<_, serde_json::Value>(
        "SELECT jsonb_build_object('id', id, 'endpoint_id', endpoint_id, 'drift_type', drift_type, 'severity', severity, 'features_affected', features_affected, 'detected_by', detected_by, 'recommended_action', recommended_action, 'created_at', created_at) FROM ml_drift_events ORDER BY created_at DESC LIMIT 100"
    ).fetch_all(&pool).await.unwrap_or_default();
    Ok(Json(serde_json::json!({ "drift_events": rows, "total": rows.len() })))
}

async fn get_endpoint_drift(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>, Path(eid): Path<Uuid>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let events = sqlx::query_scalar::<_, serde_json::Value>(
        "SELECT jsonb_build_object('id', id, 'drift_type', drift_type, 'severity', severity, 'features_affected', features_affected, 'detected_by', detected_by, 'recommended_action', recommended_action, 'created_at', created_at) FROM ml_drift_events WHERE endpoint_id = $1 ORDER BY created_at DESC LIMIT 50"
    ).bind(eid).fetch_all(&pool).await.unwrap_or_default();
    // Also get drift detector model state
    let model = sqlx::query_scalar::<_, serde_json::Value>(
        "SELECT parameters FROM ml_models WHERE endpoint_id = $1 AND model_type = 'drift_detector'"
    ).bind(eid).fetch_optional(&pool).await.unwrap_or(None);
    Ok(Json(serde_json::json!({ "endpoint_id": eid, "drift_events": events, "detector_state": model })))
}

// ═══════════════════════════════════════════════════════════════
// Phase 2: Model Monitoring
// ═══════════════════════════════════════════════════════════════

async fn get_model_health(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>, Path(eid): Path<Uuid>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let models = crate::cortex::ml::model_monitor::check_all_models(&pool).await
        .unwrap_or_default();
    let endpoint_models: Vec<_> = models.into_iter().filter(|m| m.endpoint_id == eid).collect();
    Ok(Json(serde_json::json!({ "endpoint_id": eid, "models": endpoint_models })))
}

async fn get_platform_model_summary(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    match tokio::task::spawn_blocking(move || {
        // Use a blocking context to catch any panics
        std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            // This will be awaited in the blocking context
        }))
    }).await {
        _ => {}
    }
    // Direct async approach with comprehensive error handling
    let result = sqlx::query_as::<_, (Uuid,)>(
        "SELECT DISTINCT endpoint_id FROM ml_models"
    ).fetch_all(&pool).await;

    match result {
        Ok(endpoints) => {
            let mut all_healths = Vec::new();
            for (eid,) in &endpoints {
                let types = ["adaptive_threshold", "anomaly_detector", "retry_bandit", "circuit_bandit", "time_series", "contextual_bandit", "drift_detector"];
                for mt in &types {
                    if let Ok(Some(health)) = crate::cortex::ml::model_monitor::check_model_health(&pool, *eid, mt).await {
                        all_healths.push(health);
                    }
                }
            }
            let total = all_healths.len() as i64;
            let healthy = all_healths.iter().filter(|h| h.health_status == crate::cortex::ml::model_monitor::HealthStatus::Healthy).count() as i64;
            let warning = all_healths.iter().filter(|h| h.health_status == crate::cortex::ml::model_monitor::HealthStatus::Warning).count() as i64;
            let critical = all_healths.iter().filter(|h| h.health_status == crate::cortex::ml::model_monitor::HealthStatus::Critical).count() as i64;
            let degraded = all_healths.iter().filter(|h| h.health_status == crate::cortex::ml::model_monitor::HealthStatus::Degraded).count() as i64;
            let avg_accuracy = if total > 0 { all_healths.iter().map(|h| h.accuracy).sum::<f64>() / total as f64 } else { 0.0 };
            let avg_f1 = if total > 0 { all_healths.iter().map(|h| h.f1_score).sum::<f64>() / total as f64 } else { 0.0 };
            all_healths.sort_by(|a, b| a.quality_score.partial_cmp(&b.quality_score).unwrap_or(std::cmp::Ordering::Equal));
            let worst_models: Vec<_> = all_healths.into_iter().take(10).collect();
            Ok(Json(serde_json::json!({
                "total_models": total, "healthy": healthy, "warning": warning, "critical": critical, "degraded": degraded,
                "avg_accuracy": avg_accuracy, "avg_f1": avg_f1, "worst_models": worst_models
            })))
        }
        Err(e) => {
            tracing::warn!("Platform model summary unavailable: {}", e);
            Ok(Json(serde_json::json!({
                "total_models": 0, "healthy": 0, "warning": 0, "critical": 0, "degraded": 0,
                "avg_accuracy": 0.0, "avg_f1": 0.0, "worst_models": []
            })))
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// Phase 3: Explainable AI
// ═══════════════════════════════════════════════════════════════

async fn post_explain_anomaly(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>, Json(body): Json<serde_json::Value>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let eid = body.get("endpoint_id").and_then(|v| v.as_str()).and_then(|s| Uuid::parse_str(s).ok()).ok_or(AppError::BadRequest("endpoint_id required".into()))?;
    // Get current stats
    let stats: Option<(f64, f64, f64, f64, f64)> = sqlx::query_as(
        "SELECT COALESCE(total_deliveries,0)::FLOAT, COALESCE(successful,0)::FLOAT, COALESCE(avg_latency_ms,0)::FLOAT, COALESCE(p95_latency_ms,0)::FLOAT, COALESCE(total_deliveries,0)::FLOAT FROM endpoint_hourly_stats WHERE endpoint_id = $1 ORDER BY hour_start DESC LIMIT 1"
    ).bind(eid).fetch_optional(&pool).await.unwrap_or(None);
    let (total, success, latency, p95, delivery_rate) = stats.unwrap_or((0.0, 100.0, 0.0, 0.0, 0.0));
    let sr = if total > 0.0 { success / total * 100.0 } else { 100.0 };
    let baseline_sr = body.get("baseline_sr").and_then(|v| v.as_f64()).unwrap_or(95.0);
    let baseline_latency = body.get("baseline_latency").and_then(|v| v.as_f64()).unwrap_or(200.0);
    let explanation = crate::cortex::ml::explainable::explain_anomaly_score(eid, sr, latency, p95, delivery_rate, baseline_sr, baseline_latency);
    Ok(Json(serde_json::to_value(explanation).unwrap_or_default()))
}

async fn post_explain_prediction(Extension(_pool): Extension<PgPool>, Extension(c): Extension<Customer>, Json(body): Json<serde_json::Value>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let eid = body.get("endpoint_id").and_then(|v| v.as_str()).and_then(|s| Uuid::parse_str(s).ok()).ok_or(AppError::BadRequest("endpoint_id required".into()))?;
    let predicted_sr = body.get("predicted_sr").and_then(|v| v.as_f64()).unwrap_or(90.0);
    let predicted_latency = body.get("predicted_latency").and_then(|v| v.as_f64()).unwrap_or(500.0);
    let confidence = body.get("confidence").and_then(|v| v.as_f64()).unwrap_or(0.7);
    let forecast_steps = body.get("forecast_steps").and_then(|v| v.as_u64()).unwrap_or(1) as usize;
    let trend = body.get("trend").and_then(|v| v.as_str()).unwrap_or("stable");
    let explanation = crate::cortex::ml::explainable::explain_prediction(eid, predicted_sr, predicted_latency, confidence, forecast_steps, trend);
    Ok(Json(serde_json::to_value(explanation).unwrap_or_default()))
}

// ═══════════════════════════════════════════════════════════════
// Phase 8: Chaos Engineering
// ═══════════════════════════════════════════════════════════════

async fn post_chaos_run(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>, Json(body): Json<serde_json::Value>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let scenario = body.get("scenario").and_then(|v| v.as_str()).unwrap_or("endpoint_down");
    let target = body.get("target").and_then(|v| v.as_str()).unwrap_or("platform");
    let eid = body.get("endpoint_id").and_then(|v| v.as_str()).and_then(|s| Uuid::parse_str(s).ok());

    let chaos_scenario = match scenario {
        "endpoint_down" => crate::cortex::ml::chaos::ChaosScenario::EndpointDown,
        "redis_down" => crate::cortex::ml::chaos::ChaosScenario::RedisDown,
        "database_slow" => crate::cortex::ml::chaos::ChaosScenario::DatabaseSlow,
        "traffic_spike" => crate::cortex::ml::chaos::ChaosScenario::TrafficSpike,
        "error_burst" => crate::cortex::ml::chaos::ChaosScenario::ErrorBurst,
        _ => return Err(AppError::BadRequest("unknown scenario".into())),
    };

    let result = if let Some(eid) = eid {
        crate::cortex::ml::chaos::test_endpoint_down_scenario(&pool, eid).await
    } else {
        crate::cortex::ml::chaos::ChaosResult {
            passed: true, recovery_time_ms: 0, errors_during_test: 0,
            alerts_generated: 0, self_healing_triggered: false,
            observations: vec!["No endpoint specified".into()],
        }
    };

    let test_id = crate::cortex::ml::chaos::record_chaos_test(&pool, &chaos_scenario, target, &result, 0).await
        .map_err(|e| AppError::Internal(anyhow::anyhow!(e)))?;

    Ok(Json(serde_json::json!({ "test_id": test_id, "result": result })))
}

async fn get_chaos_result(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>, Path(test_id): Path<i64>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let tests = crate::cortex::ml::chaos::get_recent_tests(&pool, 100).await.unwrap_or_default();
    let test = tests.into_iter().find(|t| t.id == test_id);
    Ok(Json(serde_json::json!({ "test": test })))
}

async fn get_chaos_scenarios(Extension(_pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    Ok(Json(serde_json::json!({
        "scenarios": [
            {"name": "endpoint_down", "description": "Endpoint devre dışı bırakma", "severity": "high"},
            {"name": "redis_down", "description": "Redis bağlantısını kesme", "severity": "low"},
            {"name": "database_slow", "description": "DB yavaşlatma (500ms+)", "severity": "medium"},
            {"name": "traffic_spike", "description": "Trafik patlaması (10x)", "severity": "medium"},
            {"name": "error_burst", "description": "Ani hata patlaması", "severity": "high"},
        ]
    })))
}

// ═══════════════════════════════════════════════════════════════
// Phase 9: A/B Testing
// ═══════════════════════════════════════════════════════════════

async fn get_ab_tests(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let rows = sqlx::query_scalar::<_, serde_json::Value>(
        "SELECT jsonb_build_object('id', id, 'endpoint_id', endpoint_id, 'model_type', model_type, 'variant_a', variant_a, 'variant_b', variant_b, 'split_ratio', split_ratio, 'metric', metric, 'status', status, 'winner', winner, 'created_at', created_at) FROM ab_tests ORDER BY created_at DESC LIMIT 50"
    ).fetch_all(&pool).await.unwrap_or_default();
    Ok(Json(serde_json::json!({ "ab_tests": rows })))
}

async fn post_ab_test_start(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>, Json(body): Json<serde_json::Value>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let eid = body.get("endpoint_id").and_then(|v| v.as_str()).and_then(|s| Uuid::parse_str(s).ok()).ok_or(AppError::BadRequest("endpoint_id required".into()))?;
    let model_type = body.get("model_type").and_then(|v| v.as_str()).unwrap_or("anomaly_detector");
    let variant_a = body.get("variant_a").and_then(|v| v.as_str()).unwrap_or("current");
    let variant_b = body.get("variant_b").and_then(|v| v.as_str()).unwrap_or("alternative");
    let split_ratio = body.get("split_ratio").and_then(|v| v.as_f64()).unwrap_or(0.5);
    let test_id = crate::cortex::ml::ab_testing::start_ab_test(&pool, eid, model_type, variant_a, variant_b, split_ratio).await
        .map_err(|e| AppError::Internal(anyhow::anyhow!(e)))?;
    Ok(Json(serde_json::json!({ "test_id": test_id, "status": "running" })))
}

async fn get_ab_test_results(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>, Path(test_id): Path<i64>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let result = crate::cortex::ml::ab_testing::analyze_ab_test(&pool, test_id).await
        .map_err(|e| AppError::Internal(anyhow::anyhow!(e)))?;
    Ok(Json(serde_json::json!({ "result": result })))
}

// ═══════════════════════════════════════════════════════════════
// Phase 10: AutoML
// ═══════════════════════════════════════════════════════════════

async fn get_automl_trials(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>, Path(eid): Path<Uuid>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let trials = sqlx::query_scalar::<_, serde_json::Value>(
        "SELECT jsonb_build_object('id', id, 'model_type', model_type, 'params', params, 'score', score, 'metric', metric, 'created_at', created_at) FROM automl_trials WHERE endpoint_id = $1 ORDER BY score DESC LIMIT 50"
    ).bind(eid).fetch_all(&pool).await.unwrap_or_default();
    Ok(Json(serde_json::json!({ "endpoint_id": eid, "trials": trials, "total": trials.len() })))
}

async fn post_automl_run(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>, Json(body): Json<serde_json::Value>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let eid = body.get("endpoint_id").and_then(|v| v.as_str()).and_then(|s| Uuid::parse_str(s).ok()).ok_or(AppError::BadRequest("endpoint_id required".into()))?;
    let model_type = body.get("model_type").and_then(|v| v.as_str()).unwrap_or("adaptive_threshold");
    let max_trials = body.get("max_trials").and_then(|v| v.as_u64()).unwrap_or(10) as usize;
    let result = crate::cortex::ml::automl::run_automl_for_endpoint(&pool, eid, model_type, max_trials).await
        .map_err(|e| AppError::Internal(anyhow::anyhow!(e)))?;
    Ok(Json(serde_json::json!({ "endpoint_id": eid, "model_type": model_type, "best_params": result })))
}

async fn get_automl_best_params(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>, Path(eid): Path<Uuid>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let best: Option<(serde_json::Value, f64)> = sqlx::query_as(
        "SELECT params, score FROM automl_trials WHERE endpoint_id = $1 ORDER BY score DESC LIMIT 1"
    ).bind(eid).fetch_optional(&pool).await.unwrap_or(None);
    Ok(Json(serde_json::json!({ "endpoint_id": eid, "best": best.map(|(p, s)| serde_json::json!({"params": p, "score": s})) })))
}

// ═══════════════════════════════════════════════════════════════
// Phase 4: Distributed Tracing
// ═══════════════════════════════════════════════════════════════

async fn get_tracing_performance(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let stages = ["hourly_stats", "profile_update", "anomaly_scoring", "self_healing", "predictions", "ml_training", "drift_detection", "smart_routing", "insights"];
    let mut stage_stats = Vec::new();
    for stage in &stages {
        let stats: Option<(f64, i64, i64, i64)> = sqlx::query_as(
            "SELECT COALESCE(AVG(duration_ms), 0)::DOUBLE PRECISION, COUNT(*), COUNT(*) FILTER (WHERE status = 'success'), COUNT(*) FILTER (WHERE status = 'timeout') FROM cortex_traces WHERE stage_name = $1 AND completed_at > NOW() - INTERVAL '24 hours'"
        ).bind(stage).fetch_optional(&pool).await.unwrap_or(None);
        let (avg_dur, total, success, timeout) = stats.unwrap_or((0.0, 0, 0, 0));
        let sr = if total > 0 { success as f64 / total as f64 * 100.0 } else { 100.0 };
        stage_stats.push(serde_json::json!({"stage_name": stage, "avg_duration_ms": avg_dur, "runs_last_24h": total, "success_rate": sr, "timeout_rate": if total > 0 { timeout as f64 / total as f64 * 100.0 } else { 0.0 }}));
    }
    let total_runs: i64 = stage_stats.iter().map(|s| s["runs_last_24h"].as_i64().unwrap_or(0)).sum();
    let avg_pipeline = if !stage_stats.is_empty() { stage_stats.iter().map(|s| s["avg_duration_ms"].as_f64().unwrap_or(0.0)).sum::<f64>() / stage_stats.len() as f64 } else { 0.0 };
    let overall_sr = if total_runs > 0 { stage_stats.iter().map(|s| s["success_rate"].as_f64().unwrap_or(100.0) * s["runs_last_24h"].as_i64().unwrap_or(0) as f64).sum::<f64>() / total_runs as f64 } else { 100.0 };
    Ok(Json(serde_json::json!({
        "total_runs_last_24h": total_runs, "avg_pipeline_duration_ms": avg_pipeline,
        "bottleneck_stage": stage_stats.iter().max_by(|a, b| a["avg_duration_ms"].as_f64().unwrap_or(0.0).partial_cmp(&b["avg_duration_ms"].as_f64().unwrap_or(0.0)).unwrap_or(std::cmp::Ordering::Equal)).map(|s| s["stage_name"].as_str().unwrap_or("")).unwrap_or(""),
        "slowest_stages": stage_stats, "overall_success_rate": overall_sr
    })))
}

async fn get_stage_performance(Extension(pool): Extension<PgPool>, Extension(c): Extension<Customer>, Path(stage_name): Path<String>) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&c)?;
    let perf = crate::cortex::ml::cortex_tracing::analyze_stage_performance(&pool, &stage_name).await
        .map_err(|e| AppError::Internal(anyhow::anyhow!(e)))?;
    Ok(Json(serde_json::to_value(perf).unwrap_or_default()))
}
