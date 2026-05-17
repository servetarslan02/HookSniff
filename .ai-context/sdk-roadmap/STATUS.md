# SDK Durum Tablosu

> Son güncelleme: 2026-05-17 23:36 GMT+8

## Genel Bakış

| # | SDK | Dil | Yöntem | Versiyon | Kalite | Durum |
|---|-----|-----|--------|----------|--------|-------|
| 1 | **Node.js** | TypeScript | Svix'ten adapte | 0.5.0 | %70-75 | ✅ Tamamlandı |
| 2 | **Python** | Python | Svix mimarisi (httpx+attrs+ApiBase) | 0.5.0 | %75-80 | ✅ Tamamlandı |
| 3 | Go | Go | Svix'ten adapte | — | — | ⬜ Sıradaki |
| 4 | Rust | Rust | Svix'ten adapte | — | — | ⬜ Beklemede |
| 5 | Ruby | Ruby | Svix'ten adapte | — | — | ⬜ Beklemede |
| 6 | Java | Java | Svix'ten adapte | — | — | ⬜ Beklemede |
| 7 | Kotlin | Kotlin | Svix'ten adapte | — | — | ⬜ Beklemede |
| 8 | PHP | PHP | Svix'ten adapte | — | — | ⬜ Beklemede |
| 9 | C# | C# | Svix'ten adapte | — | — | ⬜ Beklemede |
| 10 | Swift | Swift | Svix'ten adapte | — | — | ⬜ Beklemede |
| 11 | Elixir | Elixir | Svix'ten adapte | — | — | ⬜ Beklemede |

## Python SDK Detayları
- Mimari: Svix SDK (httpx, attrs, ApiBase pattern)
- Sync + Async destegi
- 12 resource (endpoint, message, auth, api_key, team, alert, analytics, billing, health, search, notification, admin)
- Typed models (dataclass-based)
- webhook verification (standardwebhooks)
- PEP 561 compliant (py.typed)
- Tests: respx mock-based
