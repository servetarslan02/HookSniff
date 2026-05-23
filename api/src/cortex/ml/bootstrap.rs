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
use rand::Rng;

/// Industry benchmark profiles
pub struct EndpointProfile {
    pub name: &'static str,
    pub base_success_rate: f64,
    pub base_latency_p50: f64,
    pub base_latency_p95: f64,
    pub base_latency_p99: f64,
    pub traffic_pattern: TrafficPattern,
    pub error_profile: ErrorProfile,
    pub anomaly_probability: f64, // per-hour chance of anomaly
}

pub enum TrafficPattern {
    Steady,           // Constant traffic (API webhooks)
    BusinessHours,    // Peak 9-17, low night (B2B SaaS)
    Ecommerce,        // Peak evenings + weekends (online store)
    Spiky,            // Random bursts (event-driven)
    Growing,          // Increasing over time (startup)
}

pub struct ErrorProfile {
    pub timeout_pct: f64,
    pub server_error_pct: f64,
    pub connection_error_pct: f64,
    pub rate_limit_pct: f64,
}

/// Industry benchmarks for different endpoint types
const PROFILES: &[EndpointProfile] = &[
    // Healthy B2B SaaS endpoint
    EndpointProfile {
        name: "healthy_b2b",
        base_success_rate: 99.2,
        base_latency_p50: 180.0,
        base_latency_p95: 800.0,
        base_latency_p99: 2500.0,
        traffic_pattern: TrafficPattern::BusinessHours,
        error_profile: ErrorProfile {
            timeout_pct: 30.0,
            server_error_pct: 40.0,
            connection_error_pct: 20.0,
            rate_limit_pct: 10.0,
        },
        anomaly_probability: 0.02,
    },
    // E-commerce webhook endpoint
    EndpointProfile {
        name: "ecommerce",
        base_success_rate: 97.5,
        base_latency_p50: 350.0,
        base_latency_p95: 1800.0,
        base_latency_p99: 5000.0,
        traffic_pattern: TrafficPattern::Ecommerce,
        error_profile: ErrorProfile {
            timeout_pct: 25.0,
            server_error_pct: 35.0,
            connection_error_pct: 15.0,
            rate_limit_pct: 25.0,
        },
        anomaly_probability: 0.05,
    },
    // Slow but reliable endpoint
    EndpointProfile {
        name: "slow_reliable",
        base_success_rate: 99.8,
        base_latency_p50: 1200.0,
        base_latency_p95: 4500.0,
        base_latency_p99: 9000.0,
        traffic_pattern: TrafficPattern::Steady,
        error_profile: ErrorProfile {
            timeout_pct: 50.0,
            server_error_pct: 30.0,
            connection_error_pct: 15.0,
            rate_limit_pct: 5.0,
        },
        anomaly_probability: 0.01,
    },
    // Unstable endpoint (frequent issues)
    EndpointProfile {
        name: "unstable",
        base_success_rate: 88.0,
        base_latency_p50: 500.0,
        base_latency_p95: 3500.0,
        base_latency_p99: 12000.0,
        traffic_pattern: TrafficPattern::Spiky,
        error_profile: ErrorProfile {
            timeout_pct: 20.0,
            server_error_pct: 45.0,
            connection_error_pct: 25.0,
            rate_limit_pct: 10.0,
        },
        anomaly_probability: 0.15,
    },
    // High-traffic startup (growing)
    EndpointProfile {
        name: "growing_startup",
        base_success_rate: 96.0,
        base_latency_p50: 280.0,
        base_latency_p95: 1500.0,
        base_latency_p99: 4000.0,
        traffic_pattern: TrafficPattern::Growing,
        error_profile: ErrorProfile {
            timeout_pct: 25.0,
            server_error_pct: 30.0,
            connection_error_pct: 20.0,
            rate_limit_pct: 25.0,
        },
        anomaly_probability: 0.08,
    },
    // Internal microservice (very fast)
    EndpointProfile {
        name: "internal_fast",
        base_success_rate: 99.9,
        base_latency_p50: 15.0,
        base_latency_p95: 50.0,
        base_latency_p99: 150.0,
        traffic_pattern: TrafficPattern::Steady,
        error_profile: ErrorProfile {
            timeout_pct: 10.0,
            server_error_pct: 60.0,
            connection_error_pct: 25.0,
            rate_limit_pct: 5.0,
        },
        anomaly_probability: 0.005,
    },
];

