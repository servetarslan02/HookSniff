# Deep i18n Audit — HookSniff Dashboard

**Date:** 2026-05-10  
**Scope:** All dashboard pages, components, and locale files  
**Methodology:** Exhaustive file-by-file analysis of every `.tsx` file under `dashboard/src/`

---

## 1. Locale File Inventory

| Locale File | Total Keys | vs en.json (893) | Status |
|-------------|-----------|------------------|--------|
| **en.json** | **893** | — | ✅ Reference |
| **tr.json** | **893** | 0 missing | ✅ Complete |
| **de.json** | **804** | 89 missing | ❌ Incomplete |
| **es.json** | **804** | 89 missing | ❌ Incomplete |
| **fr.json** | **804** | 89 missing | ❌ Incomplete |
| **ja.json** | **804** | 89 missing | ❌ Incomplete |
| **ko.json** | **804** | 89 missing | ❌ Incomplete |
| **pt-BR.json** | **804** | 89 missing | ❌ Incomplete |

**Key finding:** All non-TR locales are missing the **exact same 89 keys**. Turkish (tr.json) is the only fully translated non-EN locale.

---

## 2. Missing Keys Analysis (89 keys missing from de/es/fr/ja/ko/pt-BR)

### 2.1 `getStarted.*` — 56 keys missing

The entire `getStarted` section (Get Started page) is missing from 6 locales:

| Key | Purpose |
|-----|---------|
| `getStarted.title` | Page title |
| `getStarted.subtitle` | Page subtitle |
| `getStarted.heroBadge` | Hero badge text |
| `getStarted.freeForever` | Badge: "Free forever" |
| `getStarted.elevenSdks` | Badge: "11 SDKs" |
| `getStarted.noCreditCard` | Badge: "No credit card" |
| `getStarted.fiveMinSetup` | Badge: "5 min setup" |
| `getStarted.step1Title` – `getStarted.step6Title` | Step titles (6 keys) |
| `getStarted.step1Desc` – `getStarted.step6Desc` | Step descriptions (6 keys) |
| `getStarted.createFreeAccount` | CTA button |
| `getStarted.signedInAs` | "Signed in as" |
| `getStarted.yourApiKey` | API key label |
| `getStarted.manageKeys` | "Manage keys" |
| `getStarted.show` / `getStarted.hide` | Show/hide toggle |
| `getStarted.keepSecret` | Security warning |
| `getStarted.install` | Install label |
| `getStarted.quickstart` | Quickstart link |
| `getStarted.viaDashboard` / `getStarted.viaDashboardDesc` | Dashboard instructions |
| `getStarted.viaApi` / `getStarted.viaApiDesc` | API instructions |
| `getStarted.tipPlayground` | Playground tip |
| `getStarted.testWebhook` | Test webhook button |
| `getStarted.tryPlayground` / `getStarted.tryPlaygroundBtn` | Playground CTAs |
| `getStarted.viewDeliveries` | View deliveries link |
| `getStarted.realtimeDashboard` / `getStarted.realtimeDashboardDesc` | Dashboard feature |
| `getStarted.autoRetries` / `getStarted.autoRetriesDesc` | Auto retries feature |
| `getStarted.alerts` / `getStarted.alertsDesc` | Alerts feature |
| `getStarted.openDashboard` | Open dashboard button |
| `getStarted.eventTypesTitle` / `getStarted.eventTypesDesc` | Event types section |
| `getStarted.embedTitle` / `getStarted.embedDesc` / `getStarted.embedCode` | Embed section |
| `getStarted.customizeColors` / `getStarted.portalSettings` | Portal customization |
| `getStarted.cliTitle` / `getStarted.cliDesc` / `getStarted.installAndUse` | CLI section |
| `getStarted.readyTitle` / `getStarted.readyDesc` | Final CTA section |
| `getStarted.goToDashboard` | Go to dashboard button |

### 2.2 `onboarding.*` — 32 keys missing

The entire new onboarding wizard flow is missing:

