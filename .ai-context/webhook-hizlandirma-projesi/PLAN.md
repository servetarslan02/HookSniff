# 📋 Webhook Hızlandırma — Uygulama Planı (v2 — Gözden Geçirilmiş)

> **Tarih:** 2026-05-26
> **Hedef:** 6 fazda HookSniff'i sektörün en hızlı webhook platformu yapmak
> **Toplam Süre:** ~10-12 oturum
> **Ek Maliyet:** $0

---

## 🎯 Genel Bakış

```
Faz 1: Redis Streams Queue          → 1000ms → < 10ms    (EN KRİTİK)
Faz 2: HTTP/2 + Connection Pooling  → 50ms → 0ms
Faz 3: 3 Katmanlı Retry             → 30s → 100ms
Faz 4: DNS + SSRF Cache             → 30ms → 0ms
Faz 5: Dynamic Concurrency          → 10 → 20-50/endpoint
Faz 6: Batch Processing             → 1x → 1.5-2x throughput
```

---

## ⚙️ Mevcut Sistem Notları

### Zaten Var Olan Altyapı
- **Redis**: `api/Cargo.toml` ve `worker/Cargo.toml`'da `redis = { version = "1", features = ["tokio-rustls-comp", "connection-manager"] }` — ama `streams` feature'ı EKSIK
- **REDIS_URL**: `api/src/config.rs`'de `resolve_redis_url()` fonksiyonu var
- **Worker Redis**: `worker/src/config.rs`'de `redis_url: Option<String>` var
- **webhook_queue**: `api/src/db.rs:174`'de INSERT var
- **process_pending**: `worker/src/main.rs:463`'te mevcut queue okuma fonksiyonu
- **Circuit breaker**: `worker/src/circuit_breaker.rs` — mevcut, Redis persistence var
- **Throttle**: `worker/src/throttle.rs` — mevcut, Redis persistence var
- **Signing secrets**: `process_pending` içinde batch fetch var

### Eksik Olanlar
- Redis `streams` feature'ı Cargo.toml'da yok
- `api/src/queue.rs` modülü yok (yeni oluşturulacak)
- `worker/src/queue.rs` modülü yok (yeni oluşturulcargo check)

---

## Faz 1: Redis Streams Queue 🔴 KRİTİK

**Süre:** 2-3 oturum
**Etki:** İlk tetikleme 1000ms → < 10ms
**Risk:** Orta (paralel çalıştırılabilir)

### Adım 1.0: Cargo.toml Değişiklikleri

```toml
# api/Cargo.toml — streams feature ekle
redis = { version = "1", default-features = false, features = ["tokio-rustls-comp", "connection-manager", "streams"] }

# worker/Cargo.toml — streams feature ekle
redis = { version = "1", default-features = false, features = ["tokio-rustls-comp", "connection-manager", "streams"] }
```

**Doğrulama:** `cargo check` — 0 hata

### Adım 1.1: QueueMessage Struct (api/src/queue.rs — YENİ)

