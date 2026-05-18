# SDK Kalite Boşlukları — Svix Karşılaştırması

> Oluşturma: 2026-05-19 00:22 GMT+8
> Güncelleme: 2026-05-19 02:24 GMT+8 — **TÜM GÜNCELLEMELER DAHİL**
> Durum: Aktif geliştirme
> Amaç: HookSniff SDK'larını Svix seviyesine çıkarmak için gereken tüm eksikler

---

## 📊 Genel Skor

```
Svix:      ████████████████████ 100%
HookSniff: █████████████████░░░  85%
```

**Hedef: %90+ (10-20 saat kaldı)**

---

## ✅ TAMAMLANANLAR

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

**Desteklenen:**
- `whsec_` prefix (Standard Webhooks uyumlu)
- `hooksniff-id`, `hooksniff-timestamp`, `hooksniff-signature` header'ları
- Unbranded (`webhook-id`, `webhook-signature`, `webhook-timestamp`)
- Replay attack önleme (5 dakika tolerance)
- `sign()` methodu (Node.js, Python, Go, Ruby, Elixir, Swift)

---

### 2. Retry + Exponential Backoff ✅

**Durum: TÜM 11 SDK'DA MEVCUT**

| SDK | 429 Retry-After | 5xx Backoff | Timeout Retry | Default |
|-----|-----------------|-------------|---------------|---------|
| Node.js | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| Python | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| Go | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| Rust | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| Ruby | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| Java | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| Kotlin | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| C# | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| PHP | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| Elixir | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |
| Swift | ✅ | ✅ 1s/2s/4s | ✅ | 3 retries |

**Tüm SDK'larda:**
- `retrySchedule` / `numRetries` config seçeneği (varsayılan: 3 deneme)
- 429'da `Retry-After` header'ı okunuyor
- 5xx'de exponential backoff (1s, 2s, 4s)
- Timeout durumunda retry
- `hooksniff-retry-count` header'ı ekleniyor

**2026-05-19 düzeltmeleri:**
- Rust: 429 retry eklendi (headers ile)
- Elixir: 429 retry eklendi (Retry-After)
- Ruby: timeout retry eklendi
- Java: timeout retry eklendi
- Kotlin: timeout retry eklendi + retry logic yeniden yazıldı
- Tüm SDK'lar: default retry schedule 1s, 2s, 4s (eskiden 50ms/100ms/200ms)
- Tüm SDK'lar: max retries 3 (eskiden 2 idi)

---

### 3. Pagination Helper ✅

**Durum: TÜM 11 SDK'DA MEVCUT**

| SDK | Implementation |
|-----|---------------|
| Node.js | `listAll()` methodu + `createPaginator()` helper |
| Python | `ListResponse` + `for msg in response:` auto-paginate |
| Go | Generic `Paginator[T]` + `ListAll()` methodu |
| Rust | `Paginator<T>` struct with async collect |
| Ruby | `Paginator` Enumerable class |
| Java | `Paginator<T>` Iterable class |
| Kotlin | `Paginator<T>` Iterable class |
| C# | `Paginator<T>` IAsyncEnumerable |
| PHP | `Paginator::paginate()` generator |
| Elixir | `Paginator.paginate()` Stream |
| Swift | `Paginator<T>` AsyncSequence |

---

### 4. Error Class Çeşitliliği ✅

**Durum: TÜM 11 SDK'DA 21 ERROR TYPE**

| # | Error Type | HTTP Kod | Açıklama |
|---|-----------|----------|----------|
| 1 | `BadRequestError` | 400 | Hatalı istek |
| 2 | `UnauthorizedError` | 401 | Geçersiz auth |
| 3 | `AuthenticationError` | 401 | Token geçersiz/süresi dolmuş |
| 4 | `ForbiddenError` | 403 | Yetki yetersiz |
| 5 | `NotFoundError` | 404 | Kaynak bulunamadı |
| 6 | `RequestTimeoutError` | 408 | Sunucu zaman aşımı |
| 7 | `ConflictError` | 409 | Çakışma |
| 8 | `GoneError` | 410 | Kaynak kalıcı olarak silinmiş |
| 9 | `PayloadTooLargeError` | 413 | Body limit aşıldı |
| 10 | `UnprocessableEntityError` | 422 | Validasyon hatası |
| 11 | `RateLimitError` | 429 | Rate limit aşıldı (retryAfter ile) |
| 12 | `InternalServerError` | 500 | Sunucu hatası |
| 13 | `NotImplementedError` | 501 | Desteklenmeyen method |
| 14 | `BadGatewayError` | 502 | Geçersiz gateway |
| 15 | `ServiceUnavailableError` | 503 | Servis kullanılamıyor |
| 16 | `GatewayTimeoutError` | 504 | Gateway zaman aşımı |
| 17 | `InsufficientStorageError` | 507 | Depolama dolu |
| 18 | `LoopDetectedError` | 508 | Sonsuz döngü tespit edildi |
| 19 | `TimeoutError` | - | Request timeout (non-HTTP) |
| 20 | `NetworkError` | - | Bağlantı hatası (non-HTTP) |
| 21 | `HookSniffError` (base) | - | Temel error class |

**Her SDK'da ayrıca:**
- `ErrorFactory.create(statusCode, body, headers)` — factory method
- `ValidationErrorItem` struct (422 responses için)

**2026-05-19 eklemeleri:**
- 6 SDK'ya 12 type eklendi (Rust, Java, Kotlin, C#, Elixir, Swift)
- 11 SDK'ya +9 yeni type eklendi (408, 410, 413, 501, 507, 508, Timeout, Network, Authentication)
- Toplam: 12 → 21 type

