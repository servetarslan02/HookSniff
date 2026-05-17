# SDK — Yapılacak İşler

> Son güncelleme: 2026-05-18 03:48 GMT+8

---

## ⚠️ ÖNEMLİ KURAL

**ASLA sıfırdan SDK yazma!** Svix SDK'yı kopyala, yeniden adlandır, adapte et.
Detaylar: MEMORY.md → 'SDK Adaptasyon Yöntemi'

---

## 📊 İlerleme Tablosu

| Faz | İçerik | Durum | Sonuç |
|-----|--------|-------|-------|
| ✅ | SDK Adaptasyonu (11 dil) | Tamamlandı | %100 |
| ✅ | Live Publish (10/11 SDK) | Tamamlandı | %91 |
| ⏳ | Kotlin Publish | Beklemede | — |
| ⏳ | Test Coverage Artırma | Beklemede | — |
| ⏳ | Faz 8-15 Yeni Özellikler | Beklemede | — |

---

## 🔴 Sıradaki: Kotlin SDK Publish

### Adımlar:
1. Svix-specific model dosyalarını sil (connector configs, polling, streaming, vb.)
2. `Authentication.kt` — sadece `logout()` metodunu tut
3. `Endpoint.kt` — core metodları tut
4. `Statistics.kt` — boş class yap
5. `HookSniff.kt` — sadece core API'leri tut
6. `Message.kt` — sadece core metodları tut
7. `deploy.gradle` — `classifier` → `archiveClassifier` düzelt
8. Build: `./gradlew build -x test`
9. Publish (Java ile aynı Sonatype credentials + GPG key)
10. Repo'ya push et

### Kotlin-specific notlar:
- `HookSniffHttpClient.kt` coroutine tabanlı (`suspend` fonksiyonlar)
- `kotlinx.serialization` kullanıyor
- `gradle.properties` hazır (io.github.servetarslan02, hooksniff-sdk-kotlin)
- GPG key: `[REDACTED]` (keyserver'da mevcut)
- Sonatype: `[REDACTED]` / `[REDACTED]`

---

## 🟢 Faz 1-7 Sonrası Yeni Özellikler

> Detaylar: NEW-FEATURES-PLAN.md

| # | Özellik | Zorluk | Süre | Durum |
|---|---------|--------|------|-------|
| 1 | Environment (dev/staging/prod) | Orta | 4-6 saat | ✅ |
| 2 | Background Task | Orta | 3-4 saat | ✅ |
| 3 | Operational Webhook | Orta | 3-4 saat | ✅ |
| 4 | Message Poller | Orta | 3-4 saat | ⬜ |
| 5 | Ingest (inbound webhook) | Zor | 8-10 saat | ⬜ |
| 6 | Connector (Shopify,Stripe...) | Çok zor | 20+ saat | ⬜ |
| 7 | Integration | Zor | 10-15 saat | ⬜ |
| 8 | Streaming (SSE/WebSocket) | Çok zor | 15-20 saat | ⬜ |

**Bağımlılık sırası:** 1→2→3, 5→6→7, 4 ve 8 bağımsız
