//! ML-5: Contextual Bandit (Thompson Sampling)
//!
//! Like Multi-Armed Bandit, but considers CONTEXT (time of day, error type,
//! traffic level) when making decisions.
//!
//! Thompson Sampling: maintains a Beta distribution for each (arm, context) pair.
//! Samples from distributions and picks the arm with highest sample.
//! Naturally balances exploration vs exploitation.
//!
//! Application: "At night, use strategy A. During peak hours, use strategy B."

use sqlx::PgPool;
use super::{get_model_params, save_model_params};

/// Contextual bandit model
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct ContextualBanditModel {
    /// Arms (strategies) with context-aware statistics
    pub arms: Vec<ContextualArm>,
    /// Total plays
    pub total_plays: u64,
    /// Context features used
    pub context_features: Vec<String>,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct ContextualArm {
    pub name: String,
    /// Per-context-bin statistics (bin = hash of context features)
    pub context_stats: Vec<ContextBin>,
    /// Global statistics (across all contexts)
    pub global_plays: u64,
    pub global_reward_sum: f64,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct ContextBin {
    /// Context identifier (e.g., "night_low_traffic", "peak_high_errors")
    pub context_id: String,
    /// Alpha parameter for Beta distribution (successes + 1)
    pub alpha: f64,
    /// Beta parameter for Beta distribution (failures + 1)
    pub beta: f64,
    /// Number of times this arm was played in this context
    pub plays: u64,
    /// Average reward in this context
    pub avg_reward: f64,
}

impl ContextualArm {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            context_stats: Vec::new(),
            global_plays: 0,
            global_reward_sum: 0.0,
        }
    }

    /// Get or create context bin
    fn get_or_create_bin(&mut self, context_id: &str) -> &mut ContextBin {
        if let Some(idx) = self.context_stats.iter().position(|c| c.context_id == context_id) {
            return &mut self.context_stats[idx];
        }
        self.context_stats.push(ContextBin {
            context_id: context_id.to_string(),
            alpha: 1.0, // Prior: uniform
            beta: 1.0,
            plays: 0,
            avg_reward: 0.0,
        });
        self.context_stats.last_mut().unwrap()
    }

    /// Thompson Sampling: sample from Beta distribution for this context
    /// Returns a sampled value (higher = better)
    pub fn thompson_sample(&self, context_id: &str) -> f64 {
        // Find context bin
        if let Some(bin) = self.context_stats.iter().find(|c| c.context_id == context_id) {
            // Sample from Beta(alpha, beta)
            beta_sample(bin.alpha, bin.beta)
        } else {
            // No data for this context — use global average with high uncertainty
            if self.global_plays > 0 {
                let avg = self.global_reward_sum / self.global_plays as f64;
                // Add uncertainty
                beta_sample(avg * 5.0 + 1.0, (1.0 - avg) * 5.0 + 1.0)
            } else {
                // Completely unknown — uniform sample
                rand::random::<f64>()
            }
        }
    }

    /// Update statistics after a play
    pub fn update(&mut self, context_id: &str, reward: f64) {
        let bin = self.get_or_create_bin(context_id);
        bin.plays += 1;
        bin.avg_reward = (bin.avg_reward * (bin.plays - 1) as f64 + reward) / bin.plays as f64;

        // Update Beta distribution
        // reward is 0-1, so we treat it as probability of success
        bin.alpha += reward;
        bin.beta += 1.0 - reward;

        self.global_plays += 1;
        self.global_reward_sum += reward;
    }
}

impl ContextualBanditModel {
    pub fn new(arm_names: &[&str], context_features: Vec<String>) -> Self {
        Self {
            arms: arm_names.iter().map(|n| ContextualArm::new(n)).collect(),
            total_plays: 0,
            context_features,
        }
    }

    /// Select the best arm for the given context using Thompson Sampling
    pub fn select_arm(&mut self, context_id: &str) -> String {
        self.total_plays += 1;

        // Sample from each arm's Beta distribution for this context
        let best_idx = self.arms.iter()
            .enumerate()
            .map(|(i, arm)| (i, arm.thompson_sample(context_id)))
            .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap())
            .map(|(i, _)| i)
            .unwrap_or(0);

        self.arms[best_idx].name.clone()
    }

    /// Update the reward for an arm in a specific context
    pub fn update_arm(&mut self, arm_name: &str, context_id: &str, reward: f64) {
        if let Some(arm) = self.arms.iter_mut().find(|a| a.name == arm_name) {
            arm.update(context_id, reward);
        }
    }
}

/// Sample from Beta distribution using Jöhnk's algorithm
/// This is a simplified version — for production, use a proper RNG
fn beta_sample(alpha: f64, beta: f64) -> f64 {
    // For small alpha/beta, use the rejection method
    // For large values, approximate with normal distribution
    if alpha > 100.0 && beta > 100.0 {
        // Normal approximation
        let mean = alpha / (alpha + beta);
        let variance = (alpha * beta) / ((alpha + beta).powi(2) * (alpha + beta + 1.0));
        let std = variance.sqrt();
        // Box-Muller transform for normal sample
        let u1: f64 = rand::random::<f64>().max(0.001);
        let u2: f64 = rand::random::<f64>();
        let z = (-2.0 * u1.ln()).sqrt() * (2.0 * std::f64::consts::PI * u2).cos();
        (mean + std * z).clamp(0.0, 1.0)
    } else {
        // Simplified Beta sampling using Gamma distributions
        let x = gamma_sample(alpha);
        let y = gamma_sample(beta);
        if x + y == 0.0 { 0.5 } else { x / (x + y) }
    }
}

/// Sample from Gamma distribution (shape-only, scale=1)
fn gamma_sample(shape: f64) -> f64 {
    if shape < 1.0 {
        return gamma_sample(shape + 1.0) * rand::random::<f64>().powf(1.0 / shape);
    }

    let d = shape - 1.0 / 3.0;
    let c = 1.0 / (9.0 * d).sqrt();

    loop {
        let mut x;
        let mut v;
        loop {
            x = normal_sample();
            v = 1.0 + c * x;
            if v > 0.0 { break; }
        }
        let v = v * v * v;
        let u: f64 = rand::random::<f64>();
        if u < 1.0 - 0.0331 * (x * x) * (x * x) {
            return d * v;
        }
        if u.ln() < 0.5 * x * x + d * (1.0 - v + v.ln()) {
            return d * v;
        }
    }
}

/// Standard normal sample using Box-Muller
fn normal_sample() -> f64 {
    let u1: f64 = rand::random::<f64>().max(0.0001);
    let u2: f64 = rand::random::<f64>();
    (-2.0 * u1.ln()).sqrt() * (2.0 * std::f64::consts::PI * u2).cos()
}

/// Build context ID from features
pub fn build_context(hour: i32, error_rate: f64, traffic_level: &str) -> String {
    let time_bin = if hour >= 0 && hour < 6 { "night" }
        else if hour >= 6 && hour < 12 { "morning" }
        else if hour >= 12 && hour < 18 { "afternoon" }
        else { "evening" };

    let error_bin = if error_rate < 1.0 { "low_err" }
        else if error_rate < 10.0 { "med_err" }
        else { "high_err" };

    format!("{}_{}_{}", time_bin, error_bin, traffic_level)
}