```rust
//! Redis Streams webhook queue.
//!
//! PostgreSQL webhook_queue tablosunun yerini alır.
//! Sub-millisecond tetikleme sağlar.

use anyhow::Result;
use redis::aio::ConnectionManager;
use redis::streams::{StreamReadOptions, StreamReadReply};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

const STREAM_KEY: &str = "hooksniff:webhooks";
const CONSUMER_GROUP: &str = "hooksniff-workers";
const MAX_STREAM_LEN: usize = 100_000;

/// Kuyruk mesajı — API tarafından yazılır, Worker tarafından okunur
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueueMessage {
    pub delivery_id: Uuid,
    pub endpoint_id: Uuid,
    pub endpoint_url: String,
    pub payload: String,
    pub custom_headers: Option<serde_json::Value>,
    pub trace_id: Option<String>,
    pub attempt_count: i32,
    pub max_attempts: i32,
}

/// Redis Streams queue yöneticisi
pub struct RedisQueue {
    conn: ConnectionManager,
}

impl RedisQueue {
    /// Yeni bağlantı oluştur + consumer group oluştur
    pub async fn new(redis_url: &str) -> Result<Self> {
        let client = redis::Client::open(redis_url)?;
        let mut conn = ConnectionManager::new(client).await?;

        // Consumer group oluştur (yoksa)
        let _: Result<(), _> = redis::cmd("XGROUP")
            .arg("CREATE")
            .arg(STREAM_KEY)
            .arg(CONSUMER_GROUP)
            .arg("0")
            .arg("MKSTREAM")
            .query_async(&mut conn)
            .await;

        tracing::info!("✅ Redis Streams queue connected: {}", STREAM_KEY);
        Ok(Self { conn })
    }

    /// Kuyruğa webhook ekle (sub-millisecond)
    pub async fn enqueue(&mut self, msg: &QueueMessage) -> Result<String> {
        let headers_str = msg
            .custom_headers
            .as_ref()
            .map(|h| serde_json::to_string(h).unwrap_or_default())
            .unwrap_or_default();

        let id: String = redis::cmd("XADD")
            .arg(STREAM_KEY)
            .arg("MAXLEN")
            .arg("~")
            .arg(MAX_STREAM_LEN)
            .arg("*")
            .arg("delivery_id")
            .arg(msg.delivery_id.to_string())
            .arg("endpoint_id")
            .arg(msg.endpoint_id.to_string())
            .arg("url")
            .arg(&msg.endpoint_url)
            .arg("payload")
            .arg(&msg.payload)
            .arg("headers")
            .arg(&headers_str)
            .arg("trace_id")
            .arg(msg.trace_id.as_deref().unwrap_or(""))
            .arg("attempt")
            .arg(msg.attempt_count.to_string())
            .arg("max_attempts")
            .arg(msg.max_attempts.to_string())
            .query_async(&mut self.conn)
            .await?;

        Ok(id)
    }

    /// Consumer group ile batch okuma (blocking)
    pub async fn read_batch(
        &mut self,
        consumer_name: &str,
        count: usize,
        block_ms: usize,
    ) -> Result<Vec<(String, QueueMessage)>> {
        let opts = StreamReadOptions::default()
            .count(count)
            .block(block_ms)
            .group(CONSUMER_GROUP, consumer_name);

        let result: StreamReadReply =
            self.conn
                .xread_options(&[STREAM_KEY], &[">"], &opts)
                .await?;

        let mut messages = Vec::new();
        for stream in result.keys {
            for entry in stream.ids {
                let delivery_id = get_field(&entry, "delivery_id")?;
                let endpoint_id = get_field(&entry, "endpoint_id")?;
                let url = get_field(&entry, "url").unwrap_or_default();
                let payload = get_field(&entry, "payload").unwrap_or_default();
                let headers_str = get_field(&entry, "headers").unwrap_or_default();
                let trace_id = get_field(&entry, "trace_id").ok().filter(|s| !s.is_empty());
                let attempt = get_field(&entry, "attempt")
                    .unwrap_or("0".into())
                    .parse()
                    .unwrap_or(0);
                let max_attempts = get_field(&entry, "max_attempts")
                    .unwrap_or("5".into())
                    .parse()
                    .unwrap_or(5);

                let custom_headers = if headers_str.is_empty() {
                    None
                } else {
                    serde_json::from_str(&headers_str).ok()
                };

                messages.push((
                    entry.id.clone(),
                    QueueMessage {
                        delivery_id: Uuid::parse_str(&delivery_id)?,
                        endpoint_id: Uuid::parse_str(&endpoint_id)?,
                        endpoint_url: url,
                        payload,
                        custom_headers,
                        trace_id,
                        attempt_count: attempt,
                        max_attempts,
                    },
                ));
            }
        }

        Ok(messages)
    }

    /// Mesajı onayla (işlem tamamlandı)
    pub async fn ack(&mut self, stream_id: &str) -> Result<()> {
        redis::cmd("XACK")
            .arg(STREAM_KEY)
            .arg(CONSUMER_GROUP)
            .arg(stream_id)
            .query_async(&mut self.conn)
            .await?;
        Ok(())
    }

    /// Crash sonrası yarım kalan mesajları geri al (5 dk+ pending)
    pub async fn claim_pending(
        &mut self,
        consumer_name: &str,
    ) -> Result<Vec<(String, QueueMessage)>> {
        let result: (String, Vec<String>, Vec<redis::streams::StreamId>) =
            redis::cmd("XAUTOCLAIM")
                .arg(STREAM_KEY)
                .arg(CONSUMER_GROUP)
                .arg(consumer_name)
                .arg(300_000) // 5 dakika (ms)
                .arg("0-0")
                .query_async(&mut self.conn)
                .await?;

        let (_, _, entries) = result;
        let mut messages = Vec::new();
        for entry in entries {
            // Aynı parse logic
            if let Ok(delivery_id) = get_field(&entry, "delivery_id") {
                if let Ok(endpoint_id) = get_field(&entry, "endpoint_id") {
                    messages.push((
                        entry.id.clone(),
                        QueueMessage {
                            delivery_id: Uuid::parse_str(&delivery_id)?,
                            endpoint_id: Uuid::parse_str(&endpoint_id)?,
                            endpoint_url: get_field(&entry, "url").unwrap_or_default(),
                            payload: get_field(&entry, "payload").unwrap_or_default(),
                            custom_headers: get_field(&entry, "headers")
                                .ok()
                                .and_then(|s| serde_json::from_str(&s).ok()),
                            trace_id: get_field(&entry, "trace_id")
                                .ok()
                                .filter(|s| !s.is_empty()),
                            attempt_count: get_field(&entry, "attempt")
                                .unwrap_or("0".into())
                                .parse()
                                .unwrap_or(0),
                            max_attempts: get_field(&entry, "max_attempts")
                                .unwrap_or("5".into())
                                .parse()
                                .unwrap_or(5),
                        },
                    ));
                }
            }
        }

        Ok(messages)
    }

    /// Stream durumu (monitoring için)
    pub async fn stream_info(&mut self) -> Result<StreamInfo> {
        let info: redis::streams::StreamInfoReply =
            redis::cmd("XINFO").arg("STREAM").arg(STREAM_KEY).query_async(&mut self.conn).await?;
        
        Ok(StreamInfo {
            length: info.length,
            first_entry: info.first_entry.id,
            last_entry: info.last_entry.id,
        })
    }
}

pub struct StreamInfo {
    pub length: usize,
    pub first_entry: String,
    pub last_entry: String,
}

fn get_field(entry: &redis::streams::StreamId, field: &str) -> Result<String> {
    entry
        .get(field)
        .ok_or_else(|| anyhow::anyhow!("Missing field: {}", field))
}
```

