//! Event fan-out for HookRelay's event mesh.
//!
//! Routes a single event to multiple destinations based on fan-out rules.
//! Supports pattern matching on event type, conditional routing, and
//! per-target dead letter queues.

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::PgPool;
use tracing::{debug, error, info, warn};
use uuid::Uuid;

use crate::delivery::{DeliveryRouter, DeliveryResult};
use crate::WebhookMessage;

/// A fan-out rule that routes events to multiple targets.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct FanoutRule {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub event_pattern: String,
    pub conditions: Option<Value>,
    pub target_ids: Vec<Uuid>,
    pub dead_letter_endpoint_id: Option<Uuid>,
    pub enabled: bool,
}

/// Result of a fan-out operation for a single target.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FanoutTargetResult {
    pub target_id: Uuid,
    pub success: bool,
    pub error: Option<String>,
    pub duration_ms: i32,
}

/// Result of a complete fan-out operation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FanoutResult {
    pub delivery_id: String,
    pub targets_attempted: usize,
    pub targets_succeeded: usize,
    pub targets_failed: usize,
    pub results: Vec<FanoutTargetResult>,
}

/// Fan-out engine that routes events to multiple destinations.
pub struct FanoutEngine {
    pool: PgPool,
    delivery_router: DeliveryRouter,
}

impl FanoutEngine {
    pub fn new(pool: PgPool, delivery_router: DeliveryRouter) -> Self {
        Self {
            pool,
            delivery_router,
        }
    }

    /// Process fan-out rules for an event.
    ///
    /// 1. Load all matching fan-out rules for the customer
    /// 2. Evaluate conditions (if any)
    /// 3. Route to each target
    /// 4. Handle per-target dead letters
    pub async fn process_fanout(
        &self,
        customer_id: Uuid,
        event_type: &str,
        webhook: &WebhookMessage,
    ) -> Result<FanoutResult> {
        let rules = self.load_rules(customer_id, event_type).await?;

        if rules.is_empty() {
            debug!("No fan-out rules matched for event type '{}'", event_type);
            return Ok(FanoutResult {
                delivery_id: webhook.delivery_id.clone(),
                targets_attempted: 0,
                targets_succeeded: 0,
                targets_failed: 0,
                results: Vec::new(),
            });
        }

        info!(
            "🔀 Processing {} fan-out rules for delivery {} (event: {})",
            rules.len(),
            webhook.delivery_id,
            event_type
        );

        let mut all_results = Vec::new();
        let mut succeeded = 0;
        let mut failed = 0;

        for rule in &rules {
            // Evaluate conditions if present
            if let Some(ref conditions) = rule.conditions {
                if !evaluate_conditions(conditions, &webhook.payload)? {
                    debug!(
                        "Fan-out rule {} conditions not met for delivery {}",
                        rule.id, webhook.delivery_id
                    );
                    continue;
                }
            }

            // Route to each target
            for target_id in &rule.target_ids {
                let result = self
                    .deliver_to_target(*target_id, webhook, rule)
                    .await;

                match result {
                    Ok(target_result) => {
                        if target_result.success {
                            succeeded += 1;
                        } else {
                            failed += 1;
                            // Handle per-target dead letter
                            if let Some(dl_endpoint) = rule.dead_letter_endpoint_id {
                                self.send_to_dead_letter(
                                    dl_endpoint,
                                    webhook,
                                    target_result.error.as_deref().unwrap_or("unknown"),
                                )
                                .await;
                            }
                        }
                        all_results.push(target_result);
                    }
                    Err(e) => {
                        failed += 1;
                        warn!(
                            "Fan-out target {} failed for delivery {}: {:?}",
                            target_id, webhook.delivery_id, e
                        );
                        all_results.push(FanoutTargetResult {
                            target_id: *target_id,
                            success: false,
                            error: Some(e.to_string()),
                            duration_ms: 0,
                        });
                    }
                }
            }
        }

        info!(
            "🔀 Fan-out complete for delivery {}: {} succeeded, {} failed",
            webhook.delivery_id, succeeded, failed
        );

        Ok(FanoutResult {
            delivery_id: webhook.delivery_id.clone(),
            targets_attempted: succeeded + failed,
            targets_succeeded: succeeded,
            targets_failed: failed,
            results: all_results,
        })
    }

    /// Load fan-out rules that match the event type.
    async fn load_rules(
        &self,
        customer_id: Uuid,
        event_type: &str,
    ) -> Result<Vec<FanoutRule>> {
        let rules: Vec<FanoutRule> = sqlx::query_as(
            "SELECT id, customer_id, event_pattern, conditions, target_ids, \
             dead_letter_endpoint_id, enabled \
             FROM fanout_rules \
             WHERE customer_id = $1 AND enabled = true \
             ORDER BY created_at",
        )
        .bind(customer_id)
        .fetch_all(&self.pool)
        .await
        .context("Failed to load fan-out rules")?;

        // Filter by event pattern match
        let matching: Vec<FanoutRule> = rules
            .into_iter()
            .filter(|rule| pattern_matches(&rule.event_pattern, event_type))
            .collect();

        Ok(matching)
    }

