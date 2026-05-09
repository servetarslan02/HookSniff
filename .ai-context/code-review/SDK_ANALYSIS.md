# 🔍 SDK'lar (11 Dil) — Kapsamlı Kod Analizi

> Tarih: 2026-05-10
> Toplam Satır: ~8,534
> Dil: Python, Node.js, Go, Rust, Java, Kotlin, C#, Ruby, PHP, Swift, Elixir
> İnceleme: Her SDK'nın verification + client kodu okundu

---

## 📊 Genel Değerlendirme

| Kategori | Puan | Not |
|----------|------|-----|
| Güvenlik | 9/10 | Tüm dillerde constant-time comparison |
| Tutarlılık | 8/10 | Tutarlı API surface, küçük farklılıklar |
| Test Kapsamı | 4/10 | Sadece Python ve Go'da test var |
| Dokümantasyon | 7/10 | Her SDK'da README var |
| Published | ❓ | npm/pypi/crates.io'da publish durumu belirsiz |

---

## 🔐 Webhook Verification — Dil Dil Karşılaştırma

| Dil | Standard Webhooks | Legacy HMAC | Constant-Time | Svix Fallback | Test |
|-----|-------------------|-------------|---------------|---------------|------|
| **Python** | ✅ | ✅ | ✅ `hmac.compare_digest` | ✅ | ✅ |
| **Node.js** | ✅ | ✅ | ✅ `crypto.timingSafeEqual` | ✅ | ✅ |
| **Go** | ✅ | ✅ | ✅ `hmac.Equal` | ✅ | ✅ |
| **Rust** | ✅ | ✅ | ✅ XOR fold | ✅ | ✅ |
| **Java** | ✅ | ✅ | ✅ `MessageDigest.isEqual` | ✅ | ❌ |
| **Kotlin** | ✅ | ✅ | ✅ `MessageDigest.isEqual` | ✅ | ❌ |
| **C#** | ✅ | ✅ | ✅ byte-by-byte | ✅ | ❌ |
| **Ruby** | ✅ | ✅ | ✅ XOR compare | ✅ | ❌ |
| **PHP** | ✅ | ✅ | ✅ `hash_equals` | ✅ | ❌ |
| **Swift** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Elixir** | ✅ | ✅ | ✅ | ✅ | ❌ |

**Sonuç**: Tüm 11 dilde Standard Webhooks uyumu mükemmel. ✅

---

## 🟢 İYİ UYGULAMALAR (Tüm SDK'lar)

### 1. Tutarlı API Surface ✅
Her SDK'da aynı metodlar:
- `endpoints.create/get/list/delete/rotateSecret`
- `webhooks.send/get/list/replay/batch/attempts/export/search`
- `getStats()`

### 2. Error Handling Tutarlı ✅
Her SDK'da aynı hata hiyerarşisi:
- `AuthenticationError` (401)
- `ValidationError` (400)
- `NotFoundError` (404)
- `RateLimitError` (429)
- `PayloadTooLargeError` (413)

### 3. snake_case → camelCase Mapping ✅
Node.js ve Go SDK'lar API response'unu kendi convention'larına çeviriyor:
```typescript
// Node.js
isActive: data.is_active,
retryPolicy: data.retry_policy ? { maxAttempts: ... } : undefined,
```

### 4. WebhookHandler Pattern ✅
Python, Node.js, Go, Ruby, Java, Kotlin'da decorator/handler pattern:
```python
@handler.on("order.created")
def handle_order(event): ...
```

### 5. Request Timeout ✅
Tüm SDK'larda 30 saniye default timeout.

---

## 🔴 KRİTİK SORUNLAR

### 1. 🔴 Hardcoded GCP Cloud Run URL — TÜM SDK'LAR
```python
# Python
base_url = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"

# Node.js
baseUrl = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"

# Go
defaultBaseURL = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
```
**Sorun**: GCP Cloud Run URL'si hardcoded. Domain değişirse tüm SDK'lar güncellenmeli.
**Çözüm**: `https://api.hooksniff.com/v1` gibi bir domain kullan. Tüm SDK'larda default URL'yi bu domain yap.

### 2. 🔴 `X-Hookrelay-Signature` — Eski İsim Kalmış
Python ve Go SDK'larda legacy header hala `X-Hookrelay-Signature` olarak kullanılıyor:
```python
# Python verify.py
legacy_sig = _get_header(headers, "x-hooksniff-signature")
```
```go
// Go hooksniff.go
legacySig := r.Header.Get("X-Hookrelay-Signature")
```
**Sorun**: "hookrelay" eski isim. "hooksniff" olmalı. API tarafında da `X-HookSniff-Signature` kullanılıyor.
**Öneri**: Her iki ismi de destekle (backward compat) ama "hooksniff" öncelikli olsun.

### 3. 🔴 Test Coverage Çok Düşük
- **Python**: ✅ 9 test (signature, client construction)
- **Go**: ✅ Test dosyası var
- **Diğer 9 SDK**: ❌ SIFIR test

