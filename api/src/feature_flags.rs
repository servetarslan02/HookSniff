use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Feature flag as stored in the database.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureFlag {
    pub name: String,
    pub is_enabled: bool,
    pub rollout_percentage: i32,
    pub enabled_for_plans: serde_json::Value,
}

/// In-memory feature flag store with periodic refresh from DB.
#[derive(Clone)]
pub struct FeatureFlagService {
    pool: PgPool,
    flags: Arc<RwLock<HashMap<String, FeatureFlag>>>,
}

impl FeatureFlagService {
    /// Create a new service and load flags from DB immediately.
    pub async fn new(pool: PgPool) -> Self {
        let flags = Arc::new(RwLock::new(HashMap::new()));
        let service = Self {
            pool,
            flags,
        };
        service.refresh().await;
        service
    }

    /// Refresh flags from the database.
    pub async fn refresh(&self) {
        match sqlx::query_as::<_, (String, bool, i32, serde_json::Value)>(
            "SELECT name, is_enabled, rollout_percentage, enabled_for_plans FROM feature_flags"
        )
        .fetch_all(&self.pool)
        .await
        {
            Ok(rows) => {
                let mut map = HashMap::new();
                for (name, is_enabled, rollout_percentage, enabled_for_plans) in rows {
                    map.insert(name.clone(), FeatureFlag {
                        name,
                        is_enabled,
                        rollout_percentage,
                        enabled_for_plans,
                    });
                }
                let mut flags = self.flags.write().await;
                *flags = map;
            }
            Err(e) => {
                tracing::error!("Failed to refresh feature flags: {e}");
            }
        }
    }

    /// Check if a flag is enabled (simple check, no plan/rollout).
    pub async fn is_enabled(&self, flag_name: &str) -> bool {
        let flags = self.flags.read().await;
        flags.get(flag_name).map(|f| f.is_enabled).unwrap_or(false)
    }

    /// Check if a flag is enabled for a specific plan.
    /// Respects `enabled_for_plans` (empty = all plans) and `rollout_percentage`.
    pub async fn is_enabled_for(&self, flag_name: &str, plan: &str, customer_id_hash: u32) -> bool {
        let flags = self.flags.read().await;
        match flags.get(flag_name) {
            Some(flag) if flag.is_enabled => {
                // Check plan filter
                if let Ok(plans) = serde_json::from_value::<Vec<String>>(flag.enabled_for_plans.clone()) {
                    if !plans.is_empty() && !plans.contains(&plan.to_string()) {
                        return false;
                    }
                }

                // Check rollout percentage (use customer_id_hash for deterministic rollout)
                if flag.rollout_percentage < 100 {
                    let bucket = customer_id_hash % 100;
                    return bucket < flag.rollout_percentage as u32;
                }

                true
            }
            _ => false,
        }
    }

    /// Get all flags (for admin display).
    pub async fn all(&self) -> Vec<FeatureFlag> {
        let flags = self.flags.read().await;
        flags.values().cloned().collect()
    }
}

/// Background task that refreshes feature flags every 60 seconds.
pub async fn feature_flag_refresher(service: FeatureFlagService) {
    let mut interval = tokio::time::interval(std::time::Duration::from_secs(60));
    loop {
        interval.tick().await;
        service.refresh().await;
    }
}

/// Hash a customer ID string to a u32 for rollout bucketing.
pub fn hash_customer_id(customer_id: &str) -> u32 {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut hasher = DefaultHasher::new();
    customer_id.hash(&mut hasher);
    hasher.finish() as u32
}