### Adım 1.2: API Modül Kaydı

**Dosya:** `api/src/lib.rs` veya `api/src/main.rs`

```rust
mod queue;  // Yeni modül ekle
```

### Adım 1.3: API'de publish_to_queue Değişikliği

**Dosya:** `api/src/db.rs` — mevcut fonksiyonu değiştir

```rust
// Mevcut fonksiyonu koru, yeni parametre ekle
pub async fn publish_to_queue(
    pool: &PgPool,
    redis_queue: Option<&mut queue::RedisQueue>,  // YENİ: opsiyonel Redis
    delivery_id: uuid::Uuid,
    endpoint_id: uuid::Uuid,
    endpoint_url: &str,
    payload: &str,
    custom_headers: Option<&serde_json::Value>,
) -> Result<()> {
    let trace_id = crate::telemetry::current_trace_id();

    // 1. Redis Streams'a ekle (varsa, sub-millisecond)
    if let Some(redis) = redis_queue {
        let msg = queue::QueueMessage {
            delivery_id,
            endpoint_id,
            endpoint_url: endpoint_url.to_string(),
            payload: payload.to_string(),
            custom_headers: custom_headers.cloned(),
            trace_id: trace_id.clone(),
            attempt_count: 0,
            max_attempts: 5, // Varsayılan, endpoint'ten alınacak
        };
        redis.enqueue(&msg).await?;
        tracing::debug!("📤 Webhook {} queued to Redis", delivery_id);
    }

    // 2. PostgreSQL webhook_queue'a da ekle (backward compatibility)
    //    Bu satır migration döneminde aktif, sonra kaldırılacak
    sqlx::query(
        r#"
        INSERT INTO webhook_queue (delivery_id, endpoint_id, endpoint_url, payload, custom_headers, trace_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        "#,
    )
    .bind(delivery_id)
    .bind(endpoint_id)
    .bind(endpoint_url)
    .bind(payload)
    .bind(custom_headers)
    .bind(&trace_id)
    .execute(pool)
    .await?;

    Ok(())
}
```

