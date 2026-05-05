use async_trait::async_trait;
use serde_json::json;

use crate::agents::context::WebhookContext;
use crate::agents::result::{AgentAction, AgentNotification, AgentResult};
use crate::agents::{TriggerCondition, WebhookAgent};

/// Segments customers based on webhook event patterns and behavior.
///
/// Analyzes event types, frequency, and amounts to assign customers
/// to behavioral segments (VIP, at-risk, new, power-user, etc.)
/// and trigger targeted campaigns.
pub struct CustomerSegmenter;

impl CustomerSegmenter {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl WebhookAgent for CustomerSegmenter {
    fn name(&self) -> &str {
        "customer_segmenter"
    }

    fn description(&self) -> &str {
        "Segments customers based on webhook event patterns and behavior for targeted engagement."
    }

    fn trigger_conditions(&self) -> Vec<TriggerCondition> {
        // Trigger on any customer-related event
        vec![
            TriggerCondition::on("customer.*"),
            TriggerCondition::on("payment.*"),
            TriggerCondition::on("order.*"),
            TriggerCondition::on("subscription.*"),
            TriggerCondition::on("account.*"),
        ]
    }

    async fn execute(&self, context: &WebhookContext) -> anyhow::Result<AgentResult> {
        let start = std::time::Instant::now();
        let event = context.event_type();
        let customer_id = context
            .extract_customer_id()
            .unwrap_or_else(|| context.customer_id.to_string());

        // Analyze customer behavior from recent deliveries
        let total_events = context.recent_deliveries.len();
        let success_count = context
            .recent_deliveries
            .iter()
            .filter(|d| d.status == "delivered")
            .count();
        let amount = context.extract_amount();

        // Determine segment
        let segment = determine_segment(event, total_events, success_count, amount, context);

        // Determine if a campaign should be triggered
        let campaign = determine_campaign(event, &segment);

        let mut actions = vec![
            // Always update the customer segment in CRM
            AgentAction::UpdateCRM {
                customer_id: customer_id.clone(),
                field: "segment".to_string(),
                value: json!({
                    "segment": segment.name(),
                    "event": event,
                    "total_events": total_events,
                    "success_rate": if total_events > 0 {
                        success_count as f64 / total_events as f64
                    } else {
                        0.0
                    },
                    "updated_at": chrono::Utc::now().to_rfc3339(),
                }),
            },
        ];

        // Trigger campaign if applicable
        if let Some(camp) = campaign {
            actions.push(AgentAction::TriggerCampaign {
                campaign_type: camp.campaign_type.to_string(),
                customer_id: customer_id.clone(),
                segment: segment.name().to_string(),
            });
        }

        let notifications = match segment {
            CustomerSegment::Vip => vec![AgentNotification::slack(
                "info",
                "VIP Customer Activity",
                &format!(
                    "VIP customer {} triggered {} — consider premium engagement",
                    customer_id, event
                ),
            )],
            CustomerSegment::NewUser => vec![AgentNotification::slack(
                "info",
                "New Customer",
                &format!("New customer {} — {}", customer_id, event),
            )],
            _ => vec![],
        };

        Ok(AgentResult {
            agent_name: self.name().to_string(),
            actions,
            notifications,
            confidence_score: 0.7, // Segmentation is fairly confident
            summary: format!(
                "Segmented customer {} as '{}' based on {} ({} total events)",
                customer_id,
                segment.name(),
                event,
                total_events
            ),
            raw_response: None,
            latency_ms: start.elapsed().as_millis() as u64,
            ai_provider_used: None,
        })
    }
}

/// Customer behavioral segments.
#[derive(Debug)]
enum CustomerSegment {
    /// High-value, frequent customer
    Vip,
    /// Recently created account
    NewUser,
    /// Power user with many events
    PowerUser,
    /// Customer with high failure rate
    AtRisk,
    /// Standard/default segment
    Standard,
}

impl CustomerSegment {
    fn name(&self) -> &str {
        match self {
            Self::Vip => "vip",
            Self::NewUser => "new_user",
            Self::PowerUser => "power_user",
            Self::AtRisk => "at_risk",
            Self::Standard => "standard",
        }
    }
}

/// Determine customer segment based on behavior patterns.
fn determine_segment(
    event: &str,
    total_events: usize,
    success_count: usize,
    amount: Option<f64>,
    ctx: &WebhookContext,
) -> CustomerSegment {
    // New account = new user
    if event == "account.created" || event == "customer.created" {
        return CustomerSegment::NewUser;
    }

    // High failure rate = at risk
    let failure_rate = if total_events > 0 {
        1.0 - (success_count as f64 / total_events as f64)
    } else {
        0.0
    };
    if failure_rate > 0.4 && total_events >= 5 {
        return CustomerSegment::AtRisk;
    }

    // High amount = VIP candidate
    if let Some(a) = amount {
        if a > 5000.0 {
            return CustomerSegment::Vip;
        }
    }

    // High volume = power user
    if total_events >= 20 {
        return CustomerSegment::PowerUser;
    }

    // Check recent failure rate from context
    if ctx.recent_failure_rate() > 0.3 {
        return CustomerSegment::AtRisk;
    }

    CustomerSegment::Standard
}

/// Determine if a campaign should be triggered based on segment and event.
struct CampaignTrigger {
    campaign_type: &'static str,
}

fn determine_campaign(event: &str, segment: &CustomerSegment) -> Option<CampaignTrigger> {
    match (segment, event) {
        (CustomerSegment::NewUser, _) => Some(CampaignTrigger {
            campaign_type: "onboarding",
        }),
        (CustomerSegment::Vip, "order.created") => Some(CampaignTrigger {
            campaign_type: "vip_thank_you",
        }),
        (CustomerSegment::AtRisk, _) => Some(CampaignTrigger {
            campaign_type: "retention",
        }),
        (CustomerSegment::PowerUser, "order.created") => Some(CampaignTrigger {
            campaign_type: "loyalty_reward",
        }),
        _ => None,
    }
}
