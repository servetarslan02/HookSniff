# 📦 SDK Publish Durumu — 2026-05-18 03:10 GMT+8

## Yayınlananlar ✅ (v1.0.0)

| # | SDK | Versiyon | Registry | Durum | URL |
|---|-----|----------|----------|-------|-----|
| 1 | **Node.js** | 1.0.0 | npm | ✅ Yüklendi | https://www.npmjs.com/package/hooksniff |
| 2 | **Python** | 1.0.0 | PyPI | ✅ Yüklendi | https://pypi.org/project/hooksniff/1.0.0/ |
| 3 | Go | 1.0.0 | proxy.golang.org | ⏳ Repo hazır, publish beklemede | https://github.com/servetarslan02/hooksniff-go |
| 4 | Rust | 1.0.0 | crates.io | ⏳ Repo hazır, publish beklemede | https://github.com/servetarslan02/hooksniff-rust |
| 5 | Ruby | 1.0.0 | RubyGems | ⏳ Repo hazır, publish beklemede | https://github.com/servetarslan02/hooksniff-ruby |
| 6 | Java | 1.0.0 | Maven Central | ⏳ Repo hazır, publish beklemede | https://github.com/servetarslan02/hooksniff-java |
| 7 | Kotlin | 1.0.0 | Maven Central | ⏳ Repo hazır, publish beklemede | https://github.com/servetarslan02/hooksniff-kotlin |
| 8 | PHP | 1.0.0 | Packagist | ⏳ Repo hazır, publish beklemede | https://github.com/servetarslan02/hooksniff-php |
| 9 | C# | 1.0.0 | NuGet | ⏳ Repo hazır, publish beklemede | https://github.com/servetarslan02/hooksniff-csharp |
| 10 | Elixir | 1.0.0 | Hex.pm | ⏳ Repo hazır, publish beklemede | https://github.com/servetarslan02/hooksniff-elixir |
| 11 | Swift | 1.0.0 | GitHub Package Index | ⏳ Repo hazır, publish beklemede | https://github.com/servetarslan02/hooksniff-swift |

## Ayrı Repo Yapısı (Tüm SDK'lar)

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

## Kalan Publish Komutları

```bash
# Go (GOPROXY otomatik indexlenir)
cd sdks/go && go tag v1.0.0 && git push --tags

# Rust
cd sdks/rust && cargo login <token> && cargo publish

# Ruby
cd sdks/ruby && gem build hooksniff.gemspec && gem push hooksniff-*.gem

# Java (Maven Central — Sonatype credentials gerekli)
cd sdks/java && mvn deploy -B -DskipTests

# Kotlin (Maven Central)
cd sdks/kotlin && ./gradlew publish

# PHP (Packagist — repo URL'den otomatik güncellenir)
# Sadece push yeterli: git push origin main

# C# (NuGet)
cd sdks/csharp && dotnet pack -c Release && dotnet nuget push "bin/Release/*.nupkg" --api-key <key> --source https://api.nuget.org/v3/index.json

# Elixir (Hex.pm)
cd sdks/elixir && mix hex.publish --yes

# Swift (otomatik — git tag ile)
cd sdks/swift && git tag v1.0.0 && git push --tags
```
