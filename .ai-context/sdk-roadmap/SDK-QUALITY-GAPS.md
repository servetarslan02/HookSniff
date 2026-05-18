# SDK Kalite Boşlukları — Svix Karşılaştırması

> Oluşturma: 2026-05-19 00:22 GMT+8
> Güncelleme: 2026-05-19 02:28 GMT+8 — **Yeni features eklendi**
> Durum: Aktif geliştirme
> Amaç: HookSniff SDK'larını Svix seviyesine çıkarmak için gereken tüm eksikler

---

## 📊 Genel Skor

```
Svix:      ████████████████████ 100%
HookSniff: █████████████████░░░  85%
```

**Hedef: %90+ (15-25 saat kaldı)**

---

## ✅ TAMAMLANANLAR (1-4)

### 1. Webhook İmza Doğrulama ✅

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

- `whsec_` prefix (Standard Webhooks uyumlu)
- Replay attack önleme (5 dakika tolerance)
- `sign()` methodu (Node.js, Python, Go, Ruby, Elixir, Swift)

---

### 2. Retry + Exponential Backoff ✅

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

- `retrySchedule` / `numRetries` config seçeneği
- `hooksniff-retry-count` header'ı ekleniyor

---

### 3. Pagination Helper ✅

Her SDK'da `Paginator` / `ListResponse` class'ı var, iterator/cursor yönetimi otomatik.

---

### 4. Error Class Çeşitliliği ✅ (21 type)

| # | Error Type | Kod | Açıklama |
|---|-----------|-----|----------|
| 1 | `BadRequestError` | 400 | Hatalı istek |
| 2 | `UnauthorizedError` | 401 | Geçersiz auth |
| 3 | `AuthenticationError` | 401 | Token geçersiz/süresi dolmuş |
| 4 | `ForbiddenError` | 403 | Yetki yetersiz |
| 5 | `NotFoundError` | 404 | Kaynak bulunamadı |
| 6 | `RequestTimeoutError` | 408 | Sunucu zaman aşımı |
| 7 | `ConflictError` | 409 | Çakışma |
| 8 | `GoneError` | 410 | Kaynak kalıcı silinmiş |
| 9 | `PayloadTooLargeError` | 413 | Body limit aşıldı |
| 10 | `UnprocessableEntityError` | 422 | Validasyon hatası |
| 11 | `RateLimitError` | 429 | Rate limit (retryAfter ile) |
| 12 | `InternalServerError` | 500 | Sunucu hatası |
| 13 | `NotImplementedError` | 501 | Desteklenmeyen method |
| 14 | `BadGatewayError` | 502 | Geçersiz gateway |
| 15 | `ServiceUnavailableError` | 503 | Servis kullanılamıyor |
| 16 | `GatewayTimeoutError` | 504 | Gateway zaman aşımı |
| 17 | `InsufficientStorageError` | 507 | Depolama dolu |
| 18 | `LoopDetectedError` | 508 | Sonsuz döngü |
| 19 | `TimeoutError` | - | Request timeout (non-HTTP) |
| 20 | `NetworkError` | - | Bağlantı hatası (non-HTTP) |
| 21 | `HookSniffError` (base) | - | Temel error class |

Her SDK'da: `ErrorFactory.create(statusCode, body, headers)` + `ValidationErrorItem`

---

## ❌ KALAN EKSİKLER

### 5. Config Seçenekleri ❌

**Svix:** `Svix(token, SvixOptions{serverUrl, debug, timeout})`

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

**Tahmini Süre:** 3-4 saat
**Öncelik:** 🟡 Orta

---

### 6. CI/CD Otomatik Publish ❌

- [ ] Her SDK için `.github/workflows/publish.yml`
- [ ] Tag push'ta otomatik publish (v*)
- [ ] Ortak workflow template

**Tahmini Süre:** 3-4 saat
**Öncelik:** 🟡 Orta

---

### 7. Debug Logging ❌

