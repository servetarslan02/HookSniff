//! ML-4: Time Series Forecasting
//!
//! Predicts future values using:
//! - Holt-Winters Exponential Smoothing (level + trend)
//! - Linear Regression on recent window
//! - Ensemble: combines both for robust predictions
//!
//! Forecasts: success rate, latency, delivery volume

use sqlx::PgPool;
use super::{get_model_params, save_model_params};

/// Time series model stored per endpoint
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct TimeSeriesModel {
    /// Holt-Winters level (smoothed value)
    pub level: f64,
    /// Holt-Winters trend (slope)
    pub trend: f64,
    /// Smoothing factor for level (alpha)
    pub alpha: f64,
    /// Smoothing factor for trend (beta)
    pub beta: f64,
    /// Linear regression slope (recent window)
    pub regression_slope: f64,
    /// Linear regression intercept
    pub regression_intercept: f64,
    /// R² of the regression fit
    pub regression_r2: f64,
    /// Residual standard deviation (prediction uncertainty)
    pub residual_std: f64,
    /// Last known value
    pub last_value: f64,
    /// Training samples
    pub samples: i32,
    /// Which metric this model forecasts
    pub metric: String,
}

impl TimeSeriesModel {
    pub fn new(metric: &str) -> Self {
        Self {
            level: 0.0,
            trend: 0.0,
            alpha: 0.3,
            beta: 0.1,
            regression_slope: 0.0,
            regression_intercept: 0.0,
            regression_r2: 0.0,
            residual_std: 0.0,
            last_value: 0.0,
            samples: 0,
            metric: metric.to_string(),
        }
    }

    /// Forecast h steps ahead using Holt-Winters
    pub fn forecast_hw(&self, steps: i32) -> f64 {
        self.level + self.trend * steps as f64
    }

    /// Forecast h steps ahead using linear regression
    pub fn forecast_lr(&self, steps: i32) -> f64 {
        let x = self.samples as f64 + steps as f64;
        self.regression_intercept + self.regression_slope * x
    }

    /// Ensemble forecast: weighted average of HW and LR
    /// Weights based on R² (better fit = more weight)
    pub fn forecast(&self, steps: i32) -> ForecastResult {
        let hw = self.forecast_hw(steps);
        let lr = self.forecast_lr(steps);

        // Weight LR by R², HW by (1 - R²)
        let lr_weight = self.regression_r2.max(0.1);
        let hw_weight = 1.0 - lr_weight;
        let combined = hw_weight * hw + lr_weight * lr;

        // Prediction interval (95% CI)
        let ci_width = 1.96 * self.residual_std * (steps as f64).sqrt();

        ForecastResult {
            point_forecast: combined,
            lower_bound: combined - ci_width,
            upper_bound: combined + ci_width,
            confidence: (self.samples as f64 / 50.0).min(1.0),
            hw_component: hw,
            lr_component: lr,
            r2: self.regression_r2,
        }
    }
}

pub struct ForecastResult {
    pub point_forecast: f64,
    pub lower_bound: f64,
    pub upper_bound: f64,
    pub confidence: f64,
    pub hw_component: f64,
    pub lr_component: f64,
    pub r2: f64,
}

/// Train time series model
pub async fn train(
    pool: &PgPool,
    endpoint_id: uuid::Uuid,
    success_rates: &[f64],
    latencies: &[f64],
) -> Result<(), sqlx::Error> {
    // Train SR model
    let sr_model = fit_model(success_rates, "success_rate");
    let params = serde_json::to_value(&sr_model).unwrap();
    save_model_params(pool, endpoint_id, "ts_success_rate", &params, sr_model.samples).await?;

    // Train latency model
    let lat_model = fit_model(latencies, "latency");
    let params = serde_json::to_value(&lat_model).unwrap();
    save_model_params(pool, endpoint_id, "ts_latency", &params, lat_model.samples).await?;

    Ok(())
}

/// Fit a time series model to data
fn fit_model(data: &[f64], metric: &str) -> TimeSeriesModel {
    let mut model = TimeSeriesModel::new(metric);
    if data.is_empty() { return model; }

    model.last_value = *data.last().unwrap();
    model.samples = data.len() as i32;

    // 1. Holt-Winters (double exponential smoothing)
    model.level = data[0];
    model.trend = 0.0;

    for &val in data.iter().skip(1) {
        let prev_level = model.level;
        model.level = model.alpha * val + (1.0 - model.alpha) * (prev_level + model.trend);
        model.trend = model.beta * (model.level - prev_level) + (1.0 - model.beta) * model.trend;
    }

    // 2. Linear Regression on recent window (last 24 points or all)
    let window_size = data.len().min(24);
    let recent: Vec<f64> = data.iter().rev().take(window_size).rev().cloned().collect();
    let (slope, intercept, r2) = linear_regression(&recent);

    model.regression_slope = slope;
    model.regression_intercept = intercept;
    model.regression_r2 = r2;

    // 3. Calculate residuals for prediction intervals
    let mut residuals = Vec::new();
    for (i, &val) in recent.iter().enumerate() {
        let predicted = intercept + slope * (i as f64);
        residuals.push(val - predicted);
    }
    model.residual_std = std_dev(&residuals);

    model
}

/// Simple linear regression: y = a + bx
fn linear_regression(data: &[f64]) -> (f64, f64, f64) {
    let n = data.len() as f64;
    if n < 3.0 { return (0.0, data.first().copied().unwrap_or(0.0), 0.0); }

    let mean_x = (n - 1.0) / 2.0;
    let mean_y = data.iter().sum::<f64>() / n;

    let mut ss_xy = 0.0;
    let mut ss_xx = 0.0;
    let mut ss_yy = 0.0;

    for (i, &y) in data.iter().enumerate() {
        let x = i as f64;
        let dx = x - mean_x;
        let dy = y - mean_y;
        ss_xy += dx * dy;
        ss_xx += dx * dx;
        ss_yy += dy * dy;
    }

    let slope = if ss_xx > 0.0 { ss_xy / ss_xx } else { 0.0 };
    let intercept = mean_y - slope * mean_x;

    // R² = (SS_xy)² / (SS_xx * SS_yy)
    let r2 = if ss_xx > 0.0 && ss_yy > 0.0 {
        (ss_xy * ss_xy) / (ss_xx * ss_yy)
    } else {
        0.0
    };

    (slope, intercept, r2)
}

/// Standard deviation
fn std_dev(data: &[f64]) -> f64 {
    if data.is_empty() { return 0.0; }
    let mean = data.iter().sum::<f64>() / data.len() as f64;
    let variance = data.iter().map(|x| (x - mean).powi(2)).sum::<f64>() / data.len() as f64;
    variance.sqrt()
}
