//! Stage 4: Self-Healing Engine
//!
//! Automatically takes corrective actions on unhealthy endpoints.
//! Records all actions in action memory for adaptive learning.

use super::config::CortexConfig;

/// Check endpoints and take healing actions if needed.
/// Returns number of actions taken.
pub async fn run_healing(
    pool: &sqlx::PgPool,
    config: &CortexConfig,
) -> Result<u64, sqlx::Error> {
    let mut actions = 0u64;

    // Find endpoints with high anomaly scores (last hour)
    let sick_endpoints: Vec<(uuid::Uuid, uuid::Uuid, i32, String)> = sqlx::query_as(
        r#"
        SELECT DISTINCT ON (a.endpoint_id) a.endpoint_id, a.customer_id, a.score, a.category
        FROM anomaly_scores a
        JOIN endpoints e ON e.id = a.endpoint_id
        WHERE a.score > $1
          AND a.created_at > NOW() - INTERVAL '1 hour'
          AND e.is_active = true
          AND e.auto_disabled = false
        ORDER BY a.endpoint_id, a.created_at DESC
        "#
    )
    .bind(config.anomaly_high_threshold)
    .fetch_all(pool)
    .await?;

    for (endpoint_id, customer_id, score, category) in sick_endpoints {
        let action_type = determine_action_ml(pool, endpoint_id, score, &category, config).await;
        let reason = format!("Anomaly score {score} ({category})");

        // Record the action
        sqlx::query(
            r#"
            INSERT INTO healing_actions (endpoint_id, action_type, reason, details)
            VALUES ($1, $2, $3, $4)
            "#
        )
        .bind(endpoint_id)
        .bind(&action_type)
        .bind(&reason)
        .bind(serde_json::json!({ "score": score, "category": category }))
        .execute(pool)
        .await?;

        // Record in action memory (Stage 5 integration)
        super::action_memory::record_action(
            pool, endpoint_id, Some(customer_id), &action_type, &reason,
            serde_json::json!({ "score": score, "category": category }),
        ).await?;

        // Execute the action
        match action_type.as_str() {
            "auto_disable" => {
                sqlx::query(
                    "UPDATE endpoints SET auto_disabled = true, auto_disabled_at = NOW(), auto_disable_reason = $1 WHERE id = $2"
                ).bind(&reason).bind(endpoint_id).execute(pool).await?;
                tracing::warn!("🔧 Cortex: Auto-disabled endpoint {} (score {})", endpoint_id, score);
            }
            "retry_slowdown" => {
                // Signal to retry policy to slow down (stored in healing_actions, read by worker)
                tracing::info!("🔧 Cortex: Retry slowdown for endpoint {} (score {})", endpoint_id, score);
            }
            "circuit_tighten" => {
                // Signal to circuit breaker to lower threshold
                tracing::info!("🔧 Cortex: Circuit tightened for endpoint {} (score {})", endpoint_id, score);
            }
            "rate_limit_reduce" => {
                // Reduce the endpoint's rate limit by 25%
                let current_limit: Option<(i32,)> = sqlx::query_as(
                    "SELECT webhook_limit FROM endpoints WHERE id = $1"
                ).bind(endpoint_id).fetch_optional(pool).await?;
                if let Some((limit)) = current_limit {
                    let new_limit = (limit as f64 * 0.75) as i32;
                    sqlx::query(
                        "UPDATE endpoints SET webhook_limit = $1 WHERE id = $2"
                    ).bind(new_limit.max(10)).bind(endpoint_id).execute(pool).await?;
                    tracing::info!("🔧 Cortex: Rate limit reduced {} → {} for endpoint {} (score {})", limit, new_limit.max(10), endpoint_id, score);
                }
            }
            "fallback_url_switch" => {
                // Trigger smart routing to switch to fallback URL
                if let Ok(Some(decision)) = super::smart_routing::decide_routing(pool, endpoint_id).await {
                    if let Some(url) = decision.get("recommended_url").and_then(|v| v.as_str()) {
                        sqlx::query(
                            "UPDATE endpoints SET active_url = $1 WHERE id = $2"
                        ).bind(url).bind(endpoint_id).execute(pool).await.ok();
                        tracing::info!("🔧 Cortex: Switched endpoint {} to fallback URL {} (score {})", endpoint_id, url, score);
                    }
                }
            }
            "retry_increase" => {
                // Increase max retries for this endpoint
                let current_retries: Option<(i32,)> = sqlx::query_as(
                    "SELECT max_retries FROM endpoints WHERE id = $1"
                ).bind(endpoint_id).fetch_optional(pool).await?;
                if let Some((retries)) = current_retries {
                    let new_retries = (retries + 2).min(10);
                    sqlx::query(
                        "UPDATE endpoints SET max_retries = $1 WHERE id = $2"
                    ).bind(new_retries).bind(endpoint_id).execute(pool).await?;
                    tracing::info!("🔧 Cortex: Max retries {} → {} for endpoint {} (score {})", retries, new_retries, endpoint_id, score);
                }
            }
            "timeout_adjust" => {
                // Increase timeout for this endpoint
                let current_timeout: Option<(i32,)> = sqlx::query_as(
                    "SELECT timeout_ms FROM endpoints WHERE id = $1"
                ).bind(endpoint_id).fetch_optional(pool).await?;
                if let Some((timeout)) = current_timeout {
                    let new_timeout = (timeout as f64 * 1.5) as i32;
                    sqlx::query(
                        "UPDATE endpoints SET timeout_ms = $1 WHERE id = $2"
                    ).bind(new_timeout.min(30000)).bind(endpoint_id).execute(pool).await?;
                    tracing::info!("🔧 Cortex: Timeout {}ms → {}ms for endpoint {} (score {})", timeout, new_timeout.min(30000), endpoint_id, score);
                }
            }
            _ => {}
        }

        actions += 1;
        super::CORTEX_METRICS.healing_actions.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    }

    // Check for cascade: if >20% of customer's endpoints are sick, alert
    let cascades: Vec<(uuid::Uuid, i64, i64)> = sqlx::query_as(
        r#"
        WITH customer_sick AS (
            SELECT e.customer_id, COUNT(DISTINCT a.endpoint_id) as sick_count
            FROM anomaly_scores a
            JOIN endpoints e ON e.id = a.endpoint_id
            WHERE a.score > $1 AND a.created_at > NOW() - INTERVAL '1 hour'
            GROUP BY e.customer_id
        ),
        customer_total AS (
            SELECT customer_id, COUNT(*) as total_count
            FROM endpoints WHERE is_active = true
            GROUP BY customer_id
        )
        SELECT cs.customer_id, cs.sick_count, ct.total_count
        FROM customer_sick cs
        JOIN customer_total ct ON ct.customer_id = cs.customer_id
        WHERE (cs.sick_count::FLOAT / ct.total_count::FLOAT) * 100 > $2
        "#
    )
    .bind(config.anomaly_high_threshold)
    .bind(config.cascade_threshold_pct)
    .fetch_all(pool)
    .await?;

    for (customer_id, sick, total) in cascades {
        tracing::warn!("🚨 CASCADE DETECTED: customer {} has {}/{} endpoints sick", customer_id, sick, total);
        super::CORTEX_METRICS.cascade_detections.fetch_add(1, std::sync::atomic::Ordering::Relaxed);

        // Record cascade in healing_actions
        sqlx::query(
            "INSERT INTO healing_actions (endpoint_id, action_type, reason, details) VALUES ($1, 'cascade_alert', $2, $3)"
        )
        .bind(uuid::Uuid::nil())
        .bind(format!("{}/{} endpoints affected", sick, total))
        .bind(serde_json::json!({ "customer_id": customer_id, "sick": sick, "total": total }))
        .execute(pool)
        .await?;
    }

    // Run recovery tests on auto-disabled endpoints
    run_recovery_tests(pool, config).await?;

    Ok(actions)
}

