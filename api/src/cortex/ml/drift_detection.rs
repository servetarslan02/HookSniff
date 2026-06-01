//! Concept Drift Detection — Page-Hinkley + ADWIN + Kolmogorov-Smirnov
//!
//! ML modellerinin zamanla performans düşüşünü otomatik tespit eder.
//! Drift tespit edildiğinde yeniden eğitim tetiklenir.
//!
//! # Algoritmalar
//! - **Page-Hinkley**: Ani değişimler (distribution shift)
//! - **ADWIN (Adaptive Windowing)**: Kademeli değişimler
//! - **KS Testi**: Dağılım değişimi tespiti

use serde::{Deserialize, Serialize};

/// Drift tespit sonucu
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DriftResult {
    pub is_drifting: bool,
    pub drift_type: DriftType,
    pub severity: f64,        // 0.0-1.0
    pub features_affected: Vec<String>,
    pub recommended_action: String,
    pub detected_by: Vec<String>, // hangi algoritma tespit etti
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DriftType {
    /// Ani değişim (distribution shift)
    Sudden,
    /// Kademeli değişim
    Gradual,
    /// Yeni pattern (seasonality change)
    Incremental,
    /// Veri kalitesi düştü
    DataQuality,
    /// Drift yok
    None,
}

impl std::fmt::Display for DriftType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DriftType::Sudden => write!(f, "sudden"),
            DriftType::Gradual => write!(f, "gradual"),
            DriftType::Incremental => write!(f, "incremental"),
            DriftType::DataQuality => write!(f, "data_quality"),
            DriftType::None => write!(f, "none"),
        }
    }
}

// ── Page-Hinkley Test ──────────────────────────────────────────────

/// Page-Hinkley testi — ani değişimleri tespit eder
/// Cumulative sum of deviations from mean tracked; drift when sum exceeds threshold
pub struct PageHinkleyDetector {
    cumulative_sum: f64,
    min_value: f64,
    threshold: f64,
    delta: f64,
    n: usize,
    mean: f64,
}

impl PageHinkleyDetector {
    pub fn new(threshold: f64, delta: f64) -> Self {
        Self {
            cumulative_sum: 0.0,
            min_value: f64::MAX,
            threshold,
            delta,
            n: 0,
            mean: 0.0,
        }
    }

    /// Default parameters suitable for webhook success rates
    pub fn default_for_success_rate() -> Self {
        Self::new(50.0, 0.005)
    }

    /// Default parameters suitable for latency monitoring
    pub fn default_for_latency() -> Self {
        Self::new(100.0, 0.01)
    }

    /// Add new data point, returns true if drift detected
    pub fn update(&mut self, value: f64) -> bool {
        self.n += 1;
        self.mean += (value - self.mean) / self.n as f64;
        self.cumulative_sum += value - self.mean - self.delta;
        self.min_value = self.min_value.min(self.cumulative_sum);
        self.cumulative_sum - self.min_value > self.threshold
    }

    /// Reset after drift detected
    pub fn reset(&mut self) {
        self.cumulative_sum = 0.0;
        self.min_value = f64::MAX;
        self.n = 0;
        self.mean = 0.0;
    }
}

// ── ADWIN (Adaptive Windowing) ─────────────────────────────────────

/// ADWIN — kademeli drift tespiti
/// Pencere boyutunu otomatik ayarlar; büyük alt pencere farklılıklarında drift tespit eder
pub struct AdwinDetector {
    window: Vec<f64>,
    max_window_size: usize,
    delta: f64,
}

impl AdwinDetector {
    pub fn new(max_window_size: usize, delta: f64) -> Self {
        Self {
            window: Vec::with_capacity(max_window_size),
            max_window_size,
            delta,
        }
    }

    /// Default for success rate monitoring
    pub fn default_for_success_rate() -> Self {
        Self::new(100, 5.0)
    }

    /// Default for latency monitoring
    pub fn default_for_latency() -> Self {
        Self::new(100, 50.0)
    }

    /// Add new data point, returns true if drift detected
    pub fn update(&mut self, value: f64) -> bool {
        self.window.push(value);

        if self.window.len() < 10 {
            return false;
        }

        // Split window and compare halves
        let mid = self.window.len() / 2;
        let left_mean: f64 = self.window[..mid].iter().sum::<f64>() / mid as f64;
        let right_mean: f64 = self.window[mid..].iter().sum::<f64>()
            / (self.window.len() - mid) as f64;

        let diff = (left_mean - right_mean).abs();

        if diff > self.delta {
            self.window.drain(..mid);
            return true;
        }

        // Trim window if too large
        if self.window.len() > self.max_window_size {
            self.window.remove(0);
        }

        false
    }

