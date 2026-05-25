# 📊 Webhook Hızlandırma — Derin Analiz Raporu

> **Tarih:** 2026-05-26
> **Analist:** OpenClaw AI
> **Kapsam:** HookSniff webhook teslimat sistemi tam analiz + sektör karşılaştırması + iyileştirme planı

---

## 1. Mevcut Sistem Analizi

### 1.1 HookSniff Webhook Akışı (Şu An)

```
Müşteri API İsteği
    │
    ▼
┌─────────────────────────────┐
│  API (Rust/Axum, port 3000) │
│  ├─ JWT/API Key doğrulama   │
│  ├─ Rate limit kontrolü     │
│  ├─ Team rol kontrolü       │
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
│  ├─ 1s fallback poll        │  ← DARBOĞAZ #2 (kaçan NOTIFY)
│  ├─ FOR UPDATE SKIP LOCKED  │
│  ├─ FIFO check              │
│  ├─ Circuit breaker check   │
│  ├─ Throttle check          │
│  ├─ SSRF koruması           │
│  └─ HTTP POST               │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Hedef Endpoint             │
│  ├─ HTTP/1.1 POST           │  ← DARBOĞAZ #3 (connection setup)
│  ├─ HMAC-SHA256 signature   │
│  ├─ 5s timeout              │
│  └─ Response handling       │
└─────────────────────────────┘
```

### 1.2 Tespit Edilen Darboğazlar

| # | Darboğaz | Etki | Öncelik |
|---|----------|------|---------|
| 1 | PostgreSQL kuyruk (NOTIFY + 1s poll) | 0-1000ms gecikme | 🔴 Kritik |
| 2 | 1s fallback poll | Kaçan NOTIFY'da 1s gecikme | 🔴 Kritik |
| 3 | HTTP/1.1 connection setup | ~50-100ms/connection | 🟡 Yüksek |
| 4 | Tek retry stratejisi | 30s+ ilk retry | 🟡 Yüksek |
| 5 | DNS çözümleme her istekte | ~10-50ms/call | 🟡 Yüksek |
| 6 | Static concurrency limit | Hızlı/yavaş endpoint eşit | 🟢 Orta |
| 7 | SSRF kontrolü her istekte | ~5-20ms/call | 🟢 Orta |

---

## 2. Sektör Analizi — Rakipler Nasıl Yapıyor?

### 2.1 Stripe

**Dünyanın en hızlı webhook sistemi.**

- **İlk tetikleme:** < 1 saniye (tipik: 200-500ms)
- **Queue:** Özel internal queue sistemi (detaylı bilgi yok)
- **Retry:** 3 gün, exponential backoff
- **Altyapı:** Özel, milyarlarca dolar yatırım
- **Ders:** Sub-second hedef, queue-first mimari

### 2.2 Svix (Açık Kaynak — Rust)

**En büyük webhook altyapı sağlayıcısı. Clerk, gibi şirketler kullanıyor.**

- **İlk tetikleme:** < 10ms
- **Queue:** **Redis Streams** (PostgreSQL sadece depolama)
- **Dil:** Rust (HookSniff ile aynı)
- **Mimari:**
  ```
  API → PostgreSQL (storage) + Redis (queue) → Worker → HTTP
  ```
- **Redis Kullanımı:**
  - `XADD` ile kuyruğa ekleme (sub-millisecond)
  - `XREADGROUP` ile consumer groups ile paralel okuma
  - AOF persistence ile dayanıklılık
  - Consumer groups ile otomatik load balancing
- **Ders:** Redis queue, PostgreSQL storage — ayrıştırma en kritik karar

### 2.3 Hookdeck

**100+ milyar webhook işlemiş şirket.**

- **İlk tetikleme:** < 100ms
- **Queue:** Redis/RabbitMQ
- **3 Katmanlı Retry:**
  - **Tier 1:** Immediate (100ms, 300ms, 500ms) — transient hatalar
  - **Tier 2:** Short-term (1dk, 5dk, 15dk, 1sa, 4sa) — geçici kesintiler
  - **Tier 3:** Long-term (6sa, 12sa, 24sa, 3-7 gün) — uzun süreli bakım
- **Özel Özellikler:**
  - Tenant isolation
  - Backpressure protection
  - Per-endpoint rate limiting
  - Dead letter queue
