pub mod ecommerce;
pub mod fintech;
pub mod healthcare;
pub mod saas;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Compliance requirement for an industry package
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceRequirement {
    pub name: String,
    pub description: String,
    pub masking_rules: Vec<DataMaskingRule>,
}

/// Rule for masking sensitive data fields
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataMaskingRule {
    /// JSON path to the field (e.g., "data.card_number")
    pub field_path: String,
    /// Mask strategy: "full", "partial", "hash"
    pub strategy: String,
    /// Optional regex pattern to match
    pub pattern: Option<String>,
    /// Replacement text (e.g., "****-****-****-****")
    pub replacement: Option<String>,
}

/// AI agent configuration for an industry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndustryAgent {
    pub name: String,
    pub description: String,
    pub event_types: Vec<String>,
    pub agent_type: String,
    pub config: serde_json::Value,
}

/// Webhook chain: a sequence of event triggers linked to downstream actions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookChain {
    pub trigger_event: String,
    pub downstream_events: Vec<String>,
    pub description: String,
}

/// Rate limit override for specific event types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventRateLimit {
    pub event_pattern: String,
    pub requests_per_minute: u32,
}

/// Configuration for an industry package
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndustryConfig {
    pub name: String,
    pub description: String,
    pub event_types: Vec<String>,
    pub compliance: Vec<ComplianceRequirement>,
    pub agents: Vec<IndustryAgent>,
    pub webhook_chains: Vec<WebhookChain>,
    pub rate_limits: Vec<EventRateLimit>,
}

/// Core trait for industry-specific webhook packages
pub trait IndustryPackage: Send + Sync {
    /// Unique package identifier
    fn name(&self) -> &str;

    /// Human-readable description
    fn description(&self) -> &str;

    /// Event types this industry uses
    fn event_types(&self) -> Vec<&str>;

    /// Compliance requirements (data masking, audit, encryption)
    fn compliance_requirements(&self) -> Vec<ComplianceRequirement>;

    /// AI agents specific to this industry
    fn agents(&self) -> Vec<IndustryAgent>;

    /// Webhook chain definitions
    fn webhook_chains(&self) -> Vec<WebhookChain>;

    /// Event-specific rate limit overrides
    fn rate_limits(&self) -> Vec<EventRateLimit>;

    /// Full configuration as serializable struct
    fn config(&self) -> IndustryConfig {
        IndustryConfig {
            name: self.name().to_string(),
            description: self.description().to_string(),
            event_types: self.event_types().iter().map(|s| s.to_string()).collect(),
            compliance: self.compliance_requirements(),
            agents: self.agents(),
            webhook_chains: self.webhook_chains(),
            rate_limits: self.rate_limits(),
        }
    }
}

/// Registry of all available industry packages
pub struct PackageManager {
    packages: Vec<Box<dyn IndustryPackage>>,
}

impl Default for PackageManager {
    fn default() -> Self {
        Self::new()
    }
}

impl PackageManager {
    pub fn new() -> Self {
        Self {
            packages: Vec::new(),
        }
    }

    /// Create a manager pre-loaded with all built-in industry packages
    pub fn with_defaults() -> Self {
        let mut mgr = Self::new();
        mgr.register(Box::new(fintech::FintechPackage::new()));
        mgr.register(Box::new(ecommerce::EcommercePackage::new()));
        mgr.register(Box::new(saas::SaaSvPackage::new()));
        mgr.register(Box::new(healthcare::HealthcarePackage::new()));
        mgr
    }

    /// Register an industry package
    pub fn register(&mut self, package: Box<dyn IndustryPackage>) {
        tracing::info!("📦 Registering industry package: {}", package.name());
        self.packages.push(package);
    }

    /// List all registered packages
    pub fn list(&self) -> Vec<&str> {
        self.packages.iter().map(|p| p.name()).collect()
    }

