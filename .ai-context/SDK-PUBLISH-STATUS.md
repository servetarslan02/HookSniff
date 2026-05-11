# 📦 SDK Publish Durumu — 2026-05-11 19:35

## Yayınlananlar ✅ (9/11)
| SDK | Versiyon | Registry | URL |
|-----|----------|----------|-----|
| Node.js | 0.3.0 | npm | https://www.npmjs.com/package/hooksniff-sdk |
| Python | 0.3.0 | PyPI | https://pypi.org/project/hooksniff/ |
| Rust | 0.3.0 | crates.io | https://crates.io/crates/hooksniff |
| Go | v0.3.0 | git tag | — |
| Swift | v0.3.0 | git tag | — |
| Java | 0.3.0 | Maven Central | (onay bekliyor) |
| Kotlin | 0.3.0 | Maven Central | https://central.sonatype.com/artifact/io.github.servetarslan02/hooksniff-sdk/0.3.0 |
| C# | 0.3.0 | NuGet | https://www.nuget.org/packages/HookSniff/0.3.0 |
| Elixir | 0.3.0 | Hex | https://hex.pm/packages/hooksniff/0.3.0 |

## Kalan ⏳ (2/11)

### Ruby — API key geçersiz
- Gem build başarılı ✅
- `gem push` → "Access Denied" hatası
- RubyGems.org'da hesap yok veya key geçersiz
- **Servet:** RubyGems.org'a kayıt ol → API key oluştur → `gem push`

### PHP — Repo private
- Paket Packagist'te kayıtlı ✅ (`hooksniff/hooksniff-php`)
- GitHub repo private → Packagist erişemiyor
- **Servet:** Repo'yu public yap VEYA Packagist webhook kur
- Webhook URL: `https://packagist.org/api/update-package?username=servetarslan02&apiToken=TOKEN`
