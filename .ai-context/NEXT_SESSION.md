# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-19 02:48 GMT+8

## 🎯 Sıradaki: #7 — Response Metadata Erişimi

### Ne Yapılacak?
Tüm 11 SDK'da response header'larına erişim ekle:
- `x-request-id` — debug için
- `x-ratelimit-remaining` — rate limit takibi
- `statusCode` — HTTP status code

### Örnek Kullanım:
```go
// Go
resp, err := client.Endpoint.List(ctx, nil)
fmt.Println(resp.Headers.Get("x-request-id"))
fmt.Println(resp.Headers.Get("x-ratelimit-remaining"))
```

### Tahmini Süre: 2-3 saat

---

## 📊 SDK Kalite Skoru: %89

| # | Feature | Durum |
|---|---------|-------|
| 1-4 | Faz 1 (Kritik) | ✅ |
| 5 | Payload Parsing | ✅ |
| 6 | Idempotency Key | ✅ (zaten varmış) |
| 7 | Response Metadata | ❌ Sıradaki |
| 8 | Config | ❌ |
| 9 | Debug Logging | ❌ |
| 10 | Typed Events | ❌ |
| 11 | SDK Version Header | ❌ |
| 12 | Test Coverage | ❌ |
| 13 | CI/CD | ❌ |

---

## ⚠️ Bilinen Sorunlar

1. Kotlin SDK build sorunu (package çakışması)
2. Test coverage düşük (%60-70)