    /// Deliver to a specific target.
    async fn deliver_to_target(
        &self,
        target_id: Uuid,
        webhook: &WebhookMessage,
        rule: &FanoutRule,
    ) -> Result<FanoutTargetResult> {
        let start = std::time::Instant::now();

        // Load the target configuration
        let target: Option<(String, Value)> = sqlx::query_as(
            "SELECT target_type, config FROM delivery_targets WHERE id = $1",
        )
        .bind(target_id)
        .fetch_optional(&self.pool)
        .await
        .context("Failed to load delivery target")?;

        let (target_type, config) = match target {
            Some(t) => t,
            None => {
                return Ok(FanoutTargetResult {
                    target_id,
                    success: false,
                    error: Some("Target not found".into()),
                    duration_ms: 0,
                });
            }
        };

        // Use the delivery router to dispatch
        let results = self.delivery_router.deliver(webhook).await?;
        let duration_ms = start.elapsed().as_millis() as i32;

        if let Some(result) = results.first() {
            Ok(FanoutTargetResult {
                target_id,
                success: result.success,
                error: if result.error.is_empty() {
                    None
                } else {
                    Some(result.error.clone())
                },
                duration_ms,
            })
        } else {
            Ok(FanoutTargetResult {
                target_id,
                success: false,
                error: Some("No delivery result returned".into()),
                duration_ms,
            })
        }
    }

    /// Send a failed delivery to a dead letter endpoint.
    async fn send_to_dead_letter(
        &self,
        dead_letter_endpoint_id: Uuid,
        webhook: &WebhookMessage,
        reason: &str,
    ) {
        // Insert into dead_letters table
        if let Err(e) = sqlx::query(
            "INSERT INTO dead_letters \
             (delivery_id, endpoint_id, customer_id, payload, reason, attempts) \
             VALUES ($1, $2, $3, $4, $5, 1)",
        )
        .bind(&webhook.delivery_id)
        .bind(dead_letter_endpoint_id)
        .bind(Uuid::nil()) // customer_id from webhook context
        .bind(&webhook.payload)
        .bind(reason)
        .execute(&self.pool)
        .await
        {
            error!("Failed to write dead letter: {:?}", e);
        }
    }
}

/// Evaluate fan-out conditions against a payload.
///
/// Conditions are stored as JSON with the structure:
/// ```json
/// {"field": "amount", "op": "gt", "value": 1000}
/// ```
fn evaluate_conditions(conditions: &Value, payload: &str) -> Result<bool> {
    let payload_value: Value = serde_json::from_str(payload)
        .context("Failed to parse event payload for condition evaluation")?;

    let field = conditions
        .get("field")
        .and_then(|v| v.as_str())
        .unwrap_or("");
    let op = conditions
        .get("op")
        .and_then(|v| v.as_str())
        .unwrap_or("equals");
    let value = conditions.get("value");

    // Resolve nested field path (e.g., "data.amount")
    let field_value = resolve_path(&payload_value, field);

    match op {
        "equals" => Ok(field_value.as_ref() == value),
        "not_equals" => Ok(field_value.as_ref() != value),
        "gt" | "greater_than" => {
            let num = field_value.and_then(|v| v.as_f64()).unwrap_or(0.0);
            let threshold = value.and_then(|v| v.as_f64()).unwrap_or(0.0);
            Ok(num > threshold)
        }
        "lt" | "less_than" => {
            let num = field_value.and_then(|v| v.as_f64()).unwrap_or(0.0);
            let threshold = value.and_then(|v| v.as_f64()).unwrap_or(0.0);
            Ok(num < threshold)
        }
        "contains" => {
            let field_str = field_value
                .as_ref()
                .and_then(|v| v.as_str())
                .unwrap_or("");
            let needle = value.and_then(|v| v.as_str()).unwrap_or("");
            Ok(field_str.contains(needle))
        }
        "exists" => Ok(field_value.is_some() && field_value.as_ref() != Some(&Value::Null)),
        _ => {
            warn!("Unknown condition operator: {}", op);
            Ok(true)
        }
    }
}

/// Resolve a dot-notation path in a JSON value.
fn resolve_path<'a>(value: &'a Value, path: &str) -> Option<&'a Value> {
    let mut current = value;
    for part in path.split('.') {
        current = match current {
            Value::Object(obj) => obj.get(part),
            Value::Array(arr) => part.parse::<usize>().ok().and_then(|i| arr.get(i)),
            _ => return None,
        }?;
    }
    Some(current)
}

/// Simple glob pattern matching for event types.
fn pattern_matches(pattern: &str, event_type: &str) -> bool {
    if pattern == "*" {
        return true;
    }
    if !pattern.contains('*') {
        return pattern == event_type;
    }

    let parts: Vec<&str> = pattern.split('*').collect();
    let mut pos = 0;

    for (i, part) in parts.iter().enumerate() {
        if part.is_empty() {
            continue;
        }
        if i == 0 {
            if !event_type[pos..].starts_with(part) {
                return false;
            }
            pos += part.len();
        } else if i == parts.len() - 1 {
            return event_type[pos..].ends_with(part);
        } else {
            if let Some(p) = event_type[pos..].find(part) {
                pos += p + part.len();
            } else {
                return false;
            }
        }
    }

    true
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_evaluate_conditions_gt() {
        let conditions = json!({"field": "amount", "op": "gt", "value": 1000});
        let payload = r#"{"amount": 1500}"#;
        assert!(evaluate_conditions(&conditions, payload).unwrap());
    }

    #[test]
    fn test_evaluate_conditions_nested() {
        let conditions = json!({"field": "data.amount", "op": "gt", "value": 1000});
        let payload = r#"{"data": {"amount": 1500}}"#;
        assert!(evaluate_conditions(&conditions, payload).unwrap());
    }

    #[test]
    fn test_pattern_matches_glob() {
        assert!(pattern_matches("order.*", "order.created"));
        assert!(!pattern_matches("order.*", "payment.created"));
    }
}
