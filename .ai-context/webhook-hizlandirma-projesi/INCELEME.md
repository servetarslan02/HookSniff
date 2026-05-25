# 🔍 Webhook Hızlandırma Plan — Derin İnceleme

> **Tarih:** 2026-05-26
> **Amaç:** Planı adım adım kontrol et, daha iyi seçenek var mı, eksik var mı

---

## 1. KRİTİK SORUN: Dual-Write Problem

### Problem
Planın Faz 1.3'te hem PostgreSQL'e hem Redis'e aynı anda yazıyor:

```rust
// API: publish_to_queue
redis_queue.enqueue(&msg).await?;           // 1. Redis'e yaz
sqlx::query("INSERT INTO webhook_queue...")  // 2. PostgreSQL'e yaz
```

**Bu tehlikeli çünkü:**
- Redis'e yazıldı, PostgreSQL'e yazılamadı → mesaj Redis'te ama PG'de yok (data tutarsızlığı)
- PostgreSQL'e yazıldı, Redis'e yazılamadı → mesaj PG'de ama Redis'te yok (worker bulamaz)
- Crash anında biri başarılı diğerinin sonucu bilinmiyor

### Çözüm: Transactional Outbox Pattern

```
Doğru akış:
1. PostgreSQL'e yaz (deliveries tablosu — zaten var)
2. Aynı transaction içinde webhook_queue'ya da yaz
3. Ayrı bir worker: webhook_queue'dan oku → Redis Streams'a push et
4. Redis Streams'dan oku → HTTP teslimat

Bu sayede:
- PostgreSQL kaynak truth (source of truth)
- Redis sadece hız katmanı (performance layer)
- Redis kaybolsa → PG queue'dan tekrar okunur
- PG kaybolsa → zaten veri kaybolmuş
```

**AMA:** Bu ek karmaşıklık ekler. Basit alternatif:

### Basit Alternatif: Redis-First + PG Fallback

```
1. Redis Streams'a yaz (asıl kuyruk)
2. Başarısız olursa → PostgreSQL webhook_queue'ya yaz (fallback)
3. Worker: Redis'ten oku, başarısız olursa PG'den oku
```

Bu daha basit ve HookSniff'in mevcut ölçeği için yeterli.

---

## 2. KRİTİK SORUN: Upstash Redis Free Tier Sınırları

### Bulgu
Upstash free tier (Mart 2025 güncellemesi):
- **500K commands/ay** (16.6K/gün)
- **10,000 max cmd/sec** (tüm planlarda)
- **256 MB max data**
- **10 GB bandwidth**

### Hesaplama

Her webhook = ~3 Redis komutu:
| Webhook/ay | Redis Komutu | Free Tier | Maliyet |
|------------|-------------|-----------|---------|
| 5,000 | 15,000 | ✅ Yeterli | $0 |
| 50,000 | 150,000 | ❌ Aşar | $0.30/ay |
| 500,000 | 1,500,000 | ❌ Aşar | $3/ay |

**Sonuç:** Mevcut 2-5K webhook/ay için free tier yeterli. Büyüyünce Pay as You Go ($0.20/100K commands).

### 10,000 cmd/sec Limiti
- Saniyede ~3,333 webhook işler (3 komut/webhook)
- HookSniff'in mevcut ölçeği için fazlasıyla yeterli
- Aşıldığında: Fixed plan ($10/ay) veya kendi Redis'in

---

## 3. ALTERNATİF: Upstash QStash

### Bulgu
Upstash'in kendi queue ürünü: **QStash**

| Özellik | Redis Streams | QStash |
|---------|--------------|--------|
| Free tier | 500K cmd/ay | 1,000 msg/gün |
| Fiyat | $0.20/100K cmd | $1/100K msg |
| HTTP delivery | ❌ (kendin yaparsın) | ✅ Otomatik |
| Retry | ❌ (kendin yaparsın) | ✅ Built-in |
| Dead letter | ❌ (kendin yaparsın) | ✅ Built-in |
| Batch | ✅ XREADGROUP | ✅ Batch publish |
| Gecikme | < 1ms | ~10-50ms |

