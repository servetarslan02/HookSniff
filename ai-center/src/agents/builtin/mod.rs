pub mod churn_detector;
pub mod customer_segmenter;
pub mod fraud_detector;
pub mod inventory_optimizer;

use super::WebhookAgent;

/// Create all built-in agents.
/// Returns a vector of boxed agent instances ready for registration
/// with the orchestrator.
pub fn all_builtin_agents() -> Vec<Box<dyn WebhookAgent>> {
    vec![
        Box::new(churn_detector::ChurnDetector::new()),
        Box::new(fraud_detector::FraudDetector::new()),
        Box::new(inventory_optimizer::InventoryOptimizer::new()),
        Box::new(customer_segmenter::CustomerSegmenter::new()),
    ]
}