### Adım 1.4: API'de Redis Queue Bağlantısı

**Dosya:** `api/src/main.rs` — startup'ta Redis bağla

```rust
// Mevcut Redis bağlantısını queue için de kullan
let redis_queue = if let Some(redis_url) = config::resolve_redis_url() {
    match queue::RedisQueue::new(&redis_url).await {
        Ok(q) => {
            tracing::info!("✅ Redis Streams queue active");
            Some(q)
        }
        Err(e) => {
            tracing::warn!("⚠️ Redis queue failed ({}), using PostgreSQL only", e);
            None
        }
    }
} else {
    tracing::info!("ℹ️ No REDIS_URL, using PostgreSQL queue only");
    None
};

// Redis queue'yu extension olarak ekle
app = app.layer(Extension(redis_queue));
```

### Adım 1.5: Worker'da Queue Değişikliği

**Dosya:** `worker/src/main.rs` — ana loop'u değiştir

```rust
// Mevcut: tokio::select! { listener.recv() + sleep(1s) }
// Yeni: Redis Streams blocking read

// Worker'da Redis queue oluştur
let mut redis_queue = if let Some(ref redis_url) = cfg.redis_url {
    match queue::RedisQueue::new(redis_url).await {
        Ok(q) => Some(q),
        Err(e) => {
            tracing::warn!("⚠️ Redis queue unavailable ({}), falling back to PostgreSQL", e);
            None
        }
    }
} else {
    None
};

// Consumer name (her worker instance unique olmalı)
let consumer_name = format!("worker-{}", std::process::id());

loop {
    tokio::select! {
        _ = &mut shutdown => {
            tracing::info!("🛑 Shutdown signal received");
            break;
        }

        // Redis queue varsa onu kullan
        result = async {
            if let Some(ref mut rq) = redis_queue {
                rq.read_batch(&consumer_name, 50, 100).await
            } else {
                // Fallback: PostgreSQL poll
                futures::future::pending().await
            }
        }, if redis_queue.is_some() => {
            match result {
                Ok(messages) => {
                    for (stream_id, msg) in messages {
                        // Her mesajı paralel işle
                        let pool = pool.clone();
                        let http_client = http_client.clone();
                        let semaphore = delivery_semaphore.clone();
                        let endpoint_sems = endpoint_semaphores.clone();
                        let cb = circuit_breaker.clone();
                        let tm = throttle_manager.clone();
                        let mut rq = redis_queue.clone();

                        tokio::spawn(async move {
                            process_queue_message(&pool, &http_client, &msg, semaphore, endpoint_sems, cb, tm).await;
                            // Başarılı olursa ack
                            if let Some(ref mut rq) = rq {
                                let _ = rq.ack(&stream_id).await;
                            }
                        });
                    }
                }
                Err(e) => {
                    tracing::error!("❌ Redis queue error: {:?}", e);
                    tokio::time::sleep(Duration::from_millis(100)).await;
                }
            }
        }

        // Fallback: PostgreSQL poll (Redis yoksa)
        _ = tokio::time::sleep(Duration::from_secs(1)), if redis_queue.is_none() => {
            match process_pending(&pool, &http_client, &cfg, delivery_semaphore.clone(), endpoint_semaphores.clone(), circuit_breaker.clone(), throttle_manager.clone()).await {
                Ok(count) => {
                    if count > 0 {
                        tracing::debug!("✅ Processed {} deliveries (PG fallback)", count);
                    }
                }
                Err(e) => tracing::error!("❌ PG queue error: {:?}", e),
            }
        }

        // Zombie reaper (her iki mod için de gerekli)
        _ = reaper_interval.tick() => {
            // Mevcut zombie reaper logic
        }
    }
}
```

