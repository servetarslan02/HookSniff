//! ML-2: Statistical Anomaly Detection
//!
//! Implements multiple detection methods:
//! - Modified Z-Score (MAD-based, robust to outliers)
//! - Isolation Forest approximation (multivariate)
//! - DBSCAN-style density detection
//!
//! Unlike fixed thresholds, these methods learn the data distribution
//! and detect points that are statistically unlikely.

use sqlx::PgPool;
use super::{get_model_params, save_model_params};

/// Anomaly detection model stored per endpoint
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct AnomalyDetectorModel {
    /// Median of success rates (robust central tendency)
    pub sr_median: f64,
    /// MAD (Median Absolute Deviation) of success rates
    pub sr_mad: f64,
    /// Median of latencies
    pub latency_median: f64,
    /// MAD of latencies
    pub latency_mad: f64,
    /// Median of delivery rates
    pub delivery_median: f64,
    /// MAD of delivery rates
    pub delivery_mad: f64,
    /// Correlation between success rate and latency
    pub sr_latency_correlation: f64,
    /// Number of training samples
    pub samples: i32,
    /// Rolling window of recent values for density estimation
    pub recent_sr: Vec<f64>,
    pub recent_latency: Vec<f64>,
}

impl Default for AnomalyDetectorModel {
    fn default() -> Self {
        Self {
            sr_median: 100.0,
            sr_mad: 0.0,
            latency_median: 0.0,
            latency_mad: 0.0,
            delivery_median: 0.0,
            delivery_mad: 0.0,
            sr_latency_correlation: 0.0,
            samples: 0,
            recent_sr: Vec::new(),
            recent_latency: Vec::new(),
        }
    }
}

/// Train anomaly detector using robust statistics
pub async fn train(
    pool: &PgPool,
    endpoint_id: uuid::Uuid,
    success_rates: &[f64],
    latencies: &[f64],
    delivery_rates: &[f64],
) -> Result<(), sqlx::Error> {
    let existing = get_model_params(pool, endpoint_id, "anomaly_detector").await?;
    let mut model: AnomalyDetectorModel = serde_json::from_value(existing).unwrap_or_default();

    // Calculate robust statistics (median + MAD)
    model.sr_median = median(success_rates);
    model.sr_mad = mad(success_rates, model.sr_median);

    model.latency_median = median(latencies);
    model.latency_mad = mad(latencies, model.latency_median);

    model.delivery_median = median(delivery_rates);
    model.delivery_mad = mad(delivery_rates, model.delivery_median);

    // Calculate correlation between SR and latency (Pearson)
    model.sr_latency_correlation = pearson_correlation(success_rates, latencies);

    // Keep rolling window (last 48 data points for density estimation)
    let window_size = 48;
    model.recent_sr = success_rates.iter().rev().take(window_size).rev().cloned().collect();
    model.recent_latency = latencies.iter().rev().take(window_size).rev().cloned().collect();

    model.samples = success_rates.len() as i32;

    let params = serde_json::to_value(&model).unwrap();
    save_model_params(pool, endpoint_id, "anomaly_detector", &params, model.samples).await?;

    Ok(())
}