    /// Get current window values
    pub fn window(&self) -> &[f64] {
        &self.window
    }
}

// ── Kolmogorov-Smirnov Test ────────────────────────────────────────

/// Kolmogorov-Smirnov testi — dağılım değişimi tespiti
/// İki örneğin aynı dağılımdan gelip gelmediğini kontrol eder
pub fn ks_test(sample1: &[f64], sample2: &[f64], alpha: f64) -> (bool, f64) {
    let n1 = sample1.len() as f64;
    let n2 = sample2.len() as f64;

    if n1 < 5.0 || n2 < 5.0 {
        return (false, 0.0);
    }

    let mut max_diff = 0.0f64;
    let critical_value = ((-(alpha / 2.0).ln() / 2.0) * ((n1 + n2) / (n1 * n2))).sqrt();

    for &x in sample1.iter() {
        let ecdf1 = sample1.iter().filter(|&&v| v <= x).count() as f64 / n1;
        let ecdf2 = sample2.iter().filter(|&&v| v <= x).count() as f64 / n2;
        max_diff = max_diff.max((ecdf1 - ecdf2).abs());
    }

    (max_diff > critical_value, max_diff)
}

// ── Drift Analyzer — 3 Algoritmayı Birleştir ──────────────────────

/// Tüm drift algoritmalarını çalıştırıp birleşik sonuç üretir
pub struct DriftAnalyzer {
    ph_sr: PageHinkleyDetector,
    ph_latency: PageHinkleyDetector,
    adwin_sr: AdwinDetector,
    adwin_latency: AdwinDetector,
    recent_sr: Vec<f64>,
    recent_latency: Vec<f64>,
    baseline_sr: Vec<f64>,
    baseline_latency: Vec<f64>,
    baseline_collected: bool,
}

impl DriftAnalyzer {
    pub fn new() -> Self {
        Self {
            ph_sr: PageHinkleyDetector::default_for_success_rate(),
            ph_latency: PageHinkleyDetector::default_for_latency(),
            adwin_sr: AdwinDetector::default_for_success_rate(),
            adwin_latency: AdwinDetector::default_for_latency(),
            recent_sr: Vec::new(),
            recent_latency: Vec::new(),
            baseline_sr: Vec::new(),
            baseline_latency: Vec::new(),
            baseline_collected: false,
        }
    }

    /// Veri noktasını ekle ve drift analizi yap
    pub fn analyze(&mut self, success_rate: f64, latency: f64) -> DriftResult {
        self.recent_sr.push(success_rate);
        self.recent_latency.push(latency);

        // Keep only last 48 data points
        if self.recent_sr.len() > 48 {
            self.recent_sr.remove(0);
        }
        if self.recent_latency.len() > 48 {
            self.recent_latency.remove(0);
        }

        // Collect baseline (first 12 data points)
        if !self.baseline_collected {
            self.baseline_sr.push(success_rate);
            self.baseline_latency.push(latency);
            if self.baseline_sr.len() >= 12 {
                self.baseline_collected = true;
            }
            return DriftResult {
                is_drifting: false,
                drift_type: DriftType::None,
                severity: 0.0,
                features_affected: vec![],
                recommended_action: "collecting_baseline".into(),
                detected_by: vec![],
            };
        }

        let mut detected_by: Vec<String> = Vec::new();
        let mut features_affected: Vec<String> = Vec::new();
        let mut max_severity: f64 = 0.0;

        // 1. Page-Hinkley — Success Rate
        if self.ph_sr.update(success_rate) {
            detected_by.push("page_hinkley_sr".into());
            features_affected.push("success_rate".into());
            max_severity = max_severity.max(0.7);
            self.ph_sr.reset();
        }

        // 2. Page-Hinkley — Latency
        if self.ph_latency.update(latency) {
            detected_by.push("page_hinkley_latency".into());
            features_affected.push("latency".into());
            max_severity = max_severity.max(0.7);
            self.ph_latency.reset();
        }

        // 3. ADWIN — Success Rate
        if self.adwin_sr.update(success_rate) {
            detected_by.push("adwin_sr".into());
            if !features_affected.contains(&"success_rate".to_string()) {
                features_affected.push("success_rate".into());
            }
            max_severity = max_severity.max(0.6);
        }

        // 4. ADWIN — Latency
        if self.adwin_latency.update(latency) {
            detected_by.push("adwin_latency".into());
            if !features_affected.contains(&"latency".to_string()) {
                features_affected.push("latency".into());
            }
            max_severity = max_severity.max(0.6);
        }

        // 5. KS Test — Success Rate Dağılım Değişimi
        if self.recent_sr.len() >= 12 {
            let recent_half = &self.recent_sr[self.recent_sr.len() - 12..];
            let (ks_drift, ks_stat) = ks_test(&self.baseline_sr, recent_half, 0.05);
            if ks_drift {
                detected_by.push("ks_test_sr".into());
                if !features_affected.contains(&"success_rate".to_string()) {
                    features_affected.push("success_rate".into());
                }
                max_severity = max_severity.max(ks_stat.min(1.0));
            }
        }

        // 6. KS Test — Latency Dağılım Değişimi
        if self.recent_latency.len() >= 12 {
            let recent_half = &self.recent_latency[self.recent_latency.len() - 12..];
            let (ks_drift, ks_stat) = ks_test(&self.baseline_latency, recent_half, 0.05);
            if ks_drift {
                detected_by.push("ks_test_latency".into());
                if !features_affected.contains(&"latency".to_string()) {
                    features_affected.push("latency".into());
                }
                max_severity = max_severity.max(ks_stat.min(1.0));
            }
        }

        // Drift type belirleme
        let drift_type = if detected_by.is_empty() {
            DriftType::None
        } else if detected_by.iter().any(|d| d.contains("page_hinkley")) {
            DriftType::Sudden
        } else if detected_by.iter().any(|d| d.contains("adwin")) {
            DriftType::Gradual
        } else if detected_by.iter().any(|d| d.contains("ks_test")) {
            DriftType::Incremental
        } else {
            DriftType::DataQuality
        };

        let is_drifting = !detected_by.is_empty();

        // Severity bir kere hesaplandı, şimdi birden fazla algoritma tespit ettiyse artır
        if detected_by.len() > 1 {
            max_severity = (max_severity + 0.1 * (detected_by.len() - 1) as f64).min(1.0);
        }

        let recommended_action = if max_severity > 0.7 {
            "immediate_retrain".to_string()
        } else if max_severity > 0.4 {
            "schedule_retrain".to_string()
        } else {
            "monitor".to_string()
        };

        DriftResult {
            is_drifting,
            drift_type,
            severity: max_severity,
            features_affected,
            recommended_action,
            detected_by,
        }
    }

