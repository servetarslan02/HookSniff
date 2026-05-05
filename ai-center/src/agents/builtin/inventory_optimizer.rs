use async_trait::async_trait;

use crate::agents::context::WebhookContext;
use crate::agents::result::{AgentAction, AgentNotification, AgentResult};
use crate::agents::{TriggerCondition, WebhookAgent};

/// Predicts stock needs and suggests reorders based on order patterns.
///
/// Monitors order creation, cancellation, and stock level events
/// to optimize inventory management.
pub struct InventoryOptimizer;

impl InventoryOptimizer {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl WebhookAgent for InventoryOptimizer {
    fn name(&self) -> &str {
        "inventory_optimizer"
    }

    fn description(&self) -> &str {
        "Predicts stock needs and suggests reorders based on order patterns."
    }

    fn trigger_conditions(&self) -> Vec<TriggerCondition> {
        vec![
            TriggerCondition::on("order.created"),
            TriggerCondition::on("order.cancelled"),
            TriggerCondition::on("stock.low"),
            TriggerCondition::on("inventory.updated"),
        ]
    }

    async fn execute(&self, context: &WebhookContext) -> anyhow::Result<AgentResult> {
        let start = std::time::Instant::now();
        let event = context.event_type();

        // Count order events in recent history to gauge demand velocity
        let order_count = context
            .recent_deliveries
            .iter()
            .filter(|d| d.event_type.as_deref() == Some("order.created"))
            .count();

        let cancel_count = context
            .recent_deliveries
            .iter()
            .filter(|d| d.event_type.as_deref() == Some("order.cancelled"))
            .count();

        // Net orders = created - cancelled
        let net_orders = order_count as i64 - cancel_count as i64;

        // Determine urgency
        let urgency = match event {
            "stock.low" => InventoryUrgency::High,
            "order.created" if net_orders > 10 => InventoryUrgency::Medium,
            "order.created" if net_orders > 5 => InventoryUrgency::Low,
            _ => InventoryUrgency::None,
        };

        let actions = match urgency {
            InventoryUrgency::High => {
                vec![
                    AgentAction::NotifySlack {
                        channel: "#procurement".to_string(),
                        message: format!(
                            "📦 STOCK ALERT: Low stock detected | Recent orders: {} | Net demand: {} | Endpoint: {}",
                            order_count, net_orders, context.endpoint_url
                        ),
                        urgency: "high".to_string(),
                    },
                    AgentAction::CustomWebhook {
                        url: "https://inventory.internal/reorder-check".to_string(),
                        method: "POST".to_string(),
                        payload: serde_json::json!({
                            "trigger": "stock.low",
                            "recent_orders": order_count,
                            "net_demand": net_orders,
                            "endpoint_id": context.endpoint_id.to_string(),
                        }),
                    },
                ]
            }
            InventoryUrgency::Medium => {
                vec![
                    AgentAction::NotifySlack {
                        channel: "#procurement".to_string(),
                        message: format!(
                            "📦 Demand spike: {} orders (net {}) in recent window. Consider reviewing stock levels.",
                            order_count, net_orders
                        ),
                        urgency: "medium".to_string(),
                    },
                ]
            }
            InventoryUrgency::Low => {
                vec![
                    AgentAction::NotifySlack {
                        channel: "#procurement".to_string(),
                        message: format!(
                            "📦 Elevated demand: {} orders (net {}) — monitoring.",
                            order_count, net_orders
                        ),
                        urgency: "low".to_string(),
                    },
                ]
            }
            InventoryUrgency::None => vec![],
        };

        let notifications = match urgency {
            InventoryUrgency::High => vec![AgentNotification::warning_slack(
                "Stock Alert",
                &format!(
                    "Low stock trigger: {} recent orders, net demand {}",
                    order_count, net_orders
                ),
            )],
            _ => vec![],
        };

        let confidence = match urgency {
            InventoryUrgency::High => 0.9,
            InventoryUrgency::Medium => 0.6,
            InventoryUrgency::Low => 0.3,
            InventoryUrgency::None => 0.1,
        };

        Ok(AgentResult {
            agent_name: self.name().to_string(),
            actions,
            notifications,
            confidence_score: confidence,
            summary: format!(
                "Inventory analysis: event={}, orders={}, cancellations={}, net_demand={}, urgency={:?}",
                event, order_count, cancel_count, net_orders, urgency
            ),
            raw_response: None,
            latency_ms: start.elapsed().as_millis() as u64,
            ai_provider_used: None,
        })
    }
}

#[derive(Debug)]
enum InventoryUrgency {
    None,
    Low,
    Medium,
    High,
}
