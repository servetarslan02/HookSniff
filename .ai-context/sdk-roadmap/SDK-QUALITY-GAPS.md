# SDK Kalite Boşlukları — Svix Karşılaştırması

> Oluşturma: 2026-05-19 00:22 GMT+8
> Güncelleme: 2026-05-19 00:40 GMT+8 — Öncelikler yeniden düzenlendi
> Durum: Belgeleme — uygulama bekliyor
> Amaç: HookSniff SDK'larını Svix seviyesine çıkarmak için gereken tüm eksikler

---

## 📊 Genel Skor

```
Svix:      ████████████████████ 100%
HookSniff: ████████████░░░░░░░░  62%
```

**Hedef: %90+ (50-65 saat)**

---

## 🔴 Kritik Eksikler (Yüksek Etki)

### 1. Webhook İmza Doğrulama ← EN KRİTİK

Bir webhook SDK'sının **birinci görevi**: gelen webhook'ların gerçekten HookSniff'ten geldiğini doğrulamak. Bu yoksa güvenlik açığı var demektir.

**Svix Örneği (Python):**
```python
from svix.webhooks import Webhook
wh = Webhook("whsec_xxx")
payload = wh.verify(request.body, request.headers)
# Doğrulanmış payload döner, geçersizse exception fırlatır
```

**Svix Örneği (Node.js):**
```typescript
const wh = new Webhook("whsec_xxx");
const payload = wh.verify(request.body, request.headers);
```

**Yapılacaklar:**
- [ ] Rust: `WebhookVerifier` struct, `verify(payload, headers, secret)` methodu
- [ ] Node.js: `Webhook.verify(payload, headers)` static method
- [ ] Python: `Webhook.verify(payload, headers)` class method
- [ ] Go: `webhook.Verify(payload, headers, secret)` fonksiyonu
- [ ] Java/Kotlin: `WebhookVerifier.verify(payload, headers, secret)`
- [ ] Ruby: `Webhook.verify(payload, headers, secret)`
- [ ] C#: `WebhookVerifier.Verify(payload, headers, secret)`
- [ ] PHP: `Webhook::verify($payload, $headers, $secret)`
- [ ] Swift: `WebhookVerifier.verify(payload:headers:secret:)`
- [ ] Elixir: `Webhook.verify(payload, headers, secret)`

**Her dilde desteklenecek imza algoritmaları:**
- HMAC-SHA256 (v1)
- HMAC-SHA512 (v2, opsiyonel)
- Timestamp kontrolü (replay attack önleme)

**Tahmini Süre:** 6-8 saat (tüm diller)
**Öncelik:** 🔴 Kritik — #1 öncelik

---

### 2. Retry + Exponential Backoff

Webhook teslimatı güvenilir olmalı. 429, 500, 502, 503, timeout durumlarında otomatik retry yapılmalı.

**Svix Davranışı:**
- 429 → `Retry-After` header'ına göre bekle
- 500/502/503 → Exponential backoff (1s, 2s, 4s, 8s...)
- Timeout → Retry
- Max 3 deneme (varsayılan)

**Yapılacaklar:**
- [ ] Tüm diller: `maxRetries` config seçeneği (varsayılan: 3)
- [ ] Tüm diller: Exponential backoff + jitter
- [ ] Tüm diller: 429'da `Retry-After` header'ını oku
- [ ] Tüm diller: Retry edilen istekleri log (debug modunda)

**Tahmini Süre:** 4-6 saat (tüm diller)
**Öncelik:** 🔴 Kritik — #2 öncelik

---

### 3. Pagination Helper

**Svix:** Otomatik iterator yönetimi, `list()` methodu otomatik sayfalama döndürüyor.
**HookSniff:** Kullanıcı elle `iterator` parametresini yönetmek zorunda.

**Svix Örneği (Node.js):**
```typescript
const list = await svx.message.list({ limit: 100 });
for (const msg of list.data) {
    // işle
}
if (!list.done) {
    // list.next() ile sonraki sayfa
}
```

**HookSniff Mevcut (Node.js):**
```typescript
let cursor = undefined;
do {
    const list = await client.message.list({ limit: 100, iterator: cursor });
    for (const msg of list.data) {
        // işle
    }
    cursor = list.done ? undefined : list.iterator;
} while (cursor);
```