    /// Baseline'ı sıfırla ve yeniden topla
    pub fn reset_baseline(&mut self) {
        self.baseline_collected = false;
        self.baseline_sr.clear();
        self.baseline_latency.clear();
    }
}

// ── PostgreSQL Persistence ─────────────────────────────────────────

/// Endpoint'in drift analizörünü yükle veya oluştur
pub async fn load_or_create_analyzer(
    pool: &sqlx::PgPool,
    endpoint_id: uuid::Uuid,
) -> Result<DriftAnalyzer, sqlx::Error> {
    let existing: Option<(serde_json::Value,)> = sqlx::query_as(
        "SELECT parameters FROM ml_models WHERE endpoint_id = $1 AND model_type = 'drift_detector'"
    )
    .bind(endpoint_id)
    .fetch_optional(pool)
    .await?;

    let mut analyzer = DriftAnalyzer::new();

    if let Some((params,)) = existing {
        // Restore state from DB
        if let Some(baseline_sr) = params.get("baseline_sr").and_then(|v| v.as_array()) {
            analyzer.baseline_sr = baseline_sr.iter().filter_map(|v| v.as_f64()).collect();
        }
        if let Some(baseline_latency) = params.get("baseline_latency").and_then(|v| v.as_array()) {
            analyzer.baseline_latency = baseline_latency.iter().filter_map(|v| v.as_f64()).collect();
        }
        if let Some(recent_sr) = params.get("recent_sr").and_then(|v| v.as_array()) {
            analyzer.recent_sr = recent_sr.iter().filter_map(|v| v.as_f64()).collect();
        }
        if let Some(recent_latency) = params.get("recent_latency").and_then(|v| v.as_array()) {
            analyzer.recent_latency = recent_latency.iter().filter_map(|v| v.as_f64()).collect();
        }
        analyzer.baseline_collected = params.get("baseline_collected")
            .and_then(|v| v.as_bool()).unwrap_or(false);

        // Restore Page-Hinkley state
        if let Some(ph_mean) = params.get("ph_mean").and_then(|v| v.as_f64()) {
            let ph_n = params.get("ph_n").and_then(|v| v.as_u64()).unwrap_or(0) as usize;
            analyzer.ph_sr = PageHinkleyDetector {
                cumulative_sum: params.get("ph_cumsum").and_then(|v| v.as_f64()).unwrap_or(0.0),
                min_value: params.get("ph_min").and_then(|v| v.as_f64()).unwrap_or(f64::MAX),
                threshold: 50.0,
                delta: 0.005,
                n: ph_n,
                mean: ph_mean,
            };
        }
    }

    Ok(analyzer)
}

