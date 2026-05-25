# 🔧 Webhook Hızlandırma — Teknik Detaylar

> **Tarih:** 2026-05-26
> **Amaç:** Her faz için kod örnekleri, konfigürasyon ve test talimatları

---

## 1. Redis Streams — Tam Implementasyon

### 1.1 Cargo.toml Değişiklikleri

```toml
# api/Cargo.toml
[dependencies]
redis = { version = "0.25", features = ["streams", "tokio-comp", "connection-manager"] }

# worker/Cargo.toml
[dependencies]
redis = { version = "0.25", features = ["streams", "tokio-comp", "connection-manager"] }
```

### 1.2 Upstash Redis Bağlantısı

```rust
// Mevcut Upstash Redis zaten kurulu (.env.production.example'de REDIS_URL var)
// Sadece queue olarak kullanmıyoruz — şimdi kullanacağız

// api/src/queue.rs
use redis::aio::ConnectionManager;

pub async fn connect_redis() -> Result<ConnectionManager> {
    let redis_url = std::env::var("REDIS_URL")
        .expect("REDIS_URL must be set");
    
    let client = redis::Client::open(redis_url)?;
    let conn = ConnectionManager::new(client).await?;
    
    tracing::info!("✅ Redis connected for queue");
    Ok(conn)
}
```

### 1.3 Stream Configuration

```rust
// Stream key
const STREAM_KEY: &str = "hooksniff:webhooks";
const CONSUMER_GROUP: &str = "hooksniff-workers";
const MAX_STREAM_LEN: usize = 100_000; // Max mesaj sayısı (memory limit)

// XADD ile ekleme (MAXLEN ile otomatik temizleme)
pub async fn enqueue(&mut self, msg: &QueueMessage) -> Result<String> {
    let id: String = redis::cmd("XADD")
        .arg(STREAM_KEY)
        .arg("MAXLEN").arg("~").arg(MAX_STREAM_LEN) // Otomatik trim
        .arg("*")
        .arg("delivery_id").arg(msg.delivery_id.to_string())
        .arg("endpoint_id").arg(msg.endpoint_id.to_string())
        .arg("url").arg(&msg.url)
        .arg("payload").arg(&msg.payload)
        .arg("headers").arg(msg.headers.as_deref().unwrap_or("{}"))
        .arg("retry_count").arg(msg.retry_count)
        .query_async(&mut self.conn)
        .await?;
    
    Ok(id)
}
```

### 1.4 Consumer Group Okuma

```rust
// worker/src/queue.rs
pub async fn read_messages(&mut self, count: usize) -> Result<Vec<QueueMessage>> {
    let opts = StreamReadOptions::default()
        .count(count)
        .block(100) // 100ms blocking (sub-millisecond wake on new message)
        .group(CONSUMER_GROUP, &self.consumer_name);
    
    let result: StreamReadReply = self.conn.xread_options(
        &[STREAM_KEY], &[">"], &opts
    ).await?;
    
    let mut messages = Vec::new();
    for stream in result.keys {
        for entry in stream.ids {
            let msg = QueueMessage {
                stream_id: entry.id.clone(),
                delivery_id: parse_uuid(entry.get("delivery_id"))?,
                endpoint_id: parse_uuid(entry.get("endpoint_id"))?,
                url: entry.get("unwrap_or_default")?,
                payload: entry.get("unwrap_or_default")?,
                headers: entry.get("headers").map(|s: String| serde_json::from_str(&s).ok()).flatten(),
                retry_count: entry.get("unwrap_or_default", "0").parse()?,
            };
            messages.push(msg);
        }
    }
    
    Ok(messages)
}
```

### 1.5 Consumer Group Oluşturma (İlk Başlatma)

