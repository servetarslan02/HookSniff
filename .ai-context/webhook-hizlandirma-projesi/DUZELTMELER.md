# 🔧 Plan Düzeltmeleri — v3 Final

> **Tarih:** 2026-05-26
> **Amaç:** Son incelemede bulunan 7 kritik sorunun düzeltmesi

---

## ❌ Bulunan Sorunlar ve Düzeltmeler

### Sorun 1: WebhookMessage Type Mismatch

**Problem:** Plan'da `QueueMessage.delivery_id: Uuid` ama mevcut `WebhookMessage.delivery_id: String`

**Düzeltme:**
```rust
// Plan'daki QueueMessage'ı mevcut tiple uyumlu yap
pub struct QueueMessage {
    pub delivery_id: String,   // String olmalı (WebhookMessage ile uyumlu)
    pub endpoint_id: String,   // String olmalı
    pub endpoint_url: String,
    pub payload: String,
    pub custom_headers: Option<serde_json::Value>,
    pub trace_id: Option<String>,
    pub attempt_count: i32,
    pub max_attempts: i32,
}
```

### Sorun 2: Circuit Breaker Method Adı

**Problem:** Plan'da `circuit_breaker.is_open()` ama mevcut method `allow_request()`

**Düzeltme:**
```rust
// ESKİ (yanlış):
if circuit_breaker.is_open(msg.endpoint_id).await { ... }

// YENİ (doğru):
if !circuit_breaker.allow_request(msg.endpoint_id).await {
    tracing::warn!("⚡ Circuit open for endpoint {}", msg.endpoint_id);
    return;
}
```

### Sorun 3: Worker Loop — redis_queue Clone (YANLIŞ ALARM ✅)

**Düzeltme:** `ConnectionManager` Clone implement ediyor (docs.rs: `impl Clone for ConnectionManager`). `RedisQueue`'ya `#[derive(Clone)]` eklenebilir, `tokio::spawn` içinde clone çalışır.

