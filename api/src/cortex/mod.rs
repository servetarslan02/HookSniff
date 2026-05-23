//! Cortex — HookSniff Akıllı Sistem Motoru
//!
//! Her modül bağımsız çalışır, birbiriyle PostgreSQL üzerinden iletişim kurur.
//! Tüm eşikler CortexConfig'den okunur (platform_settings.cortex_config).

pub mod config;
pub mod ml;
pub mod signal_collector;
pub mod profile_engine;
pub mod anomaly_scorer;
pub mod alert_correlation;
pub mod healing_engine;
pub mod action_memory;
pub mod recovery_surge;
pub mod predictive_engine;
pub mod insights_engine;
pub mod smart_routing;
pub mod proactive_healing;
pub mod scheduler;

pub use config::CortexConfig;

use std::sync::atomic::{AtomicU64, Ordering};

/// Cortex Prometheus metrics (all stages share this)
#[derive(Debug)]
pub struct CortexMetrics {
    pub hourly_stats_runs: AtomicU64,
    pub hourly_stats_endpoints: AtomicU64,
    pub hourly_stats_errors: AtomicU64,
    pub profile_updates: AtomicU64,
    pub profile_errors: AtomicU64,
    pub anomaly_scores_high: AtomicU64,
    pub alerts_correlated: AtomicU64,
    pub healing_actions: AtomicU64,
    pub cascade_detections: AtomicU64,
    pub action_memory_records: AtomicU64,
    pub recovery_surges_started: AtomicU64,
    pub recovery_surges_completed: AtomicU64,
    pub predictions_generated: AtomicU64,
    pub insights_generated: AtomicU64,
    pub routing_decisions: AtomicU64,
}

pub static CORTEX_METRICS: CortexMetrics = CortexMetrics {
    hourly_stats_runs: AtomicU64::new(0),
    hourly_stats_endpoints: AtomicU64::new(0),
    hourly_stats_errors: AtomicU64::new(0),
    profile_updates: AtomicU64::new(0),
    profile_errors: AtomicU64::new(0),
    anomaly_scores_high: AtomicU64::new(0),
    alerts_correlated: AtomicU64::new(0),
    healing_actions: AtomicU64::new(0),
    cascade_detections: AtomicU64::new(0),
    action_memory_records: AtomicU64::new(0),
    recovery_surges_started: AtomicU64::new(0),
    recovery_surges_completed: AtomicU64::new(0),
    predictions_generated: AtomicU64::new(0),
    insights_generated: AtomicU64::new(0),
    routing_decisions: AtomicU64::new(0),
};

impl CortexMetrics {
    pub fn to_prometheus(&self) -> String {
        let mut out = String::with_capacity(2048);
        out.push_str("# HELP cortex_hourly_stats_runs_total Total hourly stats aggregation runs\n");
        out.push_str("# TYPE cortex_hourly_stats_runs_total counter\n");
        out.push_str(&format!("cortex_hourly_stats_runs_total {}\n", self.hourly_stats_runs.load(Ordering::Relaxed)));
        out.push_str(&format!("cortex_hourly_stats_endpoints_processed {}\n", self.hourly_stats_endpoints.load(Ordering::Relaxed)));
        out.push_str(&format!("cortex_hourly_stats_errors_total {}\n", self.hourly_stats_errors.load(Ordering::Relaxed)));
        out.push_str(&format!("cortex_profile_updates_total {}\n", self.profile_updates.load(Ordering::Relaxed)));
        out.push_str(&format!("cortex_profile_errors_total {}\n", self.profile_errors.load(Ordering::Relaxed)));
        out.push_str(&format!("cortex_anomaly_scores_high_total {}\n", self.anomaly_scores_high.load(Ordering::Relaxed)));
        out.push_str(&format!("cortex_alerts_correlated_total {}\n", self.alerts_correlated.load(Ordering::Relaxed)));
        out.push_str(&format!("cortex_healing_actions_total {}\n", self.healing_actions.load(Ordering::Relaxed)));
        out.push_str(&format!("cortex_cascade_detections_total {}\n", self.cascade_detections.load(Ordering::Relaxed)));
        out.push_str(&format!("cortex_action_memory_records_total {}\n", self.action_memory_records.load(Ordering::Relaxed)));
        out.push_str(&format!("cortex_recovery_surges_started_total {}\n", self.recovery_surges_started.load(Ordering::Relaxed)));
        out.push_str(&format!("cortex_recovery_surges_completed_total {}\n", self.recovery_surges_completed.load(Ordering::Relaxed)));
        out.push_str(&format!("cortex_predictions_generated_total {}\n", self.predictions_generated.load(Ordering::Relaxed)));
        out.push_str(&format!("cortex_insights_generated_total {}\n", self.insights_generated.load(Ordering::Relaxed)));
        out.push_str(&format!("cortex_routing_decisions_total {}\n", self.routing_decisions.load(Ordering::Relaxed)));
        out
    }
}

/// Distributed lock for Cortex jobs (PostgreSQL advisory locks)
/// Prevents duplicate work when multiple API instances are running.
pub async fn try_cortex_lock(pool: &sqlx::PgPool, lock_name: &str, _ttl_secs: i64) -> bool {
    let lock_id = match lock_name {
        "cortex_hourly" => 9001i64,
        "cortex_profile" => 9002,
        "cortex_healing" => 9003,
        "cortex_surge" => 9004,
        "cortex_predict" => 9005,
        "cortex_report" => 9006,
        "cortex_routing" => 9007,
        "cortex_anomaly" => 9008,
        "cortex_correlation" => 9009,
        "cortex_memory" => 9010,
        "cortex_ml" => 9011,
        "cortex_proactive" => 9012,
        "cortex_ml_quality" => 9013,
        _ => 9099,
    };
    let result: (bool,) = sqlx::query_as("SELECT pg_try_advisory_lock($1)")
        .bind(lock_id)
        .fetch_one(pool)
        .await
        .unwrap_or((false,));
    result.0
}

pub async fn release_cortex_lock(pool: &sqlx::PgPool, lock_name: &str) {
    let lock_id = match lock_name {
        "cortex_hourly" => 9001i64,
        "cortex_profile" => 9002,
        "cortex_healing" => 9003,
        "cortex_surge" => 9004,
        "cortex_predict" => 9005,
        "cortex_report" => 9006,
        "cortex_routing" => 9007,
        "cortex_anomaly" => 9008,
        "cortex_correlation" => 9009,
        "cortex_memory" => 9010,
        "cortex_ml" => 9011,
        "cortex_proactive" => 9012,
        "cortex_ml_quality" => 9013,
        _ => 9099,
    };
    let _ = sqlx::query("SELECT pg_advisory_unlock($1)")
        .bind(lock_id)
        .execute(pool)
        .await;
}

/// Format cortex metrics for Prometheus /metrics endpoint
pub fn format_cortex_metrics(existing: &str) -> String {
    let mut out = existing.to_string();
    out.push_str(&CORTEX_METRICS.to_prometheus());
    out
}
