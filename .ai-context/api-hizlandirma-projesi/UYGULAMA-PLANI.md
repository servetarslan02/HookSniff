# 🚀 API Hızlandırma Projesi — Aşamalı Uygulama Planı

> **Başlangıç:** 2026-05-26
> **Hedef:** HookSniff API yanıt süresini minimuma indirmek
> **Mevcut:** ~50-200ms (webhook kabul) → **Hedef: < 10ms**
> **Ek Maliyet:** $0 (mevcut Upstash Redis)
> **Bu dosya:** Tüm plan, tezler, örnekler tek belgede

---

## 📖 İçindekiler

1. [Mevcut API Akışı & Darboğazlar](#1-mevcut-api-akışı--darboğazlar)
2. [Sektör Karşılaştırması & Tezler](#2-sektör-karşılaştırması--tezler)
3. [Faz 1: Auth Middleware Optimizasyonu](#3-faz-1-auth-middleware-optimizasyonu)
4. [Faz 2: Rate Limiting → Redis Taşıma](#4-faz-2-rate-limiting--redis-taşıma)
5. [Faz 3: Plan Limiti Cache](#5-faz-3-plan-limiti-cache)
6. [Faz 4: Connection Pool Tuning](#6-faz-4-connection-pool-tuning)
7. [Faz 5: Response Compression](#7-faz-5-response-compression)
8. [Faz 6: JSON Serialization Optimizasyonu](#8-faz-6-json-serialization-optimizasyonu)
9. [Faz 7: Cold Start Optimizasyonu](#9-faz-7-cold-start-optimizasyonu)
10. [Grafana Metrikleri & Monitoring](#10-grafana-metrikleri--monitoring)
11. [Test & Doğrulama](#11-test--doğrulama)
12. [Rollback Planı](#12-rollback-planı)
13. [Zaman Çizelgesi](#13-zaman-çizelgesi)

---

## 1. Mevcut API Akışı & Darboğazlar

### Webhook Kabul Akışı (POST /v1/webhooks)

```
Müşteri İsteği
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  Layer 1: Tower Middleware Stack                     │
│  ├─ TraceLayer (OpenTelemetry)          ~0.1ms      │
│  ├─ CorsLayer                           ~0.1ms      │
│  └─ CompressionLayer (yok!)             ❌ EKSİK    │
└──────────┬──────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  Layer 2: Auth Middleware                            │
│  ├─ JWT token parse                     ~0.5ms      │
│  ├─ API key lookup (DB!)                ~5-20ms  ←  │ DARBOĞAZ #1
│  ├─ Customer cache (30s TTL)            ~0ms (hit)  │
│  └─ Plan lookup (DB!)                   ~5-10ms  ←  │ DARBOĞAZ #2
└──────────┬──────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  Layer 3: Rate Limiting                              │
│  ├─ In-memory sliding window            ~0.1ms      │
│  ├─ Plan-based limit check              ~0.1ms      │
│  └─ (Multi-instance'de çalışmaz!)       ⚠️ SORUN    │
└──────────┬──────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  Layer 4: Route Handler (webhooks::create)           │
│  ├─ Payload validation                  ~0.5ms      │
│  ├─ Event type validation               ~0.1ms      │
│  ├─ Idempotency check (DB!)             ~5-10ms  ←  │ DARBOĞAZ #3
│  ├─ Content deduplication (DB!)         ~5-10ms  ←  │ DARBOĞAZ #4
│  ├─ Endpoint lookup (DB!)               ~5-10ms  ←  │ DARBOĞAZ #5
│  ├─ Plan limit check (DB!)              ~5-10ms  ←  │ DARBOĞAZ #6
│  ├─ Signing secret (DB!)                ~5-10ms  ←  │ DARBOĞAZ #7
│  ├─ INSERT delivery (DB!)               ~5-10ms     │
│  ├─ Queue'a yaz (Redis/PG)              ~1-5ms      │
│  └─ Response                            ~0.1ms      │
└──────────┬──────────────────────────────────────────┘
           │
           ▼
    Toplam: ~50-200ms (7-10 DB sorgusu!)
    Hedef:  < 10ms (0-1 DB sorgusu)
```

### Tespit Edilen Darboğazlar

| # | Darboğaz | Etki | Öncelik |
|---|----------|------|---------|
| 1 | API key lookup (her istekte DB) | 5-20ms | 🔴 Kritik |
| 2 | Plan lookup (her istekte DB) | 5-10ms | 🔴 Kritik |
| 3 | Idempotency check (her istekte DB) | 5-10ms | 🔴 Kritik |
| 4 | Content deduplication (her istekte DB) | 5-10ms | 🟡 Yüksek |
| 5 | Endpoint lookup (her istekte DB) | 5-10ms | 🟡 Yüksek |
| 6 | Plan limit check (her istekte DB) | 5-10ms | 🟡 Yüksek |
| 7 | Signing secret (her istekte DB) | 5-10ms | 🟡 Yüksek |
| 8 | Rate limiting (in-memory, multi-instance uyumsuz) | 0.1ms | 🟢 Orta |
| 9 | Response compression yok | 0ms (bandwidth) | 🟢 Orta |
| 10 | Cold start (Cloud Run) | 1-5s | 🟡 Yüksek |

### Mevcut Kod Referansları

| Bileşen | Dosya | Mevcut Durum |
|---------|-------|-------------|
| Auth cache | `middleware/mod.rs` | In-memory, 30s TTL, `AUTH_CACHE_MAX_ENTRIES: 10_000` |
| Rate limiter | `rate_limit/mod.rs` | In-memory sliding window |
| Cache layer | `cache.rs` | Redis cache (API_KEY_TTL: 30s, ENDPOINT_TTL: 5m, PLAN_TTL: 60s) |
| DB pool | `db.rs` | max_connections: 20, min: 2, idle_timeout: 5m |
| SSRF | `ssrf.rs` | DNS çözümleme + IP kontrol |
| Validation | `validation.rs` | Regex tabanlı |
| Signing | `signing.rs` | HMAC-SHA256 (hooksniff_common'dan) |

---

## 2. Sektör Karşılaştırması & Tezler

### Rakip API Yanıt Süreleri

| Platform | API Yanıt Süresi | Teknik |
|----------|-----------------|--------|
| **Stripe** | ~20-50ms | Özel altyapı, coğrafi dağıtım |
| **Svix** | ~10-30ms | Redis cache, minimal DB sorgusu |
| **Hookdeck** | ~15-40ms | Redis rate limiting, connection pooling |
| **HookSniff (mevcut)** | ~50-200ms | Her istekte 7-10 DB sorgusu |
| **HookSniff (hedef)** | **< 10ms** | **Redis cache, 0-1 DB sorgusu** |

### Tez 1: Neden Redis Cache?

Şu an her webhook isteğinde 7-10 DB sorgusu yapılıyor. Redis cache ile bu 0-1'e düşebilir.

| Sorgu | Şu An (DB) | Redis Cache ile |
|-------|-----------|-----------------|
| API key lookup | ~10ms | ~0.5ms |
| Plan lookup | ~5ms | ~0.5ms |
| Endpoint lookup | ~10ms | ~0.5ms |
| Signing secret | ~10ms | ~0.5ms |
| Plan limit | ~5ms | ~0.5ms |
| **Toplam** | **~40ms** | **~2.5ms** |

### Tez 2: Neden In-Memory Cache Değil?

| Özellik | In-Memory | Redis |
|---------|-----------|-------|
| Hız | ~0.01ms | ~0.5ms |
| Multi-instance | ❌ (her instance ayrı cache) | ✅ (paylaşımlı) |
| Memory kullanımı | Instance başına | Paylaşımlı |
| TTL yönetimi | Manuel | Built-in |
| Crash sonrası | Kaybolur | Persist |

**Sonuç:** In-Memory daha hızlı ama multi-instance'da tutarsızlık yaratır. Redis en iyi denge.

### Tez 3: Neden Rate Limiting Redis'e Taşınmalı?

Şu an in-memory rate limiter var. Cloud Run'da birden fazla instance çalıştığında her instance kendi sayacını tutar → limit aşılmış sayılmaz.

**Redis ile:** Tüm instance'lar aynı sayacı kullanır → doğru limit uygulanır.

### Tez 4: Neden Response Compression?

| Durum | Compression Yok | gzip Compression |
|-------|----------------|------------------|
| 10KB JSON response | 10KB transfer | ~2KB transfer |
| 100 webhook/sn | 1MB/sn | ~200KB/sn |
| Müşteri bandwidth | Yüksek | %80 azalma |

**Sonuç:** API yanıt boyutunu %80 azaltır. Müşteri tarafında daha hızlı parse.

### Tez 5: Neden Cold Start Optimizasyonu?

Cloud Run'da container uykudan uyandığında ilk istek 1-5 saniye sürebilir.

**Çözüm:** Minimum 1 instance çalışır tut → cold start tamamen ortadan kalkar.

---

## 3. Faz 1: Auth Middleware Optimizasyonu

> **Süre:** 1-2 oturum | **Etki:** 20ms → 0.5ms | **Risk:** Düşük

### 3.1 Mevcut Durum

```rust
// middleware/mod.rs — Mevcut auth cache (in-memory, 30s TTL)
struct AuthCache {
    entries: HashMap<String, (Customer, Instant)>,
}

// Her istekte:
// 1. Cache'e bak (in-memory) → hit → 0ms
// 2. Cache miss → DB sorgusu (~10-20ms)
// 3. Cache'e ekle
```

**Sorun:** In-memory cache sadece tek instance'da çalışır. Cloud Run'da birden fazla instance varsa her biri ayrı cache tutar.

### 3.2 Çift Katmanlı Cache (In-Memory + Redis)

```rust
// middleware/mod.rs — Yeni: Çift katmanlı auth cache

/// Katman 1: In-memory (en hızlı, ~0.01ms)
/// Katman 2: Redis (paylaşımlı, ~0.5ms)
/// Katman 3: PostgreSQL (en yavaş, ~10ms)

struct AuthCacheV2 {
    // Katman 1: In-memory (her instance'a özel)
    memory: HashMap<String, (Customer, Instant)>,
    memory_ttl: Duration,  // 10s (kısa — tutarsızlık riskini azaltır)

    // Katman 2: Redis (paylaşımlı)
    redis: Option<cache::CacheLayer>,
    redis_ttl: Duration,   // 60s
}

impl AuthCacheV2 {
    async fn get(&mut self, key: &str) -> Option<Customer> {
        // 1. In-memory cache (en hızlı)
        if let Some((customer, expiry)) = self.memory.get(key) {
            if Instant::now() < *expiry {
                return Some(customer.clone());
            }
        }

        // 2. Redis cache (paylaşımlı)
        if let Some(ref redis) = self.redis {
            if let Ok(Some(customer)) = redis.get::<Customer>(&format!("auth:{}", key)).await {
                // In-memory'ye de ekle
                self.memory.insert(key.to_string(),
                    (customer.clone(), Instant::now() + self.memory_ttl));
                return Some(customer);
            }
        }

        None // Cache miss → DB sorgusu gerekli
    }

    async fn insert(&mut self, key: String, customer: Customer) {
        // Her iki katmana da yaz
        self.memory.insert(key.clone(),
            (customer.clone(), Instant::now() + self.memory_ttl));

        if let Some(ref redis) = self.redis {
            let _ = redis.set(
                &format!("auth:{}", key),
                &customer,
                self.redis_ttl,
            ).await;
        }
    }
}
```

### 3.3 API Key Lookup Optimizasyonu

Şu an her istekte API key hash'i hesaplanıp DB'de aranıyor. Redis cache ile bu sorgu %99 azaltılır.

```rust
// middleware/mod.rs — API key cache

/// API key lookup: Redis cache → DB fallback
async fn lookup_api_key(
    pool: &PgPool,
    cache: &mut AuthCacheV2,
    api_key: &str,
) -> Result<Customer, AppError> {
    let cache_key = format!("apikey:{}", hash_prefix(api_key));

    // 1. Cache'e bak (in-memory + Redis)
    if let Some(customer) = cache.get(&cache_key).await {
        return Ok(customer);
    }

    // 2. Cache miss → DB sorgusu
    let customer = sqlx::query_as::<_, Customer>(CUSTOMER_SELECT)
        .bind(api_key)
        .fetch_optional(pool)
        .await?
        .ok_or(AppError::Unauthorized)?;

    // 3. Cache'e ekle (her iki katman)
    cache.insert(cache_key, customer.clone()).await;

    Ok(customer)
}

/// API key'in ilk 8 karakterini hash olarak kullan (cache key)
fn hash_prefix(api_key: &str) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut hasher = DefaultHasher::new();
    api_key.hash(&mut hasher);
    format!("{:016x}", hasher.finish())
}
```

### 3.4 Faz 1 Doğrulama

- [ ] `cargo check` — 0 hata
- [ ] Cache hit rate > %95 (Grafana'dan)
- [ ] Auth latency: ~0.5ms (Redis hit)
- [ ] Multi-instance'da tutarlı (Redis paylaşımlı)
- [ ] Cache invalidation çalışıyor (kullanıcı plan değiştirince)

---

## 4. Faz 2: Rate Limiting → Redis Taşıma

> **Süre:** 1 oturum | **Etki:** Multi-instance uyumluluğu | **Risk:** Düşük

### 4.1 Mevcut Durum

```rust
// rate_limit/mod.rs — In-memory sliding window
struct RateLimitEntry {
    timestamps: Vec<Instant>,
}

pub struct InMemoryRateLimiter {
    requests: Arc<Mutex<HashMap<String, RateLimitEntry>>>,
    plans: Arc<Mutex<HashMap<String, (Plan, Instant)>>>,
}
```

**Sorun:** Cloud Run'da birden fazla instance → her instance kendi sayacını tutar → rate limit aşılmış sayılmaz.

### 4.2 Redis Rate Limiter (Token Bucket)

```rust
// rate_limit/redis_limiter.rs — YENİ DOSYA

use redis::aio::ConnectionManager;
use std::time::Duration;

#[derive(Clone)]
pub struct RedisRateLimiter {
    conn: ConnectionManager,
}

impl RedisRateLimiter {
    pub async fn new(redis_url: &str) -> Result<Self> {
        let client = redis::Client::open(redis_url)?;
        let conn = ConnectionManager::new(client).await?;
        Ok(Self { conn })
    }

    /// Token bucket algorithm — Redis ile atomik
    pub async fn check(
        &self,
        key: &str,
        limit: u32,
        window_secs: u64,
    ) -> RateLimitResult {
        let redis_key = format!("rl:{}", key);
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        // Lua script — atomik token bucket
        let script = redis::Script::new(r"
            local key = KEYS[1]
            local limit = tonumber(ARGV[1])
            local window = tonumber(ARGV[2])
            local now = tonumber(ARGV[3])

            local current = redis.call('GET', key)
            if current == false then
                redis.call('SETEX', key, window, 1)
                return {1, limit - 1, window}
            end

            current = tonumber(current)
            if current >= limit then
                local ttl = redis.call('TTL', key)
                return {0, 0, ttl}
            end

            redis.call('INCR', key)
            local ttl = redis.call('TTL', key)
            return {1, limit - current - 1, ttl}
        ");

        let result: (i32, i32, i64) = script
            .key(&redis_key)
            .arg(limit)
            .arg(window_secs)
            .arg(now)
            .invoke_async(&mut self.conn.clone())
            .await
            .unwrap_or((1, limit as i32, window_secs as i64));

        RateLimitResult {
            allowed: result.0 == 1,
            remaining: result.1.max(0) as u32,
            limit,
            reset_seconds: result.2.max(0) as u64,
        }
    }
}
```

### 4.3 Feature Flag ile Geçiş

```rust
// rate_limit/mod.rs — Mevcut limiter'i koru, Redis opsiyonel

pub async fn create_rate_limiter() -> RateLimiterEnum {
    let use_redis = std::env::var("USE_REDIS_RATE_LIMIT")
        .map(|v| v == "true")
        .unwrap_or(false);

    if use_redis {
        if let Some(url) = config::resolve_redis_url() {
            match RedisRateLimiter::new(&url).await {
                Ok(limiter) => {
                    tracing::info!("✅ Redis rate limiter active");
                    return RateLimiterEnum::Redis(limiter);
                }
                Err(e) => tracing::warn!("Redis rate limiter failed: {}", e),
            }
        }
    }

    tracing::info!("ℹ️ Using in-memory rate limiter");
    RateLimiterEnum::InMemory(InMemoryRateLimiter::new())
}

pub enum RateLimiterEnum {
    InMemory(InMemoryRateLimiter),
    Redis(RedisRateLimiter),
}
```

### 4.4 Faz 2 Doğrulama

- [ ] `cargo check` — 0 hata
- [ ] Rate limit Redis'te doğru sayılıyor
- [ ] Multi-instance'da tutarlı
- [ ] In-memory fallback çalışıyor (Redis down ise)

---

## 5. Faz 3: Plan Limiti Cache

> **Süre:** 1 oturum | **Etki:** 10ms → 0.5ms | **Risk:** Düşük

### 5.1 Mevcut Durum

Her webhook isteğinde müşteri planı DB'den kontrol ediliyor:
- Webhook sayısı limiti
- Endpoint sayısı limiti
- Payload boyut limiti

### 5.2 Redis Cache ile Plan Limiti

```rust
// routes/webhooks/handlers.rs — Plan limiti cache

/// Plan limitini Redis'ten al (1 dk TTL)
async fn get_plan_limits(
    pool: &PgPool,
    cache: &Option<cache::CacheLayer>,
    customer_id: Uuid,
) -> Result<PlanLimits> {
    let cache_key = format!("plan_limits:{}", customer_id);

    // 1. Redis cache'e bak
    if let Some(ref cache) = cache {
        if let Ok(Some(limits)) = cache.get::<PlanLimits>(&cache_key).await {
            return Ok(limits);
        }
    }

    // 2. Cache miss → DB sorgusu
    let limits = sqlx::query_as::<_, PlanLimits>(
        "SELECT p.max_webhooks_per_month, p.max_endpoints, p.max_payload_bytes
         FROM customers c JOIN plans p ON c.plan_id = p.id
         WHERE c.id = $1"
    )
    .bind(customer_id)
    .fetch_one(pool)
    .await?;

    // 3. Cache'e ekle (1 dk TTL)
    if let Some(ref cache) = cache {
        let _ = cache.set(&cache_key, &limits, Duration::from_secs(60)).await;
    }

    Ok(limits)
}
```

### 5.3 Faz 3 Doğrulama

- [ ] Plan limiti sorgusu ~0.5ms (cache hit)
- [ ] Plan değişikliği → 1 dk içinde güncellenir
- [ ] Cache miss → DB'den doğru çekilir

---

## 6. Faz 4: Connection Pool Tuning

> **Süre:** 1 oturum | **Etki:** Bağlantı bekleme süresi azalır | **Risk:** Düşük

### 6.1 Mevcut Durum

```rust
// db.rs — Mevcut pool config
PgPoolOptions::new()
    .max_connections(20)
    .min_connections(2)
    .acquire_timeout(Duration::from_secs(5))
    .idle_timeout(Duration::from_secs(300))
    .max_lifetime(Duration::from_secs(1800))
```

### 6.2 Optimize Edilmiş Pool

```rust
// db.rs — Optimized pool config
PgPoolOptions::new()
    .max_connections(30)          // 20 → 30 (yüksek trafik için)
    .min_connections(5)           // 2 → 5 (sıcak bağlantılar hazır)
    .acquire_timeout(Duration::from_secs(3))  // 5s → 3s (daha hızlı hata)
    .idle_timeout(Duration::from_secs(600))   // 5m → 10m (daha uzun bekle)
    .max_lifetime(Duration::from_secs(3600))  // 30m → 1h (daha az yenileme)
    .connect(&clean_url)
    .await?;
```

### 6.3 Neon Connection Pooling

Neon free tier'da 100 max connection var. Mevcut 20 + 5 (health) = 25. 30 + 5 = 35'e çıkarabiliriz.

```rust
// Neon connection pooler modu: "transaction"
// Her sorgu ayrı connection alır, transaction biterken geri verir
// Bu sayede 30 connection ile binlerce istek işlenebilir
```

### 6.4 Faz 4 Doğrulama

- [ ] `cargo check` — 0 hata
- [ ] Connection acquisition timeout azaldı
- [ ] Pool exhaustion hatası yok (yüksek trafikte)

---

## 7. Faz 5: Response Compression

> **Süre:** 1 oturum | **Etki:** Bandwidth %80 azalma | **Risk:** Çok düşük

### 7.1 Mevcut Durum

Şu an response compression yok. 10KB JSON response doğrudan gönderiliyor.

### 7.2 Tower Compression Layer

```rust
// main.rs — Compression layer ekle
use tower_http::compression::CompressionLayer;

let app = Router::new()
    // ... mevcut route'lar
    .layer(CompressionLayer::new())  // ← YENİ
    .layer(TraceLayer::new_for_http());
```

### 7.3 Müşteri Tarafı Destek

```rust
// Müşteri isteği header'ı:
// Accept-Encoding: gzip, deflate, br

// HookSniff response header'ı:
// Content-Encoding: gzip

// Müşteri tarafında otomatik decode (curl, fetch, SDK)
```

### 7.4 Faz 5 Doğrulama

- [ ] `cargo check` — 0 hata
- [ ] Response boyutu %80 azaldı (gzip)
- [ ] Müşteri tarafında doğru decode ediliyor
- [ ] CPU kullanımı makul (compression overhead)

---

## 8. Faz 6: JSON Serialization Optimizasyonu

> **Süre:** 1 oturum | **Etki:** ~1-2ms azalma | **Risk:** Düşük

### 8.1 Mevcut Durum

serde_json kullanılıyor — genel amaçlı, yavaş olabilir.

### 8.2 simd-json (Opsiyonel, İleri Optimizasyon)

```toml
# api/Cargo.toml
[dependencies]
simd-json = "0.14"  # SIMD tabanlı, 2-5x daha hızlı
```

```rust
// simd-json ile parse
let mut payload_bytes = payload.as_bytes().to_vec();
let value = simd_json::serde::from_slice::<serde_json::Value>(&mut payload_bytes)?;
```

**Not:** Bu optimizasyon opsiyonel. Mevcut serde_json yeterince hızlı olabilir. Önce diğer optimizasyonları yap, sonra benchmark et.

### 8.3 Faz 6 Doğrulama

- [ ] `cargo check` — 0 hata
- [ ] JSON parse süresi azaldı (benchmark)
- [ ] Tüm endpoint'ler doğru çalışıyor

---

## 9. Faz 7: Cold Start Optimizasyonu

> **Süre:** 1 oturum | **Etki:** 1-5s → 0s | **Risk:** Düşük

### 9.1 Mevcut Durum

Cloud Run'da container uykudan uyandığında:
- Rust binary yüklenir (~50ms — çok hızlı)
- DB bağlantısı kurulur (~100-500ms)
- Redis bağlantısı kurulur (~50-100ms)
- Migration çalıştırılır (~100ms)
- İlk istek işlenir (~500ms-1s)

**Toplam cold start:** ~1-2s (Rust sayesinde zaten hızlı)

### 9.2 Minimum Instance

```yaml
# cloudbuild.yaml veya Cloud Run config
# Minimum 1 instance çalışır tut → cold start tamamen ortadan kalkar

spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "1"  # ← 0'dan 1'e
```

**Maliyet etkisi:** Cloud Run free tier'da minimum instance için ücret alınmaz (idle state'de CPU/memory kullanılmaz).

### 9.3 Health Check Warm-up

```rust
// routes/health.rs — Warm-up endpoint
pub async fn warmup(pool: &PgPool, redis: &Option<cache::CacheLayer>) -> &'static str {
    // DB bağlantısını sıcak tut
    let _ = sqlx::query("SELECT 1").execute(pool).await;

    // Redis bağlantısını sıcak tut
    if let Some(ref redis) = redis {
        let _ = redis.ping().await;
    }

    "ok"
}

// Cloud Run health check: her 10 saniyede bir /warmup çağırır
// Bu sayede bağlantılar sıcak kalır, cold start olmaz
```

### 9.4 Faz 7 Doğrulama

- [ ] Cold start süresi ölçülebilir değil (minimum instance)
- [ ] İlk istek < 100ms
- [ ] DB bağlantısı sıcak (warm-up sayesinde)

---

## 10. Grafana Metrikleri & Monitoring

### 10.1 Yeni Metrikler

```rust
// api/src/metrics.rs — mevcut dosyaya ekle

// Auth latency
pub static AUTH_LATENCY_MS: AtomicU64 = AtomicU64::new(0);

// Rate limit latency
pub static RATE_LIMIT_LATENCY_MS: AtomicU64 = AtomicU64::new(0);

// Cache hit/miss (zaten var: cache.rs)
// CACHE_HITS, CACHE_MISSES

// Total API response time
pub static API_RESPONSE_TIME_MS: AtomicU64 = AtomicU64::new(0);

// Compression ratio
pub static COMPRESSION_RATIO: AtomicU64 = AtomicU64::new(0); // percentage

// Cold start count
pub static COLD_START_COUNT: AtomicU64 = AtomicU64::new(0);
```

### 10.2 Grafana Dashboard Panelleri

```json
{
  "panels": [
    {
      "title": "API Yanıt Süresi (ms)",
      "targets": [{"expr": "hooksniff_api_response_time_ms"}],
      "type": "timeseries",
      "thresholds": [
        {"value": 10, "color": "green"},
        {"value": 50, "color": "yellow"},
        {"value": 200, "color": "red"}
      ]
    },
    {
      "title": "Auth Cache Hit Rate",
      "targets": [{"expr": "rate(hooksniff_cache_hits[5m]) / (rate(hooksniff_cache_hits[5m]) + rate(hooksniff_cache_misses[5m]))"}],
      "type": "gauge"
    },
    {
      "title": "Rate Limit Redis vs In-Memory",
      "targets": [
        {"expr": "hooksniff_rate_limit_redis", "legendFormat": "Redis"},
        {"expr": "hooksniff_rate_limit_memory", "legendFormat": "In-Memory"}
      ],
      "type": "stat"
    },
    {
      "title": "DB Sorgu Sayısı (istek başına)",
      "targets": [{"expr": "hooksniff_db_queries_per_request"}],
      "type": "timeseries",
      "thresholds": [
        {"value": 1, "color": "green"},
        {"value": 3, "color": "yellow"},
        {"value": 10, "color": "red"}
      ]
    },
    {
      "title": "Compression Ratio (%)",
      "targets": [{"expr": "hooksniff_compression_ratio"}],
      "type": "gauge"
    }
  ]
}
```

---

## 11. Test & Doğrulama

### 11.1 API Latency Benchmark

```bash
# 100 istek gönder, her birinin süresini ölç
for i in $(seq 1 100); do
  curl -s -o /dev/null -w "%{time_total}\n" -X POST \
    $API_URL/v1/webhooks \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"endpoint_id":"'$EP_ID'","event":"bench.test","data":{"i":'$i'}}'
done | awk '{
  sum+=$1; count++;
  if($1>max) max=$1;
  if(min=="" || $1<min) min=$1;
  vals[count]=$1;
} END {
  asort(vals);
  p50=vals[int(count*0.5)];
  p95=vals[int(count*0.95)];
  p99=vals[int(count*0.99)];
  print "Avg:", sum/count*1000, "ms";
  print "Min:", min*1000, "ms";
  print "Max:", max*1000, "ms";
  print "p50:", p50*1000, "ms";
  print "p95:", p95*1000, "ms";
  print "p99:", p99*1000, "ms";
}'
```

### 11.2 Cache Hit Rate Test

```bash
# Grafana'da cache hit rate kontrol et
# Hedef: > %95

# İlk istek (cache miss)
curl -X POST $API_URL/v1/webhooks ...
# İkinci istek (cache hit) — aynı API key
curl -X POST $API_URL/v1/webhooks ...
# Cache hit rate artmalı
```

### 11.3 Compression Test

```bash
# Compression olmadan
curl -s -o /dev/null -w "Size: %{size_download}\n" \
  $API_URL/v1/webhooks -H "Accept-Encoding: identity" ...

# Compression ile
curl -s -o /dev/null -w "Size: %{size_download}\n" \
  $API_URL/v1/webhooks -H "Accept-Encoding: gzip" ...

# Boyut %80 azalmalı
```

### 11.4 Before/After Karşılaştırma

| Metrik | Before | After (Faz 1-7) | İyileşme |
|--------|--------|-----------------|----------|
| Auth latency | ~15ms | ~0.5ms | **30x** |
| Rate limit latency | ~0.1ms | ~0.5ms | (Redis overhead, ama multi-instance uyumlu) |
| Plan limit check | ~10ms | ~0.5ms | **20x** |
| Toplam DB sorgusu | 7-10 | 0-1 | **10x** |
| API yanıt süresi | ~50-200ms | < 10ms | **20x** |
| Response boyutu | 10KB | ~2KB | **5x** |
| Cold start | 1-5s | 0s | **∞** |

---

## 12. Rollback Planı

### Her Faz İçin

```bash
# Feature flag ile geri al
# .env değişkenini false yap, yeniden deploy

USE_REDIS_RATE_LIMIT=false   # Faz 2 geri al
USE_AUTH_CACHE_V2=false      # Faz 1 geri al
```

### Acil Durum

```bash
# Tüm cache'leri temizle
redis-cli DEL $(redis-cli KEYS "hooksniff:*")

# API'yi yeniden başlat (cache'ler temizlenir)
gcloud run services update hooksniff-api --region europe-west1
```

---

## 13. Zaman Çizelgesi

| Faz | Süre | Etki | Oturum |
|-----|------|------|--------|
| **Faz 1:** Auth Middleware | 1-2 oturum | 20ms → 0.5ms | 1-2 |
| **Faz 2:** Rate Limiting → Redis | 1 oturum | Multi-instance uyumlu | 3 |
| **Faz 3:** Plan Limiti Cache | 1 oturum | 10ms → 0.5ms | 4 |
| **Faz 4:** Connection Pool Tuning | 1 oturum | Bağlantı bekleme azalır | 5 |
| **Faz 5:** Response Compression | 1 oturum | Bandwidth %80 azalma | 6 |
| **Faz 6:** JSON Serialization | 1 oturum | ~1-2ms azalma | 7 |
| **Faz 7:** Cold Start | 1 oturum | 1-5s → 0s | 8 |

**Toplam:** ~8 oturum, **$0 ek maliyet**

### Beklenen Sonuçlar

| Metrik | Mevcut | Hedef | Stripe | Svix |
|--------|--------|-------|--------|------|
| API yanıt süresi | ~50-200ms | **< 10ms** | ~20-50ms | ~10-30ms |
| Auth latency | ~15ms | **0.5ms** | ~5ms | ~2ms |
| DB sorgusu/istek | 7-10 | **0-1** | ~0 | ~0-1 |
| Cold start | 1-5s | **0s** | 0s | 0s |
| Response boyutu | 10KB | **2KB** | ~3KB | ~2KB |

---

## 📚 Kaynaklar

- [Tower Middleware Docs](https://docs.rs/tower-http/latest/tower_http/)
- [Redis Rate Limiting Patterns](https://redis.io/glossary/rate-limiting/)
- [Axum Performance Tips](https://docs.rs/axum/latest/axum/)
- [Cloud Run Cold Start Optimization](https://cloud.google.com/run/docs/tips/general)
- [serde_json vs simd-json Benchmark](https://github.com/simd-lite/simd-json)

---

*Bu plan HookSniff API'nin sektörün en hızlı webhook API'si olmasını hedefler.*
*Son güncelleme: 2026-05-26*