**Yapılacaklar:**
- [ ] Rust: `ListResponse<T>`'a `next_page()` methodu ekle
- [ ] Node.js: `list()` async iterator döndürsün
- [ ] Python: `list()` generator/async generator döndürsün
- [ ] Go: `ListPager` struct ekle
- [ ] Java/Kotlin: `PageIterator<T>` class ekle
- [ ] Ruby: `each` methodu ekle (Enumerable)
- [ ] C#: `IAsyncEnumerable<T>` desteği
- [ ] PHP: Generator/Iterator pattern
- [ ] Swift: `AsyncSequence` desteği
- [ ] Elixir: Stream/Flow pattern

**Tahmini Süre:** 8-12 saat (tüm diller)
**Öncelik:** 🔴 Kritik — #3 öncelik

---

### 4. Error Class Çeşitliliği

**Svix:** 20+ spesifik error type:
```
SvixError
├── HttpError (status, body)
│   ├── BadRequestError (400)
│   ├── UnauthorizedError (401)
│   ├── ForbiddenError (403)
│   ├── NotFoundError (404)
│   ├── ConflictError (409)
│   ├── RateLimitError (429, retryAfter)
│   └── InternalServerError (500)
├── ValidationError (field, message)
├── TimeoutError
├── NetworkError
└── AuthenticationError
```

**HookSniff Mevcut (Rust):**
```rust
pub enum Error {
    Generic(String),
    Http(HttpErrorContent<HttpErrorOut>),
    Validation(HttpErrorContent<HttpValidationError>),
}
```

**Yapılacaklar:**
- [ ] Rust: `RateLimited`, `Unauthorized`, `NotFound`, `Conflict`, `Timeout` variant'ları ekle
- [ ] Node.js: Spesifik error class'ları ekle
- [ ] Python: Exception hierarchy ekle
- [ ] Go: Error type assertion desteği
- [ ] Java/Kotlin: Exception class'ları ekle
- [ ] Ruby: Error class hierarchy
- [ ] C#: Exception class'ları
- [ ] PHP: Exception class'ları
- [ ] Swift: Error protocol implementasyonu
- [ ] Elixir: Error tuple pattern

**Tahmini Süre:** 6-8 saat (tüm diller)
**Öncelik:** 🔴 Kritik — #4 öncelik

---

## 🟡 Orta Eksikler (Orta Etki)

### 5. Config Seçenekleri

**Svix:** `Svix(token, SvixOptions{serverUrl, debug, timeout})`
**HookSniff:** Sabit ayarlar, çoğu config edilemiyor.

**Yapılacaklar:**
- [ ] Tüm diller: `baseUrl` override (self-hosted HookSniff için)
- [ ] Tüm diller: `timeout` ayarı (ms)
- [ ] Tüm diller: Custom header ekleme
- [ ] Tüm diller: `debug` flag

**Tahmini Süre:** 3-4 saat (tüm diller)
**Öncelik:** 🟡 Orta — #5 öncelik

---

### 6. CI/CD Otomatik Publish

**Svix:** GitHub Actions ile tag push'ta otomatik publish.
**HookSniff:** Manuel publish, unutulabiliyor.

**Yapılacaklar:**
- [ ] Rust: `.github/workflows/publish.yml` — tag → `cargo publish`
- [ ] Node.js: `.github/workflows/publish.yml` — tag → `npm publish`
- [ ] Python: `.github/workflows/publish.yml` — tag → `twine upload`
- [ ] Go: GitHub release + tag
- [ ] Java/Kotlin: `.github/workflows/publish.yml` — tag → Maven Central
- [ ] Ruby: `.github/workflows/publish.yml` — tag → `gem push`
- [ ] C#: `.github/workflows/publish.yml` — tag → `dotnet nuget push`
- [ ] PHP: `.github/workflows/publish.yml` — tag → Packagist (auto-update)
- [ ] Elixir: `.github/workflows/publish.yml` — tag → `mix hex.publish`
- [ ] Swift: GitHub release + tag

**Ortak Workflow Template:**
```yaml
name: Publish SDK
on:
  push:
    tags: ['v*']
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Dil-spesifik publish adımları
```

