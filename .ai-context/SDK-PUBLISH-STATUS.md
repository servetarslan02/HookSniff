# 📦 SDK Publish Durumu — 2026-05-11

## Yayınlananlar ✅
| SDK | Versiyon | Registry | Link |
|-----|----------|----------|------|
| Node.js | 0.3.0 | npm | https://www.npmjs.com/package/hooksniff-sdk |
| Python | 0.3.0 | PyPI | https://pypi.org/project/hooksniff/ |
| Rust | 0.3.0 | crates.io | https://crates.io/crates/hooksniff |
| Go | v0.3.0 | git tag | ✅ atıldı |
| Swift | v0.3.0 | git tag | ✅ atıldı |

## Yayınlanmayanlar ⏳
| SDK | Registry | Sorun | Çözüm |
|-----|----------|-------|-------|
| Java | Maven Central | GPG imza + eksik bağımlılıklar | pom.xml düzelt + GPG key import |
| Kotlin | Maven Central | Aynı Java gibi | Aynı çözüm |
| PHP | Packagist | GitHub webhook gerekli | Packagist'te repo bağla |
| Ruby | RubyGems | Ruby kurulu değil (Servet'in PC) | `gem push hooksniff-0.3.0.gem` |
| C# | NuGet | .NET build path hatası | csproj düzeltildi, script güncellendi |
| Elixir | Hex.pm | Elixir kurulu değil (Servet'in PC) | `mix hex.publish --yes` |

## Servet'in Yapması Gereken (PC'de)
Ruby ve Elixir için bu programları kur:
- **Ruby:** https://rubyinstaller.org/ → kur → `gem push hooksniff-*.gem`
- **Elixir:** https://elixir-lang.org/install.html → kur → `mix hex.publish --yes`
- **C#:** .NET SDK zaten kurulu → `publish-sdks.ps1` çalıştır (düzeltildi)

## Java/Kotlin Maven Central İçin Gerekenler
1. Sonatype OSSRH hesabı → var (f0wXBf)
2. GPG key → oluşturuldu ama Maven'da import edilmedi
3. `pom.xml` → bağımlılıklar düzeltildi (okhttp3, javax.annotation, gson-fire, jackson)
4. Kalan: GPG key'i doğru şekilde Maven'a bağla + deploy et

## Kullanılan Registry Token'ları
- npm: ✅ kullanıldı
- PyPI: ✅ kullanıldı
- crates.io: ✅ kullanıldı
- RubyGems: Servet'in PC'de kullanılacak
- NuGet: Servet'in PC'de kullanılacak
- Hex: Servet'in PC'de kullanılacak
- Maven Central (Sonatype): f0wXBf / EYLV763...
- Packagist: 86b49acd...
