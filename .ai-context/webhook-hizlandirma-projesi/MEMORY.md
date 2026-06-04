# 🧠 Webhook Hızlandırma — Hafıza

> **Son güncelleme:** 2026-06-04
> **Bu dosya:** Proje geçmişi, kararlar, öğrenilen dersler

---

## 📋 Proje Özeti

**Hedef:** HookSniff webhook teslimatını sektörün en hızlısı yapmak.
- Mevcut: ~1000ms ilk tetikleme (PostgreSQL NOTIFY + 1s poll)
- Hedef: < 10ms (Redis Streams)
- Ek maliyet: $0 (Upstash free tier)

---

## 🔑 Alınan Kararlar

### Karar 1: Redis Streams (QStash/NATS Değil)
- **Tarih:** 2026-05-26
- **Sebep:** Mevcut Upstash Redis zaten kurulu, < 1ms gecikme, $0.20/100K komut
- **Alternatifler reddedildi:** QStash (pahalı+yavaş), NATS (ek servis), PG Outbox (yavaş)

### Karar 2: Redis-First + PG Fallback (Dual-Write Değil)
- **Tarih:** 2026-05-26
- **Sebep:** Dual-write problemi (data tutarsızlığı riski)
- **Akış:** Redis'e yaz → başarılıysa RETURN, başarısızsa PG'ye yaz

### Karar 3: 3 Katmanlı Retry (Hookdeck Modeli)
- **Tarih:** 2026-05-26
- **Katmanlar:** Tier 1 (100ms/300ms/500ms), Tier 2 (1m-4h), Tier 3 (6h-24h)

### Karar 4: Signing Secret In-Memory Cache
- **Tarih:** 2026-05-26
- **Sebep:** Her webhook'ta DB sorgusu gereksiz, 5 dk TTL

### Karar 5: Retry'ları PG'de Tut
- **Tarih:** 2026-05-26
- **Sebep:** Mevcut `next_retry_at` mantığı zaten var

### Karar 6: Feature Flag ile Deploy
- **Tarih:** 2026-05-26
- **Sebep:** `USE_REDIS_QUEUE` env var ile runtime'da toggle, anında geri dönüş
- **Deploy sırası:** Worker önce → API sonra → Feature flag aç

### Karar 7: FIFO Endpoint'leri PG'de Bırak
- **Tarih:** 2026-05-26
- **Sebep:** Redis Streams paralel okuma FIFO'yu bozabilir, mevcut PG mantığı güvenli
- **İleride:** FIFO için ayrı stream açılabilir

### Karar 8: Redis maxmemory-policy = noeviction
- **Tarih:** 2026-05-26
- **Sebep:** Queue dolarsa hata versin (PG fallback), mesaj silinmesin

---

## ⚠️ Kritik Uyarılar

1. **WebhookMessage type mismatch:** `delivery_id` ve `endpoint_id` String (Uuid değil)
2. **Circuit breaker method:** `allow_request()` (is_open() değil)
3. **ConnectionManager Clone:** redis crate v1.2.1'de Clone implement ediyor ✅
4. **Consumer name uniqueness:** `worker-{pid}` formatı kullanılmalı
5. **Upstash free tier:** 500K komut/ay — mevcut 2-5K webhook/ay için yeterli
6. **Deploy sırası:** Worker önce deploy, API sonra, en son feature flag aç
7. **Redis OOM:** `noeviction` — OOM'da PG fallback otomatik devreye girer

---

## 📁 Dosya Yapısı (Güncel)

```
webhook-hizlandirma-projesi/
├── UYGULAMA-PLANI.md    ← TÜM PLAN TEK BELDE (13 bölüm, 1700+ satır)
├── MEMORY.md            ← Bu dosya (hafıza)
├── NEXT_SESSION.md      ← Sonraki oturum rehberi
└── README.md            ← Klasör rehberi
```

> Eski dosyalar (RAPOR.md, PLAN.md, TEKNIK-DETAY.md, INCELEME.md, DUZELTMELER.md)
> UYGULAMA-PLANI.md'ye entegre edildi ve silindi.

---

## 📊 İlerleme Takibi

