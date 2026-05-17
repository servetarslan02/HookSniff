# SDK — Yapılacak İşler

> Son güncelleme: 2026-05-18 05:55 GMT+8

---

## ⚠️ ÖNEMLİ KURAL

**ASLA sıfırdan SDK yazma!** Svix SDK'yı kopyala, yeniden adlandır, adapte et.
Detaylar: MEMORY.md → 'SDK Adaptasyon Yöntemi'

---

## 📊 İlerleme Tablosu

| Faz | İçerik | Durum | Sonuç |
|-----|--------|-------|-------|
| ✅ | SDK Adaptasyonu (11 dil) | Tamamlandı | %100 |
| ✅ | Live Publish (11/11 SDK) | Tamamlandı | %100 |
| ✅ | Faz 8-10 Yeni Özellikler | Tamamlandı | %100 |
| ⏳ | Test Coverage Artırma | Beklemede | — |
| ⏳ | Faz 11-15 Yeni Özellikler | Beklemede | — |

---

## 🟢 Yeni Özellikler

> Detaylar: NEW-FEATURES-PLAN.md

| # | Özellik | Zorluk | Süre | Durum |
|---|---------|--------|------|-------|
| 1 | Environment (dev/staging/prod) | Orta | 4-6 saat | ✅ |
| 2 | Background Task | Orta | 3-4 saat | ✅ |
| 3 | Operational Webhook | Orta | 3-4 saat | ✅ TAMAM |
| 4 | Message Poller | Orta | 3-4 saat | ⬜ SIRADAKİ |
| 5 | Ingest (inbound webhook) | Zor | 8-10 saat | ⬜ |
| 6 | Connector (Shopify,Stripe...) | Çok zor | 20+ saat | ⬜ |
| 7 | Integration | Zor | 10-15 saat | ⬜ |
| 8 | Streaming (SSE/WebSocket) | Çok zor | 15-20 saat | ⬜ |

**Bağımlılık sırası:** 1→2→3, 5→6→7, 4 ve 8 bağımsız

---

## ✅ Faz 10 — Operational Webhook (TAMAMLANDI)

### Yapılan:
1. Migration: `operational_webhook_endpoints` tablosu ✅
2. Migration: `operational_webhook_deliveries` tablosu ✅
3. Rust API: CRUD + delivery log ✅
4. Dashboard sayfası ✅
5. SDK güncellemesi (11 dil) ✅
6. **Worker event dispatch** ✅
   - `worker/src/operational_webhook.rs` — yeni modül
   - `delivery.failed` — dead-letter olaylarında tetiklenir
   - `endpoint.disabled` — failure_streak eşiklerinde (5, 10, 20, 50)
   - Zombie reaper entegrasyonu
   - Standard Webhooks HMAC-SHA256 signing
   - Event type filtering
   - Delivery recording
