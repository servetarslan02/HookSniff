use async_trait::async_trait;
use serde_json::json;

use crate::agents::context::WebhookContext;
use crate::agents::result::{AgentAction, AgentNotification, AgentResult};
use crate::agents::{TriggerCondition, WebhookAgent};

/// Detects suspicious transactions based on velocity checks,
/// amount anomalies, and behavioral patterns.
///
/// Triggers on order and payment events to flag potential fraud.
pub struct FraudDetector;

impl FraudDetector {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl WebhookAgent for FraudDetector {
    fn name(&self) -> &str {
        "fraud_detector"
    }

    fn description(&self) -> &str {
        "Detects suspicious transactions based on velocity checks, amount anomalies, and behavioral patterns."
    }

    fn trigger_conditions(&self) -> Vec<TriggerCondition> {
        vec![
            TriggerCondition::on("order.created"),
            TriggerCondition::on("payment.completed"),
            TriggerCondition::on("account.created"),
            TriggerCondition::on("payment.authorized"),
        ]
    }

    async fn execute(&self, context: &WebhookContext) -> anyhow::Result<AgentResult> {
        let start = std::time::Instant::now();
        let event = context.event_type();
        let customer_id = context
            .extract_customer_id()
            .unwrap_or_else(|| context.customer_id.to_string());

        // Velocity check: how many events in recent history?
        let same_event_count = context
            .recent_deliveries
            .iter()
            .filter(|d| d.event_type.as_deref() == Some(event))
            .count();

        // Amount anomaly check
        let amount = context.extract_amount();
        let amount_suspicious = amount.map(|a| a > 10000.0).unwrap_or(false);

        // Calculate fraud risk score
        let risk_score = calculate_fraud_risk(
            event,
            same_event_count,
            amount,
            amount_suspicious,
            context,
        );

        let order_id = context.extract_order_id();

        let actions = if risk_score >= 0.8 {
            // High risk: hold and alert
            let mut acts = vec![
                AgentAction::NotifySlack {
                    channel: "#fraud-alerts".to_string(),
                    message: format!(
                        "🚨 FRAUD ALERT: Customer {} — Event: {} | Risk: {:.0}% | Velocity: {} events | Amount: {}",
                        customer_id,
                        event,
                        risk_score * 100.0,
                        same_event_count,
                        amount.map(|a| format!("${:.2}", a)).unwrap_or_else(|| "N/A".to_string())
                    ),
                    urgency: "critical".to_string(),
                },
                AgentAction::AddToWatchlist {
                    watch_type: "fraud_suspect".to_string(),
                    value: customer_id.clone(),
                    reason: format!("Fraud risk {:.0}% on {}", risk_score * 100.0, event),
                },
            ];

            // Hold order if we have an order ID
            if let Some(oid) = order_id {
                acts.push(AgentAction::HoldOrder {
                    order_id: oid,
                    reason: format!("Fraud risk {:.0}%", risk_score * 100.0),
                });
            }

            acts
        } else if risk_score >= 0.5 {
            // Medium risk: flag for review
            vec![
                AgentAction::AddToWatchlist {
                    watch_type: "fraud_watch".to_string(),
                    value: customer_id.clone(),
                    reason: format!("Elevated fraud risk {:.0}% on {}", risk_score * 100.0, event),
                },
                AgentAction::UpdateCRM {
                    customer_id: customer_id.clone(),
                    field: "fraud_risk".to_string(),
                    value: json!({
                        "score": risk_score,
                        "event": event,
                        "velocity": same_event_count,
                        "detected_at": chrono::Utc::now().to_rfc3339(),
                    }),
                },
            ]
        } else {
            vec![]
        };

        let notifications = if risk_score >= 0.8 {
            vec![AgentNotification::critical_slack(
                "Fraud Alert",
                &format!(
                    "Suspicious activity: Customer {} — {} ({:.0}% risk, {} recent events)",
                    customer_id, event, risk_score * 100.0, same_event_count
                ),
            )]
        } else if risk_score >= 0.5 {
            vec![AgentNotification::warning_slack(
                "Fraud Watch",
                &format!(
                    "Elevated risk: Customer {} — {} ({:.0}% risk)",
                    customer_id, event, risk_score * 100.0
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
                "Fraud analysis for customer {}: risk={:.0}%, event={}, velocity={}, amount={}",
                customer_id,
                risk_score * 100.0,
                event,
                same_event_count,
                amount.map(|a| format!("${:.2}", a)).unwrap_or_else(|| "N/A".to_string())
            ),
            raw_response: None,
            latency_ms: start.elapsed().as_millis() as u64,
            ai_provider_used: None,
        })
    }
}

/// Calculate fraud risk score (0.0 - 1.0).
fn calculate_fraud_risk(
    event: &str,
    same_event_count: usize,
    amount: Option<f64>,
    amount_suspicious: bool,
    ctx: &WebhookContext,
) -> f64 {
    let mut score = 0.0;

    // Base score by event type
    match event {
        "account.created" => score += 0.15,
        "order.created" => score += 0.1,
        "payment.completed" => score += 0.05,
        "payment.authorized" => score += 0.05,
        _ => score += 0.05,
    }

    // Velocity check: many similar events in short time
    if same_event_count >= 5 {
        score += 0.5;
    } else if same_event_count >= 3 {
        score += 0.3;
    } else if same_event_count >= 2 {
        score += 0.15;
    }

    // Amount anomaly
    if amount_suspicious {
        score += 0.3;
    } else if let Some(a) = amount {
        if a > 5000.0 {
            score += 0.15;
        }
    }

    // New account + high-value transaction
    if event == "account.created" && amount.map(|a| a > 500.0).unwrap_or(false) {
        score += 0.2;
    }

    // Endpoint failure patterns can indicate attack attempts
    let failure_rate = ctx.recent_failure_rate();
    if failure_rate > 0.3 {
        score += 0.1;
    }

    score.min(1.0)
}
