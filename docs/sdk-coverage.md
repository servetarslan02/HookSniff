# SDK Coverage Report

> Last updated: 2026-06-06

## Summary

| SDK | Language | Status | Notes |
|-----|----------|--------|-------|
| Node.js | TypeScript | ⚠️ Scaffold only | `sdks/node/` — dependencies only, no source |
| Python | Python | 📋 Planned | Generate from OpenAPI spec |
| Go | Go | 📋 Planned | Generate from OpenAPI spec |
| Rust | Rust | 📋 Planned | Generate from OpenAPI spec |
| Java | Java | 📋 Planned | Generate from OpenAPI spec |
| Kotlin | Kotlin | ✅ Available | v0.5.0 — hooksniff-kotlin |
| Ruby | Ruby | 📋 Planned | Generate from OpenAPI spec |
| PHP | PHP | 📋 Planned | Generate from OpenAPI spec |
| C# | C# | 📋 Planned | Generate from OpenAPI spec |
| Elixir | Elixir | 📋 Planned | Generate from OpenAPI spec |
| Swift | Swift | 📋 Planned | Generate from OpenAPI spec |

## Current State

**None of the 11 SDKs have production-ready source code in this repository.** The previous OpenAPI-generated files in `.cleanup/` were removed during a repository cleanup.

The `sdks/node/` directory contains only `node_modules/` and `package-lock.json` — no actual SDK source code.

## What Needs to Happen

1. **Generate all 11 SDKs** from `docs/openapi.yaml` using OpenAPI Generator
2. **Add package files** for each (package.json, setup.py, go.mod, Cargo.toml, etc.)
3. **Add tests** — integration tests for each SDK
4. **Publish** to package registries (npm, PyPI, crates.io, Maven Central, NuGet, Hex, Packagist, RubyGems, Swift Package Index)

## API Modules (30+)

| # | Module | Route |
|---|--------|-------|
| 1 | Auth | `/v1/auth` |
| 2 | Endpoints | `/v1/endpoints` |
| 3 | Webhooks | `/v1/webhooks` |
| 4 | Deliveries | `/v1/deliveries` |
| 5 | Analytics | `/v1/analytics` |
| 6 | API Keys | `/v1/api-keys` |
| 7 | Billing | `/v1/billing` |
| 8 | Admin | `/v1/admin` |
| 9 | Cortex | `/v1/cortex` |
| 10 | Security | `/v1/admin/security` |
| 11 | Alerts | `/v1/alerts` |
| 12 | Teams | `/v1/teams` |
| 13 | SSO | `/v1/sso` |
| 14 | Notifications | `/v1/notifications` |
| 15 | Templates | `/v1/templates` |
| 16 | Schemas | `/v1/schemas` |
| 17 | Transforms | `/v1/endpoints/{id}/transforms` |
| 18 | Inbound | `/v1/inbound` |
| 19 | Stream | `/v1/stream` |
| 20 | Routing | `/v1/routing` |
| 21 | Playground | `/v1/playground` |
| 22 | Simulator | `/v1/simulator` |
| 23 | Contact | `/v1/contact` |
| 24 | Health | `/v1/health` |
| 25 | OAuth | `/v1/oauth` |

## API Module List (33 total)

These are the API modules that SDKs should cover:

| # | Module | Route |
|---|--------|-------|
| 1 | Admin | `/v1/admin` |
| 2 | Alerts | `/v1/alerts` |
| 3 | Analytics | `/v1/analytics` |
| 4 | API Keys | `/v1/api-keys` |
| 5 | Auth | `/v1/auth` |
| 6 | Billing | `/v1/billing` |
| 7 | Contact | `/v1/contact` |
| 8 | Customer Portal | `/v1/portal` |
| 9 | Delivery Details | `/v1/webhooks/{id}/details` |
| 10 | Devices | `/v1/devices` |
| 11 | Embed | `/v1/embed` |
| 12 | Endpoints | `/v1/endpoints` |
| 13 | Events | `/v1/events` |
| 14 | Health | `/v1/health` |
| 15 | Inbound | `/v1/inbound` |
| 16 | Notifications | `/v1/notifications` |
| 17 | OAuth | `/v1/oauth` |
| 18 | Outbound IPs | `/v1/outbound-ips` |
| 19 | Playground | `/v1/playground` |
| 20 | Routing | `/v1/routing` |
| 21 | Schemas | `/v1/schemas` |
| 22 | Search | `/v1/search` |
| 23 | Simulator | `/v1/simulator` |
| 24 | SSO | `/v1/sso` |
| 25 | Stats | `/v1/stats` |
| 26 | Stream | `/v1/stream` |
| 27 | Teams | `/v1/teams` |
| 28 | Templates | `/v1/templates` |
| 29 | Transforms | `/v1/endpoints/{id}/transforms` |
| 30 | Webhooks | `/v1/webhooks` |

