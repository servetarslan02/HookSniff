# SDK MEMORY.md — SDK Çalışma Hafızası

> Son güncelleme: 2026-05-15 07:50 GMT+8

## Genel Durum
- **11 SDK** yayınlandı (Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift)
- **Referans rakip:** Svix (218 model, tüm dillerde wrapper + test)
- **Hedef:** Tüm SDK'ları Svix ile eşit veya daha iyi seviyeye çıkarmak

## Tamamlanan İşler

### Aşama 1 — OpenAPI Spec ✅
- Model sayısı: 148 schema, tüm SDK'larda mevcut
- Aşama 1.4 kalite kontrol: ✅ 11/11 SDK doğrulandı

### Aşama 2 — Wrapper + İmza (3/11 tamamlandı)
| Dil | Wrapper | İmza | Test | Durum |
|-----|---------|------|------|-------|
| Node.js | ✅ | ✅ | ✅ 211 test | TAMAM |
| Python | ✅ | ✅ | ✅ 77 test | TAMAM |
| Go | ✅ | ✅ | ✅ | TAMAM |
| Rust | ⏳ | ⏳ | ⏳ | SIRADA |
| Ruby | ⏳ | ⏳ | ⏳ | SIRADA |
| Java | ⏳ | ⏳ | ⏳ | SIRADA |
| Kotlin | ⏳ | ⏳ | ⏳ | SIRADA |
| PHP | ⏳ | ⏳ | ⏳ | SIRADA |
| C# | ⏳ | ⏳ | ⏳ | SIRADA |
| Elixir | ⏳ | ⏳ | ⏳ | SIRADA |
| Swift | ⏳ | ⏳ | ⏳ | SIRADA |

### Aşama 3 — Test + Kalite (2/11 tamamlandı)
- Node.js: ✅ 211 test
- Python: ✅ 77 test
- Go: ✅ test mevcut
- Kalan 8 dil: ❌

## Kritik Notlar
- `openapi-generator` ile üretilmiş SDK'lar → üstüne wrapper yazılıyor
- Wrapper pattern: `new HookSniff(key)` → `client.endpoints.create()`
- Zero dependency hedefi (sadece crypto/native HTTP)
- `whsec_` prefix secret format (Standard Webhooks uyumlu)
- HMAC-SHA256 imza doğrulama, timing-safe comparison

## Dosya Konumları
- SDK kodları: `sdks/{dil}/`
- OpenAPI spec: `docs/openapi.yaml`
- Referans: `.ai-context/sdk/SVIX_REFERENCE.md`
- Plan: `.ai-context/sdk/PLAN.md`

## Kaynaklar
- Svix GitHub: https://github.com/svix/svix-webhooks (MIT lisans, mimari referans)
- Standard Webhooks: https://github.com/standard-webhooks/standard-webhooks
- OpenAPI Generator: https://openapi-generator.tech/
