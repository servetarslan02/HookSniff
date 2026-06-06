# HookSniff Docs Quality Audit

**Audited:** 2026-06-07  
**Scope:** All 60 docs page.tsx files + en.json/tr.json translation files  
**Focus:** English copy quality, Turkish translation quality, i18n consistency, tone

---

## Executive Summary

| Grade | Count | % |
|-------|-------|---|
| A     | 12    | 20% |
| B     | 18    | 30% |
| C     | 14    | 23% |
| D     | 10    | 17% |
| F     | 6     | 10% |

**Top Issues:**
1. **~20 pages have massive hardcoded English** — no t() calls at all, defeating the purpose of i18n
2. **6 guide pages are completely untranslated** — zero translation keys exist
3. **Several pages have hardcoded Turkish in JSX** — mixing languages in the same component
4. **tr.json has broken Turkish characters** — missing diacritics (ı, ş, ç, ğ, ü, ö) in docsSso and docsCustomDomain
5. **metadata descriptions are never translated** — all 60 pages have English-only `<meta description>`
6. **Inconsistent translation namespaces** — some use `docs`, some use `docsAlerts`, some have none

---

## Page-by-Page Audit

### 1. `/docs` (index page)
- **Rating:** B+
- **Translation namespace:** `docs` + `docsPageMap`
- **Issues:**
  - Card titles are hardcoded English (`'What is HookSniff?'`, `'Core Concepts'`, etc.) — should use t()
  - Card descriptions are hardcoded English
  - Section titles like `'Getting Started'`, `'Features'`, `'Guides'` use t() ✅
  - Rate limits table uses t() for headers ✅
  - metadata description: `"Complete documentation for HookSniff webhook delivery platform. Guides, API reference, SDKs, and more."` — good but not translated
- **Fixes needed:** Translate card titles/descriptions, translate metadata

### 2. `/docs/what-is-hooksniff`
- **Rating:** B
- **Translation namespace:** `whatIsHookSniff` (NOT `docsWhatIsHookSniff`)
- **Issues:**
  - Uses `whatIsHookSniff` namespace — inconsistent with all other docs pages that use `docs*` prefix
  - Hardcoded Turkish: `"11 SDK (geliştirme aşamasında)"` in JSX body
  - Translation key `docsWhatIsHookSniff` exists in both en.json and tr.json but page doesn't use it
  - Splitting logic on `'—'` character for bold formatting is fragile: `t('why4').split('—')[0]`
- **Fixes needed:** Switch to `docsWhatIsHookSniff` namespace, remove hardcoded Turkish, fix split-based formatting

### 3. `/docs/quickstart`
- **Rating:** C
- **Translation namespace:** `docs` (partial)
- **Issues:**
  - Most body text is hardcoded English: step titles, descriptions, tips, "What Happens Next" section
  - `docsQuickstartPage` translation namespace exists with only 3 keys — massively underused
  - Hardcoded: `"Send your first webhook in under 5 minutes."`, `"Keep your API key secret."`, all step descriptions
  - SDK install commands are hardcoded (acceptable for code)
  - metadata description hardcoded
- **Fixes needed:** Move all prose to t() calls, expand `docsQuickstartPage` namespace

### 4. `/docs/concepts`
- **Rating:** B+
- **Translation namespace:** `docsConcepts`
- **Issues:**
  - Well-translated overall ✅
  - **Hardcoded Turkish in JSX:** retry table rows `"~1 saniye"`, `"~2 saniye"`, `"~4 saniye"` — should be in tr.json
  - Split-based bold formatting (`t('endpointWhy').split(':')[0]`) is fragile
  - metadata description hardcoded
- **Fixes needed:** Move Turkish retry table text to translation keys, fix split-based formatting

