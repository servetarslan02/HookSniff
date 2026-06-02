//! Cortex Central Scheduler — Production-Grade Job Orchestrator
//!
//! Single task manages ALL Cortex stages with:
//! - Dependency ordering (hourly → profile → anomaly → healing → predictions → ML → insights)
//! - Tick-based timing (no drift, no overlap)
//! - Per-stage timeout protection
//! - Structured logging with stage names
//! - Graceful error isolation (one stage failure doesn't affect others)
//! - Distributed lock support (multi-instance safe)

use sqlx::PgPool;
use tokio::time::{Duration, Instant};
use chrono::Timelike;

/// All Cortex stages in dependency order
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CortexStage {
    HourlyStats,
    ProfileUpdate,
    AnomalyScoring,
    AlertCorrelation,
    SelfHealing,
    ProactiveHealing,
    Predictions,
    Insights,
    MlTraining,
    MlQualityCheck,
    SmartRouting,
    DriftDetection,
    CleanupJob,
}

impl CortexStage {
    pub fn name(&self) -> &'static str {
        match self {
            Self::HourlyStats => "hourly_stats",
            Self::ProfileUpdate => "profile_update",
            Self::AnomalyScoring => "anomaly_scoring",
            Self::AlertCorrelation => "alert_correlation",
            Self::SelfHealing => "self_healing",
            Self::ProactiveHealing => "proactive_healing",
            Self::Predictions => "predictions",
            Self::Insights => "insights",
            Self::MlTraining => "ml_training",
            Self::MlQualityCheck => "ml_quality_check",
            Self::SmartRouting => "smart_routing",
            Self::DriftDetection => "drift_detection",
            Self::CleanupJob => "cleanup_job",
        }
    }

    pub fn lock_name(&self) -> &'static str {
        match self {
            Self::HourlyStats => "cortex_hourly",
            Self::ProfileUpdate => "cortex_profile",
            Self::AnomalyScoring => "cortex_anomaly",
            Self::AlertCorrelation => "cortex_correlation",
            Self::SelfHealing => "cortex_healing",
            Self::ProactiveHealing => "cortex_proactive",
            Self::Predictions => "cortex_predict",
            Self::Insights => "cortex_report",
            Self::MlTraining => "cortex_ml",
            Self::MlQualityCheck => "cortex_ml_quality",
            Self::SmartRouting => "cortex_routing",
            Self::DriftDetection => "cortex_drift",
            Self::CleanupJob => "cortex_cleanup",
        }
    }

    /// Timeout for this stage (prevents hung jobs from blocking everything)
    pub fn timeout(&self) -> Duration {
        match self {
            Self::HourlyStats => Duration::from_secs(300),
            Self::ProfileUpdate => Duration::from_secs(600),
            Self::AnomalyScoring => Duration::from_secs(300),
            Self::AlertCorrelation => Duration::from_secs(120),
            Self::SelfHealing => Duration::from_secs(300),
            Self::ProactiveHealing => Duration::from_secs(300),
            Self::Predictions => Duration::from_secs(300),
            Self::Insights => Duration::from_secs(600),
            Self::MlTraining => Duration::from_secs(900),
            Self::MlQualityCheck => Duration::from_secs(120),
            Self::SmartRouting => Duration::from_secs(120),
            Self::DriftDetection => Duration::from_secs(300),
            Self::CleanupJob => Duration::from_secs(300),
        }
    }

    /// Interval between runs in seconds
    pub fn interval_secs(&self) -> u64 {
        match self {
            Self::HourlyStats => 3600,      // 1 hour
            Self::ProfileUpdate => 900,     // 15 min
            Self::AnomalyScoring => 300,    // 5 min
            Self::AlertCorrelation => 300,  // 5 min
            Self::SelfHealing => 300,       // 5 min
            Self::ProactiveHealing => 900,  // 15 min
            Self::Predictions => 900,       // 15 min
            Self::Insights => 86400,        // 24 hours
            Self::MlTraining => 900,        // 15 min
            Self::MlQualityCheck => 3600,   // 1 hour
            Self::SmartRouting => 900,      // 15 min
            Self::DriftDetection => 600,     // 10 min
            Self::CleanupJob => 86400,     // 24 hours
        }
    }

    /// Offset from the interval boundary (ensures dependency ordering)
    pub fn offset_secs(&self) -> u64 {
        match self {
            Self::HourlyStats => 60,        // minute 1
            Self::ProfileUpdate => 120,     // minute 2
            Self::AnomalyScoring => 180,    // minute 3
            Self::AlertCorrelation => 240,  // minute 4
            Self::SelfHealing => 300,       // minute 5
            Self::ProactiveHealing => 360,  // minute 6
            Self::Predictions => 420,       // minute 7
            Self::SmartRouting => 480,      // minute 8
            Self::MlTraining => 600,        // minute 10
            Self::MlQualityCheck => 660,    // minute 11
            Self::Insights => 7200,         // 02:00 UTC
            Self::DriftDetection => 540,     // minute 9
            Self::CleanupJob => 7800,     // 02:30 UTC
        }
    }
}

