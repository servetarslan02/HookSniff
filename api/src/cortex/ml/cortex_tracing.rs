//! Cortex Distributed Tracing — Stage bazlı performans izleme
//!
//! Her Cortex stage'inin çalışmasını izler:
//! - Stage'ler arası süre ölçümü
//! - Yavaşlama tespiti
//! - Pipeline darboğaz analizi

use serde::{Deserialize, Serialize};
use sqlx::PgPool;

/// Cortex pipeline trace kaydı
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CortexTrace {
    pub run_id: String,
    pub stage_name: String,
    pub duration_ms: u64,
    pub items_processed: u64,
    pub status: String,         // success, error, timeout, skipped
    pub error_message: Option<String>,
    pub started_at: chrono::DateTime<chrono::Utc>,
    pub completed_at: chrono::DateTime<chrono::Utc>,
}

/// Stage performans özeti
#[derive(Debug, Serialize)]
pub struct StagePerformance {
    pub stage_name: String,
    pub avg_duration_ms: f64,
    pub p95_duration_ms: f64,
    pub max_duration_ms: u64,
    pub success_rate: f64,
    pub timeout_rate: f64,
    pub runs_last_24h: i64,
    pub trend: String,  // "improving", "degrading", "stable"
}

/// Pipeline geneli performans
#[derive(Debug, Serialize)]
pub struct PipelinePerformance {
    pub total_runs_last_24h: i64,
    pub avg_pipeline_duration_ms: f64,
    pub bottleneck_stage: String,
    pub slowest_stages: Vec<StagePerformance>,
    pub overall_success_rate: f64,
}

/// Cortex trace kaydet
pub async fn record_trace(
    pool: &PgPool,
    trace: &CortexTrace,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO cortex_traces (run_id, stage_name, duration_ms, items_processed, status, error_message, started_at, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)"
    )
    .bind(&trace.run_id)
    .bind(&trace.stage_name)
    .bind(trace.duration_ms as i64)
    .bind(trace.items_processed as i64)
    .bind(&trace.status)
    .bind(&trace.error_message)
    .bind(trace.started_at)
    .bind(trace.completed_at)
    .execute(pool)
    .await?;

    Ok(())
}

/// Tek bir stage'in performans analizi
pub async fn analyze_stage_performance(
    pool: &PgPool,
    stage_name: &str,
) -> Result<StagePerformance, sqlx::Error> {
    // Son 24 saatteki çalıştırma istatistikleri
    let stats: Option<(f64, i64, i64, i64)> = sqlx::query_as(
        "SELECT
            COALESCE(AVG(duration_ms), 0)::DOUBLE PRECISION as avg_dur,
            COUNT(*) as total_runs,
            COUNT(*) FILTER (WHERE status = 'success') as success_runs,
            COUNT(*) FILTER (WHERE status = 'timeout') as timeout_runs
         FROM cortex_traces
         WHERE stage_name = $1 AND completed_at > NOW() - INTERVAL '24 hours'"
    )
    .bind(stage_name)
    .fetch_optional(pool)
    .await?;

    let (avg_dur, total_runs, success_runs, timeout_runs) = stats.unwrap_or((0.0, 0, 0, 0));

    // P95 ve max duration
    let percentiles: Option<(Option<f64>, Option<i64>)> = sqlx::query_as(
        "SELECT
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95,
            MAX(duration_ms) as max_dur
         FROM cortex_traces
         WHERE stage_name = $1 AND completed_at > NOW() - INTERVAL '24 hours'"
    )
    .bind(stage_name)
    .fetch_optional(pool)
    .await?;

    let (p95_dur, max_dur) = percentiles.unwrap_or((None, None));
    let p95_dur = p95_dur.unwrap_or(0.0);
    let max_dur_int = max_dur.unwrap_or(0);

    // Trend: son 6 saat vs önceki 6 saat
    let recent_avg: Option<(f64,)> = sqlx::query_as(
        "SELECT COALESCE(AVG(duration_ms), 0) FROM cortex_traces
         WHERE stage_name = $1 AND completed_at > NOW() - INTERVAL '6 hours'"
    )
    .bind(stage_name)
    .fetch_optional(pool)
    .await?;

    let prev_avg: Option<(f64,)> = sqlx::query_as(
        "SELECT COALESCE(AVG(duration_ms), 0) FROM cortex_traces
         WHERE stage_name = $1 AND completed_at BETWEEN NOW() - INTERVAL '12 hours' AND NOW() - INTERVAL '6 hours'"
    )
    .bind(stage_name)
    .fetch_optional(pool)
    .await?;

    let recent = recent_avg.map(|(v,)| v).unwrap_or(0.0);
    let prev = prev_avg.map(|(v,)| v).unwrap_or(0.0);

    let trend = if recent > prev * 1.2 {
        "degrading".to_string()
    } else if recent < prev * 0.8 {
        "improving".to_string()
    } else {
        "stable".to_string()
    };

    let success_rate = if total_runs > 0 { success_runs as f64 / total_runs as f64 * 100.0 } else { 100.0 };
    let timeout_rate = if total_runs > 0 { timeout_runs as f64 / total_runs as f64 * 100.0 } else { 0.0 };

    Ok(StagePerformance {
        stage_name: stage_name.to_string(),
        avg_duration_ms: avg_dur,
        p95_duration_ms: p95_dur,
        max_duration_ms: max_dur_int as u64,
        success_rate,
        timeout_rate,
        runs_last_24h: total_runs,
        trend,
    })
}

/// Pipeline geneli performans analizi
pub async fn analyze_pipeline_performance(pool: &PgPool) -> Result<PipelinePerformance, sqlx::Error> {
    let stages = [
        "hourly_stats", "profile_update", "anomaly_scoring",
        "self_healing", "predictions", "ml_training",
        "drift_detection", "smart_routing", "insights",
    ];

    let mut performances = Vec::new();
    for stage in &stages {
        let perf = analyze_stage_performance(pool, stage).await?;
        performances.push(perf);
    }

    // En yavaş stage
    let bottleneck = performances.iter()
        .max_by(|a, b| a.avg_duration_ms.partial_cmp(&b.avg_duration_ms).unwrap())
        .map(|p| p.stage_name.clone())
        .unwrap_or_default();

    let total_runs: i64 = performances.iter().map(|p| p.runs_last_24h).sum();
    let avg_pipeline = if !performances.is_empty() {
        performances.iter().map(|p| p.avg_duration_ms).sum::<f64>() / performances.len() as f64
    } else {
        0.0
    };
    let overall_sr = if total_runs > 0 {
        performances.iter().map(|p| p.success_rate * p.runs_last_24h as f64).sum::<f64>() / total_runs as f64
    } else {
        100.0
    };

    // En yavaş 3 stage
    let mut slowest = performances;
    slowest.sort_by(|a, b| b.avg_duration_ms.partial_cmp(&a.avg_duration_ms).unwrap());
    slowest.truncate(3);

    Ok(PipelinePerformance {
        total_runs_last_24h: total_runs,
        avg_pipeline_duration_ms: avg_pipeline,
        bottleneck_stage: bottleneck,
        slowest_stages: slowest,
        overall_success_rate: overall_sr,
    })
}
