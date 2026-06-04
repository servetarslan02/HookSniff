//! Explainable AI (XAI) — ML kararlarını insan tarafından okunabilir açıklama
//!
//! Her ML kararının arkasındaki nedenleri açıklar:
//! - Feature contributions (hangi faktör ne kadar etkili)
//! - İnsan tarafından okunabilir özet
//! - Dashboard entegrasyonu için structured JSON

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// ML kararının açıklaması
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Explanation {
    pub endpoint_id: Uuid,
    pub decision_type: String,
    pub summary: String,
    pub human_readable: String,
    pub feature_contributions: Vec<FeatureContribution>,
    pub confidence: f64,
    pub context: ExplanationContext,
}

/// Tek bir feature'ın karara katkısı
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureContribution {
    pub feature_name: String,
    pub feature_value: f64,
    pub contribution: f64,      // -1.0 ile +1.0 arası
    pub direction: String,       // "increases_risk" veya "decreases_risk"
    pub importance: f64,         // 0.0-1.0
}

/// Karar bağlamı
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExplanationContext {
    pub time_window: String,
    pub data_points_used: usize,
    pub baseline_comparison: String,
}

/// Anomali skoru açıklaması üret
pub fn explain_anomaly_score(
    endpoint_id: Uuid,
    success_rate: f64,
    latency: f64,
    p95_latency: f64,
    delivery_rate: f64,
    baseline_sr: f64,
    baseline_latency: f64,
) -> Explanation {
    let mut contributions = Vec::new();

    // Success Rate katkısı
    let sr_diff = success_rate - baseline_sr;
    let sr_contribution = if baseline_sr > 0.0 { sr_diff / baseline_sr } else { 0.0 };
    contributions.push(FeatureContribution {
        feature_name: "success_rate".to_string(),
        feature_value: success_rate,
        contribution: sr_contribution.clamp(-1.0, 1.0),
        direction: if sr_contribution < 0.0 { "increases_risk".to_string() } else { "decreases_risk".to_string() },
        importance: 0.40,
    });

    // Latency katkısı
    let latency_diff = latency - baseline_latency;
    let latency_contribution = if baseline_latency > 0.0 { latency_diff / baseline_latency } else { 0.0 };
    contributions.push(FeatureContribution {
        feature_name: "latency".to_string(),
        feature_value: latency,
        contribution: latency_contribution.clamp(-1.0, 1.0),
        direction: if latency_contribution > 0.2 { "increases_risk".to_string() } else { "decreases_risk".to_string() },
        importance: 0.30,
    });

    // P95 Latency katkısı
    let p95_ratio = if latency > 0.0 { p95_latency / latency } else { 1.0 };
    let p95_contribution = (p95_ratio - 2.0) / 2.0; // 2x normal ise 0, 4x ise 1.0
    contributions.push(FeatureContribution {
        feature_name: "p95_latency_ratio".to_string(),
        feature_value: p95_ratio,
        contribution: p95_contribution.clamp(-1.0, 1.0),
        direction: if p95_contribution > 0.1 { "increases_risk".to_string() } else { "decreases_risk".to_string() },
        importance: 0.20,
    });

    // Delivery Rate katkısı
    let delivery_contribution = if delivery_rate > 0.0 { (delivery_rate - 100.0) / 100.0 } else { -1.0 };
    contributions.push(FeatureContribution {
        feature_name: "delivery_rate".to_string(),
        feature_value: delivery_rate,
        contribution: delivery_contribution.clamp(-1.0, 1.0),
        direction: if delivery_contribution < -0.2 { "increases_risk".to_string() } else { "decreases_risk".to_string() },
        importance: 0.10,
    });

    // Importance'ları normalize et
    let total_importance: f64 = contributions.iter().map(|c| c.importance).sum();
    if total_importance > 0.0 {
        for c in &mut contributions {
            c.importance /= total_importance;
        }
    }

    // En önemli 2 faktörü bul
    contributions.sort_by(|a, b| b.importance.partial_cmp(&a.importance).unwrap());
    let top_factors: Vec<String> = contributions.iter().take(2)
        .filter(|c| c.contribution.abs() > 0.1)
        .map(|c| {
            if c.direction == "increases_risk" {
                format!("{} {:.1} (risk ↑)", c.feature_name, c.feature_value)
            } else {
                format!("{} {:.1} (normal)", c.feature_name, c.feature_value)
            }
        })
        .collect();

    // Genel skor hesapla (0-100)
    let weighted_score: f64 = contributions.iter()
        .map(|c| c.contribution.abs() * c.importance)
        .sum();
    let anomaly_score = (weighted_score * 100.0).clamp(0.0, 100.0);

    let summary = if anomaly_score > 70.0 {
        format!("Kritik anomali tespit edildi (skor: {:.0}). {}", anomaly_score, top_factors.join(", "))
    } else if anomaly_score > 40.0 {
        format!("Anomali şüphesi (skor: {:.0}). {}", anomaly_score, top_factors.join(", "))
    } else {
        format!("Normal durum (skor: {:.0}). {}", anomaly_score, top_factors.join(", "))
    };

    let human_readable = format!(
        "Son {} veri noktasına göre:\n• Success Rate: {:.1}% (baseline: {:.1}%, {})\n• Latency: {:.0}ms (baseline: {:.0}ms, {})\n• P95/Latency oranı: {:.1}x {}\n• Skor: {:.0}/100",
        24,
        success_rate, baseline_sr,
        if sr_diff < -10.0 { format!("{:.1}% düştü", sr_diff.abs()) } else { "normal".to_string() },
        latency, baseline_latency,
        if latency_diff > 500.0 { format!("{:.0}ms arttı", latency_diff) } else { "normal".to_string() },
        p95_latency / latency.max(1.0),
 if p95_ratio > 3.0 { " yüksek" } else { " normal" },
        anomaly_score
    );

    Explanation {
        endpoint_id,
        decision_type: "anomaly_scoring".to_string(),
        summary,
        human_readable,
        feature_contributions: contributions,
        confidence: if anomaly_score > 50.0 { 0.8 } else { 0.6 },
        context: ExplanationContext {
            time_window: "24h".to_string(),
            data_points_used: 24,
            baseline_comparison: format!("7-day rolling average"),
        },
    }
}

