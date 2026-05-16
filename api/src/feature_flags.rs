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

    /// Check if a flag is globally enabled (is_enabled=true AND rollout=100%).
    /// Use for features that apply to ALL customers when enabled (e.g., deduplication, GDPR).
    /// For per-customer rollout, use `is_enabled_for()` instead.
    pub async fn is_enabled(&self, flag_name: &str) -> bool {
        let flags = self.flags.read().await;
        flags
            .get(flag_name)
            .map(|f| f.is_enabled && f.rollout_percentage >= 100)
            .unwrap_or(false)
    }

    /// Check if a flag is enabled for a specific plan.
    /// Respects `enabled_for_plans` (empty = all plans) and `rollout_percentage`.
    pub async fn is_enabled_for(&self, flag_name: &str, plan: &str, customer_id_hash: u32) -> bool {
        let flags = self.flags.read().await;
        match flags.get(flag_name) {
            Some(flag) if flag.is_enabled => {
                // Check plan filter — fail-closed: invalid JSON = no plans allowed
                match serde_json::from_value::<Vec<String>>(flag.enabled_for_plans.clone()) {
                    Ok(plans) if !plans.is_empty() && !plans.contains(&plan.to_string()) => {
                        return false;
                    }
                    Err(_) => {
                        tracing::warn!("Feature flag '{}' has invalid enabled_for_plans JSON, denying access", flag_name);
                        return false;
                    }
                    _ => {} // empty plans = all plans allowed
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

    /// Check if a flag exists and is enabled (ignores rollout — for admin display).
    pub async fn is_flag_active(&self, flag_name: &str) -> bool {
        let flags = self.flags.read().await;
        flags.get(flag_name).map(|f| f.is_enabled).unwrap_or(false)
    }

    /// Get all flags (for admin display).
    pub async fn all(&self) -> Vec<FeatureFlag> {
        let flags = self.flags.read().await;
        let mut sorted: Vec<_> = flags.values().cloned().collect();
        sorted.sort_by(|a, b| a.name.cmp(&b.name));
        sorted
    }
}

/// Background task that refreshes feature flags every 60 seconds.
/// On DB failure, backs off exponentially up to 5 minutes.
pub async fn feature_flag_refresher(service: FeatureFlagService) {
    let base_interval = std::time::Duration::from_secs(60);
    let max_backoff = std::time::Duration::from_secs(300);
    let mut backoff = base_interval;
    let mut interval = tokio::time::interval(base_interval);

    loop {
        interval.tick().await;
        // Try refresh — on success, reset backoff; on failure, increase it
        let result = sqlx::query_as::<_, (String, bool, i32, serde_json::Value)>(
            "SELECT name, is_enabled, rollout_percentage, enabled_for_plans FROM feature_flags"
        )
        .fetch_all(&service.pool)
        .await;

        match result {
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
                let mut flags = service.flags.write().await;
                *flags = map;
                backoff = base_interval; // reset on success
            }
            Err(e) => {
                tracing::error!("Failed to refresh feature flags (retry in {}s): {e}", backoff.as_secs());
                backoff = std::cmp::min(backoff * 2, max_backoff);
                interval = tokio::time::interval(backoff);
                interval.tick().await; // consume the immediate tick
            }
        }
    }
}

/// Hash a customer ID string to a u32 for rollout bucketing.
/// Uses FNV-1a for deterministic, stable hashing across restarts and Rust versions.
/// DefaultHasher is NOT stable — different results after process restart.
pub fn hash_customer_id(customer_id: &str) -> u32 {
    // FNV-1a constants
    const FNV_OFFSET: u64 = 0xcbf29ce484222325;
    const FNV_PRIME: u64 = 0x100000001b3;

    let mut hash = FNV_OFFSET;
    for byte in customer_id.as_bytes() {
        hash ^= *byte as u64;
        hash = hash.wrapping_mul(FNV_PRIME);
    }
    hash as u32
}