/// Drift analizör durumunu kaydet
pub async fn save_analyzer_state(
    pool: &sqlx::PgPool,
    endpoint_id: uuid::Uuid,
    analyzer: &DriftAnalyzer,
) -> Result<(), sqlx::Error> {
    let params = serde_json::json!({
        "baseline_sr": analyzer.baseline_sr,
        "baseline_latency": analyzer.baseline_latency,
        "recent_sr": analyzer.recent_sr,
        "recent_latency": analyzer.recent_latency,
        "baseline_collected": analyzer.baseline_collected,
        "ph_mean": analyzer.ph_sr_mean(),
        "ph_n": analyzer.ph_sr_n(),
        "ph_cumsum": analyzer.ph_sr_cumsum(),
        "ph_min": analyzer.ph_sr_min(),
    });

    sqlx::query(
        "INSERT INTO ml_models (endpoint_id, model_type, parameters, training_samples, updated_at)
         VALUES ($1, 'drift_detector', $2, $3, NOW())
         ON CONFLICT (endpoint_id, model_type) DO UPDATE SET
           parameters = $2, training_samples = $3, updated_at = NOW()"
    )
    .bind(endpoint_id)
    .bind(&params)
    .bind(analyzer.recent_sr.len() as i32)
    .execute(pool)
    .await?;

    Ok(())
}

/// Drift event'ini kaydet
pub async fn record_drift_event(
    pool: &sqlx::PgPool,
    endpoint_id: uuid::Uuid,
    result: &DriftResult,
) -> Result<i64, sqlx::Error> {
    let id: (i64,) = sqlx::query_as(
        "INSERT INTO ml_drift_events (endpoint_id, drift_type, severity, features_affected, detected_by, recommended_action)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id"
    )
    .bind(endpoint_id)
    .bind(result.drift_type.to_string())
    .bind(result.severity)
    .bind(serde_json::to_value(&result.features_affected).unwrap_or_default())
    .bind(serde_json::to_value(&result.detected_by).unwrap_or_default())
    .bind(&result.recommended_action)
    .fetch_one(pool)
    .await?;

    Ok(id.0)
}

// ── Helper trait for accessing Page-Hinkley internals ─────────────

impl DriftAnalyzer {
    pub fn ph_sr_mean(&self) -> f64 { self.ph_sr.mean }
    pub fn ph_sr_n(&self) -> u64 { self.ph_sr.n as u64 }
    pub fn ph_sr_cumsum(&self) -> f64 { self.ph_sr.cumulative_sum }
    pub fn ph_sr_min(&self) -> f64 { self.ph_sr.min_value }
}

// ── Tests ──────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_page_hinkley_detects_sudden_drift() {
        let mut ph = PageHinkleyDetector::new(10.0, 0.005);
        // Normal values around 95
        for _ in 0..30 {
            ph.update(95.0 + (rand_val() * 2.0 - 1.0));
        }
        // Sudden drop to 60
        let mut detected = false;
        for _ in 0..10 {
            if ph.update(60.0 + (rand_val() * 2.0 - 1.0)) {
                detected = true;
            }
        }
        assert!(detected, "Page-Hinkley should detect sudden drift");
    }

    #[test]
    fn test_adwin_detects_gradual_drift() {
        let mut adwin = AdwinDetector::new(50, 3.0);
        // Normal values around 95
        for _ in 0..20 {
            adwin.update(95.0);
        }
        // Gradual decline
        let mut detected = false;
        for i in 0..30 {
            let val = 95.0 - (i as f64 * 1.5);
            if adwin.update(val) {
                detected = true;
            }
        }
        assert!(detected, "ADWIN should detect gradual drift");
    }

    #[test]
    fn test_ks_test_detects_distribution_change() {
        let sample1: Vec<f64> = (0..30).map(|_| 95.0 + (rand_val() * 5.0 - 2.5)).collect();
        let sample2: Vec<f64> = (0..30).map(|_| 60.0 + (rand_val() * 5.0 - 2.5)).collect();
        let (drift, stat) = ks_test(&sample1, &sample2, 0.05);
        assert!(drift, "KS test should detect distribution change, stat={}", stat);
    }

    #[test]
    fn test_drift_analyzer_baseline_collection() {
        let mut analyzer = DriftAnalyzer::new();
        // First 12 points should be baseline collection
        for i in 0..12 {
            let result = analyzer.analyze(95.0 + i as f64 * 0.1, 100.0);
            assert!(!result.is_drifting, "Should not drift during baseline collection");
            assert_eq!(result.drift_type, DriftType::None);
        }
    }

    fn rand_val() -> f64 {
        // Simple pseudo-random for tests
        use std::time::{SystemTime, UNIX_EPOCH};
        let nanos = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().subsec_nanos();
        (nanos % 1000) as f64 / 1000.0
    }
}