```rust
pub async fn ensure_consumer_group(&mut self) -> Result<()> {
    // XGROUP CREATE hooksniff:webhooks hooksniff-workers 0 MKSTREAM
    let result: Result<(), _> = redis::cmd("XGROUP")
        .arg("CREATE")
        .arg(STREAM_KEY)
        .arg(CONSUMER_GROUP)
        .arg("0")
        .arg("MKSTREAM")
        .query_async(&mut self.conn)
        .await;
    
    match result {
        Ok(_) => tracing::info!("✅ Consumer group '{}' created", CONSUMER_GROUP),
        Err(e) => {
            if e.to_string().contains("BUSYGROUP") {
                tracing::info!("ℹ️ Consumer group '{}' already exists", CONSUMER_GROUP);
            } else {
                return Err(e.into());
            }
        }
    }
    
    Ok(())
}
```

### 1.6 Pending Message Recovery (Crash Recovery)

```rust
/// Crash sonrası yarım kalan mesajları geri al
pub async fn claim_pending(&mut self) -> Result<Vec<QueueMessage>> {
    // XAUTOCLAIM: 5 dakikadan eski pending mesajları geri al
    let result: (String, Vec<String>, Vec<StreamId>) = redis::cmd("XAUTOCLAIM")
        .arg(STREAM_KEY)
        .arg(CONSUMER_GROUP)
        .arg(&self.consumer_name)
        .arg(300_000) // 5 dakika (ms)
        .arg("0-0")
        .query_async(&mut self.conn)
        .await?;
    
    let (_, _, entries) = result;
    let mut messages = Vec::new();
    for entry in entries {
        // Parse same as read_messages
        messages.push(parse_stream_entry(entry)?);
    }
    
    Ok(messages)
}
```

---

## 2. HTTP/2 Konfigürasyonu

### 2.1 Full HTTP Client Config

```rust
// worker/src/main.rs
let http_client = reqwest::Client::builder()
    // Timeout
    .timeout(Duration::from_secs(5))
    .connect_timeout(Duration::from_secs(2))
    
    // Connection Pool
    .pool_max_idle_per_host(100)
    .pool_idle_timeout(Duration::from_secs(300))
    
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

### 2.2 HTTP/2 Avantajları

```
HTTP/1.1:  Her istek → yeni TCP bağlantısı (veya pipelining)
HTTP/2:    Tek bağlantı → birden fazla stream (multiplexing)

Örnek:
- 10 webhook, aynı endpoint'e
- HTTP/1.1: 10 bağlantı × 50ms = 500ms
- HTTP/2:   1 bağlantı × 50ms = 50ms (+ multiplexing overhead ~0ms)
```

---

## 3. 3 Katmanlı Retry — Tam Implementasyon

### 3.1 Error Classifier

```rust
// worker/src/helpers.rs

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
            let error_lower = error.to_lowercase();
            if error_lower.contains("connection refused") 
                || error_lower.contains("connection reset")
                || error_lower.contains("dns")
                || error_lower.contains("timed out")
                || error_lower.contains("timeout") 
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

### 3.2 Tiered Backoff Calculator

```rust
pub fn calculate_backoff(
    attempt: i32, 
    category: &RetryCategory, 
    retry_after_header: Option<u64>
) -> Duration {
    match category {
        // ── Tier 1: Immediate Retries ──
        // 100ms, 300ms, 500ms → sonra Tier 2'ye geç
        RetryCategory::Transient => {
            match attempt {
                0 => Duration::from_millis(100),
                1 => Duration::from_millis(300),
                2 => Duration::from_millis(500),
                _ => tier_2_backoff(attempt - 3),
            }
        }
        
        // ── Tier 2: Short-term Retries ──
        // 1m, 5m, 15m, 1h, 4h
        RetryCategory::ServerError => tier_2_backoff(attempt),
        
        // ── Rate Limited ──
        // Retry-After header'ını kullan, yoksa 60s
        RetryCategory::RateLimited => {
            let secs = retry_after_header.unwrap_or(60);
            Duration::from_secs(secs.min(3600)) // Max 1 saat
        }
        
        // ── Tier 3: Long-term Retries ──
        // 6h, 12h, 24h (max 3 gün = ~12 retry)
        RetryCategory::EndpointDown => tier_3_backoff(attempt),
        
        // ── Permanent: No Retry ──
        RetryCategory::Permanent => Duration::ZERO,
    }
}

/// Tier 2: Kısa vadeli retry'lar
fn tier_2_backoff(attempt: i32) -> Duration {
    // Exponential: 1m, 5m, 15m, 1h, 4h
    let intervals = [60, 300, 900, 3600, 14400];
    let idx = (attempt as usize).min(intervals.len() - 1);
    Duration::from_secs(intervals[idx])
}

/// Tier 3: Uzun vadeli retry'lar
fn tier_3_backoff(attempt: i32) -> Duration {
    // 6h, 12h, 24h
    let intervals = [21600, 43200, 86400];
    let idx = (attempt as usize).min(intervals.len() - 1);
    Duration::from_secs(intervals[idx])
}

/// Jitter ekle (thundering herd prevention)
pub fn with_jitter(duration: Duration) -> Duration {
    use rand::Rng;
    let jitter = rand::thread_rng().gen_range(0.8..1.2);
    Duration::from_millis((duration.as_millis() as f64 * jitter) as u64)
}
```

