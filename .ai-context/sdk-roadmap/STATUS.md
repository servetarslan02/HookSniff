# SDK Durum Tablosu

> Son güncelleme: 2026-05-19 05:23 GMT+8

## Genel Bakış

| # | SDK | Dil | Versiyon | Registry | Durum | Faz 8-15 | Ek Resource |
|---|-----|-----|----------|----------|-------|----------|-------------|
| 1 | **Node.js** | TypeScript | 1.1.0 | npm | ✅ | 8/8 ✅ | — |
| 2 | **Python** | Python | 1.1.0 | PyPI | ✅ | 8/8 ✅ | — |
| 3 | **Go** | Go | 1.1.0 | GitHub tag | ✅ | 8/8 ✅ | — |
| 4 | **Rust** | Rust | 1.1.0 | crates.io | ✅ | 8/8 ✅ | — |
| 5 | **Ruby** | Ruby | **1.2.0** | RubyGems | ✅ | 8/8 ✅ | 30+ resource |
| 6 | **Java** | Java | 1.1.2 | Maven Central | ✅ | 8/8 ✅ | — |
| 7 | **Kotlin** | Kotlin | 1.1.0 | Maven Central | ⏳ | 8/8 ✅ | build fix gerekli |
| 8 | **PHP** | PHP | 1.1.0 | Packagist | ✅ | 8/8 ✅ | — |
| 9 | **C#** | C# | **1.2.0** | NuGet | ✅ | 8/8 ✅ | 30+ resource |
| 10 | **Elixir** | Elixir | 1.1.1 | Hex.pm | ⏳ | 8/8 ✅ | — |
| 11 | **Swift** | Swift | 1.1.0 | GitHub tag | ✅ | 8/8 ✅ | — |

## Publish Edilen SDK'lar (Registry)

| # | SDK | Registry | Versiyon | URL | Tarih |
|---|-----|----------|----------|-----|-------|
| 1 | Node.js | npm | 1.1.0 | https://www.npmjs.com/package/hooksniff | 2026-05-17 |
| 2 | Python | PyPI | 1.1.0 | https://pypi.org/project/hooksniff/1.1.0/ | 2026-05-17 |
| 3 | Rust | crates.io | 1.1.0 | https://crates.io/crates/hooksniff | 2026-05-17 |
| 4 | Go | GitHub tag | v1.1.0 | github.com/servetarslan02/hooksniff-go/releases | 2026-05-17 |
| 5 | Swift | GitHub tag | v1.1.0 | github.com/servetarslan02/hooksniff-swift/releases | 2026-05-17 |
| 6 | PHP | Packagist | 1.1.0 | github.com/servetarslan02/hooksniff-php | 2026-05-17 |
| 7 | Java | Maven Central | 1.1.2 | — | 2026-05-18 |
| 8 | **Ruby** | **RubyGems** | **1.2.0** | https://rubygems.org/gems/hooksniff | **2026-05-18** |
| 9 | **C#** | **NuGet** | **1.2.0** | https://www.nuget.org/packages/HookSniff/1.2.0 | **2026-05-18** |

## SDK Resource Karşılaştırması

### Faz 8-15 Resource'ları (Yeni Özellikler)

| Resource | Node | Python | Go | Rust | Ruby | Java | Kotlin | PHP | C# | Elixir | Swift |
|----------|------|--------|-----|------|------|------|--------|-----|-----|--------|-------|
| Environment | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| BackgroundTask | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| OperationalWebhook | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| MessagePoller | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Inbound | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Connector | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Integration | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Stream | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Ek Resource'lar (Ruby v1.2.0 + C# v1.2.0)

| Resource | Ruby | C# | API Endpoint |
|----------|------|-----|-------------|
| Application | ✅ | ✅ | /v1/applications |
| ApiKey | ✅ | ✅ | /v1/api-keys |
| Search | ✅ | ✅ | /v1/search |
| Alert | ✅ | ✅ | /v1/alerts |
| Analytics | ✅ | ✅ | /v1/analytics |
| Billing | ✅ | ✅ | /v1/billing |
| Portal | ✅ | ✅ | /v1/portal |
| Team | ✅ | ✅ | /v1/teams |
| Notification | ✅ | ✅ | /v1/notifications |
| SSO | ✅ | ✅ | /v1/sso |
| AuditLog | ✅ | ✅ | /v1/audit-log |
| CustomDomain | ✅ | ✅ | /v1/custom-domains |
| RateLimit | ✅ | ✅ | /v1/rate-limits |
| Routing | ✅ | ✅ | /v1/routing |
| Template | ✅ | ✅ | /v1/templates |
| Schema | ✅ | ✅ | /v1/schemas |
| Playground | ✅ | ✅ | /v1/playground |
| ServiceToken | ✅ | ✅ | /v1/service-tokens |

## Dashboard Sayfaları

| Sayfa | URL | Durum |
|-------|-----|-------|
| Environments | /environments | ✅ |
| Background Tasks | /background-tasks | ✅ |
| Operational Webhooks | /operational-webhooks | ✅ |
| Message Poller | /message-poller | ✅ |
| Inbound Webhooks | /inbound | ✅ |
| Connectors | /connectors | ✅ |
| Integrations | /integrations | ✅ |
| Streaming | /streaming | ✅ |

## DB Tabloları

| Tablo | Migration | Durum |
|-------|-----------|-------|
| environments | 056 | ✅ |
| environment_variables | 057 | ✅ |
| background_tasks | 058 | ✅ |
| operational_webhook_endpoints | 059 | ✅ |
| operational_webhook_deliveries | 060 | ✅ |
| message_cursors | 061 | ✅ |
| connectors | 062 | ✅ |
| connector_configs | 062 | ✅ |
| integrations | 063 | ✅ |
| integration_events | 063 | ✅ |
| stream_channels | 064 | ✅ |
| stream_subscriptions | 064 | ✅ |
| stream_messages | 064 | ✅ |