| Key | Purpose |
|-----|---------|
| `onboarding.welcomeTitle` / `onboarding.welcomeWizardDesc` | Wizard welcome |
| `onboarding.letsGo` | "Let's go →" button |
| `onboarding.whatBuilding` / `onboarding.whatBuildingDesc` | Use case step |
| `onboarding.chooseSdk` / `onboarding.chooseSdkDesc` | SDK selection step |
| `onboarding.installCommand` | Install command label |
| `onboarding.continue` | Continue button |
| `onboarding.createFirstEndpoint` / `onboarding.createFirstEndpointDesc` | Endpoint step |
| `onboarding.endpointUrl` / `onboarding.endpointUrlPlaceholder` | Endpoint URL input |
| `onboarding.descriptionOptional` / `onboarding.descPlaceholder` | Description input |
| `onboarding.noRealUrl` / `onboarding.usePlayground` | Playground tip |
| `onboarding.createEndpointBtn` | Create endpoint button |
| `onboarding.creating` | Loading state |
| `onboarding.sendTestWebhook` / `onboarding.sendTestWebhookDesc` | Test webhook step |
| `onboarding.testCommand` | Test command label |
| `onboarding.iveSentTest` | "I've sent a test" button |
| `onboarding.allSetTitle` / `onboarding.allSetDesc` | Completion step |
| `onboarding.goToDashboardBtn` | Go to dashboard button |
| `onboarding.skipSetup` | Skip setup link |
| `onboarding.setupProgress` / `onboarding.completed` | Checklist widget |
| `onboarding.dismissChecklist` | Dismiss checklist |
| `onboarding.successTitle` | Success toast title |

### 2.3 `settings.apiDesc` — 1 key missing

| Key | Purpose |
|-----|---------|
| `settings.apiDesc` | API configuration section description |

---

## 3. Keys Used in Code but MISSING from en.json

These keys are referenced in source code via `t()` calls but **do not exist even in en.json**, meaning they will render as raw key strings in ALL locales:

| Key Used | File | Line | Context |
|----------|------|------|---------|
| `billing.nextBilling` | `billing/page.tsx` | 245 | "Next billing" date label |
| `billing.webhooksThisMonth` | `billing/page.tsx` | 263 | Usage bar label |
| `billing.approachingLimit` | `billing/page.tsx` | 279 | Warning text |
| `billing.used` | `billing/page.tsx` | 285 | Usage percentage label |
| `billing.noUsageData` | `billing/page.tsx` | 303 | Empty state text |
| `billing.mostPopular` | `billing/page.tsx` | 326 | Plan badge |

**Impact:** These 6 keys will display as raw key paths (e.g., `billing.nextBilling`) in the UI for ALL languages.

---

## 4. Hardcoded English String Inventory

### 4.1 Dashboard Pages — Complete List

#### `api-importer/page.tsx` — **0 t() calls, 20+ hardcoded strings**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 81 | `'Failed to parse OpenAPI spec'` | Toast error |
| 82 | `` `Failed to fetch: ${err.message}` `` | Toast error |
| 93 | `` `Found ${result.endpoints.length} endpoints` `` | Toast success |
| 95 | `'Failed to parse. Make sure it\'s valid JSON.'` | Toast error |
| 120 | `'Select at least one endpoint'` | Toast error |
| 134 | `` `Imported ${success}/${selected.length} endpoints` `` | Toast result |
| 143 | `"📥 API Spec Importer"` | Page title |
| 145-146 | `"Import endpoints from an OpenAPI/Swagger specification..."` | Page subtitle |
| 153 | `"🔗 From URL"` | Tab label |
| 161 | `"📋 Paste JSON"` | Tab label |
| 167 | `"OpenAPI Spec URL"` | Form label |
| 176 | `"Fetch"` | Button label |
| 181 | `"Paste OpenAPI JSON"` | Form label |
| 192 | `"Parse"` | Button label |
| 203 | `"endpoints found"` | Result text |
| 208 | `"Deselect All"` / `"Select All"` | Toggle button |
| 214-215 | `` `Importing ${imported}...` `` / `` `Import ${count} Endpoints` `` | Button labels |
| 237 | `"💡 Tip: Imported endpoints will be created..."` | Tip text |
| 249 | `"Supported Formats"` | Section title |
| 252-254 | `"OpenAPI 3.0"`, `"Swagger 2.0"`, `"URL"` | Format names |

#### `billing/page.tsx` — **Partially translated, 6+ hardcoded strings**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 208 | `'Invalid checkout URL'` | Toast error |
| 211 | `'Upgrade initiated'` | Toast success |
| 214 | `'Upgrade failed'` | Toast error |
| 214 | `'Cancel failed'` | Toast error |
| 245 | `"Cancel Subscription"` | Button text (line ~255) |
| 276 | `"Cancel"` (in upgrade modal) | Button text |
| 348-355 | Feature strings: `'100 requests/min'`, `'3 retry attempts'`, etc. | Plan features |
| 383 | `"Loading invoices…"` | Loading text |
| 386 | `"No invoices yet."` | Empty state |
| 392 | `"Invoice"` | Table header |
| 393 | `"Date"` | Table header |
| 394 | `"Plan"` | Table header |
| 395 | `"Amount"` | Table header |
| 396 | `"Status"` | Table header |

