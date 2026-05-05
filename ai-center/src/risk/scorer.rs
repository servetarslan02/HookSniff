use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::monitor::webhooks::{FailingEndpoint, WebhookHealth};

#[derive(Debug, Serialize, Deserialize)]
pub struct RiskScore {
    pub target_type: String,
    pub target_id: Uuid,
    pub score: i32, // 0-100
    pub factors: RiskFactors,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RiskFactors {
    pub failure_rate_score: i32,
    pub retry_intensity_score: i32,
    pub slow_response_score: i32,
    pub dead_letter_score: i32,
    pub volume_anomaly_score: i32,
}

/// Calculate risk score for an endpoint (0-100, higher = more risky)
pub fn calculate_endpoint_risk(
    failing: &FailingEndpoint,
    avg_attempts: f64,
    dead_letters: i64,
) -> RiskScore {
    // Factor 1: Failure rate (0-100, weight 30%)
    let failure_rate_score = (failing.failure_rate).min(100.0) as i32;

    // Factor 2: Retry intensity (0-100, weight 20%)
    // avg_attempts of 1 = 0, 3 = 50, 5+ = 100
    let retry_intensity_score = ((avg_attempts - 1.0) * 25.0).clamp(0.0, 100.0) as i32;

    // Factor 3: Slow response (already filtered >5s, so 50+)
    let slow_response_score = 50; // Base for slow endpoints

    // Factor 4: Dead letters (0-100, weight 10%)
    let dead_letter_score = (dead_letters as f64 * 10.0).min(100.0) as i32;

    // Factor 5: Volume anomaly (based on total volume)
    let volume_anomaly_score = if failing.total > 100 {
        30 // High volume with failures is worse
    } else if failing.total > 50 {
        20
    } else {
        10
    };

    // Weighted average
    let score = (failure_rate_score * 30
        + retry_intensity_score * 20
        + slow_response_score * 15
        + dead_letter_score * 10
        + volume_anomaly_score * 15)
        / 100;

    RiskScore {
        target_type: "endpoint".to_string(),
        target_id: failing.endpoint_id,
        score: score.min(100),
        factors: RiskFactors {
            failure_rate_score,
            retry_intensity_score,
            slow_response_score,
            dead_letter_score,
            volume_anomaly_score,
        },
    }
}

/// Get risk level label from score
pub fn risk_level(score: i32) -> &'static str {
    match score {
        0..=30 => "low",
        31..=60 => "medium",
        61..=80 => "high",
        _ => "critical",
    }
}

/// Get risk emoji from score
pub fn risk_emoji(score: i32) -> &'static str {
    match score {
        0..=30 => "🟢",
        31..=60 => "🟡",
        61..=80 => "🟠",
        _ => "🔴",
    }
}

/// Save risk score to database
pub async fn save_risk_score(pool: &PgPool, risk: &RiskScore) -> anyhow::Result<()> {
    sqlx::query(
        "INSERT INTO risk_scores (target_type, target_id, score, factors) VALUES ($1, $2, $3, $4)",
    )
    .bind(&risk.target_type)
    .bind(risk.target_id)
    .bind(risk.score)
    .bind(serde_json::to_value(&risk.factors).unwrap_or_default())
    .execute(pool)
    .await?;
    Ok(())
}

/// Calculate risks for all failing endpoints
pub async fn calculate_all_risks(
    pool: &PgPool,
    health: &WebhookHealth,
) -> anyhow::Result<Vec<RiskScore>> {
    let mut risks = Vec::new();

    for failing in &health.failing_endpoints {
        let risk = calculate_endpoint_risk(failing, health.avg_attempts, health.dead_letters_1h);
        save_risk_score(pool, &risk).await?;
        risks.push(risk);
    }

    // Also calculate for slow endpoints that aren't already in failing list
    for slow in &health.slow_endpoints {
        if !risks.iter().any(|r| r.target_id == slow.endpoint_id) {
            let risk = RiskScore {
                target_type: "endpoint".to_string(),
                target_id: slow.endpoint_id,
                score: 40, // Medium risk for slow but not failing
                factors: RiskFactors {
                    failure_rate_score: 0,
                    retry_intensity_score: 0,
                    slow_response_score: 70,
                    dead_letter_score: 0,
                    volume_anomaly_score: 10,
                },
            };
            save_risk_score(pool, &risk).await?;
            risks.push(risk);
        }
    }

    Ok(risks)
}
