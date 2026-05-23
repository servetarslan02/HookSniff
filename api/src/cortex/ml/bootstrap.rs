//! ML Bootstrap — Synthetic Data Generator
//!
//! Generates realistic webhook traffic data to bootstrap ML models.
//! Uses industry benchmarks (Svix, Hookdeck, AWS SNS patterns) as priors.
//!
//! Run once to give models enough data to start learning.
//! Models need ~100 data points minimum for reliable predictions.

use sqlx::PgPool;
use uuid::Uuid;
use chrono::{Utc, Duration, Timelike, Datelike};

/// Industry benchmark profiles
struct EndpointProfile {
    name: &'static str,
    base_success_rate: f64,
    base_latency_p50: f64,
    base_latency_p95: f64,
    base_latency_p99: f64,
    traffic_pattern: TrafficPattern,
    error_profile: ErrorProfile,
    anomaly_probability: f64,
}

enum TrafficPattern {
    Steady,
    BusinessHours,
    Ecommerce,
    Spiky,
    Growing,
}

struct ErrorProfile {
    timeout_pct: f64,
    server_error_pct: f64,
    connection_error_pct: f64,
    rate_limit_pct: f64,
}

const PROFILES: &[EndpointProfile] = &[
    EndpointProfile {
        name: "healthy_b2b",
        base_success_rate: 99.2,
        base_latency_p50: 180.0,
        base_latency_p95: 800.0,
        base_latency_p99: 2500.0,
        traffic_pattern: TrafficPattern::BusinessHours,
        error_profile: ErrorProfile { timeout_pct: 30.0, server_error_pct: 40.0, connection_error_pct: 20.0, rate_limit_pct: 10.0 },
        anomaly_probability: 0.02,
    },
    EndpointProfile {
        name: "ecommerce",
        base_success_rate: 97.5,
        base_latency_p50: 350.0,
        base_latency_p95: 1800.0,
        base_latency_p99: 5000.0,
        traffic_pattern: TrafficPattern::Ecommerce,
        error_profile: ErrorProfile { timeout_pct: 25.0, server_error_pct: 35.0, connection_error_pct: 15.0, rate_limit_pct: 25.0 },
        anomaly_probability: 0.05,
    },
    EndpointProfile {
        name: "slow_reliable",
        base_success_rate: 99.8,
        base_latency_p50: 1200.0,
        base_latency_p95: 4500.0,
        base_latency_p99: 9000.0,
        traffic_pattern: TrafficPattern::Steady,
        error_profile: ErrorProfile { timeout_pct: 50.0, server_error_pct: 30.0, connection_error_pct: 15.0, rate_limit_pct: 5.0 },
        anomaly_probability: 0.01,
    },
    EndpointProfile {
        name: "unstable",
        base_success_rate: 88.0,
        base_latency_p50: 500.0,
        base_latency_p95: 3500.0,
        base_latency_p99: 12000.0,
        traffic_pattern: TrafficPattern::Spiky,
        error_profile: ErrorProfile { timeout_pct: 20.0, server_error_pct: 45.0, connection_error_pct: 25.0, rate_limit_pct: 10.0 },
        anomaly_probability: 0.15,
    },
    EndpointProfile {
        name: "growing_startup",
        base_success_rate: 96.0,
        base_latency_p50: 280.0,
        base_latency_p95: 1500.0,
        base_latency_p99: 4000.0,
        traffic_pattern: TrafficPattern::Growing,
        error_profile: ErrorProfile { timeout_pct: 25.0, server_error_pct: 30.0, connection_error_pct: 20.0, rate_limit_pct: 25.0 },
        anomaly_probability: 0.08,
    },
    EndpointProfile {
        name: "internal_fast",
        base_success_rate: 99.9,
        base_latency_p50: 15.0,
        base_latency_p95: 50.0,
        base_latency_p99: 150.0,
        traffic_pattern: TrafficPattern::Steady,
        error_profile: ErrorProfile { timeout_pct: 10.0, server_error_pct: 60.0, connection_error_pct: 25.0, rate_limit_pct: 5.0 },
        anomaly_probability: 0.005,
    },
];

/// Random f64 in [0, 1)
fn rand_f64() -> f64 {
    rand::random::<f64>()
}

/// Random f64 in [min, max)
fn rand_range(min: f64, max: f64) -> f64 {
    min + rand_f64() * (max - min)
}

/// Random i32 in [min, max]
fn rand_int(min: i32, max: i32) -> i32 {
    if min >= max { return min; }
    min + (rand_f64() * (max - min + 1) as f64).floor() as i32
}

