//! Feature Store — Merkezi Feature Yönetimi
//!
//! Feature'ların tekrar tekrar hesaplanmasını önler:
//! - In-memory cache (60 saniye)
//! - DB cache (1 saat)
//! - Feature versiyonlama
//! - Feature keşfi ve metadata

use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;
use std::collections::HashMap;
use std::sync::RwLock;
use std::time::{Duration, Instant};
use chrono::{Timelike, Datelike};

/// Cache entry
struct CacheEntry {
    value: f64,
    cached_at: Instant,
}

/// Feature Store — merkezi feature yönetimi
pub struct FeatureStore {
    cache: RwLock<HashMap<String, CacheEntry>>,
    cache_ttl: Duration,
}

impl FeatureStore {
    pub fn new() -> Self {
        Self {
            cache: RwLock::new(HashMap::with_capacity(1024)),
            cache_ttl: Duration::from_secs(60),
        }
    }

    /// Feature key oluştur
    pub fn feature_key(endpoint_id: &Uuid, feature_name: &str) -> String {
        format!("{}:{}", endpoint_id, feature_name)
    }

    /// Cache'den feature al
    pub fn get_cached(&self, key: &str) -> Option<f64> {
        let cache = self.cache.read().ok()?;
        let entry = cache.get(key)?;
        if entry.cached_at.elapsed() > self.cache_ttl {
            return None;
        }
        Some(entry.value)
    }

    /// Cache'e feature yaz
    pub fn set_cached(&self, key: String, value: f64) {
        if let Ok(mut cache) = self.cache.write() {
            cache.insert(key, CacheEntry {
                value,
                cached_at: Instant::now(),
            });
        }
    }

    /// Cache'i temizle
    pub fn clear(&self) {
        if let Ok(mut cache) = self.cache.write() {
            cache.clear();
        }
    }

    /// Süresi dolmuş entry'leri temizle
    pub fn evict_expired(&self) {
        if let Ok(mut cache) = self.cache.write() {
            cache.retain(|_, entry| entry.cached_at.elapsed() < self.cache_ttl);
        }
    }
}

/// Global feature store instance
use std::sync::LazyLock;
pub static FEATURE_STORE: LazyLock<FeatureStore> = LazyLock::new(|| FeatureStore::new());

// ── Feature Definitions ────────────────────────────────────────────

/// Feature metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureMeta {
    pub name: String,
    pub description: String,
    pub feature_type: String,  // "numeric", "categorical", "boolean"
    pub source: String,        // "hourly_stats", "profile", "anomaly_score"
    pub ttl_seconds: u64,
}

/// Kayıtlı tüm feature'ları listele
pub fn registered_features() -> Vec<FeatureMeta> {
    vec![
        FeatureMeta { name: "success_rate_1h".into(), description: "Son 1 saat success rate".into(), feature_type: "numeric".into(), source: "hourly_stats".into(), ttl_seconds: 300 },
        FeatureMeta { name: "success_rate_24h".into(), description: "Son 24 saat success rate".into(), feature_type: "numeric".into(), source: "hourly_stats".into(), ttl_seconds: 3600 },
        FeatureMeta { name: "success_rate_7d".into(), description: "Son 7 gün success rate".into(), feature_type: "numeric".into(), source: "profile".into(), ttl_seconds: 3600 },
        FeatureMeta { name: "latency_avg".into(), description: "Ortalama latency".into(), feature_type: "numeric".into(), source: "hourly_stats".into(), ttl_seconds: 300 },
        FeatureMeta { name: "latency_p95".into(), description: "P95 latency".into(), feature_type: "numeric".into(), source: "hourly_stats".into(), ttl_seconds: 300 },
        FeatureMeta { name: "delivery_rate".into(), description: "Saatlik teslimat sayısı".into(), feature_type: "numeric".into(), source: "hourly_stats".into(), ttl_seconds: 300 },
        FeatureMeta { name: "error_rate".into(), description: "Hata oranı".into(), feature_type: "numeric".into(), source: "hourly_stats".into(), ttl_seconds: 300 },
        FeatureMeta { name: "anomaly_score".into(), description: "Anomali skoru 0-100".into(), feature_type: "numeric".into(), source: "anomaly_scorer".into(), ttl_seconds: 300 },
        FeatureMeta { name: "model_confidence".into(), description: "Model güven skoru".into(), feature_type: "numeric".into(), source: "ml_models".into(), ttl_seconds: 600 },
        FeatureMeta { name: "is_healthy".into(), description: "Endpoint sağlık durumu".into(), feature_type: "boolean".into(), source: "profiles".into(), ttl_seconds: 60 },
        FeatureMeta { name: "hour_of_day".into(), description: "Günün saati (0-23)".into(), feature_type: "categorical".into(), source: "derived".into(), ttl_seconds: 3600 },
        FeatureMeta { name: "day_of_week".into(), description: "Haftanın günü (0-6)".into(), feature_type: "categorical".into(), source: "derived".into(), ttl_seconds: 3600 },
        FeatureMeta { name: "traffic_level".into(), description: "Trafik seviyesi (low/medium/high)".into(), feature_type: "categorical".into(), source: "derived".into(), ttl_seconds: 300 },
    ]
}

