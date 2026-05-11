use criterion::{black_box, criterion_group, criterion_main, Criterion};

use hooksniff_api::signing;
use hooksniff_api::billing::Plan;
use hooksniff_api::rate_limit::{InMemoryRateLimiter, RateLimitStore};

// ──────────────────────────────────────────────────────────────
// Webhook signature benchmarks
// ──────────────────────────────────────────────────────────────

fn bench_webhook_sign(c: &mut Criterion) {
    let secret = "whsec_test_secret_key_for_benchmarking_purposes";
    let msg_id = "msg_01H5XKQZ7VWXYZ123456789ABC";
    let timestamp = "1700000000";
    let body = r#"{"event":"user.created","data":{"id":"usr_123","email":"test@example.com","name":"Test User","created_at":"2024-01-15T10:30:00Z"}}"#;

    c.bench_function("webhook_sign", |b| {
        b.iter(|| {
            signing::compute_standard_signature(
                black_box(secret),
                black_box(msg_id),
                black_box(timestamp),
                black_box(body),
            )
        })
    });
}

fn bench_webhook_verify(c: &mut Criterion) {
    let secret = "whsec_test_secret_key_for_benchmarking_purposes";
    let msg_id = "msg_01H5XKQZ7VWXYZ123456789ABC";
    let timestamp = "1700000000";
    let body = r#"{"event":"user.created","data":{"id":"usr_123","email":"test@example.com","name":"Test User","created_at":"2024-01-15T10:30:00Z"}}"#;

    // Pre-compute a valid signature (timestamp is old, so we use a large tolerance)
    // For benchmarking we just measure raw HMAC + comparison cost
    let sig = signing::compute_standard_signature(secret, msg_id, timestamp, body);

    c.bench_function("webhook_verify", |b| {
        b.iter(|| {
            // Use a very large tolerance to skip timestamp check in benchmark
            signing::verify_standard_signature(
                black_box(secret),
                black_box(msg_id),
                black_box(timestamp),
                black_box(&sig),
                black_box(body),
                black_box(Some(999_999_999)),
            )
        })
    });
}

// ──────────────────────────────────────────────────────────────
// Endpoint listing / serialization benchmarks
// ──────────────────────────────────────────────────────────────

fn bench_endpoint_serialize(c: &mut Criterion) {
    let endpoint = hooksniff_api::models::endpoint::Endpoint {
        id: uuid::Uuid::new_v4(),
        customer_id: uuid::Uuid::new_v4(),
        url: "https://api.example.com/webhooks".to_string(),
        description: Some("Production webhook endpoint".to_string()),
        is_active: true,
        signing_secret: "whsec_abcdefghijklmnop".to_string(),
        retry_policy: Some(serde_json::json!({"max_retries": 5, "backoff": "exponential"})),
        created_at: chrono::Utc::now(),
        allowed_ips: Some(serde_json::json!(["10.0.0.0/8", "172.16.0.0/12"])),
        event_filter: Some(vec!["user.created".to_string(), "user.updated".to_string()]),
        custom_headers: Some(serde_json::json!({"X-Custom": "value"})),
        old_signing_secret: None,
        secret_rotated_at: None,
        routing_strategy: "round-robin".to_string(),
        fallback_url: None,
        avg_response_ms: 150,
        failure_streak: 0,
        last_failure_at: None,
        format: "standard".to_string(),
        fifo_enabled: Some(false),
        fifo_sequence: None,
        fifo_group_by_customer: None,
        fifo_max_wait_secs: None,
        throttle_rate: None,
        throttle_period_secs: None,
        throttle_strategy: None,
    };

    c.bench_function("endpoint_serialize", |b| {
        b.iter(|| serde_json::to_string(black_box(&endpoint)).unwrap())
    });
}