/// Run recovery tests on endpoints that have been auto-disabled.
/// If they pass, re-enable them.
async fn run_recovery_tests(pool: &sqlx::PgPool, config: &CortexConfig) -> Result<(), sqlx::Error> {
    let disabled: Vec<(uuid::Uuid, chrono::DateTime<chrono::Utc>)> = sqlx::query_as(
        "SELECT id, auto_disabled_at FROM endpoints WHERE auto_disabled = true AND auto_disabled_at < NOW() - INTERVAL '15 minutes'"
    ).fetch_all(pool).await?;

    for (endpoint_id, disabled_at) in disabled {
        let age_hours = (chrono::Utc::now() - disabled_at).num_hours();
        if age_hours > config.auto_disable_days * 24 {
            // Too old, skip
            continue;
        }

        // Check recent hourly stats — if last 2 hours are good, re-enable
        let recent_success: i64 = sqlx::query_scalar(
            "SELECT COALESCE(SUM(successful), 0) FROM endpoint_hourly_stats WHERE endpoint_id = $1 AND hour_start > NOW() - INTERVAL '2 hours'"
        ).bind(endpoint_id).fetch_one(pool).await.unwrap_or(0);

        let recent_fail: i64 = sqlx::query_scalar(
            "SELECT COALESCE(SUM(failed), 0) FROM endpoint_hourly_stats WHERE endpoint_id = $1 AND hour_start > NOW() - INTERVAL '2 hours'"
        ).bind(endpoint_id).fetch_one(pool).await.unwrap_or(0);

        let (success, fail) = (recent_success, recent_fail);
        let total = success + fail;
        if total >= 10 { // Minimum delivery count before making recovery decision
            let sr = (success as f64 / total as f64) * 100.0;
            if sr >= config.recovery_min_success_rate {
                sqlx::query(
                    "UPDATE endpoints SET auto_disabled = false, auto_disabled_at = NULL, auto_disable_reason = NULL WHERE id = $1"
                ).bind(endpoint_id).execute(pool).await?;

                // Record recovery
                sqlx::query(
                    "UPDATE healing_actions SET outcome = 'recovered', resolved_at = NOW(), outcome_details = $1 WHERE endpoint_id = $2 AND outcome = 'pending'"
                ).bind(serde_json::json!({ "recovery_sr": sr })).bind(endpoint_id).execute(pool).await?;

                super::action_memory::record_outcome(pool, endpoint_id, "success", Some(serde_json::json!({ "recovery_sr": sr }))).await?;

                tracing::info!("✅ Cortex: Recovered endpoint {} (SR {:.1}%)", endpoint_id, sr);
            }
        }
    }
    Ok(())
}

