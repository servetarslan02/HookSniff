# 📋 Webhook Hızlandırma — KESİN FİNAL PLAN (v4)

> **Tarih:** 2026-05-26
> **Durum:** Tam — uygulanmaya hazır
> **Ek Maliyet:** $0

---

## ⚙️ Mevcut Kod Referansları (Doğrulanmış)

| Bileşen | Dosya | Mevcut | Doğrulandı |
|---------|-------|--------|------------|
| Redis dep. | `api/Cargo.toml` | `redis = { version = "1", features = ["tokio-rustls-comp", "connection-manager", "script"] }` | ✅ `streams` EKSIK |
| Redis dep. | `worker/Cargo.toml` | `redis = { version = "1", features = ["tokio-rustls-comp", "connection-manager"] }` | ✅ `streams` EKSIK |
| WebhookMessage | `worker/src/types.rs` | `delivery_id: String, endpoint_id: String` | ✅ String tipi |
| WebhookQueueItem | `worker/src/types.rs` | `delivery_id: Uuid, endpoint_id: Uuid` | ✅ Uuid tipi |
| publish_to_queue | `api/src/db.rs:163` | `(pool, delivery_id: Uuid, endpoint_id: Uuid, url, payload, headers)` | ✅ |
| process_pending | `worker/src/main.rs:463` | PG `FOR UPDATE SKIP LOCKED` ile 50 item batch | ✅ |
| Circuit breaker | `worker/src/circuit_breaker.rs` | `allow_request(endpoint_id) → bool` | ✅ |
| Throttle | `worker/src/throttle.rs` | `check_allowed(endpoint_id) → Result<(), Duration>` | ✅ |
| FIFO | `worker/src/fifo.rs` | `should_deliver_fifo(pool, endpoint_id) → Result<bool>` | ✅ |
| deliver_http | `worker/src/delivery/http.rs` | `(http_client, webhook: &WebhookMessage, attempt) → Result<DeliveryResult>` | ✅ |
| ConnectionManager | `redis` crate v1.2.1 | `impl Clone` | ✅ Clone edilebilir |
| Signing secret | `process_pending` | Batch fetch: `SELECT id, signing_secret FROM endpoints WHERE id = ANY($1)` | ✅ |
| Idempotency | `process_pending` | `SELECT status::text FROM deliveries WHERE id = $1` | ✅ |
| Dead letter | `process_pending` | `INSERT INTO dead_letters` + `UPDATE deliveries SET status = 'failed'` | ✅ |
| Response truncation | `process_pending` | 500 byte | ✅ |

---

## Faz 1: Redis Streams Queue

### Adım 1.0: Cargo.toml

```toml
# api/Cargo.toml — "streams" ekle
redis = { version = "1", default-features = false, features = ["tokio-rustls-comp", "connection-manager", "script", "streams"] }

# worker/Cargo.toml — "streams" ekle
redis = { version = "1", default-features = false, features = ["tokio-rustls-comp", "connection-manager", "streams"] }
```

### Adım 1.1: api/src/queue.rs (YENİ)

