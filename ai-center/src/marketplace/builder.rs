use anyhow::Result;
use serde::{Deserialize, Serialize};

use super::*;

/// No-code agent builder — lets users create marketplace agents without writing code
pub struct AgentBuilder;

impl AgentBuilder {
    /// Create a new agent from a builder request (validates and normalizes)
    pub fn build(req: &PublishAgentRequest) -> Result<ValidatedAgent> {
        // Validate name
        if req.name.is_empty() || req.name.len() > 100 {
            return Err(anyhow::anyhow!(
                "Agent name must be between 1 and 100 characters"
            ));
        }

        // Validate version format (semver-like)
        let version = req.version.clone().unwrap_or_else(|| "1.0.0".to_string());
        if !is_valid_version(&version) {
            return Err(anyhow::anyhow!(
                "Invalid version format: '{}'. Use semver (e.g., 1.0.0)",
                version
            ));
        }

        // Validate triggers
        if req.triggers.is_empty() {
            return Err(anyhow::anyhow!(
                "Agent must have at least one trigger"
            ));
        }

        for trigger in &req.triggers {
            if trigger.event_pattern.is_empty() {
                return Err(anyhow::anyhow!("Trigger event pattern cannot be empty"));
            }
            // Validate condition syntax if provided
            if let Some(ref condition) = trigger.condition {
                validate_condition(condition)?;
            }
        }

        // Validate actions
        if req.actions.is_empty() {
            return Err(anyhow::anyhow!(
                "Agent must have at least one action"
            ));
        }

        for action in &req.actions {
            validate_action(&action.action_type)?;
        }

        // Validate AI config if provided
        if let Some(ref ai) = req.ai_config {
            validate_ai_config(ai)?;
        }

        Ok(ValidatedAgent {
            name: req.name.clone(),
            description: req.description.clone(),
            version,
            config: req.config.clone(),
            triggers: req.triggers.clone(),
            actions: req.actions.clone(),
            ai_config: req.ai_config.clone(),
            tags: req.tags.clone().unwrap_or_default(),
        })
    }

    /// Generate a sample agent config for a given use case
    pub fn sample_config(use_case: &str) -> serde_json::Value {
        match use_case {
            "fraud_detection" => serde_json::json!({
                "name": "Custom Fraud Detector",
                "description": "AI-powered fraud detection with customizable rules",
                "triggers": [
                    {
                        "event_pattern": "payment.completed",
                        "condition": "data.amount > 100",
                        "description": "Trigger on high-value payments"
                    }
                ],
                "actions": [
                    {
                        "action_type": "notify",
                        "config": {"channels": ["email", "slack"], "severity": "high"},
                        "description": "Alert on suspicious transactions"
                    },
                    {
                        "action_type": "flag",
                        "config": {"flag_name": "review_needed", "auto_approve_below_score": 30},
                        "description": "Flag for manual review"
                    }
                ],
                "ai_config": {
                    "provider": "auto",
                    "system_prompt": "Analyze this transaction for fraud indicators. Consider: amount deviation from baseline, geographic anomalies, velocity patterns, and device fingerprint changes.",
                    "analysis_type": "anomaly",
                    "output_schema": {
                        "fraud_score": "number (0-100)",
                        "indicators": "array of strings",
                        "recommendation": "approve|review|block"
                    }
                },
                "tags": ["fraud", "payments", "security"]
            }),
            "churn_prediction" => serde_json::json!({
                "name": "Churn Predictor",
                "description": "Predicts customer churn risk based on behavioral signals",
                "triggers": [
                    {
                        "event_pattern": "subscription.trial_ending",
                        "condition": null,
                        "description": "Monitor trial expirations"
                    },
                    {
                        "event_pattern": "usage.threshold",
                        "condition": "data.usage_percent < 20",
                        "description": "Low usage signals"
                    }
                ],
                "actions": [
                    {
                        "action_type": "notify",
                        "config": {"channels": ["email"], "template": "retention_offer"},
                        "description": "Send retention offer to at-risk customers"
                    }
                ],
                "ai_config": {
                    "provider": "auto",
                    "system_prompt": "Based on this customer's recent activity, predict their likelihood of churning. Consider: login frequency, feature usage, support interactions, and billing history.",
                    "analysis_type": "classification",
                    "output_schema": {
                        "churn_probability": "number (0-1)",
                        "risk_factors": "array of strings",
                        "recommended_action": "string"
                    }
                },
                "tags": ["churn", "retention", "saas"]
            }),
            "order_monitor" => serde_json::json!({
                "name": "Order Monitor",
                "description": "Monitors order lifecycle and alerts on anomalies",
                "triggers": [
                    {
                        "event_pattern": "order.*",
                        "condition": null,
                        "description": "All order events"
                    }
                ],
                "actions": [
                    {
                        "action_type": "transform",
                        "config": {"enrich_with": ["customer_history", "product_details"]},
                        "description": "Enrich order data with context"
                    },
                    {
                        "action_type": "notify",
                        "config": {"channels": ["slack"], "threshold": "high_value_orders"},
                        "description": "Alert on high-value orders"
                    }
                ],
                "ai_config": {
                    "provider": "auto",
                    "system_prompt": "Analyze this order for anomalies. Check for unusual quantities, suspicious shipping addresses, and potential fraud patterns.",
                    "analysis_type": "anomaly",
                    "output_schema": {
                        "anomaly_score": "number (0-100)",
                        "flags": "array of strings"
                    }
                },
                "tags": ["orders", "ecommerce", "monitoring"]
            }),
            _ => serde_json::json!({
                "name": "Custom Agent",
                "description": "A customizable webhook processing agent",
                "triggers": [
                    {
                        "event_pattern": "*",
                        "condition": null,
                        "description": "All events"
                    }
                ],
                "actions": [
                    {
                        "action_type": "notify",
                        "config": {"channels": ["email"]},
                        "description": "Send notification"
                    }
                ],
                "ai_config": {
                    "provider": "auto",
                    "system_prompt": "Analyze this event and provide insights.",
                    "analysis_type": "general"
                },
                "tags": ["custom"]
            }),
        }
    }

