# 📦 SDK Publish Durumu — 2026-05-18 07:26 GMT+8

## Genel Durum

Tüm 11 SDK'nın **kodları** ayrı repolara push edildi (v1.1.0).
**5 SDK** registry'ye henüz yüklenmedi (local build/runtime gerektirir).

---

## ✅ YÜKLENENLER

| SDK | Registry | Versiyon | URL |
|-----|----------|----------|-----|
| Node.js | npm | 1.1.0 | https://www.npmjs.com/package/hooksniff |
| Python | PyPI | 1.1.0 | https://pypi.org/project/hooksniff/1.1.0/ |
| Rust | crates.io | 1.1.0 | https://crates.io/crates/hooksniff |
| Go | GitHub tag | v1.1.0 | github.com/servetarslan02/hooksniff-go/releases |
| Swift | GitHub tag | v1.1.0 | github.com/servetarslan02/hooksniff-swift/releases |
| PHP | Packagist | otomatik | github.com/servetarslan02/hooksniff-php |

---

## ⏳ YÜKLENECEKLER

**⚠️ Credentials local dosyalarda saklanır, GitHub'a push edilmez!**

### Ruby → RubyGems
```bash
cd hooksniff-ruby
gem build hooksniff.gemspec
gem push hooksniff-1.1.0.gem
```

### Java → Maven Central (via Sonatype)
```bash
cd hooksniff-java
mvn deploy -B -DskipTests
```

### Kotlin → Maven Central (via Sonatype)
```bash
cd hooksniff-kotlin
./gradlew publish
```

### C# → NuGet
```bash
cd hooksniff-csharp
dotnet pack -c Release
dotnet nuget push "HookSniff/bin/Release/*.nupkg" --api-key <KEY> --source https://api.nuget.org/v3/index.json
```

### Elixir → Hex.pm
```bash
cd hooksniff-elixir
mix hex.publish --yes
```

---

## Ayrı Repo URL'leri

| SDK | Repo |
|-----|------|
| Node.js | https://github.com/servetarslan02/hooksniff-node |
| Python | https://github.com/servetarslan02/hooksniff-python |
| Go | https://github.com/servetarslan02/hooksniff-go |
| Rust | https://github.com/servetarslan02/hooksniff-rust |
| Ruby | https://github.com/servetarslan02/hooksniff-ruby |
| Java | https://github.com/servetarslan02/hooksniff-java |
| Kotlin | https://github.com/servetarslan02/hooksniff-kotlin |
| PHP | https://github.com/servetarslan02/hooksniff-php |
| C# | https://github.com/servetarslan02/hooksniff-csharp |
| Elixir | https://github.com/servetarslan02/hooksniff-elixir |
| Swift | https://github.com/servetarslan02/hooksniff-swift |
