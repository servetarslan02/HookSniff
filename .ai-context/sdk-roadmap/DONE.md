# SDK — Tamamlanan İşler

> Son güncelleme: 2026-05-18 18:29 GMT+8

---

## ✅ Ruby SDK v1.2.0 — Full Resource Update — 2026-05-18

### Yapılan:
- 24 yeni API dosyası eklendi
- Faz 8-15: Environment, BackgroundTask, OperationalWebhook, MessagePoller, Inbound, Connector
- Ek Resource'lar: Application, ApiKey, Search, Alert, Analytics, Billing, Portal, Team, Notification, SSO, AuditLog, CustomDomain, RateLimit, Routing, Template, Schema, Playground, ServiceToken
- hooksniff.rb güncellendi (tüm resource require + client accessor)
- README güncellendi (30+ resource tablosu)
- Ruby 3.2.4 kaynak koddan derlendi (libyaml + psych + openssl)
- curl ile RubyGems API'ye push edildi
- GitHub'a push edildi: `25d67cf`

### Sonuç:
- Versiyon: 1.0.0 → 1.2.0
- 30+ API resource
- %100 API kapsama
- RubyGems: https://rubygems.org/gems/hooksniff

---

## ✅ C# SDK v1.2.0 — Full Resource Update — 2026-05-18

### Yapılan:
- 25+ yeni resource eklendi
- Faz 8-15: Environment, BackgroundTask, OperationalWebhook, MessagePoller, Inbound, Connector, Integration, Stream
- Ek Resource'lar: Application, ApiKey, Search, Alert, Analytics, Billing, Portal, Team, Notification, SSO, AuditLog, CustomDomain, RateLimit, Routing, Template, Schema, Playground, ServiceToken
- 21 yeni model dosyası oluşturuldu
- HookSniffClient.cs güncellendi (30+ resource property)
- dotnet SDK 8.0 kuruldu
- NuGet'e publish edildi
- GitHub'a push edildi: `89fc6f2`

### Sonuç:
- Versiyon: 1.0.0 → 1.2.0
- 30+ API resource, 53+ model
- %100 API kapsama
- NuGet: https://www.nuget.org/packages/HookSniff/1.2.0

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
