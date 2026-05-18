# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-19 02:56 GMT+8

## 🎯 Sıradaki: #8 — Config Seçenekleri

### Ne Yapılacak?
Tüm SDK'larda `baseUrl`, `timeout`, `debug`, `customHeaders` config options:
- Sadece Node.js'de tam, diğerlerinde kısmen var
- Self-hosted kullanıcılar için kritik

### Tahmini Süre: 3-4 saat

---

## 📊 SDK Kalite Skoru: %90 🎉

| # | Feature | Durum |
|---|---------|-------|
| 1-4 | Faz 1 (Kritik) | ✅ |
| 5 | Payload Parsing | ✅ |
| 6 | Idempotency Key | ✅ |
| 7 | Response Metadata | ✅ |
| 8 | Config | ❌ Sıradaki |
| 9 | Debug Logging | ❌ |
| 10 | Typed Events | ❌ |
| 11 | SDK Version Header | ❌ |

---

## 🎉 %90 Hedefine Ulaşıldı!

Svix'e göre %90 kalite skoruna ulaştık. Kalan işler:
- Config + Debug Logging + Typed Events → %93-95
- Test Coverage + CI/CD → %98-100
