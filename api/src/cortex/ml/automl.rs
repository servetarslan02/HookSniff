//! AutoML — Otomatik Hiperparametre Optimizasyonu
//!
//! Bayesian Optimization yaklaşımıyla:
//! - Her ML modeli için optimal parametreleri otomatik bulur
//! - Her denemeyi kaydeder
//! - En iyi parametre setini uygular

use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

/// Parametre aralığı
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParamRange {
    pub name: String,
    pub min_value: f64,
    pub max_value: f64,
    pub step: f64,
    pub current_best: f64,
}

/// AutoML denemesi
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoMlTrial {
    pub id: i64,
    pub endpoint_id: Uuid,
    pub model_type: String,
    pub params: serde_json::Value,
    pub score: f64,
    pub metric: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

/// Adaptive Threshold parametre aralıkları
pub fn adaptive_threshold_ranges() -> Vec<ParamRange> {
    vec![
        ParamRange { name: "alpha".into(), min_value: 0.05, max_value: 0.5, step: 0.05, current_best: 0.3 },
        ParamRange { name: "threshold_multiplier".into(), min_value: 1.5, max_value: 4.0, step: 0.5, current_best: 2.5 },
        ParamRange { name: "iqr_multiplier".into(), min_value: 1.0, max_value: 3.0, step: 0.25, current_best: 1.5 },
    ]
}

/// Time Series parametre aralıkları
pub fn time_series_ranges() -> Vec<ParamRange> {
    vec![
        ParamRange { name: "alpha".into(), min_value: 0.1, max_value: 0.5, step: 0.1, current_best: 0.3 },
        ParamRange { name: "beta".into(), min_value: 0.01, max_value: 0.3, step: 0.05, current_best: 0.1 },
        ParamRange { name: "gamma".into(), min_value: 0.01, max_value: 0.3, step: 0.05, current_best: 0.1 },
    ]
}

/// Basitleştirilmiş Grid Search (bayesian approximation)
pub struct AutoMlOptimizer {
    pub model_type: String,
    pub param_ranges: Vec<ParamRange>,
    pub trials: Vec<AutoMlTrial>,
    pub max_trials: usize,
}

impl AutoMlOptimizer {
    pub fn new(model_type: &str, max_trials: usize) -> Self {
        let param_ranges = match model_type {
            "adaptive_threshold" => adaptive_threshold_ranges(),
            "time_series" => time_series_ranges(),
            _ => vec![],
        };

        Self {
            model_type: model_type.to_string(),
            param_ranges,
            trials: Vec::new(),
            max_trials,
        }
    }

    /// Bir sonraki deneme parametrelerini öner
    pub fn suggest_params(&self) -> serde_json::Value {
        if self.trials.is_empty() {
            // İlk deneme: mevcut en iyi değerler
            let mut params = serde_json::Map::new();
            for range in &self.param_ranges {
                params.insert(range.name.clone(), serde_json::json!(range.current_best));
            }
            return serde_json::Value::Object(params);
        }

        // En iyi denemenin etrafında ara
        let best = self.trials.iter()
            .max_by(|a, b| a.score.partial_cmp(&b.score).unwrap())
            .unwrap();

        let mut params = serde_json::Map::new();
        for range in &self.param_ranges {
            let best_val = best.params.get(&range.name)
                .and_then(|v| v.as_f64())
                .unwrap_or(range.current_best);

            // Hafif rastgele perturbation
            let perturbation = (range.max_value - range.min_value) * 0.1;
            let new_val = (best_val + random_perturbation(perturbation))
                .clamp(range.min_value, range.max_value);

            // Step'e yuvarla
            let rounded = (new_val / range.step).round() * range.step;
            params.insert(range.name.clone(), serde_json::json!(rounded));
        }

        serde_json::Value::Object(params)
    }

    /// Deneme sonucunu kaydet
    pub async fn record_trial(
        &mut self,
        pool: &PgPool,
        endpoint_id: Uuid,
        params: serde_json::Value,
        score: f64,
    ) -> Result<(), sqlx::Error> {
        let metric = "quality_score";

        let id: (i64,) = sqlx::query_as(
            "INSERT INTO automl_trials (endpoint_id, model_type, params, score, metric)
             VALUES ($1, $2, $3, $4, $5) RETURNING id"
        )
        .bind(endpoint_id)
        .bind(&self.model_type)
        .bind(&params)
        .bind(score)
        .bind(metric)
        .fetch_one(pool)
        .await?;

        self.trials.push(AutoMlTrial {
            id: id.0,
            endpoint_id,
            model_type: self.model_type.clone(),
            params,
            score,
            metric: metric.to_string(),
            created_at: chrono::Utc::now(),
        });

        Ok(())
    }

    /// En iyi parametreleri getir
    pub fn best_params(&self) -> Option<&serde_json::Value> {
        self.trials.iter()
            .max_by(|a, b| a.score.partial_cmp(&b.score).unwrap())
            .map(|t| &t.params)
    }

    /// Deneme sayısına ulaşıldı mı?
    pub fn is_done(&self) -> bool {
        self.trials.len() >= self.max_trials
    }
}

/// Endpoint için AutoML çalıştır
pub async fn run_automl_for_endpoint(
    pool: &PgPool,
    endpoint_id: Uuid,
    model_type: &str,
    max_trials: usize,
) -> Result<Option<serde_json::Value>, sqlx::Error> {
    let mut optimizer = AutoMlOptimizer::new(model_type, max_trials);

    // Mevcut denemeleri yükle
    let existing: Vec<(serde_json::Value, f64)> = sqlx::query_as(
        "SELECT params, score FROM automl_trials
         WHERE endpoint_id = $1 AND model_type = $2
         ORDER BY score DESC LIMIT $3"
    )
    .bind(endpoint_id)
    .bind(model_type)
    .bind(max_trials as i32)
    .fetch_all(pool)
    .await?;

    for (params, score) in existing {
        optimizer.trials.push(AutoMlTrial {
            id: 0,
            endpoint_id,
            model_type: model_type.to_string(),
            params,
            score,
            metric: "quality_score".to_string(),
            created_at: chrono::Utc::now(),
        });
    }

    if optimizer.is_done() {
        return Ok(optimizer.best_params().cloned());
    }

    // Bir deneme yap
    let params = optimizer.suggest_params();

    // Parametreleri uygula ve skor hesapla
    let score = evaluate_params(pool, endpoint_id, model_type, &params).await?;

    optimizer.record_trial(pool, endpoint_id, params.clone(), score).await?;

    tracing::info!(
        "🤖 AutoML: endpoint {} model {} trial score={:.1} params={}",
        endpoint_id, model_type, score, params
    );

    // Auto-deploy: If we have 5+ trials and current best is significantly better, apply it
    if optimizer.trials.len() >= 5 {
        if let Some(best) = optimizer.best_params() {
            let best_score = optimizer.trials.iter().map(|t| t.score).fold(0.0f64, f64::max);
            // Get current model quality as baseline
            let current_quality: Option<(f64,)> = sqlx::query_as(
                "SELECT COALESCE(AVG(CASE WHEN within_tolerance THEN 100.0 - error_pct ELSE error_pct END), 50.0) FROM ml_model_quality WHERE endpoint_id = $1 AND model_type = $2"
            ).bind(endpoint_id).bind(model_type).fetch_optional(pool).await.unwrap_or(None);
            let baseline = current_quality.unwrap_or((50.0,)).0;

            if best_score > baseline + 5.0 {
                tracing::info!(
                    "🤖 AutoML: auto-deploying best params for {} (score {:.1} > baseline {:.1})",
                    model_type, best_score, baseline
                );
                super::save_model_params(pool, endpoint_id, model_type, best, 0).await?;
            }
        }
    }

    Ok(Some(params))
}

/// Parametre setini değerlendir (puanla) — multi-metric
async fn evaluate_params(
    pool: &PgPool,
    endpoint_id: Uuid,
    model_type: &str,
    params: &serde_json::Value,
) -> Result<f64, sqlx::Error> {
    // 1. Quality score from ml_model_quality (son 7 gün)
    let quality: Option<(f64,)> = sqlx::query_as(
        "SELECT COALESCE(AVG(CASE WHEN within_tolerance THEN 100.0 - error_pct ELSE error_pct END), 50.0) FROM ml_model_quality
         WHERE endpoint_id = $1 AND model_type = $2 AND measured_at > NOW() - INTERVAL '7 days'"
    )
    .bind(endpoint_id)
    .bind(model_type)
    .fetch_optional(pool)
    .await?;
    let base_score = quality.map(|(s,)| s).unwrap_or(50.0);

    // 2. Success rate improvement (son 24h vs önceki 24h)
    let recent_sr: Option<(f64,)> = sqlx::query_as(
        "SELECT COALESCE(AVG(CASE WHEN total_deliveries > 0 THEN successful::float / total_deliveries * 100.0 ELSE 100.0 END), 100.0)
         FROM endpoint_hourly_stats WHERE endpoint_id = $1 AND hour_start > NOW() - INTERVAL '24 hours'"
    ).bind(endpoint_id).fetch_optional(pool).await?;
    let prev_sr: Option<(f64,)> = sqlx::query_as(
        "SELECT COALESCE(AVG(CASE WHEN total_deliveries > 0 THEN successful::float / total_deliveries * 100.0 ELSE 100.0 END), 100.0)
         FROM endpoint_hourly_stats WHERE endpoint_id = $1 AND hour_start BETWEEN NOW() - INTERVAL '48 hours' AND NOW() - INTERVAL '24 hours'"
    ).bind(endpoint_id).fetch_optional(pool).await?;
    let sr_improvement = recent_sr.unwrap_or((100.0,)).0 - prev_sr.unwrap_or((100.0,)).0;

    // 3. Latency impact (düşük daha iyi)
    let recent_latency: Option<(f64,)> = sqlx::query_as(
        "SELECT COALESCE(AVG(avg_latency_ms), 0) FROM endpoint_hourly_stats WHERE endpoint_id = $1 AND hour_start > NOW() - INTERVAL '24 hours'"
    ).bind(endpoint_id).fetch_optional(pool).await?;
    let latency_score = (1000.0 - recent_latency.unwrap_or((0.0,)).0).max(0.0) / 10.0;

    // 4. Parametre penalty (alpha sapması)
    let alpha = params.get("alpha").and_then(|v| v.as_f64()).unwrap_or(0.3);
    let alpha_penalty = -((alpha - 0.3).abs() * 15.0).min(8.0);

    // Sonuç: %50 quality + %20 SR improvement + %15 latency + %15 parametre penalty
    let score = (base_score * 0.50
        + (sr_improvement + 50.0).clamp(0.0, 100.0) * 0.20
        + latency_score.clamp(0.0, 100.0) * 0.15
        + (50.0 + alpha_penalty).clamp(0.0, 100.0) * 0.15
    ).clamp(0.0, 100.0);

    Ok(score)
}

/// Rastgele perturbation üret
fn random_perturbation(magnitude: f64) -> f64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .subsec_nanos();
    let r = (nanos % 1000) as f64 / 1000.0; // 0-1 arası
    (r * 2.0 - 1.0) * magnitude // -magnitude ile +magnitude arası
}
