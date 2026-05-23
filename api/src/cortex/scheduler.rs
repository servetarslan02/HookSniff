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
    CortexStage::MlTraining,
    CortexStage::MlQualityCheck,
    CortexStage::Insights,
];

/// Check if a stage should run now
fn should_run_stage(stage: CortexStage, last_run: Option<Instant>) -> bool {
    let interval = stage.interval_secs();
    let offset = stage.offset_secs();
    let now = chrono::Utc::now();
    let secs_since_midnight = now.num_seconds_from_midnight() as u64;

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

    if !super::try_cortex_lock(pool, lock_name, timeout.as_secs() as i64).await {
        tracing::debug!("⏭️  Cortex [{}] — lock busy, skipping", stage.name());
        return StageResult {
            stage: stage.name(),
            outcome: StageOutcome::Skipped("lock_busy"),
            duration_ms: 0,
        };
    }

    let result = tokio::time::timeout(timeout, execute_stage(pool, stage, config)).await;

    super::release_cortex_lock(pool, lock_name).await;

    let duration_ms = start.elapsed().as_millis() as u64;

    match result {
        Ok(Ok(count)) => {
            tracing::info!(
                "✅ Cortex [{}] — {} items in {}ms",
                stage.name(), count, duration_ms
            );
            StageResult { stage: stage.name(), outcome: StageOutcome::Success(count), duration_ms }
        }
        Ok(Err(e)) => {
            tracing::error!("❌ Cortex [{}]: {:?}", stage.name(), e);
            StageResult { stage: stage.name(), outcome: StageOutcome::Error(format!("{:?}", e)), duration_ms }
        }
        Err(_) => {
            tracing::warn!("⏰ Cortex [{}] timed out after {}s", stage.name(), timeout.as_secs());
            StageResult { stage: stage.name(), outcome: StageOutcome::Timeout, duration_ms }
        }
    }
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
            let endpoints: Vec<(uuid::Uuid,)> = sqlx::query_as(
                "SELECT id FROM endpoints WHERE is_active = true"
            ).fetch_all(pool).await?;
            let mut scored = 0u64;
            for (eid,) in &endpoints {
                if let Ok(Some(result)) = super::anomaly_scorer::score_endpoint(pool, *eid, config).await {
                    if result.score > config.anomaly_high_threshold {
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
        tracing::info!("🧠 Cortex Scheduler started — tick every 30s, 9 stages");

        let mut last_runs: [Option<Instant>; 9] = [None; 9];
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