// ── Feature Extraction ─────────────────────────────────────────────

/// Endpoint için tüm feature'ları çıkar (cache-aware)
pub async fn extract_features(
    pool: &PgPool,
    endpoint_id: Uuid,
) -> Result<HashMap<String, f64>, sqlx::Error> {
    let mut features = HashMap::new();

    // Cache'den dene
    let feature_names = [
        "success_rate_1h", "success_rate_24h", "latency_avg", "latency_p95",
        "delivery_rate", "error_rate",
    ];

    let mut all_cached = true;
    for name in &feature_names {
        let key = FeatureStore::feature_key(&endpoint_id, name);
        if let Some(val) = FEATURE_STORE.get_cached(&key) {
            features.insert(name.to_string(), val);
        } else {
            all_cached = false;
        }
    }

    if all_cached {
        return Ok(features);
    }

    // DB'den çek (son 24 saat)
    let stats: Vec<(f64, f64, f64, f64, i32)> = sqlx::query_as(
        "SELECT COALESCE(total_deliveries, 0)::FLOAT, COALESCE(successful, 0)::FLOAT,
                COALESCE(avg_latency_ms, 0)::FLOAT, COALESCE(p95_latency_ms, 0)::FLOAT,
                COALESCE(p95_latency_ms, 0)
         FROM endpoint_hourly_stats
         WHERE endpoint_id = $1 ORDER BY hour_start DESC LIMIT 24"
    )
    .bind(endpoint_id)
    .fetch_all(pool)
    .await?;

    if stats.is_empty() {
        return Ok(features);
    }

    // 1h features
    let (total, success, avg_lat, p95_lat, _) = stats[0];
    let sr_1h = if total > 0.0 { success / total * 100.0 } else { 100.0 };
    let error_rate_1h = if total > 0.0 { (total - success) / total * 100.0 } else { 0.0 };

    features.insert("success_rate_1h".into(), sr_1h);
    features.insert("latency_avg".into(), avg_lat);
    features.insert("latency_p95".into(), p95_lat);
    features.insert("delivery_rate".into(), total);
    features.insert("error_rate".into(), error_rate_1h);

    // 24h features
    if stats.len() > 1 {
        let (t24, s24, lat24, _, _) = stats.iter().fold((0.0f64, 0.0f64, 0.0f64, 0.0f64, 0i32), |acc, (t, s, l, p, _)| {
            (acc.0 + t, acc.1 + s, acc.2 + l, acc.3 + *p as f64, 0)
        });
        let sr_24h = if t24 > 0.0 { s24 / t24 * 100.0 } else { 100.0 };
        features.insert("success_rate_24h".into(), sr_24h);
    }

    // Derived features
    let now = chrono::Utc::now();
    features.insert("hour_of_day".into(), now.hour() as f64);
    features.insert("day_of_week".into(), now.weekday().num_days_from_monday() as f64);

    let avg_delivery = stats.iter().map(|(t, _, _, _, _)| t).sum::<f64>() / stats.len() as f64;
    let traffic = if avg_delivery > 1000.0 { 2.0 } else if avg_delivery > 100.0 { 1.0 } else { 0.0 };
    features.insert("traffic_level".into(), traffic);

    // Cache'e yaz
    for (name, value) in &features {
        let key = FeatureStore::feature_key(&endpoint_id, name);
        FEATURE_STORE.set_cached(key, *value);
    }

    Ok(features)
}