**Tahmini Süre:** 3-4 saat (tüm diller)
**Öncelik:** 🟡 Orta — #6 öncelik

---

### 7. Debug Logging

**Svix:** `debug: true` seçeneği ile tüm HTTP isteklerini loglar.
**HookSniff:** Hiç logging yok.

**Yapılacaklar:**
- [ ] Rust: `tracing` feature flag ile debug logging
- [ ] Node.js: `debug` option + `console.debug` output
- [ ] Python: `logging` modülü ile debug logger
- [ ] Go: `log/slog` ile debug logging
- [ ] Java/Kotlin: SLF4J/Log4j desteği
- [ ] Ruby: `Logger` modülü
- [ ] C#: `ILogger` desteği
- [ ] PHP: `error_log` veya PSR-3 logger
- [ ] Swift: `os_log` desteği
- [ ] Elixir: `Logger` modülü

**Log Formatı:**
```
[HOOKSNIFF] GET /v1/webhooks → 200 (123ms)
[HOOKSNIFF] POST /v1/webhooks → 201 (456ms) [idempotency: auto_xxx]
[HOOKSNIFF] GET /v1/webhooks → 429 (retry in 2s)
[HOOKSNIFF] GET /v1/webhooks → 200 (89ms) [retry #1]
```

**Tahmini Süre:** 4-6 saat (tüm diller)
**Öncelik:** 🟡 Orta

---

### 8. Typed Webhook Events

**Svix:** Event type'ları compile-time'da biliniyor.
**HookSniff:** Sadece `MessageOut` var, event type'ı string.

**Yapılacaklar:**
- [ ] Tüm diller: Webhook event type'ları için interface/struct/record oluştur
- [ ] Event type'ları:
  - `endpoint.created`
  - `endpoint.updated`
  - `endpoint.deleted`
  - `endpoint.disabled`
  - `endpoint.enabled`
  - `message.attempt.exhausted`
  - `message.attempt.failing`
  - `message.attempt.recovered`
  - `background_task.finished`

**Tahmini Süre:** 4-6 saat (tüm diller)
**Öncelik:** 🟡 Orta

---

### 9. Test Coverage Artırma

**Svix:** %95+ coverage, her resource için mock test.
**HookSniff:** ~%70 coverage, sadece temel testler.

**Yapılacaklar:**
- [ ] Rust: Her API resource için wiremock test
- [ ] Node.js: Jest ile tüm endpoint'lerin testi
- [ ] Python: pytest ile tüm endpoint'lerin testi
- [ ] Go: `testing` ile tüm endpoint'lerin testi
- [ ] Java/Kotlin: JUnit + WireMock
- [ ] Ruby: RSpec ile tüm endpoint'lerin testi
- [ ] C#: xUnit + WireMock.Net
- [ ] PHP: PHPUnit ile tüm endpoint'lerin testi
- [ ] Swift: XCTest ile tüm endpoint'lerin testi
- [ ] Elixir: ExUnit ile tüm endpoint'lerin testi

**Test Senaryoları:**
1. Her endpoint'in başarılı response'u
2. Her error code'un doğru handle'ı (400, 401, 403, 404, 409, 429, 500)
3. Rate limit retry
4. Idempotency key
5. Pagination (iterator)
6. Webhook verification (geçerli, geçersiz, expired timestamp)
7. Edge cases (boş body, büyük payload, Unicode)

**Tahmini Süre:** 12-16 saat (tüm diller)
**Öncelik:** 🟡 Orta

---

## 🟢 Düşük Eksikler (Düşük Etki)

### 10. JSDoc / Docstring

**Svix:** Her method için JSDoc/docstring + example kod.
**HookSniff:** Minimal documentation.

**Yapılacaklar:**
- [ ] Her public method için:
  - Açıklama (ne yapar)
  - Parametreler (tip, zorunlu mu, default değer)
  - Dönüş değeri
  - Example kod
  - Throws/Errors

**Tahmini Süre:** 8-12 saat (tüm diller)
**Öncelik:** 🟢 Düşük

---

### 11. Streaming / SSE Desteği

**Svix:** Server-Sent Events desteği.
**HookSniff:** Yok.

