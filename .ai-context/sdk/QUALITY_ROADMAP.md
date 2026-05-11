# 🎯 SDK Kalite Yol Haritası — Svix Seviyesi Hedefi

> Oluşturulma: 2026-05-11 21:42 GMT+8
> Hedef: Tüm SDK'ları Svix ile aynı kalite seviyesine çıkarmak
> Referans: Svix v1.93.0 SDK'ları (MIT lisans, açık kaynak)
> Kaynak: https://github.com/svix/svix-webhooks

---

## 📊 Mevcut Durum (2026-05-11)

| Kriter | Svix | HookSniff | Fark |
|--------|------|-----------|------|
| Unique model types | 218 | 97 | 2.2x |
| HTTP library | native fetch + retry | request (deprecated) | 🔴 |
| Serialization | ✅ _toJsonObject/_fromJsonObject | ❌ Ham JSON | 🔴 |
| Pagination | ✅ Iterator pattern | ❌ Manuel | 🔴 |
| Wrapper class | ✅ Svix() | ❌ Yok | 🔴 |
| İmza doğrulama | ✅ Webhook.verify() | ❌ Yok | 🔴 |
| User-Agent header | ✅ svix-libs/version | ❌ Yok | 🟡 |
| Idempotency key | ✅ Built-in | ❌ Yok | 🟡 |
| Injectable HTTP | ✅ Custom fetch | ❌ Sabit | 🟡 |
| Timeout | ✅ Configurable | ❌ Sabit | 🟡 |
| SDK version header | ✅ | ❌ | 🟡 |
| Retry logic | ✅ Exponential | ✅ Var | 🟢 |
| Error classes | ✅ ApiException | ✅ HttpError | 🟢 |
| TypeScript types | ✅ | ✅ | 🟢 |
| CHANGELOG | ❌ | ❌ | 🟢 |

---

## 🔴 AŞAMA 1 — Kritik (Hemen yapılmalı)

Her madde ayrı oturumda, ayrı commit ile yapılabilir.