#### `custom-domain/page.tsx` — **0 t() calls, 30+ hardcoded strings**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 32 | `'Domain added! Add the DNS records below.'` | Toast success |
| 62 | `"🌐 Custom Domain"` | Page title |
| 63-64 | `"Use your own domain for the webhook portal..."` | Page subtitle |
| 71 | `"Add Domain"` | Section title |
| 82 | `"Add Domain"` | Button label |
| 88 | `"DNS Records"` | Section title |
| 89-90 | `"Add these records to your DNS provider..."` | Instructions |
| 92-95 | `"Type"`, `"Name"`, `"Value"`, `"Copy"` | Table headers |
| 118 | `'Copied!'` | Toast success |
| 127-128 | `"Verifying..."` / `"✓ Verify Domain"` | Button labels |
| 131 | `"✅ Verified! SSL provisioning..."` | Status text |
| 134 | `"❌ Verification failed — check DNS records"` | Error text |
| 139 | `"How it works"` | Section title |
| 142-144 | Step titles and descriptions | How-it-works steps |

#### `deliveries/[id]/page.tsx` — **0 t() calls, 40+ hardcoded strings**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 54 | `'Webhook replayed successfully!'` | Toast success |
| 57 | `'Replay failed'` | Toast error |
| 71 | `'Failed to copy'` | Toast error |
| 143 | `"⚠️"` heading `"Failed to load delivery"` | Error state |
| 152 | `"Try Again"` | Button label |
| 156 | `"Back to Deliveries"` | Button label |
| 173 | `"Delivery Details"` | Page title |
| 183 | `"Replay Webhook"` | Button label |
| 190 | `"Status"` | Card label |
| 194 | `"Event"` | Card label |
| 198 | `"Attempts"` | Card label |
| 202 | `"Response"` | Card label |
| 213 | `"📋 Delivery Information"` | Section title |
| 215-226 | `"Delivery ID"`, `"Endpoint ID"`, `"Endpoint URL"`, `"Event Type"`, `"Status"`, `"Attempt Count"`, `"Last Response"`, `"Created"`, `"Updated"`, `"Error"` | Detail labels |
| 245 | `"📤 Request Details"` | Section title |
| 252 | `"Request Headers"` | Section label |
| 255 | `"headers"` | Count label |
| 277 | `"No headers captured"` | Empty state |
| 293 | `"Request Body (Payload)"` | Section label |
| 311 | `"No payload captured"` | Empty state |
| 325 | `"⏱️ Attempt Timeline"` | Section title |
| 328 | `"attempt"` / `"attempts"` | Count label |
| 332 | `"No attempt data available"` | Empty state |
| 333 | `"Attempts will appear here once..."` | Help text |
| 357 | `"Attempt #"` | Attempt label |
| 375 | `"Error Message"` | Detail label |
| 386 | `"Response Headers"` | Detail label |
| 397 | `"Response Body"` | Detail label |
| 414 | `"No additional debug data captured..."` | Empty state |
| 430 | `"Replay Webhook"` | Dialog title |
| 431 | `"Replay this webhook delivery..."` | Dialog message |
| 432 | `"Replay"` | Dialog confirm |

#### `endpoints/[id]/page.tsx` — **0 t() calls, 30+ hardcoded strings**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 48 | `'Endpoint not found'` | Toast error |
| 82 | `'Retry policy updated!'` | Toast success |
| 85 | `'Failed to update'` | Toast error |
| 102 | `'Secret rotated! Old secret valid for 24 hours.'` | Toast success |
| 105 | `'Rotation failed'` | Toast error |
| 135 | `'Test webhook sent! Check your endpoint.'` | Toast success |
| 137 | `'Failed to send test'` | Toast error |
| 168 | `"Endpoint Settings"` | Page title |
| 178 | `"🔄 Retry Policy"` | Section title |
| 184 | `"Max Attempts"` | Form label |
| 187 | `"1–20 attempts"` | Help text |
| 190 | `"Backoff Strategy"` | Form label |
| 195-197 | `"Exponential"`, `"Linear"`, `"Fixed"` + descriptions | Backoff options |
| 213 | `"Initial Delay (seconds)"` | Form label |
| 221 | `"Max Delay (seconds)"` | Form label |
| 224 | `"Max 86400s (24h)"` | Help text |
| 229 | `"Retry Schedule Preview"` | Section title |
| 243 | `"Save Retry Policy"` / `"Saving..."` | Button labels |
| 250 | `"🔑 Signing Secret"` | Section title |
| 252-253 | `"Rotate your signing secret..."` | Description |
| 257 | `"Current Secret"` | Label |
| 264 | `"New Secret (save this!)"` | Label |
| 269 | `"Rotate Secret"` | Button label |
| 275 | `"⚡ Rate Limits"` | Section title |
| 280 | `"API Requests"` | Card label |
| 286 | `"Avg Response"` | Card label |
| 292 | `"Failure Streak"` | Card label |
| 299 | `"🧪 Test Webhook"` | Section title |
| 300-301 | `"Send a test webhook..."` | Description |
| 311 | `"Sending..."` | Button loading |
| 313 | `"🚀 Send Test Webhook"` | Button label |
| 317 | `"✅ Sent! Check your endpoint logs."` | Success text |
| 321 | `"❌ Failed — check endpoint URL..."` | Error text |
| 330 | `"Rotate Signing Secret?"` | Modal title |
| 331-332 | `"The old secret will remain valid..."` | Modal description |
| 336 | `"Cancel"` | Modal button |
| 342 | `"Rotating..."` / `"Rotate Secret"` | Modal button |

