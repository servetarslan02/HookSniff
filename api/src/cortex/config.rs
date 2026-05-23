use serde::{Deserialize, Serialize};

/// Cortex configuration — all thresholds are configurable via platform_settings.
/// Loaded once per job cycle. If key is missing, defaults are used.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CortexConfig {
    pub hourly_stats_enabled: bool,
    pub profile_update_interval_mins: i64,
    pub anomaly_default_p95_ms: i32,
    pub anomaly_default_p99_ms: i32,
    pub anomaly_high_threshold: i32,
    pub anomaly_weights: AnomalyWeights,
    pub auto_disable_days: i64,
    pub cascade_threshold_pct: f64,
    pub recovery_ramp_steps: Vec<f64>,
    pub recovery_step_interval_secs: i64,
    pub recovery_min_success_rate: f64,
    pub alert_correlation_window_mins: i64,
    pub alert_correlation_min_count: i32,
    pub predictive_failure_threshold: f64,
    pub predictive_trend_threshold: f64,
    pub predictive_momentum_threshold: f64,
    pub error_breakdown_max_entries: i32,
    pub action_memory_max_per_endpoint: i32,
    pub adaptive_learning_min_samples: i32,
    pub adaptive_learning_success_bonus: f64,
    pub adaptive_learning_failure_penalty: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnomalyWeights {
    pub latency_spike: f64,
    pub success_drop: f64,
    pub error_burst: f64,
    pub traffic_anomaly: f64,
    pub consecutive_failures: f64,
}

impl Default for AnomalyWeights {
    fn default() -> Self {
        Self {
            latency_spike: 0.30,
            success_drop: 0.30,
            error_burst: 0.20,
            traffic_anomaly: 0.10,
            consecutive_failures: 0.10,
        }
    }
}

impl Default for CortexConfig {
    fn default() -> Self {
        Self {
            hourly_stats_enabled: true,
            profile_update_interval_mins: 15,
            anomaly_default_p95_ms: 5000,
            anomaly_default_p99_ms: 10000,
            anomaly_high_threshold: 70,
            anomaly_weights: AnomalyWeights::default(),
            auto_disable_days: 14,
            cascade_threshold_pct: 20.0,
            recovery_ramp_steps: vec![10.0, 20.0, 50.0, 100.0, 200.0],
            recovery_step_interval_secs: 60,
            recovery_min_success_rate: 95.0,
            alert_correlation_window_mins: 5,
            alert_correlation_min_count: 3,
            predictive_failure_threshold: 0.7,
            predictive_trend_threshold: -0.1,
            predictive_momentum_threshold: -0.1,
            error_breakdown_max_entries: 10,
            action_memory_max_per_endpoint: 100,
            adaptive_learning_min_samples: 5,
            adaptive_learning_success_bonus: 0.05,
            adaptive_learning_failure_penalty: 0.10,
        }
    }
}

impl CortexConfig {
    pub async fn load(pool: &sqlx::PgPool) -> Self {
        let result: Option<(serde_json::Value,)> = sqlx::query_as(
            "SELECT COALESCE(value->'cortex_config', '{}') FROM platform_settings WHERE key = 'main'"
        )
        .fetch_optional(pool)
        .await
        .unwrap_or(None);

        match result {
            Some((json,)) => serde_json::from_value(json).unwrap_or_default(),
            _ => Self::default(),
        }
    }
}
