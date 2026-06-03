//! Cortex ML Subsystem Unit Tests
//!
//! Comprehensive tests for all Cortex ML algorithms.
//! No database required — pure algorithmic tests.

#[cfg(test)]
mod anomaly_scoring_tests {
    use crate::cortex::ml::anomaly_scoring::*;

    #[test]
    fn test_zscore_normal_value() {
        let score = calculate_zscore(50.0, 50.0, 10.0);
        assert_eq!(score, 0.0, "Value at mean should have z-score 0");
    }

    #[test]
    fn test_zscore_one_std_dev() {
        let score = calculate_zscore(60.0, 50.0, 10.0);
        assert!((score - 1.0).abs() < 0.01, "One std dev above mean should be z=1");
    }

    #[test]
    fn test_zscore_anomaly() {
        let score = calculate_zscore(100.0, 50.0, 10.0);
        assert!(score > 3.0, "Far from mean should have high z-score");
    }

    #[test]
    fn test_zscore_zero_stddev() {
        let score = calculate_zscore(50.0, 50.0, 0.0);
        assert_eq!(score, 0.0, "Zero stddev should return 0 to avoid division by zero");
    }

    #[test]
    fn test_anomaly_threshold_detection() {
        assert!(is_anomaly(4.0, 3.0), "Score above threshold should be anomaly");
        assert!(!is_anomaly(2.0, 3.0), "Score below threshold should not be anomaly");
        assert!(is_anomaly(3.0, 3.0), "Score at threshold should be anomaly");
    }

    #[test]
    fn test_moving_average() {
        let values = vec![10.0, 20.0, 30.0, 40.0, 50.0];
        let ma = moving_average(&values, 3);
        assert!((ma - 40.0).abs() < 0.01, "MA(3) of last 3 values should be 40");
    }

    #[test]
    fn test_moving_average_insufficient_data() {
        let values = vec![10.0];
        let ma = moving_average(&values, 5);
        assert_eq!(ma, 10.0, "With insufficient data, should return available mean");
    }

    #[test]
    fn test_iqr_outlier_detection() {
        let data = vec![1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 100.0];
        let outlier_idx = detect_outliers_iqr(&data, 1.5);
        assert!(outlier_idx.contains(&9), "Index 9 (value 100.0) should be outlier");
        assert!(!outlier_idx.contains(&0), "Index 0 (value 1.0) should not be outlier");
    }

    #[test]
    fn test_ema_smoothing() {
        let val1 = exponential_moving_average(100.0, 0.0, 0.3);
        assert_eq!(val1, 30.0, "First EMA with alpha=0.3 should be 30");

        let val2 = exponential_moving_average(200.0, val1, 0.3);
        assert!((val2 - 81.0).abs() < 0.01, "Second EMA should be ~81");
    }
}

#[cfg(test)]
mod predictions_tests {
    use crate::cortex::ml::predictions::*;

    #[test]
    fn test_simple_prediction() {
        let history = vec![100.0, 95.0, 90.0, 85.0, 80.0];
        let predicted = predict_next(&history, 1);
        assert!(predicted < 80.0, "Downward trend should predict lower value");
    }

    #[test]
    fn test_stable_prediction() {
        let history = vec![95.0, 95.0, 95.0, 95.0, 95.0];
        let predicted = predict_next(&history, 1);
        assert!((predicted - 95.0).abs() < 5.0, "Stable series should predict near mean");
    }

    #[test]
    fn test_confidence_calculation() {
        let stable = vec![100.0; 20];
        let confidence = calculate_confidence(&stable);
        assert!(confidence > 0.8, "Stable data should have high confidence");

        let volatile = vec![10.0, 90.0, 20.0, 80.0, 30.0, 70.0, 40.0, 60.0];
        let conf2 = calculate_confidence(&volatile);
        assert!(conf2 < confidence, "Volatile data should have lower confidence");
    }

    #[test]
    fn test_trend_detection() {
        let increasing = vec![10.0, 20.0, 30.0, 40.0, 50.0];
        let trend = detect_trend(&increasing);
        assert_eq!(trend, "increasing");

        let decreasing = vec![50.0, 40.0, 30.0, 20.0, 10.0];
        let trend2 = detect_trend(&decreasing);
        assert_eq!(trend2, "decreasing");

        let stable = vec![30.0, 30.0, 30.0, 30.0, 30.0];
        let trend3 = detect_trend(&stable);
        assert_eq!(trend3, "stable");
    }

    #[test]
    fn test_empty_history() {
        let history: Vec<f64> = vec![];
        let predicted = predict_next(&history, 1);
        assert_eq!(predicted, 0.0, "Empty history should return 0");
    }

    #[test]
    fn test_multi_step_prediction() {
        let history = vec![100.0, 90.0, 80.0, 70.0];
        let pred1 = predict_next(&history, 1);
        let pred3 = predict_next(&history, 3);
        assert!(pred3 < pred1, "Multi-step should predict further decline");
    }
}

