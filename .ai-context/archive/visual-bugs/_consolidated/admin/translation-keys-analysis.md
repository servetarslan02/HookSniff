# Translation Keys Deep Audit Report

**Generated:** 2026-05-10  
**Project:** HookSniff Dashboard (next-intl)  
**Configured locales:** `en`, `tr`, `de`, `ja`, `pt-BR`, `es`, `fr`, `ko`  
**Default locale:** `en`

---

## 📊 Summary

| Metric | Value |
|--------|-------|
| Total locales | 8 |
| EN key count | 983 |
| TR key count | 983 (✅ complete) |
| DE/ES/FR/JA/KO/PT-BR key count | 894 each (❌ **89 keys missing**) |
| Empty values | 0 |
| Placeholder mismatches | 1 |

### Per-Locale Translation Completeness

| Locale | Keys Present | Missing Keys | Untranslated (same as EN) | Completion |
|--------|-------------|-------------|--------------------------|------------|
| en | 983 | — | — | 100% |
| tr | 983 | 0 | 33 (mostly technical terms) | **100%** ✅ |
| de | 894 | 89 | ~511 | ~48% |
| es | 894 | 89 | ~506 | ~49% |
| fr | 894 | 89 | ~504 | ~49% |
| ja | 894 | 89 | ~493 | ~50% |
| ko | 894 | 89 | ~493 | ~50% |
| pt-BR | 894 | 89 | ~507 | ~48% |

---

## ❌ Eksik Key'ler (Missing Keys)

**89 keys** are present in `en.json` but missing from ALL 6 non-EN/TR locales (`de`, `es`, `fr`, `ja`, `ko`, `pt-BR`).

### `getStarted.*` Section (56 keys)

All 6 locales are missing the entire `getStarted` section keys:

| Key | EN Value |
|-----|----------|
| `getStarted.title` | Get Started with HookSniff |
| `getStarted.subtitle` | Send your first webhook in under 5 minutes... |
| `getStarted.heroBadge` | Free tier — no credit card required |
| `getStarted.freeForever` | Free forever |
| `getStarted.elevenSdks` | 11 SDKs |
| `getStarted.noCreditCard` | No credit card |
| `getStarted.fiveMinSetup` | 5 min setup |
| `getStarted.step1Title` | Create your account |
| `getStarted.step1Desc` | Sign up for free — no credit card required... |
| `getStarted.createFreeAccount` | Create Free Account |
| `getStarted.signedInAs` | Signed in as |
| `getStarted.step2Title` | Get your API key |
| `getStarted.step2Desc` | Your API key authenticates requests... |
| `getStarted.yourApiKey` | Your API Key |
| `getStarted.manageKeys` | Manage keys |
| `getStarted.show` | Show |
| `getStarted.hide` | Hide |
| `getStarted.keepSecret` | Keep your API key secret... |
| `getStarted.step3Title` | Install the SDK |
| `getStarted.step3Desc` | Choose your language and install the SDK... |
| `getStarted.install` | Install |
| `getStarted.quickstart` | Quickstart |
| `getStarted.step4Title` | Create an endpoint |
| `getStarted.step4Desc` | An endpoint is a URL where HookSniff delivers... |
| `getStarted.viaDashboard` | Via Dashboard |
| `getStarted.viaDashboardDesc` | Go to Endpoints → click Create Endpoint... |
| `getStarted.viaApi` | Via API |
| `getStarted.viaApiDesc` | Use the SDK code from Step 3... |
| `getStarted.tipPlayground` | Tip: Use HookSniff Playground to test webhooks... |
| `getStarted.step5Title` | Send your first webhook |
| `getStarted.step5Desc` | Now let's send a test webhook... |
| `getStarted.testWebhook` | Test Webhook |
| `getStarted.tryPlayground` | Try Playground |
| `getStarted.viewDeliveries` | View Deliveries |
| `getStarted.step6Title` | Monitor deliveries & go live |
| `getStarted.step6Desc` | Track every webhook delivery in real-time... |
| `getStarted.realtimeDashboard` | Real-time Dashboard |
| `getStarted.realtimeDashboardDesc` | Success rates, latency, throughput |
| `getStarted.autoRetries` | Auto Retries |
| `getStarted.autoRetriesDesc` | Exponential backoff, configurable |
| `getStarted.alerts` | Alerts |
| `getStarted.alertsDesc` | Get notified on failures |
| `getStarted.openDashboard` | Open Dashboard |
| `getStarted.eventTypesTitle` | Event Type Reference |
| `getStarted.eventTypesDesc` | Common webhook event types you can use... |
| `getStarted.embedTitle` | Embed in Your App |
| `getStarted.embedDesc` | Give your customers a white-labeled webhook portal... |
| `getStarted.embedCode` | Embed Code |
| `getStarted.customizeColors` | Customize colors, logo, and fonts in |
| `getStarted.portalSettings` | Portal Settings |
| `getStarted.cliTitle` | CLI Quickstart |
| `getStarted.cliDesc` | Manage HookSniff from your terminal. |
| `getStarted.installAndUse` | Install & Use |
| `getStarted.readyTitle` | Ready to start? |
| `getStarted.readyDesc` | Create your free account and send your first webhook in minutes. |
| `getStarted.tryPlaygroundBtn` | Try Playground |
| `getStarted.goToDashboard` | Go to Dashboard |

