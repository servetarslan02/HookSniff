# HookSniff — Language Bugs Report
**Date:** 2026-05-10
**Status:** Detected — not fixed yet
**Scope:** 121 TSX files, 8 translation files, 1408 hardcoded strings found

---

## 1. Critical — Wrong Language Characters (Machine Translation Bug)

| Language | Key | Issue | Value |
|----------|-----|-------|-------|
| tr.json | `a4` | Chinese character `指向` in Turkish text | "sunucu URL'inize**指向** bir endpoint oluşturun" |
| ja.json | `q4` | Korean character `어` in Japanese text | "**어떻게**始めればいいですか？" |

---

## 2. Translation Errors

### 2.1 Missing Placeholder
| Language | Key | Issue |
|----------|-----|-------|
| tr.json | `apiKeys.keyCount` | `{plural}` placeholder missing. en: `{count} key{plural}` → tr: `{count} anahtar` |

### 2.2 Meaning Shift
| Language | Key | EN | Translation | Issue |
|----------|-----|-----|-------------|-------|
| tr.json | `landing.pricing.business` | "Business" | "İş" | Plan name too short, should be "Kurumsal" |
| de.json | `deliveries.title` | "Deliveries" | "Zustellungen" | Postal context, use "Lieferungen" |
| fr.json | `deliveries.title` | "Deliveries" | "Livraisons" | Physical delivery context, use "Diffusions" |
| ko.json | `deliveries.title` | "Deliveries" | "배달" | Food delivery context, use "전달" |

### 2.3 Untranslated Terms (Should Be Translated)
| Language | Count | Terms |
|----------|-------|-------|
| tr.json | ~10 | "Dashboard" (3x), "Server", "Image" |
| de.json | ~15 | "Dashboard" (3x), "Server", "Image", "Back" |
| fr.json | ~5 | "Backoff" (technical, OK) |
| ja.json | 0 | All correct (Webhook/API/SDK are intentional) |
| ko.json | 0 | All correct |
| es.json | 0 | All correct |
| pt-BR.json | 0 | All correct |

**Note:** "Webhook", "API", "SDK", "Endpoint", "CLI" are intentionally left in English across all languages — this is standard practice.

---

## 3. Hardcoded English in Source Code

### 3.1 Pages with NO i18n (completely hardcoded)

| Priority | Page | Hardcoded Count |
|----------|------|----------------|
| 🔴 Critical | `dashboard/deliveries/[id]` | 32 |
| 🔴 Critical | `dashboard/endpoints/[id]` | 24 |
| 🔴 Critical | `dashboard/portal` | 10 |
| 🔴 Critical | `dashboard/transforms` | 11 |
| 🔴 Critical | `dashboard/portal-customize` | 27 |
| 🔴 Critical | `dashboard/rate-limiting` | 15 |
| 🔴 Critical | `dashboard/signature-verifier` | 17 |
| 🔴 Critical | `dashboard/api-importer` | 8 |
| 🔴 Critical | `dashboard/routing` | 2 |
| 🔴 Critical | `dashboard/templates` | 1 |
| 🔴 Critical | `dashboard/schemas` | 1 |
| 🔴 Critical | `get-started` | 34 |
| 🟡 Medium | `pricing` | 104 |
| 🟡 Medium | `security` | 36 |
| 🟡 Medium | `contact` | 15 |
| 🟡 Medium | `about` | 10 |
| 🟡 Medium | `terms` | 50 |
| 🟡 Medium | `privacy` | 61 |
| 🟡 Medium | `startups` | 5 |
| 🟡 Medium | `what-is-a-webhook` | 28 |
| 🟡 Medium | `providers/stripe` | 26 |
| 🟡 Medium | `providers/github` | 26 |
| 🟡 Medium | `providers/shopify` | 26 |
| 🟡 Medium | `providers` | 6 |
| 🟢 Low | `use-cases` | 146 |
| 🟢 Low | `compare/CompareContent` | 80 |
| 🟢 Low | `build-vs-buy/BuildVsBuyContent` | 31 |
| 🟢 Low | `customers` | 71 |
| 🟢 Low | `customers/[slug]` | 108 |
| 🟢 Low | `blog` | 47 |
| 🟢 Low | `blog/[slug]` | 76 |
| 🟢 Low | `newsletter` | 32 |
| 🟢 Low | `changelog` | 7 |
| 🟢 Low | `status` | 43 |
| 🟢 Low | `playground` | 81 |
| 🟢 Low | `webhooks` | 20 |
| 🟢 Low | `webhooks/guides` | 28 |
| 🟢 Low | `webhooks/glossary` | 32 |
| 🟢 Low | `alternatives/*` (8 pages) | ~120 |
| 🟢 Low | `docs/*` (11 pages) | ~120 |
| 🟢 Low | `error.tsx` | 3 |
| 🟢 Low | `not-found.tsx` | 3 |
| 🟢 Low | `admin/*` (6 pages) | ~50 |