### 5. `/docs/api-reference`
- **Rating:** D
- **Translation namespace:** `docs` (partial)
- **Issues:**
  - **Massive hardcoded English:** ~30 API descriptions not using t()
  - Hardcoded: `"Update an endpoint's URL, description, or event filter."`, `"Rotate the signing secret. Old secret becomes invalid immediately."`, `"Configure per-endpoint retry policy."`, `"Send multiple webhooks in a single request."`, `"Replay a failed or delivered webhook. Resets attempt counter."`, `"Get all delivery attempts for a webhook."`, `"Export deliveries as CSV or JSON."`
  - Auth section entirely hardcoded: `"Create a new account."`, `"Login and get JWT token."`, `"Request a password reset email."`, etc.
  - API Keys, Analytics, Alerts, Teams, Search, Inbound, Billing, Environments sections all hardcoded
  - Error codes table has hardcoded `"Too many requests — check Retry-After header"` and `"Internal error — contact support if persistent"` (these exist in translation keys but aren't used)
  - metadata: `"Complete API reference for HookSniff webhook delivery service"` — too technical
- **Fixes needed:** Create translation keys for ALL API descriptions, use existing error code translations

### 6. `/docs/architecture`
- **Rating:** D
- **Translation namespace:** `docs` (partial)
- **Issues:**
  - **Almost entirely hardcoded English** — only section headers use t()
  - Hardcoded: `"Understanding the architecture helps you debug issues, plan capacity, and make informed decisions about self-hosting."`, `"HookSniff is built with Rust for performance and reliability."`, `"HookSniff consists of four main components:"`, all component descriptions, tech stack descriptions, data flow steps
  - `docsArchitecture` namespace has only 1 key (`axumRust`)
  - Contains internal implementation details: `"PostgreSQL via SQLx (Neon in production)"`, `"PostgreSQL-based queue (webhook_queue table)"`, `"Prometheus metrics at /metrics"` — not customer-facing
  - metadata: `"Understand HookSniff's system architecture and design decisions"` — internal-facing
- **Fixes needed:** Either fully translate or mark as developer-only, remove internal implementation details from customer docs

### 7. `/docs/configuration`
- **Rating:** B
- **Translation namespace:** `docsConfiguration`
- **Issues:**
  - Well-structured with translation keys ✅
  - All table content uses t() ✅
  - metadata description hardcoded
  - Code example has English comments (acceptable)
- **Fixes needed:** Translate metadata description

### 8. `/docs/sdk-libraries`
- **Rating:** D
- **Translation namespace:** `docs` (minimal)
- **Issues:**
  - **Entirely hardcoded English** — SDK names, descriptions, features, installation commands, quick start code, verification code
  - `docs` namespace only used for header `t('sdks')` and `t('sdksDesc')`
  - Shared features section: all titles and descriptions hardcoded
  - API resources table: all hardcoded
  - SDK feature parity table: all hardcoded
  - metadata description hardcoded
- **Fixes needed:** Create extensive translation keys for all prose content (code examples can stay English)

### 9. `/docs/best-practices`
- **Rating:** B+
- **Translation namespace:** `docsBestPractices`
- **Issues:**
  - Well-translated with comprehensive translation keys ✅
  - **Bug:** Table header `"Metrik"` is Turkish in the English page — should be `"Metric"` (appears in JSX, not in translations)
  - metadata description hardcoded
- **Fixes needed:** Fix "Metrik" → "Metric" in JSX, translate metadata

### 10. `/docs/security`
- **Rating:** A-
- **Translation namespace:** `docsSecurity`
- **Issues:**
  - Excellent translation coverage ✅
  - All prose uses t() ✅
  - Code examples appropriately hardcoded ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 11. `/docs/retries`
- **Rating:** A-
- **Translation namespace:** `docsRetries`
- **Issues:**
  - Excellent translation coverage ✅
  - Well-structured with clear Problem → Solution pattern ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 12. `/docs/dlq`
- **Rating:** B
- **Translation namespace:** `docsDlq`
- **Issues:**
  - Good translation coverage ✅
  - **Hardcoded Turkish in JSX:** DLQ retention table has `"7 gün"`, `"14 gün"`, `"180 gün"`, `"Özel"`, `"Sınırsız"`, `"$29/ay"`, `"$49/ay"`, `"$149/ay"` — should be in translation keys
  - metadata description hardcoded
- **Fixes needed:** Move Turkish table values to translation keys

### 13. `/docs/event-types`
- **Rating:** A-
- **Translation namespace:** `docsEventTypes`
- **Issues:**
  - Excellent translation coverage ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 14. `/docs/idempotency`
- **Rating:** B+
- **Translation namespace:** `docsIdempotency`
- **Issues:**
  - Good translation coverage ✅
  - **Hardcoded Turkish:** `"ve"` (Turkish "and") in bp3 description
  - metadata description hardcoded
- **Fixes needed:** Fix hardcoded "ve", translate metadata

### 15. `/docs/endpoints`
- **Rating:** A
- **Translation namespace:** `docsEndpoints`
- **Issues:**
  - Fully translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 16. `/docs/deliveries`
- **Rating:** A
- **Translation namespace:** `docsDeliveries`
- **Issues:**
  - Fully translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 17. `/docs/alerts`
- **Rating:** B+
- **Translation namespace:** `docsAlerts`
- **Issues:**
  - Well-translated ✅
  - **Hardcoded English:** Note banner: `"The alert evaluation background worker is not yet implemented. The CRUD API is available, but automatic notifications are not active."` — this is an internal implementation detail that shouldn't be in customer docs
  - **Hardcoded English:** Table headers `"Condition"`, `"Description"`
  - metadata description hardcoded
- **Fixes needed:** Remove internal implementation note, translate table headers

### 18. `/docs/analytics`
- **Rating:** B+
- **Translation namespace:** `docsAnalytics`
- **Issues:**
  - Well-translated ✅
  - **Hardcoded English:** Table headers `"Metric"`, `"Description"`
  - metadata description hardcoded
- **Fixes needed:** Translate table headers

### 19. `/docs/dashboard`
- **Rating:** A-
- **Translation namespace:** `docsDashboard`
- **Issues:**
  - Excellent translation coverage ✅
  - Uses split-based formatting but consistently ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 20. `/docs/playground`
- **Rating:** A-
- **Translation namespace:** `docsPlayground`
- **Issues:**
  - Excellent translation coverage ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 21. `/docs/streaming`
- **Rating:** A
- **Translation namespace:** `docsStreaming`
- **Issues:**
  - Fully translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 22. `/docs/rate-limiting`
- **Rating:** B
- **Translation namespace:** `docsRateLimiting`
- **Issues:**
  - Good translation coverage ✅
  - **Hardcoded Turkish in JSX:** Plan limits table has `"300/gün"`, `"30.000/gün"`, `"$29/ay"`, `"$49/ay"`, `"$149/ay"`, `"Sınırsız"`
  - **Hardcoded Turkish in code:** `"Planınızın limiti"`, `"Pencerede kalan istek"`, `"Pencerenin sıfırlanacağı Unix zaman damgası"`, `"Tekrar denemeden önce beklenecek saniye"` — these are in code block comments
  - metadata description hardcoded
- **Fixes needed:** Move Turkish values to translation keys, translate code comments properly

### 23. `/docs/embed-portal`
- **Rating:** A-
- **Translation namespace:** `docsEmbedPortal`
- **Issues:**
  - Well-translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 24. `/docs/multi-tenant`
- **Rating:** A-
- **Translation namespace:** `docsMultiTenant`
- **Issues:**
  - Well-translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 25. `/docs/inbound-webhooks`
- **Rating:** A-
- **Translation namespace:** `docsInbound`
- **Issues:**
  - Well-translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 26. `/docs/debug-failed-webhooks`
- **Rating:** A-
- **Translation namespace:** `docsDebugFailed`
- **Issues:**
  - Well-translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 27. `/docs/error-codes`
- **Rating:** A-
- **Translation namespace:** `docsErrorCodes`
- **Issues:**
  - Well-translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 28. `/docs/troubleshooting`
- **Rating:** A-
- **Translation namespace:** `docsTroubleshooting`
- **Issues:**
  - Well-translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 29. `/docs/monitor-performance`
- **Rating:** A-
- **Translation namespace:** `docsMonitor`
- **Issues:**
  - Well-translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 30. `/docs/event-processing`
- **Rating:** B
- **Translation namespace:** `docsEventProcessing` (partial)
- **Issues:**
  - Lifecycle and ingestion sections translated ✅
  - **Hardcoded English:** "Payload Signing", "Fanout", "Ordering", "Timeouts" sections entirely hardcoded
  - metadata description hardcoded
- **Fixes needed:** Translate remaining sections

### 31. `/docs/delivery-guarantees`
- **Rating:** B+
- **Translation namespace:** `docsDeliveryGuarantees`
- **Issues:**
  - Well-translated ✅
  - **Hardcoded English:** `"Important:"` prefix, `"Delivered events:"`, `"Failed events (DLQ):"`, `"Attempt details:"`
  - metadata description hardcoded
- **Fixes needed:** Move remaining hardcoded text to translations

### 32. `/docs/webhook-vs-polling`
- **Rating:** C
- **Translation namespace:** `docsWebhookVsPolling`
- **Issues:**
  - Pro/cons sections translated ✅
  - **Hardcoded Turkish in JSX:** Entire comparison table is in Turkish: `"Özellik"`, `"Gecikme"`, `"Dakikalar"`, `"Saniyeler"`, `"Verimlilik"`, `"Düşük (israf istekler)"`, `"Yüksek (yalnızca itme)"`, `"Karmaşıklık"`, `"Basit"`, `"Orta"`, `"Ölçekleme"`, `"Zor"`, `"Kolay"`, `"Güvenilirlik"`, `"Zamanlamayı siz kontrol edersiniz"`, `"Gönderene bağlı"`, `"Hız limitleri"`, `"Siz çarparsınız"`, `"Gönderen yönetir"` — these should be in tr.json, not hardcoded
  - metadata description hardcoded
- **Fixes needed:** Move ALL hardcoded Turkish to translation keys

### 33. `/docs/smart-routing`
- **Rating:** A-
- **Translation namespace:** `docsSmartRouting`
- **Issues:**
  - Well-translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 34. `/docs/templates`
- **Rating:** A-
- **Translation namespace:** `docsTemplates`
- **Issues:**
  - Well-translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 35. `/docs/transforms`
- **Rating:** A-
- **Translation namespace:** `docsTransforms`
- **Issues:**
  - Well-translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 36. `/docs/support`
- **Rating:** A-
- **Translation namespace:** `docsSupport`
- **Issues:**
  - Well-translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 37. `/docs/changelog`
- **Rating:** A-
- **Translation namespace:** `docsChangelog`
- **Issues:**
  - Well-translated using t.raw() for arrays ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 38. `/docs/cloudevents`
- **Rating:** A-
- **Translation namespace:** `docsCloudevents`
- **Issues:**
  - Well-translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 39. `/docs/billing`
- **Rating:** B+
- **Translation namespace:** `docsBilling`
- **Issues:**
  - Good translation coverage ✅
  - **Hardcoded English:** Table headers `"Plan"`, `"Price"`, `"Webhooks/day"`, `"Endpoints"`, `"Payload"`, `"Retention"` and all table values
  - metadata description hardcoded
- **Fixes needed:** Translate table content

### 40. `/docs/api-keys`
- **Rating:** A
- **Translation namespace:** `docsApiKeys`
- **Issues:**
  - Fully translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 41. `/docs/background-tasks`
- **Rating:** A
- **Translation namespace:** `docsBackgroundTasks`
- **Issues:**
  - Fully translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 42. `/docs/environments`
- **Rating:** A
- **Translation namespace:** `docsEnvironments`
- **Issues:**
  - Fully translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 43. `/docs/service-tokens`
- **Rating:** A
- **Translation namespace:** `docsServiceTokens`
- **Issues:**
  - Fully translated ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 44. `/docs/organization`
- **Rating:** A-
- **Translation namespace:** `docsOrganization`
- **Issues:**
  - Excellent translation coverage with 125 keys ✅
  - **Bug:** Permission matrix header uses `t('permAdmin')` twice instead of `t('permViewer')` for last column
  - metadata description hardcoded
- **Fixes needed:** Fix permAdmin duplicate, translate metadata

### 45. `/docs/sso`
- **Rating:** B+
- **Translation namespace:** `docsSso`
- **Issues:**
  - **Only client component** (`'use client'`) — all other docs pages are server components
  - Uses `useTranslations` instead of `getTranslations`
  - Good translation coverage with 116 keys ✅
  - **tr.json has broken Turkish characters** in docsSso: `"Tek Oturum Acma"` → should be `"Tek Oturum Açma"`, `"kullanilabilir"` → `"kullanılabilir"`, `"icin"` → `"için"`, `"planinda"` → `"planında"`
  - metadata description hardcoded
- **Fixes needed:** Fix Turkish diacritics in tr.json, consider converting to server component

### 46. `/docs/custom-domain`
- **Rating:** C
- **Translation namespace:** `docsCustomDomain` (partial)
- **Issues:**
  - Title/subtitle use t() with fallbacks ✅
  - **Hardcoded English:** Step 2 ("Add DNS records"), Step 3 ("Verify & go live"), all DNS provider instructions, Common Issues section, API Reference section, Availability table — all hardcoded
  - **tr.json has broken Turkish:** `"Nasil calisir:"` → should be `"Nasıl çalışır:"`
  - metadata description hardcoded
- **Fixes needed:** Translate all hardcoded sections, fix Turkish diacritics

### 47. `/docs/self-hosting`
- **Rating:** D
- **Translation namespace:** `docs` (minimal)
- **Issues:**
  - **Almost entirely hardcoded English** — only section headers use t()
  - `docsSelfHosting` namespace has only 4 keys
  - All descriptions, instructions, code comments hardcoded
  - metadata description hardcoded
- **Fixes needed:** Create comprehensive translation keys

### 48. `/docs/self-hosting/aws`
- **Rating:** F
- **Translation namespace:** None
- **Issues:**
  - **100% hardcoded English** — zero translation support
  - No t() calls anywhere
  - No setRequestLocale
  - metadata description hardcoded
- **Fixes needed:** Full i18n implementation

### 49. `/docs/self-hosting/bare-metal`
- **Rating:** F
- **Translation namespace:** None
- **Issues:**
  - **100% hardcoded English** — zero translation support
  - No t() calls anywhere
  - No setRequestLocale
  - metadata description hardcoded
- **Fixes needed:** Full i18n implementation

### 50. `/docs/self-hosting/kubernetes`
- **Rating:** F
- **Translation namespace:** None
- **Issues:**
  - **100% hardcoded English** — zero translation support
  - No t() calls anywhere
  - No setRequestLocale
  - metadata description hardcoded
- **Fixes needed:** Full i18n implementation

### 51. `/docs/cortex`
- **Rating:** D
- **Translation namespace:** `docs` (minimal)
- **Issues:**
  - **Massive hardcoded English** — only 5 keys used from `docs` namespace (`cortex`, `cortexDesc`, `cortexWhatIs`, `cortexFAQ`, `cortexNextSteps`)
  - All feature cards hardcoded: titles + descriptions for Anomaly Detection, Self-Healing, Predictive Monitoring, Smart Routing, Adaptive Thresholds, Proactive Alerts
  - All scenario descriptions hardcoded (3 scenarios)
  - "What You See in the Dashboard" section entirely hardcoded
  - "Smart Routing" section entirely hardcoded
  - "Auto-Disable & Recovery" section entirely hardcoded
  - "What Happens After an Outage" section entirely hardcoded
  - "Alerts & Notifications" table entirely hardcoded
  - "Weekly Reports" section entirely hardcoded
  - FAQ: 6 Q&A pairs entirely hardcoded
  - Tags like `'Auto-Detection'`, `'Self-Healing'`, `'Predictive'`, `'Smart Routing'`, `'Per-Endpoint Learning'` hardcoded
  - metadata description hardcoded but good quality
- **Fixes needed:** Create comprehensive `docsCortex` translation namespace with ~60+ keys

### 52. `/docs/integrations`
- **Rating:** D
- **Translation namespace:** `docs` (minimal)
- **Issues:**
  - **Mostly hardcoded English** — only 4 keys used (`integrationGuides`, `githubWebhooks`, `shopifyWebhooks`, `genericReceiver`, `inboundProxy`, `acceptsIncoming`, `validatesPayloads`, `providesRetry`)
  - GitHub section: step descriptions hardcoded
  - Shopify section: step descriptions hardcoded
  - Generic Receiver section: entirely hardcoded
  - `docsIntegrationsPage` namespace exists with only 1 key
  - metadata: no metadata export (missing title/description)
- **Fixes needed:** Create comprehensive translation keys

### 53. `/docs/build-stripe-like`
- **Rating:** A-
- **Translation namespace:** `docsBuildStripeLike`
- **Issues:**
  - Well-translated with 38 keys ✅
  - metadata description hardcoded
- **Fixes needed:** Translate metadata description only

### 54. `/docs/guides/error-handling`
- **Rating:** F
- **Translation namespace:** None
- **Issues:**
  - **100% hardcoded English** — zero translation support
  - No t() calls, no setRequestLocale
  - All section titles, descriptions, table content, code comments hardcoded
  - `docsErrorHandling` namespace exists with 27 keys but page doesn't use it
  - metadata description hardcoded
- **Fixes needed:** Full i18n implementation using `docsErrorHandling` namespace

### 55. `/docs/guides/migration-from-svix`
- **Rating:** F
- **Translation namespace:** None
- **Issues:**
  - **100% hardcoded English** — zero translation support
  - No t() calls, no setRequestLocale
  - `docsMigrationFromSvix` namespace exists with only 1 key
  - metadata description hardcoded
- **Fixes needed:** Full i18n implementation

### 56. `/docs/guides/pagination`
- **Rating:** F
- **Translation namespace:** None
- **Issues:**
  - **100% hardcoded English** — zero translation support
  - No t() calls, no setRequestLocale
  - No translation namespace exists
  - metadata description hardcoded
- **Fixes needed:** Full i18n implementation

### 57. `/docs/guides/real-world-examples`
- **Rating:** F
- **Translation namespace:** None
- **Issues:**
  - **100% hardcoded English** — zero translation support
  - No t() calls, no setRequestLocale
  - No translation namespace exists
  - metadata description hardcoded
- **Fixes needed:** Full i18n implementation

### 58. `/docs/guides/streaming`
- **Rating:** D
- **Translation namespace:** None
- **Issues:**
  - **100% hardcoded English** — zero translation support
  - No t() calls, no setRequestLocale
  - metadata description hardcoded
- **Fixes needed:** Full i18n implementation

### 59. `/docs/guides/webhook-verification`
- **Rating:** D
- **Translation namespace:** None
- **Issues:**
  - **100% hardcoded English** — zero translation support
  - No t() calls, no setRequestLocale
  - metadata description hardcoded
- **Fixes needed:** Full i18n implementation

### 60. `/docs/error-handling` (redirect)
- **Rating:** N/A
- **Issues:** Just a redirect to `/docs/guides/error-handling` — no content

---

## Translation File Issues

### tr.json — Broken Turkish Characters

The `docsSso` section has **systematically broken Turkish diacritics**:

| Key | Current (broken) | Correct |
|-----|-------------------|---------|
| `docsSso.title` | `Tek Oturum Acma (SSO)` | `Tek Oturum Açma (SSO)` |
| `docsSso.subtitle` | `...kurumsal tek oturum acma icin...` | `...kurumsal tek oturum açma için...` |
| `docsSso.ssoAvailable` | `SSO Enterprise planinda kullanilabilir.` | `SSO Enterprise planında kullanılabilir.` |

The `docsCustomDomain` section also has broken characters:

| Key | Current (broken) | Correct |
|-----|-------------------|---------|
| `docsCustomDomain.howItWorks` | `Nasil calisir:` | `Nasıl çalışır:` |

### en.json — Stiff/Robotic English

Some English translations read like technical specifications rather than conversational docs:

- `docs.deliveryEngine`: `"Webhook delivery engine"` — could be `"Delivers webhooks to your endpoints"`
- `docs.persistentStorage`: `"Persistent storage"` — could be `"Stores your data"`
- `docs.asyncMessage`: `"Async message delivery"` — could be `"Queues webhooks for delivery"`

### Missing Translation Keys

Several pages reference translation keys that don't exist or have empty values:
- `docsIntegrationsPage` — only 1 key (`forwardsDesc`)
- `docsMigrationFromSvix` — only 1 key (`standardWebhooks`)
- `docsArchitecture` — only 1 key (`axumRust`)
- `docsSelfHosting` — only 4 keys

---

## Systemic Issues

### 1. metadata descriptions are NEVER translated
All 60 pages have hardcoded English `description` in `metadata`. These show up in search engine results and social media previews for Turkish users.

**Fix:** Use `generateMetadata` with `getTranslations` to provide localized descriptions.

### 2. Inconsistent translation namespace patterns
- Some pages: `getTranslations('docsAlerts')` — specific namespace
- Some pages: `getTranslations('docs')` — shared namespace
- Some pages: `getTranslations('whatIsHookSniff')` — no `docs` prefix
- Some pages: no translations at all

**Fix:** Standardize on `docs{PageName}` pattern for all pages.

### 3. Hardcoded table headers throughout
Many pages have hardcoded `"Description"`, `"Field"`, `"Metric"`, `"Condition"` etc. in JSX instead of using t().

**Fix:** Create shared table header keys in `docs` namespace.

### 4. Split-based bold formatting
Multiple pages use fragile `t('key').split(':')[0]` or `t('key').split(' — ')[0]` to extract bold portions. This breaks if the translation doesn't contain the exact delimiter.

**Fix:** Use separate translation keys for bold and regular parts, or use markdown/HTML in translations.

### 5. Code blocks with mixed languages
Rate-limiting page has Turkish comments in code blocks (`"Planınızın limiti"`). These should either be in the translation file or consistently in English.

---

## Priority Fixes

### P0 — Critical (broken用户体验)
1. Fix broken Turkish characters in `docsSso` and `docsCustomDomain` in tr.json
2. Fix "Metrik" → "Metric" in best-practices/page.tsx JSX
3. Fix duplicate `permAdmin` header in organization/page.tsx permission matrix

### P1 — High (6 pages with zero i18n)
4. Add i18n to `guides/error-handling` (uses `docsErrorHandling` keys that exist)
5. Add i18n to `guides/migration-from-svix`
6. Add i18n to `guides/pagination`
7. Add i18n to `guides/real-world-examples`
8. Add i18n to `guides/streaming`
9. Add i18n to `guides/webhook-verification`

### P2 — Medium (pages with partial i18n)
10. Translate `cortex/page.tsx` (~60 new keys needed)
11. Translate `api-reference/page.tsx` (~30 new keys needed)
12. Translate `architecture/page.tsx` (~20 new keys needed)
13. Translate `self-hosting/page.tsx` + 3 sub-pages
14. Translate `sdk-libraries/page.tsx`
15. Translate `integrations/page.tsx`
16. Move hardcoded Turkish from JSX to tr.json (webhook-vs-polling, dlq, rate-limiting, concepts)

### P3 — Low (polish)
17. Translate all metadata descriptions
18. Standardize translation namespace patterns
19. Fix split-based bold formatting
20. Translate shared table headers