```rust
use anyhow::Result;
use redis::aio::ConnectionManager;
use redis::streams::{StreamReadOptions, StreamReadReply};
use uuid::Uuid;

const STREAM_KEY: &str = "hooksniff:webhooks";
const CONSUMER_GROUP: &str = "hooksniff-workers";
const MAX_STREAM_LEN: usize = 100_000;

#[derive(Debug, Clone)]
pub struct RedisQueue {
    conn: ConnectionManager,  // Clone implement ediyor ✅
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct QueueMessage {
    pub delivery_id: String,   // String — WebhookMessage ile uyumlu
    pub endpoint_id: String,   // String — WebhookMessage ile uyumlu
    pub endpoint_url: String,
    pub payload: String,
    pub custom_headers: Option<serde_json::Value>,
    pub signing_secret: String, // Batch fetch'ten gelecek
    pub trace_id: Option<String>,
    pub attempt_count: i32,
    pub max_attempts: i32,
    pub queue_item_id: String,  // webhook_queue.id (PG uyumluluk için)
}

impl RedisQueue {
    pub async fn new(redis_url: &str) -> Result<Self> {
        let client = redis::Client::open(redis_url)?;
        let mut conn = ConnectionManager::new(client).await?;
        let _: Result<(), _> = redis::cmd("XGROUP")
            .arg("CREATE").arg(STREAM_KEY).arg(CONSUMER_GROUP)
            .arg("0").arg("MKSTREAM")
            .query_async(&mut conn).await;
        Ok(Self { conn })
    }

    pub async fn enqueue(&mut self, msg: &QueueMessage) -> Result<String> {
        let headers_str = msg.custom_headers.as_ref()
            .map(|h| serde_json::to_string(h).unwrap_or_default())
            .unwrap_or_default();
        let id: String = redis::cmd("XADD")
            .arg(STREAM_KEY).arg("MAXLEN").arg("~").arg(MAX_STREAM_LEN)
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

    pub async fn read_batch(&mut self, consumer_name: &str, count: usize, block_ms: usize)
        -> Result<Vec<(String, QueueMessage)>>
    {
        let opts = StreamReadOptions::default()
            .count(count).block(block_ms)
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

    pub async fn ack(&mut self, stream_id: &str) -> Result<()> {
        redis::cmd("XACK").arg(STREAM_KEY).arg(CONSUMER_GROUP).arg(stream_id)
            .query_async(&mut self.conn).await?;
        Ok(())
    }

    pub async fn claim_pending(&mut self, consumer_name: &str)
        -> Result<Vec<(String, QueueMessage)>>
    {
        let result: (String, Vec<String>, Vec<redis::streams::StreamId>) =
            redis::cmd("XAUTOCLAIM")
                .arg(STREAM_KEY).arg(CONSUMER_GROUP).arg(consumer_name)
                .arg(300_000).arg("0-0")
                .query_async(&mut self.conn).await?;
        let (_, _, entries) = result;
        entries.into_iter().map(|e| Ok((e.id.clone(), parse_entry(&e)?))).collect()
    }
}

fn get_field(entry: &redis::streams::StreamId, field: &str) -> Result<String> {
    entry.get(field).ok_or_else(|| anyhow::anyhow!("Missing field: {}", field))
}

fn parse_entry(entry: &redis::streams::StreamId) -> Result<QueueMessage> {
    Ok(QueueMessage {
        delivery_id: get_field(entry, "delivery_id")?,
        endpoint_id: get_field(entry, "endpoint_id")?,
        endpoint_url: get_field(entry, "url").unwrap_or_default(),
        payload: get_field(entry, "payload").unwrap_or_default(),
        custom_headers: get_field(entry, "headers").ok().and_then(|s| serde_json::from_str(&s).ok()),
        signing_secret: get_field(entry, "signing_secret").unwrap_or_default(),
        trace_id: get_field(entry, "trace_id").ok().filter(|s| !s.is_empty()),
        attempt_count: get_field(entry, "attempt").unwrap_or("0".into()).parse().unwrap_or(0),
        max_attempts: get_field(entry, "max_attempts").unwrap_or("5".into()).parse().unwrap_or(5),
        queue_item_id: get_field(entry, "queue_item_id").unwrap_or_default(),
    })
}
```

### Adım 1.2: api/src/main.rs — Modül + Redis Bağlantısı

```rust
mod queue; // Ekle

// Startup'ta:
let redis_queue = config::resolve_redis_url()
    .and_then(|url| {
        futures::executor::block_on(queue::RedisQueue::new(&url)).ok()
    });
if redis_queue.is_some() { tracing::info!("✅ Redis Streams queue active"); }
app = app.layer(Extension(redis_queue));
```

