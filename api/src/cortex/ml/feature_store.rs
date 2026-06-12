//! Feature Store — Merkezi Feature Yönetimi
//!
//! 3 katmanlı cache:
//! 1. In-memory (60 saniye TTL) — en hızlı
//! 2. DB cache (ml_features tablosu, 1 saat TTL) — orta hız
//! 3. Hesaplama (hourly_stats + profiles) — en yavaş
//!
//! Ayrıca:
//! - Batch extraction (çoklu endpoint tek sorgu)
//! - Feature versiyonlama (değişim tespiti)
//! - Feature lineage (hangi model hangi feature'ı kullandı)

use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;
use std::collections::HashMap;
use std::sync::RwLock;
use std::time::{Duration, Instant};
use chrono::{Timelike, Datelike};

/// In-memory cache entry
struct CacheEntry {
    value: f64,
    cached_at: Instant,
}

/// Feature Store — 3 katmanlı cache
pub struct FeatureStore {
    cache: RwLock<HashMap<String, CacheEntry>>,
    cache_ttl: Duration,
    db_ttl_seconds: i64,
}

impl FeatureStore {
    pub fn new() -> Self {
        Self {
            cache: RwLock::new(HashMap::with_capacity(4096)),
            cache_ttl: Duration::from_secs(60),
            db_ttl_seconds: 3600, // 1 hour DB cache
        }
    }

    pub fn feature_key(endpoint_id: &Uuid, feature_name: &str) -> String {
        format!("{}:{}", endpoint_id, feature_name)
    }

    /// In-memory cache'den oku
    pub fn get_cached(&self, key: &str) -> Option<f64> {
        let cache = self.cache.read().ok()?;
        let entry = cache.get(key)?;
        if entry.cached_at.elapsed() > self.cache_ttl {
            return None;
        }
        Some(entry.value)
    }

    /// In-memory cache'e yaz
    pub fn set_cached(&self, key: String, value: f64) {
        if let Ok(mut cache) = self.cache.write() {
            cache.insert(key, CacheEntry {
                value,
                cached_at: Instant::now(),
            });
        }
    }

    /// Toplu cache yazma (batch training sonrası)
    pub fn set_cached_batch(&self, entries: Vec<(String, f64)>) {
        if let Ok(mut cache) = self.cache.write() {
            for (key, value) in entries {
                cache.insert(key, CacheEntry {
                    value,
                    cached_at: Instant::now(),
                });
            }
        }
    }

    pub fn clear(&self) {
        if let Ok(mut cache) = self.cache.write() {
            cache.clear();
        }
    }

    pub fn evict_expired(&self) {
        if let Ok(mut cache) = self.cache.write() {
            cache.retain(|_, entry| entry.cached_at.elapsed() < self.cache_ttl);
        }
    }

    /// Cache istatistikleri
    pub fn stats(&self) -> (usize, usize) {
        if let Ok(cache) = self.cache.read() {
            let total = cache.len();
            let fresh = cache.values().filter(|e| e.cached_at.elapsed() < self.cache_ttl).count();
            (total, fresh)
        } else {
            (0, 0)
        }
    }
}

/// Global feature store instance
use std::sync::LazyLock;
pub static FEATURE_STORE: LazyLock<FeatureStore> = LazyLock::new(|| FeatureStore::new());

// ── Feature Definitions ────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureMeta {
    pub name: String,
    pub description: String,
    pub feature_type: String,
    pub source: String,
    pub ttl_seconds: u64,
}

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

// ── Single Endpoint Feature Extraction ─────────────────────────────