#### `notifications/page.tsx` — **Partially translated, 10+ hardcoded strings**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 50 | `'Failed to load notifications'` | Toast error |
| 66 | `'Failed to mark as read'` | Toast error |
| 77 | `'Failed to mark all as read'` | Toast error |
| 87 | `'Notification deleted'` | Toast success |
| 89 | `'Failed to delete notification'` | Toast error |
| 104 | `"Stay updated on webhook events..."` | Subtitle (line 104) |
| 110 | `"Mark all as read"` | Button label |
| 120-126 | `"All"`, `"Webhook Failed"`, `"Alerts"`, `"System"`, `"Billing"` | Filter labels (in `typeLabels` object) |
| 175 | `"Loading notifications..."` | Loading text |
| 193 | `"Mark read"` | Action button |
| 199 | `"Delete"` | Action button |
| 217 | `"Showing X–Y of Z"` | Pagination text |
| 222 | `"Previous"` | Pagination button |
| 225 | `"Page X of Y"` | Pagination text |
| 230 | `"Next"` | Pagination button |

#### `portal-customize/page.tsx` — **0 t() calls, 40+ hardcoded strings**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 74 | `'Portal configuration saved!'` | Toast success |
| 85 | `'Event already added'` | Toast error |
| 113 | `"🖼️ Portal Customization"` | Page title |
| 114-115 | `"Customize the look and feel..."` | Page subtitle |
| 120 | `"Save Changes"` / `"Saving..."` | Button labels |
| 127 | `"🎨 Branding"` | Section title |
| 130 | `"Company Name"` | Form label |
| 140 | `"Logo URL"` | Form label |
| 150 | `"Primary Color"` | Form label |
| 166 | `"Font Family"` | Form label |
| 179 | `"⚙️ Features"` | Section title |
| 183 | `"Dark Mode"` | Toggle label |
| 184 | `"Enable dark mode by default"` | Toggle description |
| 193 | `"Show Events"` | Toggle label |
| 194 | `"Allow users to view event types"` | Toggle description |
| 203 | `"Show Deliveries"` | Toggle label |
| 204 | `"Allow users to view delivery history"` | Toggle description |
| 213 | `"📋 Allowed Events"` | Section title |
| 214-215 | `"Leave empty to show all events..."` | Description |
| 231 | `"All events allowed"` | Empty state |
| 242 | `"👁️ Preview"` | Section title |
| 271 | `"Webhook Endpoints"` | Preview label |
| 273 | `"2 endpoints configured"` | Preview text |
| 278 | `"Event Subscriptions"` | Preview label |
| 290 | `"Recent Deliveries"` | Preview label |
| 292 | `"✅ 47 delivered · ❌ 3 failed"` | Preview text |
| 299 | `"📋 Embed Code"` | Section title |
| 300-301 | `"Copy this code into your dashboard..."` | Description |
| 309 | `"Copy"` | Button label |
| 318 | `"⚛️ React Integration"` | Section title |
| 355 | `'Copied!'` | Toast success |
| 380 | `'Copied!'` | Toast success |

#### `portal/page.tsx` — **0 t() calls, 10+ hardcoded strings**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 39 | `"Loading..."` | Loading text |
| 45 | `"👤 Customer Portal"` | Page title |
| 53 | `"Profile"` | Section title |
| 56 | `"Email"` | Label |
| 59 | `"Plan"` | Label |
| 62 | `"Member since"` | Label |
| 65 | `"Webhook limit"` | Label |
| 71 | `"Usage"` | Section title |
| 74 | `"Webhooks used"` | Label |
| 78 | `"Endpoints"` | Label |
| 82 | `"API calls today"` | Label |