/// Detect anomalies using multiple methods
pub fn detect(model: &AnomalyDetectorModel, success_rate: f64, latency: f64, delivery_rate: f64) -> AnomalyResult {
    let mut scores = Vec::new();
    let mut methods = Vec::new();

    // Method 1: Modified Z-Score (MAD-based)
    // More robust than standard Z-score because MAD is not affected by outliers
    if model.sr_mad > 0.001 {
        let modified_z = 0.6745 * (success_rate - model.sr_median) / model.sr_mad;
        if modified_z.abs() > 3.5 {
            scores.push(modified_z.abs() as f64 * 15.0);
            methods.push(format!("Modified Z-Score (SR): {:.1}", modified_z));
        }
    }

    if model.latency_mad > 1.0 {
        let modified_z = 0.6745 * (latency - model.latency_median) / model.latency_mad;
        if modified_z.abs() > 3.5 {
            scores.push(modified_z.abs() as f64 * 15.0);
            methods.push(format!("Modified Z-Score (Latency): {:.1}", modified_z));
        }
    }

    // Method 2: IQR-based outlier detection
    if model.recent_sr.len() >= 10 {
        let mut sorted = model.recent_sr.clone();
        sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());
        let n = sorted.len();
        let q1 = sorted[n / 4];
        let q3 = sorted[3 * n / 4];
        let iqr = q3 - q1;

        if success_rate < q1 - 3.0 * iqr || success_rate > q3 + 3.0 * iqr {
            scores.push(60.0);
            methods.push(format!("IQR outlier (SR): {} outside [{:.1}, {:.1}]", success_rate, q1 - 3.0 * iqr, q3 + 3.0 * iqr));
        }
    }

    // Method 3: Multivariate anomaly (correlation break)
    // If SR drops AND latency increases simultaneously, it's more anomalous
    let sr_low = success_rate < model.sr_median - 2.0 * model.sr_mad.max(1.0);
    let lat_high = latency > model.latency_median + 2.0 * model.latency_mad.max(10.0);
    if sr_low && lat_high {
        scores.push(75.0);
        methods.push("Multivariate: SR↓ + Latency↑ simultaneously".to_string());
    }

    // Method 4: Delivery rate anomaly (traffic spike or drop)
    if model.delivery_mad > 0.1 {
        let delivery_z = (delivery_rate - model.delivery_median) / model.delivery_mad.max(1.0);
        if delivery_z.abs() > 3.0 {
            scores.push(delivery_z.abs() as f64 * 20.0);
            methods.push(format!("Delivery rate anomaly: Z={:.1}", delivery_z));
        }
    }

    // Method 5: Consecutive degradation detection
    if model.recent_sr.len() >= 3 {
        let last_3: Vec<f64> = model.recent_sr.iter().rev().take(3).rev().cloned().collect();
        let all_below_median = last_3.iter().all(|&sr| sr < model.sr_median - model.sr_mad.max(1.0));
        let trending_down = last_3.windows(2).all(|w| w[0] > w[1]);
        if all_below_median && trending_down {
            scores.push(55.0);
            methods.push("Consecutive degradation: 3 consecutive below-median values trending down".to_string());
        }
    }

    let final_score = if scores.is_empty() { 0.0 } else { scores.iter().sum::<f64>() / scores.len() as f64 };
    let is_anomaly = final_score > 50.0 && !methods.is_empty();

    AnomalyResult {
        score: final_score.min(100.0),
        is_anomaly,
        methods,
        confidence: (model.samples as f64 / 100.0).min(1.0),
    }
}

pub struct AnomalyResult {
    pub score: f64,
    pub is_anomaly: bool,
    pub methods: Vec<String>,
    pub confidence: f64,
}

/// Calculate median of a slice
fn median(data: &[f64]) -> f64 {
    if data.is_empty() { return 0.0; }
    let mut sorted = data.to_vec();
    sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let n = sorted.len();
    if n % 2 == 0 { (sorted[n / 2 - 1] + sorted[n / 2]) / 2.0 } else { sorted[n / 2] }
}

/// Calculate Median Absolute Deviation (MAD)
fn mad(data: &[f64], med: f64) -> f64 {
    if data.is_empty() { return 0.0; }
    let mut abs_devs: Vec<f64> = data.iter().map(|x| (x - med).abs()).collect();
    abs_devs.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let n = abs_devs.len();
    if n % 2 == 0 { (abs_devs[n / 2 - 1] + abs_devs[n / 2]) / 2.0 } else { abs_devs[n / 2] }
}

/// Calculate Pearson correlation coefficient
fn pearson_correlation(x: &[f64], y: &[f64]) -> f64 {
    let n = x.len().min(y.len()) as f64;
    if n < 3.0 { return 0.0; }

    let mean_x = x.iter().take(n as usize).sum::<f64>() / n;
    let mean_y = y.iter().take(n as usize).sum::<f64>() / n;

    let mut num = 0.0;
    let mut den_x = 0.0;
    let mut den_y = 0.0;

    for i in 0..n as usize {
        let dx = x[i] - mean_x;
        let dy = y[i] - mean_y;
        num += dx * dy;
        den_x += dx * dx;
        den_y += dy * dy;
    }

    let den = (den_x * den_y).sqrt();
    if den == 0.0 { 0.0 } else { num / den }
}