/// Random bool with probability p
fn rand_bool(p: f64) -> bool {
    rand_f64() < p
}

fn traffic_multiplier(pattern: &TrafficPattern, hour: i32, day_of_week: i32, hour_idx: i64, total_hours: i64) -> f64 {
    let t = match pattern {
        TrafficPattern::Steady => 1.0,
        TrafficPattern::BusinessHours => {
            if hour >= 9 && hour <= 17 { 2.5 }
            else if hour >= 7 && hour <= 20 { 1.5 }
            else { 0.3 }
        }
        TrafficPattern::Ecommerce => {
            if hour >= 18 && hour <= 23 { 3.0 }
            else if hour >= 10 && hour <= 16 { 1.8 }
            else { 0.4 }
        }
        TrafficPattern::Spiky => {
            if rand_bool(0.1) { rand_range(3.0, 8.0) } else { rand_range(0.5, 1.5) }
        }
        TrafficPattern::Growing => {
            1.0 + (hour_idx as f64 / total_hours as f64) * 2.0
        }
    };
    if day_of_week >= 5 { t * 0.4 } else { t }
}

fn generate_error_breakdown(profile: &ErrorProfile, failed: i32) -> serde_json::Value {
    if failed == 0 {
        return serde_json::json!({"success": 0});
    }
    let timeout = (failed as f64 * profile.timeout_pct / 100.0).round() as i32;
    let server_err = (failed as f64 * profile.server_error_pct / 100.0).round() as i32;
    let conn_err = (failed as f64 * profile.connection_error_pct / 100.0).round() as i32;
    let rate_limit = failed - timeout - server_err - conn_err;

    let mut breakdown = serde_json::Map::new();
    if timeout > 0 { breakdown.insert("ETIMEDOUT".into(), serde_json::json!(timeout)); }
    if server_err > 0 {
        let code = if rand_bool(0.6) { "500" } else { "503" };
        breakdown.insert(code.into(), serde_json::json!(server_err));
    }
    if conn_err > 0 { breakdown.insert("ECONNRESET".into(), serde_json::json!(conn_err.max(0))); }
    if rate_limit > 0 { breakdown.insert("429".into(), serde_json::json!(rate_limit.max(0))); }

    serde_json::Value::Object(breakdown)
}

fn calculate_anomaly_score(success_rate: f64, latency: f64, profile: &EndpointProfile) -> f64 {
    let mut score = 0.0;
    let sr_drop = profile.base_success_rate - success_rate;
    if sr_drop > 0.0 { score += (sr_drop * 2.0).min(50.0); }
    let latency_ratio = latency / profile.base_latency_p50;
    if latency_ratio > 1.5 { score += ((latency_ratio - 1.0) * 20.0).min(40.0); }
    if sr_drop > 5.0 && latency_ratio > 2.0 { score += 15.0; }
    score.min(100.0)
}