/// Tek endpoint için feature extraction (3 katmanlı cache).
pub async fn extract_features(
    pool: &PgPool,
    endpoint_id: Uuid,
) -> Result<HashMap<String, f64>, sqlx::Error> {
    let mut features = HashMap::new();
    let feature_names = [
        "success_rate_1h", "success_rate_24h", "latency_avg", "latency_p95",
        "delivery_rate", "error_rate",
    ];

    // Katman 1: In-memory cache
    let mut all_cached = true;
    for name in &feature_names {
        let key = FeatureStore::feature_key(&endpoint_id, name);
        if let Some(val) = FEATURE_STORE.get_cached(&key) {
            features.insert(name.to_string(), val);
        } else {
            all_cached = false;
        }
    }
    if all_cached { return Ok(features); }

    // Katman 2: DB cache (ml_features tablosu)
    let db_features: Vec<(String, f64)> = sqlx::query_as(
        "SELECT feature_name, feature_value FROM ml_features \
         WHERE endpoint_id = $1 AND recorded_at > NOW() - INTERVAL '1 hour' \
         ORDER BY recorded_at DESC"
    )
    .bind(endpoint_id)
    .fetch_all(pool)
    .await?;

    let mut db_map: HashMap<String, f64> = HashMap::new();
    for (name, value) in db_features {
        db_map.entry(name).or_insert(value); // İlk (en son) değeri al
    }

    let mut need_compute = false;
    for name in &feature_names {
        if features.contains_key(*name) { continue; }
        if let Some(val) = db_map.get(*name) {
            features.insert(name.to_string(), *val);
            let key = FeatureStore::feature_key(&endpoint_id, name);
            FEATURE_STORE.set_cached(key, *val);
        } else {
            need_compute = true;
        }
    }

    if !need_compute { return Ok(features); }

    // Katman 3: Hesaplama (hourly stats)
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

    if stats.is_empty() { return Ok(features); }

    let (total, success, avg_lat, p95_lat, _) = stats[0];
    let sr_1h = if total > 0.0 { success / total * 100.0 } else { 100.0 };
    let error_rate_1h = if total > 0.0 { (total - success) / total * 100.0 } else { 0.0 };

    features.insert("success_rate_1h".into(), sr_1h);
    features.insert("latency_avg".into(), avg_lat);
    features.insert("latency_p95".into(), p95_lat);
    features.insert("delivery_rate".into(), total);
    features.insert("error_rate".into(), error_rate_1h);

    if stats.len() > 1 {
        let (t24, s24, _, _, _) = stats.iter().fold((0.0f64, 0.0f64, 0.0f64, 0.0f64, 0i32), |acc, (t, s, l, p, _)| {
            (acc.0 + t, acc.1 + s, acc.2 + l, acc.3 + *p as f64, 0)
        });
        let sr_24h = if t24 > 0.0 { s24 / t24 * 100.0 } else { 100.0 };
        features.insert("success_rate_24h".into(), sr_24h);
    }

    let now = chrono::Utc::now();
    features.insert("hour_of_day".into(), now.hour() as f64);
    features.insert("day_of_week".into(), now.weekday().num_days_from_monday() as f64);

    let avg_delivery = stats.iter().map(|(t, _, _, _, _)| t).sum::<f64>() / stats.len() as f64;
    let traffic = if avg_delivery > 1000.0 { 2.0 } else if avg_delivery > 100.0 { 1.0 } else { 0.0 };
    features.insert("traffic_level".into(), traffic);

    // Cache'e yaz (in-memory + DB)
    for (name, value) in &features {
        let key = FeatureStore::feature_key(&endpoint_id, name);
        FEATURE_STORE.set_cached(key, *value);
    }

    // DB cache'e yaz (batch INSERT)
    let mut query = String::from(
        "INSERT INTO ml_features (endpoint_id, feature_name, feature_value) VALUES "
    );
    let mut binds: Vec<String> = Vec::new();
    for (name, value) in &features {
        if feature_names.contains(&name.as_str()) {
            binds.push(format!("('${}'::uuid, '{}', {})", endpoint_id, name.replace('\'', "''"), value));
        }
    }
    if !binds.is_empty() {
        query.push_str(&binds.join(", "));
        let _ = sqlx::query(&query).execute(pool).await;
    }

    Ok(features)
}

// ── Batch Feature Extraction ───────────────────────────────────────