**Yapılacaklar:**
- [ ] Node.js: `EventSource` veya custom SSE client
- [ ] Python: `httpx` streaming
- [ ] Go: `bufio.Scanner` ile SSE
- [ ] Rust: `tokio::io::AsyncBufRead` ile SSE
- [ ] Diğer diller: HTTP streaming desteği

**Tahmini Süre:** 8-12 saat (tüm diller)
**Öncelik:** 🟢 Düşük

---

### 12. Rate Limit Header Parsing

**Svix:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` header'larını parse eder.
**HookSniff:** Sadece 429'da retry.

**Yapılacaklar:**
- [ ] Tüm diller: Rate limit header'larını response'a ekle
- [ ] `rateLimitRemaining`, `rateLimitReset` property'leri

**Tahmini Süre:** 2-3 saat (tüm diller)
**Öncelik:** 🟢 Düşük

---

### 13. Custom HTTP Client Desteği

**Svix:** Kullanıcı kendi HTTP client'ını verebilir.
**HookSniff:** Sabit client.

**Yapılacaklar:**
- [ ] Rust: `tower::Service` trait ile custom backend
- [ ] Node.js: Custom `fetch` function
- [ ] Python: Custom `httpx.Client`
- [ ] Go: `http.Client` injection
- [ ] Java/Kotlin: `OkHttpClient` injection
- [ ] Diğer diller: HTTP client injection

**Tahmini Süre:** 4-6 saat (tüm diller)
**Öncelik:** 🟢 Düşük

---

## 📋 Uygulama Sırası

### Faz 1 — Kritik (24-34 saat)
1. Webhook imza doğrulama (tüm diller)
2. Retry + exponential backoff (tüm diller)
3. Pagination helper (tüm diller)
4. Error class çeşitliliği (tüm diller)

### Faz 2 — Orta (20-28 saat)
5. Config seçenekleri (tüm diller)
6. CI/CD otomatik publish (tüm diller)
7. Debug logging (tüm diller)
8. Typed webhook events (tüm diller)
9. Test coverage artırma (tüm diller)

### Faz 3 — Düşük (22-33 saat)
10. JSDoc/docstring (tüm diller)
11. Streaming/SSE desteği
12. Rate limit header parsing
13. Custom HTTP client desteği

**Toplam:** ~50-65 saat → %90+

---

## 📊 Dil Bazlı Durum

| # | Eksik | Rust | Node | Python | Go | Java | Kotlin | Ruby | C# | PHP | Swift | Elixir |
|---|-------|------|------|--------|-----|------|--------|------|-----|-----|-------|--------|
| 1 | İmza doğrulama | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 2 | Retry/Backoff | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 3 | Pagination | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4 | Error types | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 |
| 5 | Config | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 6 | CI/CD | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 7 | Debug logging | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 8 | Typed events | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 9 | Test coverage | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 |
| 10 | JSDoc | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 11 | Streaming | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 12 | Rate limit | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 13 | Custom client | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Legend:** ✅ Var | 🔶 Kısmen | ❌ Yok

---

## 🎯 Başarı Kriterleri

| Kriter | Mevcut | Hedef |
|--------|--------|-------|
| SDK kalite skoru | %62 | %90+ |
| Test coverage | ~%70 | %95+ |
| Error type sayısı | 3 | 10+ |
| İmza doğrulama | Yok | 11 dilde |
| Retry/Backoff | Yok | Otomatik |
| Pagination | Manuel | Otomatik |
| Config | Sabit | Override edilebilir |
| Debug logging | Yok | Feature flag |
| CI/CD | Manuel | Otomatik |

---

## ⚠️ Notlar

- Her SDK kendi repo'sunda, ortak CI/CD template kullanılacak
- **İmza doğrulama en kritik eksik** — webhook SDK'sının temel güvenlik özelliği
- Retry/backoff ikinci en kritik — güvenilir teslimat için şart
- Pagination üçüncü — kullanıcı deneyimini doğrudan etkiliyor
- Svix 93 iterasyon yapmış, biz 2 — acele etmeye gerek yok, kaliteli yapalım
- Her faz tamamlandığında `.ai-context/sdk-roadmap/STATUS.md` güncellenecek
- **Faz 1 bitmeden publish etme** — imza doğrulama olmadan SDK kullanılmaz