### Karar
**Redis Streams daha iyi** çünkü:
- Mevcut Upstash Redis zaten kurulu
- Daha ucuz ($0.20/100K vs $1/100K)
- Daha hızlı (< 1ms vs ~10-50ms)
- Daha fazla kontrol (kendi retry logic'in)
- QStash free tier çok düşük (1,000 msg/gün = ~30K/ay)

---

## 4. ALTERNATİF: NATS JetStream

### Bulgu
NATS JetStream: sub-millisecond, built-in persistence, consumer groups.

| Özellik | Redis Streams | NATS JetStream |
|---------|--------------|----------------|
| Gecikme | < 1ms | < 1ms |
| Persistence | ✅ (AOF) | ✅ (built-in) |
| Consumer groups | ✅ | ✅ |
| Free hosting | ✅ (Upstash) | ❌ (kendi sunucun) |
| Mevcut altyapı | ✅ Zaten var | ❌ Yeni servis gerekir |
| Karmaşıklık | Düşük | Orta |

### Karar
**Redis Streams daha iyi** çünkü:
- Zaten Upstash Redis kurulu
- NATS ayrı servis gerektirir (ek maliyet + karmaşıklık)
- Performans farkı minimal (ikisi de < 1ms)

---

## 5. ALTERNATİF: PostgreSQL Outbox Pattern + pg_cron

### Bulgu
PostgreSQL'i queue olarak kullanmanın daha güvenli yolu:

```sql
-- 1. Outbox tablosu
CREATE TABLE webhook_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL,
    endpoint_id UUID NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, published, failed
    created_at TIMESTAMPTZ DEFAULT now(),
    published_at TIMESTAMPTZ
);

-- 2. Trigger: delivery INSERT olduğunda outbox'a da ekle
CREATE TRIGGER trg_webhook_outbox
    AFTER INSERT ON deliveries
    FOR EACH ROW EXECUTE FUNCTION add_to_outbox();

-- 3. pg_cron ile periyodik publish (veya LISTEN/NOTIFY)
```

### Karar
Bu yaklaşım HookSniff'in mevcut PostgreSQL altyapısına uygun ama:
- Redis kadar hızlı değil (hâlâ PG polling)
- Ek tablo + trigger + cron gerekir
- Redis Streams daha basit ve daha hızlı

---

## 6. EKSİK: Grafana Metric Implementasyonu

### Bulgu
Plan'da Grafana metrikleri listelenmiş ama implementasyon kodu yok.

### Çözüm
```rust
// worker/src/metrics.rs — mevcut dosyaya ekle

/// Redis queue latency (microseconds)
pub fn record_queue_latency_us(us: u64) {
    REDIS_QUEUE_LATENCY_US.store(us, Ordering::Relaxed);
}

/// Queue tipi (0=PG, 1=Redis)
pub fn set_queue_type(t: u8) {
    QUEUE_TYPE.store(t, Ordering::Relaxed);
}

/// Redis queue error
pub fn inc_redis_queue_errors() {
    REDIS_QUEUE_ERRORS.fetch_add(1, Ordering::Relaxed);
}

/// PG fallback (Redis yoksa)
pub fn inc_pg_queue_fallback() {
    PG_QUEUE_FALLBACK.fetch_add(1, Ordering::Relaxed);
}

/// Signing secret cache hit/miss
pub fn inc_secret_cache_hit() {
    SECRET_CACHE_HIT.fetch_add(1, Ordering::Relaxed);
}

pub fn inc_secret_cache_miss() {
    SECRET_CACHE_MISS.fetch_add(1, Ordering::Relaxed);
}
```

---

## 7. EKSİK: Error Handling — Retry Queue

### Bulgu
Plan'da retry mekanizması var ama Redis queue'da retry nasıl işleyeceği belirsiz.

### Çözüm
```rust
// Retry için ayrı bir Redis stream
const RETRY_STREAM_KEY: &str = "hooksniff:retries";

// Başarısız delivery → retry stream'ine ekle (delay ile)
pub async fn enqueue_retry(&mut self, msg: &QueueMessage, delay: Duration) -> Result<()> {
    // XADD ile retry stream'ine ekle
    // Worker: periyodik olarak retry stream'ini kontrol et
    // Zamanı gelenleri ana stream'e taşı
    redis::cmd("XADD")
        .arg(RETRY_STREAM_KEY)
        .arg("*")
        .arg("deliver_at").arg((Utc::now() + delay).timestamp_millis().to_string())
        .arg("payload").arg(serde_json::to_string(msg)?)
        .query_async(&mut self.conn)
        .await?;
    Ok(())
}
```

**VEYA daha basit:** Retry'ları hâlâ PostgreSQL'de tut (mevcut `next_retry_at` mantığı). Redis sadece ilk teslimat için kullan.

---

## 8. EKSİK: Monitoring Dashboard

### Bulgu
Plan'da Grafana metrikleri var ama dashboard panel tasarımı yok.

### Çözüm
```json
{
  "dashboard": {
    "title": "HookSniff Queue Performance",
    "panels": [
      {
        "title": "Queue Type",
        "targets": [{"expr": "hooksniff_queue_type"}],
        "type": "stat"
      },
      {
        "title": "Queue Latency (ms)",
        "targets": [{"expr": "hooksniff_queue_latency_ms"}],
        "type": "timeseries",
        "thresholds": [
          {"value": 10, "color": "green"},
          {"value": 100, "color": "yellow"},
          {"value": 1000, "color": "red"}
        ]
      },
      {
        "title": "Redis Queue Errors",
        "targets": [{"expr": "rate(hooksniff_redis_queue_errors[5m])"}],
        "type": "timeseries"
      },
      {
        "title": "PG Fallback Count",
        "targets": [{"expr": "hooksniff_pg_queue_fallback"}],
        "type": "stat"
      },
      {
        "title": "Secret Cache Hit Rate",
        "targets": [{"expr": "rate(hooksniff_secret_cache_hit[5m]) / (rate(hooksniff_secret_cache_hit[5m]) + rate(hooksniff_secret_cache_miss[5m]))"}],
        "type": "gauge"
      }
    ]
  }
}
```

---

## 9. EKSİK: Load Test Senaryosu

### Bulgu
Plan'da "k6 ile load test" denmiş ama senaryo yok.

### Çözüm
```javascript
// tests/load/webhook_speed_test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up
    { duration: '1m', target: 50 },    // Sustained load
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

## 10. EKSİK: Rollback Senaryosu Detayı

### Bulgu
Plan'da "rollback planı" denmiş ama detay yok.

### Çözüm
```bash
# Rollback Script
#!/bin/bash

# 1. Feature flag ile Redis queue'yu devre dışı bırak
# Cloud Run environment variable güncelle
gcloud run services update hooksniff-worker \
  --set-env-vars USE_REDIS_QUEUE=false \
  --region europe-west1

# 2. PostgreSQL queue'ya geri dön
# Worker otomatik olarak PG LISTEN/NOTIFY kullanır

# 3. Redis'teki mesajları PG'ye geri taşı (opsiyonel)
# Sadece critical mesajlar için

# 4. Monitor
# Grafana'da queue latency ve error rate kontrol et
```

---

## 11. EKSİK: Security Considerations

### Bulgu
Redis Streams'da payload açık metin olarak saklanıyor.

### Çözüm
```rust
// Opsiyonel: Payload'ı şifrele (sadece hassas veriler için)
use aes_gcm::{Aes256Gcm, Key, Nonce};
use aes_gcm::aead::{Aead, NewAead};

fn encrypt_payload(payload: &str, key: &[u8]) -> Result<String> {
    let cipher = Aes256Gcm::new(Key::from_slice(key));
    let nonce = Nonce::from_slice(b"unique nonce"); // Gerçek production'da random
    let ciphertext = cipher.encrypt(nonce, payload.as_bytes())?;
    Ok(base64::encode(&ciphertext))
}
```

**AMA:** HookSniff'in payload'ı zaten müşteri verisi, şifreleme ek overhead. Mevcut durumda gerekli değil.

---

## 📊 Genel Değerlendirme

| Konu | Durum | Öneri |
|------|-------|-------|
| Dual-write problem | 🔴 Kritik | Redis-first + PG fallback |
| Upstash free tier | 🟡 Dikkat | 5K webhook/ay yeterli, büyüyünce PAYG |
| QStash alternatifi | ❌ Uygun değil | Daha pahalı, daha yavaş |
| NATS alternatifi | ❌ Uygun değil | Ek servis gerekir |
| PG Outbox Pattern | 🟡 Alternatif | Basit ama yavaş |
| Grafana metrics | 🟡 Eksik | Kod eklendi |
| Retry queue | 🟡 Eksik | PG'de tut (mevcut mantık) |
| Monitoring dashboard | 🟡 Eksik | Panel tasarımı eklendi |
| Load test | 🟡 Eksik | Senaryo eklendi |
| Rollback | 🟡 Eksik | Script eklendi |
| Security | 🟢 Opsiyonel | Mevcut durumda gerekli değil |

---

## ✅ Güncellenmiş Tavsiye

### En İyi Yaklaşım (Güncellenmiş)

```
1. Redis Streams = asıl kuyruk (hız)
2. PostgreSQL webhook_queue = fallback (güvenilirlik)
3. Worker: Redis'ten oku, başarısız olursa PG'den oku
4. Retry: PG'de tut (mevcut next_retry_at mantığı)
5. Signing secret: in-memory cache (5 dk TTL)
6. HTTP/2: tek client (reqwest otomatik negotiation)
7. Tier-1 retry: 100ms, 300ms, 500ms (transient)
```

### Neden Bu Daha İyi?
- Dual-write problemi yok (Redis-first, PG fallback)
- Mevcut PG queue korunuyor (güvenli geçiş)
- Daha basit (ek outbox tablosu yok)
- Daha hızlı (Redis asıl kuyruk)

---

*Bu inceleme planın eksiklerini ve daha iyi alternatifleri değerlendirir.*
*Son güncelleme: 2026-05-26*