### 3.3 Max Attempts Hesaplama

```rust
pub fn max_attempts_for_category(category: &RetryCategory) -> i32 {
    match category {
        RetryCategory::Transient => 5,      // 5 deneme (toplam ~1s)
        RetryCategory::ServerError => 5,    // 5 deneme (toplam ~4h)
        RetryCategory::RateLimited => 3,    // 3 deneme
        RetryCategory::EndpointDown => 12,  // 12 deneme (toplam ~3 gün)
        RetryCategory::Permanent => 0,      // 0 deneme
    }
}
```

---

## 4. DNS Cache — Implementasyon

### 4.1 LRU Cache

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
        Self {
            entries: HashMap::new(),
            ttl,
            max_entries,
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
        // LRU eviction
        if self.entries.len() >= self.max_entries {
            self.evict_oldest();
        }
        
        self.entries.insert(host, CacheEntry {
            ip,
            cached_at: Instant::now(),
        });
    }
    
    fn evict_oldest(&mut self) {
        if let Some(oldest_key) = self.entries.iter()
            .min_by_key(|(_, entry)| entry.cached_at)
            .map(|(k, _)| k.clone()) 
        {
            self.entries.remove(&oldest_key);
        }
    }
    
    /// Periyodik temizleme (her 5 dakikada bir çağır)
    pub fn cleanup(&mut self) {
        self.entries.retain(|_, entry| entry.cached_at.elapsed() < self.ttl);
    }
}
```

### 4.2 SSRF Cache

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

---

## 5. Grafana Metrikleri

### 5.1 Yeni Metrikler

```rust
// worker/src/metrics.rs

// Queue latency (Redis Streams)
pub static QUEUE_LATENCY_MS: AtomicU64 = AtomicU64::new(0);

// Tier-1 retry count
pub static TIER1_RETRY_COUNT: AtomicU64 = AtomicU64::new(0);

// DNS cache hit rate
pub static DNS_CACHE_HIT: AtomicU64 = AtomicU64::new(0);
pub static DNS_CACHE_MISS: AtomicU64 = AtomicU64::new(0);