## API Module List (33 total)

| # | Module | Route | Python | Go | Ruby | Rust | C# | Elixir | PHP | Node | Java | Swift | Kotlin |
|---|--------|-------|--------|-----|------|------|-----|--------|-----|------|------|-------|--------|
| 1 | Admin | `/v1/admin` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 2 | Alerts | `/v1/alerts` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 3 | Analytics | `/v1/analytics` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 4 | API Keys | `/v1/api-keys` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 5 | Audit Log | `/v1/audit-log` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 6 | Auth | `/v1/auth` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 7 | Billing | `/v1/billing` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 8 | Contact | `/v1/contact` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 9 | Custom Domains | `/v1/custom-domains` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 10 | Customer Portal | `/v1/portal` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 11 | Delivery Details | `/v1/webhooks` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 12 | Devices | `/v1/devices` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 13 | Embed | `/v1/embed` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 14 | Endpoints | `/v1/endpoints` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 15 | Events | `/v1/events` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 16 | Health | `/v1/health` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 17 | Inbound | `/v1/inbound` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 18 | Notifications | `/v1/notifications` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 19 | OAuth | `/v1/oauth` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 20 | Outbound IPs | `/v1/outbound-ips` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 21 | Playground | `/v1/playground` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 22 | Rate Limits | `/v1/rate-limits` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 23 | Routing | `/v1/routing` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 24 | Schemas | `/v1/schemas` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 25 | Search | `/v1/search` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 26 | Simulator | `/v1/simulator` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 27 | SSO | `/v1/sso` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 28 | Stats | `/v1/stats` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 29 | Stream (WebSocket) | `/v1/stream` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 30 | Teams | `/v1/teams` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 31 | Templates | `/v1/templates` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 32 | Transforms | `/v1/endpoints/{id}/transforms` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 33 | Webhooks | `/v1/webhooks` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

## High-Level vs Low-Level SDKs

**OpenAPI-generated (full coverage):** Python, Go, Ruby, Rust, C#, Elixir, PHP
- Generated from `docs/openapi.yaml` using OpenAPI Generator
- Include both API classes and model classes
- Full coverage of all 33 API modules

**Hand-crafted (partial coverage):** Node.js, Java, Swift
- Only 10 "core" modules implemented as high-level resources
- The 10 covered modules: Alerts, Analytics, API Keys, Auth, Billing, Endpoints, Health, Search, Teams, Webhooks
- Also include Webhook verification utility

**Models only:** Kotlin
- Only auto-generated model/data classes (100+ models)
- No API client classes — users must make raw HTTP calls

## Missing Modules (23 in Node.js, Java, Swift)

The following modules are missing from the hand-crafted SDKs:

### Priority 1 — Common use cases
1. **Delivery Details** — view webhook delivery attempts
2. **Events** — event log and replay
3. **Notifications** — notification preferences
4. **Rate Limits** — per-endpoint rate limit config

### Priority 2 — Advanced features
5. **Admin** — admin user management (internal use)
6. **Audit Log** — compliance audit trail
7. **Customer Portal** — account management
8. **Devices** — push notification devices
9. **OAuth** — OAuth provider config
10. **Outbound IPs** — IP allowlist info
11. **Playground** — webhook testing
12. **Routing** — traffic routing rules
13. **Schemas** — schema registry
14. **Simulator** — webhook simulation
15. **SSO** — SAML/OIDC config
16. **Stats** — usage statistics
17. **Stream** — WebSocket streaming
18. **Templates** — webhook templates
19. **Transforms** — payload transforms

### Priority 3 — Utility
20. **Contact** — contact form
21. **Custom Domains** — domain management
22. **Embed** — embedded portal
23. **Inbound** — inbound webhook receiver

## SDK Auto-Update System (Item 354)

The 7 full-coverage SDKs (Python, Go, Ruby, Rust, C#, Elixir, PHP) are generated from the OpenAPI spec at `docs/openapi.yaml` using OpenAPI Generator. To regenerate:

```bash
# Regenerate all SDKs from the OpenAPI spec
openapi-generator generate -i docs/openapi.yaml -g python -o sdks/python
openapi-generator generate -i docs/openapi.yaml -g go -o sdks/go
# ... etc
```

The hand-crafted SDKs (Node.js, Java, Swift) are maintained manually and need to be updated when new API endpoints are added.

### Recommendation

1. **Short-term:** Add the 4 Priority 1 modules to Node.js, Java, and Swift SDKs
2. **Medium-term:** Migrate Node.js, Java, and Swift to OpenAPI-generated clients with hand-crafted wrappers
3. **Long-term:** Add Kotlin API classes (currently models-only)
