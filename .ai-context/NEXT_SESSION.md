# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-12 00:15 GMT+8

---

## 🔴 ACİL: Vercel 404 Kontrol (Deploy sonrası)

### Yapılan Fix
- `dashboard/next.config.js`'den `outputFileTracingRoot: path.join(__dirname, '..')` **kaldırıldı**
- `path` import'u da kaldırıldı (artık kullanılmıyor)
- Push: `bb16a8e2` — main branch
- Vercel deploy hook tetiklendi

### Kontrol Adımları
1. **Vercel deploy tamamlanmasını bekle** (2-3 dk)
2. **Bu 3 sayfayı test et:**
   - `https://hooksniff.vercel.app/en/docs/api`
   - `https://hooksniff.vercel.app/en/docs/portal`
   - `https://hooksniff.vercel.app/en/docs/sdks`
3. **Eğer hâlâ 404 ise → Plan B'ye geç**

### Plan B: Sayfaları Farklı Yola Taşı
Eğer outputFileTracingRoot kaldırması yetmezse, muhtemel neden:
- Repo kök dizinindeki `api/`, `portal/`, `sdks/` klasörleri (Rust API, HTML portal, SDK source)
- next-intl + `[locale]` segmenti ile Vercel serverless function arasında uyumsuzluk

**Çözüm:** Bu 3 docs sayfasını farklı yola taşı:
- `[locale]/docs/api` → `[locale]/docs/api-reference`
- `[locale]/docs/portal` → `[locale]/docs/embed-portal`
- `[locale]/docs/sdks` → `[locale]/docs/sdk-libraries`

**Ayrıca güncelle:**
- Sidebar linkleri (docs layout)
- Internal linkler (diğer sayfalardan bu sayfalara gelen linkler)
- Sitemap (eğer varsa)

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

## 📋 Sonraki Adım: AŞAMA 3 — Publish

### SDK Publish Planı
| SDK | Registry | Paket Adı | Durum |
|-----|----------|-----------|-------|
| Node.js | npm | hooksniff-sdk | ❌ Publish edilmedi |
| Python | PyPI | hooksniff | ❌ Publish edilmedi |
| Go | pkg.go.dev | github.com/servetarslan02/HookSniff/sdks/go | ❌ |
| Rust | crates.io | hooksniff | ❌ |
| Ruby | RubyGems | hooksniff | ❌ |
| Java | Maven Central | com.hooksniff:hooksniff-sdk | ❌ |
| Kotlin | Maven Central | com.hooksniff:hooksniff-sdk-kotlin | ❌ |
| PHP | Packagist | hooksniff/hooksniff | ❌ |
| C# | NuGet | HookSniff | ❌ |
| Elixir | Hex | hooksniff | ❌ |
| Swift | SwiftPM | HookSniff | ❌ |

### Publish İçin Gerekenler
- npm: npm hesabı + npm publish
- PyPI: PyPI hesabı + twine upload
- Go: Git tag yeterli (go get otomatik)
- Rust: crates.io token + cargo publish
- Ruby: RubyGems hesabı + gem push
- Java/Kotlin: Maven Central (Sonatype) hesabı + GPG signing
- PHP: Packagist hesabı + composer publish
- C#: NuGet hesabı + dotnet nuget push
- Elixir: Hex hesabı + mix hex.publish
- Swift: Ayrı repo + Git tag

## 📊 Version
- Tüm SDK'lar: 0.4.0
