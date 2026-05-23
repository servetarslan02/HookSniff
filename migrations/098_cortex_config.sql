-- Cortex: Store cortex configuration in platform_settings
-- Uses existing platform_settings table with key='main'
-- Adds cortex_config JSON if not present
UPDATE platform_settings
SET value = value || '{"cortex_config": {
  "hourly_stats_enabled": true,
  "profile_update_interval_mins": 15,
  "anomaly_default_p95_ms": 5000,
  "anomaly_default_p99_ms": 10000,
  "anomaly_high_threshold": 70,
  "anomaly_weights": {"latency_spike": 0.30, "success_drop": 0.30, "error_burst": 0.20, "traffic_anomaly": 0.10, "consecutive_failures": 0.10},
  "auto_disable_days": 14,
  "cascade_threshold_pct": 20.0,
  "recovery_ramp_steps": [10.0, 20.0, 50.0, 100.0, 200.0],
  "recovery_step_interval_secs": 60,
  "recovery_min_success_rate": 95.0,
  "alert_correlation_window_mins": 5,
  "alert_correlation_min_count": 3,
  "predictive_failure_threshold": 0.7,
  "predictive_trend_threshold": -0.1,
  "predictive_momentum_threshold": -0.1,
  "error_breakdown_max_entries": 10,
  "action_memory_max_per_endpoint": 100,
  "adaptive_learning_min_samples": 5,
  "adaptive_learning_success_bonus": 0.05,
  "adaptive_learning_failure_penalty": 0.10
}}'::jsonb
WHERE key = 'main'
AND NOT (value ? 'cortex_config');

-- If platform_settings doesn't have a 'main' row, create it
INSERT INTO platform_settings (key, value)
SELECT 'main', '{"cortex_config": {
  "hourly_stats_enabled": true,
  "profile_update_interval_mins": 15,
  "anomaly_default_p95_ms": 5000,
  "anomaly_default_p99_ms": 10000,
  "anomaly_high_threshold": 70,
  "anomaly_weights": {"latency_spike": 0.30, "success_drop": 0.30, "error_burst": 0.20, "traffic_anomaly": 0.10, "consecutive_failures": 0.10},
  "auto_disable_days": 14,
  "cascade_threshold_pct": 20.0,
  "recovery_ramp_steps": [10.0, 20.0, 50.0, 100.0, 200.0],
  "recovery_step_interval_secs": 60,
  "recovery_min_success_rate": 95.0,
  "alert_correlation_window_mins": 5,
  "alert_correlation_min_count": 3,
  "predictive_failure_threshold": 0.7,
  "predictive_trend_threshold": -0.1,
  "predictive_momentum_threshold": -0.1,
  "error_breakdown_max_entries": 10,
  "action_memory_max_per_endpoint": 100,
  "adaptive_learning_min_samples": 5,
  "adaptive_learning_success_bonus": 0.05,
  "adaptive_learning_failure_penalty": 0.10
}}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM platform_settings WHERE key = 'main');