---

## ❌ KALAN EKSİKLER

### 5. Config Seçenekleri ❌

**Svix:** `Svix(token, SvixOptions{serverUrl, debug, timeout})`
**HookSniff:** Node.js'de var, diğerlerinde eksik.

| SDK | baseUrl | timeout | debug | custom headers |
|-----|---------|---------|-------|----------------|
| Node.js | ✅ | ✅ | ✅ | ✅ |
| Python | 🔶 | 🔶 | ❌ | ❌ |
| Go | 🔶 | 🔶 | ❌ | ❌ |
| Rust | 🔶 | 🔶 | ❌ | ❌ |
| Ruby | 🔶 | 🔶 | ❌ | ❌ |
| Java | 🔶 | 🔶 | ❌ | ❌ |
| Kotlin | 🔶 | 🔶 | ❌ | ❌ |
| C# | 🔶 | 🔶 | ❌ | ❌ |
| PHP | 🔶 | 🔶 | ❌ | ❌ |
| Elixir | 🔶 | 🔶 | ❌ | ❌ |
| Swift | 🔶 | 🔶 | ❌ | ❌ |

**Yapılacaklar:**
- [ ] Tüm diller: `baseUrl` override (self-hosted için)
- [ ] Tüm diller: `timeout` ayarı (ms)
- [ ] Tüm diller: Custom header ekleme
- [ ] Tüm diller: `debug` flag

**Tahmini Süre:** 3-4 saat
**Öncelik:** 🟡 Orta

---

### 6. CI/CD Otomatik Publish ❌

**Svix:** GitHub Actions ile tag push'ta otomatik publish.
**HookSniff:** Manuel publish (`publish-sdks.sh` script).

**Yapılacaklar:**
- [ ] Her SDK için `.github/workflows/publish.yml`
- [ ] Tag push'ta otomatik publish (v*)
- [ ] Ortak workflow template

**Tahmini Süre:** 3-4 saat
**Öncelik:** 🟡 Orta

---

### 7. Debug Logging ❌

**Svix:** `debug: true` ile tüm HTTP isteklerini loglar.
**HookSniff:** Sadece Node.js'de var.

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
- [ ] Event type interface/struct/record
- [ ] `endpoint.created`, `endpoint.updated`, `endpoint.deleted`, `endpoint.disabled`, `endpoint.enabled`, `message.attempt.exhausted`, `message.attempt.failing`, `message.attempt.recovered`, `background_task.finished`

**Tahmini Süre:** 4-6 saat
**Öncelik:** 🟡 Orta

---

### 9. Test Coverage Artırma ❌

**Svix:** %95+ coverage.
**HookSniff:** ~%70 coverage.

| SDK | Test | Coverage |
|-----|------|----------|
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

**Tahmini Süre:** 12-16 saat
**Öncelik:** 🟡 Orta

---

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

## 📋 Uygulama Sırası

### Faz 1 — Kritik ✅ TAMAMLANDI
1. ✅ Webhook imza doğrulama (11/11 SDK)
2. ✅ Retry + exponential backoff (11/11 SDK — 1s/2s/4s, 3 retry, timeout)
3. ✅ Pagination helper (11/11 SDK)
4. ✅ Error class çeşitliliği (11/11 SDK — 21 type)

### Faz 2 — Orta (20-28 saat)
5. ❌ Config seçenekleri
6. ❌ CI/CD otomatik publish
7. ❌ Debug logging
8. ❌ Typed webhook events
9. ❌ Test coverage artırma

### Faz 3 — Düşük (22-33 saat)
10. ❌ JSDoc/docstring
11. ❌ Streaming/SSE desteği
12. ❌ Rate limit header parsing
13. ❌ Custom HTTP client desteği

**Kalan toplam:** ~25-35 saat → %90+

---

## 📊 Dil Bazlı Durum

| # | Eksik | Rust | Node | Python | Go | Java | Kotlin | Ruby | C# | PHP | Swift | Elixir |
|---|-------|------|------|--------|-----|------|--------|------|-----|-----|-------|--------|
| 1 | İmza doğrulama | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 2 | Retry/Backoff | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 3 | Pagination | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4 | Error types (21) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
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

## 🎯 Başarı Kriterleri

| Kriter | Gerçek | Hedef |
|--------|--------|-------|
| SDK kalite skoru | **%85** | %90+ |
| Test coverage | ~%70 | %95+ |
| Error type sayısı | **21 (11/11)** | 20+ |
| İmza doğrulama | **✅ 11/11** | 11 dilde |
| Retry/Backoff | **✅ 11/11** | Otomatik |
| Pagination | **✅ 11/11** | Otomatik |
| Config | 🔶 Node.js'de var | Override edilebilir |
| Debug logging | 🔶 Node.js'de var | Feature flag |
| CI/CD | ❌ Manuel | Otomatik |

---

## ⚠️ Notlar

- **2026-05-19 oturumu:** 2 saat içinde Faz 1 + Error Types tamamlandı
- Java SDK'da 429 retry bug'ı düzeltildi
- Default retry schedule 50ms → 1s/2s/4s olarak güncellendi
- Max retries 2 → 3 olarak güncellendi
- 6 SDK'ya error hierarchy eklendi, 11 SDK'ya 21 type'a çıkarıldı
- Her SDK kendi repo'sunda (`hooksniff-{dil}`)
- **Sıradaki:** Config options veya CI/CD