/// Çoklu endpoint için batch feature extraction.
/// Tek sorgu ile tüm endpoint'lerin hourly stats'ını çeker.
pub async fn extract_features_batch(
    pool: &PgPool,
    endpoint_ids: &[Uuid],
) -> Result<HashMap<Uuid, HashMap<String, f64>>, sqlx::Error> {
    if endpoint_ids.is_empty() { return Ok(HashMap::new()); }

    let mut result: HashMap<Uuid, HashMap<String, f64>> = HashMap::new();
    let mut need_fetch: Vec<Uuid> = Vec::new();

    // Katman 1: In-memory cache kontrolü
    for &eid in endpoint_ids {
        let mut features = HashMap::new();
        let mut all_cached = true;
        for name in &["success_rate_1h", "success_rate_24h", "latency_avg", "latency_p95", "delivery_rate", "error_rate"] {
            let key = FeatureStore::feature_key(&eid, name);
            if let Some(val) = FEATURE_STORE.get_cached(&key) {
                features.insert(name.to_string(), val);
            } else {
                all_cached = false;
            }
        }
        if all_cached {
            result.insert(eid, features);
        } else {
            need_fetch.push(eid);
        }
    }

    if need_fetch.is_empty() { return Ok(result); }

    // Katman 2+3: Batch DB fetch
    let stats_rows: Vec<(Uuid, f64, f64, f64, f64, i32)> = sqlx::query_as(
        "SELECT endpoint_id, COALESCE(total_deliveries, 0)::FLOAT, COALESCE(successful, 0)::FLOAT, \
         COALESCE(avg_latency_ms, 0)::FLOAT, COALESCE(p95_latency_ms, 0)::FLOAT, \
         COALESCE(p95_latency_ms, 0) \
         FROM ( \
           SELECT DISTINCT ON (endpoint_id) * \
           FROM endpoint_hourly_stats \
           WHERE endpoint_id = ANY($1) \
           ORDER BY endpoint_id, hour_start DESC \
         ) latest"
    )
    .bind(&need_fetch)
    .fetch_all(pool)
    .await?;

    // 24h stats
    let stats_24h: Vec<(Uuid, f64, f64)> = sqlx::query_as(
        "SELECT endpoint_id, \
         COALESCE(SUM(total_deliveries), 0)::FLOAT, \
         COALESCE(SUM(successful), 0)::FLOAT \
         FROM endpoint_hourly_stats \
         WHERE endpoint_id = ANY($1) AND hour_start > NOW() - INTERVAL '24 hours' \
         GROUP BY endpoint_id"
    )
    .bind(&need_fetch)
    .fetch_all(pool)
    .await?;

    let mut stats_24h_map: HashMap<Uuid, (f64, f64)> = HashMap::new();
    for (eid, total, success) in stats_24h {
        stats_24h_map.insert(eid, (total, success));
    }

    let now = chrono::Utc::now();
    let hour_of_day = now.hour() as f64;
    let day_of_week = now.weekday().num_days_from_monday() as f64;

    for (eid, total, success, avg_lat, p95_lat, _) in stats_rows {
        let mut features: HashMap<String, f64> = HashMap::new();
        let sr_1h = if total > 0.0 { success / total * 100.0 } else { 100.0 };
        let error_rate = if total > 0.0 { (total - success) / total * 100.0 } else { 0.0 };

        features.insert("success_rate_1h".to_string(), sr_1h);
        features.insert("latency_avg".to_string(), avg_lat);
        features.insert("latency_p95".to_string(), p95_lat);
        features.insert("delivery_rate".to_string(), total);
        features.insert("error_rate".to_string(), error_rate);

        if let Some((t24, s24)) = stats_24h_map.get(&eid) {
            let sr_24h = if *t24 > 0.0 { s24 / t24 * 100.0 } else { 100.0 };
            features.insert("success_rate_24h".to_string(), sr_24h);
        }

        features.insert("hour_of_day".to_string(), hour_of_day);
        features.insert("day_of_week".to_string(), day_of_week);
        let traffic = if total > 1000.0 { 2.0 } else if total > 100.0 { 1.0 } else { 0.0 };
        features.insert("traffic_level".to_string(), traffic);

        // Cache'e yaz
        for (name, value) in &features {
            let key = FeatureStore::feature_key(&eid, name);
            FEATURE_STORE.set_cached(key, *value);
        }

        result.insert(eid, features);
    }

    // Cache miss olan endpoint'ler için boş map
    for &eid in &need_fetch {
        result.entry(eid).or_insert_with(HashMap::new);
    }

    Ok(result)
}

// ── Feature Versioning ─────────────────────────────────────────────

/// Feature değişimini tespit et. Eğer değer önemli ölçüde değiştiyse true döner.
pub fn has_significant_change(old_value: f64, new_value: f64, feature_name: &str) -> bool {
    match feature_name {
        "success_rate_1h" | "success_rate_24h" | "success_rate_7d" => {
            (old_value - new_value).abs() > 5.0 // 5% değişim
        }
        "latency_avg" | "latency_p95" => {
            let base = old_value.max(1.0);
            ((new_value - old_value) / base).abs() > 0.2 // 20% değişim
        }
        _ => false,
    }
}

/// Feature lineage: hangi model hangi feature'ları kullandı
pub async fn record_feature_usage(
    pool: &PgPool,
    endpoint_id: Uuid,
    model_type: &str,
    features_used: &[String],
) -> Result<(), sqlx::Error> {
    let features_json = serde_json::json!({
        "features": features_used,
        "recorded_at": chrono::Utc::now().to_rfc3339(),
    });
    sqlx::query(
        "INSERT INTO ml_decisions (endpoint_id, decision_type, chosen_action, context) \
         VALUES ($1, 'feature_usage', $2, $3)"
    )
    .bind(endpoint_id)
    .bind(model_type)
    .bind(features_json)
    .execute(pool)
    .await?;
    Ok(())
}