/// Generate synthetic hourly stats for all active endpoints
pub async fn bootstrap_ml_data(
    pool: &PgPool,
    hours_back: i64,    // how many hours of history to generate
    endpoints_limit: i64, // max endpoints to seed
) -> Result<BootstrapResult, sqlx::Error> {
    let mut rng = rand::thread_rng();
    let mut result = BootstrapResult::default();

    // Get active endpoints
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
        // Assign a random profile to this endpoint
        let profile_idx = i % PROFILES.len();
        let profile = &PROFILES[profile_idx];

        tracing::info!("  → endpoint {} ({})", url, profile.name);

        // Generate hourly stats
        let mut hourly_data = Vec::new();
        let now = Utc::now();

        for h in 0..hours_back {
            let hour_start = now - Duration::hours(hours_back - h);
            let hour_of_day = hour_start.hour() as i32;
            let day_of_week = hour_start.weekday().num_days_from_monday() as i32;

            // Calculate traffic multiplier based on pattern
            let traffic_mult = calculate_traffic_multiplier(
                &profile.traffic_pattern, hour_of_day, day_of_week, h, hours_back
            );

            // Base deliveries per hour (scaled by traffic)
            let base_deliveries = (50.0 * traffic_mult) as i32;
            let total = rng.gen_range((base_deliveries as f64 * 0.7) as i32..=(base_deliveries as f64 * 1.3) as i32).max(1);

            // Success rate with realistic variation
            let sr_variation = rng.gen_range(-2.0..2.0);
            let mut success_rate = (profile.base_success_rate + sr_variation).min(100.0).max(50.0);

            // Inject anomalies based on probability
            let is_anomaly = rng.gen_bool(profile.anomaly_probability);
            if is_anomaly {
                let anomaly_severity = rng.gen_range(0.3..0.8);
                success_rate *= 1.0 - anomaly_severity;
                result.anomalies_injected += 1;
            }

            let successful = ((total as f64) * success_rate / 100.0).round() as i32;
            let failed = total - successful;

            // Latency with variation
            let lat_mult = if is_anomaly { rng.gen_range(1.5..3.0) } else { rng.gen_range(0.8..1.2) };
            let avg_latency = (profile.base_latency_p50 * lat_mult) as i32;
            let p50 = (profile.base_latency_p50 * lat_mult * rng.gen_range(0.9..1.1)) as i32;
            let p95 = (profile.base_latency_p95 * lat_mult * rng.gen_range(0.9..1.1)) as i32;
            let p99 = (profile.base_latency_p99 * lat_mult * rng.gen_range(0.9..1.1)) as i32;

            // Error breakdown
            let error_breakdown = generate_error_breakdown(
                &profile.error_profile, failed, &mut rng
            );

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
            // Check if data already exists
            let exists: Option<(i64,)> = sqlx::query_as(
                "SELECT id FROM endpoint_hourly_stats WHERE endpoint_id = $1 AND hour_start = $2 LIMIT 1"
            )
            .bind(data.endpoint_id)
            .bind(data.hour_start)
            .fetch_optional(pool)
            .await?;

            if exists.is_some() {
                continue; // skip existing
            }

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

        // Update endpoint profile with synthetic data
        let avg_sr: f64 = hourly_data.iter().map(|d| {
            if d.total_deliveries > 0 { (d.successful as f64 / d.total_deliveries as f64) * 100.0 } else { 100.0 }
        }).sum::<f64>() / hourly_data.len().max(1) as f64;

        let avg_lat: f64 = hourly_data.iter().map(|d| d.avg_latency_ms as f64).sum::<f64>() / hourly_data.len().max(1) as f64;
        let avg_p95: f64 = hourly_data.iter().map(|d| d.p95_latency_ms as f64).sum::<f64>() / hourly_data.len().max(1) as f64;
        let avg_per_hour: f64 = hourly_data.iter().map(|d| d.total_deliveries as f64).sum::<f64>() / hourly_data.len().max(1) as f64;
        let peak_per_hour = hourly_data.iter().map(|d| d.total_deliveries).max().unwrap_or(0);

        sqlx::query(
            r#"
            INSERT INTO endpoint_profiles 
                (endpoint_id, success_rate_1h, success_rate_24h, success_rate_7d,
                 latency_p50, latency_p95, latency_p99, avg_latency_ms,
                 avg_deliveries_per_hour, peak_per_hour, sample_size, confidence, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 0.8, NOW())
            ON CONFLICT (endpoint_id) DO UPDATE SET
                success_rate_1h = EXCLUDED.success_rate_1h,
                success_rate_24h = EXCLUDED.success_rate_24h,
                success_rate_7d = EXCLUDED.success_rate_7d,
                latency_p50 = EXCLUDED.latency_p50,
                latency_p95 = EXCLUDED.latency_p95,
                latency_p99 = EXCLUDED.latency_p99,
                avg_latency_ms = EXCLUDED.avg_latency_ms,
                avg_deliveries_per_hour = EXCLUDED.avg_deliveries_per_hour,
                peak_per_hour = EXCLUDED.peak_per_hour,
                sample_size = EXCLUDED.sample_size,
                confidence = EXCLUDED.confidence,
                updated_at = NOW()
            "#
        )
        .bind(endpoint_id)
        .bind(avg_sr)
        .bind(avg_sr)
        .bind(avg_sr)
        .bind(avg_lat as i32)
        .bind(avg_p95 as i32)
        .bind((avg_p95 * 2.5) as i32)
        .bind(avg_lat as i32)
        .bind(avg_per_hour)
        .bind(peak_per_hour)
        .bind(hourly_data.len() as i32)
        .execute(pool)
        .await?;

        result.profiles_updated += 1;

        // Generate anomaly scores for anomalous hours
        for data in &hourly_data {
            if data.total_deliveries == 0 { continue; }
            let sr = (data.successful as f64 / data.total_deliveries as f64) * 100.0;
            let anomaly_score = calculate_anomaly_score(sr, data.avg_latency_ms as f64, profile);

            if anomaly_score > 40 {
                let category = if anomaly_score >= 80 { "critical" }
                    else if anomaly_score >= 70 { "high" }
                    else if anomaly_score >= 40 { "medium" }
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

        // Initialize ML models for this endpoint
        super::ml::init_endpoint_models(pool, *endpoint_id).await?;

        // Train ML models with the generated data
        let success_rates: Vec<f64> = hourly_data.iter().map(|d| {
            if d.total_deliveries > 0 { (d.successful as f64 / d.total_deliveries as f64) * 100.0 } else { 100.0 }
        }).collect();
        let latencies: Vec<f64> = hourly_data.iter().map(|d| d.avg_latency_ms as f64).collect();
        let p95_latencies: Vec<f64> = hourly_data.iter().map(|d| d.p95_latency_ms as f64).collect();
        let delivery_rates: Vec<f64> = hourly_data.iter().map(|d| d.total_deliveries as f64).collect();

        // Train adaptive thresholds
        if let Err(e) = super::ml::adaptive_thresholds::train(pool, *endpoint_id, &success_rates, &latencies, &p95_latencies).await {
            tracing::warn!("  ⚠️ adaptive_thresholds training failed: {:?}", e);
        }

        // Train anomaly detector
        if let Err(e) = super::ml::anomaly_detection::train(pool, *endpoint_id, &success_rates, &latencies, &delivery_rates).await {
            tracing::warn!("  ⚠️ anomaly_detection training failed: {:?}", e);
        }

        // Train time series forecaster
        if let Err(e) = super::ml::time_series::train(pool, *endpoint_id, &success_rates, &latencies).await {
            tracing::warn!("  ⚠️ time_series training failed: {:?}", e);
        }

        // Initialize bandit models
        if let Err(e) = super::ml::bandit::init_if_needed(pool, *endpoint_id).await {
            tracing::warn!("  ⚠️ bandit init failed: {:?}", e);
        }

        result.models_trained += 1;
    }

    tracing::info!(
        "🧠 ML Bootstrap complete: {} hourly stats, {} profiles, {} anomalies, {} models trained",
        result.hourly_stats_inserted, result.profiles_updated,
        result.anomaly_scores_inserted, result.models_trained
    );

    Ok(result)
}

fn calculate_traffic_multiplier(
    pattern: &TrafficPattern,
    hour_of_day: i32,
    day_of_week: i32,
    hour_offset: i64,
    total_hours: i64,
) -> f64 {
    let time_mult = match pattern {
        TrafficPattern::Steady => 1.0,
        TrafficPattern::BusinessHours => {
            if hour_of_day >= 9 && hour_of_day <= 17 {
                2.5 // peak work hours
            } else if hour_of_day >= 7 && hour_of_day <= 20 {
                1.5 // extended hours
            } else {
                0.3 // night
            }
        }
        TrafficPattern::Ecommerce => {
            if hour_of_day >= 18 && hour_of_day <= 23 {
                3.0 // evening shopping
            } else if hour_of_day >= 10 && hour_of_day <= 16 {
                1.8 // daytime
            } else {
                0.4 // night
            }
        }
        TrafficPattern::Spiky => {
            let mut rng = rand::thread_rng();
            if rng.gen_bool(0.1) {
                rng.gen_range(3.0..8.0) // 10% chance of spike
            } else {
                rng.gen_range(0.5..1.5)
            }
        }
        TrafficPattern::Growing => {
            let growth_factor = 1.0 + (hour_offset as f64 / total_hours as f64) * 2.0;
            growth_factor
        }
    };

    // Weekend reduction for B2B
    let weekend_mult = if day_of_week >= 5 { 0.4 } else { 1.0 };

    time_mult * weekend_mult
}

fn generate_error_breakdown(
    profile: &ErrorProfile,
    failed: i32,
    rng: &mut impl Rng,
) -> serde_json::Value {
    if failed == 0 {
        return serde_json::json!({"success": 0});
    }

    let timeout = (failed as f64 * profile.timeout_pct / 100.0).round() as i32;
    let server_err = (failed as f64 * profile.server_error_pct / 100.0).round() as i32;
    let conn_err = (failed as f64 * profile.connection_error_pct / 100.0).round() as i32;
    let rate_limit = failed - timeout - server_err - conn_err;

    let mut breakdown = serde_json::Map::new();
    if timeout > 0 { breakdown.insert("ETIMEDOUT".to_string(), serde_json::json!(timeout)); }
    if server_err > 0 {
        let code = if rng.gen_bool(0.6) { "500" } else { "503" };
        breakdown.insert(code.to_string(), serde_json::json!(server_err));
    }
    if conn_err > 0 { breakdown.insert("ECONNRESET".to_string(), serde_json::json!(conn_err.max(0))); }
    if rate_limit > 0 { breakdown.insert("429".to_string(), serde_json::json!(rate_limit.max(0))); }

    serde_json::Value::Object(breakdown)
}

fn calculate_anomaly_score(success_rate: f64, latency: f64, profile: &EndpointProfile) -> f64 {
    let mut score = 0.0;

    // Success rate deviation
    let sr_drop = profile.base_success_rate - success_rate;
    if sr_drop > 0.0 {
        score += (sr_drop * 2.0).min(50.0);
    }

    // Latency deviation
    let latency_ratio = latency / profile.base_latency_p50;
    if latency_ratio > 1.5 {
        score += ((latency_ratio - 1.0) * 20.0).min(40.0);
    }

    // Combined: both bad = worse
    if sr_drop > 5.0 && latency_ratio > 2.0 {
        score += 15.0;
    }

    score.min(100.0)
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
