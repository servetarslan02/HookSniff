# SDK Durum Tablosu

> Son güncelleme: 2026-05-18 07:26 GMT+8

## Genel Bakış

| # | SDK | Dil | Versiyon | Registry | Durum |
|---|-----|-----|----------|----------|-------|
| 1 | **Node.js** | TypeScript | 1.1.0 | npm | ✅ |
| 2 | **Python** | Python | 1.1.0 | PyPI | ✅ |
| 3 | **Go** | Go | 1.1.0 | GitHub tag | ✅ |
| 4 | **Rust** | Rust | 1.1.0 | crates.io | ✅ |
| 5 | **Ruby** | Ruby | 1.1.0 | RubyGems | ⏳ |
| 6 | **Java** | Java | 1.1.0 | Maven Central | ⏳ |
| 7 | **Kotlin** | Kotlin | 1.1.0 | Maven Central | ⏳ |
| 8 | **PHP** | PHP | 1.1.0 | Packagist | ✅ |
| 9 | **C#** | C# | 1.1.0 | NuGet | ⏳ |
| 10 | **Elixir** | Elixir | 1.1.0 | Hex.pm | ⏳ |
| 11 | **Swift** | Swift | 1.1.0 | GitHub tag | ✅ |

## SDK Resource'lar (Tüm Dillerde Mevcut)

| Resource | API | Durum |
|----------|-----|-------|
| Authentication | /v1/auth | ✅ |
| Endpoint | /v1/endpoints | ✅ |
| EventType | /v1/event-type | ✅ |
| Health | /v1/health | ✅ |
| Message | /v1/webhooks | ✅ |
| MessageAttempt | /v1/webhooks/{id}/attempts | ✅ |
| Statistics | /v1/stats | ✅ |
| Environment | /v1/environments | ✅ |
| BackgroundTask | /v1/background-tasks | ✅ |
| OperationalWebhook | /v1/operational-webhooks | ✅ |
| MessagePoller | /v1/message-poller | ✅ |
| Inbound | /v1/inbound | ✅ |
| Connector | /v1/connectors | ✅ |
| Integration | /v1/integrations | ✅ |
| Stream | /v1/stream | ✅ |

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