### Adım 1.6: Signing Secret Cache

**Problem:** Mevcut `process_pending` her batch'te signing secret için DB sorgusu yapıyor. Redis queue'da bu gerekli.

**Çözüm:** Signing secret'ları Redis'te cache'le (5 dakika TTL).

```rust
// worker/src/secret_cache.rs (YENİ)
use std::collections::HashMap;
use std::time::{Duration, Instant};

pub struct SecretCache {
    entries: HashMap<uuid::Uuid, CacheEntry>,
    ttl: Duration,
}

struct CacheEntry {
    secret: String,
    cached_at: Instant,
}

impl SecretCache {
    pub fn new(ttl: Duration) -> Self {
        Self {
            entries: HashMap::new(),
            ttl,
        }
    }

    pub fn get(&self, endpoint_id: &uuid::Uuid) -> Option<&str> {
        self.entries.get(endpoint_id).and_then(|entry| {
            if entry.cached_at.elapsed() < self.ttl {
                Some(entry.secret.as_str())
            } else {
                None
            }
        })
    }

    pub fn insert(&mut self, endpoint_id: uuid::Uuid, secret: String) {
        self.entries.insert(endpoint_id, CacheEntry {
            secret,
            cached_at: Instant::now(),
        });
    }

    pub fn cleanup(&mut self) {
        self.entries.retain(|_, entry| entry.cached_at.elapsed() < self.ttl);
    }
}
```

### Adım 1.7: process_queue_message Fonksiyonu

**Dosya:** `worker/src/main.rs`

```rust
/// Redis queue'dan gelen mesajı işle
async fn process_queue_message(
    pool: &PgPool,
    http_client: &reqwest::Client,
    msg: &QueueMessage,
    semaphore: Arc<Semaphore>,
    endpoint_semaphores: Arc<Mutex<HashMap<Uuid, Arc<Semaphore>>>>,
    circuit_breaker: CircuitBreaker,
    throttle_manager: ThrottleManager,
) {
    // 1. Circuit breaker kontrolü
    if circuit_breaker.is_open(msg.endpoint_id).await {
        tracing::warn!("⚡ Circuit open for endpoint {}", msg.endpoint_id);
        // Re-queue with delay (Redis'te ayrı bir retry queue'ya taşı)
        return;
    }

    // 2. Throttle kontrolü
    if let Err(wait) = throttle_manager.check_allowed(msg.endpoint_id).await {
        tracing::warn!("🚦 Throttled for endpoint {}: {:?}", msg.endpoint_id, wait);
        // Re-queue with delay
        return;
    }

    // 3. FIFO kontrolü
    if !fifo::should_deliver_fifo(pool, msg.endpoint_id).await.unwrap_or(true) {
        tracing::debug!("📦 FIFO: waiting for endpoint {}", msg.endpoint_id);
        // Re-queue
        return;
    }

    // 4. Signing secret (cache'ten veya DB'den)
    let signing_secret = get_signing_secret(pool, msg.endpoint_id).await;

    // 5. Per-endpoint concurrency
    let endpoint_sem = {
        let mut map = endpoint_semaphores.lock().await;
        map.entry(msg.endpoint_id).or_insert_with(|| {
            Arc::new(Semaphore::new(PER_ENDPOINT_CONCURRENCY_LIMIT))
        }).clone()
    };
    let _endpoint_permit = endpoint_sem.acquire().await;

    // 6. Global concurrency
    let _permit = semaphore.acquire().await;

    // 7. HTTP teslimat
    let webhook = WebhookMessage {
        delivery_id: msg.delivery_id,
        endpoint_id: msg.endpoint_id,
        endpoint_url: msg.endpoint_url.clone(),
        payload: msg.payload.clone(),
        signing_secret,
        custom_headers: msg.custom_headers.clone(),
        trace_id: msg.trace_id.clone(),
    };

    let start = Instant::now();
    let result = delivery::deliver_http(http_client, &webhook, msg.attempt_count + 1).await;
    let duration = start.elapsed();

    // 8. Sonucu işle
    match result {
        Ok(delivery_result) => {
            if delivery_result.success {
                // Başarılı
                commit_delivery(pool, msg.delivery_id, &delivery_result, duration).await;
                circuit_breaker.record_success(msg.endpoint_id).await;
                throttle_manager.record_success(msg.endpoint_id).await;
            } else if is_retryable(delivery_result.status_code) {
                // Retry
                schedule_retry(pool, msg, &delivery_result, duration).await;
                circuit_breaker.record_failure(msg.endpoint_id).await;
                throttle_manager.record_attempt(msg.endpoint_id).await;
            } else {
                // Kalıcı hata → DLQ
                mark_failed(pool, msg.delivery_id, &delivery_result, duration).await;
                circuit_breaker.record_failure(msg.endpoint_id).await;
            }
        }
        Err(e) => {
            // Bağlantı hatası → retry
            tracing::error!("❌ Delivery error: {:?}", e);
            schedule_retry_error(pool, msg, &e, duration).await;
            circuit_breaker.record_failure(msg.endpoint_id).await;
            throttle_manager.record_attempt(msg.endpoint_id).await;
        }
    }
}
```

