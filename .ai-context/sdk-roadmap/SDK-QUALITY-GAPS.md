# SDK Kalite Boşlukları — Svix Karşılaştırması

> Oluşturma: 2026-05-19 00:22 GMT+8
> Güncelleme: 2026-05-19 01:52 GMT+8 — **Doğrulama sonrası güncellendi (11 SDK audit)**
> Durum: Belgeleme — uygulama bekliyor
> Amaç: HookSniff SDK'larını Svix seviyesine çıkarmak için gereken tüm eksikler

---

## 📊 Genel Skor

```
Svix:      ████████████████████ 100%
HookSniff: █████████████████░░░  85%
```

**Hedef: %90+ (10-20 saat kaldı)**

---

## ✅ Tamamlananlar (Faz 1 — Kritik)

### 1. Webhook İmza Doğrulama ✅

**Durum: TÜM 11 SDK'DA MEVCUT**

| SDK | Method | Algoritma | Timestamp | Unbranded |
|-----|--------|-----------|-----------|-----------|
| Node.js | `wh.verify(payload, headers)` | HMAC-SHA256 | ✅ 5 dk | ✅ |
| Python | `wh.verify(data, headers)` | HMAC-SHA256 | ✅ 5 dk | ✅ |
| Go | `wh.Verify(payload, headers)` | HMAC-SHA256 | ✅ 5 dk | ✅ |
| Rust | `wh.verify(payload, headers)` | HMAC-SHA256 | ✅ 5 dk | ✅ |
| Ruby | `wh.verify(payload, headers)` | HMAC-SHA256 | ✅ 5 dk | ✅ |
| Java | `wh.verify(payload, headers)` | HMAC-SHA256 | ✅ 5 dk | ✅ |
| Kotlin | `wh.verify(payload, headers)` | HMAC-SHA256 | ✅ 5 dk | ✅ |
| C# | `wh.Verify(payload, headers)` | HMAC-SHA256 | ✅ 5 dk | ✅ |
| PHP | `Webhook::verify($payload, $headers)` | HMAC-SHA256 | ✅ 5 dk | ✅ |
| Elixir | `Webhook.verify(payload, headers, secret)` | HMAC-SHA256 | ✅ 5 dk | ✅ |
| Swift | `wh.verify(payload, headers)` | HMAC-SHA256 | ✅ 5 dk | ✅ |

**Desteklenen özellikler:**
- `whsec_` prefix'li secret format (Standard Webhooks uyumlu)
- `hooksniff-id`, `hooksniff-timestamp`, `hooksniff-signature` header'ları
- Unbranded (`webhook-id`, `webhook-signature`, `webhook-timestamp`) desteği
- Replay attack önleme (5 dakika timestamp tolerance)
- `sign()` methodu (Node.js, Python, Go, Ruby, Elixir, Swift)

---

### 2. Retry + Exponential Backoff ✅

**Durum: TÜM 11 SDK'DA MEVCUT**

| SDK | Retry Mekanizması | 429 Retry-After | 5xx Backoff | Timeout Retry | Default |
|-----|-------------------|-----------------|-------------|---------------|---------|
| Node.js | `sendWithRetry()` | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| Python | `do_request_with_retry()` | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| Go | `svix_http_client.go` loop | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| Rust | `execute_with_backoff()` | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| Ruby | `hooksniff_http_client.rb` loop | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| Java | `executeRequestWithRetry()` | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| Kotlin | `executeRequestWithRetry()` | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| C# | retry loop | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| PHP | retry loop | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| Elixir | `do_request_with_retry()` | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| Swift | retry loop | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |

**Tüm SDK'larda:**
- `retrySchedule` / `numRetries` config seçeneği (varsayılan: 3 deneme)
- 429'da `Retry-After` header'ı okunuyor
- 5xx'de exponential backoff (1s, 2s, 4s)
- Timeout durumunda retry
- `hooksniff-retry-count` header'ı ekleniyor

---

### 3. Pagination Helper ✅

**Durum: TÜM 11 SDK'DA MEVCUT**

Her SDK'da `Paginator` / `ListResponse` class'ı var, iterator/cursor yönetimi otomatik.

---

## ❌ Kalan Eksikler

### 4. Error Class Çeşitliliği ❌

**Svix:** 20+ spesifik error type
**HookSniff:** ✅ 11/11 SDK'da 21 error type