### 3.2 Components with Hardcoded Text

| Component | Hardcoded Text |
|-----------|---------------|
| `OnboardingWizard.tsx` | 40+ items: SDK labels, step titles, descriptions |
| `Footer.tsx` | 24 items: section headers, link names |
| `ErrorBoundary.tsx` | "Something went wrong" |
| `NotificationCenter.tsx` | "Notifications" |
| `ConfirmDialog.tsx` | "Confirm", "Cancel" |
| `CodeBlock.tsx` | "Copy" |
| `SdkTabs.tsx` | "Copy" |
| `LanguageSwitcher.tsx` | "Switch language" (aria-label) |
| `EmailVerificationBanner.tsx` | "Resend" |
| `StatusBadge.tsx` | Raw status from API (delivered/failed/pending) |

### 3.3 Shared Error Messages (Hardcoded)

| File | Messages |
|------|----------|
| `lib/store.tsx` | "Not authenticated", "Login failed", "Registration failed" |
| `lib/api.ts` | "Unknown error", "AbortError" |
| `dashboard/settings/page.tsx` | "Failed to update profile", "New passwords do not match", "Failed to change password", "Failed to delete account", "Failed to save notification preferences" |
| `dashboard/billing/page.tsx` | "Cancel failed", "Upgrade failed", "Upgrade initiated" |
| `dashboard/endpoints/page.tsx` | "Failed to create endpoint", "Failed to delete", "Unknown error" |
| `dashboard/endpoints/[id]/page.tsx` | "Endpoint not found", "Failed to load endpoint", "Failed to update", "Rotation failed" |
| `dashboard/deliveries/[id]/page.tsx` | "Failed to load delivery", "Replay failed", "Failed to copy" |
| `dashboard/deliveries/page.tsx` | "Failed to load deliveries", "Replay failed" |
| `dashboard/team/page.tsx` | "Failed to load teams", "Failed to load members", "Failed to create team", "Failed to invite member", "Failed to remove member", "Failed to update role" |
| `dashboard/transforms/page.tsx` | "Failed to create rule", "Rule deleted", "Failed to delete" |
| `dashboard/inbound/page.tsx` | "Failed" |
| `dashboard/portal/page.tsx` | "Failed to load portal data" |
| `dashboard/playground/page.tsx` | "Failed to generate token", "Unknown error" |
| `dashboard/notifications/page.tsx` | "Failed to load notifications", "Failed to mark as read", "Failed to mark all as read", "Notification deleted", "Failed to delete notification" |
| `dashboard/health/page.tsx` | "Healthy", "Degraded", "Unhealthy" |
| `dashboard/analytics/page.tsx` | "Success", "Failed", "Pending" |
| `dashboard/logs/page.tsx` | "Failed to load logs" |
| `admin/users/[id]/page.tsx` | "Failed to load user details", "Failed to update plan", "Failed to update status" |
| `admin/settings/page.tsx` | "Failed to save settings" |
| `components/OnboardingWizard.tsx` | "Failed to create endpoint" |

### 3.4 Hardcoded Text in useTranslations Pages

These pages use `useTranslations` but still have hardcoded English:

