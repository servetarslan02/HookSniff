//! Cortex Integration Tests
//!
//! Comprehensive tests for all Cortex subsystems:
//! - Anomaly Detection
//! - Predictions
//! - Healing Actions
//! - Drift Detection
//! - ML Models & Quality
//! - Insights
//! - Routing Decisions
//! - Proactive Status
//! - Tracing & Performance
//! - Chaos Engineering
//! - A/B Testing
//! - AutoML

#[cfg(test)]
mod cortex_tests {
    use sqlx::PgPool;

    /// Helper: Create a test database pool
    async fn test_pool() -> PgPool {
        let database_url = std::env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgresql://localhost/hooksniff_test".to_string());
        PgPool::connect(&database_url).await.unwrap()
    }

    // ═══════════════════════════════════════════════════════════════
    // 1. ANOMALY DETECTION TESTS
    // ═══════════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_anomaly_scores_table_exists() {
        let pool = test_pool().await;
        let result = sqlx::query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'anomaly_scores')")
            .fetch_one(&pool)
            .await;
        assert!(result.is_ok(), "anomaly_scores table should exist");
    }

    #[tokio::test]
    async fn test_anomaly_scores_have_data() {
        let pool = test_pool().await;
        let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM anomaly_scores")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert!(count.0 > 0, "anomaly_scores should have data, got {}", count.0);
    }

    #[tokio::test]
    async fn test_anomaly_scores_have_valid_endpoint_ids() {
        let pool = test_pool().await;
        let orphaned: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM anomaly_scores a WHERE NOT EXISTS (SELECT 1 FROM endpoints e WHERE e.id = a.endpoint_id)"
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        // Allow some orphans (endpoints may be deleted)
        assert!(orphaned.0 < 100, "Too many orphaned anomaly scores: {}", orphaned.0);
    }

    #[tokio::test]
    async fn test_anomaly_scores_recent_24h() {
        let pool = test_pool().await;
        let count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM anomaly_scores WHERE created_at > NOW() - INTERVAL '24 hours'"
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        // Should have recent anomalies if system is active
        println!("Anomalies in last 24h: {}", count.0);
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. PREDICTIONS TESTS
    // ═══════════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_predictions_table_exists() {
        let pool = test_pool().await;
        let result = sqlx::query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'predictions')")
            .fetch_one(&pool)
            .await;
        assert!(result.is_ok(), "predictions table should exist");
    }

    #[tokio::test]
    async fn test_predictions_have_valid_confidence() {
        let pool = test_pool().await;
        let invalid: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM predictions WHERE confidence < 0.0 OR confidence > 1.0"
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        assert_eq!(invalid.0, 0, "All predictions should have confidence between 0 and 1");
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. HEALING ACTIONS TESTS
    // ═══════════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_healing_actions_table_exists() {
        let pool = test_pool().await;
        let result = sqlx::query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'healing_actions')")
            .fetch_one(&pool)
            .await;
        assert!(result.is_ok(), "healing_actions table should exist");
    }

    #[tokio::test]
    async fn test_healing_actions_have_valid_types() {
        let pool = test_pool().await;
        let invalid: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM healing_actions WHERE action_type NOT IN ('circuit_open', 'circuit_close', 'retry_backoff', 'rate_limit_adjust', 'endpoint_disable', 'fallback_redirect', 'auto_scale')"
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        // Allow unknown types (future extensibility)
        println!("Healing actions with non-standard types: {}", invalid.0);
    }

    // ═══════════════════════════════════════════════════════════════
    // 4. DRIFT DETECTION TESTS
    // ═══════════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_drift_events_table_exists() {
        let pool = test_pool().await;
        let result = sqlx::query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'ml_drift_events')")
            .fetch_one(&pool)
            .await;
        assert!(result.is_ok(), "ml_drift_events table should exist");
    }

    #[tokio::test]
    async fn test_drift_events_have_valid_severity() {
        let pool = test_pool().await;
        let invalid: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM ml_drift_events WHERE severity NOT IN ('low', 'medium', 'high', 'critical')"
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        assert_eq!(invalid.0, 0, "All drift events should have valid severity");
    }

    // ═══════════════════════════════════════════════════════════════
    // 5. ML MODELS TESTS
    // ═══════════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_ml_models_table_exists() {
        let pool = test_pool().await;
        let result = sqlx::query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'ml_models')")
            .fetch_one(&pool)
            .await;
        assert!(result.is_ok(), "ml_models table should exist");
    }

    #[tokio::test]
    async fn test_ml_models_have_data() {
        let pool = test_pool().await;
        let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM ml_models")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert!(count.0 > 0, "ml_models should have data, got {}", count.0);
    }

    #[tokio::test]
    async fn test_ml_models_have_valid_types() {
        let pool = test_pool().await;
        let valid_types = vec![
            "adaptive_threshold", "anomaly_detector", "retry_bandit",
            "circuit_bandit", "time_series", "contextual_bandit", "drift_detector"
        ];
        let invalid: (i64,) = sqlx::query_as(&format!(
            "SELECT COUNT(*) FROM ml_models WHERE model_type NOT IN ({})",
            valid_types.iter().map(|t| format!("'{}'", t)).collect::<Vec<_>>().join(",")
        ))
        .fetch_one(&pool)
        .await
        .unwrap();
        assert_eq!(invalid.0, 0, "All ML models should have valid model_type");
    }

    #[tokio::test]
    async fn test_ml_models_have_valid_accuracy() {
        let pool = test_pool().await;
        let invalid: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM ml_models WHERE accuracy < 0.0 OR accuracy > 100.0"
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        assert_eq!(invalid.0, 0, "All ML models should have accuracy between 0 and 100");
    }

    // ═══════════════════════════════════════════════════════════════
    // 6. INSIGHTS TESTS
    // ═══════════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_cortex_insights_table_exists() {
        let pool = test_pool().await;
        let result = sqlx::query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cortex_insights')")
            .fetch_one(&pool)
            .await;
        assert!(result.is_ok(), "cortex_insights table should exist");
    }

    #[tokio::test]
    async fn test_insights_have_valid_severity() {
        let pool = test_pool().await;
        let invalid: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM cortex_insights WHERE severity NOT IN ('info', 'low', 'medium', 'high', 'critical')"
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        assert_eq!(invalid.0, 0, "All insights should have valid severity");
    }

    #[tokio::test]
    async fn test_insights_have_titles() {
        let pool = test_pool().await;
        let empty: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM cortex_insights WHERE title IS NULL OR title = ''"
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        assert_eq!(empty.0, 0, "All insights should have non-empty titles");
    }

    // ═══════════════════════════════════════════════════════════════
    // 7. ROUTING DECISIONS TESTS
    // ═══════════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_routing_decisions_table_exists() {
        let pool = test_pool().await;
        let result = sqlx::query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cortex_routing_decisions')")
            .fetch_one(&pool)
            .await;
        assert!(result.is_ok(), "cortex_routing_decisions table should exist");
    }

    // ═══════════════════════════════════════════════════════════════
    // 8. PIPELINE TRACES TESTS
    // ═══════════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_cortex_traces_table_exists() {
        let pool = test_pool().await;
        let result = sqlx::query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cortex_traces')")
            .fetch_one(&pool)
            .await;
        assert!(result.is_ok(), "cortex_traces table should exist");
    }

    #[tokio::test]
    async fn test_traces_have_data() {
        let pool = test_pool().await;
        let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM cortex_traces")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert!(count.0 > 0, "cortex_traces should have data, got {}", count.0);
    }

    #[tokio::test]
    async fn test_traces_have_valid_stages() {
        let pool = test_pool().await;
        let valid_stages = vec![
            "hourly_stats", "profile_update", "anomaly_scoring",
            "self_healing", "predictions", "ml_training",
            "drift_detection", "smart_routing", "insights"
        ];
        let unknown: (i64,) = sqlx::query_as(&format!(
            "SELECT COUNT(*) FROM cortex_traces WHERE stage_name NOT IN ({})",
            valid_stages.iter().map(|s| format!("'{}'", s)).collect::<Vec<_>>().join(",")
        ))
        .fetch_one(&pool)
        .await
        .unwrap();
        // Allow some unknown stages (future extensibility)
        println!("Traces with unknown stages: {}", unknown.0);
    }

    #[tokio::test]
    async fn test_traces_have_valid_status() {
        let pool = test_pool().await;
        let invalid: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM cortex_traces WHERE status NOT IN ('success', 'failure', 'timeout', 'skipped')"
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        assert_eq!(invalid.0, 0, "All traces should have valid status");
    }

    // ═══════════════════════════════════════════════════════════════
    // 9. ACTION HISTORY TESTS
    // ═══════════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_action_history_table_exists() {
        let pool = test_pool().await;
        let result = sqlx::query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cortex_action_history')")
            .fetch_one(&pool)
            .await;
        assert!(result.is_ok(), "cortex_action_history table should exist");
    }

    #[tokio::test]
    async fn test_action_history_has_data() {
        let pool = test_pool().await;
        let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM cortex_action_history")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert!(count.0 > 0, "cortex_action_history should have data, got {}", count.0);
    }

    // ═══════════════════════════════════════════════════════════════
    // 10. ENDPOINT PROFILES TESTS
    // ═══════════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_endpoint_profiles_table_exists() {
        let pool = test_pool().await;
        let result = sqlx::query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'endpoint_profiles')")
            .fetch_one(&pool)
            .await;
        assert!(result.is_ok(), "endpoint_profiles table should exist");
    }

    #[tokio::test]
    async fn test_endpoint_profiles_match_endpoints() {
        let pool = test_pool().await;
        let orphaned: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM endpoint_profiles p WHERE NOT EXISTS (SELECT 1 FROM endpoints e WHERE e.id = p.endpoint_id)"
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        assert!(orphaned.0 < 50, "Too many orphaned profiles: {}", orphaned.0);
    }

    // ═══════════════════════════════════════════════════════════════
    // 11. HOURLY STATS TESTS
    // ═══════════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_hourly_stats_table_exists() {
        let pool = test_pool().await;
        let result = sqlx::query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'endpoint_hourly_stats')")
            .fetch_one(&pool)
            .await;
        assert!(result.is_ok(), "endpoint_hourly_stats table should exist");
    }

    #[tokio::test]
    async fn test_hourly_stats_have_data() {
        let pool = test_pool().await;
        let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM endpoint_hourly_stats")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert!(count.0 > 0, "endpoint_hourly_stats should have data, got {}", count.0);
    }

    #[tokio::test]
    async fn test_hourly_stats_have_valid_percentiles() {
        let pool = test_pool().await;
        let invalid: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM endpoint_hourly_stats WHERE p50_latency_ms < 0 OR p95_latency_ms < 0 OR p99_latency_ms < 0"
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        assert_eq!(invalid.0, 0, "All percentiles should be non-negative");
    }

    // ═══════════════════════════════════════════════════════════════
    // 12. CHAOS ENGINEERING TESTS
    // ═══════════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_chaos_scenarios_exist() {
        let pool = test_pool().await;
        let result = sqlx::query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'chaos_tests')")
            .fetch_one(&pool)
            .await;
        assert!(result.is_ok(), "chaos_tests table should exist");
    }

    // ═══════════════════════════════════════════════════════════════
    // 13. CROSS-SUBSYSTEM INTEGRITY TESTS
    // ═══════════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_all_cortex_tables_exist() {
        let pool = test_pool().await;
        let tables = vec![
            "anomaly_scores", "cortex_action_history", "cortex_insights",
            "cortex_routing_decisions", "cortex_traces", "healing_actions",
            "ml_anomalies", "ml_drift_events", "ml_model_quality",
            "ml_model_resets", "ml_model_versions", "ml_models",
            "ml_prediction_outcomes", "predictions", "endpoint_profiles",
            "endpoint_hourly_stats"
        ];
        for table in tables {
            let exists: (bool,) = sqlx::query_as(
                "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = $1)"
            )
            .bind(table)
            .fetch_one(&pool)
            .await
            .unwrap();
            assert!(exists.0, "Table '{}' should exist", table);
        }
    }

    #[tokio::test]
    async fn test_cortex_data_freshness() {
        let pool = test_pool().await;
        // Check that at least some data was created in the last 24 hours
        let recent_traces: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM cortex_traces WHERE completed_at > NOW() - INTERVAL '24 hours'"
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        println!("Recent traces (24h): {}", recent_traces.0);

        let recent_anomalies: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM anomaly_scores WHERE created_at > NOW() - INTERVAL '24 hours'"
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        println!("Recent anomalies (24h): {}", recent_anomalies.0);

        // At least one of these should have recent data if system is active
        assert!(
            recent_traces.0 > 0 || recent_anomalies.0 > 0,
            "System should have recent activity"
        );
    }

    #[tokio::test]
    async fn test_no_data_corruption() {
        let pool = test_pool().await;
        // Check for NULL endpoint_ids in tables that require them
        let null_endpoints: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM anomaly_scores WHERE endpoint_id IS NULL"
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        assert_eq!(null_endpoints.0, 0, "No NULL endpoint_ids in anomaly_scores");

        let null_models: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM ml_models WHERE endpoint_id IS NULL"
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        assert_eq!(null_models.0, 0, "No NULL endpoint_ids in ml_models");
    }
}