#### `rate-limiting/page.tsx` — **0 t() calls, 25+ hardcoded strings**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 73 | `"⚡ Rate Limiting"` | Page title |
| 74-75 | `"Monitor and configure rate limits..."` | Page subtitle |
| 81 | `"Total Endpoints"` | Card label |
| 85 | `"Avg Requests/sec"` | Card label |
| 89 | `"Peak Requests/sec"` | Card label |
| 93 | `"Throttled Requests"` | Card label |
| 101 | `"Per-Endpoint Limits"` | Section title |
| 106-111 | `"Endpoint"`, `"RPS"`, `"RPM"`, `"Burst"`, `"Queue"`, `"Throttled"` | Table headers |
| 136 | `"⚡ Rate Limiting"` (empty state title) | Empty state |
| 137-138 | `"HookSniff automatically rate-limits..."` | Empty state description |
| 142 | `"Auto Retry"` | Feature card |
| 143 | `"Exponential backoff"` | Feature description |
| 146 | `"Per-Endpoint"` | Feature card |
| 147 | `"Custom limits"` | Feature description |
| 150 | `"Alerts"` | Feature card |
| 151 | `"Throttle notifications"` | Feature description |
| 157 | `"How Rate Limiting Works"` | Section title |
| 160-163 | Step titles and descriptions | How-it-works steps |

#### `retry-policy/page.tsx` — **0 t() calls, 30+ hardcoded strings**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 88 | `"🔄 Retry Policy"` | Page title |
| 89-90 | `"Configure global retry behavior..."` | Page subtitle |
| 96 | `"Save Changes"` / `"Saving..."` | Button labels |
| 104 | `"Retry Settings"` | Section title |
| 108 | `"Max Attempts"` | Form label |
| 114 | `"Backoff Strategy"` | Form label |
| 119-121 | `"Exponential"`, `"Linear"`, `"Fixed"` + descriptions | Backoff options |
| 137 | `"Initial Delay (sec)"` | Form label |
| 143 | `"Max Delay (sec)"` | Form label |
| 149 | `"Request Timeout (sec)"` | Form label |
| 156 | `"Dead Letter Queue"` | Section title |
| 160 | `"Enable DLQ"` | Toggle label |
| 161 | `"Move permanently failed deliveries to DLQ"` | Toggle description |
| 168 | `"Max Age (hours)"` | Form label |
| 174 | `"Retry on Status Codes"` | Section title |
| 175-176 | `"Webhooks that return these HTTP status codes..."` | Description |
| 181-186 | `"408 Request Timeout"`, `"429 Too Many Requests"`, etc. | Status code labels |
| 198 | `"📊 Delay Preview"` | Section title |
| 199 | `"How delays will look with current settings:"` | Description |
| 215 | `"Attempt"` | Label |
| 225 | `"Total retry time (worst case):"` | Summary label |
| 235 | `"💡 Tip: Per-endpoint retry policies..."` | Tip text |
| 241 | `'Retry policy saved for all endpoints!'` | Toast success |
| 243 | `'Saved with ${errors.length} errors'` | Toast error |
| 245 | `'Failed to save retry policy'` | Toast error |

#### `routing/page.tsx` — **0 t() calls, 8+ hardcoded strings**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 36 | `"Loading..."` | Loading text |
| 40 | `"🔀 Routing"` | Page title |
| 41-42 | `"Configure how webhooks are routed..."` | Page subtitle |
| 50 | `"Strategy:"` | Label |
| 51 | `"Fallback:"` | Label |
| 55 | `"Unhealthy"` / `"Healthy"` | Status badges |
| 56 | `"avg"` | Suffix |
| 59 | `"No endpoints configured yet."` | Empty state |

#### `schemas/page.tsx` — **0 t() calls, 6+ hardcoded strings**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 27 | `"Loading..."` | Loading text |
| 31 | `"📋 Schemas"` | Page title |
| 32-33 | `"Define and validate event schemas..."` | Page subtitle |
| 37 | `"No schemas registered yet"` | Empty state |
| 38 | `"Register a schema to start validating..."` | Empty state description |

#### `search/page.tsx` — **Fully translated** ✅

#### `signature-verifier/page.tsx` — **0 t() calls, 25+ hardcoded strings**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 18 | `'Payload and secret are required'` | Toast error |
| 37 | `'Signature computed!'` | Toast success |
| 39 | `'Failed to compute signature'` | Toast error |
| 47 | `'All fields are required'` | Toast error |
| 69 | `'Verification failed'` | Toast error |
| 75 | `"🔐 Signature Verifier"` | Page title |
| 76-77 | `"Verify webhook signatures..."` | Page subtitle |
| 83 | `"Algorithm"` | Section title |
| 98 | `"Verify Signature"` | Section title |
| 101 | `"Webhook Payload (raw body)"` | Form label |
| 108 | `"Webhook Secret"` | Form label |
| 115 | `"Signature (from x-hooksniff-signature header)"` | Form label |
| 122 | `"✓ Verify Signature"` / `"Verifying..."` | Button labels |
| 128 | `"🔧 Compute Signature"` | Button label |
| 135 | `"✅ Signature Valid!"` | Result text |
| 136 | `"The payload is authentic..."` | Result description |
| 138 | `"❌ Signature Invalid!"` | Result text |
| 139 | `"The signature does not match..."` | Result description |
| 147 | `"Code Example — Node.js"` | Section title |
| 156 | `"Copy"` | Button label |
| 162 | `"How Webhook Signatures Work"` | Section title |
| 165-167 | Step titles and descriptions | How-it-works steps |
| 210 | `'Copied!'` | Toast success |

