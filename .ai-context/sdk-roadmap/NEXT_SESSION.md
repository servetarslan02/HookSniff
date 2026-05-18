# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-19 01:12 GMT+8

## ✅ Yapılan (Bu Oturum)

### Pagination Helper — TÜM 11 SDK
- Python: `pagination.py` + 17 test ✅
- Node.js: `pagination.ts` + `listAll()` + build ✅
- Go: `pagination.go` + `Paginator[T]` + `ListAll()`
- PHP: `Paginator.php` + generator
- Java: `Paginator.java` + Iterable
- Kotlin: `Paginator.kt` + Iterable
- Ruby: `paginator.rb` + Enumerable
- C#: `Paginator.cs` + IAsyncEnumerable
- Elixir: `paginator.ex` + Stream
- Rust: `pagination.rs` + async
- Swift: `Paginator.swift` + AsyncSequence

### SDK-QUALITY-GAPS.md Güncellendi
- İmza doğrulama #1 kritik eklendi
- Retry/backoff #2 kritik eklendi
- Öncelikler yeniden düzenlendi

## ❌ Sıradaki — Faz 1 Kritik (24-34 saat)

### 1. Webhook İmza Doğrulama (EN KRİTİK)
Her SDK'ya `verify(payload, headers, secret)` methodu ekle.
- HMAC-SHA256 imza doğrulama
- Timestamp kontrolü (replay attack önleme)
- 11 dilde implementasyon

### 2. Retry + Exponential Backoff
- 429 → Retry-After header'ını oku
- 500/502/503 → Exponential backoff (1s, 2s, 4s, 8s)
- Max 3 deneme (varsayılan)
- `maxRetries` config seçeneği

### 3. Error Class Çeşitliliği
Mevcut: 3 error type → Hedef: 10+
- BadRequestError (400)
- UnauthorizedError (401)
- ForbiddenError (403)
- NotFoundError (404)
- ConflictError (409)
- RateLimitError (429)
- InternalServerError (500)
- TimeoutError
- NetworkError
- ValidationError

## 📋 Önerilen Sıralama

```
Oturum 2: İmza doğrulama → Python + Node.js + Go (Web/Backend)
Oturum 3: İmza doğrulama → Java + Kotlin + C# (Enterprise)
Oturum 4: İmza doğrulama → Rust + Swift + Ruby + PHP + Elixir (kalan)
Oturum 5: Retry/backoff → Tüm SDK'lar
Oturum 6: Error types → Tüm SDK'lar
```

## 🔑 Hesap Bilgileri
- Admin: servetarslan02@gmail.com / Alayci_165
- Dashboard: https://hooksniff.vercel.app
- API: https://hooksniff-api-1046140057667.europe-west1.run.app
- Demo: demo@hooksniff.com / Demo1234!

## 📊 Genel Durum
- **11/11 SDK** registry'de yüklü ✅
- **11/11 SDK** pagination helper var ✅
- **Sıradaki:** İmza doğrulama → Retry → Error types
- **Hedef:** SDK kalite %62 → %90+
