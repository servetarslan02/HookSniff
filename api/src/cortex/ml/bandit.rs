//! ML-3: Multi-Armed Bandit (UCB1 + Epsilon-Greedy)
//!
//! Selects the best action (strategy) for each endpoint by balancing
//! exploration (trying new strategies) with exploitation (using known good ones).
//!
//! UCB1 formula: score = avg_reward + sqrt(2 * ln(total_plays) / plays_for_arm)
//! This naturally explores more when uncertain, and exploits when confident.
//!
//! Application: retry strategies, circuit breaker thresholds, throttle rates

use sqlx::PgPool;
use super::{get_model_params, save_model_params};

/// Bandit model stored per endpoint per decision type
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct BanditModel {
    /// Available arms (strategies) with their statistics
    pub arms: Vec<ArmStats>,
    /// Total number of plays across all arms
    pub total_plays: u64,
    /// Exploration parameter (higher = more exploration)
    pub exploration_rate: f64,
    /// Minimum plays before UCB kicks in (use uniform exploration first)
    pub min_exploration_plays: u64,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct ArmStats {
    pub name: String,
    pub plays: u64,
    pub total_reward: f64,
    pub avg_reward: f64,
    /// Exponential moving average of reward (more recent = more weight)
    pub ewma_reward: f64,
    /// Variance of rewards (for Thompson Sampling)
    pub reward_variance: f64,
    /// Last time this arm was played
    pub last_played: Option<String>,
}

impl ArmStats {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            plays: 0,
            total_reward: 0.0,
            avg_reward: 0.0,
            ewma_reward: 0.0,
            reward_variance: 0.0,
            last_played: None,
        }
    }

    /// UCB1 score: exploitation + exploration bonus
    pub fn ucb1_score(&self, total_plays: u64) -> f64 {
        if self.plays == 0 {
            return f64::INFINITY; // Always try unplayed arms first
        }
        let exploitation = self.avg_reward;
        let exploration = (2.0 * (total_plays as f64).ln() / self.plays as f64).sqrt();
        exploitation + exploration
    }

    /// Update statistics after a play
    pub fn update(&mut self, reward: f64) {
        self.plays += 1;
        self.total_reward += reward;
        self.avg_reward = self.total_reward / self.plays as f64;

        // EWMA with alpha=0.3 (recent rewards matter more)
        self.ewma_reward = 0.3 * reward + 0.7 * self.ewma_reward;

        // Update variance
        let diff = reward - self.avg_reward;
        self.reward_variance = (self.reward_variance * (self.plays - 1) as f64 + diff * diff) / self.plays as f64;

        self.last_played = Some(chrono::Utc::now().to_rfc3339());
    }
}

impl BanditModel {
    pub fn new(arm_names: &[&str], exploration_rate: f64) -> Self {
        Self {
            arms: arm_names.iter().map(|n| ArmStats::new(n)).collect(),
            total_plays: 0,
            exploration_rate,
            min_exploration_plays: (arm_names.len() * 3) as u64, // Try each arm 3 times before UCB
        }
    }

    /// Select the best arm using UCB1 algorithm
    pub fn select_arm(&mut self) -> String {
        self.total_plays += 1;

        // Phase 1: Uniform exploration (try each arm at least min_exploration_plays times)
        if self.total_plays <= self.min_exploration_plays {
            let idx = ((self.total_plays - 1) % self.arms.len() as u64) as usize;
            return self.arms[idx].name.clone();
        }

        // Phase 2: Epsilon-greedy with UCB1
        // With probability epsilon, explore randomly
        if rand::random::<f64>() < self.exploration_rate {
            let idx = (rand::random::<f64>() * self.arms.len() as f64) as usize;
            return self.arms[idx % self.arms.len()].name.clone();
        }

        // Otherwise, use UCB1 to select the best arm
        let best_idx = self.arms.iter()
            .enumerate()
            .max_by(|(_, a), (_, b)| {
                a.ucb1_score(self.total_plays).partial_cmp(&b.ucb1_score(self.total_plays)).unwrap()
            })
            .map(|(i, _)| i)
            .unwrap_or(0);

        self.arms[best_idx].name.clone()
    }

    /// Update the reward for an arm
    pub fn update_arm(&mut self, arm_name: &str, reward: f64) {
        if let Some(arm) = self.arms.iter_mut().find(|a| a.name == arm_name) {
            arm.update(reward);
        }
    }

    /// Get the best arm based on EWMA (more responsive to recent changes)
    pub fn best_arm_by_ewma(&self) -> Option<&ArmStats> {
        self.arms.iter().max_by(|a, b| {
            a.ewma_reward.partial_cmp(&b.ewma_reward).unwrap()
        })
    }