**Doğru yaklaşım (Plan v2'deki gibi):**
```rust
for (stream_id, msg) in messages {
    let mut rq = redis_queue.clone(); // ✅ Çalışır
    tokio::spawn(async move {
        process_queue_message(...).await;
        let _ = rq.ack(&stream_id).await; // ✅ Spawn içinde ack yapılabilir
    });
}
```

**NOT:** `RedisQueue` struct'ına `#[derive(Clone)]` eklenmeli.

### Sorun 4: Eksik Fonksiyon Implementasyonları

**Problem:** `process_queue_message` içinde `get_signing_secret`, `commit_delivery`, `schedule_retry`, `mark_failed`, `is_retryable` tanımlanmamış.

**Düzeltme:** Bu fonksiyonlar mevcut `process_pending` içinde zaten var. Onlardan çıkarılıp ayrı fonksiyonlara dönüştürülecek:

```rust
/// Signing secret'ı cache'ten veya DB'den al
async fn get_signing_secret(
    pool: &PgPool, 
    endpoint_id: &str,  // String tipi
    cache: &Arc<Mutex<SecretCache>>,
) -> String {
    // 1. Cache'e bak
    {
        let cache = cache.lock().await;
        if let Some(secret) = cache.get(&endpoint_id.to_string()) {
            inc_secret_cache_hit();
            return secret.to_string();
        }
    }
    // 2. Cache miss → DB'den çek
    inc_secret_cache_miss();
    let secret = sqlx::query_scalar::<_, String>(
        "SELECT signing_secret FROM endpoints WHERE id = $1"
    )
    .bind(endpoint_id)
    .fetch_optional(pool)
    .await
    .ok()
    .flatten()
    .unwrap_or_default();
    
    // 3. Cache'e ekle
    {
        let mut cache = cache.lock().await;
        cache.insert(endpoint_id.to_string(), secret.clone());
    }
    secret
}

/// Teslimatı başarılı olarak kaydet
async fn commit_delivery(
    pool: &PgPool,
    delivery_id: &str,
    result: &DeliveryResult,
    duration: Duration,
) {
    let _ = sqlx::query(
        "UPDATE deliveries SET status = 'delivered', attempt_count = attempt_count + 1, response_status = $1, response_body = $2, updated_at = now() WHERE id = $3"
    )
    .bind(result.status_code)
    .bind(&result.response_body[..result.response_body.len().min(500)])
    .bind(delivery_id)
    .execute(pool)
    .await;
    
    let _ = sqlx::query(
        "DELETE FROM webhook_queue WHERE delivery_id = $1"
    )
    .bind(delivery_id)
    .execute(pool)
    .await;
}

/// Retry için yeniden planla
async fn schedule_retry(
    pool: &PgPool,
    msg: &QueueMessage,
    result: &DeliveryResult,
    duration: Duration,
) {
    let category = classify_error(Some(result.status_code), &result.error, false);
    let backoff = calculate_backoff(msg.attempt_count, &category, None);
    let next_retry = Utc::now() + chrono::Duration::from_std(backoff).unwrap_or(chrono::Duration::seconds(60));
    
    let _ = sqlx::query(
        "UPDATE webhook_queue SET status = 'pending', attempt_count = attempt_count + 1, next_retry_at = $1 WHERE delivery_id = $2"
    )
    .bind(next_retry)
    .bind(&msg.delivery_id)
    .execute(pool)
    .await;
}

/// Kalıcı hata olarak işaretle
async fn mark_failed(
    pool: &PgPool,
    delivery_id: &str,
    result: &DeliveryResult,
    duration: Duration,
) {
    let _ = sqlx::query(
        "UPDATE deliveries SET status = 'failed', error_message = $1, updated_at = now() WHERE id = $2"
    )
    .bind(&result.error)
    .bind(delivery_id)
    .execute(pool)
    .await;
    
    let _ = sqlx::query(
        "DELETE FROM webhook_queue WHERE delivery_id = $1"
    )
    .bind(delivery_id)
    .execute(pool)
    .await;
}

/// Retry yapılabilir mi?
fn is_retryable(status_code: i32) -> bool {
    matches!(status_code, 408 | 429 | 500..=599)
}
```

### Sorun 5: Dual-Write (INCELEME.md ile Çelişki)

**Problem:** Plan hâlâ hem PG'ye hem Redis'e yazıyor. INCELEME.md "Redis-first + PG fallback" diyor.

**Düzeltme:** `publish_to_queue`'yu güncelle:

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

    // 1. Redis'e yaz (asıl kuyruk — hızlı)
    if let Some(redis) = redis_queue {
        let msg = queue::QueueMessage {
            delivery_id: delivery_id.to_string(),
            endpoint_id: endpoint_id.to_string(),
            endpoint_url: endpoint_url.to_string(),
            payload: payload.to_string(),
            custom_headers: custom_headers.cloned(),
            trace_id: trace_id.clone(),
            attempt_count: 0,
            max_attempts: 5,
        };
        match redis.enqueue(&msg).await {
            Ok(_) => {
                tracing::debug!("📤 Webhook {} queued to Redis", delivery_id);
                return Ok(()); // Redis'e yazıldı, PG'ye gerek yok
            }
            Err(e) => {
                tracing::warn!("⚠️ Redis enqueue failed ({}), falling back to PG", e);
                // Redis başarısız → PG'ye yaz (fallback)
            }
        }
    }

    // 2. PostgreSQL fallback (Redis yoksa veya başarısızsa)
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

### Sorun 6: claim_pending Çağrılmıyor

**Problem:** `claim_pending` tanımlı ama worker startup'ta çağrılmıyor.

**Düzeltme:** Worker loop'tan önce çağır:

```rust
// Worker başlarken crash recovery
if let Some(ref mut rq) = redis_queue {
    match rq.claim_pending(&consumer_name).await {
        Ok(recovered) => {
            if !recovered.is_empty() {
                tracing::warn!("🔄 Recovered {} pending messages from previous run", recovered.len());
                // Hemen işle
                for (stream_id, msg) in recovered {
                    process_queue_message(&pool, &http_client, &msg, ...).await;
                    let _ = rq.ack(&stream_id).await;
                }
            }
        }
        Err(e) => tracing::warn!("⚠️ Claim pending failed: {:?}", e),
    }
}
```

### Sorun 7: Missing Imports

**Problem:** Worker loop'ta gerekli import'lar belirtilmemiş.

**Düzeltme:**
```rust
use std::sync::Arc;
use tokio::sync::{Mutex, Semaphore};
use std::collections::HashMap;
use uuid::Uuid;
```

---

## ✅ Düzeltilmiş Akış Özeti

```
API:
  publish_to_queue()
    ├─ Redis'e yaz → başarılıysa RETURN (PG'ye yazma)
    └─ Redis başarısız → PG'ye yaz (fallback)

Worker:
  Startup:
    ├─ Redis bağlan
    ├─ claim_pending (crash recovery)
    └─ PG fallback (Redis yoksa)

  Loop:
    ├─ Redis'ten oku (blocking read)
    ├─ Her mesaj için:
    │   ├─ Circuit breaker (allow_request)
    │   ├─ Throttle (check_allowed)
    │   ├─ FIFO check
    │   ├─ Signing secret (cache'ten)
    │   ├─ HTTP teslimat
    │   └─ Sonuç: commit/retry/failed
    └─ PG fallback (Redis yoksa)
```

---

*Bu düzeltmeler planın son halini oluşturur.*
*Son güncelleme: 2026-05-26*