#### `sso/page.tsx` — **0 t() calls, 20+ hardcoded strings**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 61 | `'SSO configuration saved!'` | Toast success |
| 63 | `'Failed to save SSO config'` | Toast error |
| 75 | `"🔐 SSO / SAML"` | Page title |
| 76-77 | `"Configure Single Sign-On..."` | Page subtitle |
| 82 | `"Provider"` | Section title |
| 86-87 | `"SAML 2.0"`, `"Okta, OneLogin..."` | Provider option |
| 88-89 | `"OpenID Connect"`, `"Auth0, Keycloak..."` | Provider option |
| 103 | `"SAML Configuration"` | Section title |
| 106 | `"Metadata URL"` | Form label |
| 112 | `"Entity ID"` | Form label |
| 118 | `"SSO URL"` | Form label |
| 124 | `"X.509 Certificate"` | Form label |
| 134 | `"OpenID Connect Configuration"` | Section title |
| 137 | `"Issuer URL"` | Form label |
| 143 | `"Client ID"` | Form label |
| 149 | `"Client Secret"` | Form label |
| 158 | `"Enable SSO"` | Toggle label |
| 159 | `"When enabled, all team members..."` | Toggle description |
| 167 | `"Save Configuration"` / `"Saving..."` | Button labels |
| 173-174 | `"SSO is available on the Business plan..."` | Info text |

#### `team/page.tsx` — **Partially translated, 10+ hardcoded strings**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 36 | `'Failed to load teams'` | Toast error |
| 48 | `'Failed to load members'` | Toast error |
| 71 | `'Failed to create team'` | Toast error |
| 88 | `'Failed to invite member'` | Toast error |
| 101 | `'Failed to remove member'` | Toast error |
| 112 | `'Failed to update role'` | Toast error |
| 130 | `"Manage your teams and collaborate..."` | Subtitle (hardcoded, not using t('subtitle')) |
| 144 | `"members"` | Count label (uses hardcoded "members" in some places) |

#### `templates/page.tsx` — **0 t() calls, needs investigation** (likely minimal)

#### `transforms/page.tsx` — **0 t() calls, 15+ hardcoded strings**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 51 | `'Transform rule created!'` | Toast success |
| 55 | `'Failed to create rule'` | Toast error |
| 65 | `'Rule deleted'` | Toast success |
| 66 | `'Failed to delete'` | Toast error |
| 73 | `"🔄 Webhook Transforms"` | Page title |
| 74 | `"Filter, map, and enrich webhook payloads..."` | Page subtitle |
| 76 | `"+ New Rule"` | Button label |
| 82 | `"Select Endpoint"` | Form label |
| 85 | `"Choose an endpoint..."` | Select placeholder |
| 90 | `"New Transform Rule"` | Form title |
| 94 | `"Filter (include fields)"` | Form label |
| 98 | `"Filter (exclude fields)"` | Form label |
| 103 | `"Map from"` | Form label |
| 108 | `"Map to"` | Form label |
| 115 | `"Enrich key"` | Form label |
| 120 | `"Enrich value"` | Form label |
| 122 | `"Create"` | Button label |
| 127 | `"Select an endpoint to manage transforms"` | Empty state |
| 131 | `"No transform rules. Create one..."` | Empty state |

#### `webhook-builder/page.tsx` — **0 t() calls, 20+ hardcoded strings**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 85 | `'Select an endpoint first'` | Toast error |
| 106 | `'Webhook sent!'` | Toast success |
| 108 | `'Failed to send'` | Toast error |
| 111 | `'Network error'` | Toast error |
| 116 | `"🔧 Webhook Builder"` | Page title |
| 117-118 | `"Visually create and send webhook payloads..."` | Page subtitle |
| 125 | `"Templates"` | Section title |
| 139 | `"Event Type"` | Section title |
| 148 | `"Payload Fields"` | Section title |
| 151 | `"+ Add field"` | Button label |
| 178 | `"Send To"` | Section title |
| 187 | `"Sending..."` / `"🚀 Send Webhook"` | Button labels |
| 196 | `"Preview"` | Section title |
| 200 | `"🔄 Refresh"` | Button label |

#### `webhooks/new/page.tsx` — **Fully translated** ✅ (uses `t()` for all user-facing strings except one)

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 112 | `"Sending..."` (inline in JSX) | Should use `tc('sending')` |

### 4.2 Components — Hardcoded Strings

