# SDK — Yapılacak İşler

> Son güncelleme: 2026-05-18 18:29 GMT+8

---

## 📊 İlerleme Tablosu

| Faz | İçerik | Durum | Sonuç |
|-----|--------|-------|-------|
| ✅ | SDK Adaptasyonu (11 dil) | Tamamlandı | %100 |
| ✅ | Live Publish (9/11 SDK) | Tamamlandı | %82 |
| ✅ | Faz 8-15 Yeni Özellikler | Tamamlandı | %100 |
| ⏳ | Cloud Build Deploy | Beklemede | — |
| ✅ | Ruby + C# Full Resource | Tamamlandı | %100 |

---

## ✅ Tamamlanan (2026-05-18)

### Ruby SDK v1.2.0 → RubyGems
- 24 yeni API dosyası eklendi
- Faz 8-15 + 18 ek resource (30+ toplam)
- hooksniff.rb güncellendi
- RubyGems'e publish edildi
- GitHub'a push edildi

### C# SDK v1.2.0 → NuGet
- 25+ yeni resource eklendi
- 21 yeni model dosyası
- Faz 8-15 + 18 ek resource (30+ toplam)
- NuGet'e publish edildi
- GitHub'a push edildi

---

## ⏳ Kalan İşler

### Priority 1 — Kotlin Build Fix
- Package çakışması: `com.hooksniff` vs `com.hooksniff.kotlin`
- Eksik tipleri ekle
- Maven Central'a publish et

### Priority 2 — Elixir Publish
- Hex.pm'e publish edilmemiş
- Key: `20e1faa34deb3e75d01dec3002e30bfc`

### Priority 3 — Eksik Faz 8-15 Resource'ları (Düşük Öncelik)
| SDK | Eksik Resource'lar |
|-----|-------------------|
| **Go** | background_task, operational_webhook, message_poller, inbound |
| **PHP** | environment, background_task, op_webhook, poller, inbound, connector |
| **Swift** | environment, background_task, op_webhook, poller, connector |

### Priority 4 — Cloud Build Deploy
- Connectors API Cloud Run'da 404 döndürüyor
- `gcloud builds submit --config cloudbuild.yaml . --project=hooksniff-app`

---

## 🟢 Yeni Özellikler (Tümü Tamamlandı)

| # | Özellik | Zorluk | Süre | Durum |
|---|---------|--------|------|-------|
| 1 | Environment | Orta | 4-6 saat | ✅ |
| 2 | Background Task | Orta | 3-4 saat | ✅ |
| 3 | Operational Webhook | Orta | 3-4 saat | ✅ |
| 4 | Message Poller | Orta | 3-4 saat | ✅ |
| 5 | Ingest (inbound webhook) | Zor | 8-10 saat | ✅ |
| 6 | Connector (8 servis) | Orta | 4-5 saat | ✅ |
| 7 | Integration | Zor | 10-15 saat | ✅ |
| 8 | Streaming (SSE/WebSocket) | Çok zor | 15-20 saat | ✅ |
