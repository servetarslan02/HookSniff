# SDK Roadmap MEMORY

> Son güncelleme: 2026-05-18 03:48 GMT+8 (Oturum — 10/11 SDK v1.0.0 publish edildi)

## ⚠️ KRİTİK: SDK Adaptasyon Yöntemi

**ASLA sıfırdan yazma!** Her zaman Svix SDK'yı kopyala ve adapte et.

### Adımlar (her SDK için aynı):
1. Svix repo'sundan ilgili dil SDK'sını kopyala
2. Bulk find-replace: `svix` → `hooksniff`, `Svix` → `HookSniff`, `SVIX` → `HOOKSNIFF`
3. Import path'lerini değiştir
4. API base URL'ini değiştir
5. Svix-specific features kaldır (Application, BackgroundTask, Connector, Environment, Ingest, Integration, OperationalWebhook, Streaming, MessagePoller)
6. Header'ları değiştir: `hooksniff-id`, `hooksniff-signature`, `hooksniff-timestamp`
7. Syntax-check yap
8. GitHub'a push et

## 📊 SDK Publish Durumu — v1.0.0

| # | SDK | Registry | Durum | URL |
|---|-----|----------|-------|-----|
| 1 | **Node.js** | npm | ✅ Yüklendi | https://www.npmjs.com/package/hooksniff |
| 2 | **Python** | PyPI | ✅ Yüklendi | https://pypi.org/project/hooksniff/1.0.0/ |
| 3 | **Go** | GitHub tag | ✅ v1.0.0 tag atıldı | https://github.com/servetarslan02/hooksniff-go |
| 4 | **Rust** | crates.io | ✅ Yüklendi | https://crates.io/crates/hooksniff |
| 5 | **Ruby** | RubyGems | ✅ Yüklendi | https://rubygems.org/gems/hooksniff |
| 6 | **Java** | Maven Central | ✅ Yüklendi | `io.github.servetarslan02:hooksniff-sdk:1.0.0` |
| 7 | **C#** | NuGet | ✅ Yüklendi | https://www.nuget.org/packages/HookSniff/ |
| 8 | **Elixir** | Hex.pm | ✅ Yüklendi | https://hex.pm/packages/hooksniff/1.0.0 |
| 9 | **PHP** | Packagist | ✅ Güncelleme tetiklendi | https://packagist.org/packages/hooksniff/hooksniff |
| 10 | **Swift** | GitHub tag | ✅ v1.0.0 tag atıldı | https://github.com/servetarslan02/hooksniff-swift |
| 11 | **Kotlin** | Maven Central | ✅ Yüklendi | https://central.sonatype.com/artifact/io.github.servetarslan02/hooksniff-sdk-kotlin |

## ⏳ Sıradaki: Kotlin SDK

### Kotlin Sorunları:
- Svix-specific model dosyaları hâlâ mevcut (connector configs, polling, streaming, vb.)
- `Authentication.kt` — Svix API'lerini referans ediyor (appPortalAccess, streamPortalAccess, expireAll, dashboardAccess, streamLogout, streamExpireAll, getStreamPollerToken, rotateStreamPollerToken)
- `Endpoint.kt` — bulkReplay, recover, replayMissing, getStats, transformationGet, patchTransformation metodları var
- `Statistics.kt` — aggregateAppStats, aggregateEventTypes referansları var
- `HookSniff.kt` — Application, BackgroundTask, Ingest, Integration, Streaming, OperationalWebhook, OperationalWebhookEndpoint referansları var
- `Message.kt` — MessagePoller, ExpungeAllContents, Precheck referansları var
- `HookSniffHttpClient.kt` — coroutine tabanlı (`suspend` fonksiyonlar)
- `deploy.gradle` — `classifier` deprecated, `archiveClassifier` olmalı
- `gradle.properties` — oluşturuldu (io.github.servetarslan02, hooksniff-sdk-kotlin)

### Kotlin Publish Adımları:
1. Svix-specific model dosyalarını sil
2. `Authentication.kt` — sadece `logout()` metodunu tut
3. `Endpoint.kt` — core metodları tut (list, create, get, update, delete, patch, getHeaders, updateHeaders, patchHeaders, getSecret, rotateSecret, sendExample)
4. `Statistics.kt` — boş class yap
5. `HookSniff.kt` — sadece core API'leri tut (authentication, endpoint, eventType, health, message, messageAttempt, statistics)
6. `Message.kt` — sadece core metodları tut (list, create, get, expungeContent)
7. Build et: `./gradlew build -x test`
8. Publish et (Java ile aynı GPG key + Sonatype credentials):
   ```bash
   export JAVA_HOME=/opt/jdk-17.0.12
   GPG_KEY=$(gpg --export-secret-keys --armor 5F815C019784733D)
   ./gradlew publishToSonatype closeAndReleaseSonatypeStagingRepository \
     -PNEXUS_USERNAME=f0wXBf \
     -PNEXUS_PASSWORD='EYLV763IsQVseaffdOXNScf2HZlcLDGEK' \
     -PsigningKey="$GPG_KEY" \
     -PsigningPassword=""
   ```
9. Repo'ya push et

## 🔑 Token Durumu

| Registry | Token | Durum |
|----------|-------|-------|
| npm | `npm_yKNX...` | ✅ Kullanıldı |
| PyPI | `pypi-AgEI...` | ✅ Kullanıldı |
| crates.io | `ciozq2VZ...` | ✅ Kullanıldı |
| RubyGems | `rubygems_6dcd...` | ✅ Kullanıldı |
| NuGet | `oy2eyxl...` | ✅ Kullanıldı |
| Hex.pm | `caff9417...` | ✅ Kullanıldı |
| Packagist | `86b49ac...` | ✅ Kullanıldı |
| Maven Central | `f0wXBf` / `EYLV763...` | ✅ Kullanıldı |
| GPG Key ID | `5F815C019784733D` | ✅ Keyserver'a yüklendi |

## 📂 Ayrı Repo Yapısı (Tüm SDK'lar)

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

## 📊 Benchmark Sonuçları

| SDK | Dosya | Satır | Model |
|-----|-------|-------|-------|
| Node.js | 73 | 5,851 | ~40 |
| Python | 134 | 7,939 | 101 |
| Go | 124 | 6,003 | 99 |
| Rust | 126 | 8,067 | 98 |
| Ruby | 75 | 4,312 | 48 |
| Java | 218 | 14,531 | 104 |
| Kotlin | 131 | 3,405 | 103 |
| PHP | 89 | 8,483 | ~50 |
| C# | 71 | 4,471 | ~40 |
| Elixir | 249 | 13,791 | — |
| Swift | 460 | 19,332 | — |

## HookSniff API Bilgileri
- Base URL: `https://api.hooksniff-1046140057667.europe-west1.run.app`
- API versioning: `/v1/` prefix
- Auth: Bearer token
- Webhook headers: `hooksniff-id`, `hooksniff-signature`, `hooksniff-timestamp`

## 🔧 Build Ortamı Bilgileri (Bu sunucuda kuruldu)
- Java 17: `/opt/jdk-17.0.12`
- Maven: `/opt/apache-maven-3.9.6`
- Go: `/usr/local/go/bin`
- Rust: `$HOME/.cargo/env`
- Ruby: `/snap/bin` (snap install ruby --classic)
- Elixir: `/opt/elixir/bin` (v1.18.3)
- Erlang: `/snap/bin` (snap install erlang --classic)
- dotnet: `/snap/bin` (snap install dotnet-sdk --classic)
- GPG key: `5F815C019784733D` (HookSniff <support@hooksniff.com>)
