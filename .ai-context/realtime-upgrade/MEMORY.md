# Real-Time Upgrade — Hafıza

> Son güncelleme: 2026-05-16 22:10 GMT+8

## Faz Durumları

| Faz | Durum | Not |
|-----|-------|-----|
| Faz 1: React Query + Zod | 🔄 %85 | 31/35 sayfa dönüştürüldü, 4 sayfa eksik |
| Faz 2: Event System + Redis Streams | ✅ Tamamlandı | EventPublisher + Redis Streams |
| Faz 3: WebSocket | ✅ Tamamlandı | WS endpoint + EventBridge |
| Faz 4: Entegrasyon | ✅ Tamamlandı | useWebSocket + useRealtime |
| Faz 5: Optimizasyon | ✅ Tamamlandı | Sentry + VirtualTable + Bundle Analyzer |
| Faz 6: Güvenlik | ✅ Tamamlandı | Token Refresh + WS Metrics + Stress Test |

## React Query Dönüşüm — Güncel Durum (2026-05-16 22:10)

### ✅ React Query Kullanan Sayfalar (31 adet)

**Admin (9):** page, activity, alerts, feature-flags, revenue, settings, system, users, users/[id]

**Dashboard (22):**
DashboardOverview, alerts, applications, applications/[id], **analytics**, **api-keys**, billing, deliveries/DeliveriesList, deliveries/[id], endpoints, endpoints/[id], **health**, inbound, logs, notifications, **rate-limiting**, **retry-policy**, **routing**, **schemas**, **search**, **service-tokens**, sso, team, **templates**, transforms, **audit-log**

### ⚠️ Eksik — Henüz React Query'e Geçirilmemiş (4 sayfa)

| # | Sayfa | Neden Eksik | Not |
|---|-------|------------|-----|
| 1 | portal-customize | 2 API çağrısı (config + embed-code) + form submit | Hook'lar hazır (`usePortalConfig`, `usePortalEmbedCode`, `useUpdatePortalConfig`) |
| 2 | portal-manage | 2 API çağrısı (profile + usage) | Hook'lar hazır (`usePortalProfile`, `usePortalUsage`) |
| 3 | webhook-builder | endpoints listesi + webhook create | Hook'lar hazır (`useEndpoints`, `useCreateWebhook`) |
| 4 | webhooks/webhooks/new | endpoints listesi + webhook create | Hook'lar hazır (`useEndpoints`, `useCreateWebhook`) |

### ⬜ Statik Sayfalar — API Çağrısı Yok (21 adet)
account, api-importer, billing-overview, content-mgmt, core, custom-domain, deliveries, devtools, observability, page, portal-section, routing-config, sandbox, security-section, settings, settings-section, signature-verifier, team-mgmt, webhooks/glossary, webhooks/guides, webhooks

### ⬜ Client-Side Only (1 sayfa)
- **playground** — raw `fetch()` ile user-provided URL'ye test webhook gönderiyor, sunucu API çağrısı yok

## Eklenen Hook'lar (useDashboardData.ts)

### Read Hooks
- `useAuditLogs(params)` — /audit-log
- `useEndpointHealth()` — /endpoint-health, 30s auto-refetch
- `useLatencyTrend(range)` — /analytics/latency
- `useApiKeys()` — /api-keys
- `usePortalConfig()` — /portal/config
- `usePortalEmbedCode()` — /portal/embed-code
- `usePortalProfile()` — /portal/me
- `usePortalUsage()` — /portal/usage
- `useRateLimits()` — /rate-limits
- `useSchemas()` — /schemas
- `useSearch(params)` — /search (debounced)
- `useServiceTokens()` — /service-tokens
- `useTemplates(industry?)` — /templates

### Mutation Hooks
- `useCreateApiKey`, `useDeleteApiKey`, `useRotateApiKey`
- `useUpdatePortalConfig`
- `useSetRateLimit`, `useDeleteRateLimit`
- `useCreateServiceToken`, `useDeleteServiceToken`, `useRevealServiceToken`, `useUpdateServiceToken`
- `useCreateWebhook`

## Eklenen Zod Şemaları (schemas/api.ts)

EndpointHealthSchema, LatencyBucketSchema, LatencyTrendSchema, ApiKeySchema, PortalConfigSchema, PortalEmbedCodeSchema, PortalProfileSchema, PortalUsageSchema, RateLimitSchema, SchemaRegistryItemSchema, SchemaRegistryListSchema, SearchResultSchema, SearchResponseSchema, ServiceTokenSchema, TemplateSchema, TemplateListSchema

## Eklenen API Types + Methods (lib/api.ts)

### Types
ApiKeyResponse, PortalConfigResponse, PortalEmbedCodeResponse, PortalProfileResponse, PortalUsageResponse, RateLimitResponse, SchemaRegistryItem, SchemaRegistryListResponse, SearchResult, SearchResponseData, ServiceTokenResponse, TemplateItem, TemplateListResponse, AuditLogEntryResponse, EndpointHealthResponse

### Methods (api object)
getAuditLog, getEndpointHealth, getApiKeys, createApiKey, deleteApiKey, rotateApiKey, getPortalConfig, getPortalEmbedCode, updatePortalConfig, getPortalProfile, getPortalUsage, getRateLimits, setRateLimit, deleteRateLimit, getSchemas, search, getServiceTokens, createServiceToken, deleteServiceToken, revealServiceToken, updateServiceToken, getTemplates

## Commit Özeti (Bu Oturum)

| Commit | İş |
|--------|-----|
| baff5b44 | audit-log + health sayfaları React Query'e geçirildi |
| 1eaa50cb | 9 sayfa daha geçirildi + 13 read hook + 11 mutation hook + 16 schema + 15 type |

## Sonraki Adımlar

1. portal-customize, portal-manage, webhook-builder, webhooks/new sayfalarını geçir (hook'lar hazır)
2. `node_modules` kurulumu + `tsc --noEmit` TypeScript kontrolü
3. Vercel + Cloud Run deploy kontrolü
4. Faz 6 stress test (k6) — opsiyonel