| Faz | Durum | Tarih | Not |
|-----|-------|-------|-----|
| Faz 1: Redis Streams | ✅ Tamamlandı | 2026-06-04 | API + Worker entegrasyonu |
| Faz 1 Ek: Production Config | ✅ Tamamlandı | 2026-06-04 | USE_REDIS_QUEUE, FIFO routing, crash recovery, idempotency, OOM handling |
| Faz 2: HTTP/2 | ✅ Tamamlandı | 2026-06-04 | Connection pool 100, adaptive window, keep-alive |
| Faz 3: 3 Katmanlı Retry | ✅ Tamamlandı | 2026-06-04 | Tiered backoff: Transient→100ms, Server→1m, EndpointDown→6h |
| Faz 4: DNS + SSRF Cache | ✅ Tamamlandı | 2026-06-04 | dns_cache.rs + ssrf_cache.rs (TTL-based, LRU eviction) |
| Faz 5: Dynamic Concurrency | ✅ Tamamlandı | 2026-06-04 | Success rate based: 0.95→+10, 0.3→-20, min=10, max=200 |
| Faz 6: Batch Processing | ✅ Tamamlandı | 2026-06-04 | batch.rs: group_by_endpoint + supports_batch |

---

## 🔴 Faz 1 Uygulama Detayları (2026-06-04)

### Yapılan Değişiklikler

1. **API `create.rs`** — `MutexGuard !Send` hatası düzeltildi
   - `REDIS_QUEUE.lock()` guard'ı `.await` boyunca tutuluyordu → `!Send` future
   - Çözüm: `lock().clone()` ile klonlayıp guard'ı hemen bırakıyoruz
   
2. **API `queue.rs`** — Redis Streams queue modülü (mevcut, sağlam)
   - `RedisQueue` struct: enqueue, read_batch, ack, claim_pending, len
   - `QueueMessage` struct: delivery_id, endpoint_id, url, payload, headers, signing_secret, trace_id, attempt, max_attempts, queue_item_id
   - XAUTOCLAIM ile crash recovery

3. **API `db.rs`** — `publish_to_queue_fast` fonksiyonu
   - Redis-first, PG fallback akışı
   - `REDIS_QUEUE` global static (std::sync::Mutex)

4. **Worker `main.rs`** — Redis Streams consumer yeniden yazıldı
   - `parse_xreadgroup_response()` fonksiyonu eklendi (raw redis::Value parsing)
   - Signing secret cache entegrasyonu (5 dk TTL)
   - Circuit breaker + throttle kontrolleri eklendi
   - Doğru stream entry ID ile XACK
   - Dead letter handling (max attempts aşılırsa)
   - `http_client` spawn'a clone olarak geçildi

5. **Worker `secret_cache.rs`** — Yeni dosya oluşturuldu
   - In-memory HashMap<String, (String, Instant)> cache
   - TTL-based expiration, cleanup, len, is_empty

6. **Worker `config.rs`** — `USE_REDIS_QUEUE` flag eklendi
   - `use_redis_queue: bool` field
   - `USE_REDIS_QUEUE=true|1` env var'dan okunur

7. **Worker shutdown** — `redis_consumer_handle.abort()` eklendi

### Kritik Dersler

- **`std::sync::MutexGuard` + `.await` = `!Send`**: Axum handler'larında mutex guard asla `.await` boyunca tutulmamalı. Klonlayıp guard'ı bırakmak gerekir.
- **XREADGROUP raw parsing**: `Vec<(String, Vec<Vec<String>>)>` destructuring'i çalışmaz. `redis::Value` olarak alıp manuel parse etmek gerekir.
- **Stream entry ID**: XACK için stream entry ID gerekli (delivery_id değil). `parse_xreadgroup_response` bu ID'yi döndürür.

### Upstash Durumu

- **Instance**: integral-ostrich-98447.upstash.io
- **Free tier**: 500K komut/ay — **Şu an limit aşılmış** (500K/500K)
- **REST API**: Çalışmıyor (rate limit exceeded)
- **TCP (rediss://)**: Farklı kota olabilir, deploy'da test edilmeli
- **maxmemory-policy**: `noeviction` olarak ayarlanmalı (Upstash dashboard'dan)
- **Çözüm**: Plan yükseltme veya ay sonunu bekle

### REDIS_URL (TCP)

```
rediss://default:gQAAAAAAAYCPAAIgcDI1ZGFhYWUxZGRhZjM0YjhhYTQ1OGFjOGEzZTg1OTMzNg@integral-ostrich-98447.upstash.io:6379
```

### QStash Bilgileri

```
QSTASH_URL=https://qstash-eu-central-1.upstash.io
QSTASH_TOKEN=eyJVc2VySUQiOiJlYzY2NmY4ZS1lOTRiLTRjMDMtYmVhZC00OTVjNWE2NTcwMzMiLCJQYXNzd29yZCI6IjhlMjIwOWVmZDljODRhMTM4MjdlZDljZTQxYjIyMjcwIn0=
QSTASH_CURRENT_SIGNING_KEY=sig_7sPnDhTMWdK54NMbtr22MFQCEZyH
QSTASH_NEXT_SIGNING_KEY=sig_6qrNpb9ZpcLs89KRduyQ8dqF9oZd
```

---

*Bu dosya her oturumda güncellenir.*