### Adım 1.8: Grafana Metrikleri

```rust
// worker/src/metrics.rs — yeni metrikler
pub static QUEUE_TYPE: AtomicU8 = AtomicU8::new(0); // 0=PG, 1=Redis
pub static REDIS_QUEUE_LATENCY_US: AtomicU64 = AtomicU64::new(0);
pub static REDIS_QUEUE_ERRORS: AtomicU64 = AtomicU64::new(0);
pub static PG_QUEUE_FALLBACK: AtomicU64 = AtomicU64::new(0);
```

### Adım 1.9: Geçiş Stratejisi (GÜNCELLENMİŞ)

```
Aşama 1 (Gün 1):
  - Cargo.toml: streams feature ekle
  - api/src/queue.rs oluştur
  - worker/src/queue.rs oluştur
  - worker/src/secret_cache.rs oluştur
  - cargo check → 0 hata

Aşama 2 (Gün 2):
  - API: publish_to_queue'ya Redis parametresi ekle
  - API: Redis queue'yu extension olarak ekle
  - Her iki kuyruğa da yaz (PG + Redis paralel)
  - Worker: PostgreSQL'den okumaya devam et
  - Deploy et, test et

Aşama 3 (Gün 3):
  - Worker: Redis'ten okumaya geç (feature flag: USE_REDIS_QUEUE=true)
  - PostgreSQL fallback kalsın (Redis yoksa PG kullan)
  - Deploy et, Grafana'da latency karşılaştır

Aşama 4 (Gün 4):
  - Worker: Redis queue stabil ise PG queue okumayı kapat
  - API: PG webhook_queue INSERT'ini kaldır (opsiyonel)
  - webhook_queue tablosunu temizle (opsiyonel)
```

### Doğrulama Checklist
- [ ] `cargo check` — 0 hata
- [ ] `cargo test` — tüm testler geçmeli
- [ ] Grafana: İlk tetikleme süresi < 10ms
- [ ] Grafana: Queue latency metric mevcut
- [ ] Grafana: Redis queue errors = 0
- [ ] Grafana: PG fallback count = 0 (stabil olduktan sonra)
- [ ] Manuel test: Webhook gönder → anında teslimat
- [ ] Manuel test: Redis down → PG fallback çalışıyor
- [ ] Manuel test: Worker restart → pending mesajlar geri alınır (XAUTOCLAIM)

---

## Faz 2: HTTP/2 + Connection Pooling 🟡 YÜKSEK