    /// List available action types with descriptions
    pub fn available_actions() -> Vec<ActionTypeDefinition> {
        vec![
            ActionTypeDefinition {
                action_type: "notify".to_string(),
                description: "Send a notification via email, Slack, SMS, or webhook".to_string(),
                config_schema: serde_json::json!({
                    "channels": "array of: email, slack, sms, webhook",
                    "severity": "low | medium | high | critical",
                    "template": "optional notification template name"
                }),
            },
            ActionTypeDefinition {
                action_type: "retry".to_string(),
                description: "Retry failed webhook delivery with configurable backoff".to_string(),
                config_schema: serde_json::json!({
                    "max_attempts": "number",
                    "backoff": "exponential | linear | fixed",
                    "delay_seconds": "number"
                }),
            },
            ActionTypeDefinition {
                action_type: "transform".to_string(),
                description: "Transform webhook payload — enrich, filter, or restructure data".to_string(),
                config_schema: serde_json::json!({
                    "enrich_with": "array of data sources to merge",
                    "filter_fields": "array of fields to keep",
                    "rename_fields": "object mapping old_name to new_name"
                }),
            },
            ActionTypeDefinition {
                action_type: "custom_webhook".to_string(),
                description: "Forward to another webhook endpoint".to_string(),
                config_schema: serde_json::json!({
                    "url": "target endpoint URL",
                    "method": "POST | PUT",
                    "headers": "custom headers object"
                }),
            },
            ActionTypeDefinition {
                action_type: "block".to_string(),
                description: "Block or quarantine suspicious payloads".to_string(),
                config_schema: serde_json::json!({
                    "block_duration_minutes": "number",
                    "notify_admin": "boolean",
                    "reason": "blocking reason string"
                }),
            },
            ActionTypeDefinition {
                action_type: "flag".to_string(),
                description: "Flag payload for manual review without blocking delivery".to_string(),
                config_schema: serde_json::json!({
                    "flag_name": "string",
                    "auto_approve_below_score": "number (0-100)"
                }),
            },
        ]
    }

    /// List available AI analysis types
    pub fn available_analysis_types() -> Vec<AnalysisTypeDefinition> {
        vec![
            AnalysisTypeDefinition {
                analysis_type: "anomaly".to_string(),
                description: "Detect anomalies and outliers in event data".to_string(),
                example_prompt: "Analyze this event for anomalies compared to historical patterns.".to_string(),
            },
            AnalysisTypeDefinition {
                analysis_type: "classification".to_string(),
                description: "Classify events into categories or risk levels".to_string(),
                example_prompt: "Classify this event's risk level and assign it to a category.".to_string(),
            },
            AnalysisTypeDefinition {
                analysis_type: "sentiment".to_string(),
                description: "Analyze sentiment in text-heavy payloads (reviews, messages, feedback)".to_string(),
                example_prompt: "Analyze the sentiment of this customer message.".to_string(),
            },
            AnalysisTypeDefinition {
                analysis_type: "extraction".to_string(),
                description: "Extract structured data from unstructured payloads".to_string(),
                example_prompt: "Extract key entities and structured data from this payload.".to_string(),
            },
            AnalysisTypeDefinition {
                analysis_type: "general".to_string(),
                description: "General-purpose AI analysis with custom prompt".to_string(),
                example_prompt: "Analyze this event and provide actionable insights.".to_string(),
            },
        ]
    }
}