/// Determine the best action using ML bandit (if available) or fallback to rules.
async fn determine_action_ml(pool: &sqlx::PgPool, endpoint_id: uuid::Uuid, score: i32, category: &str, _config: &CortexConfig) -> String {
    // Try ML bandit first
    if let Ok(model_params) = super::ml::get_model_params(pool, endpoint_id, "healing_bandit").await {
        if let Ok(mut model) = serde_json::from_value::<super::ml::bandit::BanditModel>(model_params) {
            if model.total_plays >= 5 {
                let strategy = model.select_arm();
                return map_bandit_to_action(&strategy);
            }
        }
    }

    // Fallback: rule-based with expanded strategies
    if score >= 90 && category == "critical" {
        "auto_disable".to_string()
    } else if score >= 80 {
        "circuit_tighten".to_string()
    } else if score >= 60 {
        "rate_limit_reduce".to_string()
    } else {
        "retry_slowdown".to_string()
    }
}

/// Map bandit strategy name to healing action
fn map_bandit_to_action(strategy: &str) -> String {
    match strategy {
        "auto_disable" => "auto_disable".to_string(),
        "circuit_tighten" => "circuit_tighten".to_string(),
        "retry_slowdown" => "retry_slowdown".to_string(),
        "rate_limit_reduce" => "rate_limit_reduce".to_string(),
        "fallback_url_switch" => "fallback_url_switch".to_string(),
        "retry_increase" => "retry_increase".to_string(),
        "timeout_adjust" => "timeout_adjust".to_string(),
        _ => strategy.to_string(),
    }
}
