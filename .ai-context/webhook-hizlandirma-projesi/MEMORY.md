# 🧠 Webhook Hızlandırma — Hafıza

> **Son güncelleme:** 2026-05-26
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
- **Alternatifler reddedildi:**
  - QStash: Daha pahalı ($1/100K), daha yavaş (~10-50ms), free tier düşük
  - NATS: Ek servis gerekir, performans farkı minimal
  - PG Outbox: Hâlâ PG polling,Redis kadar hızlı değil

### Karar 2: Redis-First + PG Fallback (Dual-Write Değil)
- **Tarih:** 2026-05-26
- **Sebep:** Dual-write problemi (data tutarsızlığı riski)
- **Akış:** Redis'e yaz → başarılıysa RETURN, başarısızsa PG'ye yaz

### Karar 3: 3 Katmanlı Retry (Hookdeck Modeli)
- **Tarih:** 2026-05-26
- **Sebep:** Geçici hatalarda 30s → 100ms, kalıcı hatalarda boşuna retry yok
- **Katmanlar:**
  - Tier 1: 100ms, 300ms, 500ms (transient)
  - Tier 2: 1m, 5m, 15m, 1h, 4h (server error)
  - Tier 3: 6h, 12h, 24h (endpoint down, 3 gün)

### Karar 4: Signing Secret In-Memory Cache
- **Tarih:** 2026-05-26
- **Sebep:** Her webhook'ta DB sorgusu gereksiz, 5 dk TTL yeterli

### Karar 5: Retry'ları PG'de Tut
- **Tarih:** 2026-05-26
- **Sebep:** Mevcut `next_retry_at` mantığı zaten var, Redis retry stream ek karmaşıklık

---

## ⚠️ Kritik Uyarılar

1. **WebhookMessage type mismatch:** `delivery_id` ve `endpoint_id` String (Uuid değil)
2. **Circuit breaker method:** `allow_request()` (is_open() değil)
3. **ConnectionManager Clone:** redis crate v1.2.1'de Clone implement ediyor ✅
4. **Consumer name uniqueness:** `worker-{pid}` formatı kullanılmalı
5. **Upstash free tier:** 500K komut/ay — mevcut 2-5K webhook/ay için yeterli

---

## 📁 Dosya Yapısı

```
webhook-hizlandirma-projesi/
├── UYGULAMA-PLANI.md    ← TÜM PLAN TEK BELGEDE (ana doküman)
├── MEMORY.md            ← Bu dosya (hafıza)
├── NEXT_SESSION.md      ← Sonraki oturum rehberi
├── RAPOR.md             ← Derin analiz raporu
├── PLAN.md              ← Eski plan (v4 final)
├── TEKNIK-DETAY.md      ← Teknik detaylar
├── INCELEME.md          ← Plan incelemesi
├── DUZELTMELER.md       ← Düzeltmeler
└── README.md            ← Klasör rehberi
```

---

## 📊 İlerleme Takibi

| Faz | Durum | Tarih | Not |
|-----|-------|-------|-----|
| Faz 1: Redis Streams | ⏳ Bekliyor | — | En kritik faz |
| Faz 2: HTTP/2 | ⏳ Bekliyor | — | |
| Faz 3: 3 Katmanlı Retry | ⏳ Bekliyor | — | |
| Faz 4: DNS + SSRF Cache | ⏳ Bekliyor | — | |
| Faz 5: Dynamic Concurrency | ⏳ Bekliyor | — | |
| Faz 6: Batch Processing | ⏳ Bekliyor | — | |

---

## 📚 Referanslar

- Svix Redis Streams: https://www.svix.com/resources/guides/redis-message-queue/
- Hookdeck Webhooks at Scale: https://hookdeck.com/blog/webhooks-at-scale
- Redis Streams Docs: https://redis.io/docs/latest/develop/data-types/streams/

---

*Bu dosya her oturumda güncellenir.*
