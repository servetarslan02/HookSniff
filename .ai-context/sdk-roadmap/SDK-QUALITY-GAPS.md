# SDK Kalite Boşlukları — Svix Karşılaştırması

> Güncelleme: 2026-05-19 04:05 GMT+8
> Durum: Aktif geliştirme

---

## 📊 Genel Skor

```
Svix:      ████████████████████ 100%
HookSniff: ████████████████████░  97%
```

---

## ✅ TAMAMLANANLAR (1-11)

### 1. Webhook İmza Doğrulama ✅ (11/11)
- HMAC-SHA256, `whsec_` prefix, 5 dk tolerance
- `wh.verify(payload, headers)` → tüm dillerde

### 2. Retry + Exponential Backoff ✅ (11/11)
- 429 Retry-After + 5xx exponential backoff
- Default: 3 retry, 1s/2s/4s schedule
- `hooksniff-retry-count` header'ı

### 3. Pagination Helper ✅ (11/11)
- `Paginator` / `ListResponse` class'ı
- Iterator/cursor yönetimi otomatik

### 4. Error Class Çeşitliliği ✅ (11/11 — 21 type)
- BadRequest(400), Unauthorized(401), Forbidden(403), NotFound(404)
- RateLimit(429), InternalServer(500), ServiceUnavailable(503) + 14 diğer
- `ErrorFactory.create(statusCode, body, headers)`

### 5. Webhook Payload Parsing ✅ (11/11)
- `verify()` → `WebhookEvent` (event, data, timestamp)
- Backward compatible: `verifyRaw()` / `verify_raw()`
- Node.js: Generic type parameter `WebhookEventMap[T]`

### 6. Idempotency Key ✅ (11/11)
- Tüm SDK'larda `idempotencyKey` parametresi
- POST request'lerde otomatik `auto_{uuid}` üretilir
- Kullanıcı isterse kendi key'ini verebilir

### 7. Response Metadata Erişimi ✅ (11/11)
- `ResponseMetadata`: statusCode, requestId, rateLimitRemaining, headers
- Her API çağrısından sonra otomatik güncellenir

| SDK | Erişim |
|-----|--------|
| Node.js | `client.lastResponse` |
| Python | `client.endpoint.last_response` |
| Go | `client.LastResponse` |
| Rust | `ResponseMetadata::from_parts()` |
| Ruby | `HookSniff.last_response` |
| Java | `client.getLastResponse()` |
| Kotlin | `ResponseMetadata(...)` |
| PHP | `$lastResponse` |
| C# | `client.LastResponse` |
| Swift | `client.lastResponse` |
| Elixir | `client.last_response` |

### 8. Config Seçenekleri ✅ (11/11)
Tüm SDK'larda tam config desteği:

| SDK | serverUrl | timeout | debug | customHeaders |
|-----|-----------|---------|-------|---------------|
| Node.js | ✅ serverUrl | ✅ requestTimeout | ✅ | ✅ headers |
| Python | ✅ server_url | ✅ timeout | ✅ | ✅ headers |
| Go | ✅ BaseURL | ✅ HTTPClient.Timeout | ✅ Debug | ✅ DefaultHeaders |
| Rust | ✅ server_url | ✅ timeout | ✅ debug | ✅ headers |
| Ruby | ✅ server_url | ✅ timeout | ✅ debug | ✅ headers |
| Java | ✅ serverUrl | ✅ timeoutMs | ✅ debug | ✅ headers |
| Kotlin | ✅ baseUrl | ✅ timeoutMs | ✅ debug | ✅ headers |
| PHP | ✅ serverUrl | ✅ timeoutMs | ✅ debug | ✅ headers |
| C# | ✅ ServerUrl | ✅ TimeoutMilliseconds | ✅ Debug | ✅ Headers |
| Swift | ✅ baseURL | ✅ timeout | ✅ debug | ✅ headers |
| Elixir | ✅ server_url | ✅ timeout | ✅ debug | ✅ headers |

### 9. Debug Logging ✅ (11/11)
Her SDK'da `debug=true` ile:
- Request: `→ POST /v1/webhooks` (method + URL)
- Response: `← 200 (142ms)` (status + elapsed time)
- Retry: 429/5xx retry count + delay bilgisi

| SDK | Debug Log | Timing |
|-----|-----------|--------|
| Node.js | ✅ | ✅ |
| Python | ✅ | ✅ |
| Go | ✅ | ✅ |
| Rust | ✅ (config) | ✅ |
| Ruby | ✅ | ✅ |
| Java | ✅ | ✅ |
| Kotlin | ✅ | ✅ |
| PHP | ✅ | ✅ |
| C# | ✅ | ✅ |
| Swift | ✅ | ✅ |
| Elixir | ✅ | ✅ |

### 10. Typed Webhook Events ✅ (11/11 — 2026-05-19)
- Compile-time type güvenliği
- 8 typed data class + typed event subclass per SDK
- Node.js: `WebhookEventMap` + `WebhookEventHandler<T>`
- Python: `EndpointCreatedEventData` + `parse_webhook_event()`
- Go: `ParseEndpointCreatedData()` generic helper
- Rust: `TypedWebhookEvent` enum + `verify_and_parse_typed()`
- Ruby: `EndpointCreatedEvent` subclass + `WebhookEvent.parse()`
- Java/Kotlin: `EndpointCreatedData` + `parseData<T>()`
- PHP: `EndpointCreatedData` + `parseEndpointCreatedData()`
- C#: `EndpointCreatedData` + `ParseData<T>()`
- Elixir: `EndpointCreatedData` struct + `parse_endpoint_created_data()`
- Swift: `EndpointCreatedData` struct + `parseEndpointCreatedData()`

### 11. SDK Version Header ✅ (11/11 — 2026-05-19)
- `X-HookSniff-SDK: hooksniff-{dil}/{versiyon}` header'ı
- Tüm SDK'larda User-Agent ile birlikte otomatik gönderilir
- Her API çağrısında tracking için kullanılır

---

## ❌ KALAN EKSİKLER

### 12. Test Coverage Artırma ✅ (11/11 — 2026-05-19)
- Typed webhook event testleri tüm SDK'lara eklendi
- Node.js: 4 test (typed events + backward compat)
- Python: 14 test (8 event type + backward compat + edge cases)
- Go: 10 test (typed parsing + all events + version header)
- Rust: 7 test (typed parsing + backwards compat)
- Ruby: 8 test (typed events + backward compat + snake_case)
- Kotlin: 7 test (typed events + backward compat)
- PHP: 7 test (typed events + backward compat + empty data)
- C#: 4 test (typed parsing + backward compat)
- Elixir: 8 test (typed events + backward compat + snake_case)
- Swift: 7 test (typed events + backward compat + all types)

### 13. CI/CD Otomatik Publish ❌
- Tag push'ta otomatik publish
- Tahmini: 3-4 saat | 🟡 Orta

### 14-17. Düşük öncelik
- 14. JSDoc / Docstring (8-12 saat)
- 15. Streaming / SSE (8-12 saat)
- 16. Rate Limit Header Parsing (2-3 saat)
- 17. Custom HTTP Client (4-6 saat)

---

## 📋 Uygulama Sırası

```
✅ #1-12 tamamlandı
        ↓
CI/CD (#13)             ← sıradaki
```

**Kalan toplam:** ~16-24 saat → %100
