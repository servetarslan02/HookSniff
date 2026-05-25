# 📋 Webhook Hızlandırma — Uygulama Planı

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

## Faz 1: Redis Streams Queue 🔴 KRİTİK

**Süre:** 2-3 oturum
**Etki:** İlk tetikleme 1000ms → < 10ms
**Risk:** Orta (paralel çalıştırılabilir)

### Adım 1.1: Redis Bağlantısı Ekle

**Dosya:** `api/src/queue.rs` (YENİ)

```rust
//! Redis Streams webhook queue.
//!
//! PostgreSQL webhook_queue tablosunun yerini alır.
//! Sub-millisecond tetikleme sağlar.

use redis::aio::ConnectionManager;
use redis::streams::{StreamReadOptions, StreamReadReply};
use uuid::Uuid;

const STREAM_KEY: &str = "webhook:queue";
const CONSUMER_GROUP: &str = "webhook-workers";
const CONSUMER_NAME: &str = "worker-1";

pub struct RedisQueue {
    redis: ConnectionManager,
}

impl RedisQueue {
    pub async fn new(redis_url: &str) -> Result<Self> {
        let client = redis::Client::open(redis_url)?;
        let mut conn = ConnectionManager::new(client).await?;
        
        // Consumer group oluştur (yoksa)
        let _: Result<(), _> = redis::cmd("XGROUP")
            .arg("CREATE").arg(STREAM_KEY).arg(CONSUMER_GROUP)
            .arg("0").arg("MKSTREAM")
            .query_async(&mut conn).await;
        
        Ok(Self { redis: conn })
    }
    
    /// Kuyruğa webhook ekle (sub-millisecond)
    pub async fn enqueue(&mut self, delivery_id: Uuid, endpoint_id: Uuid, 
                          payload: &str, custom_headers: Option<&str>) -> Result<String> {
        let id: String = redis::cmd("XADD")
            .arg(STREAM_KEY)
            .arg("*")
            .arg("delivery_id").arg(delivery_id.to_string())
            .arg("endpoint_id").arg(endpoint_id.to_string())
            .arg("payload").arg(payload)
            .arg("headers").arg(custom_headers.unwrap_or("{}"))
            .query_async(&mut self.redis).await?;
        
        Ok(id)
    }
    
    /// Consumer group ile batch okuma (blocking)
    pub async fn read_batch(&mut self, count: usize, block_ms: usize) -> Result<Vec<QueueMessage>> {
        let opts = StreamReadOptions::default()
            .count(count)
            .block(block_ms)
            .group(CONSUMER_GROUP, CONSUMER_NAME);
        
        let result: StreamReadReply = self.redis.xread_options(
            &[STREAM_KEY], &[">"], &opts
        ).await?;
        
        let mut messages = Vec::new();
        for stream in result.keys {
            for entry in stream.ids {
                messages.push(QueueMessage {
                    stream_id: entry.id,
                    delivery_id: entry.get("delivery_id")?,
                    endpoint_id: entry.get("endpoint_id")?,
                    payload: entry.get("payload")?,
                    headers: entry.get("headers"),
                });
            }
        }
        
        Ok(messages)
    }
    
    /// Mesajı onayla (işlem tamamlandı)
    pub async fn ack(&mut self, stream_id: &str) -> Result<()> {
        redis::cmd("XACK")
            .arg(STREAM_KEY).arg(CONSUMER_GROUP).arg(stream_id)
            .query_async(&mut self.redis).await?;
        Ok(())
    }
}
```

### Adım 1.2: API'de Kuyruk Değişikliği

**Dosya:** `api/src/db.rs` — `publish_to_queue` fonksiyonu

```rust
// ESKİ:
pub async fn publish_to_queue(pool, delivery_id, ...) {
    sqlx::query("INSERT INTO webhook_queue ...").execute(pool).await?;
}

// YENİ:
pub async fn publish_to_queue(pool, redis_queue, delivery_id, ...) {
    // 1. Redis Streams'a ekle (sub-millisecond) — asıl kuyruk
    redis_queue.enqueue(delivery_id, endpoint_id, payload, headers).await?;
    
    // 2. PostgreSQL webhook_queue'a da ekle (backward compatibility, async)
    // Bu satır opsiyonel — sadece migration döneminde gerekli
    // sqlx::query("INSERT INTO webhook_queue ...").execute(pool).await?;
}
```

### Adım 1.3: Worker'da Queue Değişikliği

**Dosya:** `worker/src/main.rs` — Ana loop

