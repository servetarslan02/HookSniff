# SDK Durum Tablosu

> Son güncelleme: 2026-05-18 04:43 GMT+8

## Genel Bakış

| # | SDK | Dil | Yöntem | Versiyon | Ayrı Repo | Registry | Durum |
|---|-----|-----|--------|----------|-----------|----------|-------|
| 1 | **Node.js** | TypeScript | Svix'ten adapte | 1.0.0 | ✅ hooksniff-node | npm | ✅ Yüklendi |
| 2 | **Python** | Python | Svix SDK doğrudan | 1.0.0 | ✅ hooksniff-python | PyPI | ✅ Yüklendi |
| 3 | **Go** | Go | Svix SDK doğrudan | 1.0.0 | ✅ hooksniff-go | GitHub tag | ✅ Tag atıldı |
| 4 | **Rust** | Rust | Svix'ten temiz adapte | 1.0.0 | ✅ hooksniff-rust | crates.io | ✅ Yüklendi |
| 5 | **Ruby** | Ruby | Svix'ten adapte | 1.0.0 | ✅ hooksniff-ruby | RubyGems | ✅ Yüklendi |
| 6 | **Java** | Java | Svix'ten temiz adapte | 1.0.0 | ✅ hooksniff-java | Maven Central | ✅ Yüklendi |
| 7 | **Kotlin** | Kotlin | Svix'ten adapte | 1.0.0 | ✅ hooksniff-kotlin | Maven Central | ✅ Yüklendi |
| 8 | **PHP** | PHP | Svix'ten adapte | 1.0.0 | ✅ hooksniff-php | Packagist | ✅ Tetiklendi |
| 9 | **C#** | C# | Svix'ten adapte | 1.0.0 | ✅ hooksniff-csharp | NuGet | ✅ Yüklendi |
| 10 | **Elixir** | Elixir | OpenAPI'den adapte | 1.0.0 | ✅ hooksniff-elixir | Hex.pm | ✅ Yüklendi |
| 11 | **Swift** | Swift | HookSniff custom | 1.0.0 | ✅ hooksniff-swift | GitHub tag | ✅ Tag atıldı |

## Resource Mapping (Svix → HookSniff)

| Svix Resource | HookSniff Resource | Durum |
|---------------|-------------------|-------|
| Application | Endpoint (HookSniff endpoint kullanıyor) | ✅ |
| Authentication | Authentication | ✅ |
| Endpoint | Endpoint | ✅ |
| EventType | EventType | ✅ |
| Health | Health | ✅ |
| Message | Message | ✅ |
| MessageAttempt | MessageAttempt | ✅ |
| Statistics | Statistics | ✅ |
| BackgroundTask | — (kaldırıldı) | ❌ |
| Connector | — (kaldırıldı) | ❌ |
| Environment | — (kaldırıldı) | ❌ |
| Ingest | — (kaldırıldı) | ❌ |
| Integration | — (kaldırıldı) | ❌ |
| OperationalWebhook | — (kaldırıldı) | ❌ |
| Streaming | — (kaldırıldı) | ❌ |
| MessagePoller | — (kaldırıldı) | ❌ |
