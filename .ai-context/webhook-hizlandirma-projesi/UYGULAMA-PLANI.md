# 🚀 Webhook Hızlandırma — Aşamalı Uygulama Planı

> **Başlangıç:** 2026-05-26
> **Hedef:** HookSniff webhook teslimatını sektörün en hızlısı yapmak
> **Mevcut:** ~1000ms ilk tetikleme → **Hedef: < 10ms**
> **Ek Maliyet:** $0 (Upstash free tier)
> **Bu dosya:** Tüm plan, tezler, örnekler tek belgede

---

## 📖 İçindekiler

1. [Mevcut Sistem & Darboğazlar](#1-mevcut-sistem--darboğazlar)
2. [Sektör Karşılaştırması & Tezler](#2-sektör-karşılaştırması--tezler)
3. [Faz 1: Redis Streams Queue](#3-faz-1-redis-streams-queue)
4. [Faz 1 Ek: Production Konfigürasyonu](#4-faz-1-ek-production-konfigürasyonu)
5. [Faz 2: HTTP/2 + Connection Pooling](#5-faz-2-http2--connection-pooling)
6. [Faz 3: 3 Katmanlı Retry Stratejisi](#6-faz-3-3-katmanlı-retry-stratejisi)
7. [Faz 4: DNS + SSRF Cache](#7-faz-4-dns--ssrf-cache)
8. [Faz 5: Dynamic Concurrency](#8-faz-5-dynamic-concurrency)
9. [Faz 6: Batch Processing](#9-faz-6-batch-processing)
10. [Grafana Metrikleri & Monitoring](#10-grafana-metrikleri--monitoring)
11. [Test & Doğrulama](#11-test--doğrulama)
12. [Rollback Planı](#12-rollback-planı)
13. [Zaman Çizelgesi](#13-zaman-çizelgesi)

---

## 1. Mevcut Sistem & Darboğazlar

### Mevcut Akış

```
Müşteri API İsteği
    │
    ▼
┌─────────────────────────────┐
│  API (Rust/Axum, port 3000) │
│  ├─ JWT/API Key doğrulama   │
│  ├─ Rate limit kontrolü     │
│  ├─ İndempotency check      │
│  ├─ Content deduplication   │
│  ├─ Payload doğrulama       │
│  ├─ Plan limiti kontrolü    │
│  └─ DB kayıt (pending)      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  PostgreSQL webhook_queue   │  ← DARBOĞAZ #1
│  ├─ INSERT                  │
│  └─ NOTIFY 'new_webhook'    │  ← ~10ms trigger
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Worker (Rust)              │
│  ├─ LISTEN/NOTIFY           │  ← Anlık tetikleme
│  ├─ 1s fallback poll        │  ← DARBOĞAZ #2
│  ├─ FOR UPDATE SKIP LOCKED  │
│  ├─ FIFO / CB / Throttle    │
│  └─ HTTP POST               │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Hedef Endpoint             │
│  ├─ HTTP/1.1 POST           │  ← DARBOĞAZ #3
│  ├─ HMAC-SHA256 signature   │
│  └─ 5s timeout              │
└─────────────────────────────┘
```

### Tespit Edilen Darboğazlar

| # | Darboğaz | Etki | Öncelik |
|---|----------|------|---------|
| 1 | PostgreSQL kuyruk (NOTIFY + 1s poll) | 0-1000ms gecikme | 🔴 Kritik |
| 2 | 1s fallback poll (kaçan NOTIFY) | Kaçan NOTIFY'da 1s gecikme | 🔴 Kritik |
| 3 | HTTP/1.1 connection setup | ~50-100ms/connection | 🟡 Yüksek |
| 4 | Tek retry stratejisi (30s başlangıç) | Geçici hatalarda 30s+ | 🟡 Yüksek |
| 5 | DNS çözümleme her istekte | ~10-50ms/call | 🟡 Yüksek |
| 6 | Static concurrency limit (10) | Hızlı/yavaş endpoint eşit | 🟢 Orta |
| 7 | SSRF kontrolü her istekte | ~5-20ms/call | 🟢 Orta |

### Mevcut Kod Referansları (Doğrulanmış)

| Bileşen | Dosya | Mevcut Durum |
|---------|-------|-------------|
| Redis dep. | `api/Cargo.toml` | `redis = { version = "1", features = [...] }` — `streams` EKSİK |
| Redis dep. | `worker/Cargo.toml` | Aynı — `streams` EKSİK |
| WebhookMessage | `worker/src/types.rs` | `delivery_id: String, endpoint_id: String` |
| publish_to_queue | `api/src/db.rs:163` | `(pool, delivery_id, endpoint_id, url, payload, headers)` |
| process_pending | `worker/src/main.rs:463` | PG `FOR UPDATE SKIP LOCKED` ile 50 item batch |
| Circuit breaker | `worker/src/circuit_breaker.rs` | `allow_request(endpoint_id) → bool` |
| Throttle | `worker/src/throttle.rs` | `check_allowed(endpoint_id) → Result<(), Duration>` |
| FIFO | `worker/src/fifo.rs` | `should_deliver_fifo(pool, endpoint_id) → Result<bool>` |
| deliver_http | `worker/src/delivery/http.rs` | `(http_client, webhook, attempt) → Result<DeliveryResult>` |
| ConnectionManager | `redis` crate v1.2.1 | `impl Clone` ✅ |
| Signing secret | `process_pending` | Batch: `SELECT id, signing_secret FROM endpoints WHERE id = ANY($1)` |

---

## 2. Sektör Karşılaştırması & Tezler

### Rakip Analizi

| Platform | İlk Tetikleme | Queue Sistemi | Retry | Dil | Açık Kaynak |
|----------|---------------|---------------|-------|-----|-------------|
| **Stripe** | < 1s | Özel queue | 3 gün, exponential | Java/Go | ❌ |
| **Svix** | < 10ms | **Redis Streams** | Exponential | **Rust** | ✅ |
| **Hookdeck** | < 100ms | Redis/RabbitMQ | **3 katmanlı** | Go | ❌ |
| **Inngest** | < 50ms | Redis+PG hibrit | Exponential | Go | ✅ |
| **HookSniff (mevcut)** | 0-1000ms | PostgreSQL | Exponential | Rust | ✅ |
| **HookSniff (hedef)** | **< 10ms** | **Redis Streams** | **3 katmanlı** | **Rust** | ✅ |

### Tez 1: Neden Redis Streams?

**Svix'in kullandığı yöntem.** Açık kaynak, Rust ile yazılmış, < 10ms tetikleme.

| Özellik | PostgreSQL NOTIFY | Redis Streams |
|---------|-------------------|---------------|
| Tetikleme hızı | ~10ms (trigger) | < 1ms (XADD) |
| Kaçırma riski | Var (1s poll fallback) | Yok (blocking read) |
| Consumer groups | Yok (SKIP LOCKED) | Var (otomatik load balancing) |
| Persistence | Zaten var | AOF persistence |
| Crash recovery | Zaten var | XAUTOCLAIM |
| Ek altyapı gerekli | Hayır | Hayır (Upstash zaten var) |

**Sonuç:** Redis Streams, PostgreSQL'den 10x daha hızlı queue sağlar. Mevcut Upstash Redis zaten kurulu — ek maliyet yok.

### Tez 2: Neden 3 Katmanlı Retry?

**Hookdeck modeli.** 100+ milyar webhook işlemiş şirket.

| Durum | Mevcut (Exponential) | 3 Katmanlı |
|-------|---------------------|------------|
| Geçici bağlantı hatası | 30s bekle | **100ms** → 300ms → 500ms |
| 5xx sunucu hatası | 30s başlangıç | 1dk → 5dk → 15dk → 1sa → 4sa |
| Uzun süreli kesinti | Max 5 deneme | 6sa → 12sa → 24sa (3 gün) |
| 4xx kalıcı hata | Retry (boşuna) | **Direkt DLQ** |

**Sonuç:** Geçici hatalarda 30s → 100ms. Kalıcı hatalarda boşuna retry yok.

### Tez 3: Neden HTTP/2?

| Metrik | HTTP/1.1 | HTTP/2 |
|--------|----------|--------|
| Bağlantı başına stream | 1 | 100+ (multiplexing) |
| Connection setup | ~50-100ms | ~0ms (reuse) |
| 10 webhook, aynı endpoint | 10 bağlantı × 50ms = 500ms | 1 bağlantı × 50ms = 50ms |

**Sonuç:** Aynı endpoint'e giden webhook'larda %90 daha az bağlantı overhead.

### Tez 4: Neden Upstash Free Tier Yeterli?

Upstash free tier (Mart 2025): **500K komut/ay, 256 MB, 10 GB bant genişliği.

Her webhook = ~3 Redis komutu (XADD + XREADGROUP + XACK):

| Webhook/ay | Redis Komutu | Free Tier | Maliyet |
|------------|-------------|-----------|---------|
| 5,000 | 15,000 | ✅ Yeterli | $0 |
| 50,000 | 150,000 | ❌ Aşar | ~$0.30/ay |
| 500,000 | 1,500,000 | ❌ Aşar | ~$3/ay |

**Mevcut HookSniff:** ~2-5K webhook/ay → Free tier kesinlikle yeterli.

### Tez 5: Neden QStash veya NATS Değil?

| Alternatif | Neden Uygun Değil |
|-----------|-------------------|
| **Upstash QStash** | Daha pahalı ($1/100K vs $0.20/100K), daha yavaş (~10-50ms vs < 1ms), free tier çok düşük (1K msg/gün) |
| **NATS JetStream** | Ek servis gerektirir (ek maliyet + karmaşıklık), performans farkı minimal |
| **PG Outbox Pattern** | Hâlâ PG polling → Redis kadar hızlı değil, ek tablo + trigger + cron gerekir |

**Sonuç:** Redis Streams en iyi fiyat/performans oranı. Zaten kurulu.

---

## 3. Faz 1: Redis Streams Queue

> **Süre:** 2-3 oturum | **Etki:** 1000ms → < 10ms | **Risk:** Orta (PG fallback ile paralel)

### 3.1 Cargo.toml Değişiklikleri

```toml
# api/Cargo.toml — "streams" feature ekle
redis = { version = "1", default-features = false, features = [
    "tokio-rustls-comp",
    "connection-manager",
    "script",
    "streams"          # ← YENİ
] }

# worker/Cargo.toml — "streams" feature ekle
redis = { version = "1", default-features = false, features = [
    "tokio-rustls-comp",
    "connection-manager",
    "streams"          # ← YENİ
] }
```

### 3.2 api/src/queue.rs (YENİ DOSYA)

```rust
use anyhow::Result;
use redis::aio::ConnectionManager;
use redis::streams::{StreamReadOptions, StreamReadReply};
use uuid::Uuid;

const STREAM_KEY: &str = "hooksniff:webhooks";
const CONSUMER_GROUP: &str = "hooksniff-workers";
const MAX_STREAM_LEN: usize = 100_000;

#[derive(Debug, Clone)]  // ← Clone gerekli (tokio::spawn için)
pub struct RedisQueue {
    conn: ConnectionManager,  // redis crate: impl Clone ✅
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct QueueMessage {
    pub delivery_id: String,    // String — WebhookMessage ile uyumlu
    pub endpoint_id: String,    // String — WebhookMessage ile uyumlu
    pub endpoint_url: String,
    pub payload: String,
    pub custom_headers: Option<serde_json::Value>,
    pub signing_secret: String, // Worker cache'ten alacak
    pub trace_id: Option<String>,
    pub attempt_count: i32,
    pub max_attempts: i32,
    pub queue_item_id: String,  // webhook_queue.id (PG uyumluluk)
}

impl RedisQueue {
    /// Yeni bağlantı + consumer group oluştur (yoksa)
    pub async fn new(redis_url: &str) -> Result<Self> {
        let client = redis::Client::open(redis_url)?;
        let mut conn = ConnectionManager::new(client).await?;

        // Consumer group oluştur (idempotent — varsa BUSYGROUP hatası yutulur)
        let _: Result<(), _> = redis::cmd("XGROUP")
            .arg("CREATE").arg(STREAM_KEY).arg(CONSUMER_GROUP)
            .arg("0").arg("MKSTREAM")
            .query_async(&mut conn).await;

        tracing::info!("✅ Redis Streams queue active — stream={}, group={}",
            STREAM_KEY, CONSUMER_GROUP);
        Ok(Self { conn })
    }

    /// Kuyruğa mesaj ekle (sub-millisecond)
    pub async fn enqueue(&mut self, msg: &QueueMessage) -> Result<String> {
        let headers_str = msg.custom_headers.as_ref()
            .map(|h| serde_json::to_string(h).unwrap_or_default())
            .unwrap_or_default();

        let id: String = redis::cmd("XADD")
            .arg(STREAM_KEY)
            .arg("MAXLEN").arg("~").arg(MAX_STREAM_LEN)  // Otomatik trim
            .arg("*")
            .arg("delivery_id").arg(&msg.delivery_id)
            .arg("endpoint_id").arg(&msg.endpoint_id)
            .arg("url").arg(&msg.endpoint_url)
            .arg("payload").arg(&msg.payload)
            .arg("headers").arg(&headers_str)
            .arg("signing_secret").arg(&msg.signing_secret)
            .arg("trace_id").arg(msg.trace_id.as_deref().unwrap_or(""))
            .arg("attempt").arg(msg.attempt_count.to_string())
            .arg("max_attempts").arg(msg.max_attempts.to_string())
            .arg("queue_item_id").arg(&msg.queue_item_id)
            .query_async(&mut self.conn).await?;

        Ok(id)
    }

    /// Consumer group ile batch okuma (blocking — sub-millisecond wake)
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

        let result: StreamReadReply = self.conn
            .xread_options(&[STREAM_KEY], &[">"], &opts).await?;

        let mut messages = Vec::new();
        for stream in result.keys {
            for entry in stream.ids {
                messages.push((entry.id.clone(), parse_entry(&entry)?));
            }
        }
        Ok(messages)
    }

    /// Mesajı onayla (işlem tamamlandı)
    pub async fn ack(&mut self, stream_id: &str) -> Result<()> {
        redis::cmd("XACK")
            .arg(STREAM_KEY).arg(CONSUMER_GROUP).arg(stream_id)
            .query_async(&mut self.conn).await?;
        Ok(())
    }

    /// Crash recovery — 5 dk+ pending mesajları geri al
    pub async fn claim_pending(
        &mut self,
        consumer_name: &str,
    ) -> Result<Vec<(String, QueueMessage)>> {
        let result: (String, Vec<String>, Vec<redis::streams::StreamId>) =
            redis::cmd("XAUTOCLAIM")
                .arg(STREAM_KEY).arg(CONSUMER_GROUP).arg(consumer_name)
                .arg(300_000).arg("0-0")  // 5 dakika timeout
                .query_async(&mut self.conn).await?;

        let (_, _, entries) = result;
        entries.into_iter()
            .map(|e| Ok((e.id.clone(), parse_entry(&e)?)))
            .collect()
    }
}

fn get_field(entry: &redis::streams::StreamId, field: &str) -> Result<String> {
    entry.get(field)
        .ok_or_else(|| anyhow::anyhow!("Missing field: {}", field))
}

fn parse_entry(entry: &redis::streams::StreamId) -> Result<QueueMessage> {
    Ok(QueueMessage {
        delivery_id: get_field(entry, "delivery_id")?,
        endpoint_id: get_field(entry, "endpoint_id")?,
        endpoint_url: get_field(entry, "url").unwrap_or_default(),
        payload: get_field(entry, "payload").unwrap_or_default(),
        custom_headers: get_field(entry, "headers").ok()
            .and_then(|s| serde_json::from_str(&s).ok()),
        signing_secret: get_field(entry, "signing_secret").unwrap_or_default(),
        trace_id: get_field(entry, "trace_id").ok().filter(|s| !s.is_empty()),
        attempt_count: get_field(entry, "attempt").unwrap_or("0".into()).parse().unwrap_or(0),
        max_attempts: get_field(entry, "max_attempts").unwrap_or("5".into()).parse().unwrap_or(5),
        queue_item_id: get_field(entry, "queue_item_id").unwrap_or_default(),
    })
}
```

### 3.3 api/src/main.rs — Modül + Redis Bağlantısı

```rust
mod queue; // Yeni modül

// Startup'ta Redis queue oluştur
let redis_queue = config::resolve_redis_url()
    .and_then(|url| {
        futures::executor::block_on(queue::RedisQueue::new(&url)).ok()
    });

if redis_queue.is_some() {
    tracing::info!("✅ Redis Streams queue active");
} else {
    tracing::warn!("⚠️ Redis unavailable — using PostgreSQL queue fallback");
}

app = app.layer(Extension(redis_queue));
```

### 3.4 api/src/db.rs — publish_to_queue (Redis-first + PG fallback)

```rust
pub async fn publish_to_queue(
    pool: &PgPool,
    redis_queue: Option<&mut queue::RedisQueue>,
    delivery_id: uuid::Uuid,
    endpoint_id: uuid::Uuid,
    endpoint_url: &str,
    payload: &str,
    custom_headers: Option<&serde_json::Value>,
) -> Result<()> {
    let trace_id = crate::telemetry::current_trace_id();

    // ── 1. Redis'e yaz (asıl kuyruk — hızlı) ──
    if let Some(redis) = redis_queue {
        let msg = queue::QueueMessage {
            delivery_id: delivery_id.to_string(),
            endpoint_id: endpoint_id.to_string(),
            endpoint_url: endpoint_url.to_string(),
            payload: payload.to_string(),
            custom_headers: custom_headers.cloned(),
            signing_secret: String::new(), // Worker cache'ten alacak
            trace_id: trace_id.clone(),
            attempt_count: 0,
            max_attempts: 5,
            queue_item_id: String::new(),
        };

        match redis.enqueue(&msg).await {
            Ok(_) => {
                tracing::debug!("📤 Webhook {} queued to Redis", delivery_id);
                return Ok(()); // Redis başarılı → PG'ye gerek yok
            }
            Err(e) => {
                tracing::warn!("⚠️ Redis enqueue failed ({}), falling back to PG", e);
                // Redis başarısız → PG'ye yaz (fallback)
            }
        }
    }

    // ── 2. PostgreSQL fallback ──
    sqlx::query(
        "INSERT INTO webhook_queue (delivery_id, endpoint_id, endpoint_url, payload, custom_headers, trace_id)
         VALUES ($1, $2, $3, $4, $5, $6)"
    )
    .bind(delivery_id).bind(endpoint_id).bind(endpoint_url)
    .bind(payload).bind(custom_headers).bind(&trace_id)
    .execute(pool).await?;

    Ok(())
}
```

### 3.5 worker/src/queue.rs (YENİ DOSYA — api'deki ile aynı)

`common/` klasörüne taşımayı düşün, ama şimdilik api/src/queue.rs'nin kopyası. Veya `common/src/queue.rs` yap:

```rust
// common/src/queue.rs — her iki taraf da kullanır
// (api ve worker Cargo.toml'da common dependency olarak ekler)
```

### 3.6 worker/src/secret_cache.rs (YENİ DOSYA)

```rust
use std::collections::HashMap;
use std::time::{Duration, Instant};

/// Signing secret in-memory cache (5 dk TTL)
/// Her webhook'ta DB sorgusu yerine cache'ten alır
pub struct SecretCache {
    entries: HashMap<String, (String, Instant)>,
    ttl: Duration,
}

impl SecretCache {
    pub fn new(ttl: Duration) -> Self {
        Self { entries: HashMap::new(), ttl }
    }

    pub fn get(&self, endpoint_id: &str) -> Option<&str> {
        self.entries.get(endpoint_id).and_then(|(secret, cached_at)| {
            if cached_at.elapsed() < self.ttl {
                Some(secret.as_str())
            } else {
                None
            }
        })
    }

    pub fn insert(&mut self, endpoint_id: String, secret: String) {
        self.entries.insert(endpoint_id, (secret, Instant::now()));
    }

    /// Periyodik temizleme (her 5 dk'da bir çağır)
    pub fn cleanup(&mut self) {
        self.entries.retain(|_, (_, cached_at)| cached_at.elapsed() < self.ttl);
    }
}
```

### 3.7 worker/src/main.rs — Ana Loop Değişikliği

```rust
mod queue;
mod secret_cache;

// ── Startup ──
let mut redis_queue = cfg.redis_url.as_deref().and_then(|url| {
    futures::executor::block_on(queue::RedisQueue::new(url)).ok()
});

let consumer_name = format!("worker-{}", std::process::id());
let signing_cache = Arc::new(Mutex::new(
    secret_cache::SecretCache::new(Duration::from_secs(300))
));

// ── Crash recovery ──
if let Some(ref mut rq) = redis_queue {
    match rq.claim_pending(&consumer_name).await {
        Ok(recovered) if !recovered.is_empty() => {
            tracing::warn!("🔄 Recovered {} pending messages", recovered.len());
            for (stream_id, msg) in recovered {
                process_queue_message(&pool, &http_client, &msg,
                    delivery_semaphore.clone(), endpoint_semaphores.clone(),
                    circuit_breaker.clone(), throttle_manager.clone(),
                    signing_cache.clone()).await;
                let _ = rq.ack(&stream_id).await;
            }
        }
        Err(e) => tracing::warn!("⚠️ Claim pending failed: {:?}", e),
        _ => {}
    }
}

// ── Ana loop ──
loop {
    tokio::select! {
        _ = &mut shutdown => { break; }

        // Redis queue (asıl — blocking read)
        result = async {
            if let Some(ref mut rq) = redis_queue {
                rq.read_batch(&consumer_name, 50, 100).await
            } else {
                futures::future::pending().await
            }
        }, if redis_queue.is_some() => {
            match result {
                Ok(messages) => {
                    for (stream_id, msg) in messages {
                        let mut rq = redis_queue.clone(); // ✅ ConnectionManager Clone
                        let pool = pool.clone();
                        let http_client = http_client.clone();
                        let sem = delivery_semaphore.clone();
                        let ep_sems = endpoint_semaphores.clone();
                        let cb = circuit_breaker.clone();
                        let tm = throttle_manager.clone();
                        let cache = signing_cache.clone();

                        tokio::spawn(async move {
                            process_queue_message(&pool, &http_client, &msg,
                                sem, ep_sems, cb, tm, cache).await;
                            let _ = rq.ack(&stream_id).await;
                        });
                    }
                }
                Err(e) => {
                    tracing::error!("❌ Redis queue error: {:?}", e);
                    tokio::time::sleep(Duration::from_millis(100)).await;
                }
            }
        }

        // PG fallback (sadece Redis yoksa)
        _ = tokio::time::sleep(Duration::from_secs(1)),
            if redis_queue.is_none() => {
            let _ = process_pending(&pool, &http_client, &cfg,
                delivery_semaphore.clone(), endpoint_semaphores.clone(),
                circuit_breaker.clone(), throttle_manager.clone()).await;
        }

        // Zombie reaper
        _ = reaper_interval.tick() => { /* mevcut logic */ }
    }
}
```

### 3.8 process_queue_message Fonksiyonu

```rust
async fn process_queue_message(
    pool: &PgPool,
    http_client: &reqwest::Client,
    msg: &QueueMessage,
    semaphore: Arc<Semaphore>,
    endpoint_semaphores: Arc<Mutex<HashMap<Uuid, Arc<Semaphore>>>>,
    cb: circuit_breaker::CircuitBreaker,
    tm: throttle::ThrottleManager,
    cache: Arc<Mutex<secret_cache::SecretCache>>,
) {
    let delivery_id = Uuid::parse_str(&msg.delivery_id).unwrap_or_default();
    let endpoint_id = Uuid::parse_str(&msg.endpoint_id).unwrap_or_default();
    let attempt = msg.attempt_count + 1;

    // 1. Idempotency guard
    if let Ok(Some((status,))) = sqlx::query_as::<_, (String,)>(
        "SELECT status::text FROM deliveries WHERE id = $1"
    ).bind(delivery_id).fetch_optional(pool).await {
        if status == "delivered" {
            tracing::info!("⏭️ {} already delivered", delivery_id);
            return;
        }
    }

    // 2. Circuit breaker
    if !cb.allow_request(endpoint_id).await {
        tracing::warn!("⚡ Circuit open for {}", endpoint_id);
        requeue_with_delay(pool, &msg.queue_item_id, 60).await;
        return;
    }

    // 3. FIFO check
    if !fifo::should_deliver_fifo(pool, endpoint_id).await.unwrap_or(true) {
        tracing::debug!("📦 FIFO wait for {}", endpoint_id);
        requeue_with_delay(pool, &msg.queue_item_id, 5).await;
        return;
    }

    // 4. Signing secret (cache → DB)
    let signing_secret = get_signing_secret(pool, &msg.endpoint_id, &msg.signing_secret, &cache).await;
    if signing_secret.is_empty() {
        mark_dead_letter(pool, delivery_id, "Endpoint signing secret missing", attempt).await;
        return;
    }

    // 5. Concurrency
    let ep_sem = {
        let mut map = endpoint_semaphores.lock().await;
        map.entry(endpoint_id)
            .or_insert_with(|| Arc::new(Semaphore::new(PER_ENDPOINT_CONCURRENCY_LIMIT)))
            .clone()
    };
    let _ep_permit = ep_sem.acquire().await;
    let _permit = semaphore.acquire().await;

    // 6. HTTP delivery
    let webhook = WebhookMessage {
        delivery_id: msg.delivery_id.clone(),
        endpoint_id: msg.endpoint_id.clone(),
        endpoint_url: msg.endpoint_url.clone(),
        signing_secret,
        payload: msg.payload.clone(),
        custom_headers: msg.custom_headers.clone(),
    };

    let start = Instant::now();
    let result = delivery::deliver_http(http_client, &webhook, attempt).await;
    let duration = start.elapsed();

    // 7. Sonuç işleme
    match result {
        Ok(dr) if dr.success => {
            commit_delivery(pool, delivery_id, &dr, duration).await;
            cb.record_success(endpoint_id).await;
            tm.record_success(endpoint_id).await;
        }
        Ok(dr) if is_retryable(dr.status_code) && attempt < msg.max_attempts => {
            schedule_retry(pool, msg, &dr, duration).await;
            cb.record_failure(endpoint_id).await;
            tm.record_attempt(endpoint_id).await;
        }
        Ok(dr) => {
            mark_dead_letter(pool, delivery_id, &dr.error, attempt).await;
            cb.record_failure(endpoint_id).await;
        }
        Err(e) if attempt < msg.max_attempts => {
            let dr = DeliveryResult { error: e.to_string(), ..Default::default() };
            schedule_retry(pool, msg, &dr, duration).await;
            cb.record_failure(endpoint_id).await;
            tm.record_attempt(endpoint_id).await;
        }
        Err(e) => {
            mark_dead_letter(pool, delivery_id, &e.to_string(), attempt).await;
            cb.record_failure(endpoint_id).await;
        }
    }
}
```

### 3.9 Helper Fonksiyonlar

```rust
async fn get_signing_secret(
    pool: &PgPool,
    endpoint_id: &str,
    msg_secret: &str,
    cache: &Arc<Mutex<secret_cache::SecretCache>>,
) -> String {
    // 1. Mesaj'da varsa kullan
    if !msg_secret.is_empty() {
        return msg_secret.to_string();
    }
    // 2. Cache'e bak
    {
        let cache = cache.lock().await;
        if let Some(secret) = cache.get(endpoint_id) {
            return secret.to_string();
        }
    }
    // 3. Cache miss → DB'den çek
    let secret = sqlx::query_scalar::<_, String>(
        "SELECT signing_secret FROM endpoints WHERE id = $1"
    )
    .bind(endpoint_id)
    .fetch_optional(pool)
    .await
    .ok()
    .flatten()
    .unwrap_or_default();

    // 4. Cache'e ekle
    if !secret.is_empty() {
        cache.lock().await.insert(endpoint_id.to_string(), secret.clone());
    }
    secret
}

fn is_retryable(status: i32) -> bool {
    matches!(status, 408 | 429 | 500..=599)
}

async fn requeue_with_delay(pool: &PgPool, queue_item_id: &str, delay_secs: i64) {
    let _ = sqlx::query(
        "UPDATE webhook_queue SET status='pending', next_retry_at=now()+$1::interval WHERE id=$2"
    )
    .bind(format!("{} seconds", delay_secs))
    .bind(queue_item_id)
    .execute(pool).await;
}

async fn commit_delivery(pool: &PgPool, delivery_id: Uuid, dr: &DeliveryResult, _duration: Duration) {
    let _ = sqlx::query(
        "UPDATE deliveries SET status='delivered', attempt_count=attempt_count+1,
         response_status=$1, response_body=$2, updated_at=now() WHERE id=$3"
    )
    .bind(dr.status_code)
    .bind(&dr.response_body[..dr.response_body.len().min(500)])
    .bind(delivery_id)
    .execute(pool).await;

    let _ = sqlx::query("UPDATE webhook_queue SET status='delivered', processed_at=now() WHERE delivery_id=$1")
        .bind(delivery_id).execute(pool).await;
}

async fn schedule_retry(pool: &PgPool, msg: &QueueMessage, dr: &DeliveryResult, _duration: Duration) {
    let category = classify_error(Some(dr.status_code), &dr.error, false);
    let backoff = calculate_backoff(msg.attempt_count, &category, None);
    let next = Utc::now() + chrono::Duration::from_std(backoff)
        .unwrap_or(chrono::Duration::seconds(60));

    let _ = sqlx::query(
        "UPDATE webhook_queue SET status='pending', attempt_count=$1, next_retry_at=$2 WHERE id=$3"
    )
    .bind(msg.attempt_count + 1)
    .bind(next)
    .bind(&msg.queue_item_id)
    .execute(pool).await;
}

async fn mark_dead_letter(pool: &PgPool, delivery_id: Uuid, reason: &str, attempts: i32) {
    let _ = sqlx::query("UPDATE webhook_queue SET status='dead_letter', processed_at=now() WHERE delivery_id=$1")
        .bind(delivery_id).execute(pool).await;
    let _ = sqlx::query("UPDATE deliveries SET status='failed', error_message=$1, updated_at=now() WHERE id=$2")
        .bind(reason).bind(delivery_id).execute(pool).await;
    let _ = sqlx::query(
        "INSERT INTO dead_letters (delivery_id, endpoint_id, customer_id, payload, reason, attempts)
         SELECT id, endpoint_id, customer_id, payload, $2, $3 FROM deliveries WHERE id=$1"
    )
    .bind(delivery_id).bind(reason).bind(attempts).execute(pool).await;
}
```

### 3.10 Faz 1 Doğrulama Checklist

- [ ] `cargo check` — 0 hata
- [ ] `cargo test` — tüm testler geçmeli
- [ ] Redis'e webhook yaz → < 1ms
- [ ] Redis'ten webhook oku → anında
- [ ] Redis down → PG fallback çalışır
- [ ] Worker restart → claim_pending çalışır
- [ ] Signing secret cache → DB sorgusu yok (cache hit)
- [ ] Idempotency → aynı delivery tekrar işlenmez
- [ ] Dead letter → max_attempts aşılırsa DLQ'ya gider
- [ ] Grafana: queue_latency_ms < 10ms

---

## 4. Faz 1 Ek: Production Konfigürasyonu

> **Bu bölüm Faz 1 ile birlikte uygulanır.** Redis Streams'in production'da güvenilir çalışması için kritik ayarlar.

### 4.1 Feature Flag Mekanizması

Redis queue runtime'da açılıp kapatılabilir. Bu sayede deploy sırasında sorun olursa anında geri dönülür.

```rust
// api/src/config.rs ve worker/src/config.rs
pub struct QueueConfig {
    /// Redis queue aktif mi? (env: USE_REDIS_QUEUE)
    pub use_redis_queue: bool,
    /// Redis URL (env: REDIS_URL)
    pub redis_url: Option<String>,
}

impl QueueConfig {
    pub fn from_env() -> Self {
        Self {
            use_redis_queue: std::env::var("USE_REDIS_QUEUE")
                .map(|v| v == "true" || v == "1")
                .unwrap_or(false),
            redis_url: std::env::var("REDIS_URL").ok(),
        }
    }
}
```

```rust
// api/src/main.rs — Feature flag kontrolü
let queue_config = QueueConfig::from_env();

let redis_queue = if queue_config.use_redis_queue {
    match queue_config.redis_url.as_deref() {
        Some(url) => match queue::RedisQueue::new(url).await {
            Ok(rq) => {
                tracing::info!("✅ Redis Streams queue active (USE_REDIS_QUEUE=true)");
                metrics::set_queue_type(1);
                Some(rq)
            }
            Err(e) => {
                tracing::error!("❌ Redis connection failed ({}), falling back to PG", e);
                metrics::set_queue_type(0);
                None
            }
        },
        None => {
            tracing::warn!("⚠️ USE_REDIS_QUEUE=true but REDIS_URL not set, using PG queue");
            metrics::set_queue_type(0);
            None
        }
    }
} else {
    tracing::info!("ℹ️ Redis queue disabled (USE_REDIS_QUEUE=false), using PG queue");
    metrics::set_queue_type(0);
    None
};
```

```bash
# .env.production.example — yeni değişkenler
USE_REDIS_QUEUE=false   # true yapınca Redis queue aktif
REDIS_URL=rediss://default:***@***-***.upstash.io:6379  # zaten mevcut
```

### 4.2 Upstash Redis Production Konfigürasyonu

Upstash dashboard'dan yapılması gereken ayarlar:

| Ayar | Değer | Sebep |
|------|-------|-------|
| **maxmemory-policy** | `noeviction` | Queue dolarsa hata versin, mesaj silinmesin |
| **AOF persistence** | `appendfsync everysec` | Redis restart olursa mesajlar kaybolmasın |
| **Eviction** | Yok | Queue verisi silinmemeli |

> ⚠️ **Kritik:** `noeviction` seçilmezse Redis memory dolduğunda queue mesajlarını silebilir. Bu veri kaybına yol açar.

```bash
# Upstash CLI ile kontrol (opsiyonel)
upstash redis config set maxmemory-policy noeviction
```

### 4.3 Deploy Sırası (Rolling Update)

**Kritik:** API ve worker aynı anda deploy edilmemeli. Sıra önemli.

```
Deploy Sırası:
    1️⃣ Worker deploy (Redis queue okumaya başlar)
         ↓ Başarılıysa
    2️⃣ API deploy (Redis queue'ya yazmaya başlar)
         ↓ Başarılıysa
    3️⃣ USE_REDIS_QUEUE=true yap (feature flag aç)
```

**Neden worker önce?**
- API Redis'e yazmaya başlarsa ama worker henüz okumuyorsa → mesajlar birikir
- Worker önce okumaya başlarsa → API yazdığı anda işlenir

```bash
# 1. Worker deploy (henüz USE_REDIS_QUEUE=false)
gcloud run deploy hooksniff-worker --source . --region europe-west1

# 2. API deploy (henüz USE_REDIS_QUEUE=false)
gcloud run deploy hooksniff-api --source . --region europe-west1

# 3. Feature flag aç (her ikisi de yeni kodda)
gcloud run services update hooksniff-worker \
  --set-env-vars USE_REDIS_QUEUE=true --region europe-west1
gcloud run services update hooksniff-api \
  --set-env-vars USE_REDIS_QUEUE=true --region europe-west1
```

### 4.4 FIFO Endpoint'lerin Redis'teki Davranışı

Mevcut FIFO mantığı PG tablo sırasına bakıyor (`should_deliver_fifo`). Redis Streams'te sıra doğal olarak korunur ama consumer group paralel okuma yapıyor.

**Çözüm:** FIFO endpoint'ler için `XREADGROUP`'da `COUNT=1` kullan (tek tek oku, paralel değil).

```rust
// worker/src/main.rs — FIFO-aware okuma
let batch_size = if has_fifo_endpoints() { 1 } else { 50 };
let messages = redis_queue.read_batch(&consumer_name, batch_size, 100).await?;

// VEYA: FIFO endpoint'ler için ayrı consumer group
// hooksniff-workers-fifo → COUNT=1, tek consumer
// hooksniff-workers → COUNT=50, paralel
```

**Öneri:** İlk aşada FIFO'yu PG'de bırak (mevcut `should_deliver_fifo` çalışmaya devam etsin). Redis queue sadece FIFO olmayan webhook'lar için kullanılsın. İleride FIFO için ayrı stream açılabilir.

```rust
// publish_to_queue — FIFO kontrolü
if fifo::should_deliver_fifo(pool, endpoint_id).await.unwrap_or(false) {
    // FIFO endpoint → PG queue (mevcut davranış)
    pg_enqueue(pool, delivery_id, ...).await?;
} else {
    // Normal endpoint → Redis queue (yeni, hızlı)
    redis.enqueue(&msg).await?;
}
```

### 4.5 Redis OOM (Out of Memory) Senaryosu

Redis memory dolduğunda ne olacak?

| maxmemory-policy | Davranış | Risk |
|-----------------|----------|------|
| `noeviction` | Yeni XADD hata döner → PG fallback | ✅ Güvenli |
| `volatile-lru` | TTL'li key'leri siler | ❌ Queue verisi silinebilir |
| `allkeys-lru` | Tüm key'lerden siler | ❌ Queue verisi silinebilir |

**Seçim:** `noeviction` — Redis doluysa PG fallback otomatik devreye girer.

```rust
// api/src/queue.rs — OOM yakalama
pub async fn enqueue(&mut self, msg: &QueueMessage) -> Result<String> {
    let result: Result<String, _> = redis::cmd("XADD")
        .arg(STREAM_KEY)
        .arg("MAXLEN").arg("~").arg(MAX_STREAM_LEN)
        .arg("*")
        // ... field'lar
        .query_async(&mut self.conn).await;

    match result {
        Ok(id) => Ok(id),
        Err(e) => {
            if e.to_string().contains("OOM") || e.to_string().contains("maxmemory") {
                tracing::error!("🔴 Redis OOM — falling back to PG queue");
                metrics::inc_redis_oom_errors();
                Err(anyhow::anyhow!("Redis OOM"))
            } else {
                Err(e.into())
            }
        }
    }
}
```

**Grafana alert:**
```json
{
  "alert": {
    "name": "Redis OOM",
    "condition": "rate(hooksniff_redis_oom_errors[5m]) > 0",
    "message": "Redis Out of Memory — PG fallback active"
  }
}
```

### 4.6 Trace ID Correlation (OpenTelemetry)

Webhook yolunu baştan sona takip etmek için trace_id Redis queue'da taşınır.

```rust
// api/src/telemetry.rs
pub fn current_trace_id() -> Option<String> {
    use opentelemetry::trace::TraceContextExt;
    let span = opentelemetry::Context::current().span();
    let span_context = span.span_context();
    if span_context.is_valid() {
        Some(span_context.trace_id().to_string())
    } else {
        None
    }
}

// api/src/db.rs — publish_to_queue'da
let trace_id = crate::telemetry::current_trace_id();
msg.trace_id = trace_id.clone();

// worker/src/main.rs — process_queue_message'da
let span = tracing::info_span!(
    "process_queue_message",
    delivery_id = %msg.delivery_id,
    endpoint_id = %msg.endpoint_id,
    trace_id = %msg.trace_id.as_deref().unwrap_or("unknown"),
    queue_type = "redis",
);
let _guard = span.enter();
```

**Grafana'da sorgulama:**
```
# Belirli bir webhook'un tüm yolunu görmek
{trace_id="abc123"} | json
```

### 4.7 Log Formatı (Structured Logging)

Redis queue mode'da log'lara yeni field'lar eklenir.

```rust
// Tüm log'larda tutarlı format
tracing::info!(
    queue_type = "redis",
    stream_id = %stream_id,
    consumer = %consumer_name,
    delivery_id = %msg.delivery_id,
    endpoint_id = %msg.endpoint_id,
    attempt = msg.attempt_count,
    latency_ms = duration.as_millis() as u64,
    "📤 Webhook delivered"
);

// Hata log'u
tracing::error!(
    queue_type = "redis",
    delivery_id = %msg.delivery_id,
    error = %e,
    redis_cmd = "XREADGROUP",
    "❌ Redis queue read failed"
);

// Fallback log'u
tracing::warn!(
    queue_type = "pg_fallback",
    reason = "redis_unavailable",
    delivery_id = %delivery_id,
    "⚠️ Using PostgreSQL queue fallback"
);
```

**Grafana sorgu örnekleri:**
```
# Redis queue hataları
{queue_type="redis"} |= "error"

# PG fallback kullanımı
{queue_type="pg_fallback"}

# Yavaş teslimatlar
{queue_type="redis"} | latency_ms > 100
```

### 4.8 Before/After Benchmark Stratejisi

Deploy sonrası performansı karşılaştırmak için:

```bash
# 1. BEFORE — PG queue ile ölç (USE_REDIS_QUEUE=false)
# 100 webhook gönder, latency kaydet
for i in $(seq 1 100); do
  curl -s -o /dev/null -w "%{time_total}\n" -X POST \
    $API_URL/v1/webhooks \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"endpoint_id":"'$EP_ID'","event":"bench.before","data":{"i":'$i'}}'
done | awk '{sum+=$1; count++} END {print "Avg:", sum/count*1000, "ms"}'

# 2. AFTER — Redis queue ile ölç (USE_REDIS_QUEUE=true)
# Aynı testi tekrar çalıştır

# 3. Grafana'da karşılaştır
# - queue_latency_ms (before vs after)
# - p50, p95, p99 latency
# - throughput (webhook/s)
```

**Beklenen sonuçlar:**

| Metrik | Before (PG) | After (Redis) | İyileşme |
|--------|-------------|---------------|----------|
| Queue latency (avg) | ~500ms | < 5ms | **100x** |
| Queue latency (p99) | ~1000ms | < 10ms | **100x** |
| Throughput | ~50/s | ~500/s | **10x** |

---

## 5. Faz 2: HTTP/2 + Connection Pooling

> **Süre:** 1 oturum | **Etki:** ~50ms/connection → ~0ms | **Risk:** Düşük

### 4.1 HTTP Client Config

```rust
// worker/src/main.rs
let http_client = reqwest::Client::builder()
    // Timeout
    .timeout(Duration::from_secs(5))
    .connect_timeout(Duration::from_secs(2))

    // Connection Pool (30 → 100)
    .pool_max_idle_per_host(100)
    .pool_idle_timeout(Duration::from_secs(300))  // 60s → 300s

    // TCP
    .tcp_keepalive(Duration::from_secs(300))
    .tcp_nodelay(true)

    // HTTP/2
    .http2_prior_knowledge(true)        // H2C (HTTP/2 without TLS)
    .http2_adaptive_window(true)        // Adaptive flow control
    .http2_keep_alive_interval(Duration::from_secs(30))
    .http2_keep_alive_timeout(Duration::from_secs(10))

    .build()?;
```

### 4.2 HTTP/2 vs HTTP/1.1 Görselleştirme

```
HTTP/1.1 — 10 webhook, aynı endpoint:
  Bağlantı 1: ──[50ms]──→ webhook_1
  Bağlantı 2: ──[50ms]──→ webhook_2
  Bağlantı 3: ──[50ms]──→ webhook_3
  ...
  Toplam: 10 × 50ms = 500ms

HTTP/2 — 10 webhook, aynı endpoint:
  Tek Bağlantı:
    Stream 1: ──[50ms]──→ webhook_1
    Stream 2: ──[50ms]──→ webhook_2  (paralel, multiplexing)
    Stream 3: ──[50ms]──→ webhook_3  (paralel)
    ...
  Toplam: ~50ms (multiplexing overhead ≈ 0ms)
```

### 4.3 Faz 2 Doğrulama

- [ ] `cargo check` — 0 hata
- [ ] HTTP/2 connection reuse → Grafana'da connection count azalır
- [ ] Aynı endpoint'e 10 webhook → ~50ms (500ms değil)

---

## 6. Faz 3: 3 Katmanlı Retry Stratejisi

> **Süre:** 1-2 oturum | **Etki:** Geçici hatalarda 30s → 100ms | **Risk:** Düşük

### 5.1 Error Classifier

```rust
#[derive(Debug, Clone, PartialEq)]
pub enum RetryCategory {
    Transient,      // Bağlantı, DNS, timeout
    ServerError,    // 5xx
    RateLimited,    // 429
    Permanent,      // 4xx (429 hariç)
    EndpointDown,   // Circuit breaker açık
}

pub fn classify_error(
    status: Option<i32>,
    error: &str,
    is_circuit_open: bool,
) -> RetryCategory {
    if is_circuit_open {
        return RetryCategory::EndpointDown;
    }

    match status {
        Some(429) => RetryCategory::RateLimited,
        Some(400..=499) => RetryCategory::Permanent,
        Some(500..=599) => RetryCategory::ServerError,
        None => {
            let e = error.to_lowercase();
            if e.contains("connection refused")
                || e.contains("connection reset")
                || e.contains("dns")
                || e.contains("timed out")
                || e.contains("timeout")
            {
                RetryCategory::Transient
            } else {
                RetryCategory::ServerError
            }
        }
        _ => RetryCategory::ServerError,
    }
}
```

### 5.2 Tiered Backoff Calculator

```rust
pub fn calculate_backoff(
    attempt: i32,
    category: &RetryCategory,
    retry_after_header: Option<u64>,
) -> Duration {
    match category {
        // ── Tier 1: Immediate Retries (100ms, 300ms, 500ms) ──
        RetryCategory::Transient => {
            match attempt {
                0 => Duration::from_millis(100),
                1 => Duration::from_millis(300),
                2 => Duration::from_millis(500),
                _ => tier_2_backoff(attempt - 3),  // Tier 2'ye geç
            }
        }

        // ── Tier 2: Short-term (1m, 5m, 15m, 1h, 4h) ──
        RetryCategory::ServerError => tier_2_backoff(attempt),

        // ── Rate Limited → Retry-After header kullan ──
        RetryCategory::RateLimited => {
            let secs = retry_after_header.unwrap_or(60);
            Duration::from_secs(secs.min(3600))
        }

        // ── Tier 3: Long-term (6h, 12h, 24h — max 3 gün) ──
        RetryCategory::EndpointDown => tier_3_backoff(attempt),

        // ── Permanent: No retry ──
        RetryCategory::Permanent => Duration::ZERO,
    }
}

fn tier_2_backoff(attempt: i32) -> Duration {
    let intervals = [60, 300, 900, 3600, 14400]; // 1m, 5m, 15m, 1h, 4h
    let idx = (attempt as usize).min(intervals.len() - 1);
    Duration::from_secs(intervals[idx])
}

fn tier_3_backoff(attempt: i32) -> Duration {
    let intervals = [21600, 43200, 86400]; // 6h, 12h, 24h
    let idx = (attempt as usize).min(intervals.len() - 1);
    Duration::from_secs(intervals[idx])
}

/// Thundering herd prevention
pub fn with_jitter(duration: Duration) -> Duration {
    use rand::Rng;
    let jitter = rand::thread_rng().gen_range(0.8..1.2);
    Duration::from_millis((duration.as_millis() as f64 * jitter) as u64)
}
```

### 5.3 Max Attempts

```rust
pub fn max_attempts_for_category(category: &RetryCategory) -> i32 {
    match category {
        RetryCategory::Transient => 5,      // ~1s toplam
        RetryCategory::ServerError => 5,    // ~4h toplam
        RetryCategory::RateLimited => 3,
        RetryCategory::EndpointDown => 12,  // ~3 gün toplam
        RetryCategory::Permanent => 0,
    }
}
```

### 5.4 Retry Akış Diyagramı

```
Webhook teslimat hatası
    │
    ▼
Error Classifier
    │
    ├─ Transient (DNS, timeout, connection)
    │   └─ Tier 1: 100ms → 300ms → 500ms
    │       └─ Hâlâ başarısız → Tier 2'ye geç
    │
    ├─ ServerError (5xx)
    │   └─ Tier 2: 1m → 5m → 15m → 1h → 4h
    │
    ├─ RateLimited (429)
    │   └─ Retry-After header kullan (max 1h)
    │
    ├─ EndpointDown (circuit breaker açık)
    │   └─ Tier 3: 6h → 12h → 24h (3 gün)
    │
    └─ Permanent (4xx, 429 hariç)
        └─ Direkt DLQ (retry yok)
```

### 5.5 Faz 3 Doğrulama

- [ ] `cargo check` — 0 hata
- [ ] Transient hata → 100ms'de retry
- [ ] 5xx hata → 1m'de retry
- [ ] 4xx hata → direkt DLQ
- [ ] Circuit breaker açık → 6h'da retry

---

## 7. Faz 4: DNS + SSRF Cache

> **Süre:** 1 oturum | **Etki:** ~30ms/call → ~0ms | **Risk:** Çok düşük

### 6.1 DNS Cache (LRU)

```rust
// worker/src/dns_cache.rs
use std::collections::HashMap;
use std::net::IpAddr;
use std::time::{Duration, Instant};

pub struct DnsCache {
    entries: HashMap<String, CacheEntry>,
    ttl: Duration,
    max_entries: usize,
}

struct CacheEntry {
    ip: IpAddr,
    cached_at: Instant,
}

impl DnsCache {
    pub fn new(ttl: Duration, max_entries: usize) -> Self {
        Self { entries: HashMap::new(), ttl, max_entries }
    }

    pub fn get(&self, host: &str) -> Option<IpAddr> {
        self.entries.get(host).and_then(|entry| {
            if entry.cached_at.elapsed() < self.ttl {
                Some(entry.ip)
            } else {
                None
            }
        })
    }

    pub fn insert(&mut self, host: String, ip: IpAddr) {
        if self.entries.len() >= self.max_entries {
            self.evict_oldest();
        }
        self.entries.insert(host, CacheEntry { ip, cached_at: Instant::now() });
    }

    fn evict_oldest(&mut self) {
        if let Some(oldest_key) = self.entries.iter()
            .min_by_key(|(_, e)| e.cached_at)
            .map(|(k, _)| k.clone())
        {
            self.entries.remove(&oldest_key);
        }
    }

    pub fn cleanup(&mut self) {
        self.entries.retain(|_, e| e.cached_at.elapsed() < self.ttl);
    }
}
```

### 6.2 SSRF Cache

```rust
// worker/src/ssrf_cache.rs
pub struct SsrfCache {
    entries: HashMap<String, SsrfEntry>,
    ttl: Duration,
}

struct SsrfEntry {
    allowed: bool,
    cached_at: Instant,
}

impl SsrfCache {
    pub fn is_allowed(&self, url: &str) -> Option<bool> {
        let host = extract_host(url)?;
        self.entries.get(host).and_then(|entry| {
            if entry.cached_at.elapsed() < self.ttl {
                Some(entry.allowed)
            } else {
                None
            }
        })
    }

    pub fn record_result(&mut self, url: &str, allowed: bool) {
        if let Some(host) = extract_host(url) {
            self.entries.insert(host.to_string(), SsrfEntry {
                allowed,
                cached_at: Instant::now(),
            });
        }
    }
}
```

### 6.3 Faz 4 Doğrulama

- [ ] DNS cache hit rate > %90
- [ ] SSRF cache → tekrar DNS çözümleme yok
- [ ] 5 dk TTL → stale cache riski minimal

---

## 8. Faz 5: Dynamic Concurrency

> **Süre:** 1 oturum | **Etki:** Hızlı endpoint'lerde %100 throughput | **Risk:** Düşük

### 7.1 Implementation

```rust
// Mevcut: sabit limit
const PER_ENDPOINT_CONCURRENCY_LIMIT: usize = 10;

// Yeni: dinamik limit
async fn get_endpoint_concurrency(endpoint_id: Uuid, avg_latency_ms: u32) -> usize {
    match avg_latency_ms {
        0..=200 => 20,      // Hızlı endpoint → 2x concurrency
        201..=1000 => 10,   // Normal → mevcut limit
        1001..=5000 => 5,   // Yavaş → daha az
        _ => 2,             // Çok yavaş → minimal
    }
}
```

### 7.2 Faz 5 Doğrulama

- [ ] Hızlı endpoint (< 200ms) → 20 concurrent
- [ ] Yavaş endpoint (> 1s) → 5 concurrent
- [ ] Genel throughput artışı

---

## 9. Faz 6: Batch Processing

> **Süre:** 2 oturum | **Etki:** Yüksek throughput'ta %30-50 | **Risk:** Orta

### 8.1 Implementation

```rust
async fn process_batch(items: Vec<WebhookMessage>) {
    // Endpoint'lere göre grupla
    let grouped = group_by_endpoint(items);

    for (endpoint_id, webhooks) in grouped {
        if webhooks.len() > 1 && supports_batch(&endpoint_id) {
            // Batch teslimat
            deliver_batch(&endpoint_id, &webhooks).await;
        } else {
            // Paralel teslimat (mevcut)
            for webhook in webhooks {
                deliver_single(&webhook).await;
            }
        }
    }
}
```

### 8.2 Faz 6 Doğrulama

- [ ] Batch destekleyen endpoint → tek HTTP isteği
- [ ] Desteklemeyen → mevcut paralel teslimat
- [ ] Throughput artışı ölçülebilir

---

## 10. Grafana Metrikleri & Monitoring

### 9.1 Yeni Metrikler

```rust
// worker/src/metrics.rs — mevcut dosyaya ekle

// Queue tipi (0=PG, 1=Redis)
pub static QUEUE_TYPE: AtomicU8 = AtomicU8::new(0);

// Redis queue latency (microseconds)
pub static REDIS_QUEUE_LATENCY_US: AtomicU64 = AtomicU64::new(0);

// Redis queue errors
pub static REDIS_QUEUE_ERRORS: AtomicU64 = AtomicU64::new(0);

// PG fallback count
pub static PG_QUEUE_FALLBACK: AtomicU64 = AtomicU64::new(0);

// Signing secret cache hit/miss
pub static SECRET_CACHE_HIT: AtomicU64 = AtomicU64::new(0);
pub static SECRET_CACHE_MISS: AtomicU64 = AtomicU64::new(0);

// DNS cache hit/miss
pub static DNS_CACHE_HIT: AtomicU64 = AtomicU64::new(0);
pub static DNS_CACHE_MISS: AtomicU64 = AtomicU64::new(0);

// HTTP/2 connection reuse
pub static HTTP2_CONNECTION_REUSE: AtomicU64 = AtomicU64::new(0);

// Tier retry counts
pub static TIER1_RETRY_COUNT: AtomicU64 = AtomicU64::new(0);
pub static TIER2_RETRY_COUNT: AtomicU64 = AtomicU64::new(0);
pub static TIER3_RETRY_COUNT: AtomicU64 = AtomicU64::new(0);

// Redis OOM errors
pub static REDIS_OOM_ERRORS: AtomicU64 = AtomicU64::new(0);

// Helper fonksiyonlar
pub fn record_queue_latency_us(us: u64) {
    REDIS_QUEUE_LATENCY_US.store(us, Ordering::Relaxed);
}
pub fn set_queue_type(t: u8) {
    QUEUE_TYPE.store(t, Ordering::Relaxed);
}
pub fn inc_redis_queue_errors() {
    REDIS_QUEUE_ERRORS.fetch_add(1, Ordering::Relaxed);
}
pub fn inc_pg_queue_fallback() {
    PG_QUEUE_FALLBACK.fetch_add(1, Ordering::Relaxed);
}
pub fn inc_secret_cache_hit() {
    SECRET_CACHE_HIT.fetch_add(1, Ordering::Relaxed);
}
pub fn inc_secret_cache_miss() {
    SECRET_CACHE_MISS.fetch_add(1, Ordering::Relaxed);
}
pub fn inc_dns_cache_hit() {
    DNS_CACHE_HIT.fetch_add(1, Ordering::Relaxed);
}
pub fn inc_dns_cache_miss() {
    DNS_CACHE_MISS.fetch_add(1, Ordering::Relaxed);
}
pub fn inc_redis_oom_errors() {
    REDIS_OOM_ERRORS.fetch_add(1, Ordering::Relaxed);
}
```

### 9.2 Grafana Dashboard Panelleri

```json
{
  "panels": [
    {
      "title": "Queue Tipi",
      "targets": [{"expr": "hooksniff_queue_type"}],
      "type": "stat",
      "mappings": [{"type": "value", "options": {"0": {"text": "PostgreSQL"}, "1": {"text": "Redis"}}}]
    },
    {
      "title": "Queue Gecikme (ms)",
      "targets": [{"expr": "hooksniff_queue_latency_ms"}],
      "type": "timeseries",
      "thresholds": [
        {"value": 10, "color": "green"},
        {"value": 100, "color": "yellow"},
        {"value": 1000, "color": "red"}
      ]
    },
    {
      "title": "Redis Queue Hataları",
      "targets": [{"expr": "rate(hooksniff_redis_queue_errors[5m])"}],
      "type": "timeseries"
    },
    {
      "title": "PG Fallback Sayısı",
      "targets": [{"expr": "hooksniff_pg_queue_fallback"}],
      "type": "stat"
    },
    {
      "title": "Secret Cache Hit Rate",
      "targets": [{"expr": "rate(hooksniff_secret_cache_hit[5m]) / (rate(hooksniff_secret_cache_hit[5m]) + rate(hooksniff_secret_cache_miss[5m]))"}],
      "type": "gauge"
    },
    {
      "title": "DNS Cache Hit Rate",
      "targets": [{"expr": "rate(hooksniff_dns_cache_hit[5m]) / (rate(hooksniff_dns_cache_hit[5m]) + rate(hooksniff_dns_cache_miss[5m]))"}],
      "type": "gauge"
    },
    {
      "title": "Redis OOM Hataları",
      "targets": [{"expr": "rate(hooksniff_redis_oom_errors[5m])"}],
      "type": "timeseries",
      "alert": {
        "name": "Redis OOM",
        "condition": "rate(hooksniff_redis_oom_errors[5m]) > 0",
        "message": "Redis Out of Memory — PG fallback active"
      }
    },
    {
      "title": "Retry Dağılımı",
      "targets": [
        {"expr": "hooksniff_tier1_retry_count", "legendFormat": "Tier 1 (Immediate)"},
        {"expr": "hooksniff_tier2_retry_count", "legendFormat": "Tier 2 (Short-term)"},
        {"expr": "hooksniff_tier3_retry_count", "legendFormat": "Tier 3 (Long-term)"}
      ],
      "type": "timeseries"
    }
  ]
}
```

---

## 11. Test & Doğrulama

### 10.1 Redis Streams Test

```bash
# Redis'e mesaj ekle
redis-cli XADD hooksniff:webhooks '*' \
  delivery_id 'test-1' endpoint_id 'ep-1' payload '{"test":true}'

# Consumer group oluştur
redis-cli XGROUP CREATE hooksniff:webhooks test-group 0 MKSTREAM

# Mesajları oku
redis-cli XREADGROUP GROUP test-group consumer-1 \
  COUNT 10 BLOCK 1000 STREAMS hooksniff:webhooks '>'

# Stream durumunu kontrol et
redis-cli XINFO STREAM hooksniff:webhooks
redis-cli XINFO GROUPS hooksniff:webhooks
```

### 10.2 Latency Test

```bash
# Webhook gönder ve süreyi ölç
time curl -X POST \
  https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"endpoint_id": "'$EP_ID'", "event": "test.speed", "data": {"ts": "'$(date +%s%N)'"}}'
```

### 10.3 Load Test (k6)

```javascript
// tests/load/webhook_speed_test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up
    { duration: '1m', target: 50 },    // Sustained
    { duration: '30s', target: 100 },  // Spike
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95th percentile < 500ms
    http_req_failed: ['rate<0.01'],    // < 1% failure
  },
};

export default function () {
  const payload = JSON.stringify({
    endpoint_id: __ENV.ENDPOINT_ID,
    event: 'load.test',
    data: { ts: Date.now() },
  });

  const res = http.post(`${__ENV.API_URL}/v1/webhooks`, payload, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.API_KEY}`,
    },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'latency < 500ms': (r) => r.timings.duration < 500,
  });
}
```

---

## 12. Rollback Planı

### Her Faz İçin

```bash
# 1. Mevcut commit'i kaydet
git tag pre-faz-N

# 2. Yeni kodu deploy et

# 3. Sorun olursa geri al
git checkout pre-faz-N
# Cloud Build ile tekrar deploy
```

### Redis Streams Rollback

```bash
# Feature flag ile Redis queue'yu devre dışı bırak
gcloud run services update hooksniff-worker \
  --set-env-vars USE_REDIS_QUEUE=false \
  --region europe-west1

# Worker otomatik olarak PostgreSQL queue'ya geri döner
# Redis'teki mesajlar kaybolmaz (PG fallback zaten çalışıyor)
```

### Acil Durum Script

```bash
#!/bin/bash
# rollback-redis.sh

echo "⚠️ Rolling back Redis Streams queue..."

# 1. Worker'ı PG queue'ya çevir
gcloud run services update hooksniff-worker \
  --set-env-vars USE_REDIS_QUEUE=false \
  --region europe-west1

# 2. API'yi PG queue'ya çevir
gcloud run services update hooksniff-api \
  --set-env-vars USE_REDIS_QUEUE=false \
  --region europe-west1

# 3. Kontrol et
echo "✅ Rollback complete. Monitoring Grafana for issues..."
```

---

## 13. Zaman Çizelgesi

| Faz | Süre | Etki | Oturum |
|-----|------|------|--------|
| **Faz 1:** Redis Streams Queue | 2-3 oturum | 1000ms → < 10ms | 1-3 |
| **Faz 2:** HTTP/2 + Connection Pool | 1 oturum | ~50ms → ~0ms | 4 |
| **Faz 3:** 3 Katmanlı Retry | 1-2 oturum | 30s → 100ms | 5-6 |
| **Faz 4:** DNS + SSRF Cache | 1 oturum | ~30ms → ~0ms | 7 |
| **Faz 5:** Dynamic Concurrency | 1 oturum | %100 throughput | 8 |
| **Faz 6:** Batch Processing | 2 oturum | %30-50 throughput | 9-10 |

**Toplam:** ~10 oturum (her biri ~1 saat)

### Beklenen Sonuçlar

| Metrik | Mevcut | Hedef | Svix | Stripe |
|--------|--------|-------|------|--------|
| İlk tetikleme | 0-1000ms | **< 10ms** | < 10ms | < 1s |
| Connection setup | ~50ms | **~0ms** | ~0ms | ~0ms |
| İlk retry | 30s | **100ms** | 5s | 60s |
| Concurrent delivery | 50 | **200+** | 100+ | N/A |
| Throughput | ~50/s | **500+/s** | 1000+/s | N/A |

### Maliyet

| İyileştirme | Ek Maliyet |
|-------------|------------|
| Redis Streams | $0 (Upstash free tier) |
| HTTP/2 | $0 |
| 3 Katmanlı Retry | $0 |
| DNS Cache | $0 |
| Dynamic Concurrency | $0 |
| Batch Processing | $0 |
| **TOPLAM** | **$0** |

---

## 📚 Kaynaklar

- [Svix — Redis Message Queue](https://www.svix.com/resources/guides/redis-message-queue/)
- [Svix — Low Latency Message Queue](https://www.svix.com/resources/guides/low-latency-message-queue/)
- [Hookdeck — Webhooks at Scale](https://hookdeck.com/blog/webhooks-at-scale)
- [Hookdeck — Building Reliable Outbound Webhooks](https://hookdeck.com/blog/building-reliable-outbound-webhooks)
- [PostgreSQL LISTEN/NOTIFY Scalability](https://news.ycombinator.com/item?id=44490510)
- [Redis Streams Documentation](https://redis.io/docs/latest/develop/data-types/streams/)

---

*Bu plan tüm analiz, inceleme ve düzeltme belgelerinin birleşimidir.*
*Son güncelleme: 2026-05-26*
