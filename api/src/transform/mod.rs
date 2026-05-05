//! Event transformation pipeline for HookRelay's event mesh.
//!
//! Provides composable transformers that can be chained together to
//! transform events before delivery. Supports field mapping, filtering,
//! value transformation, and conditional processing.

pub mod filter;
pub mod templates;

use anyhow::Result;
use serde::{Deserialize, Serialize};
use serde_json::Value;

/// Trait for event transformers.
///
/// Each transformer takes an input event and produces an output event.
/// Transformers can be chained in a pipeline for composable processing.
pub trait EventTransformer: Send + Sync {
    /// Transform an input event into an output event.
    fn transform(&self, input: &Value) -> Result<Value>;

    /// Human-readable name for this transformer.
    fn name(&self) -> &str;
}

/// A pipeline of transformers applied in sequence.
///
/// Events pass through each transformer in order. If any transformer
/// fails, the pipeline stops and returns the error.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransformPipeline {
    /// Ordered list of transformer configurations.
    pub steps: Vec<TransformStep>,
}

/// A single step in the transform pipeline.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransformStep {
    /// Type of transformer to apply.
    pub transform_type: TransformType,
    /// Configuration for the transformer.
    pub config: Value,
}

/// Supported transformer types.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum TransformType {
    /// Field mapping: rename, move, or compute fields
    FieldMapping,
    /// Field filtering: include/exclude fields
    FieldFilter,
    /// Value transformation: uppercase, lowercase, date format
    ValueTransform,
    /// Conditional filter: skip events that don't match conditions
    ConditionalFilter,
    /// JSON template: apply a JSONata-like template
    JsonTemplate,
}

impl TransformPipeline {
    /// Create a new empty pipeline.
    pub fn new() -> Self {
        Self { steps: Vec::new() }
    }

    /// Add a step to the pipeline.
    pub fn add_step(&mut self, step: TransformStep) {
        self.steps.push(step);
    }

    /// Execute the pipeline on an event.
    ///
    /// Returns the transformed event, or an error if any step fails.
    /// If the pipeline is empty, returns the input unchanged.
    pub fn execute(&self, input: &Value) -> Result<Value> {
        let mut current = input.clone();

        for step in &self.steps {
            let transformer = create_transformer(&step.transform_type, &step.config)?;
            current = transformer.transform(&current)?;
        }

        Ok(current)
    }

    /// Execute the pipeline, returning None if a filter rejects the event.
    ///
    /// This is useful for conditional fan-out where some events should
    /// be dropped rather than transformed.
    pub fn execute_or_filter(&self, input: &Value) -> Result<Option<Value>> {
        let mut current = input.clone();

        for step in &self.steps {
            let transformer = create_transformer(&step.transform_type, &step.config)?;

            // Conditional filters can reject events
            if step.transform_type == TransformType::ConditionalFilter {
                let filter = filter::ConditionalFilter::from_config(&step.config)?;
                if !filter.matches(&current)? {
                    return Ok(None);
                }
                continue;
            }

            current = transformer.transform(&current)?;
        }

        Ok(Some(current))
    }
}

impl Default for TransformPipeline {
    fn default() -> Self {
        Self::new()
    }
}

/// Factory function to create a transformer from type and config.
fn create_transformer(
    transform_type: &TransformType,
    config: &Value,
) -> Result<Box<dyn EventTransformer>> {
    match transform_type {
        TransformType::FieldMapping => {
            Ok(Box::new(templates::FieldMapper::from_config(config)?))
        }
        TransformType::FieldFilter => {
            Ok(Box::new(templates::FieldFilter::from_config(config)?))
        }
        TransformType::ValueTransform => {
            Ok(Box::new(templates::ValueTransformer::from_config(config)?))
        }
        TransformType::ConditionalFilter => {
            Ok(Box::new(templates::PassThrough::new()))
        }
        TransformType::JsonTemplate => {
            Ok(Box::new(templates::JsonTemplate::from_config(config)?))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_empty_pipeline() {
        let pipeline = TransformPipeline::new();
        let input = json!({"key": "value"});
        let output = pipeline.execute(&input).unwrap();
        assert_eq!(output, input);
    }

    #[test]
    fn test_pipeline_chaining() {
        let mut pipeline = TransformPipeline::new();

        // Step 1: Rename "name" to "user_name"
        pipeline.add_step(TransformStep {
            transform_type: TransformType::FieldMapping,
            config: json!({"mappings": {"user_name": "name"}}),
        });

        // Step 2: Exclude "internal_field"
        pipeline.add_step(TransformStep {
            transform_type: TransformType::FieldFilter,
            config: json!({"exclude": ["internal_field"]}),
        });

        let input = json!({"name": "Alice", "internal_field": "secret", "age": 30});
        let output = pipeline.execute(&input).unwrap();

        assert_eq!(output["user_name"], "Alice");
        assert_eq!(output["age"], 30);
        assert!(output.get("name").is_none());
        assert!(output.get("internal_field").is_none());
    }
}