// HTTP/2 connection reuse
pub static HTTP2_CONNECTION_REUSE: AtomicU64 = AtomicU64::new(0);
```

### 5.2 Grafana Dashboard Panel'leri

```json
{
  "panels": [
    {
      "title": "Queue Latency (ms)",
      "targets": [{"expr": "hooksniff_queue_latency_ms"}],
      "thresholds": [
        {"value": 10, "color": "green"},
        {"value": 100, "color": "yellow"},
        {"value": 1000, "color": "red"}
      ]
    },
    {
      "title": "DNS Cache Hit Rate",
      "targets": [{"expr": "rate(hooksniff_dns_cache_hit[5m]) / (rate(hooksniff_dns_cache_hit[5m]) + rate(hooksniff_dns_cache_miss[5m]))"}]
    },
    {
      "title": "Retry Distribution",
      "targets": [
        {"expr": "hooksniff_tier1_retry_count", "legendFormat": "Tier 1 (Immediate)"},
        {"expr": "hooksniff_tier2_retry_count", "legendFormat": "Tier 2 (Short-term)"},
        {"expr": "hooksniff_tier3_retry_count", "legendFormat": "Tier 3 (Long-term)"}
      ]
    }
  ]
}
```

---

## 6. Eksik Parçalar (PLAN v2'de Giderilen)

### 6.1 Signing Secret Cache
- Mevcut: Her `process_pending` batch'inde DB sorgusu
- Yeni: `worker/src/secret_cache.rs` — 5 dakika TTL ile in-memory cache
- Redis queue'da signing secret payload'da yok, cache'ten alınacak

### 6.2 Consumer Name Uniqueness
- Her worker instance unique consumer name kullanmalı
- Format: `worker-{pid}` veya `worker-{hostname}-{pid}`
- Aksi halde mesajlar yanlış worker'a gider

### 6.3 XAUTOCLAIM (Crash Recovery)
- Worker crash olursa, processing'de kalan mesajlar "stuck" olur
- XAUTOCLAIM ile 5 dk+ pending mesajları geri al
- Her worker restart'ta bir kez çalıştır

### 6.4 HTTP/2 TLS Sorunu
- `http2_prior_knowledge(true)` = H2C (TLS yok)
- Müşteri endpoint'leri HTTPS gerektirir
- Çözüm: İki client (H2C iç servisler, HTTPS müşteriler)

### 6.5 Grafana Metrikleri (Yeni)
```rust
// Queue tipi (0=PG, 1=Redis)
pub static QUEUE_TYPE: AtomicU8 = AtomicU8::new(0);
// Redis queue latency (microseconds)
pub static REDIS_QUEUE_LATENCY_US: AtomicU64 = AtomicU64::new(0);
// Redis queue errors
pub static REDIS_QUEUE_ERRORS: AtomicU64 = AtomicU64::new(0);
// PG fallback count (Redis yoksa)
pub static PG_QUEUE_FALLBACK: AtomicU64 = AtomicU64::new(0);
// Signing secret cache hit/miss
pub static SECRET_CACHE_HIT: AtomicU64 = AtomicU64::new(0);
pub static SECRET_CACHE_MISS: AtomicU64 = AtomicU64::new(0);
```

---

## 7. Test Talimatları

### 6.1 Redis Streams Test

```bash
# Redis'e mesaj ekle
redis-cli XADD hooksniff:webhooks '*' delivery_id 'test-1' endpoint_id 'ep-1' payload '{"test":true}'

# Consumer group oluştur
redis-cli XGROUP CREATE hooksniff:webhooks test-group 0 MKSTREAM

# Mesajları oku
redis-cli XREADGROUP GROUP test-group consumer-1 COUNT 10 BLOCK 1000 STREAMS hooksniff:webhooks '>'

# Stream durumunu kontrol et
redis-cli XINFO STREAM hooksniff:webhooks
redis-cli XINFO GROUPS hooksniff:webhooks
```

### 6.2 Latency Test

```bash
# Webhook gönder ve süreyi ölç
time curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"endpoint_id": "$EP_ID", "event": "test.speed", "data": {"ts": "'$(date +%s%N)'"}}'

# Grafana'da queue_latency_ms metric'ini kontrol et
```

### 6.3 Load Test

```bash
# k6 ile load test
k6 run --vus 50 --duration 60s tests/load/webhook_speed_test.js
```

---

## 7. Rollback Planı

### Her faz için:

```bash
# 1. Mevcut commit'i kaydet
git tag pre-faz-N

# 2. Yeni kodu deploy et

# 3. Sorun olursa geri al
git checkout pre-faz-N
# Cloud Build ile tekrar deploy
```

### Redis Streams Rollback:

```bash
# Redis queue'yu devre dışı bırak, PostgreSQL queue'ya geri dön
# Environment variable: USE_REDIS_QUEUE=false
# Worker otomatik olarak PostgreSQL LISTEN/NOTIFY'a geri döner
```

---

*Bu dosya webhook hızlandırma projesinin teknik detaylarını içerir.*
*Son güncelleme: 2026-05-26*