| Page | Hardcoded Text |
|------|---------------|
| `dashboard/layout.tsx` | "HookSniff", "Webhook Dashboard", "Open sidebar" |
| `dashboard/inbound/page.tsx` | "How it works", "External Service", "Verify Signature", "Your Endpoint", "Add Inbound Provider" |
| `dashboard/playground/page.tsx` | "Request History", "Generated {eventType} payload" |
| `dashboard/endpoints/page.tsx` | "Description" |
| `dashboard/alerts/page.tsx` | "Name", "Condition", "Threshold", "Channels" |
| `dashboard/team/page.tsx` | "Team Name", "Email", "Role" |
| `dashboard/deliveries/page.tsx` | "Event", "Status", "Attempts", "Response", "Time" |
| `dashboard/search/page.tsx` | "Event", "Status", "Endpoint", "Attempts", "Time" |
| `dashboard/webhooks/new/page.tsx` | "Endpoint", "Event Type" |
| `dashboard/billing/page.tsx` | "Community support", "Priority support", "Dedicated support", "SLA guarantee", "Cancel Subscription" |
| `dashboard/api-keys/page.tsx` | (error fallback) |
| `contact/page.tsx` | "Contact", "Contact Us", "Email", "Location", "Response Time", "Name", "Subject", "Message", "Send us a message", "Select a topic", "General question", "Technical support", "Feature request", "Bug report", "Enterprise inquiry" |
| `about/page.tsx` | "About", "About HookSniff", "Our Mission", "Our Story", "SDK Languages", "Starting Price", "Security First", "Transparent Pricing", "Global Infrastructure" |
| `docs/page.tsx` | "API Base URL", "Authentication", "Rate Limits", "Plan", "Free" |
| `docs/layout.tsx` | "HookSniff", "Docs", "Introduction", "Quickstart", "Core Concepts", "Guides", "Webhook Security", "Dashboard", "Integrations", "Architecture", "Features", "Dead Letter Queue" |
| `docs/api/page.tsx` | "Code", "Meaning", "Description", "Bad Request", "Invalid request body or parameters" |
| `docs/sdks/page.tsx` | "Python SDK", "Installation", "Quick Start" |
| `login/page.tsx` | "HookSniff" |
| `terms/page.tsx` | 25+ hardcoded paragraphs |
| `privacy/page.tsx` | 25+ hardcoded paragraphs |
| `page.tsx` (landing) | "HookSniff" (2x), "Get Started" |
| `admin/page.tsx` | "Admin Overview" |
| `admin/users/page.tsx` | "Actions", "Created", "Email", "Name", "Plan", "Status" |
| `admin/users/[id]/page.tsx` | 15+ hardcoded labels |
| `admin/settings/page.tsx` | "Default Plan", "Free", "Max Endpoints", "Max Retry Attempts", "Pro" |
| `admin/revenue/page.tsx` | "Revenue Dashboard" |
| `admin/layout.tsx` | "Overview", "Users", "Revenue", "System", "Settings", "Access Denied", "Admin Panel", "HookSniff Management" |

### 3.5 Attribute-Level Hardcoded Text

| Type | File | Text |
|------|------|------|
| placeholder | `dashboard/settings/page.tsx` | "DELETE" |
| placeholder | `contact/page.tsx` | "Your name", "How can we help?" |
| placeholder | `blog/page.tsx` | "Search posts by title or content..." |
| title | `dashboard/endpoints/page.tsx` | "Settings" |
| title | `dashboard/deliveries/[id]/page.tsx` | "Back to deliveries", "Copy headers", "Copy payload", "Copy response body", "Replay Webhook", "Copy" |
| aria-label | `LanguageSwitcher.tsx` | "Switch language" |
| aria-label | `NotificationCenter.tsx` | "Notifications" |
| aria-label | `dashboard/layout.tsx` | "Open sidebar" |
| aria-label | `admin/layout.tsx` | "Open sidebar" |
| aria-label | `page.tsx` | "Toggle navigation" |

### 3.6 Template Literal Hardcoded Text

| File | Text |
|------|------|
| `ThemeToggle.tsx` | "Switch to {light/dark} mode" |
| `dashboard/playground/page.tsx` | "Generated {eventType} payload" |
| `dashboard/deliveries/[id]/page.tsx` | "Replay this webhook delivery to the same endpoint?" |
| `dashboard/deliveries/page.tsx` | "Replay delivery {id}… to the same endpoint?" |
| `admin/system/page.tsx` | "Checking...", "Uptime: {time}", "Latency: {ms}ms" |
| `admin/users/[id]/page.tsx` | "Plan updated to {plan}", "User banned/activated" |
| `admin/users/page.tsx` | "Plan updated to {plan}", "User banned/activated" |
| `playground/page.tsx` | "Status: {status} · {time}ms" |

### 3.7 Ternary Operator Hardcoded Text

| File | Text |
|------|------|
| `ConfirmDialog.tsx` | "Processing..." |
| `OnboardingWizard.tsx` | "Creating...", "Create Endpoint →" |
| `dashboard/playground/page.tsx` | "OK", "Redirect", "Client Error", "Server Error" |
| `dashboard/endpoints/[id]/page.tsx` | "Saving...", "Save Retry Policy", "Rotating...", "Rotate Secret" |
| `dashboard/routing/page.tsx` | "Unhealthy", "Healthy" |
| `admin/users/[id]/page.tsx` | "Ban User", "Activate User", "Active", "Inactive" |
| `admin/users/page.tsx` | "Ban", "Activate" |
| `playground/page.tsx` | "Sending...", "Send →" |
| `changelog/page.tsx` | "Hide details ↑", "Show {n} changes →" |
| `newsletter/page.tsx` | "All", "Subscribing...", "Subscribe" |
| `blog/page.tsx` | "Subscribing...", "Subscribe" |

### 3.8 Variable-Assigned Hardcoded Text