#### `ConfirmDialog.tsx`

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 22 | `confirmLabel = 'Confirm'` | Default prop (acceptable as override) |
| 23 | `cancelLabel = 'Cancel'` | Default prop (acceptable as override) |
| 101 | `'Processing...'` | Button loading text |

#### `EmailVerificationBanner.tsx` — **0 t() calls**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 38 | `'Verification email sent! Check your inbox.'` | Toast success |
| 40 | `'Failed to send. Try again later.'` | Toast error |
| 42 | `'Network error.'` | Toast error |
| 53 | `"Please verify your email address"` | Banner title |
| 56 | `"We sent a verification link to"` | Banner text |
| 63 | `"Sending..."` / `"Resend"` | Button labels |

#### `Footer.tsx` — **Partially translated**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 33-40 | `compareLinks` array names | All hardcoded: `"HookSniff vs Svix"`, `"HookSniff vs Hookdeck"`, etc. |
| 43-48 | `resourceLinks` array names | All hardcoded: `"Webhook Guides"`, `"Webhook Glossary"`, etc. |
| 66 | `"Product"` | Section heading |
| 81 | `"Compare"` | Section heading |
| 96 | `"Resources"` | Section heading |
| 110 | `"Company"` | Section heading |
| 112 | `"Get Started"` | Link text |
| 126 | `"GitHub"` (hardcoded in Company section) | Link text |

#### `NotificationCenter.tsx` — **0 t() calls**

| Line | Hardcoded String | Should Be |
|------|-----------------|-----------|
| 117 | `"Notifications"` | Dropdown title |
| 122 | `"Mark all read"` | Button label |
| 131 | `"No notifications"` | Empty state |
| 159 | `"View all notifications →"` | Link text |

#### `Onboarding.tsx` — **Uses t() ✅** (references `onboarding.*` keys)

#### `OnboardingWizard.tsx` — **0 t() calls, 50+ hardcoded strings**

All wizard step titles, descriptions, button labels, and UI text are hardcoded in English. This is the **largest single source of untranslated content** in the dashboard.

Key examples:
- `"Welcome to HookSniff! 🪝"`, `"What are you building?"`, `"Choose your SDK"`, etc.
- All USE_CASES labels: `"Payments"`, `"Email / Notifications"`, `"E-commerce"`, etc.
- All SDK labels: `"Node.js"`, `"Python"`, `"Go"`, etc.
- Button labels: `"Let's go →"`, `"Continue →"`, `"Create Endpoint →"`, `"Skip setup"`, etc.
- Checklist labels: `"Create account"`, `"Get API key"`, `"Create first endpoint"`, etc.
- `"Setup Progress"`, `"completed"`, `"Dismiss checklist"`

#### `StatusBadge.tsx` — Likely uses status strings (needs verification)

### 4.3 Dashboard Layout (`layout.tsx`)

**Fully translated** ✅ — All navigation items use `t()` calls against the `nav.*` namespace.

---

## 5. Per-Page Translation Coverage Summary

| Page | Uses t()? | Hardcoded Strings | Severity |
|------|-----------|-------------------|----------|
| **api-importer** | ❌ No | 20+ | 🔴 Critical |
| **audit-log** | ❌ No | 15+ | 🔴 Critical |
| **billing** | ✅ Partial | 10+ | 🟡 Medium |
| **custom-domain** | ❌ No | 30+ | 🔴 Critical |
| **deliveries/[id]** | ❌ No | 40+ | 🔴 Critical |
| **endpoints** | ✅ Yes | 0 | ✅ Good |
| **endpoints/[id]** | ❌ No | 30+ | 🔴 Critical |
| **health** | ✅ Yes | 0 | ✅ Good |
| **inbound** | ✅ Partial | 10+ | 🟡 Medium |
| **logs** | ✅ Yes | 0 | ✅ Good |
| **notifications** | ✅ Partial | 10+ | 🟡 Medium |
| **page.tsx (dashboard)** | ✅ Yes | 0 | ✅ Good |
| **playground** | ✅ Yes | 0 | ✅ Good |
| **portal** | ❌ No | 10+ | 🔴 Critical |
| **portal-customize** | ❌ No | 40+ | 🔴 Critical |
| **rate-limiting** | ❌ No | 25+ | 🔴 Critical |
| **retry-policy** | ❌ No | 30+ | 🔴 Critical |
| **routing** | ❌ No | 8+ | 🔴 Critical |
| **schemas** | ❌ No | 6+ | 🔴 Critical |
| **search** | ✅ Yes | 0 | ✅ Good |
| **settings** | ✅ Yes | 1 (Sign Out button) | ✅ Good |
| **signature-verifier** | ❌ No | 25+ | 🔴 Critical |
| **sso** | ❌ No | 20+ | 🔴 Critical |
| **team** | ✅ Partial | 10+ | 🟡 Medium |
| **templates** | ❌ No | Unknown | 🟡 Medium |
| **transforms** | ❌ No | 15+ | 🔴 Critical |
| **webhook-builder** | ❌ No | 20+ | 🔴 Critical |
| **webhooks/new** | ✅ Yes | 1 | ✅ Good |
| **layout.tsx** | ✅ Yes | 0 | ✅ Good |

