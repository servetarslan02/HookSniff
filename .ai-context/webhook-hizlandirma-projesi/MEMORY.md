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
| Faz 1: Redis Streams | ⏳ Bekliyor | — | En kritik faz |
| Faz 1 Ek: Production Config | ⏳ Bekliyor | — | Feature flag, deploy, FIFO, OOM |
| Faz 2: HTTP/2 | ⏳ Bekliyor | — | |
| Faz 3: 3 Katmanlı Retry | ⏳ Bekliyor | — | |
| Faz 4: DNS + SSRF Cache | ⏳ Bekliyor | — | |
| Faz 5: Dynamic Concurrency | ⏳ Bekliyor | — | |
| Faz 6: Batch Processing | ⏳ Bekliyor | — | |

---

*Bu dosya her oturumda güncellenir.*