/// Validated agent ready for publishing
#[derive(Debug, Serialize)]
pub struct ValidatedAgent {
    pub name: String,
    pub description: String,
    pub version: String,
    pub config: serde_json::Value,
    pub triggers: Vec<AgentTrigger>,
    pub actions: Vec<AgentAction>,
    pub ai_config: Option<AiAnalysisConfig>,
    pub tags: Vec<String>,
}

/// Definition of an available action type
#[derive(Debug, Serialize)]
pub struct ActionTypeDefinition {
    pub action_type: String,
    pub description: String,
    pub config_schema: serde_json::Value,
}

/// Definition of an available analysis type
#[derive(Debug, Serialize)]
pub struct AnalysisTypeDefinition {
    pub analysis_type: String,
    pub description: String,
    pub example_prompt: String,
}

/// Validate semver-like version string
fn is_valid_version(version: &str) -> bool {
    let parts: Vec<&str> = version.split('.').collect();
    if parts.len() != 3 {
        return false;
    }
    parts.iter().all(|p| p.parse::<u32>().is_ok())
}

/// Validate a condition expression (basic syntax check)
fn validate_condition(condition: &str) -> Result<()> {
    if condition.is_empty() {
        return Ok(());
    }

    // Basic validation: must contain a comparison operator
    let has_operator = condition.contains('>')
        || condition.contains('<')
        || condition.contains("==")
        || condition.contains("!=")
        || condition.contains(">=")
        || condition.contains("<=")
        || condition.contains("contains")
        || condition.contains("matches");

    if !has_operator {
        return Err(anyhow::anyhow!(
            "Condition '{}' must contain a comparison operator (>, <, ==, !=, >=, <=, contains, matches)",
            condition
        ));
    }

    Ok(())
}

/// Validate action type
fn validate_action(action_type: &str) -> Result<()> {
    let valid_types = ["notify", "retry", "transform", "custom_webhook", "block", "flag"];
    if !valid_types.contains(&action_type) {
        return Err(anyhow::anyhow!(
            "Invalid action type: '{}'. Valid types: {:?}",
            action_type,
            valid_types
        ));
    }
    Ok(())
}

/// Validate AI config
fn validate_ai_config(config: &AiAnalysisConfig) -> Result<()> {
    let valid_providers = ["auto", "mimo", "openai", "gemini", "groq", "cerebras", "openrouter"];
    if !valid_providers.contains(&config.provider.as_str()) {
        return Err(anyhow::anyhow!(
            "Invalid AI provider: '{}'. Valid providers: {:?}",
            config.provider,
            valid_providers
        ));
    }

    let valid_types = ["anomaly", "classification", "sentiment", "extraction", "general"];
    if !valid_types.contains(&config.analysis_type.as_str()) {
        return Err(anyhow::anyhow!(
            "Invalid analysis type: '{}'. Valid types: {:?}",
            config.analysis_type,
            valid_types
        ));
    }

    if config.system_prompt.is_empty() {
        return Err(anyhow::anyhow!("AI system prompt cannot be empty"));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_version() {
        assert!(is_valid_version("1.0.0"));
        assert!(is_valid_version("2.3.1"));
        assert!(is_valid_version("0.0.1"));
        assert!(!is_valid_version("1.0"));
        assert!(!is_valid_version("1.0.0-beta"));
        assert!(!is_valid_version("abc"));
    }

    #[test]
    fn test_validate_condition() {
        assert!(validate_condition("data.amount > 100").is_ok());
        assert!(validate_condition("data.status == 'active'").is_ok());
        assert!(validate_condition("").is_ok()); // empty is OK
        assert!(validate_condition("just_text").is_err());
    }

    #[test]
    fn test_validate_action() {
        assert!(validate_action("notify").is_ok());
        assert!(validate_action("block").is_ok());
        assert!(validate_action("invalid_type").is_err());
    }

    #[test]
    fn test_sample_configs() {
        let fraud = AgentBuilder::sample_config("fraud_detection");
        assert!(fraud.get("name").is_some());
        assert!(fraud.get("triggers").is_some());

        let churn = AgentBuilder::sample_config("churn_prediction");
        assert!(churn.get("name").is_some());
    }
}