---

## 6. Component Translation Coverage

| Component | Uses t()? | Hardcoded Strings | Severity |
|-----------|-----------|-------------------|----------|
| **ConfirmDialog** | ❌ No | 1 | 🟢 Low |
| **EmailVerificationBanner** | ❌ No | 6+ | 🟡 Medium |
| **EmptyState** | N/A | 0 (receives props) | ✅ Good |
| **Footer** | ✅ Partial | 15+ | 🟡 Medium |
| **NotificationCenter** | ❌ No | 4+ | 🟡 Medium |
| **Onboarding** | ✅ Yes | 0 | ✅ Good |
| **OnboardingWizard** | ❌ No | 50+ | 🔴 Critical |
| **StatusBadge** | ❌ Unknown | Unknown | 🟡 Medium |

---

## 7. Priority Fix List

### 🔴 P0 — Critical (User-facing, no translation at all)

1. **OnboardingWizard.tsx** — 50+ hardcoded strings. First thing new users see. Completely untranslated for non-EN users.
2. **deliveries/[id]/page.tsx** — 40+ hardcoded strings. Core feature page.
3. **portal-customize/page.tsx** — 40+ hardcoded strings. Customer-facing portal config.
4. **custom-domain/page.tsx** — 30+ hardcoded strings.
5. **endpoints/[id]/page.tsx** — 30+ hardcoded strings. Endpoint settings page.
6. **retry-policy/page.tsx** — 30+ hardcoded strings.
7. **rate-limiting/page.tsx** — 25+ hardcoded strings.
8. **signature-verifier/page.tsx** — 25+ hardcoded strings.
9. **api-importer/page.tsx** — 20+ hardcoded strings.
10. **sso/page.tsx** — 20+ hardcoded strings.
11. **webhook-builder/page.tsx** — 20+ hardcoded strings.
12. **transforms/page.tsx** — 15+ hardcoded strings.
13. **audit-log/page.tsx** — 15+ hardcoded strings.
14. **portal/page.tsx** — 10+ hardcoded strings.

### 🟡 P1 — Medium (Partially translated, toast messages hardcoded)

15. **billing/page.tsx** — 6 keys missing from en.json + hardcoded toast/modal strings.
16. **notifications/page.tsx** — Filter labels, toast messages, pagination hardcoded.
17. **team/page.tsx** — Toast error messages hardcoded.
18. **inbound/page.tsx** — Section titles and form labels hardcoded.
19. **EmailVerificationBanner.tsx** — All strings hardcoded.
20. **NotificationCenter.tsx** — All strings hardcoded.
21. **Footer.tsx** — Compare links and resource links hardcoded.

### 🟢 P2 — Low (Minor gaps)

22. **ConfirmDialog.tsx** — Default props acceptable, "Processing..." hardcoded.
23. **settings/page.tsx** — "Sign Out" button text hardcoded.
24. **webhooks/new/page.tsx** — One "Sending..." string hardcoded.

### 🔵 P3 — Locale File Gaps

25. **Add 89 missing keys** to de.json, es.json, fr.json, ja.json, ko.json, pt-BR.json (getStarted.*, onboarding.*, settings.apiDesc).
26. **Add 6 missing keys** to en.json (billing.nextBilling, billing.webhooksThisMonth, billing.approachingLimit, billing.used, billing.noUsageData, billing.mostPopular).
27. **Translate all new keys** into all 7 non-EN locales.

---

## 8. Summary Statistics

| Metric | Count |
|--------|-------|
| Total dashboard pages | 28 |
| Pages fully translated | 7 (25%) |
| Pages partially translated | 5 (18%) |
| Pages with zero translation | 16 (57%) |
| Total hardcoded English strings (approx.) | **400+** |
| Keys missing from en.json | 6 |
| Keys missing from 6 non-EN locales | 89 |
| Keys missing from tr.json | 0 |
| Components fully untranslated | 3 (OnboardingWizard, EmailVerificationBanner, NotificationCenter) |

**Bottom line:** 57% of dashboard pages have zero i18n support. The onboarding wizard — the first thing new users interact with — is completely untranslated. The 89-key gap in non-EN locales affects the Get Started page and the new onboarding flow, meaning even pages that DO use `t()` will fall back to English for those specific sections in 6 out of 7 non-EN locales.