| File | Text |
|------|------|
| `OnboardingWizard.tsx` | SDK labels: "Node.js", "Python", "Go", "Rust", "C#", "Java", "Ruby", "PHP", "Kotlin", "Elixir" |
| `OnboardingWizard.tsx` | Use cases: "Payments", "Email / Notifications", "E-commerce", "SaaS Platform", "AI / Agents", "Other" |
| `OnboardingWizard.tsx` | Steps: "Create account", "Get API key", "Create first endpoint", "Send first webhook" |
| `dashboard/endpoints/[id]/page.tsx` | Retry labels: "Exponential", "Linear", "Fixed" |
| `dashboard/endpoints/[id]/page.tsx` | Descriptions: "Delay doubles each attempt...", "Delay increases linearly...", "Same delay every attempt..." |

---

## 4. Missing Translation Keys

These keys exist in `en.json` but are missing from other languages:

| Key | Missing From |
|-----|-------------|
| `settings.apiDesc` | de, ja, pt-BR, es, fr, ko |

---

## 5. Metadata Titles (SEO)

Hardcoded `<title>` tags — don't change when language switches:

| Page | Title |
|------|-------|
| `what-is-a-webhook` | "What is a Webhook? A Complete Guide — HookSniff" |
| `alternatives/webhook-relay` | "HookSniff vs Webhook Relay — Alternative" |
| `alternatives/hookdeck` | "HookSniff vs Hookdeck — Why Choose HookSniff" |
| `alternatives/svix` | "HookSniff vs Svix — Why Choose HookSniff" |
| `alternatives/hook0` | "HookSniff vs Hook0 — Why Choose HookSniff" |
| `alternatives/convoy` | "HookSniff vs Convoy — Convoy Alternative" |
| `customers/[slug]` | "Customer Stories — HookSniff" |
| `startups` | "HookSniff for Startups — Special Pricing" |
| `security` | "Security & Compliance — HookSniff" |

---

## 6. Translation File Statistics

| Language | Total Keys | Untranslated (same as EN) | Coverage |
|----------|-----------|--------------------------|----------|
| en.json | 715 | — | 100% |
| tr.json | 715 | 23 | 96.8% |
| de.json | 715 | 431 | 39.7% |
| ja.json | 715 | 410 | 42.7% |
| pt-BR.json | 715 | 422 | 41.0% |
| es.json | 715 | 420 | 41.3% |
| fr.json | 715 | 418 | 41.5% |
| ko.json | 715 | 410 | 42.7% |

**Note:** Untranslated count includes intentional technical terms (Webhook, API, SDK, Endpoint, Plan, Pro, GitHub, etc.) and footer link names. Actual untranslated UI text is lower.

---

## 7. Priority Summary

### 🔴 Critical (User directly sees, high impact)
1. Wrong language characters (tr: Chinese, ja: Korean)
2. Missing `{plural}` placeholder in tr.json
3. Dashboard detail pages (deliveries/[id], endpoints/[id], portal, transforms, portal-customize, rate-limiting, signature-verifier, api-importer)
4. Error/not-found pages
5. Shared error messages (12+ files)
6. Dashboard layout ("HookSniff", "Webhook Dashboard")
7. Components: ErrorBoundary, NotificationCenter, OnboardingWizard

### 🟡 Medium (Marketing pages, user sees on first visit)
8. Pricing, security, contact, about, terms, privacy pages
9. Login page
10. Providers pages (stripe, github, shopify)
11. Startups, what-is-a-webhook pages
12. Metadata titles (SEO)

### 🟢 Low (Content/blog, SEO-focused)
13. Docs pages (11 pages)
14. Alternatives pages (8 pages)
15. Blog, changelog, customers, use-cases, newsletter
16. Status, playground pages
17. Admin pages

---

## 8. Technical Details

- **Framework:** next-intl (`useTranslations` hook)
- **Translation files:** `dashboard/src/messages/{locale}.json`
- **Supported languages:** en, tr, de, ja, pt-BR, es, fr, ko
- **i18n config:** `dashboard/src/i18n/routing.ts`, `request.ts`, `navigation.ts`
- **URL structure:** `app/[locale]/` — locale in URL (e.g., `/tr/dashboard`)

---

## 9. Notes

- tr.json is almost fully translated; other languages have ~60% untranslated
- Some terms (Endpoint, Plan, Test, GitHub, Pricing) may be intentionally left in English
- Footer link names (GitHub, Pricing, Security) are same across languages — may be intentional
- Dashboard table headers (Event, Status, Attempts, Response, Time) use `t()` calls but values are untranslated in non-tr languages
- `dashboard/deliveries/[id]` has translation keys in `en.json` but page doesn't use them
- `dashboard/routing` page is empty — no hardcoded or translated text
- `dashboard/templates` and `dashboard/schemas` are nearly empty, just "No data" messages
- Error messages (`throw new Error`) are shown to users — should be translated
- Terms and Privacy pages are fully hardcoded — legal text needs professional translation
- StatusBadge component shows raw API status strings — should be mapped on frontend