| SDK | Debug |
|-----|-------|
| Node.js | ✅ `console.log` |
| Diğer 10 | ❌ |

**Tahmini Süre:** 4-6 saat
**Öncelik:** 🟡 Orta

---

### 8. Typed Webhook Events ❌

- [ ] Event type interface/struct/record
- [ ] `endpoint.created`, `endpoint.updated`, `endpoint.deleted`, `endpoint.disabled`, `endpoint.enabled`, `message.attempt.exhausted`, `message.attempt.failing`, `message.attempt.recovered`, `background_task.finished`

**Tahmini Süre:** 4-6 saat
**Öncelik:** 🟡 Orta

---

### 9. Test Coverage Artırma ❌

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

### 10. Webhook Payload Parsing ❌

**Svix:** `verify()` sonrası type-safe event objesi döndürüyor.
**HookSniff:** `verify()` sadece `Any` / raw JSON döndürüyor.

**Yapılacaklar:**
- [ ] Tüm diller: `verify()` → `WebhookEvent` struct/record döndürsün
- [ ] `WebhookEvent.type` → event type string
- [ ] `WebhookEvent.data` → parsed payload (type-safe)
- [ ] `WebhookEvent.timestamp` → DateTime
- [ ] `WebhookEvent.payload` → raw JSON string

**Örnek (Python):**
```python
event = wh.verify(body, headers)
print(event.type)       # "endpoint.created"
print(event.data.id)    # "ep_123"
print(event.timestamp)  # datetime(2026, 5, 19, 2, 0, 0)
```

**Tahmini Süre:** 3-4 saat (tüm diller)
**Öncelik:** 🔴 Yüksek

---

### 11. Idempotency Key Kontrolü ❌

**Svix:** Kullanıcı kendi key'ini verebilir.
**HookSniff:** Otomatik `auto_xxx` üretiliyor, kullanıcı override edemiyor.

**Yapılacaklar:**
- [ ] Tüm diller: `idempotencyKey` parametresi (opsiyonel)
- [ ] Verilirse kullanıcı key'ini kullan, verilmezse auto üret

**Örnek (Node.js):**
```typescript
// Otomatik
await client.message.create({ eventType: "order.created", payload: {...} });
// Manuel
await client.message.create({ eventType: "order.created", payload: {...} }, { idempotencyKey: "order_123" });
```

**Tahmini Süre:** 1-2 saat (tüm diller)
**Öncelik:** 🔴 Yüksek

---

### 12. Response Metadata Erişimi ❌

**Svix:** Response header'ları erişilebilir.
**HookSniff:** Sadece body dönüyor, header'lar kayıp.

**Yapılacaklar:**
- [ ] Tüm diller: Response objesinde `headers`, `statusCode`, `requestId` erişimi
- [ ] `x-request-id` header'ı debug için
- [ ] `x-ratelimit-remaining` header'ı rate limit takibi için

**Örnek (Go):**
```go
resp, err := client.Endpoint.List(ctx, nil)
fmt.Println(resp.Headers.Get("x-request-id"))
fmt.Println(resp.Headers.Get("x-ratelimit-remaining"))
```

**Tahmini Süre:** 2-3 saat (tüm diller)
**Öncelik:** 🟡 Orta

---

### 13. JSDoc / Docstring ❌

**Tahmini Süre:** 8-12 saat
**Öncelik:** 🟢 Düşük

### 14. Streaming / SSE Desteği ❌

**Tahmini Süre:** 8-12 saat
**Öncelik:** 🟢 Düşük

### 15. Rate Limit Header Parsing ❌

**Tahmini Süre:** 2-3 saat
**Öncelik:** 🟢 Düşük

### 16. Custom HTTP Client Desteği ❌

**Tahmini Süre:** 4-6 saat
**Öncelik:** 🟢 Düşük

### 17. SDK Version Header ❌

**Yapılacaklar:**
- [ ] Tüm diller: `X-HookSniff-SDK: hooksniff-{dil}/{versiyon}` header'ı ekle

