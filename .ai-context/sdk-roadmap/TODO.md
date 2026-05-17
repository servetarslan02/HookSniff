# SDK — Yapılacak İşler

> Son güncelleme: 2026-05-18 06:26 GMT+8

---

## ⚠️ ÖNEMLİ KURAL

**ASLA sıfırdan SDK yazma!** Svix SDK'yı kopyala, yeniden adlandır, adapte et.

---

## 📊 İlerleme Tablosu

| Faz | İçerik | Durum | Sonuç |
|-----|--------|-------|-------|
| ✅ | SDK Adaptasyonu (11 dil) | Tamamlandı | %100 |
| ✅ | Live Publish (11/11 SDK) | Tamamlandı | %100 |
| ✅ | Faz 8-13 Yeni Özellikler | Tamamlandı | %100 |
| ⏳ | Cloud Build Deploy | Beklemede | — |
| ⏳ | Faz 14-15 | Beklemede | — |

---

## 🟢 Yeni Özellikler

| # | Özellik | Zorluk | Süre | Durum |
|---|---------|--------|------|-------|
| 1 | Environment | Orta | 4-6 saat | ✅ |
| 2 | Background Task | Orta | 3-4 saat | ✅ |
| 3 | Operational Webhook | Orta | 3-4 saat | ✅ |
| 4 | Message Poller | Orta | 3-4 saat | ✅ |
| 5 | Ingest (inbound webhook) | Zor | 8-10 saat | ✅ |
| 6 | Connector (8 servis) | Orta | 4-5 saat | ✅ |
| 7 | Integration | Zor | 10-15 saat | ✅ |
| 8 | Streaming (SSE/WebSocket) | Çok zor | 15-20 saat | ⬜ |

---

## ⚠️ Acil: Cloud Build Deploy

Connectors API'si Cloud Run'da 404 döndürüyor. Cloud Build tetiklenmeli.
DB tabloları ve seed data hazır, sadece API deploy gerekli.

---

## ✅ Faz 13 — Connector (TAMAMLANDI)

### Yapılan:
1. Migration 062: `connectors` + `connector_configs` tabloları ✅
2. 8 connector seed: Stripe, Shopify, GitHub, Slack, Twilio, Discord, Linear, Notion ✅
3. Rust API: CRUD (list, get, create, update, delete) ✅
4. Dashboard sayfası ✅
5. SDK'lar (11/11) ✅
6. Sidebar nav: 🔌 ✅
7. i18n: en + tr ✅