### Adım 1.3: api/src/db.rs — publish_to_queue (Redis-first + PG fallback)

```rust
pub async fn publish_to_queue(
    pool: &PgPool,
    redis_queue: Option<&mut queue::RedisQueue>,  // YENİ parametre
    delivery_id: uuid::Uuid,
    endpoint_id: uuid::Uuid,
    endpoint_url: &str,
    payload: &str,
    custom_headers: Option<&serde_json::Value>,
) -> Result<()> {
    let trace_id = crate::telemetry::current_trace_id();

    // 1. Redis'e yaz (hızlı)
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
        if let Ok(_) = redis.enqueue(&msg).await {
            tracing::debug!("📤 Webhook {} queued to Redis", delivery_id);
            return Ok(()); // Redis başarılı → PG'ye gerek yok
        }
        tracing::warn!("⚠️ Redis enqueue failed, falling back to PG");
    }

    // 2. PostgreSQL fallback
    sqlx::query(
        "INSERT INTO webhook_queue (delivery_id, endpoint_id, endpoint_url, payload, custom_headers, trace_id) VALUES ($1, $2, $3, $4, $5, $6)"
    )
    .bind(delivery_id).bind(endpoint_id).bind(endpoint_url)
    .bind(payload).bind(custom_headers).bind(&trace_id)
    .execute(pool).await?;
    Ok(())
}
```

### Adım 1.4: worker/src/queue.rs (YENİ — api'deki ile aynı)

api/src/queue.rs'nin kopyası. Veya `common/` klasörüne taşı, her iki taraf da kullansın.

### Adım 1.5: worker/src/secret_cache.rs (YENİ)

```rust
use std::collections::HashMap;
use std::time::{Duration, Instant};

pub struct SecretCache {
    entries: HashMap<String, (String, Instant)>,  // endpoint_id → (secret, cached_at)
    ttl: Duration,
}

impl SecretCache {
    pub fn new(ttl: Duration) -> Self {
        Self { entries: HashMap::new(), ttl }
    }

    pub fn get(&self, endpoint_id: &str) -> Option<&str> {
        self.entries.get(endpoint_id).and_then(|(secret, cached_at)| {
            if cached_at.elapsed() < self.ttl { Some(secret.as_str()) } else { None }
        })
    }

    pub fn insert(&mut self, endpoint_id: String, secret: String) {
        self.entries.insert(endpoint_id, (secret, Instant::now()));
    }

    pub fn cleanup(&mut self) {
        self.entries.retain(|_, (_, cached_at)| cached_at.elapsed() < self.ttl);
    }
}
```

### Adım 1.6: worker/src/main.rs — Ana Loop Değişikliği

```rust
// Worker başında:
mod queue;
mod secret_cache;

let mut redis_queue = cfg.redis_url.as_deref().and_then(|url| {
    futures::executor::block_on(queue::RedisQueue::new(url)).ok()
});

let consumer_name = format!("worker-{}", std::process::id());
let signing_cache = Arc::new(Mutex::new(secret_cache::SecretCache::new(Duration::from_secs(300))));

// Crash recovery
if let Some(ref mut rq) = redis_queue {
    if let Ok(recovered) = rq.claim_pending(&consumer_name).await {
        if !recovered.is_empty() {
            tracing::warn!("🔄 Recovered {} pending messages", recovered.len());
        }
    }
}

// Ana loop:
loop {
    tokio::select! {
        _ = &mut shutdown => { break; }

        // Redis queue
        result = async {
            if let Some(ref mut rq) = redis_queue {
                rq.read_batch(&consumer_name, 50, 100).await
            } else { futures::future::pending().await }
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
                            process_queue_message(&pool, &http_client, &msg, sem, ep_sems, cb, tm, cache).await;
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

        // PG fallback
        _ = tokio::time::sleep(Duration::from_secs(1)), if redis_queue.is_none() => {
            let _ = process_pending(&pool, &http_client, &cfg, delivery_semaphore.clone(), endpoint_semaphores.clone(), circuit_breaker.clone(), throttle_manager.clone()).await;
        }

        // Zombie reaper (her iki mod için)
        _ = reaper_interval.tick() => { /* mevcut logic */ }
    }
}
```