fn bench_endpoint_deserialize(c: &mut Criterion) {
    let json = r#"{
        "id":"550e8400-e29b-41d4-a716-446655440000",
        "customer_id":"6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "url":"https://api.example.com/webhooks",
        "description":"Production webhook endpoint",
        "is_active":true,
        "signing_secret":"whsec_abcdefghijklmnop",
        "retry_policy":{"max_retries":5,"backoff":"exponential"},
        "created_at":"2024-01-15T10:30:00Z",
        "allowed_ips":["10.0.0.0/8","172.16.0.0/12"],
        "event_filter":["user.created","user.updated"],
        "custom_headers":{"X-Custom":"value"},
        "old_signing_secret":null,
        "secret_rotated_at":null,
        "routing_strategy":"round-robin",
        "fallback_url":null,
        "avg_response_ms":150,
        "failure_streak":0,
        "last_failure_at":null,
        "format":"standard",
        "fifo_enabled":false,
        "fifo_sequence":null,
        "fifo_group_by_customer":null,
        "fifo_max_wait_secs":null,
        "throttle_rate":null,
        "throttle_period_secs":null,
        "throttle_strategy":null
    }"#;

    c.bench_function("endpoint_deserialize", |b| {
        b.iter(|| {
            serde_json::from_str::<hooksniff_api::models::endpoint::Endpoint>(black_box(json))
                .unwrap()
        })
    });
}

// ──────────────────────────────────────────────────────────────
// Rate limiter (in-memory) benchmarks
// ──────────────────────────────────────────────────────────────

fn bench_rate_limiter_check(c: &mut Criterion) {
    let rt = tokio::runtime::Runtime::new().unwrap();
    let limiter = InMemoryRateLimiter::new();

    c.bench_function("rate_limiter_check", |b| {
        b.iter(|| {
            rt.block_on(async {
                limiter
                    .check(black_box("bench_key"), black_box(1000), black_box(60))
                    .await
            })
        })
    });
}

fn bench_rate_limiter_plan_cache(c: &mut Criterion) {
    let rt = tokio::runtime::Runtime::new().unwrap();
    let limiter = InMemoryRateLimiter::new();

    // Pre-populate plan cache
    rt.block_on(async {
        limiter.set_plan("bench_prefix", Plan::Pro).await;
    });

    c.bench_function("rate_limiter_get_plan", |b| {
        b.iter(|| {
            rt.block_on(async { limiter.get_plan(black_box("bench_prefix")).await })
        })
    });
}

// ──────────────────────────────────────────────────────────────
// Auth token validation benchmarks
// ──────────────────────────────────────────────────────────────

fn bench_jwt_create_and_verify(c: &mut Criterion) {
    use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey, Algorithm};
    use serde::{Deserialize, Serialize};

    #[derive(Debug, Serialize, Deserialize, Clone)]
    struct Claims {
        sub: String,
        email: String,
        is_admin: bool,
        exp: usize,
        iat: usize,
    }

    let secret = "benchmark-jwt-secret-key-2024";
    let claims = Claims {
        sub: "usr_01H5XKQZ7VWXYZ".to_string(),
        email: "test@example.com".to_string(),
        is_admin: false,
        exp: 9999999999,
        iat: 1700000000,
    };
    let encoding_key = EncodingKey::from_secret(secret.as_bytes());
    let decoding_key = DecodingKey::from_secret(secret.as_bytes());
    let validation = Validation::new(Algorithm::HS256);

    c.bench_function("jwt_encode", |b| {
        b.iter(|| encode(black_box(&Header::default()), black_box(&claims), black_box(&encoding_key)).unwrap())
    });

    let token = encode(&Header::default(), &claims, &encoding_key).unwrap();

    c.bench_function("jwt_decode", |b| {
        b.iter(|| {
            decode::<Claims>(black_box(&token), black_box(&decoding_key), black_box(&validation))
                .unwrap()
        })
    });
}

// ──────────────────────────────────────────────────────────────
// Criterion harness
// ──────────────────────────────────────────────────────────────

criterion_group!(
    benches,
    bench_webhook_sign,
    bench_webhook_verify,
    bench_endpoint_serialize,
    bench_endpoint_deserialize,
    bench_rate_limiter_check,
    bench_rate_limiter_plan_cache,
    bench_jwt_create_and_verify,
);
criterion_main!(benches);