/// All stages in execution order
const ALL_STAGES: &[CortexStage] = &[
    CortexStage::HourlyStats,
    CortexStage::ProfileUpdate,
    CortexStage::AnomalyScoring,
    CortexStage::AlertCorrelation,
    CortexStage::SelfHealing,
    CortexStage::ProactiveHealing,
    CortexStage::Predictions,
    CortexStage::SmartRouting,
    CortexStage::DriftDetection,
    CortexStage::MlTraining,
    CortexStage::MlQualityCheck,
    CortexStage::Insights,
    CortexStage::CleanupJob,
];

/// Check if a stage should run now
fn should_run_stage(stage: CortexStage, last_run: Option<Instant>) -> bool {
    let interval = stage.interval_secs();
    let offset = stage.offset_secs();
    let now = chrono::Utc::now();
    let secs_since_midnight = (now.hour() * 3600 + now.minute() * 60 + now.second()) as u64;

    // First run: check if we're within the offset window
    if last_run.is_none() {
        if interval < 86400 {
            let within = secs_since_midnight % interval;
            return within >= offset && within < offset + 60;
        }
        return secs_since_midnight >= offset && secs_since_midnight < offset + 60;
    }

    // Subsequent runs: check elapsed time + offset alignment
    if let Some(last) = last_run {
        if last.elapsed().as_secs() < interval {
            return false;
        }
        if interval < 86400 {
            let within = secs_since_midnight % interval;
            return within >= offset && within < offset + 60;
        }
        return secs_since_midnight >= offset && secs_since_midnight < offset + 60;
    }

    false
}

/// Run a single stage with timeout and error isolation
async fn run_stage_with_timeout(
    pool: &PgPool,
    stage: CortexStage,
    config: &super::CortexConfig,
) -> StageResult {
    let start = Instant::now();
    let timeout = stage.timeout();
    let lock_name = stage.lock_name();
    let run_id = uuid::Uuid::new_v4().to_string();
    let started_at = chrono::Utc::now();

    let mut lock_conn = match super::try_cortex_lock(pool, lock_name, timeout.as_secs() as i64).await {
        Some(conn) => conn,
        None => {
            tracing::debug!("⏭️  Cortex [{}] — lock busy, skipping", stage.name());
            let _ = super::ml::cortex_tracing::record_trace(pool, &super::ml::cortex_tracing::CortexTrace {
                run_id: run_id.clone(),
                stage_name: stage.name().to_string(),
                duration_ms: 0,
                items_processed: 0,
                status: "skipped".to_string(),
                error_message: Some("lock_busy".to_string()),
                started_at,
                completed_at: chrono::Utc::now(),
            }).await;
            return StageResult {
                stage: stage.name(),
                outcome: StageOutcome::Skipped("lock_busy"),
                duration_ms: 0,
            };
        }
    };

    let result = tokio::time::timeout(timeout, execute_stage(pool, stage, config)).await;

    // Release lock on the SAME connection, then return to pool
    super::release_cortex_lock(&mut lock_conn, lock_name).await;

    let duration_ms = start.elapsed().as_millis() as u64;
    let completed_at = chrono::Utc::now();

    let (outcome, trace_status, items, error_msg) = match &result {
        Ok(Ok(count)) => {
            tracing::info!(
                "✅ Cortex [{}] — {} items in {}ms",
                stage.name(), count, duration_ms
            );
            (
                StageResult { stage: stage.name(), outcome: StageOutcome::Success(*count), duration_ms },
                "success", *count, None
            )
        }
        Ok(Err(e)) => {
            tracing::error!("❌ Cortex [{}]: {:?}", stage.name(), e);
            (
                StageResult { stage: stage.name(), outcome: StageOutcome::Error(format!("{:?}", e)), duration_ms },
                "error", 0, Some(format!("{:?}", e))
            )
        }
        Err(_) => {
            tracing::warn!("⏰ Cortex [{}] timed out after {}s", stage.name(), timeout.as_secs());
            (
                StageResult { stage: stage.name(), outcome: StageOutcome::Timeout, duration_ms },
                "timeout", 0, Some("timeout".to_string())
            )
        }
    };

    // Record trace (best-effort, non-blocking)
    let _ = super::ml::cortex_tracing::record_trace(pool, &super::ml::cortex_tracing::CortexTrace {
        run_id,
        stage_name: stage.name().to_string(),
        duration_ms,
        items_processed: items,
        status: trace_status.to_string(),
        error_message: error_msg,
        started_at,
        completed_at,
    }).await;

    outcome
}