#[cfg(test)]
mod healing_tests {
    use crate::cortex::healing_engine::*;

    #[test]
    fn test_circuit_breaker_states() {
        let mut cb = CircuitBreaker::new(3, 60);
        assert_eq!(cb.state(), CircuitState::Closed);

        for _ in 0..3 { cb.record_failure(); }
        assert_eq!(cb.state(), CircuitState::Open, "Should open after 3 failures");

        cb.record_success();
        assert_eq!(cb.state(), CircuitState::HalfOpen, "Success should move to half-open");
    }

    #[test]
    fn test_circuit_breaker_success_resets() {
        let mut cb = CircuitBreaker::new(3, 60);
        cb.record_failure();
        cb.record_failure();
        cb.record_success();
        assert_eq!(cb.failure_count(), 0, "Success should reset failure count");
    }

    #[test]
    fn test_retry_backoff() {
        let delay1 = calculate_backoff(1, 1000, 2.0, 30000);
        let delay2 = calculate_backoff(2, 1000, 2.0, 30000);
        let delay3 = calculate_backoff(3, 1000, 2.0, 30000);

        assert!(delay2 > delay1, "Backoff should increase");
        assert!(delay3 > delay2, "Backoff should increase");
        assert!(delay3 <= 30000, "Backoff should not exceed max");
    }

    #[test]
    fn test_retry_backoff_max() {
        let delay = calculate_backoff(20, 1000, 2.0, 30000);
        assert_eq!(delay, 30000, "High attempt should hit max backoff");
    }

    #[test]
    fn test_health_score_calculation() {
        let score = calculate_health_score(95.0, 200.0, 0.02, 0.01);
        assert!(score > 80.0, "Good metrics should have high health score");

        let score2 = calculate_health_score(50.0, 2000.0, 0.3, 0.2);
        assert!(score2 < 40.0, "Bad metrics should have low health score");
    }

    #[test]
    fn test_healing_action_selection() {
        let action = select_healing_action(&HealingContext {
            success_rate: 80.0,
            latency_ms: 500.0,
            error_rate: 0.1,
            circuit_state: CircuitState::Closed,
        });
        assert!(action.is_some(), "Degraded metrics should suggest an action");
    }

    #[test]
    fn test_no_healing_needed() {
        let action = select_healing_action(&HealingContext {
            success_rate: 99.0,
            latency_ms: 100.0,
            error_rate: 0.001,
            circuit_state: CircuitState::Closed,
        });
        assert!(action.is_none(), "Healthy metrics should not need healing");
    }
}

#[cfg(test)]
mod ml_model_tests {
    use crate::cortex::ml::model_monitor::*;

    #[test]
    fn test_health_status_classification() {
        assert_eq!(classify_health(95.0, 90.0, 0.02), HealthStatus::Healthy);
        assert_eq!(classify_health(70.0, 60.0, 0.15), HealthStatus::Warning);
        assert_eq!(classify_health(50.0, 40.0, 0.25), HealthStatus::Degraded);
        assert_eq!(classify_health(30.0, 20.0, 0.4), HealthStatus::Critical);
    }

    #[test]
    fn test_quality_score() {
        let score = calculate_quality_score(95.0, 2.0, 100);
        assert!(score > 80.0, "Good accuracy, low FP, enough samples = high score");

        let score2 = calculate_quality_score(50.0, 30.0, 5);
        assert!(score2 < 50.0, "Bad accuracy, high FP, few samples = low score");
    }

    #[test]
    fn test_model_staleness() {
        let fresh = is_stale(10.0, 168.0); // 10h old, 168h threshold
        assert!(!fresh, "10h old model is not stale");

        let stale = is_stale(200.0, 168.0);
        assert!(stale, "200h old model is stale");
    }

    #[test]
    fn test_f1_score() {
        let f1 = calculate_f1(90.0, 85.0);
        assert!((f1 - 87.4).abs() < 1.0, "F1 of 90P/85R should be ~87.4");

        let f1_zero = calculate_f1(0.0, 0.0);
        assert_eq!(f1_zero, 0.0, "Zero precision/recall = zero F1");
    }
}

#[cfg(test)]
mod insights_tests {
    use crate::cortex::ml::insights::*;

    #[test]
    fn test_insight_severity_ordering() {
        assert!(InsightSeverity::Critical > InsightSeverity::High);
        assert!(InsightSeverity::High > InsightSeverity::Medium);
        assert!(InsightSeverity::Medium > InsightSeverity::Low);
        assert!(InsightSeverity::Low > InsightSeverity::Info);
    }

    #[test]
    fn test_insight_generation() {
        let insight = generate_insight(&InsightContext {
            anomaly_score: 4.5,
            success_rate: 75.0,
            latency_p95: 800.0,
            trend: "degrading".to_string(),
        });
        assert!(insight.is_some(), "Degraded metrics should generate insight");
        assert!(insight.unwrap().severity >= InsightSeverity::Medium);
    }