### Adım 1.7: process_queue_message (Mevcut process_pending ile uyumlu)

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

    // 1. Idempotency guard (mevcut process_pending ile aynı)
    if let Ok(Some((status,))) = sqlx::query_as::<_, (String,)>(
        "SELECT status::text FROM deliveries WHERE id = $1"
    ).bind(delivery_id).fetch_optional(pool).await {
        if status == "delivered" {
            tracing::info!("⏭️ {} already delivered", delivery_id);
            return;
        }
    }

    // 2. Circuit breaker (mevcut: allow_request)
    if !cb.allow_request(endpoint_id).await {
        tracing::warn!("⚡ Circuit open for {}", endpoint_id);
        requeue_with_delay(pool, &msg.queue_item_id, 60).await;
        return;
    }

    // 3. FIFO check (mevcut: should_deliver_fifo)
    if !fifo::should_deliver_fifo(pool, endpoint_id).await.unwrap_or(true) {
        tracing::debug!("📦 FIFO wait for {}", endpoint_id);
        requeue_with_delay(pool, &msg.queue_item_id, 5).await;
        return;
    }

    // 4. Signing secret (cache → mevcut batch pattern)
    let signing_secret = if !msg.signing_secret.is_empty() {
        msg.signing_secret.clone()
    } else if let Some(s) = cache.lock().await.get(&msg.endpoint_id) {
        s.to_string()
    } else {
        // DB'den çek + cache'e ekle
        let secret = sqlx::query_scalar::<_, String>(
            "SELECT signing_secret FROM endpoints WHERE id = $1"
        ).bind(endpoint_id).fetch_optional(pool).await.ok().flatten().unwrap_or_default();
        cache.lock().await.insert(msg.endpoint_id.clone(), secret.clone());
        secret
    };

    if signing_secret.is_empty() {
        tracing::error!("❌ No signing_secret for {}", endpoint_id);
        mark_dead_letter(pool, delivery_id, "Endpoint signing secret missing", attempt).await;
        return;
    }

    // 5. Concurrency (mevcut pattern)
    let ep_sem = {
        let mut map = endpoint_semaphores.lock().await;
        map.entry(endpoint_id).or_insert_with(|| Arc::new(Semaphore::new(PER_ENDPOINT_CONCURRENCY_LIMIT))).clone()
    };
    let _ep_permit = ep_sem.acquire().await;
    let _permit = semaphore.acquire().await;

    // 6. HTTP delivery (mevcut: deliver_http)
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
    let _duration = start.elapsed();

    // 7. Sonuç işleme (mevcut process_pending ile aynı pattern)
    match result {
        Ok(dr) if dr.success => {
            // Başarılı (mevcut: UPDATE deliveries SET status='delivered')
            commit_delivery(pool, delivery_id, &dr).await;
            cb.record_success(endpoint_id).await;
            tm.record_success(endpoint_id).await;
        }
        Ok(dr) if is_retryable(dr.status_code) && attempt < msg.max_attempts => {
            // Retry (mevcut: UPDATE webhook_queue SET status='pending', next_retry_at)
            schedule_retry(pool, &msg.queue_item_id, &msg.delivery_id, attempt, &dr).await;
            cb.record_failure(endpoint_id).await;
            tm.record_attempt(endpoint_id).await;
        }
        Ok(dr) => {
            // Dead letter (mevcut: INSERT INTO dead_letters + UPDATE deliveries SET status='failed')
            mark_dead_letter(pool, delivery_id, &dr.error, attempt).await;
            cb.record_failure(endpoint_id).await;
        }
        Err(e) if attempt < msg.max_attempts => {
            schedule_retry(pool, &msg.queue_item_id, &msg.delivery_id, attempt, &DeliveryResult { error: e.to_string(), ..Default::default() }).await;
            cb.record_failure(endpoint_id).await;
            tm.record_attempt(endpoint_id).await;
        }
        Err(e) => {
            mark_dead_letter(pool, delivery_id, &e.to_string(), attempt).await;
            cb.record_failure(endpoint_id).await;
        }
    }
}