/// Execute a single stage, returning the number of items processed
async fn execute_stage(
    pool: &PgPool,
    stage: CortexStage,
    config: &super::CortexConfig,
) -> Result<u64, Box<dyn std::error::Error + Send + Sync>> {
    match stage {
        CortexStage::HourlyStats => {
            let now = chrono::Utc::now();
            let hour_start_secs = (now.timestamp() / 3600 - 1) * 3600;
            let hour_start = chrono::DateTime::from_timestamp(hour_start_secs, 0).unwrap_or(now);
            let n = super::signal_collector::aggregate_hourly_stats(pool, hour_start).await?;
            super::CORTEX_METRICS.hourly_stats_runs.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
            super::CORTEX_METRICS.hourly_stats_endpoints.fetch_add(n, std::sync::atomic::Ordering::Relaxed);
            Ok(n)
        }
        CortexStage::ProfileUpdate => {
            let n = super::profile_engine::update_all_profiles(pool).await?;
            super::CORTEX_METRICS.profile_updates.fetch_add(n, std::sync::atomic::Ordering::Relaxed);
            Ok(n)
        }
        CortexStage::AnomalyScoring => {
            // Batch fetch: all active endpoints with their latest stats in ONE query
            let rows: Vec<(uuid::Uuid, i32, i32, i32, f64, f64, f64, f64, serde_json::Value)> = sqlx::query_as(
                r#"
                WITH latest_stats AS (
                    SELECT DISTINCT ON (endpoint_id)
                        endpoint_id, total_deliveries, successful, failed,
                        avg_latency_ms, p95_latency_ms, error_breakdown
                    FROM endpoint_hourly_stats
                    ORDER BY endpoint_id, hour_start DESC
                )
                SELECT
                    e.id,
                    COALESCE(ls.total_deliveries, 0),
                    COALESCE(ls.successful, 0),
                    COALESCE(ls.failed, 0),
                    COALESCE(p.latency_p95, $1)::FLOAT,
                    COALESCE(p.latency_p99, $2)::FLOAT,
                    COALESCE(p.success_rate_1h, 100.0)::FLOAT,
                    COALESCE(p.avg_deliveries_per_hour, 0.0)::FLOAT,
                    COALESCE(ls.error_breakdown, '{}'::jsonb)
                FROM endpoints e
                LEFT JOIN latest_stats ls ON ls.endpoint_id = e.id
                LEFT JOIN endpoint_profiles p ON p.endpoint_id = e.id
                WHERE e.is_active = true
                "#
            )
            .bind(config.anomaly_default_p95_ms)
            .bind(config.anomaly_default_p99_ms)
            .fetch_all(pool).await?;

            let mut scored = 0u64;
            for (eid, total, successful, failed, _p95, _p99, sr_1h, avg_per_hour, _errors) in &rows {
                if *total == 0 { continue; }
                let result = super::anomaly_scorer::score_endpoint_from_stats(
                    pool, *eid, *total, *successful, *failed, *sr_1h, *avg_per_hour, config,
                ).await;
                if let Ok(Some(r)) = result {
                    if r.score > config.anomaly_high_threshold {
                        super::CORTEX_METRICS.anomaly_scores_high.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                    }
                    scored += 1;
                }
            }
            Ok(scored)
        }
        CortexStage::AlertCorrelation => {
            if let Some(_id) = super::alert_correlation::correlate_alerts(pool, config).await? {
                super::CORTEX_METRICS.alerts_correlated.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                Ok(1)
            } else {
                Ok(0)
            }
        }
        CortexStage::SelfHealing => {
            let n = super::healing_engine::run_healing(pool, config).await?;

            // Trigger recovery surge for endpoints with high failure streaks
            let stuck_endpoints: Vec<(uuid::Uuid,)> = sqlx::query_as(
                "SELECT id FROM endpoints WHERE failure_streak >= 5 AND is_active = true AND (auto_disabled = false OR auto_disabled IS NULL)"
            ).fetch_all(pool).await.unwrap_or_default();

            for (eid,) in &stuck_endpoints {
                // Check if surge already running
                let existing: Option<(String,)> = sqlx::query_as(
                    "SELECT status FROM recovery_surges WHERE endpoint_id = $1 AND status IN ('active', 'ramping')"
                ).bind(eid).fetch_optional(pool).await.unwrap_or(None);

                if existing.is_none() {
                    // Get queued count for this endpoint
                    let queued: (i32,) = sqlx::query_as(
                        "SELECT COUNT(*)::integer FROM webhook_queue WHERE endpoint_id = $1 AND status = 'pending'"
                    ).bind(eid).fetch_one(pool).await.unwrap_or((0,));

                    if queued.0 > 0 {
                        if let Err(e) = super::recovery_surge::start_surge(pool, *eid, queued.0, config).await {
                            tracing::debug!("Surge start skipped for {}: {:?}", eid, e);
                        } else {
                            tracing::info!("🚀 Recovery surge triggered for endpoint {} ({} queued)", eid, queued.0);
                        }
                    }
                }
            }
            Ok(n)
        }
        CortexStage::ProactiveHealing => {
            let n = super::proactive_healing::run_proactive(pool, config).await?;
            Ok(n)
        }
        CortexStage::Predictions => {
            let n = super::predictive_engine::run_predictions(pool, config).await?;
            Ok(n)
        }
        CortexStage::Insights => {
            let n = super::insights_engine::generate_insights(pool, config).await?;
            Ok(n)
        }
        CortexStage::MlTraining => {
            let n = super::ml::train_all(pool).await?;
            Ok(n)
        }
        CortexStage::MlQualityCheck => {
            // Check model quality and reset degraded models
            let reset_count = super::ml::quality_tracker::check_and_reset_degraded_models(pool, 60.0).await?;
            if reset_count > 0 {
                tracing::info!("🧠 ML Quality: reset {} degraded models", reset_count);
            }
            // Get quality summary for logging
            if let Ok(summary) = super::ml::quality_tracker::get_quality_summary(pool).await {
                for m in &summary {
                    if m.quality_score < 50.0 {
                        tracing::warn!(
                            "🧠 ML Quality: endpoint {} model '{}' score {:.0}% (accuracy {:.0}%)",
                            m.endpoint_id, m.model_type, m.quality_score, m.accuracy_pct
                        );
                    }
                }
            }
            Ok(reset_count)
        }
        CortexStage::SmartRouting => {
            let endpoints: Vec<(uuid::Uuid,)> = sqlx::query_as(
                "SELECT id FROM endpoints WHERE is_active = true AND routing_config IS NOT NULL"
            ).fetch_all(pool).await?;
            let mut decisions = 0u64;
            for (eid,) in &endpoints {
                if let Ok(Some(_)) = super::smart_routing::decide_routing(pool, *eid).await {
                    decisions += 1;
                }
            }
            super::CORTEX_METRICS.routing_decisions.fetch_add(decisions, std::sync::atomic::Ordering::Relaxed);
            Ok(decisions)
        }
        CortexStage::DriftDetection => {
            // BATCH: Fetch ALL endpoint stats in ONE query instead of N queries
            let all_stats: Vec<(uuid::Uuid, f64, f64)> = sqlx::query_as(
                r#"
                WITH latest AS (
                    SELECT DISTINCT ON (endpoint_id)
                        endpoint_id,
                        COALESCE(total_deliveries, 0)::FLOAT as total,
                        COALESCE(successful, 0)::FLOAT as ok,
                        COALESCE(avg_latency_ms, 0)::FLOAT as latency
                    FROM endpoint_hourly_stats
                    ORDER BY endpoint_id, hour_start DESC
                )
                SELECT endpoint_id,
                    CASE WHEN total > 0 THEN ok / total * 100.0 ELSE 100.0 END,
                    latency
                FROM latest
                "#
            ).fetch_all(pool).await?;

            let mut drift_count = 0u64;
            for (eid, sr, latency) in &all_stats {
                let mut analyzer = super::ml::drift_detection::load_or_create_analyzer(pool, *eid).await?;

                let result = analyzer.analyze(*sr, *latency);

                super::ml::drift_detection::save_analyzer_state(pool, *eid, &analyzer).await?;

                if result.is_drifting {
                    drift_count += 1;
                    let event_id = super::ml::drift_detection::record_drift_event(pool, *eid, &result).await?;

                    tracing::warn!(
                        "🔀 Drift detected for endpoint {}: type={}, severity={:.2}, features={:?}, action={}, event_id={}",
                        eid, result.drift_type, result.severity, result.features_affected, result.recommended_action, event_id
                    );

                    if result.severity > 0.7 {
                        if let Err(e) = super::ml::train_endpoint_for_drift(pool, *eid).await {
                            tracing::error!("Failed to retrain after drift for {}: {:?}", eid, e);
                        } else {
                            tracing::info!("🔄 Retrained models for endpoint {} after drift", eid);
                            sqlx::query("UPDATE ml_models SET parameters = jsonb_set(parameters, '{baseline_collected}', 'false') WHERE endpoint_id = $1 AND model_type = 'drift_detector'")
                                .bind(eid).execute(pool).await?;
                        }
                    }
                }
            }
            if drift_count > 0 {
                super::CORTEX_METRICS.drift_detected.fetch_add(drift_count, std::sync::atomic::Ordering::Relaxed);
            }
            Ok(drift_count)
        }
        CortexStage::CleanupJob => {
            let mut cleaned = 0u64;

            // 1. Prune old model versions (keep last 10 per model)
            if let Ok(n) = super::ml::versioning::prune_old_versions(pool, 10).await {
                cleaned += n;
                if n > 0 { tracing::info!("🧹 Cleanup: pruned {} old model versions", n); }
            }

            // 2. Clean old cortex traces (90 days)
            if let Ok(r) = sqlx::query("DELETE FROM cortex_traces WHERE completed_at < NOW() - INTERVAL '90 days'")
                .execute(pool).await {
                cleaned += r.rows_affected();
            }

            // 3. Clean old drift events (180 days)
            if let Ok(r) = sqlx::query("DELETE FROM ml_drift_events WHERE created_at < NOW() - INTERVAL '180 days'")
                .execute(pool).await {
                cleaned += r.rows_affected();
            }

            // 4. Clean old chaos tests (90 days)
            if let Ok(r) = sqlx::query("DELETE FROM chaos_tests WHERE started_at < NOW() - INTERVAL '90 days'")
                .execute(pool).await {
                cleaned += r.rows_affected();
            }

            // 5. Clean old AutoML trials (90 days)
            if let Ok(r) = sqlx::query("DELETE FROM automl_trials WHERE created_at < NOW() - INTERVAL '90 days'")
                .execute(pool).await {
                cleaned += r.rows_affected();
            }

            // 6. Clean old A/B test decisions (90 days)
            if let Ok(r) = sqlx::query("DELETE FROM ab_test_decisions WHERE created_at < NOW() - INTERVAL '90 days'")
                .execute(pool).await {
                cleaned += r.rows_affected();
            }

            // 7. Expire feature store cache
            super::ml::feature_store::FEATURE_STORE.evict_expired();

            if cleaned > 0 {
                tracing::info!("🧹 Cleanup: removed {} total old records", cleaned);
            }
            Ok(cleaned)
        }
    }
}