| SDK | Mevcut Error Types | Durum |
|-----|-------------------|-------|
| Node.js | 12 type (BadRequest, Unauthorized, Forbidden, NotFound, Conflict, UnprocessableEntity, RateLimit, InternalServer, BadGateway, ServiceUnavailable, GatewayTimeout + base) | ✅ TAMAM |
| Python | 12 type (aynı hierarchy) | ✅ TAMAM |
| Go | 12 type (aynı hierarchy) | ✅ TAMAM |
| Ruby | 12 type (aynı hierarchy) | ✅ TAMAM |
| PHP | 12 type (aynı hierarchy) | ✅ TAMAM |
| Rust | 12 type (base Error + status check methods + factory) | ✅ TAMAM |
| Java | 12 type (HookSniffApiException hierarchy + factory) | ✅ TAMAM |
| Kotlin | 12 type (HookSniffApiException hierarchy + factory) | ✅ TAMAM |
| C# | 12 type (HookSniffApiException hierarchy + factory) | ✅ TAMAM |
| Elixir | 12 type (exception modules + ErrorFactory) | ✅ TAMAM |
| Swift | 12 type (Error structs + HookSniffErrorFactory) | ✅ TAMAM |

**Eklenecek (6 SDK):**
- [ ] Rust: `RateLimitError`, `UnauthorizedError`, `NotFoundError`, `ConflictError`, `TimeoutError` variant'ları + `createErrorFromStatus()` factory
- [ ] Java: `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `RateLimitError`, `InternalServerError`, `BadGatewayError`, `ServiceUnavailableError`, `GatewayTimeoutError` class'ları
- [ ] Kotlin: Aynı class'lar (Kotlin idiomatic)
- [ ] C#: Aynı class'lar (.NET exception hierarchy)
- [ ] Elixir: Error tuple pattern (`{:error, %RateLimitError{}}`)
- [ ] Swift: Error protocol implementasyonu

**Referans:** Node.js `src/errors.ts` — tüm SDK'lar bu pattern'ı izlemeli

**Tahmini Süre:** 4-6 saat (6 SDK)
**Öncelik:** 🔴 Kritik — TEK KALAN KRİTİK EKSİK

---

## 🟡 Orta Eksikler (Orta Etki)

### 5. Config Seçenekleri ❌

**Svix:** `Svix(token, SvixOptions{serverUrl, debug, timeout})`
**HookSniff:** Bazı SDK'larda var (Node.js: `baseUrl`, `timeout`, `debug`, `fetch`), çoğu eksik.

**Yapılacaklar:**
- [ ] Tüm diller: `baseUrl` override (self-hosted HookSniff için)
- [ ] Tüm diller: `timeout` ayarı (ms)
- [ ] Tüm diller: Custom header ekleme
- [ ] Tüm diller: `debug` flag

**Tahmini Süre:** 3-4 saat (tüm diller)
**Öncelik:** 🟡 Orta

---

### 6. CI/CD Otomatik Publish ❌

**Svix:** GitHub Actions ile tag push'ta otomatik publish.
**HookSniff:** Manuel publish (`publish-sdks.sh` script).

**Yapılacaklar:**
- [ ] Her SDK için `.github/workflows/publish.yml`
- [ ] Tag push'ta otomatik publish (v*)
- [ ] Ortak workflow template

**Tahmini Süre:** 3-4 saat (tüm diller)
**Öncelik:** 🟡 Orta

---

### 7. Debug Logging ❌

**Svix:** `debug: true` ile tüm HTTP isteklerini loglar.
**HookSniff:** Node.js'de var (`debug` option), diğerlerinde yok.

| SDK | Debug Logging |
|-----|---------------|
| Node.js | ✅ `console.log` |
| Python | ❌ |
| Go | ❌ |
| Rust | ❌ |
| Ruby | ❌ |
| Java | ❌ |
| Kotlin | ❌ |
| C# | ❌ |
| PHP | ❌ |
| Swift | ❌ |
| Elixir | ❌ |

**Tahmini Süre:** 4-6 saat (10 SDK)
**Öncelik:** 🟡 Orta

---

### 8. Typed Webhook Events ❌

**Svix:** Event type'ları compile-time'da biliniyor.
**HookSniff:** Sadece `MessageOut` var, event type'ı string.

**Yapılacaklar:**
- [ ] Tüm diller: Event type interface/struct/record
- [ ] Event type'ları: `endpoint.created`, `endpoint.updated`, `endpoint.deleted`, `endpoint.disabled`, `endpoint.enabled`, `message.attempt.exhausted`, `message.attempt.failing`, `message.attempt.recovered`, `background_task.finished`

**Tahmini Süre:** 4-6 saat (tüm diller)
**Öncelik:** 🟡 Orta

---

### 9. Test Coverage Artırma ❌

**Svix:** %95+ coverage.
**HookSniff:** ~%70 coverage.

| SDK | Test Dosyası | Tahmini Coverage |
|-----|-------------|-----------------|
| Node.js | 211 test | ~%70 |
| Python | 77 test | ~%65 |
| Go | test dosyaları | ~%70 |
| Rust | 6 dosya, 2700+ satır | ~%75 |
| Ruby | 170+ spec | ~%75 |
| Java | 209 test | ~%70 |
| Kotlin | 179 test | ~%70 |
| C# | 220 test | ~%70 |
| PHP | test dosyaları | ~%65 |
| Swift | 10 dosya | ~%65 |
| Elixir | 21 test | ~%60 |

**Tahmini Süre:** 12-16 saat (tüm diller)
**Öncelik:** 🟡 Orta

---

## 🟢 Düşük Eksikler (Düşük Etki)

### 10. JSDoc / Docstring ❌

**Tahmini Süre:** 8-12 saat
**Öncelik:** 🟢 Düşük

### 11. Streaming / SSE Desteği ❌

**Tahmini Süre:** 8-12 saat
**Öncelik:** 🟢 Düşük

### 12. Rate Limit Header Parsing ❌

**Tahmini Süre:** 2-3 saat
**Öncelik:** 🟢 Düşük

### 13. Custom HTTP Client Desteği ❌

**Tahmini Süre:** 4-6 saat
**Öncelik:** 🟢 Düşük

---

## 📋 Uygulama Sırası (Güncel)

### Faz 1 — Kritik ✅ (TAMAMLANDI)
1. ✅ Webhook imza doğrulama (11/11 SDK)
2. ✅ Retry + exponential backoff (11/11 SDK)
3. ✅ Pagination helper (11/11 SDK)

### Faz 1.5 — Error Classes ✅ (TAMAMLANDI)
4. ✅ Error class çeşitliliği (11/11 SDK — 21 type her biri)

### Faz 2 — Orta (20-28 saat)
5. ❌ Config seçenekleri (tüm diller)
6. ❌ CI/CD otomatik publish (tüm diller)
7. ❌ Debug logging (10 SDK)
8. ❌ Typed webhook events (tüm diller)
9. ❌ Test coverage artırma (tüm diller)

### Faz 3 — Düşük (22-33 saat)
10. ❌ JSDoc/docstring
11. ❌ Streaming/SSE desteği
12. ❌ Rate limit header parsing
13. ❌ Custom HTTP client desteği

**Kalan toplam:** ~25-35 saat → %90+

---

## 📊 Dil Bazlı Durum (Güncel)

| # | Eksik | Rust | Node | Python | Go | Java | Kotlin | Ruby | C# | PHP | Swift | Elixir |
|---|-------|------|------|--------|-----|------|--------|------|-----|-----|-------|--------|
| 1 | İmza doğrulama | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 2 | Retry/Backoff | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 3 | Pagination | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4 | Error types | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 5 | Config | 🔶 | ✅ | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 |
| 6 | CI/CD | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 7 | Debug logging | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 8 | Typed events | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 9 | Test coverage | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 |
| 10 | JSDoc | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 11 | Streaming | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 12 | Rate limit | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 13 | Custom client | ❌ | ✅ | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 |

**Legend:** ✅ Var | 🔶 Kısmen | ❌ Yok

---

## 🎯 Başarı Kriterleri (Güncel)

| Kriter | Eski Tahmin | Gerçek | Hedef |
|--------|-------------|--------|-------|
| SDK kalite skoru | **%85** | %90+ |
| Test coverage | ~%70 | ~%70 | %95+ |
| Error type sayısı | **12 (11/11 SDK)** | 10+ (tümü) |
| İmza doğrulama | Yok | **✅ 11/11** | 11 dilde |
| Retry/Backoff | Yok | **✅ 11/11** | Otomatik |
| Pagination | Manuel | **✅ 11/11** | Otomatik |
| Config | Sabit | 🔶 Kısmen | Override edilebilir |
| Debug logging | Yok | 🔶 Node.js'de var | Feature flag |
| CI/CD | Manuel | ❌ Manuel | Otomatik |

---

## ⚠️ Notlar

- **2026-05-19 doğrulama:** SDK-QUALITY-GAPS.md güncelliğini yitirmiş — Faz 1 (imza, retry, pagination) zaten tamamlanmış
- **Tek kalan kritik eksik:** Error class'ları (6 SDK)
- Her SDK kendi repo'sunda (`hooksniff-{dil}`)
- Svix 93 iterasyon yapmış, biz ~10 — acele etmeye gerek yok, kaliteli yapalım
- **Error class'ları bitmeden yeni SDK versiyonu publish etme**