- **Ders:** 3 katmanlı retry en kritik iyileştirme

### 2.4 Inngest

**Modern event-driven platform.**

- **Queue:** Redis + PostgreSQL hibrit
- **Özellik:** Step functions, batching
- **Ders:** Batch processing throughput'u artırır

### 2.5 Karşılaştırma Tablosu

| Platform | İlk Tetikleme | Queue | Retry | Dil | Açık Kaynak |
|----------|---------------|-------|-------|-----|-------------|
| **Stripe** | < 1s | Özel | 3 gün | Java/Go | ❌ |
| **Svix** | < 10ms | Redis Streams | Exponential | Rust | ✅ |
| **Hookdeck** | < 100ms | Redis/RabbitMQ | 3 katmanlı | Go | ❌ |
| **Inngest** | < 50ms | Redis+PG | Exponential | Go | ✅ |
| **HookSniff** | 0-1000ms | PostgreSQL | Exponential | Rust | ✅ |
| **HookSniff (hedef)** | **< 10ms** | **Redis Streams** | **3 katmanlı** | **Rust** | ✅ |

---

## 3. Teknik Çözümler

### 3.1 Çözüm #1: Redis Streams Kuyruk Katmanı

**EN BÜYÜK KAZANÇ. Svix'in kullandığı yöntem.**

#### Mevcut Durum
```rust
// api/src/db.rs — PostgreSQL kuyruk
pub async fn publish_to_queue(pool, delivery_id, ...) {
    sqlx::query("INSERT INTO webhook_queue ...").execute(pool).await?;
    // PostgreSQL trigger NOTIFY gönderir
    // Worker 1s poll ile de kontrol eder
}
```

#### Yeni Mimari
```rust
// api/src/queue.rs — Redis Streams kuyruk
pub async fn publish_to_queue(redis, delivery_id, endpoint_id, payload, ...) {
    // 1. Redis Streams'a ekle (sub-millisecond)
    redis.xadd("webhook:queue", &[
        ("delivery_id", delivery_id.to_string()),
        ("endpoint_id", endpoint_id.to_string()),
        ("payload", payload),
    ]).await?;
    
    // 2. PostgreSQL'e de kayıt (storage amaçlı, async)
    // Bu zaten mevcut — deliveries tablosuna INSERT
}
```

#### Worker Değişikliği
```rust
// worker/src/main.rs — Redis Streams consumer
loop {
    // XREADGROUP ile okuma (blocking, sub-millisecond wake)
    let messages = redis.xreadgroup(
        "webhook-consumers",    // consumer group
        "worker-1",             // consumer name
        &["webhook:queue"],     // stream
        ">",                    // yeni mesajlar
        50,                     // batch size
        100,                    // block timeout (ms)
    ).await?;
    
    for msg in messages {
        process_delivery(msg).await;
        // XACK ile onayla
        redis.xack("webhook:queue", "webhook-consumers", &[msg.id]).await;
    }
}
```

#### Kazanç
| Metrik | Önce | Sonra |
|--------|------|-------|
| İlk tetikleme | 0-1000ms | < 1ms |
| NOTIFY kaçırma | 1s gecikme | Yok (Redis blocking read) |
| DB yükü | Depolama + kuyruk | Sadece depolama |
| Ölçeklenme | Sınırlı (PG connections) | Yüksek (Redis consumer groups) |

### 3.2 Çözüm #2: HTTP/2 + Connection Pooling

#### Mevcut Durum
```rust
// worker/src/main.rs
let http_client = reqwest::Client::builder()
    .timeout(Duration::from_secs(5))
    .connect_timeout(Duration::from_secs(2))
    .pool_max_idle_per_host(30)
    .tcp_keepalive(Duration::from_secs(60))
    .tcp_nodelay(true)
    .build()?;
```

#### İyileştirme
```rust
let http_client = reqwest::Client::builder()
    .timeout(Duration::from_secs(5))
    .connect_timeout(Duration::from_secs(2))
    .pool_max_idle_per_host(100)        // 30 → 100
    .pool_idle_timeout(Duration::from_secs(300))  // 60s → 300s
    .tcp_keepalive(Duration::from_secs(300))
    .tcp_nodelay(true)
    .http2_prior_knowledge(true)        // HTTP/2 zorla
    .http2_adaptive_window(true)        // Adaptive flow control
    .http2_keep_alive_interval(Duration::from_secs(30))
    .http2_keep_alive_timeout(Duration::from_secs(10))
    .build()?;
```