    /// Get a package by name
    pub fn get(&self, name: &str) -> Option<&dyn IndustryPackage> {
        self.packages
            .iter()
            .find(|p| p.name() == name)
            .map(|p| p.as_ref())
    }

    /// Get all event types across all packages
    pub fn all_event_types(&self) -> Vec<String> {
        let mut events = Vec::new();
        for pkg in &self.packages {
            for et in pkg.event_types() {
                if !events.iter().any(|e: &String| e == et) {
                    events.push(et.to_string());
                }
            }
        }
        events
    }

    /// Get all compliance masking rules for a given event type
    pub fn masking_rules_for_event(&self, event_type: &str) -> Vec<DataMaskingRule> {
        let mut rules = Vec::new();
        for pkg in &self.packages {
            for comp in pkg.compliance_requirements() {
                for rule in &comp.masking_rules {
                    // If the rule's field_path is relevant to this event type's package
                    if pkg
                        .event_types()
                        .iter()
                        .any(|et| et == &event_type || et.ends_with(".*"))
                    {
                        rules.push(rule.clone());
                    }
                }
            }
        }
        rules
    }

    /// Apply data masking to a payload based on all applicable rules
    pub fn apply_masking(
        &self,
        event_type: &str,
        payload: &serde_json::Value,
    ) -> serde_json::Value {
        let rules = self.masking_rules_for_event(event_type);
        if rules.is_empty() {
            return payload.clone();
        }

        let mut masked = payload.clone();
        for rule in &rules {
            apply_masking_rule(&mut masked, rule);
        }
        masked
    }
}

/// Apply a single masking rule to a JSON value in-place
fn apply_masking_rule(value: &mut serde_json::Value, rule: &DataMaskingRule) {
    let parts: Vec<&str> = rule.field_path.split('.').collect();
    apply_masking_recursive(value, &parts, rule);
}

fn apply_masking_recursive(value: &mut serde_json::Value, path: &[&str], rule: &DataMaskingRule) {
    if path.is_empty() {
        return;
    }

    if let Some(obj) = value.as_object_mut() {
        if path.len() == 1 {
            // Leaf node — apply masking
            if let Some(field) = obj.get_mut(path[0]) {
                if let Some(s) = field.as_str() {
                    *field = serde_json::Value::String(mask_value(s, rule));
                }
            }
        } else if let Some(child) = obj.get_mut(path[0]) {
            apply_masking_recursive(child, &path[1..], rule);
        }
    }
}

fn mask_value(value: &str, rule: &DataMaskingRule) -> String {
    match rule.strategy.as_str() {
        "full" => rule
            .replacement
            .clone()
            .unwrap_or_else(|| "****".to_string()),
        "partial" => {
            // Show first 4 and last 4, mask the middle
            if value.len() > 8 {
                format!("{}****{}", &value[..4], &value[value.len() - 4..])
            } else {
                "****".to_string()
            }
        }
        "hash" => {
            // Simple hash representation
            format!("[hash:{}]", value.len())
        }
        _ => "****".to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_masking_full() {
        let rule = DataMaskingRule {
            field_path: "data.card_number".to_string(),
            strategy: "full".to_string(),
            pattern: None,
            replacement: Some("****-****-****-****".to_string()),
        };
        assert_eq!(mask_value("4111111111111111", &rule), "****-****-****-****");
    }

    #[test]
    fn test_masking_partial() {
        let rule = DataMaskingRule {
            field_path: "data.card_number".to_string(),
            strategy: "partial".to_string(),
            pattern: None,
            replacement: None,
        };
        assert_eq!(mask_value("4111111111111111", &rule), "4111****1111");
    }

    #[test]
    fn test_package_manager_defaults() {
        let mgr = PackageManager::with_defaults();
        assert_eq!(mgr.list().len(), 4);
        assert!(mgr.get("fintech").is_some());
        assert!(mgr.get("ecommerce").is_some());
        assert!(mgr.get("saas").is_some());
        assert!(mgr.get("healthcare").is_some());
    }
}
