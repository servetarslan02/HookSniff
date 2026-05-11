# 📦 SDK Publish Durumu — 2026-05-11 19:10

## Yayınlananlar ✅ (6/11)
| SDK | Versiyon | Registry | Durum |
|-----|----------|----------|-------|
| Node.js | 0.3.0 | npm → hooksniff-sdk | ✅ Yayında |
| Python | 0.3.0 | PyPI → hooksniff | ✅ Yayında |
| Rust | 0.3.0 | crates.io → hooksniff | ✅ Yayında |
| Go | v0.3.0 | git tag atıldı | ✅ Yayında |
| Swift | v0.3.0 | git tag atıldı | ✅ Yayında |
| Java | 0.3.0 | Maven Central | ✅ Yüklendi (onay bekliyor) |

## Kalan ⏳ (5/11)

### Kotlin — Build config düzeltildi, publish gerekli
- `build.gradle.kts` ve `build.gradle` Maven Central OSSRH'ye güncellendi ✅
- `artifactId` → `hooksniff-sdk` (tutarlılık için)
- `jvmToolchain` → 11 (Java uyumluluğu)
- Dependencies: Java SDK ile aynı (gson, okhttp, javax.annotation, gson-fire, jackson, jsr305)
- SCM URL'leri monorepo'ya düzeltildi ✅
- **Publish komutu:** `./gradlew publishMavenPublicationToOssrhRepository`
- **Gerekli:** GPG key, OSSRH credentials (Java SDK ile aynı)

### PHP — Packagist webhook gerekli
- `composer.json` düzeltildi ✅:
  - Autoload: `OpenAPI\\Client\\` → `lib/` (namespace düzeltildi)
  - Homepage monorepo'ya指向 edildi
  - `guzzlehttp/guzzle` dependency eklendi
  - `require-dev` phpunit eklendi
  - Email `support@hooksniff.dev` olarak düzeltildi
- **Packagist webhook:** Servet packagist.org'da repo bağlamalı

### Ruby — Servet'in PC'sinde
- `hooksniff.gemspec` homepage düzeltildi ✅ (monorepo URL)
- `openapi_client.gemspec` — eski generated isim, hala mevcut
- Gem adı `hooksniff` ama internal namespace `openapi_client`
- **Gerekli:** Ruby kur (`rubyinstaller.org` veya `rbenv`), sonra `gem build hooksniff.gemspec && gem push hooksniff-0.3.0.gem`

### C# — Servet'in PC'sinde
- `.csproj` doğru yapılandırılmış ✅ (net8.0, MIT, repo URL doğru)
- **Gerekli:** .NET 8 SDK kur, `cd sdks/csharp && dotnet pack -c Release && dotnet nuget push bin/Release/*.nupkg --source https://api.nuget.org/v3/index.json`

### Elixir — Servet'in PC'sinde
- `mix.exs` homepage_url düzeltildi ✅ (`hooksniff.io` → `hooksniff.vercel.app`)
- **Gerekli:** Elixir kur (`elixir-lang.org`), `cd sdks/elixir && mix hex.publish --yes`

## Sonraki Adımlar (Servet için)
1. **Kotlin publish:** Java kur + GPG key import + `./gradlew publishMavenPublicationToOssrhRepository`
2. **PHP Packagist:** packagist.org'da `hooksniff/hooksniff-php` olarak repo bağla + webhook kur
3. **Ruby:** Ruby kur + `gem push`
4. **C#:** .NET kur + `dotnet nuget push`
5. **Elixir:** Elixir kur + `mix hex.publish`