    #[test]
    fn test_no_insight_for_healthy() {
        let insight = generate_insight(&InsightContext {
            anomaly_score: 0.5,
            success_rate: 99.0,
            latency_p95: 100.0,
            trend: "stable".to_string(),
        });
        assert!(insight.is_none(), "Healthy metrics should not generate insight");
    }

    #[test]
    fn test_insight_deduplication() {
        let insights = vec![
            create_insight("high_latency", "endpoint-1", InsightSeverity::High),
            create_insight("high_latency", "endpoint-1", InsightSeverity::High),
            create_insight("low_sr", "endpoint-2", InsightSeverity::Medium),
        ];
        let deduplicated = deduplicate_insights(&insights);
        assert_eq!(deduplicated.len(), 2, "Duplicate insights should be merged");
    }
}

#[cfg(test)]
mod routing_tests {
    use crate::cortex::ml::smart_routing::*;

    #[test]
    fn test_weighted_routing() {
        let endpoints = vec![
            EndpointWeight { id: "ep1".to_string(), weight: 0.7, health: 95.0 },
            EndpointWeight { id: "ep2".to_string(), weight: 0.3, health: 80.0 },
        ];
        let distribution = calculate_distribution(&endpoints);
        assert!((distribution["ep1"] - 0.7).abs() < 0.1);
        assert!((distribution["ep2"] - 0.3).abs() < 0.1);
    }

    #[test]
    fn test_unhealthy_endpoint_excluded() {
        let endpoints = vec![
            EndpointWeight { id: "ep1".to_string(), weight: 0.5, health: 95.0 },
            EndpointWeight { id: "ep2".to_string(), weight: 0.5, health: 30.0 },
        ];
        let distribution = calculate_distribution(&endpoints);
        assert_eq!(distribution.get("ep2"), None, "Unhealthy endpoint should be excluded");
    }

    #[test]
    fn test_all_healthy_equal_distribution() {
        let endpoints = vec![
            EndpointWeight { id: "ep1".to_string(), weight: 1.0, health: 95.0 },
            EndpointWeight { id: "ep2".to_string(), weight: 1.0, health: 95.0 },
            EndpointWeight { id: "ep3".to_string(), weight: 1.0, health: 95.0 },
        ];
        let distribution = calculate_distribution(&endpoints);
        for (_, weight) in distribution.iter() {
            assert!((weight - 0.333).abs() < 0.05, "Equal weight should distribute evenly");
        }
    }
}

#[cfg(test)]
mod correlation_tests {
    use crate::cortex::ml::correlations::*;

    #[test]
    fn test_pearson_correlation() {
        let x = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let y = vec![2.0, 4.0, 6.0, 8.0, 10.0];
        let r = pearson_correlation(&x, &y);
        assert!((r - 1.0).abs() < 0.01, "Perfect positive correlation should be 1.0");
    }

    #[test]
    fn test_negative_correlation() {
        let x = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let y = vec![10.0, 8.0, 6.0, 4.0, 2.0];
        let r = pearson_correlation(&x, &y);
        assert!((r + 1.0).abs() < 0.01, "Perfect negative correlation should be -1.0");
    }

    #[test]
    fn test_no_correlation() {
        let x = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let y = vec![3.0, 3.0, 3.0, 3.0, 3.0];
        let r = pearson_correlation(&x, &y);
        assert!(r.is_nan() || r.abs() < 0.01, "Constant y should have no correlation");
    }

    #[test]
    fn test_insufficient_data() {
        let x = vec![1.0];
        let y = vec![2.0];
        let r = pearson_correlation(&x, &y);
        assert_eq!(r, 0.0, "Insufficient data should return 0");
    }
}

#[cfg(test)]
mod explainability_tests {
    use crate::cortex::ml::explainable::*;

    #[test]
    fn test_anomaly_explanation() {
        let explanation = explain_anomaly_score(
            uuid::Uuid::new_v4(),
            75.0,  // success_rate
            500.0, // latency
            800.0, // p95_latency
            100.0, // delivery_rate
            95.0,  // baseline_sr
            200.0, // baseline_latency
        );
        assert!(!explanation.explanation.is_empty(), "Should have explanation text");
        assert!(explanation.factors.len() > 0, "Should list contributing factors");
    }

    #[test]
    fn test_prediction_explanation() {
        let explanation = explain_prediction(
            uuid::Uuid::new_v4(),
            85.0,  // predicted_sr
            300.0, // predicted_latency
            0.8,   // confidence
            3,     // forecast_steps
            "degrading",
        );
        assert!(!explanation.explanation.is_empty(), "Should have explanation text");
        assert!(explanation.confidence > 0.0, "Should report confidence");
    }

    #[test]
    fn test_healthy_no_explanation() {
        let explanation = explain_anomaly_score(
            uuid::Uuid::new_v4(),
            99.0, 100.0, 150.0, 1000.0, 99.0, 100.0,
        );
        assert!(explanation.factors.is_empty() || explanation.risk_level == "low",
            "Healthy endpoint should have low risk");
    }
}
