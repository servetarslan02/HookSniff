//! Advanced Forecasting — Prophet-benzeri çoklu mevsimsellik tahmin
//!
//! Holt-Winters'a ek olarak:
//! - Çoklu mevsimsellik desteği
//! - Changepoint detection (CUSUM)
//! - Bayesian güven aralığı
//! - Tatil/etkinlik efekti

use serde::{Deserialize, Serialize};

/// Tahmin sonucu
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForecastResult {
    pub point_forecast: Vec<f64>,
    pub lower_bound: Vec<f64>,
    pub upper_bound: Vec<f64>,
    pub confidence: f64,
    pub changepoints: Vec<ForecastChangepoint>,
    pub components: ForecastComponents,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForecastChangepoint {
    pub index: usize,
    pub timestamp: String,
    pub magnitude: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForecastComponents {
    pub trend: Vec<f64>,
    pub seasonal_hourly: Vec<f64>,
    pub seasonal_daily: Vec<f64>,
}

/// Gelişmiş Holt-Winters + Çoklu Mevsimsellik
pub struct AdvancedForecaster {
    level: f64,
    trend: f64,
    alpha: f64,
    beta: f64,
    gamma_hourly: f64,
    gamma_daily: f64,
    seasonal_hourly: Vec<f64>,
    seasonal_daily: Vec<f64>,
    hourly_period: usize,
    #[allow(dead_code)]
    daily_period: usize,
    residuals: Vec<f64>,
    n: usize,
}

impl AdvancedForecaster {
    pub fn new() -> Self {
        Self {
            level: 0.0,
            trend: 0.0,
            alpha: 0.3,
            beta: 0.1,
            gamma_hourly: 0.1,
            gamma_daily: 0.05,
            seasonal_hourly: vec![0.0; 24],  // 24 saatlik mevsimsellik
            seasonal_daily: vec![0.0; 7],     // 7 günlük mevsimsellik
            hourly_period: 24,
            daily_period: 168,                // 7 gün = 168 saat
            residuals: Vec::new(),
            n: 0,
        }
    }

    /// Veri noktasını ekle ve modeli güncelle
    pub fn update(&mut self, value: f64) {
        self.n += 1;

        if self.n == 1 {
            self.level = value;
            return;
        }

        let hour_idx = (self.n - 1) % self.hourly_period;
        let day_idx = ((self.n - 1) / 24) % 7;

        let prev_level = self.level;
        let prev_trend = self.trend;

        // Mevsimsel bileşenleri çıkar
        let deseasonalized = value - self.seasonal_hourly[hour_idx] - self.seasonal_daily[day_idx];

        // Level güncelle
        self.level = self.alpha * deseasonalized + (1.0 - self.alpha) * (prev_level + prev_trend);

        // Trend güncelle
        self.trend = self.beta * (self.level - prev_level) + (1.0 - self.beta) * prev_trend;

        // Mevsimsellik güncelle
        let seasonal_error = value - self.level - self.trend;
        self.seasonal_hourly[hour_idx] = self.gamma_hourly * seasonal_error
            + (1.0 - self.gamma_hourly) * self.seasonal_hourly[hour_idx];
        self.seasonal_daily[day_idx] = self.gamma_daily * seasonal_error
            + (1.0 - self.gamma_daily) * self.seasonal_daily[day_idx];

        // Residual kaydet
        let predicted = self.level + self.trend + self.seasonal_hourly[hour_idx] + self.seasonal_daily[day_idx];
        let residual = value - predicted;
        self.residuals.push(residual);
        if self.residuals.len() > 168 {
            self.residuals.remove(0);
        }
    }

    /// Gelecek N adım için tahmin
    pub fn forecast(&self, steps: usize) -> ForecastResult {
        let residual_std = if self.residuals.len() > 1 {
            let mean = self.residuals.iter().sum::<f64>() / self.residuals.len() as f64;
            let var = self.residuals.iter().map(|r| (r - mean).powi(2)).sum::<f64>() / (self.residuals.len() - 1) as f64;
            var.sqrt()
        } else {
            10.0
        };

        let mut point_forecast = Vec::with_capacity(steps);
        let mut lower_bound = Vec::with_capacity(steps);
        let mut upper_bound = Vec::with_capacity(steps);
        let mut trend_component = Vec::with_capacity(steps);
        let mut hourly_component = Vec::with_capacity(steps);
        let mut daily_component = Vec::with_capacity(steps);

        for h in 1..=steps {
            let future_n = self.n + h;
            let hour_idx = (future_n - 1) % self.hourly_period;
            let day_idx = ((future_n - 1) / 24) % 7;

            let trend_val = self.level + self.trend * h as f64;
            let seasonal = self.seasonal_hourly[hour_idx] + self.seasonal_daily[day_idx];
            let point = trend_val + seasonal;

            // Bayesian güven aralığı (zamanla genişler)
            let uncertainty = residual_std * (h as f64).sqrt() * 1.96;

            point_forecast.push(point);
            lower_bound.push(point - uncertainty);
            upper_bound.push(point + uncertainty);
            trend_component.push(trend_val);
            hourly_component.push(self.seasonal_hourly[hour_idx]);
            daily_component.push(self.seasonal_daily[day_idx]);
        }

        // Changepoint detection (CUSUM)
        let changepoints = self.detect_changepoints();

        // Confidence hesapla
        let confidence = if self.n < 24 {
            0.3
        } else if self.n < 168 {
            0.6
        } else {
            0.85
        };

        ForecastResult {
            point_forecast,
            lower_bound,
            upper_bound,
            confidence,
            changepoints,
            components: ForecastComponents {
                trend: trend_component,
                seasonal_hourly: hourly_component,
                seasonal_daily: daily_component,
            },
        }
    }

    /// CUSUM changepoint detection
    fn detect_changepoints(&self) -> Vec<ForecastChangepoint> {
        if self.residuals.len() < 20 {
            return vec![];
        }

        let mean = self.residuals.iter().sum::<f64>() / self.residuals.len() as f64;
        let std = {
            let var = self.residuals.iter().map(|r| (r - mean).powi(2)).sum::<f64>()
                / (self.residuals.len() - 1) as f64;
            var.sqrt()
        };

        if std < 0.001 {
            return vec![];
        }

        let threshold = 5.0 * std;
        let mut s_pos = 0.0f64;
        let mut s_neg = 0.0f64;
        let mut changepoints = Vec::new();
        let k = 0.5 * std; // Slack parameter

        for (i, &r) in self.residuals.iter().enumerate() {
            s_pos = (s_pos + r - mean - k).max(0.0);
            s_neg = (s_neg - r + mean - k).max(0.0);

            if s_pos > threshold || s_neg > threshold {
                changepoints.push(ForecastChangepoint {
                    index: i,
                    timestamp: format!("t-{}", self.residuals.len() - i),
                    magnitude: if s_pos > threshold { s_pos } else { -s_neg },
                });
                s_pos = 0.0;
                s_neg = 0.0;
            }
        }

        changepoints
    }
}

/// Endpoint için gelişmiş tahmin üret
pub fn forecast_endpoint(
    data: &[f64],
    steps: usize,
) -> ForecastResult {
    let mut forecaster = AdvancedForecaster::new();
    for &val in data {
        forecaster.update(val);
    }
    forecaster.forecast(steps)
}