### `onboarding.*` Section (32 keys)

| Key | EN Value |
|-----|----------|
| `onboarding.welcomeTitle` | Welcome to HookSniff! 🪝 |
| `onboarding.welcomeWizardDesc` | Let's get your webhooks set up in under 5 minutes. |
| `onboarding.letsGo` | Let's go → |
| `onboarding.whatBuilding` | What are you building? |
| `onboarding.whatBuildingDesc` | We'll customize your experience based on your use case. |
| `onboarding.chooseSdk` | Choose your SDK |
| `onboarding.chooseSdkDesc` | Pick your language and install the SDK. |
| `onboarding.installCommand` | Install Command |
| `onboarding.continue` | Continue → |
| `onboarding.createFirstEndpoint` | Create your first endpoint |
| `onboarding.createFirstEndpointDesc` | This is where we'll deliver your webhooks. |
| `onboarding.endpointUrl` | Endpoint URL |
| `onboarding.endpointUrlPlaceholder` | https://myapp.com/webhooks |
| `onboarding.descriptionOptional` | Description (optional) |
| `onboarding.descPlaceholder` | My production webhook endpoint |
| `onboarding.noRealUrl` | No real URL yet? |
| `onboarding.usePlayground` | Use the Playground to get a temporary test URL... |
| `onboarding.createEndpointBtn` | Create Endpoint → |
| `onboarding.creating` | Creating... |
| `onboarding.sendTestWebhook` | Send a test webhook |
| `onboarding.sendTestWebhookDesc` | Copy this command and run it in your terminal. |
| `onboarding.testCommand` | Test Command |
| `onboarding.iveSentTest` | I've sent a test |
| `onboarding.allSetTitle` | You're all set! 🎉 |
| `onboarding.allSetDesc` | Your HookSniff workspace is ready... |
| `onboarding.goToDashboardBtn` | 🚀 Go to Dashboard |
| `onboarding.skipSetup` | Skip setup |
| `onboarding.setupProgress` | Setup Progress |
| `onboarding.completed` | completed |
| `onboarding.dismissChecklist` | Dismiss checklist |
| `onboarding.successTitle` | Success! |

### `settings.*` Section (1 key)

| Key | EN Value |
|-----|----------|
| `settings.apiDesc` | Your secret API key for authenticating requests |

---

## ⚠️ Untranslated Values (Same as EN)

Beyond the missing keys, many existing keys have values identical to English. These are likely copy-pasted from EN and never translated.

### Per-Locale Breakdown

| Locale | Untranslated Count | Top Sections |
|--------|-------------------|--------------|
| de | ~511 | pricing (83), admin (70), docs (66), playground (30) |
| es | ~506 | pricing (83), admin (70), docs (66), playground (30) |
| fr | ~504 | pricing (83), admin (70), docs (66), playground (30) |
| ja | ~493 | pricing (83), admin (70), docs (66), playground (30) |
| ko | ~493 | pricing (83), admin (70), docs (66), playground (30) |
| pt-BR | ~507 | pricing (83), admin (70), docs (66), playground (30) |

### Sections Most Affected (all 6 locales)

1. **`pricing.*`** — 83 keys untranslated (entire pricing page)
2. **`admin.*`** — 70 keys untranslated (entire admin panel)
3. **`docs.*`** — 66 keys untranslated (entire docs section)
4. **`playground.*`** — 30 keys untranslated (entire playground)
5. **`common.*`** — ~27-29 keys untranslated (common UI strings)
6. **`status.*`** — 26 keys untranslated (status page)
7. **`team.*`** — 25 keys untranslated (team management)
8. **`apiKeys.*`** — 22 keys untranslated (API keys page)