### 1.1 Node.js: `request` → `node-fetch` Değişimi
- **Dosya:** `sdks/node/` tüm API class'ları
- **Sorun:** `request` library deprecated (2020'den beri)
- **Çözüm:** `node-fetch` veya native `fetch` (Node 18+)
- **Etki:** Güvenlik açığı kapanır, modern Node.js uyumluluğu
- **Zorluk:** Orta — tüm API class'larındaki `request_1` import'u değişecek
- **Referans:** Svix'in `request.js` dosyası (custom fetch wrapper)
- **Oturum:** 1 oturum

### 1.2 Wrapper Class Ekleme (Tüm Diller)
- **Hedef:** `new HookSniff(key)` → `client.endpoints.create()` pattern
- **Dosya:** Her SDK için yeni `hooksniff.js/ts/py/go/rs` vb.
- **İçerik:**
  - Constructor: `new HookSniff(apiKey, options?)`
  - Servisler: `client.endpoints`, `client.webhooks`, `client.auth` vb.
  - Her servis ilgili API class'ını wrap eder
- **Referans:** Svix'in `index.js` → `Svix` class'ı
- **Diller (sıra):**
  1. Node.js (TypeScript)
  2. Python
  3. Go
  4. Rust
  5. Java
  6. Kotlin
  7. Ruby
  8. PHP
  9. C#
  10. Elixir
  11. Swift
- **Oturum:** Her dil için 1 oturum (11 oturum toplam)

### 1.3 İmza Doğrulama Ekleme (Tüm Diller)
- **Hedef:** `verifySignature(payload, headers, secret)` fonksiyonu
- **Algoritma:** HMAC-SHA256 (Standard Webhooks uyumlu)
- **Header:** `x-hooksniff-signature` veya `svix-id`, `svix-timestamp`, `svix-signature`
- **Referans:** Svix'in `webhook.js` → `Webhook.verify()`
- **İçerik:**
  - `verifySignature(payload, signatureHeader, secret)` → boolean
  - `signPayload(payload, secret)` → signature string
  - Timing-safe comparison (constant-time)
  - Timestamp validation (5 dakika tolerance)
- **Diller (sıra):** Wrapper class ile aynı anda yapılabilir
- **Oturum:** Wrapper class oturumlarına dahil

---

## 🟡 AŞAMA 2 — Yüksek Kalite (Lansman önce)

### 2.1 Serialization/Deserialization Katmanı
- **Hedef:** Model tipleri için `_toJsonObject()` ve `_fromJsonObject()`
- **Neden:** Ham JSON yerine tip güvenli dönüşüm
- **Dosya:** Her model type için serializer
- **Referans:** Svix model serializer'ları (ör. `EndpointInSerializer`)
- **Oturum:** 2-3 oturum (tüm diller)

### 2.2 Pagination Iterator Pattern
- **Hedef:** `for await (const ep of client.endpoints.list())` pattern
- **Neden:** Kullanıcı manuel page/perPage ile uğraşmamalı
- **Referans:** Svix'in iterator pattern'i
- **Metotlar:** `list()`, `listAll()`, `iterate()`
- **Oturum:** 1-2 oturum

### 2.3 User-Agent Header
- **Hedef:** `User-Agent: hooksniff-sdk/0.3.0 (node)`
- **Neden:** Analytics, debugging, version tracking
- **Dosya:** Her SDK'nın HTTP wrapper'ı
- **Oturum:** 1 oturum (tüm diller)

### 2.4 Idempotency Key Desteği
- **Hedef:** `client.webhooks.send(data, { idempotencyKey: 'xxx' })`
- **Neden:** Duplicate webhook prevention
- **Header:** `Idempotency-Key` header'ı otomatik ekle
- **Oturum:** 1 oturum

### 2.5 Injectable HTTP Client
- **Hedef:** `new HookSniff({ fetch: customFetch })`
- **Neden:** Test edilebilirlik, custom middleware
- **Referans:** Svix'in injectable fetch pattern'i
- **Oturum:** 1 oturum

### 2.6 Configurable Timeout
- **Hedef:** `new HookSniff({ timeout: 30000 })`
- **Neden:** Farklı ortamlar farklı timeout gerektirir
- **Varsayılan:** 30 saniye
- **Oturum:** 1 oturum

---

## 🟢 AŞAMA 3 — Mükemmellik (Lansman sonrası)

### 3.1 Unit Testler (Her SDK)
- **Hedef:** Her SDK'da en az 20 test
- **Kapsam:**
  - Model serialization/deserialization
  - API method parametreleri
  - Error handling
  - İmza doğrulama
  - Pagination
  - Retry logic
  - Timeout behavior
- **Framework:**
  - Node.js: Jest
  - Python: pytest
  - Go: testing
  - Rust: #[test]
  - Java/Kotlin: JUnit
  - Ruby: RSpec
  - PHP: PHPUnit
  - C#: xUnit
  - Elixir: ExUnit
  - Swift: XCTest
- **Oturum:** Her dil için 1-2 oturum (15-20 oturum toplam)

### 3.2 Model Sayısını Artırma
- **Hedef:** 97 → 150+ model type
- **Neden:** API coverage artmalı
- **Yöntem:** OpenAPI spec'e yeni endpoint'ler ekle → SDK'ları yeniden üret
- **Kapsam:**
  - Webhook event types (daha detaylı)
  - Error response models
  - Pagination response models
  - Filter/search models
  - Bulk operation models
- **Oturum:** 2-3 oturum

### 3.3 CHANGELOG Oluşturma
- **Hedef:** Her SDK için CHANGELOG.md
- **Format:** Keep a Changelog standardı
- **İçerik:** Her versiyon için Added, Changed, Fixed, Removed
- **Oturum:** 1 oturum

### 3.4 CI/CD Pipeline
- **Hedef:** GitHub Actions ile otomatik test + publish
- **Workflow:**
  1. PR → test çalıştır
  2. Merge → version bump
  3. Tag → publish to all registries
- **Not:** GitHub Actions billing sorunu var, alternatif: GCP Cloud Build
- **Oturum:** 2-3 oturum

### 3.5 SDK Dokümantasyon Sitesi
- **Hedef:** `docs.hooksniff.dev/sdk` veya benzeri
- **İçerik:**
  - Her dil için Quick Start
  - API reference
  - Code examples
  - Migration guide (eski versiyondan yeniye)
- **Araç:** Docusaurus veya Mintlify
- **Oturum:** 3-5 oturum

---

## 📋 Oturum Bazlı Uygulama Planı

### Kısa Vadeli (5 oturum)
| Oturum | Görev | Aşama |
|--------|-------|-------|
| 1 | Node.js `request` → `node-fetch` | 1.1 |
| 2 | Node.js wrapper class + imza verify | 1.2 + 1.3 |
| 3 | Python wrapper class + imza verify | 1.2 + 1.3 |
| 4 | Go wrapper class + imza verify | 1.2 + 1.3 |
| 5 | Rust wrapper class + imza verify | 1.2 + 1.3 |

### Orta Vadeli (10 oturum)
| Oturum | Görev | Aşama |
|--------|-------|-------|
| 6 | Java wrapper class + imza verify | 1.2 + 1.3 |
| 7 | Kotlin wrapper class + imza verify | 1.2 + 1.3 |
| 8 | Ruby wrapper class + imza verify | 1.2 + 1.3 |
| 9 | PHP wrapper class + imza verify | 1.2 + 1.3 |
| 10 | C# wrapper class + imza verify | 1.2 + 1.3 |
| 11 | Elixir + Swift wrapper class + imza verify | 1.2 + 1.3 |
| 12 | Serialization/Deserialization (Node, Python, Go) | 2.1 |
| 13 | Serialization/Deserialization (kalan 8 dil) | 2.1 |
| 14 | Pagination iterator (tüm diller) | 2.2 |
| 15 | User-Agent + Idempotency + Timeout (tüm diller) | 2.3-2.6 |

### Uzun Vadeli (lansman sonrası)
| Oturum | Görev | Aşama |
|--------|-------|-------|
| 16-20 | Unit testler (Node, Python, Go, Rust, Java) | 3.1 |
| 21-25 | Unit testler (kalan 6 dil) | 3.1 |
| 26 | Model sayısı artırma | 3.2 |
| 27 | CHANGELOG oluşturma | 3.3 |
| 28-30 | CI/CD pipeline | 3.4 |
| 31-35 | SDK dokümantasyon sitesi | 3.5 |

---

## 🔧 Teknik Referanslar

### Svix Kaynak Kodu (MIT Lisans)
- Node.js SDK: https://github.com/svix/svix-webhooks/tree/main/javascript
- Python SDK: https://github.com/svix/svix-webhooks/tree/main/python
- Go SDK: https://github.com/svix/svix-webhooks/tree/main/go
- Rust SDK: https://github.com/svix/svix-webhooks/tree/main/rust
- Java SDK: https://github.com/svix/svix-webhooks/tree/main/java
- Ruby SDK: https://github.com/svix/svix-webhooks/tree/main/ruby
- C# SDK: https://github.com/svix/svix-webhooks/tree/main/csharp
- Kotlin SDK: https://github.com/svix/svix-webhooks/tree/main/kotlin
- Webhook verify: https://github.com/svix/svix-webhooks/blob/main/javascript/src/webhook.ts

### Standard Webhooks Spesifikasyonu
- https://github.com/standard-webhooks/standard-webhooks
- HMAC-SHA256 imza formatı
- `svix-id`, `svix-timestamp`, `svix-signature` header'ları

### OpenAPI Generator
- https://openapi-generator.tech/
- HookSniff spec: `docs/openapi.yaml`
- Config: `openapitools.json`

---

## ⚠️ Dikkat Edilecekler

1. **Her SDK ayrı commit** — rollback kolaylığı
2. **Backward compatibility** — mevcut kullanıcılar bozulmamalı
3. **Semver** — breaking change = major version bump
4. **Test zorunlu** — test olmadan publish yok
5. **CHANGELOG güncelle** — her değişikliklik kaydedilmeli
6. **Svix kodunu doğrudan kopyalama** — mimariyi örnek al, kodu yaz
7. **OpenAPI spec önce** — SDK'dan önce spec'i güncelle