#### Kazanç
| Metrik | Önce | Sonra |
|--------|------|-------|
| Connection setup | ~50-100ms | ~0ms (reuse) |
| Concurrent streams | 1/connection | 100+/connection (HTTP/2) |
| Keep-alive | 60s | 300s |

### 3.3 Çözüm #3: 3 Katmanlı Retry Stratejisi

#### Mevcut Durum
```rust
// Exponential backoff: 30s, 60s, 120s, 240s, 480s
fn calculate_backoff(attempt: i32) -> Duration {
    let base = 30;
    let backoff = base * 2_u64.pow(attempt.min(5) as u32);
    Duration::from_secs(backoff)
}
```

#### Yeni Strateji (Hookdeck Modeli)
```rust
fn calculate_backoff(attempt: i32, error_type: ErrorType) -> Duration {
    match error_type {
        // Tier 1: Immediate retries (transient network errors)
        ErrorType::ConnectionReset | ErrorType::DnsTimeout | ErrorType::Timeout => {
            match attempt {
                0 => Duration::from_millis(100),
                1 => Duration::from_millis(300),
                2 => Duration::from_millis(500),
                _ => tier_2_backoff(attempt - 3),
            }
        }
        // Tier 2: Short-term retries (server errors)
        ErrorType::Server5xx | ErrorType::RateLimited => {
            tier_2_backoff(attempt)
        }
        // Tier 3: Long-term retries (extended outages)
        ErrorType::EndpointDown => {
            tier_3_backoff(attempt)
        }
        // Permanent: No retry
        ErrorType::Client4xx => Duration::ZERO,
    }
}

fn tier_2_backoff(attempt: i32) -> Duration {
    // 1min, 5min, 15min, 1hour, 4hours
    let intervals = [60, 300, 900, 3600, 14400];
    let idx = attempt.min(intervals.len() as i32 - 1) as usize;
    Duration::from_secs(intervals[idx])
}

fn tier_3_backoff(attempt: i32) -> Duration {
    // 6hours, 12hours, 24hours (max 3 gün)
    let intervals = [21600, 43200, 86400];
    let idx = attempt.min(intervals.len() as i32 - 1) as usize;
    Duration::from_secs(intervals[idx])
}
```

#### Kazanç
| Durum | Önce | Sonra |
|-------|------|-------|
| Geçici bağlantı hatası | 30s | 100ms |
| 5xx sunucu hatası | 30s | 60s (aynı) |
| Uzun süreli kesinti | Max 5 deneme | 3 gün, 10+ deneme |
| 4xx kalıcı hata | Retry (boşuna) | Direkt DLQ |

### 3.4 Çözüm #4: DNS Cache

#### Mevcut Durum
Her HTTP isteğinde DNS çözümleme yapılıyor (~10-50ms).

#### İyileştirme
```rust
use std::collections::HashMap;
use std::time::{Duration, Instant};

struct DnsCache {
    entries: HashMap<String, DnsCacheEntry>,
    ttl: Duration,
}

struct DnsCacheEntry {
    ip: std::net::IpAddr,
    cached_at: Instant,
}

impl DnsCache {
    fn resolve(&mut self, host: &str) -> Option<std::net::IpAddr> {
        if let Some(entry) = self.entries.get(host) {
            if entry.cached_at.elapsed() < self.ttl {
                return Some(entry.ip);
            }
        }
        None // Cache miss → DNS resolve + cache
    }
}
```

#### Kazanç
| Metrik | Önce | Sonra |
|--------|------|-------|
| DNS çözümleme | ~20ms/call | ~0ms (cache hit) |
| Cache TTL | Yok | 5 dakika |

### 3.5 Çözüm #5: Dynamic Concurrency

#### Mevcut Durum
```rust
const PER_ENDPOINT_CONCURRENCY_LIMIT: usize = 10; // Sabit
```

