//! Transform pipeline — sequential transformer execution.

use anyhow::Result;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use super::filter;
use super::templates;
use super::EventTransformer;

/// A pipeline of transformers applied in sequence.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransformPipeline {
    pub steps: Vec<TransformStep>,
}

/// A single step in the transform pipeline.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransformStep {
    pub transform_type: TransformType,
    pub config: Value,
}

/// Supported transformer types.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum TransformType {
    FieldMapping,
    FieldFilter,
    ValueTransform,
    ConditionalFilter,
    JsonTemplate,
}

impl TransformPipeline {
    pub fn new() -> Self {
        Self { steps: Vec::new() }
    }

    pub fn add_step(&mut self, step: TransformStep) {
        self.steps.push(step);
    }

    pub fn execute(&self, input: &Value) -> Result<Value> {
        let mut current = input.clone();

        for step in &self.steps {
            let transformer = create_legacy_transformer(&step.transform_type, &step.config)?;
            current = transformer.transform(&current)?;
        }

        Ok(current)
    }

    pub fn execute_or_filter(&self, input: &Value) -> Result<Option<Value>> {
        let mut current = input.clone();

        for step in &self.steps {
            if step.transform_type == TransformType::ConditionalFilter {
                let filter = filter::ConditionalFilter::from_config(&step.config)?;
                if !filter.matches(&current)? {
                    return Ok(None);
                }
                continue;
            }

            let transformer = create_legacy_transformer(&step.transform_type, &step.config)?;
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

fn create_legacy_transformer(
    transform_type: &TransformType,
    config: &Value,
) -> Result<Box<dyn EventTransformer>> {
    match transform_type {
        TransformType::FieldMapping => Ok(Box::new(templates::FieldMapper::from_config(config)?)),
        TransformType::FieldFilter => Ok(Box::new(templates::FieldFilter::from_config(config)?)),
        TransformType::ValueTransform => {
            Ok(Box::new(templates::ValueTransformer::from_config(config)?))
        }
        TransformType::ConditionalFilter => Ok(Box::new(templates::PassThrough::new())),
        TransformType::JsonTemplate => Ok(Box::new(templates::JsonTemplate::from_config(config)?)),
    }
}