// Helper fonksiyonlar (mevcut process_pending'deki pattern'ler)
fn is_retryable(status: i32) -> bool { matches!(status, 408 | 429 | 500..=599) }

async fn requeue_with_delay(pool: &PgPool, queue_item_id: &str, delay_secs: i64) {
    let _ = sqlx::query("UPDATE webhook_queue SET status='pending', next_retry_at=now()+$1::interval WHERE id=$2")
        .bind(format!("{} seconds", delay_secs)).bind(queue_item_id).execute(pool).await;
}

async fn commit_delivery(pool: &PgPool, delivery_id: Uuid, dr: &DeliveryResult) {
    let _ = sqlx::query("UPDATE deliveries SET status='delivered', attempt_count=attempt_count+1, response_status=$1, response_body=$2, updated_at=now() WHERE id=$3")
        .bind(dr.status_code).bind(&dr.response_body[..dr.response_body.len().min(500)]).bind(delivery_id).execute(pool).await;
    let _ = sqlx::query("UPDATE webhook_queue SET status='delivered', processed_at=now() WHERE delivery_id=$1")
        .bind(delivery_id).execute(pool).await;
}

async fn schedule_retry(pool: &PgPool, queue_item_id: &str, delivery_id: &str, attempt: i32, dr: &DeliveryResult) {
    let category = classify_error(Some(dr.status_code), &dr.error, false);
    let backoff = calculate_backoff(attempt, &category, None);
    let next = Utc::now() + chrono::Duration::from_std(backoff).unwrap_or(chrono::Duration::seconds(60));
    let _ = sqlx::query("UPDATE webhook_queue SET status='pending', attempt_count=$1, next_retry_at=$2 WHERE id=$3")
        .bind(attempt).bind(next).bind(queue_item_id).execute(pool).await;
}

async fn mark_dead_letter(pool: &PgPool, delivery_id: Uuid, reason: &str, attempts: i32) {
    let _ = sqlx::query("UPDATE webhook_queue SET status='dead_letter', processed_at=now() WHERE delivery_id=$1")
        .bind(delivery_id).execute(pool).await;
    let _ = sqlx::query("UPDATE deliveries SET status='failed', error_message=$1, updated_at=now() WHERE id=$2")
        .bind(reason).bind(delivery_id).execute(pool).await;
    let _ = sqlx::query("INSERT INTO dead_letters (delivery_id, endpoint_id, customer_id, payload, reason, attempts) SELECT id, endpoint_id, customer_id, payload, $2, $3 FROM deliveries WHERE id=$1")
        .bind(delivery_id).bind(reason).bind(attempts).execute(pool).await;
}
```

---

## Faz 2-6: Değişiklik Yok (Plan v2 geçerli)

- Faz 2: HTTP/2 config ✅
- Faz 3: 3 katmanlı retry ✅
- Faz 4: DNS cache ✅
- Faz 5: Dynamic concurrency ✅
- Faz 6: Batch processing ✅

---

## Doğrulama Checklist (Final)

### Faz 1
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

### Faz 2-6
- [ ] HTTP/2 config → cargo check
- [ ] Retry tiers → transient 100ms, server 60s
- [ ] DNS cache → %90+ hit rate
- [ ] Dynamic concurrency → hızlı endpoint 20 concurrent
- [ ] Batch → throughput artışı

---

*Bu plan v4 — KESİN FİNAL. Mevcut kodla birebir uyumlu.*
*Son güncelleme: 2026-05-26*