    /// Get confidence interval for an arm
    pub fn confidence_interval(&self, arm_name: &str) -> (f64, f64) {
        if let Some(arm) = self.arms.iter().find(|a| a.name == arm_name) {
            if arm.plays < 2 { return (0.0, 1.0); }
            let stderr = (arm.reward_variance / arm.plays as f64).sqrt();
            let ci = 1.96 * stderr; // 95% CI
            ((arm.avg_reward - ci).max(0.0), (arm.avg_reward + ci).min(1.0))
        } else {
            (0.0, 1.0)
        }
    }
}

/// Initialize bandit models for an endpoint if not exists
pub async fn init_if_needed(pool: &PgPool, endpoint_id: uuid::Uuid) -> Result<(), sqlx::Error> {
    // Retry strategy bandit
    let existing = get_model_params(pool, endpoint_id, "retry_bandit").await?;
    if existing.as_object().map_or(true, |o| o.is_empty()) {
        let model = BanditModel::new(
            &["exponential_backoff", "linear_backoff", "fixed_delay", "exponential_jitter", "immediate_retry"],
            0.15 // 15% exploration rate
        );
        let params = serde_json::to_value(&model).unwrap();
        save_model_params(pool, endpoint_id, "retry_bandit", &params, 0).await?;
    }

    // Circuit breaker threshold bandit
    let existing = get_model_params(pool, endpoint_id, "circuit_bandit").await?;
    if existing.as_object().map_or(true, |o| o.is_empty()) {
        let model = BanditModel::new(
            &["threshold_3", "threshold_5", "threshold_10", "threshold_15", "threshold_20"],
            0.10 // 10% exploration rate
        );
        let params = serde_json::to_value(&model).unwrap();
        save_model_params(pool, endpoint_id, "circuit_bandit", &params, 0).await?;
    }

    // Throttle rate bandit
    let existing = get_model_params(pool, endpoint_id, "throttle_bandit").await?;
    if existing.as_object().map_or(true, |o| o.is_empty()) {
        let model = BanditModel::new(
            &["rate_10", "rate_50", "rate_100", "rate_500", "rate_unlimited"],
            0.10
        );
        let params = serde_json::to_value(&model).unwrap();
        save_model_params(pool, endpoint_id, "throttle_bandit", &params, 0).await?;
    }

    // Healing strategy A/B testing bandit
    let existing = get_model_params(pool, endpoint_id, "healing_bandit").await?;
    if existing.as_object().map_or(true, |o| o.is_empty()) {
        let model = BanditModel::new(
            &["auto_disable", "circuit_tighten", "retry_slowdown", "rate_limit_reduce", "fallback_url_switch", "retry_increase", "timeout_adjust"],
            0.20 // 20% exploration rate (heuristic: need to learn what works)
        );
        let params = serde_json::to_value(&model).unwrap();
        save_model_params(pool, endpoint_id, "healing_bandit", &params, 0).await?;
    }

    Ok(())
}

/// Select the best retry strategy for an endpoint
pub async fn select_retry_strategy(pool: &PgPool, endpoint_id: uuid::Uuid) -> Result<String, sqlx::Error> {
    let existing = get_model_params(pool, endpoint_id, "retry_bandit").await?;
    let mut model: BanditModel = serde_json::from_value(existing).unwrap_or_else(|_| {
        BanditModel::new(&["exponential_backoff", "linear_backoff", "fixed_delay", "exponential_jitter", "immediate_retry"], 0.15)
    });
    let selected = model.select_arm();
    let params = serde_json::to_value(&model).unwrap();
    save_model_params(pool, endpoint_id, "retry_bandit", &params, model.total_plays as i32).await?;
    Ok(selected)
}

/// Update retry strategy reward
pub async fn update_retry_reward(pool: &PgPool, endpoint_id: uuid::Uuid, strategy: &str, success: bool, latency_ms: f64) -> Result<(), sqlx::Error> {
    let existing = get_model_params(pool, endpoint_id, "retry_bandit").await?;
    let mut model: BanditModel = serde_json::from_value(existing).unwrap_or_else(|_| {
        BanditModel::new(&["exponential_backoff", "linear_backoff", "fixed_delay", "exponential_jitter", "immediate_retry"], 0.15)
    });

    // Reward function: success is good, fast success is better, failure is bad
    let reward = if success {
        // Normalize latency: 0ms = 1.0, 10000ms = 0.5
        let latency_factor = (1.0 - latency_ms / 20000.0).max(0.5);
        latency_factor
    } else {
        0.0 // Failure = zero reward
    };

    model.update_arm(strategy, reward);
    let params = serde_json::to_value(&model).unwrap();
    save_model_params(pool, endpoint_id, "retry_bandit", &params, model.total_plays as i32).await?;

    Ok(())
}