/// Healing kararı açıklaması
pub fn explain_healing_decision(
    endpoint_id: Uuid,
    action_type: &str,
    reason: &str,
    anomaly_score: f64,
    success_rate: f64,
    retry_strategy: &str,
) -> Explanation {
    let human_readable = match action_type {
        "circuit_tighten" => format!(
            "Circuit breaker sıkılaştırıldı çünkü:\n• Anomali skoru {:.0}/100 (kritik eşik: 70)\n• Success rate {:.1}%\n• Retry stratejisi: {}",
            anomaly_score, success_rate, retry_strategy
        ),
        "rate_limit_reduce" => format!(
            "Rate limit düşürüldü çünkü:\n• Anomali skoru {:.0}/100\n• Trafik paterni anormal\n• Mevcut SR: {:.1}%",
            anomaly_score, success_rate
        ),
        "auto_disable" => format!(
            "Endpoint otomatik devre dışı bırakıldı çünkü:\n• Anomali skoru {:.0}/100 (kritik)\n• Success rate {:.1}% (< %50)\n• Sürekli başarısızlık tespit edildi",
            anomaly_score, success_rate
        ),
        _ => format!(
            "Aksiyon: {} — Neden: {} (skor: {:.0}, SR: {:.1}%)",
            action_type, reason, anomaly_score, success_rate
        ),
    };

    Explanation {
        endpoint_id,
        decision_type: format!("healing_{}", action_type),
        summary: format!("{} uygulandı — {}", action_type, reason),
        human_readable,
        feature_contributions: vec![
            FeatureContribution {
                feature_name: "anomaly_score".to_string(),
                feature_value: anomaly_score,
                contribution: anomaly_score / 100.0,
                direction: "increases_risk".to_string(),
                importance: 0.60,
            },
            FeatureContribution {
                feature_name: "success_rate".to_string(),
                feature_value: success_rate,
                contribution: (100.0 - success_rate) / 100.0,
                direction: if success_rate < 70.0 { "increases_risk".to_string() } else { "decreases_risk".to_string() },
                importance: 0.40,
            },
        ],
        confidence: 0.85,
        context: ExplanationContext {
            time_window: "1h".to_string(),
            data_points_used: 1,
            baseline_comparison: "endpoint-specific thresholds".to_string(),
        },
    }
}

/// Prediction açıklaması
pub fn explain_prediction(
    endpoint_id: Uuid,
    predicted_sr: f64,
    predicted_latency: f64,
    confidence: f64,
    forecast_steps: usize,
    trend: &str,
) -> Explanation {
    let summary = format!(
        "Gelecek {} saat: SR ~{:.1}%, Latency ~{:.0}ms (güven: {:.0}%)",
        forecast_steps, predicted_sr, predicted_latency, confidence * 100.0
    );

    let human_readable = format!(
 " Tahmin ({} saat sonrası):\n• Success Rate: ~{:.1}% {}\n• Latency: ~{:.0}ms {}\n• Güven aralığı: {:.0}%\n• Trend: {}",
        forecast_steps,
        predicted_sr,
 if predicted_sr < 80.0 { " düşük" } else { "" },
        predicted_latency,
 if predicted_latency > 2000.0 { " yüksek" } else { "" },
        confidence * 100.0,
        match trend {
 "improving" => " İyileşiyor",
 "declining" => " Kötüleşiyor",
 "stable" => " Stabil",
            _ => trend,
        }
    );

    Explanation {
        endpoint_id,
        decision_type: "prediction".to_string(),
        summary,
        human_readable,
        feature_contributions: vec![],
        confidence,
        context: ExplanationContext {
            time_window: format!("{}h", forecast_steps),
            data_points_used: forecast_steps,
            baseline_comparison: "historical trend".to_string(),
        },
    }
}
