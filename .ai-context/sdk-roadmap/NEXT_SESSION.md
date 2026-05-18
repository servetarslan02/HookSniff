# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-18 16:54 GMT+8

## ✅ Yapılan (Bu Oturum)
- Java SDK v1.1.2 → Maven Central publish edildi
- sdks/ klasörü ana repodan silindi
- Credential'lar MEMORY.md'ye kaydedildi
- Tüm SDK'ların gerçek durumu kontrol edildi

## ❌ Acil Düzeltmeler (Faz 8-15 Eksik Resource'lar)

### Priority 1 — Kotlin Build Fix
- Package çakışması: `com.hooksniff` vs `com.hooksniff.kotlin`
- Tüm dosyaları `com.hooksniff.kotlin`'a taşı
- Eksik tipleri ekle (BackgroundTaskStatus, BackgroundTaskType)
- `client.request()` methodu ekle
- Maven Central'a publish et

### Priority 2 — 6 SDK'ya Faz 8-15 Resource'ları Ekle
Aşağıdaki SDK'larda environment, background_task, operational_webhook, message_poller, inbound, connector eksik:

| SDK | Eksik Resource'lar |
|-----|-------------------|
| **Go** | background_task, operational_webhook, message_poller, inbound |
| **Ruby** | environment, background_task, op_webhook, poller, inbound, connector |
| **PHP** | environment, background_task, op_webhook, poller, inbound, connector |
| **C#** | environment, background_task, op_webhook, poller, inbound, connector |
| **Swift** | environment, background_task, op_webhook, poller, connector |
| **Elixir** | hepsi eksik (environment, bg_task, op_webhook, poller, inbound, connector, integration, stream) |

### Priority 3 — Registry Publish (Kalan SDK'lar)
- Ruby → gem push
- C# → dotnet nuget push
- Elixir → mix hex.publish

## 🔑 Credential Lokasyonu
Tüm credential'lar `.ai-context/sdk-roadmap/MEMORY.md` içinde.
