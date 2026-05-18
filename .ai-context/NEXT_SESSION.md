# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-19 03:55 GMT+8

## 🎯 Sıradaki: #11 — SDK Version Header

### Ne Yapılacak?
Tüm SDK'lara `X-HookSniff-SDK: hooksniff-{dil}/{versiyon}` header'ı ekle.
Her API çağrısında otomatik gönderilecek.

### Tahmini Süre: 1 saat

---

## 📊 SDK Kalite Skoru: %95

| # | Feature | Durum |
|---|---------|-------|
| 1-10 | Faz 1-4 | ✅ |
| 11 | SDK Version Header | ❌ Sıradaki |
| 12 | Test Coverage | ❌ |
| 13 | CI/CD Otomatik Publish | ❌ |
| 14-17 | Düşük öncelik | ❌ |

## Son Yapılan İş (2026-05-19)
- ✅ Typed Webhook Events — 11/11 SDK tamamlandı
- Python: dataclass + typed event subclass
- Go: generic parseEventData[T] helper
- Rust: TypedWebhookEvent enum + serde
- Ruby: typed data class + subclass
- Java: Jackson annotated data classes
- Kotlin: extension functions
- PHP: WebhookEvents namespace
- C#: JsonPropertyName annotated classes
- Elixir: struct + parse_*_data() functions
- Swift: struct + parse*Data() methods