**Tahmini Süre:** 1 saat
**Öncelik:** 🟢 Düşük

---

## 📋 Uygulama Sırası

### Faz 1 — Kritik ✅ TAMAMLANDI (4/4)
1. ✅ Webhook imza doğrulama (11/11 SDK)
2. ✅ Retry + exponential backoff (11/11 SDK)
3. ✅ Pagination helper (11/11 SDK)
4. ✅ Error class çeşitliliği (11/11 SDK — 21 type)

### Faz 2 — Temel Features (sırasıyla)
5. ❌ Webhook Payload Parsing — 🔴 EN YÜKSEK (verify sonrası type-safe dönüş)
6. ❌ Idempotency Key Kontrolü — 🔴 YÜKSEK (retry güvenliği için şart)
7. ❌ Response Metadata Erişimi — 🟡 ORTA (debug için gerekli)
8. ❌ Config Seçenekleri — 🟡 ORTA (self-hosted için(baseUrl, timeout, debug))

### Faz 3 — Altyapı (sırasıyla)
9. ❌ Debug Logging — 🟡 ORTA (config'e bağlı → #8'den sonra)
10. ❌ Typed Webhook Events — 🟡 ORTA (type-safe geliştirme)
11. ❌ SDK Version Header — 🟢 DÜŞÜK ama basit (1 saat, hemen yapılabilir)

### Faz 4 — Kalite & Dağıtım
12. ❌ Test Coverage Artırma — 🟡 ORTA (features stabilize olunca)
13. ❌ CI/CD Otomatik Publish — 🟡 ORTA (test coverage'dan sonra)
14. ❌ JSDoc / Docstring — 🟢 DÜŞÜK

### Faz 5 — İleri Features
15. ❌ Streaming / SSE Desteği — 🟢 DÜŞÜK
16. ❌ Rate Limit Header Parsing — 🟢 DÜŞÜK
17. ❌ Custom HTTP Client Desteği — 🟢 DÜŞÜK

---

### Neden Bu Sıra?

```
Payload Parsing (#5)  ← verify() sonrası type-safe dönüş, en çok kullanılan özellik
        ↓
Idempotency (#6)     ← retry ile birlikte güvenli yeniden deneme
        ↓
Response Metadata (#7) ← debug ve rate limit takibi için
        ↓
Config (#8)           ← self-hosted ve timeout ayarı
        ↓
Debug Logging (#9)    ← config'e bağlı (debug flag gerekli)
        ↓
Typed Events (#10)    ← compile-time güvenlik
        ↓
Test (#12)            ← stabilize features test et
        ↓
CI/CD (#13)           ← test → publish pipeline
```

**Kalan toplam:** ~30-45 saat → %90+

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
| 10 | Payload parsing | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 11 | Idempotency ctrl | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 12 | Response metadata | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 13 | JSDoc | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 14 | Streaming | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 15 | Rate limit | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 16 | Custom client | ❌ | ✅ | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 |
| 17 | SDK version hdr | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

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
| Payload parsing | ❌ | Type-safe |
| Idempotency ctrl | ❌ | Manuel override |
| Config | 🔶 Node.js'de var | Override edilebilir |
| Debug logging | 🔶 Node.js'de var | Feature flag |
| CI/CD | ❌ Manuel | Otomatik |

---

## ⚠️ Notlar

- **2026-05-19 oturumu:** 2 saat içinde Faz 1 tamamlandı
- Java SDK'da 429 retry bug'ı düzeltildi
- Default retry schedule 50ms → 1s/2s/4s olarak güncellendi
- Max retries 2 → 3 olarak güncellendi
- 6 SDK'ya error hierarchy eklendi, 11 SDK'ya 21 type'a çıkarıldı
- Her SDK kendi repo'sunda (`hooksniff-{dil}`)
- **Sıradaki:** Payload Parsing + Idempotency Key
