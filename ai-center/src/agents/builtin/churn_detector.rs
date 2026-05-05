use async_trait::async_trait;
use serde_json::json;

use crate::agents::context::WebhookContext;
use crate::agents::result::{AgentAction, AgentNotification, AgentResult};
use crate::agents::{TriggerCondition, WebhookAgent};

/// Detects customers at risk of churning based on payment failures,
/// subscription cancellations, and overdue invoices.
///
/// Uses AI analysis to evaluate the customer's history and determine
/// the churn risk level, then recommends retention actions.
pub struct ChurnDetector;

impl ChurnDetector {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl WebhookAgent for ChurnDetector {
    fn name(&self) -> &str {
        "churn_detector"
    }

    fn description(&self) -> &str {
        "Detects customers at risk of churning based on payment failures, subscription cancellations, and overdue invoices."
    }

    fn trigger_conditions(&self) -> Vec<TriggerCondition> {
        vec![
            TriggerCondition::on("payment.failed"),
            TriggerCondition::on("subscription.cancelled"),
            TriggerCondition::on("invoice.overdue"),
            TriggerCondition::on("subscription.paused"),
        ]
    }

    async fn execute(&self, context: &WebhookContext) -> anyhow::Result<AgentResult> {
        let start = std::time::Instant::now();
        let event = context.event_type();
        let customer_id = context
            .extract_customer_id()
            .unwrap_or_else(|| context.customer_id.to_string());

        // Rule-based pre-screening: fast path for obvious cases
        let recent_failures = context
            .recent_deliveries
            .iter()
            .filter(|d| d.event_type.as_deref() == Some("payment.failed"))
            .count();

        let failure_rate = context.recent_failure_rate();

        // Quick risk assessment based on patterns
        let risk_score = calculate_churn_risk(event, recent_failures, failure_rate, context);

        let actions = if risk_score >= 0.7 {
            // High risk: full retention workflow
            vec![
                AgentAction::NotifySlack {
                    channel: "#retention".to_string(),
                    message: format!(
                        "🚨 High churn risk: Customer {} — Event: {} | Risk: {:.0}% | Recent failures: {}",
                        customer_id, event, risk_score * 100.0, recent_failures
                    ),
                    urgency: "high".to_string(),
                },
                AgentAction::UpdateCRM {
                    customer_id: customer_id.clone(),
                    field: "churn_risk".to_string(),
                    value: json!({
                        "score": risk_score,
                        "event": event,
                        "detected_at": chrono::Utc::now().to_rfc3339(),
                    }),
                },
                AgentAction::SendEmail {
                    to: format!("retention@company.com"),
                    subject: format!("[Retention Alert] Customer {} churn risk", customer_id),
                    body: format!(
                        "Customer {} has a {:.0}% churn risk based on {} event.\nRecent failures: {}\nAction needed: immediate outreach recommended.",
                        customer_id, risk_score * 100.0, event, recent_failures
                    ),
                },
            ]
        } else if risk_score >= 0.4 {
            // Medium risk: flag and monitor
            vec![
                AgentAction::UpdateCRM {
                    customer_id: customer_id.clone(),
                    field: "churn_risk".to_string(),
                    value: json!({
                        "score": risk_score,
                        "event": event,
                        "detected_at": chrono::Utc::now().to_rfc3339(),
                    }),
                },
                AgentAction::AddToWatchlist {
                    watch_type: "churn_risk".to_string(),
                    value: customer_id.clone(),
                    reason: format!("Churn risk {:.0}% after {}", risk_score * 100.0, event),
                },
            ]
        } else {
            // Low risk: log only
            vec![]
        };

        let notifications = if risk_score >= 0.7 {
            vec![AgentNotification::critical_slack(
                "Churn Risk Detected",
                &format!(
                    "Customer {} ({}) — Risk: {:.0}% | Event: {} | Recent failures: {}",
                    customer_id, context.endpoint_url, risk_score * 100.0, event, recent_failures
                ),
            )]
        } else if risk_score >= 0.4 {
            vec![AgentNotification::warning_slack(
                "Churn Risk Monitor",
                &format!(
                    "Customer {} — Risk: {:.0}% | Event: {}",
                    customer_id, risk_score * 100.0, event
                ),
            )]
        } else {
            vec![]
        };

        Ok(AgentResult {
            agent_name: self.name().to_string(),
            actions,
            notifications,
            confidence_score: risk_score,
            summary: format!(
                "Churn analysis for customer {}: risk={:.0}%, event={}, recent_failures={}",
                customer_id, risk_score * 100.0, event, recent_failures
            ),
            raw_response: None,
            latency_ms: start.elapsed().as_millis() as u64,
            ai_provider_used: None,
        })
    }
}

/// Calculate churn risk score (0.0 - 1.0) based on event patterns.
fn calculate_churn_risk(
    event: &str,
    recent_failures: usize,
    failure_rate: f64,
    ctx: &WebhookContext,
) -> f64 {
    let mut score = 0.0;

    // Base score by event type
    match event {
        "subscription.cancelled" => score += 0.6,
        "payment.failed" => score += 0.3,
        "invoice.overdue" => score += 0.4,
        "subscription.paused" => score += 0.35,
        _ => score += 0.1,
    }

    // Amplify based on recent failure patterns
    if recent_failures >= 3 {
        score += 0.3;
    } else if recent_failures >= 2 {
        score += 0.15;
    }

    // Amplify based on overall failure rate
    if failure_rate > 0.5 {
        score += 0.2;
    } else if failure_rate > 0.3 {
        score += 0.1;
    }

    // Higher-value customers warrant more concern
    if let Some(amount) = ctx.extract_amount() {
        if amount > 1000.0 {
            score += 0.05;
        }
    }

    // Cap at 1.0
    score.min(1.0)
}
