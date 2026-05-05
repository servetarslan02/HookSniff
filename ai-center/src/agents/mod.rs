pub mod builtin;
pub mod context;
pub mod orchestrator;
pub mod result;

use async_trait::async_trait;

use self::context::WebhookContext;
use self::result::AgentResult;

/// A trigger condition that determines when an agent should execute.
#[derive(Debug, Clone)]
pub struct TriggerCondition {
    /// Event type pattern to match (e.g., "payment.failed", "order.*")
    pub event_type: String,
    /// Minimum confidence threshold (0.0 - 1.0)
    pub min_confidence: Option<f64>,
}

impl TriggerCondition {
    pub fn on(event_type: &str) -> Self {
        Self {
            event_type: event_type.to_string(),
            min_confidence: None,
        }
    }

    pub fn with_min_confidence(mut self, threshold: f64) -> Self {
        self.min_confidence = Some(threshold);
        self
    }

    /// Check if a given event type matches this condition.
    /// Supports wildcard patterns like "payment.*".
    pub fn matches(&self, event_type: &str) -> bool {
        if self.event_type.ends_with(".*") {
            let prefix = &self.event_type[..self.event_type.len() - 2];
            event_type.starts_with(prefix)
        } else {
            self.event_type == event_type
        }
    }
}

/// Core trait for any AI agent that can be triggered by a webhook event.
///
/// Implement this trait to create a new agent. The orchestrator will
/// check trigger conditions and execute matching agents after each
/// successful webhook delivery.
#[async_trait]
pub trait WebhookAgent: Send + Sync {
    /// Unique agent name (e.g., "churn_detector")
    fn name(&self) -> &str;

    /// Human-readable description
    fn description(&self) -> &str;

    /// Which events trigger this agent
    fn trigger_conditions(&self) -> Vec<TriggerCondition>;

    /// Execute the agent's analysis on the given webhook context.
    async fn execute(&self, context: &WebhookContext) -> anyhow::Result<AgentResult>;

    /// Check if this agent should run for the given context.
    /// Default implementation checks trigger conditions.
    fn should_trigger(&self, context: &WebhookContext) -> bool {
        let event_type = context.event_type().to_string();
        self.trigger_conditions()
            .iter()
            .any(|tc| tc.matches(&event_type))
    }
}