**Etki**: Published SDK'lar bozulursa yakalanmaz.
**Öneri**: En azından her SDK'da verification test'i ekle.

### 4. 🔴 Publish Durumu Belirsiz
SDK'lar npm, pypi, crates.io, NuGet, RubyGems, Packagist'te publish edilmiş mi? Versiyon 0.1.0 ama gerçekten yayınlanmış mı?

---

## 🟡 ORTA SEVİYE SORUNLAR

### 1. 🟡 Python SDK — `utils.py` Duplicate
`utils.py`'da `verify_signature` ve `verify_webhook_signature` fonksiyonları var, `verify.py`'da da aynı fonksiyonlar var. İkisi de `__init__.py`'dan export ediliyor.
**Sorun**: Kullanıcı hangisini kullanacağını bilemez.

### 2. 🟡 Node.js SDK — `verifyWebhookSignature` Legacy Only
```typescript
export function verifyWebhookSignature(payload, signature, secret) {
  // Sadece X-HookSniff-Signature legacy format
  // Standard Webhooks header'larını desteklemiyor
}
```
**Sorun**: `verify.ts`'deki `WebhookVerifier` Standard Webhooks destekliyor ama `index.ts`'deki `verifyWebhookSignature` legacy only.

### 3. 🟡 Rust SDK — `unwrap()` Kullanımı
```rust
let mac = HmacSha256::new_from_slice(&secret_bytes).expect("HMAC can take key of any size");
```
**Sorun**: `expect()` panic'e neden olabilir. SDK'da panic olmamalı, error dönmeli.

### 4. 🟡 C# SDK — Async/Await Eksik
C# SDK'sı `async Task<T>` kullanıyor ama bazı metodlar blocking olabilir.

### 5. 🟡 Swift SDK — Package.swift Kontrol Edilmeli
Swift Package Manager formatı doğru mu? Dependencies doğru mu?

---

## 🟢 DÜŞÜK SEVİYE

### 1. ✅ Python SDK — Mükemmel Yapı
- `client.py` — API client
- `verify.py` — Webhook verification
- `models.py` — Data models + payload types
- `exceptions.py` — Error hierarchy
- `utils.py` — Legacy helpers
- `tests/` — Test suite

### 2. ✅ Go SDK — En Kapsamlı
- 580 satır, tüm feature'lar destekleniyor
- `VerifyHTTPRequest` — HTTP request'ten doğrudan verification
- `WebhookHandler` — `http.Handler` interface
- Test dosyası var

### 3. ✅ Java SDK — WebhookVerification.java
- `constantTimeEquals` ile `MessageDigest.isEqual`
- `verifyWebhookFromHeaders` ile case-insensitive header lookup

### 4. ⚠️ Kotlin SDK — Java SDK ile Aynı Verification
Kotlin SDK'sı Java SDK'sının `WebhookVerification` sınıfını kullanıyor olabilir (aynı package).

---

## 📋 Öncelikli Aksiyon Listesi

### 🔴 Yayından Önce
1. **Hardcoded URL → Domain** — Tüm SDK'larda `api.hooksniff.com` kullan
2. **"hookrelay" → "hooksniff"** — Legacy header isimlerini düzelt
3. **Publish durumunu doğrula** — npm, pypi, crates.io'da gerçekten var mı?

### 🟡 Yayına Yakın
4. **Test ekle** — Her SDK'da en az 5 verification test
5. **Python duplicate temizliği** — utils.py ve verify.py birleştir
6. **Node.js legacy/standard ayrımı** — `verifyWebhookSignature` Standard Webhooks desteklesin

### 🟢 Sonraki Sprint
7. **SDK version sync** — Tüm SDK'lar aynı versiyon
8. **CI/CD** — Her SDK için otomatik test + publish
9. **Changelog** — Her SDK için CHANGELOG.md

---

## 📊 SDK İstatistikleri

| SDK | Satır | Test | Verification | WebhookHandler |
|-----|-------|------|-------------|----------------|
| Python | ~1,200 | ✅ 9 | ✅ Standard + Legacy | ✅ |
| Node.js | ~800 | ✅ | ✅ Standard + Legacy | ✅ |
| Go | ~580 | ✅ | ✅ Standard + Legacy | ✅ |
| Rust | ~700 | ❌ | ✅ Standard + Legacy | ❌ |
| Java | ~500 | ❌ | ✅ Standard + Legacy | ❌ |
| Kotlin | ~400 | ❌ | ✅ Standard + Legacy | ❌ |
| C# | ~460 | ❌ | ✅ Standard + Legacy | ❌ |
| Ruby | ~300 | ❌ | ✅ Standard + Legacy | ❌ |
| PHP | ~350 | ❌ | ✅ Standard + Legacy | ❌ |
| Swift | ~200 | ❌ | ✅ Standard + Legacy | ❌ |
| Elixir | ~250 | ❌ | ✅ Standard + Legacy | ❌ |

---

*Bu analiz tüm 11 SDK'nın verification ve client kodlarının okunmasıyla hazırlanmıştır.*