```rust
// ESKİ:
loop {
    tokio::select! {
        _ = listener.recv() => { /* NOTIFY */ }
        _ = sleep(1s) => { /* poll fallback */ }
    }
}

// YENİ:
loop {
    // Redis Streams blocking read (sub-millisecond wake)
    match redis_queue.read_batch(50, 100).await {
        Ok(messages) => {
            for msg in messages {
                process_delivery(msg).await;
                redis_queue.ack(&msg.stream_id).await;
            }
        }
        Err(e) => {
            tracing::error!("Queue error: {:?}", e);
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
    }
}
```

### Adım 1.4: Geçiş Stratejisi

```
Gün 1-2: Redis queue + PostgreSQL queue paralel çalışsın
         (her iki kuyruğa da yaz, worker Redis'ten okusun)
Gün 3:   PostgreSQL kuyruk okumayı kapat
         (sadece Redis'ten oku, PG sadece storage)
Gün 4:   webhook_queue tablosunu temizle (opsiyonel)
```

### Doğrulama
- [ ] `cargo check` — 0 hata
- [ ] `cargo test` — tüm testler geçmeli
- [ ] Grafana: İlk tetikleme süresi < 10ms
- [ ] Grafana: Queue latency metric ekle

---

## Faz 2: HTTP/2 + Connection Pooling 🟡 YÜKSEK

**Süre:** 1 oturum
**Etki:** Connection setup ~50ms → ~0ms
**Risk:** Düşük

### Adım 2.1: HTTP Client İyileştirmesi

**Dosya:** `worker/src/main.rs`

```rust
// ESKİ:
let http_client = reqwest::Client::builder()
    .timeout(Duration::from_secs(5))
    .connect_timeout(Duration::from_secs(2))
    .pool_max_idle_per_host(30)
    .tcp_keepalive(Duration::from_secs(60))
    .tcp_nodelay(true)
    .build()?;

// YENİ:
let http_client = reqwest::Client::builder()
    .timeout(Duration::from_secs(5))
    .connect_timeout(Duration::from_secs(2))
    .pool_max_idle_per_host(100)                    // 30 → 100
    .pool_idle_timeout(Duration::from_secs(300))    // Varsayılan → 300s
    .tcp_keepalive(Duration::from_secs(300))        // 60s → 300s
    .tcp_nodelay(true)
    .http2_prior_knowledge(true)                    // HTTP/2 zorla
    .http2_adaptive_window(true)                    // Adaptive flow control
    .http2_keep_alive_interval(Duration::from_secs(30))
    .http2_keep_alive_timeout(Duration::from_secs(10))
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
    /// Bağlantı hatası, DNS, timeout — immediate retry
    Transient,
    /// 5xx sunucu hatası — short-term retry
    ServerError,
    /// 429 Rate Limited — respect Retry-After
    RateLimited,
    /// 4xx kalıcı hata — retry yok
    Permanent,
    /// Endpoint down (circuit breaker) — long-term retry
    EndpointDown,
}

pub fn classify_error(status: Option<i32>, error: &str) -> RetryCategory {
    match status {
        Some(429) => RetryCategory::RateLimited,
        Some(400..=499) => RetryCategory::Permanent,
        Some(500..=599) => RetryCategory::ServerError,
        None => {
            if error.contains("connection") || error.contains("dns") || error.contains("timeout") {
                RetryCategory::Transient
            } else {
                RetryCategory::ServerError
            }
        }
        _ => RetryCategory::ServerError,
    }
}
```

### Adım 3.2: Katmanlı Backoff

**Dosya:** `worker/src/helpers.rs`

```rust
pub fn calculate_backoff(attempt: i32, category: &RetryCategory, retry_after: Option<u64>) -> Duration {
    match category {
        // Tier 1: Immediate (100ms, 300ms, 500ms)
        RetryCategory::Transient => {
            match attempt {
                0 => Duration::from_millis(100),
                1 => Duration::from_millis(300),
                2 => Duration::from_millis(500),
                _ => tier_2_backoff(attempt - 3),
            }
        }
        // Tier 2: Short-term (1m, 5m, 15m, 1h, 4h)
        RetryCategory::ServerError => tier_2_backoff(attempt),
        // Rate limited: respect Retry-After header
        RetryCategory::RateLimited => {
            Duration::from_secs(retry_after.unwrap_or(60))
        }
        // Tier 3: Long-term (6h, 12h, 24h)
        RetryCategory::EndpointDown => tier_3_backoff(attempt),
        // Permanent: no retry
        RetryCategory::Permanent => Duration::ZERO,
    }
}

fn tier_2_backoff(attempt: i32) -> Duration {
    let intervals = [60, 300, 900, 3600, 14400];
    let idx = (attempt as usize).min(intervals.len() - 1);
    Duration::from_secs(intervals[idx])
}

fn tier_3_backoff(attempt: i32) -> Duration {
    let intervals = [21600, 43200, 86400];
    let idx = (attempt as usize).min(intervals.len() - 1);
    Duration::from_secs(intervals[idx])
}
```

