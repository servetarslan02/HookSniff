# SDK — Tamamlanan İşler

> Son güncelleme: 2026-05-18 01:40 GMT+8

---

## ✅ Swift SDK — HookSniff Custom — 2026-05-18

### Yöntem
- Svix repo'sunda Swift SDK bulunmadığı için mevcut HookSniff custom SDK korundu
- `hooksniff` isimlendirmesi zaten doğru
- Webhook verification backward-compatible (svix-id header desteği kasıtlı)

### Sonuç
- ~14 Swift dosyası
- Custom resource'lar: endpoints, webhooks, auth, analytics, api_keys, alerts, teams, search, billing, health
- Webhook verification (HMAC-SHA256)
- Auto-retry + exponential backoff
- Linux compatibility (FoundationNetworking)
- Versiyon: 1.0.0

---

## ✅ Elixir SDK — OpenAPI'den Adaptasyon — 2026-05-18

### Yöntem
- OpenAPI spec'den üretilmiş SDK, HookSniff isimlendirmesi zaten doğru
- Webhook verification backward-compatible (svix-id header desteği kasıtlı)

### Sonuç
- 247 dosya
- Webhook verification (HMAC-SHA256)
- Auto-retry + exponential backoff
- Versiyon: 1.0.0

---

## ✅ C# SDK — Svix'ten Adaptasyon — 2026-05-18

### Yöntem
- Svix C# SDK (`csharp/`) kopyalandı
- `svix` → `hooksniff` bulk find-replace
- Svix-specific features kaldırıldı
- API dosyaları HookSniff endpoint'leri ile yeniden yazıldı
- `.csproj` ve `.sln` güncellendi

### Sonuç
- 67 dosya
- ~40 typed model
- 7 API resource: authentication, endpoint, event_type, health, message, message_attempt, statistics
- Webhook verification (HMAC-SHA256, hooksniff-id/signature/timestamp headers)
- Auto-retry + exponential backoff
- Auto-idempotency key
- .NET 8.0+, Newtonsoft.Json, Polly
- Versiyon: 1.0.0

---

## ✅ PHP SDK — Svix'ten Adaptasyon — 2026-05-18

### Yöntem
- Svix PHP SDK (`php/`) kopyalandı
- `svix` → `hooksniff` bulk find-replace
- Svix-specific features kaldırıldı (application, background_task, connector, environment, ingest, integration, operational_webhook, streaming, message_poller)
- API dosyaları HookSniff endpoint'leri ile yeniden yazıldı
- `composer.json` güncellendi

### Sonuç
- 89 dosya
- ~50 typed model
- 7 API resource: authentication, endpoint, event_type, health, message, message_attempt, statistics
- Webhook verification (HMAC-SHA256, hooksniff-id/signature/timestamp headers)
- Auto-retry + exponential backoff
- Auto-idempotency key
- Versiyon: 1.0.0

---

## ✅ Kotlin SDK — Svix'ten Adaptasyon — 2026-05-18

### Yöntem
- Svix Kotlin SDK (`svix-libs/kotlin/`) kopyalandı
- `com.svix` → `com.hooksniff` package rename
- `Svix` → `HookSniff` class rename
- Svix-specific features kaldırıldı
- `build.gradle` ve `gradle.properties` güncellendi

### Sonuç
- 131 dosya
- 103 typed model
- 7 API resource: authentication, endpoint, event_type, health, message, message_attempt, statistics
- Webhook verification (HMAC-SHA256, Standard Webhooks)
- Auto-retry + exponential backoff
- Auto-idempotency key
- Versiyon: 1.0.0

---

## ✅ Java SDK — Svix'ten Adaptasyon — 2026-05-18

### Yöntem
- Svix Java SDK (`svix-libs/java/`) kopyalandı
- `com.svix` → `com.hooksniff` package rename
- `Svix` → `HookSniff` class rename
- Svix-specific features kaldırıldı
- `build.gradle` ve `gradle.properties` güncellendi

### Sonuç
- 158 dosya
- 104 typed model
- 7 API resource: authentication, endpoint, event_type, health, message, message_attempt, statistics
- Webhook verification (HMAC-SHA256, Standard Webhooks)
- Auto-retry + exponential backoff
- Auto-idempotency key
- Versiyon: 1.0.0

---

## ✅ Ruby SDK — Svix'ten Adaptasyon — 2026-05-18

### Yöntem
- Svix Ruby SDK (`svix-libs/ruby/`) kopyalandı
- `svix` → `hooksniff` bulk find-replace
- Svix-specific features kaldırıldı (application, background_task, connector, environment, ingest, integration, operational_webhook, streaming, message_poller)
- API dosyaları HookSniff endpoint'leri ile yeniden yazıldı
- `hooksniff.gemspec` güncellendi

### Sonuç
- 74 dosya (692'den düşürüldü — eski OpenAPI Generator boilerplate kaldırıldı)
- 48 typed model
- 7 API resource: authentication, endpoint, event_type, health, message, message_attempt, statistics
- Webhook verification (HMAC-SHA256, Standard Webhooks)
- Auto-retry + exponential backoff
- Auto-idempotency key
- Versiyon: 1.0.0

---

## ✅ Rust SDK — Svix'ten Doğrudan Adaptasyon — 2026-05-17

### Yöntem
- Svix Rust SDK (`svix-libs/rust/`) kopyalandı
- `svix` → `hooksniff` bulk find-replace
- Svix-specific features kaldırıldı
- `Cargo.toml` güncellendi

### Sonuç
- 118 Rust dosyası
- 98 typed model
- 6 resource: endpoint, message, message_attempt, authentication, event_type, statistics
- Versiyon: 1.0.0

---

## ✅ Go SDK — Svix'ten Doğrudan Adaptasyon — 2026-05-17

### Yöntem
- Svix Go SDK (`svix-libs/go/`) kopyalandı
- `svix` → `hooksniff` bulk find-replace
- Import path: `github.com/servetarslan02/hooksniff-go`
- `go.mod` oluşturuldu

### Sonuç
- 115 Go dosyası
- 99 typed model
- 6 resource
- Versiyon: 1.0.0

---

## ✅ Python SDK — Svix'ten Doğrudan Adaptasyon — 2026-05-17

### Yöntem
- Svix Python SDK (`svix-libs/python/svix/`) kopyalandı
- `svix` → `hooksniff` bulk find-replace
- Svix-specific features kaldırıldı
- `pyproject.toml` güncellendi

### Sonuç
- 127 Python dosyası
- 101 typed model
- 6 resource: endpoint, message, message_attempt, authentication, event_type, statistics
- Sync + Async destegi
- httpx + attrs + ApiBase pattern
- PEP 561 compliant (py.typed)
- Versiyon: 1.0.0

---

## ✅ Node.js SDK — Svix'ten Yeniden Adaptasyon — 2026-05-18

### Yöntem
- Svix JS SDK (`javascript/`) kopyalandı ve HookSniff'e adapte edildi
- Eski el yapımı SDK (v0.5.0) replace edildi
- `svix` → `hooksniff` bulk find-replace
- Svix-specific features kaldırıldı

### Sonuç
- 63 dosya
- ~40 typed model
- 7 API resource: authentication, endpoint, event_type, health, message, message_attempt, statistics
- Webhook verification (HMAC-SHA256, hooksniff-id/signature/timestamp headers)
- Auto-retry + exponential backoff
- Auto-idempotency key
- TypeScript, ESM+CJS
- Versiyon: 1.0.0
