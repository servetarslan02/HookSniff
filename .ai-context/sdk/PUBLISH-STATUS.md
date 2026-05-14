# SDK Publish Durumu

> Son kontrol: 2026-05-15 08:05 GMT+8

## Registry Durumu

| SDK | Registry | Paket Adı | Yerel Versiyon | Registry Versiyon | Durum |
|-----|----------|-----------|----------------|-------------------|-------|
| Node.js | npm | hooksniff-sdk | 0.4.0 | 0.3.0 | ⚠️ Güncelleme gerekli |
| Python | PyPI | hooksniff | 0.3.0 | 0.3.0 | ✅ Güncel |
| Go | Go modules | hooksniff-go | — | — | ✅ (git tag ile) |
| Rust | crates.io | hooksniff | 0.4.0 | — | ❌ İlk publish gerekli |
| Ruby | RubyGems | hooksniff | 0.4.0 | 0.3.0 | ⚠️ Güncelleme gerekli |
| Java | Maven Central | hooksniff-sdk | 0.4.0 | — | ❌ İlk publish gerekli |
| Kotlin | Maven Central | hooksniff | 0.4.0 | — | ❌ Kontrol edilemedi |
| PHP | Packagist | hooksniff/hooksniff | 0.4.0 | — | ❌ Kontrol edilemedi |
| C# | NuGet | HookSniff | 0.4.0 | — | ❌ İlk publish gerekli |
| Elixir | Hex.pm | hooksniff | 0.4.0 | 0.3.0 | ⚠️ Güncelleme gerekli |
| Swift | Swift Package Index | HookSniff | 0.4.0 | — | ✅ (git tag ile) |

## Aksiyonlar

### Acil (Servet'in yapması gerekiyor)
- [ ] npm token ekle → GitHub Secrets > `NPM_TOKEN`
- [ ] PyPI token ekle → GitHub Secrets > `PYPI_TOKEN`
- [ ] crates.io token ekle → GitHub Secrets > `CARGO_TOKEN`
- [ ] RubyGems token ekle → GitHub Secrets > `RUBYGEMS_TOKEN`
- [ ] Maven Central credentials ekle → GitHub Secrets > `MAVEN_USERNAME`, `MAVEN_PASSWORD`
- [ ] NuGet token ekle → GitHub Secrets > `NUGET_TOKEN`
- [ ] Hex.pm token ekle → GitHub Secrets > `HEX_TOKEN`

### Publish Workflow
- Manuel tetikleme: GitHub Actions > SDK Publish > Run workflow > `all`
- Tag ile tetikleme: `git tag sdk-v0.4.0 && git push origin sdk-v0.4.0`

## Notlar
- `check-sdk-publish.sh` scripti ile durum kontrol edilebilir
- `bump-sdk-version.sh <version>` ile tüm SDK'ların versiyonu güncellenebilir
- Swift Package Index otomatik olarak git tag'lerinden indeksler
