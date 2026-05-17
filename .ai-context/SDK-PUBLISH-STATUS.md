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

### Ruby → RubyGems

```bash
# Ruby runtime gerekli (3.3+)
cd hooksniff-ruby
gem build hooksniff.gemspec
# hooksniff-1.1.0.gem oluşacak
gem push hooksniff-1.1.0.gem
# RubyGems API key: rubygems_6dcd22a55912b2002a27b544d0066f8ce3c41dc2ce428ff4
```

### Java → Maven Central (via Sonatype)

```bash
# JDK 17+ ve Maven gerekli
cd hooksniff-java
# settings.xml'e ekle:
# <server>
#   <id>ossrh</id>
#   <username>A81UHB</username>
#   <password>CJlxjBhCDasTB00Cip3lqzu1icvtonu7o</password>
# </server>
mvn deploy -B -DskipTests
# İlk publish ise: mvn nexus-staging:release
```

### Kotlin → Maven Central (via Sonatype)

```bash
# JDK 17+ ve Gradle gerekli
cd hooksniff-kotlin
# gradle.properties'e ekle:
# ossrhUsername=A81UHB
# ossrhPassword=CJlxjBhCDasTB00Cip3lqzu1icvtonu7o
./gradlew publish
```

### C# → NuGet

```bash
# .NET SDK 8+ gerekli
cd hooksniff-csharp
dotnet pack -c Release
dotnet nuget push "HookSniff/bin/Release/*.nupkg" \
  --api-key oy2eyxly2puop7uki47q6ewsoelcrikudaito7a7nxkjyy \
  --source https://api.nuget.org/v3/index.json
```

### Elixir → Hex.pm

```bash
# Elixir 1.14+ ve Mix gerekli
cd hooksniff-elixir
mix hex.publish --yes
# Hex API key: 20e1faa34deb3e75d01dec3002e30bfc
```

---

## 🔑 Registry Credentials

| Registry | Key/Token |
|----------|-----------|
| npm | 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 |
| PyPI | pypi-AgEIcHlwaS5vcmcC... (uzun token) |
| crates.io | ciozq2VZY9iBIKxYlBMJuUg8p8Cg7Z1KeqE |
| RubyGems | rubygems_6dcd22a55912b2002a27b544d0066f8ce3c41dc2ce428ff4 |
| Sonatype | A81UHB / CJlxjBhCDasTB00Cip3lqzu1icvtonu7o |
| NuGet | oy2eyxly2puop7uki47q6ewsoelcrikudaito7a7nxkjyy |
| Hex.pm | 20e1faa34deb3e75d01dec3002e30bfc |
| Packagist | 86b49acd74d0894483fae6e47c4f68712239dcde |

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