**Süre:** 1 oturum
**Etki:** Connection setup ~50ms → ~0ms
**Risk:** Düşük

### Adım 2.1: HTTP Client İyileştirmesi

**Dosya:** `worker/src/main.rs`

```rust
let http_client = reqwest::Client::builder()
    .timeout(Duration::from_secs(5))
    .connect_timeout(Duration::from_secs(2))
    .pool_max_idle_per_host(100)                    // 30 → 100
    .pool_idle_timeout(Duration::from_secs(300))    // Varsayılan → 300s
    .tcp_keepalive(Duration::from_secs(300))        // 60s → 300s
    .tcp_nodelay(true)
    .http2_prior_knowledge(true)                    // HTTP/2 zorla (H2C)
    .http2_adaptive_window(true)                    // Adaptive flow control
    .http2_keep_alive_interval(Duration::from_secs(30))
    .http2_keep_alive_timeout(Duration::from_secs(10))
    .build()?;
```

### Not: HTTP/2 ve TLS
- `http2_prior_knowledge(true)` = H2C (HTTP/2 without TLS) — Cloud Run'da çalışır
- HTTPS endpoint'ler için: `http2_prior_knowledge(false)` + otomatik TLS negotiation
- **Çözüm:** İki client oluştur — biri H2C (iç servisler), biri HTTPS (müşteri endpoint'leri)

```rust
// İç servisler için H2C
let internal_client = reqwest::Client::builder()
    .http2_prior_knowledge(true)
    // ...
    .build()?;

// Müşteri endpoint'leri için HTTPS (otomatik HTTP/2 negotiation)
let external_client = reqwest::Client::builder()
    .http2_adaptive_window(true)
    // ...
    .build()?;
```

### Doğrulama
- [ ] `cargo check` — 0 hata
- [ ] Grafana: Connection reuse oranı > %90
- [ ] Grafana: Connection setup süresi ~0ms

---

## Faz 3: 3 Katmanlı Retry 🟡 YÜKSEK

**Süre:** 1-2 oturum
**Etki:** Geçici hatalarda 30s → 100ms
**Risk:** Düşük

### Adım 3.1: Error Sınıflandırma

**Dosya:** `worker/src/helpers.rs`

```rust
#[derive(Debug, Clone, PartialEq)]
pub enum RetryCategory {
    Transient,      // Bağlantı, DNS, timeout
    ServerError,    // 5xx
    RateLimited,    // 429
    Permanent,      // 4xx (429 hariç)
    EndpointDown,   // Circuit breaker açık
}

pub fn classify_error(status: Option<i32>, error: &str, is_circuit_open: bool) -> RetryCategory {
    if is_circuit_open {
        return RetryCategory::EndpointDown;
    }
    match status {
        Some(429) => RetryCategory::RateLimited,
        Some(400..=499) => RetryCategory::Permanent,
        Some(500..=599) => RetryCategory::ServerError,
        None => {
            let e = error.to_lowercase();
            if e.contains("connection") || e.contains("dns") || e.contains("timeout") {
                RetryCategory::Transient
            } else {
                RetryCategory::ServerError
            }
        }
        _ => RetryCategory::ServerError,
    }
}
```

### Adım 3.2: Katmanlı Backoff + Jitter

```rust
pub fn calculate_backoff(attempt: i32, category: &RetryCategory, retry_after: Option<u64>) -> Duration {
    let base = match category {
        RetryCategory::Transient => match attempt {
            0 => Duration::from_millis(100),
            1 => Duration::from_millis(300),
            2 => Duration::from_millis(500),
            _ => tier_2_backoff(attempt - 3),
        },
        RetryCategory::ServerError => tier_2_backoff(attempt),
        RetryCategory::RateLimited => Duration::from_secs(retry_after.unwrap_or(60).min(3600)),
        RetryCategory::EndpointDown => tier_3_backoff(attempt),
        RetryCategory::Permanent => Duration::ZERO,
    };
    with_jitter(base)
}

fn tier_2_backoff(attempt: i32) -> Duration {
    let intervals = [60, 300, 900, 3600, 14400];
    Duration::from_secs(intervals[(attempt as usize).min(intervals.len() - 1)])
}

fn tier_3_backoff(attempt: i32) -> Duration {
    let intervals = [21600, 43200, 86400];
    Duration::from_secs(intervals[(attempt as usize).min(intervals.len() - 1)])
}

fn with_jitter(duration: Duration) -> Duration {
    use rand::Rng;
    let jitter = rand::thread_rng().gen_range(0.8..1.2);
    Duration::from_millis((duration.as_millis() as f64 * jitter) as u64)
}

pub fn max_attempts_for_category(category: &RetryCategory) -> i32 {
    match category {
        RetryCategory::Transient => 5,
        RetryCategory::ServerError => 5,
        RetryCategory::RateLimited => 3,
        RetryCategory::EndpointDown => 12,
        RetryCategory::Permanent => 0,
    }
}
```

### Doğrulama
- [ ] `cargo check` — 0 hata
- [ ] Grafana: Transient retry < 1s
- [ ] Grafana: Permanent → no retry

---

## Faz 4: DNS + SSRF Cache 🟢 KOLAY

**Süre:** 1 oturum
**Etki:** ~30ms/call → ~0ms
**Risk:** Çok düşük

### Not: Mevcut SSRF
- `api/src/ssrf.rs` zaten SSRF koruması yapıyor
- `worker/src/delivery/http.rs`'de `validate_delivery_url` fonksiyonu var
- Bu faz sadece **cache** ekliyor

### Doğrulama
- [ ] Grafana: DNS cache hit > %90

---

## Faz 5: Dynamic Concurrency 🟢 KOLAY

**Süre:** 1 oturum
**Etki:** Hızlı endpoint'lerde %100 throughput

### Not: Mevcut Concurrency
- `DELIVERY_CONCURRENCY_LIMIT: 50` (global)
- `PER_ENDPOINT_CONCURRENCY_LIMIT: 10` (sabit)
- Bu faz sadece per-endpoint limiti dinamik yapıyor

### Doğrulama
- [ ] Grafana: Hızlı endpoint throughput artışı

---

## Faz 6: Batch Processing 🟢 ORTA

**Süre:** 2 oturum
**Etki:** Yüksek throughput'ta %30-50

### Not: Redis Streams zaten batch okuyor
- `XREADGROUP count=50` zaten batch
- Bu faz: aynı endpoint'e giden webhook'ları grupla, paralel gönder

### Doğrulama
- [ ] Grafana: Throughput artışı

---

## 📊 Zaman Çizelgesi

| Faz | Süre | Durum |
|-----|------|-------|
| 1. Redis Streams | 2-3 oturum | ⏳ |
| 2. HTTP/2 | 1 oturum | ⏳ |
| 3. 3 Katmanlı Retry | 1-2 oturum | ⏳ |
| 4. DNS Cache | 1 oturum | ⏳ |
| 5. Dynamic Concurrency | 1 oturum | ⏳ |
| 6. Batch Processing | 2 oturum | ⏳ |
| **TOPLAM** | **~10-12 oturum** | |

---

## ⚠️ Kritik Kurallar

1. **Her fazda `cargo check` + `cargo test`** — 0 hata olmadan devam etme
2. **Her fazda Grafana metric ekle** — performansı ölç
3. **Paralel çalıştır** — yeni queue eskiyle birlikte çalışabilmeli
4. **Rollback planı** — her faz geri alınabilmeli
5. **Commit her faz sonunda** — hata olursa geri almak kolay
6. **Signing secret cache** — her teslimatta DB sorgusu yapma
7. **Consumer name unique** — her worker instance farklı isim
8. **XAUTOCLAIM** — crash sonrası pending mesajları geri al
9. **HTTP/2 TLS** — müşteri endpoint'leri HTTPS gerektirir
10. **Backward compatibility** — PG queue fallback her zaman kalsın

---

*Bu plan v2 — gözden geçirilmiş, eksikler giderilmiştir.*
*Son güncelleme: 2026-05-26*