#### İyileştirme
```rust
async fn get_endpoint_concurrency(endpoint_id: Uuid, avg_latency_ms: u32) -> usize {
    match avg_latency_ms {
        0..=200 => 20,      // Hızlı endpoint → daha fazla concurrency
        201..=1000 => 10,   // Normal → mevcut limit
        1001..=5000 => 5,   // Yavaş → daha az
        _ => 2,             // Çok yavaş → minimal
    }
}
```

#### Kazanç
| Endpoint Tipi | Önce | Sonra |
|---------------|------|-------|
| Hızlı (< 200ms) | 10 concurrent | 20 concurrent |
| Normal | 10 concurrent | 10 concurrent |
| Yavaş (> 1s) | 10 concurrent | 5 concurrent |

### 3.6 Çözüm #6: SSRF Cache

#### Mevcut Durum
Her teslimatta DNS çöz + IP kontrol (~5-20ms).

#### İyileştirme
```rust
// SSRF sonucunu 5 dakika cache'le
struct SsrfCache {
    entries: HashMap<String, SsrfCacheEntry>,
    ttl: Duration,
}

struct SsrfCacheEntry {
    allowed: bool,
    cached_at: Instant,
}
```

#### Kazanç
| Metrik | Önce | Sonra |
|--------|------|-------|
| SSRF kontrolü | ~10ms/call | ~0ms (cache hit) |

### 3.7 Çözüm #7: Batch Queue Okuma

#### Mevcut Durum
Worker tek seferde 50 item çeker ama her biri ayrı işlenir.

#### İyileştirme
```rust
// Aynı endpoint'e giden webhook'ları batch'le
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

---

## 4. Uygulama Planı

### Faz 1: Redis Streams Queue (EN KRİTİK)
- **Süre:** 2-3 oturum
- **Etki:** 1000ms → < 10ms
- **Risk:** Orta (mevcut queue ile paralel çalıştırılabilir)

### Faz 2: HTTP/2 + Connection Pooling
- **Süre:** 1 oturum
- **Etki:** ~50ms/connection → ~0ms
- **Risk:** Düşük

### Faz 3: 3 Katmanlı Retry
- **Süre:** 1-2 oturum
- **Etki:** Geçici hatalarda 30s → 100ms
- **Risk:** Düşük

### Faz 4: DNS + SSRF Cache
- **Süre:** 1 oturum
- **Etki:** ~30ms/call → ~0ms
- **Risk:** Çok düşük

### Faz 5: Dynamic Concurrency
- **Süre:** 1 oturum
- **Etki:** Hızlı endpoint'lerde %100 throughput artışı
- **Risk:** Düşük

### Faz 6: Batch Processing
- **Süre:** 2 oturum
- **Etki:** Yüksek throughput senaryolarında %30-50
- **Risk:** Orta

---

## 5. Beklenen Sonuçlar

### Performans Karşılaştırması

| Metrik | Mevcut | Hedef | Svix | Stripe |
|--------|--------|-------|------|--------|
| İlk tetikleme | 0-1000ms | **< 10ms** | < 10ms | < 1s |
| Connection setup | ~50ms | **~0ms** | ~0ms | ~0ms |
| İlk retry | 30s | **100ms** | 5s | 60s |
| Concurrent delivery | 50 | **200+** | 100+ | N/A |
| Throughput | ~50/s | **500+/s** | 1000+/s | N/A |

### Maliyet Etkisi

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

## 6. Kaynaklar

- [Svix — Redis Message Queue](https://www.svix.com/resources/guides/redis-message-queue/)
- [Svix — Low Latency Message Queue](https://www.svix.com/resources/guides/low-latency-message-queue/)
- [Hookdeck — Webhooks at Scale](https://hookdeck.com/blog/webhooks-at-scale)
- [Hookdeck — Building Reliable Outbound Webhooks](https://hookdeck.com/blog/building-reliable-outbound-webhooks)
- [PostgreSQL LISTEN/NOTIFY Scalability](https://news.ycombinator.com/item?id=44490510)
- [Redis Streams vs PostgreSQL Performance](https://medium.com/redis-with-raphael-de-lio/can-postgres-replace-redis-as-a-cache-f6cba13386dc)
- [Stripe Webhook Architecture](https://news.ycombinator.com/item?id=27824944)

---

*Bu rapor HookSniff'in en hızlı webhook platform olması için hazırlanmıştır.*
*Son güncelleme: 2026-05-26*
