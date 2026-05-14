# SDK MEMORY.md — SDK Çalışma Hafızası

> Son güncelleme: 2026-05-15 08:00 GMT+8

## Genel Durum
- **11 SDK** yayınlandı (Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift)
- **Referans rakip:** Svix (218 model, tüm dillerde wrapper + test)
- **Hedef:** Tüm SDK'ları Svix ile eşit veya daha iyi seviyeye çıkarmak

## Tamamlanan İşler

### Aşama 1 — OpenAPI Spec ✅
- Model sayısı: 148 schema, tüm SDK'larda mevcut
- Aşama 1.4 kalite kontrol: ✅ 11/11 SDK doğrulandı

### Aşama 2 — Wrapper + İmza ✅ (11/11)
| Dil | Wrapper | İmza | Test | Durum |
|-----|---------|------|------|-------|
| Node.js | ✅ | ✅ | ✅ 211 test | TAMAM |
| Python | ✅ | ✅ | ✅ 77 test | TAMAM |
| Go | ✅ | ✅ | ✅ | TAMAM |
| Rust | ✅ | ✅ | ✅ 6 test dosyası (2700+ satır) | TAMAM |
| Ruby | ✅ | ✅ | ✅ 170+ spec | TAMAM |
| Java | ✅ | ✅ | ✅ 209 test | TAMAM |
| Kotlin | ✅ | ✅ | ✅ 179 test | TAMAM |
| PHP | ✅ | ✅ | ✅ | TAMAM |
| C# | ✅ | ✅ | ✅ 220 test | TAMAM |
| Elixir | ✅ | ✅ | ✅ 21 test | TAMAM |
| Swift | ✅ | ✅ | ✅ 10 test dosyası | TAMAM |

### Aşama 3 — Test + Kalite ✅ (11/11)
- Tüm dillerde unit test mevcut
- CHANGELOG.md her SDK'da var
- Webhook verification tüm dillerde HMAC-SHA256

### Aşama 4 — Operasyonel ⏳ (SIRADA)
- CI/CD pipeline: ❌
- Dokümantasyon sitesi: ❌
- Performance benchmarking: ❌
- Publish durumu kontrol: ❌

## Kritik Notlar
- `openapi-generator` ile üretilmiş SDK'lar → üstüne wrapper yazılmış
- Wrapper pattern: `new HookSniff(key)` → `client.endpoints.create()`
- Zero dependency hedefi (sadece native crypto + HTTP)
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