/// Generate synthetic hourly stats for all active endpoints
pub async fn bootstrap_ml_data(
    pool: &PgPool,
    hours_back: i64,
    endpoints_limit: i64,
) -> Result<BootstrapResult, sqlx::Error> {
    let mut result = BootstrapResult::default();

    let endpoints: Vec<(Uuid, Uuid, String)> = sqlx::query_as(
        "SELECT id, customer_id, url FROM endpoints WHERE is_active = true ORDER BY created_at LIMIT $1"
    )
    .bind(endpoints_limit)
    .fetch_all(pool)
    .await?;

    if endpoints.is_empty() {
        return Ok(result);
    }

    tracing::info!("🧠 ML Bootstrap: seeding {} endpoints with {}h history", endpoints.len(), hours_back);

    for (i, (endpoint_id, customer_id, url)) in endpoints.iter().enumerate() {
        let profile_idx = i % PROFILES.len();
        let profile = &PROFILES[profile_idx];

        tracing::info!("  → endpoint {} ({})", url, profile.name);

        let mut hourly_data = Vec::new();
        let now = Utc::now();

        for h in 0..hours_back {
            let hour_start = now - Duration::hours(hours_back - h);
            let hour_of_day = hour_start.hour() as i32;
            let day_of_week = hour_start.weekday().num_days_from_monday() as i32;

            let t_mult = traffic_multiplier(&profile.traffic_pattern, hour_of_day, day_of_week, h, hours_back);
            let base_deliveries = (50.0 * t_mult) as i32;
            let total = rand_int((base_deliveries as f64 * 0.7) as i32, (base_deliveries as f64 * 1.3) as i32).max(1);

            let sr_variation = rand_range(-2.0, 2.0);
            let mut success_rate = (profile.base_success_rate + sr_variation).min(100.0).max(50.0);
            let is_anomaly = rand_bool(profile.anomaly_probability);
            if is_anomaly {
                success_rate *= 1.0 - rand_range(0.3, 0.8);
                result.anomalies_injected += 1;
            }

            let successful = ((total as f64) * success_rate / 100.0).round() as i32;
            let failed = total - successful;

            let lat_mult = if is_anomaly { rand_range(1.5, 3.0) } else { rand_range(0.8, 1.2) };
            let avg_latency = (profile.base_latency_p50 * lat_mult) as i32;
            let p50 = (profile.base_latency_p50 * lat_mult * rand_range(0.9, 1.1)) as i32;
            let p95 = (profile.base_latency_p95 * lat_mult * rand_range(0.9, 1.1)) as i32;
            let p99 = (profile.base_latency_p99 * lat_mult * rand_range(0.9, 1.1)) as i32;

            let error_breakdown = generate_error_breakdown(&profile.error_profile, failed);

            hourly_data.push(HourlyData {
                endpoint_id: *endpoint_id,
                hour_start,
                total_deliveries: total,
                successful,
                failed,
                avg_latency_ms: avg_latency,
                p50_latency_ms: p50,
                p95_latency_ms: p95,
                p99_latency_ms: p99,
                error_breakdown,
            });
        }

        // Bulk insert hourly stats
        for data in &hourly_data {
            let exists: Option<(i64,)> = sqlx::query_as(
                "SELECT id FROM endpoint_hourly_stats WHERE endpoint_id = $1 AND hour_start = $2 LIMIT 1"
            )
            .bind(data.endpoint_id)
            .bind(data.hour_start)
            .fetch_optional(pool)
            .await?;

            if exists.is_some() { continue; }

            sqlx::query(
                r#"
                INSERT INTO endpoint_hourly_stats 
                    (endpoint_id, hour_start, total_deliveries, successful, failed,
                     avg_latency_ms, p50_latency_ms, p95_latency_ms, p99_latency_ms, error_breakdown)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                "#
            )
            .bind(data.endpoint_id)
            .bind(data.hour_start)
            .bind(data.total_deliveries)
            .bind(data.successful)
            .bind(data.failed)
            .bind(data.avg_latency_ms)
            .bind(data.p50_latency_ms)
            .bind(data.p95_latency_ms)
            .bind(data.p99_latency_ms)
            .bind(&data.error_breakdown)
            .execute(pool)
            .await?;

            result.hourly_stats_inserted += 1;
        }

        // Update endpoint profile
        let avg_sr: f64 = hourly_data.iter().map(|d| {
            if d.total_deliveries > 0 { (d.successful as f64 / d.total_deliveries as f64) * 100.0 } else { 100.0 }
        }).sum::<f64>() / hourly_data.len().max(1) as f64;

        let avg_p50: f64 = hourly_data.iter().map(|d| d.p50_latency_ms as f64).sum::<f64>() / hourly_data.len().max(1) as f64;
        let avg_p95: f64 = hourly_data.iter().map(|d| d.p95_latency_ms as f64).sum::<f64>() / hourly_data.len().max(1) as f64;
        let avg_p99: f64 = hourly_data.iter().map(|d| d.p99_latency_ms as f64).sum::<f64>() / hourly_data.len().max(1) as f64;
        let avg_per_hour: f64 = hourly_data.iter().map(|d| d.total_deliveries as f64).sum::<f64>() / hourly_data.len().max(1) as f64;
        let peak_per_hour = hourly_data.iter().map(|d| d.total_deliveries).max().unwrap_or(0);

        sqlx::query(
            r#"
            INSERT INTO endpoint_profiles 
                (endpoint_id, success_rate_1h, success_rate_24h, success_rate_7d,
                 latency_p50, latency_p95, latency_p99,
                 avg_deliveries_per_hour, peak_deliveries_per_hour, sample_size, confidence, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0.8, NOW())
            ON CONFLICT (endpoint_id) DO UPDATE SET
                success_rate_1h = EXCLUDED.success_rate_1h,
                success_rate_24h = EXCLUDED.success_rate_24h,
                success_rate_7d = EXCLUDED.success_rate_7d,
                latency_p50 = EXCLUDED.latency_p50,
                latency_p95 = EXCLUDED.latency_p95,
                latency_p99 = EXCLUDED.latency_p99,
                avg_deliveries_per_hour = EXCLUDED.avg_deliveries_per_hour,
                peak_deliveries_per_hour = EXCLUDED.peak_deliveries_per_hour,
                sample_size = EXCLUDED.sample_size,
                confidence = EXCLUDED.confidence,
                updated_at = NOW()
            "#
        )
        .bind(endpoint_id)
        .bind(avg_sr)
        .bind(avg_sr)
        .bind(avg_sr)
        .bind(avg_p50 as i32)
        .bind(avg_p95 as i32)
        .bind(avg_p99 as i32)
        .bind(avg_per_hour)
        .bind(peak_per_hour)
        .bind(hourly_data.len() as i32)
        .execute(pool)
        .await?;

        result.profiles_updated += 1;

        // Generate anomaly scores
        for data in &hourly_data {
            if data.total_deliveries == 0 { continue; }
            let sr = (data.successful as f64 / data.total_deliveries as f64) * 100.0;
            let anomaly_score = calculate_anomaly_score(sr, data.avg_latency_ms as f64, profile);

            if anomaly_score > 40.0 {
                let category = if anomaly_score >= 80.0 { "critical" }
                    else if anomaly_score >= 70.0 { "high" }
                    else if anomaly_score >= 40.0 { "medium" }
                    else { "low" };

                sqlx::query(
                    "INSERT INTO anomaly_scores (endpoint_id, customer_id, score, factors, category, created_at) VALUES ($1, $2, $3, $4, $5, $6)"
                )
                .bind(data.endpoint_id)
                .bind(customer_id)
                .bind(anomaly_score as i32)
                .bind(serde_json::json!({
                    "method": "synthetic_bootstrap",
                    "profile": profile.name,
                    "sr": sr,
                    "latency": data.avg_latency_ms,
                }))
                .bind(category)
                .bind(data.hour_start)
                .execute(pool)
                .await?;

                result.anomaly_scores_inserted += 1;
            }
        }

        // Initialize ML models
        super::init_endpoint_models(pool, *endpoint_id).await?;

        // Train ML models
        let success_rates: Vec<f64> = hourly_data.iter().map(|d| {
            if d.total_deliveries > 0 { (d.successful as f64 / d.total_deliveries as f64) * 100.0 } else { 100.0 }
        }).collect();
        let latencies: Vec<f64> = hourly_data.iter().map(|d| d.avg_latency_ms as f64).collect();
        let p95_latencies: Vec<f64> = hourly_data.iter().map(|d| d.p95_latency_ms as f64).collect();
        let delivery_rates: Vec<f64> = hourly_data.iter().map(|d| d.total_deliveries as f64).collect();

        if let Err(e) = super::adaptive_thresholds::train(pool, *endpoint_id, &success_rates, &latencies, &p95_latencies).await {
            tracing::warn!("  ⚠️ adaptive_thresholds: {:?}", e);
        }
        if let Err(e) = super::anomaly_detection::train(pool, *endpoint_id, &success_rates, &latencies, &delivery_rates).await {
            tracing::warn!("  ⚠️ anomaly_detection: {:?}", e);
        }
        if let Err(e) = super::time_series::train(pool, *endpoint_id, &success_rates, &latencies).await {
            tracing::warn!("  ⚠️ time_series: {:?}", e);
        }
        if let Err(e) = super::bandit::init_if_needed(pool, *endpoint_id).await {
            tracing::warn!("  ⚠️ bandit: {:?}", e);
        }

        result.models_trained += 1;
    }

    tracing::info!(
        "🧠 ML Bootstrap: {} stats, {} profiles, {} anomalies, {} models",
        result.hourly_stats_inserted, result.profiles_updated,
        result.anomaly_scores_inserted, result.models_trained
    );

    Ok(result)
}

#[derive(Debug, Default, serde::Serialize)]
pub struct BootstrapResult {
    pub hourly_stats_inserted: u64,
    pub profiles_updated: u64,
    pub anomaly_scores_inserted: u64,
    pub anomalies_injected: u64,
    pub models_trained: u64,
}

struct HourlyData {
    endpoint_id: Uuid,
    hour_start: chrono::DateTime<Utc>,
    total_deliveries: i32,
    successful: i32,
    failed: i32,
    avg_latency_ms: i32,
    p50_latency_ms: i32,
    p95_latency_ms: i32,
    p99_latency_ms: i32,
    error_breakdown: serde_json::Value,
}
