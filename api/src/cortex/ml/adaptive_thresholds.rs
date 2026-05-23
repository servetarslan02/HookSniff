//! ML-1: Adaptive Thresholds
//!
//! Instead of fixed thresholds, each endpoint learns its own "normal" range.
//! Uses EWMA (Exponentially Weighted Moving Average) for smooth tracking
//! and IQR (Interquartile Range) for robust outlier detection.
//!
//! Unlike fixed thresholds (e.g., "p95 > 5000ms = anomaly"), adaptive thresholds
//! learn what's normal FOR EACH ENDPOINT based on its history.

use sqlx::PgPool;
use super::{get_model_params, save_model_params, record_feature};

/// EWMA parameters stored per endpoint
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct AdaptiveThresholdModel {
    /// EWMA of success rate (0-100)
    pub ewma_success_rate: f64,
    /// EWMA of latency (ms)
    pub ewma_latency: f64,
    /// EWMA of p95 latency (ms)
    pub ewma_p95: f64,
    /// EWMA of delivery rate (per hour)
    pub ewma_delivery_rate: f64,
    /// EWMA variance of success rate
    pub ewma_sr_variance: f64,
    /// EWMA variance of latency
    pub ewma_latency_variance: f64,
    /// IQR-based bounds for success rate
    pub sr_q1: f64,
    pub sr_q3: f64,
    /// IQR-based bounds for latency
    pub latency_q1: f64,
    pub latency_q3: f64,
    /// Smoothing factor (higher = more responsive, lower = more stable)
    pub alpha: f64,
    /// Number of training samples
    pub samples: i32,
    /// Last update timestamp
    pub last_update: Option<String>,
}

impl Default for AdaptiveThresholdModel {
    fn default() -> Self {
        Self {
            ewma_success_rate: 100.0,
            ewma_latency: 0.0,
            ewma_p95: 0.0,
            ewma_delivery_rate: 0.0,
            ewma_sr_variance: 0.0,
            ewma_latency_variance: 0.0,
            sr_q1: 95.0,
            sr_q3: 100.0,
            latency_q1: 0.0,
            latency_q3: 1000.0,
            alpha: 0.3, // Standard EWMA smoothing
            samples: 0,
            last_update: None,
        }
    }
}

/// Train adaptive thresholds using EWMA + IQR
pub async fn train(
    pool: &PgPool,
    endpoint_id: uuid::Uuid,
    success_rates: &[f64],
    latencies: &[f64],
    p95_latencies: &[f64],
) -> Result<(), sqlx::Error> {
    let existing = get_model_params(pool, endpoint_id, "adaptive_threshold").await?;
    let mut model: AdaptiveThresholdModel = serde_json::from_value(existing).unwrap_or_default();

    let alpha = model.alpha;
    let one_minus_alpha = 1.0 - alpha;

    // Update EWMA for each data point
    for (i, sr) in success_rates.iter().enumerate() {
        // EWMA: new = alpha * current + (1-alpha) * old
        model.ewma_success_rate = alpha * sr + one_minus_alpha * model.ewma_success_rate;

        // EWMA variance: Var = alpha * (x - ewma)^2 + (1-alpha) * old_var
        let sr_diff = sr - model.ewma_success_rate;
        model.ewma_sr_variance = alpha * sr_diff * sr_diff + one_minus_alpha * model.ewma_sr_variance;

        if i < latencies.len() {
            model.ewma_latency = alpha * latencies[i] + one_minus_alpha * model.ewma_latency;
            let lat_diff = latencies[i] - model.ewma_latency;
            model.ewma_latency_variance = alpha * lat_diff * lat_diff + one_minus_alpha * model.ewma_latency_variance;
        }

        if i < p95_latencies.len() {
            model.ewma_p95 = alpha * p95_latencies[i] + one_minus_alpha * model.ewma_p95;
        }

        model.samples += 1;
    }

    // Calculate IQR bounds (robust to outliers)
    let mut sorted_sr = success_rates.to_vec();
    sorted_sr.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let n = sorted_sr.len();
    if n >= 4 {
        model.sr_q1 = sorted_sr[n / 4];
        model.sr_q3 = sorted_sr[3 * n / 4];
    }

    let mut sorted_lat = latencies.to_vec();
    sorted_lat.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let n = sorted_lat.len();
    if n >= 4 {
        model.latency_q1 = sorted_lat[n / 4];
        model.latency_q3 = sorted_lat[3 * n / 4];
    }

    // Save model
    let params = serde_json::to_value(&model).unwrap();
    save_model_params(pool, endpoint_id, "adaptive_threshold", &params, model.samples).await?;

    // Record features for analysis
    record_feature(pool, endpoint_id, "ewma_success_rate", model.ewma_success_rate).await?;
    record_feature(pool, endpoint_id, "ewma_latency", model.ewma_latency).await?;
    record_feature(pool, endpoint_id, "ewma_sr_stddev", model.ewma_sr_variance.sqrt()).await?;

    Ok(())
}

/// Check if a data point is anomalous using adaptive thresholds
pub fn is_anomalous(model: &AdaptiveThresholdModel, success_rate: f64, latency: f64) -> (bool, f64, String) {
    let mut anomaly_score = 0.0;
    let mut reasons = Vec::new();

    // 1. Success rate below IQR lower bound
    let iqr = model.sr_q3 - model.sr_q1;
    let sr_lower = model.sr_q1 - 1.5 * iqr;
    if success_rate < sr_lower && model.samples > 10 {
        let deviation = (sr_lower - success_rate) / iqr.max(1.0);
        anomaly_score += (deviation * 40.0).min(50.0);
        reasons.push(format!("SR {:.1}% below adaptive threshold {:.1}%", success_rate, sr_lower));
    }

    // 2. Latency above IQR upper bound
    let lat_iqr = model.latency_q3 - model.latency_q1;
    let lat_upper = model.latency_q3 + 1.5 * lat_iqr;
    if latency > lat_upper && model.samples > 10 {
        let deviation = (latency - lat_upper) / lat_iqr.max(1.0);
        anomaly_score += (deviation * 30.0).min(40.0);
        reasons.push(format!("Latency {:.0}ms above adaptive threshold {:.0}ms", latency, lat_upper));
    }

    // 3. Z-Score based on EWMA variance
    let sr_stddev = model.ewma_sr_variance.sqrt().max(0.1);
    let sr_zscore = (success_rate - model.ewma_success_rate).abs() / sr_stddev;
    if sr_zscore > 2.5 && model.samples > 10 {
        anomaly_score += (sr_zscore * 10.0).min(30.0);
        reasons.push(format!("SR Z-score {:.1} (>2.5σ)", sr_zscore));
    }

    let lat_stddev = model.ewma_latency_variance.sqrt().max(1.0);
    let lat_zscore = (latency - model.ewma_latency).abs() / lat_stddev;
    if lat_zscore > 2.5 && model.samples > 10 {
        anomaly_score += (lat_zscore * 10.0).min(30.0);
        reasons.push(format!("Latency Z-score {:.1} (>2.5σ)", lat_zscore));
    }

    anomaly_score = anomaly_score.min(100.0);
    let is_anomaly = anomaly_score > 50.0;
    let reason = if reasons.is_empty() { "Normal".to_string() } else { reasons.join("; ") };

    (is_anomaly, anomaly_score, reason)
}
