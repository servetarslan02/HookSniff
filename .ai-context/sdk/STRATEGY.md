# 📦 HookSniff — SDK Stratejisi

> Son güncelleme: 2026-05-10
> Karar: 11/11 SDK yayınlandı ✅

## Yayınlanan SDK'lar (11/11)

| # | Dil | Registry | Paket Adı | Durum |
|---|-----|----------|-----------|-------|
| 1 | Node.js | npm | `hooksniff-sdk` | ✅ Published |
| 2 | Python | PyPI | `hooksniff` | ✅ Published |
| 3 | Go | Go modules | `hooksniff-go` | ✅ Published |
| 4 | Rust | crates.io | `hooksniff` | ✅ Published |
| 5 | Ruby | RubyGems | `hooksniff` | ✅ Published |
| 6 | Java | Maven Central | `hooksniff-sdk` | ✅ Published |
| 7 | Kotlin | Maven Central | `hooksniff` | ✅ Published |
| 8 | PHP | Packagist | `hooksniff/hooksniff` | ✅ Published |
| 9 | C# | NuGet | `HookSniff` | ✅ Published |
| 10 | Elixir | Hex.pm | `hooksniff` | ✅ Published |
| 11 | Swift | Swift Package Index | `HookSniff` | ✅ Published |

## Bakım Planı

### Aktif Bakım (Tüm SDK'lar)
- Dependabot ile bağımlılık güncellemeleri
- CI testleri (import, instantiation, signature verification)
- Güvenlik açığı taraması

### Güvenlik Açığı Senaryoları

| Senaryo | Tehlike | Aksiyon |
|---------|---------|---------|
| Bağımlılık açığı | Düşük | Dependabot PR → merge |
| SDK kodunda açık | Orta | Issue → fix → publish |
| Yeni dil sürümü | Düşük | Genellikle bozulmaz |

### Gelecek: OpenAPI Spec + Otomatik Üretim
- `openapi.json` ile SDK'lar otomatik üretilebilir
- Swagger Codegen veya OpenAPI Generator
- Yeni dil eklemek 5 dakika sürer

## Kritik Kural

> **Ne kadar az bağımlılık = o kadar az güvenlik riski**

SDK'lar sadece API wrapper'ı. Minimal bağımlılık, minimal risk.