### Doğrulama
- [ ] `cargo check` — 0 hata
- [ ] Grafana: Transient hata retry süresi < 1s
- [ ] Grafana: Permanent hata retry yok

---

## Faz 4: DNS + SSRF Cache 🟢 KOLAY

**Süre:** 1 oturum
**Etki:** ~30ms/call → ~0ms
**Risk:** Çok düşük

### Adım 4.1: DNS Cache

**Dosya:** `worker/src/dns_cache.rs` (YENİ)

```rust
use std::collections::HashMap;
use std::net::IpAddr;
use std::time::{Duration, Instant};

pub struct DnsCache {
    entries: HashMap<String, CacheEntry>,
    ttl: Duration,
}

struct CacheEntry {
    ip: IpAddr,
    cached_at: Instant,
}

impl DnsCache {
    pub fn new(ttl: Duration) -> Self {
        Self {
            entries: HashMap::new(),
            ttl,
        }
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
        self.entries.insert(host, CacheEntry {
            ip,
            cached_at: Instant::now(),
        });
    }
    
    pub fn cleanup(&mut self) {
        self.entries.retain(|_, entry| entry.cached_at.elapsed() < self.ttl);
    }
}
```

### Doğrulama
- [ ] Grafana: DNS cache hit oranı > %90
- [ ] Grafana: DNS çözümleme süresi ~0ms (cache hit)

---

## Faz 5: Dynamic Concurrency 🟢 KOLAY

**Süre:** 1 oturum
**Etki:** Hızlı endpoint'lerde %100 throughput
**Risk:** Düşük

### Adım 5.1: Per-Endpoint Dynamic Limit

**Dosya:** `worker/src/main.rs`

```rust
/// Endpoint'in ortalama response süresine göre concurrency limiti belirle
async fn get_endpoint_semaphore(
    endpoint_semaphores: &Mutex<HashMap<Uuid, Arc<Semaphore>>>,
    endpoint_id: Uuid,
    avg_latency_ms: f64,
) -> Arc<Semaphore> {
    let mut map = endpoint_semaphores.lock().await;
    map.entry(endpoint_id).or_insert_with(|| {
        let limit = match avg_latency_ms as u64 {
            0..=200 => 20,      // Hızlı → fazla concurrency
            201..=1000 => 10,   // Normal
            1001..=5000 => 5,   // Yavaş → az
            _ => 2,             // Çok yavaş → minimal
        };
        Arc::new(Semaphore::new(limit))
    }).clone()
}
```

### Doğrulama
- [ ] Grafana: Hızlı endpoint throughput artışı
- [ ] Grafana: Yavaş endpoint bloklama yok

---

## Faz 6: Batch Processing 🟢 ORTA

**Süre:** 2 oturum
**Etki:** Yüksek throughput'ta %30-50
**Risk:** Orta

### Adım 6.1: Same-Endpoint Batching

Aynı endpoint'e giden birden fazla webhook'u 50ms pencerede biriktir, paralel gönder.

### Adım 6.2: Batch Queue Okuma

Redis Streams'tan zaten batch okuyor (XREADGROUP count=50). Bu faz optimizasyon:
- Okuma batch'ini artır (50 → 100)
- Aynı endpoint'i grupla
- Paralel HTTP istekleri

---

## 📊 Zaman Çizelgesi

| Faz | Süre | Başlangıç | Bitiş | Durum |
|-----|------|-----------|-------|-------|
| 1. Redis Streams | 2-3 oturum | — | — | ⏳ |
| 2. HTTP/2 | 1 oturum | — | — | ⏳ |
| 3. 3 Katmanlı Retry | 1-2 oturum | — | — | ⏳ |
| 4. DNS Cache | 1 oturum | — | — | ⏳ |
| 5. Dynamic Concurrency | 1 oturum | — | — | ⏳ |
| 6. Batch Processing | 2 oturum | — | — | ⏳ |
| **TOPLAM** | **~10-12 oturum** | | | |

---

## ⚠️ Kritik Kurallar

1. **Her fazda `cargo check` + `cargo test`** — 0 hata olmadan devam etme
2. **Her fazda Grafana metric ekle** — performansı ölç
3. **Paralel çalıştır** — yeni queue eskiyle birlikte çalışabilmeli
4. **Rollback planı** — her faz geri alınabilmeli
5. **Commit her faz sonunda** — hata olursa geri almak kolay

---

*Bu plan HookSniff'in en hızlı webhook platform olması için hazırlanmıştır.*
*Son güncelleme: 2026-05-26*