/// Result of a single stage execution
struct StageResult {
    stage: &'static str,
    outcome: StageOutcome,
    duration_ms: u64,
}

enum StageOutcome {
    Success(u64),
    Skipped(&'static str),
    Error(String),
    Timeout,
}

/// Start the central Cortex scheduler.
/// Call this ONCE from main.rs — replaces all individual tokio::spawn stage tasks.
pub fn start_cortex_scheduler(pool: PgPool) {
    tokio::spawn(async move {
        tracing::info!("🧠 Cortex Scheduler started — tick every 30s, {} stages", ALL_STAGES.len());

        let mut last_runs: Vec<Option<Instant>> = vec![None; ALL_STAGES.len()];
        let mut ticker = tokio::time::interval(Duration::from_secs(30));
        let mut tick_count: u64 = 0;

        loop {
            ticker.tick().await;
            tick_count += 1;

            let config = super::CortexConfig::load(&pool).await;

            for (i, &stage) in ALL_STAGES.iter().enumerate() {
                if !should_run_stage(stage, last_runs[i]) {
                    continue;
                }

                let result = run_stage_with_timeout(&pool, stage, &config).await;
                last_runs[i] = Some(Instant::now());

                // Periodic summary log (every 10 ticks ≈ 5 min)
                if tick_count % 10 == 0 {
                    let summary = match &result.outcome {
                        StageOutcome::Success(n) => format!("{} items", n),
                        StageOutcome::Skipped(r) => format!("skipped: {}", r),
                        StageOutcome::Error(e) => format!("error: {}", e),
                        StageOutcome::Timeout => "timeout".to_string(),
                    };
                    tracing::info!(
                        "🧠 Cortex tick #{} — [{}] {} ({}ms)",
                        tick_count, result.stage, summary, result.duration_ms
                    );
                }
            }
        }
    });
}
