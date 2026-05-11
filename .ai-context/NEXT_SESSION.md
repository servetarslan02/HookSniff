# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-12 00:57 GMT+8

---

## ✅ Vercel 404 Sorunu ÇÖZÜLDÜ (Oturum 115)

### Sorun
Repo root'taki `api/`, `portal/`, `sdks/` klasörleri next-intl `[locale]` segmenti ile Vercel serverless function'da isim çakışması yapıyordu. Local build'de 210 sayfa üretiliyordu ama Vercel'de bu sayfalar 404 veriyordu.

### Yapılan Fixler
1. `outputFileTracingRoot` kaldırıldı — `dashboard/next.config.js`
2. 3 docs sayfası taşındı:
   - `docs/api` → `docs/api-reference` ✅
   - `docs/portal` → `docs/embed-portal` ✅
   - `docs/sdks` → `docs/sdk-libraries` ✅
3. Dashboard portal sayfası taşındı:
   - `dashboard/portal` → `dashboard/portal-manage` ✅
4. Sidebar, sitemap, test imports, SDK README, get-started link güncellendi

### Doğrulama
Tüm sayfalar Vercel'de 200 OK döndürüyor:
- `/en/docs/api-reference` ✅
- `/en/docs/embed-portal` ✅
- `/en/docs/sdk-libraries` ✅
- `/en/dashboard/portal-manage` ✅

### Alınan Ders
- Vercel deploy hook bazen GitHub push'ını tetiklemiyor. Dummy commit ile tetiklenebiliyor.
- Repo root'taki klasör isimleri ile Next.js route isimleri aynı olmamalı (Vercel serverless conflict).

## 📋 Sonraki Adımlar

### AŞAMA 3 — SDK Publish
| SDK | Registry | Paket Adı | Durum |
|-----|----------|-----------|-------|
| Node.js | npm | hooksniff-sdk | ❌ Publish edilmedi |
| Python | PyPI | hooksniff | ❌ Publish edilmedi |
| Go | pkg.go.dev | github.com/servetarslan02/HookSniff/sdks/go | ❌ |
| Rust | crates.io | hooksniff | ❌ |
| Ruby | RubyGems | hooksniff | ❌ |
| Java | Maven Central | io.github.servetarslan02:hooksniff-sdk | ✅ Yayında |
| Kotlin | Maven Central | io.github.servetarslan02:hooksniff-sdk-kotlin | ✅ Yayında |
| PHP | Packagist | hooksniff/hooksniff | ❌ |
| C# | NuGet | HookSniff | ❌ |
| Elixir | Hex | hooksniff | ❌ |
| Swift | SwiftPM (ayrı repo) | hooksniff-swift | ✅ Yayında |

### Publish İçin Gerekenler
- npm: npm hesabı + npm publish
- PyPI: PyPI hesabı + twine upload
- Go: Git tag yeterli (go get otomatik)
- Rust: crates.io token + cargo publish
- Ruby: RubyGems hesabı + gem push
- PHP: Packagist hesabı + composer publish
- C#: NuGet hesabı + dotnet nuget push
- Elixir: Hex hesabı + mix hex.publish

## ✅ AŞAMA 2 TAMAMLANDI — Wrapper + İmza Doğrulama + Testler (11/11 SDK)

| SDK | Wrapper | verifySignature | Test | Çalıştırıldı |
|-----|---------|----------------|------|-------------|
| Node.js | ✅ | ✅ | 14/14 ✅ | ✅ Evet |
| Python | ✅ | ✅ | 26/26 ✅ | ✅ Evet |
| Go | ✅ | ✅ | 8/8 ✅ | ✅ Evet |
| Rust | ✅ | ✅ | 8/8 ✅ | ✅ Evet |
| Ruby | ✅ | ✅ | 8/8 ✅ | ✅ Evet |
| PHP | ✅ | ✅ | 14/14 ✅ | ✅ Evet |
| Java | ✅ | ✅ | 11 test | ❌ Maven bağımlılık |
| Kotlin | ✅ | ✅ | 13 test | ❌ Gradle yok |
| C# | ✅ | ✅ | 15 test | ❌ .NET yok |
| Elixir | ✅ | ✅ | 12 test | ❌ Mix yok |
| Swift | ✅ | ✅ | 12 test | ❌ Swift yok |

### Toplam: 141 test yazıldı, 78'i çalıştırıldı (6 SDK bu ortamda desteklenmiyor)

## 📊 Version
- Tüm SDK'lar: 0.4.0
