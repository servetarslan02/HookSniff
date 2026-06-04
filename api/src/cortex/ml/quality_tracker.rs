//! ML Model Quality Tracker
//!
//! Tracks prediction accuracy over time and auto-degrades bad models.
//! Answers: "Is this model actually helping, or is it guessing?"

use sqlx::PgPool;
use uuid::Uuid;

/// Record a prediction outcome for quality tracking
pub async fn record_prediction_outcome(
    pool: &PgPool,
    endpoint_id: Uuid,
    model_type: &str,
    predicted: f64,
    actual: f64,
) -> Result<(), sqlx::Error> {
    let error = (predicted - actual).abs();
    let error_pct = if actual != 0.0 { (error / actual) * 100.0 } else { error * 100.0 };
    let within_tolerance = error_pct < 20.0; // 20% tolerance

    sqlx::query(
        r#"
        INSERT INTO ml_model_quality 
            (endpoint_id, model_type, predicted_value, actual_value, absolute_error, error_pct, within_tolerance)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        "#
    )
    .bind(endpoint_id)
    .bind(model_type)
    .bind(predicted)
    .bind(actual)
    .bind(error)
    .bind(error_pct)
    .bind(within_tolerance)
    .execute(pool)
    .await?;

    Ok(())
}

/// Calculate quality metrics for a model over a time window
pub async fn calculate_metrics(
    pool: &PgPool,
    endpoint_id: Uuid,
    model_type: &str,
    window_hours: i64,
) -> Result<Option<ModelQualityMetrics>, sqlx::Error> {
    let row: Option<(i64, f64, f64, f64, f64)> = sqlx::query_as(
        r#"
        SELECT
            COUNT(*) as total_predictions,
            COALESCE(AVG(error_pct), 0.0) as avg_error_pct,
            COALESCE(AVG(absolute_error), 0.0) as avg_absolute_error,
            COALESCE(COUNT(*) FILTER (WHERE within_tolerance)::FLOAT / NULLIF(COUNT(*), 0) * 100, 0.0) as accuracy_pct,
            COALESCE(STDDEV(error_pct), 0.0) as error_stddev
        FROM ml_model_quality
        WHERE endpoint_id = $1 
          AND model_type = $2 
          AND measured_at > NOW() - ($3 || ' hours')::INTERVAL
        "#
    )
    .bind(endpoint_id)
    .bind(model_type)
    .bind(window_hours.to_string())
    .fetch_optional(pool)
    .await?;

    match row {
        Some((total, avg_error, avg_abs_error, accuracy, stddev)) if total >= 3 => {
            Ok(Some(ModelQualityMetrics {
                endpoint_id,
                model_type: model_type.to_string(),
                total_predictions: total,
                avg_error_pct: avg_error,
                avg_absolute_error: avg_abs_error,
                accuracy_pct: accuracy,
                error_stddev: stddev,
                quality_score: calculate_quality_score(accuracy, avg_error, stddev),
            }))
        }
        _ => Ok(None),
    }
}

/// Quality score: 0-100, higher = better
fn calculate_quality_score(accuracy_pct: f64, avg_error_pct: f64, error_stddev: f64) -> f64 {
    // Accuracy contributes 60%, low avg error 25%, low stddev 15%
    let accuracy_component = accuracy_pct * 0.6;
    let error_component = ((100.0 - avg_error_pct).max(0.0)) * 0.25;
    let stability_component = ((100.0 - error_stddev).max(0.0)) * 0.15;
    (accuracy_component + error_component + stability_component).min(100.0).max(0.0)
}

/// Check if a model should be reset (quality too low)
pub async fn check_and_reset_degraded_models(
    pool: &PgPool,
    min_quality_score: f64,
) -> Result<u64, sqlx::Error> {
    // Find models with low quality scores
    let degraded: Vec<(Uuid, String)> = sqlx::query_as(
        r#"
        SELECT DISTINCT endpoint_id, model_type
        FROM ml_model_quality
        WHERE measured_at > NOW() - INTERVAL '24 hours'
        GROUP BY endpoint_id, model_type
        HAVING COUNT(*) >= 5 
           AND AVG(CASE WHEN within_tolerance THEN 1.0 ELSE 0.0 END) * 100 < $1
        "#
    )
    .bind(min_quality_score)
    .fetch_all(pool)
    .await?;

    let mut reset_count = 0u64;
    for (eid, model_type) in &degraded {
        // Reset the model to empty (forces re-training)
        sqlx::query(
            "UPDATE ml_models SET parameters = '{}', training_samples = 0, updated_at = NOW() WHERE endpoint_id = $1 AND model_type = $2"
        )
        .bind(eid)
        .bind(model_type)
        .execute(pool)
        .await?;

        // Record the reset
        sqlx::query(
            "INSERT INTO ml_model_resets (endpoint_id, model_type, reason, quality_score) VALUES ($1, $2, 'auto_degraded', $3)"
        )
        .bind(eid)
        .bind(model_type)
        .bind(min_quality_score)
        .execute(pool)
        .await?;

        tracing::warn!(
            "🔄 ML model reset: endpoint {} model '{}' quality below {}%",
            eid, model_type, min_quality_score
        );
        reset_count += 1;
    }

    Ok(reset_count)
}

/// Get quality summary for all models (admin dashboard)
pub async fn get_quality_summary(
    pool: &PgPool,
) -> Result<Vec<ModelQualityMetrics>, sqlx::Error> {
    let rows: Vec<(Uuid, String, i64, f64, f64, f64)> = sqlx::query_as(
        r#"
        SELECT 
            endpoint_id, model_type, COUNT(*) as total,
            COALESCE(AVG(error_pct), 0.0) as avg_error,
            COALESCE(COUNT(*) FILTER (WHERE within_tolerance)::FLOAT / NULLIF(COUNT(*), 0) * 100, 0.0) as accuracy,
            COALESCE(STDDEV(error_pct), 0.0) as stddev
        FROM ml_model_quality
        WHERE measured_at > NOW() - INTERVAL '24 hours'
        GROUP BY endpoint_id, model_type
        HAVING COUNT(*) >= 3
        ORDER BY accuracy DESC
        "#
    )
    .fetch_all(pool)
    .await?;

    Ok(rows.into_iter().map(|(eid, mt, total, avg_err, acc, stddev)| {
        ModelQualityMetrics {
            endpoint_id: eid,
            model_type: mt,
            total_predictions: total,
            avg_error_pct: avg_err,
            avg_absolute_error: 0.0,
            accuracy_pct: acc,
            error_stddev: stddev,
            quality_score: calculate_quality_score(acc, avg_err, stddev),
        }
    }).collect())
}

#[derive(Debug, serde::Serialize)]
pub struct ModelQualityMetrics {
    pub endpoint_id: Uuid,
    pub model_type: String,
    pub total_predictions: i64,
    pub avg_error_pct: f64,
    pub avg_absolute_error: f64,
    pub accuracy_pct: f64,
    pub error_stddev: f64,
    pub quality_score: f64,
}