### TR (Turkish) — Acceptable Untranslations

TR has 33 values identical to EN, but these are **technical terms** that don't need translation:
- `admin.cdn`, `admin.proPlan`, `common.endpoint`, `common.id`, `common.url`, `common.plan`
- `docs.beta`, `docs.deadLetterQueue`, `docs.selfHosting`
- `pricing.business`, `pricing.pro`, `pricing.http`, `pricing.grpc`, `pricing.sqs`, `pricing.ws`
- `landing.footer.github`, `landing.footer.blog`, etc.

**These are acceptable** — they're proper nouns or industry-standard terms.

---

## 🔍 Placeholder Sorunları (Placeholder Issues)

**1 issue found:**

| Key | Locale | EN Placeholders | Locale Placeholders | Issue |
|-----|--------|----------------|--------------------|----|
| `apiKeys.keyCount` | tr | `{count}`, `{plural}` | `{count}` | Missing `{plural}` placeholder |

The EN version: `"{count} key{plural}"` uses `{plural}` for pluralization (likely renders as "s" or "").  
The TR version: `"{count} anahtar"` omits `{plural}` — this may be **intentional** since Turkish doesn't use English-style plurals, but should be verified.

---

## 🏗️ next-intl Configuration

### `src/i18n/routing.ts`
```typescript
export const routing = defineRouting({
  locales: ['en', 'tr', 'de', 'ja', 'pt-BR', 'es', 'fr', 'ko'],
  defaultLocale: 'en',
  localePrefix: 'always',
});
```

### `src/middleware.ts`
```typescript
export default createMiddleware(routing);
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

**Configuration is valid.** All 8 locale files match the configured locales in routing.

---

## 🎯 Admin Panel Key Analysis

### `admin.*` prefix keys

| Locale | Has admin section? | Keys count | Untranslated |
|--------|-------------------|-----------|-------------|
| en | ✅ | 70 | — |
| tr | ✅ | 70 | 0 |
| de | ✅ | 70 | 70 (all untranslated) |
| es | ✅ | 70 | 70 (all untranslated) |
| fr | ✅ | 70 | 70 (all untranslated) |
| ja | ✅ | 70 | 70 (all untranslated) |
| ko | ✅ | 70 | 70 (all untranslated) |
| pt-BR | ✅ | 70 | 70 (all untranslated) |

**The entire admin panel is translated only in TR.** All other locales have the keys but with English values.

---

## 📋 Dashboard Key Analysis

### `dashboard.*` prefix keys

| Locale | Keys count | Untranslated |
|--------|-----------|-------------|
| en | 26 | — |
| tr | 26 | 0 |
| de | 26 | 14 |
| es | 26 | 13 |
| fr | 26 | 13 |
| ja | 26 | 13 |
| ko | 26 | 13 |
| pt-BR | 26 | 13 |

---

## 🔧 Recommendations

### Critical (P0)
1. **Translate `getStarted.*` and `onboarding.*` for all 6 locales** — These are user-facing onboarding flows that will show English text to non-EN/TR users
2. **Translate `admin.*` for all 6 locales** — Admin panel is completely untranslated

### High Priority (P1)
3. **Translate `pricing.*` for all 6 locales** — 83 keys per locale, entire pricing page in English
4. **Translate `docs.*` for all 6 locales** — 66 keys per locale
5. **Translate `playground.*` for all 6 locales** — 30 keys per locale

### Medium Priority (P2)
6. **Translate remaining sections** (`common.*`, `status.*`, `team.*`, `apiKeys.*`, `alerts.*`, etc.)
7. **Verify `apiKeys.keyCount` placeholder in TR** — Check if `{plural}` omission is intentional

### Low Priority (P3)
8. Consider using a translation management tool (Crowdin, Lokalise) to track translation progress
9. Add CI check to detect missing/empty translation keys on PR

---

## 📁 File Locations

- EN: `src/messages/en.json` (983 keys — source of truth)
- TR: `src/messages/tr.json` (983 keys — ✅ complete)
- DE: `src/messages/de.json` (894 keys — ❌ 89 missing)
- ES: `src/messages/es.json` (894 keys — ❌ 89 missing)
- FR: `src/messages/fr.json` (894 keys — ❌ 89 missing)
- JA: `src/messages/ja.json` (894 keys — ❌ 89 missing)
- KO: `src/messages/ko.json` (894 keys — ❌ 89 missing)
- PT-BR: `src/messages/pt-BR.json` (894 keys — ❌ 89 missing)
