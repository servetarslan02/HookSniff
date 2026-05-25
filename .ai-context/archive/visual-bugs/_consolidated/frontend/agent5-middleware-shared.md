# Agent 5 — Middleware, Shared Components & Page Review

## 1. Search Page

**File:** `dashboard/src/app/[locale]/dashboard/search/page.tsx`
**Summary:** Full-text search page for webhook delivery logs with query input, status filter, paginated results table, and delivery detail navigation.

### Issues Found

#### 🔴 Critical — API Request Missing Authorization Header
The `search` function fetches from the API with `headers: {}` (empty object). The `token` from `useAuth()` is checked (`if (!token) return`) but **never sent** in the request. Every API call will be unauthenticated.

```tsx
// Line 50 — BROKEN: empty headers, no auth
const res = await fetch(`${API}/search?${params}`, {
  headers: {},
  credentials: 'include' as const,
});
```

**Fix:** Either use the `apiFetch` helper (which handles auth automatically) or add the Authorization header:
```tsx
const res = await fetch(`${API}/search?${params}`, {
  headers: { 'Authorization': `Bearer ${token}` },
  credentials: 'include',
});
```

#### 🔴 Critical — Search Fires on Every Keystroke (Race Condition)
The `search` callback has `query` and `status` in its dependency array, and `useEffect` depends on `search`. This means:
1. On mount: fires immediately (searches with empty query)
2. Every keystroke in the query input: `search` is recreated → `useEffect` fires → API call with current page (not page 1)
3. Rapid typing causes overlapping requests with no cancellation (no `AbortController`)

**Fix:** Remove `query` and `status` from `search` deps, or debounce the auto-search. Use `AbortController` to cancel stale requests:
```tsx
const search = useCallback(async (p = 1) => {
  if (!token) return;
  const controller = new AbortController();
  setLoading(true);
  try {
    // ... fetch with signal: controller.signal
  } finally {
    setLoading(false);
  }
  return () => controller.abort();
}, [token, API]); // Only token and API as deps
```

#### 🟡 Medium — Hardcoded English Strings (i18n Break)
Multiple strings bypass the `t()` translation function:
- `"Search and filter your webhook delivery logs."` (subtitle, line 78)
- `"Search"` button text (line 106)
- `"ID"`, `"Event"`, `"Status"`, `"Endpoint"`, `"Attempts"`, `"Time"` — table headers (lines 95–100)
- `"result"` / `"results"` — manual pluralization (line 126)
- `"Previous"` / `"Next"` — pagination buttons (lines 138, 150)
- `"Page {page} of {total}"` — pagination text (line 144)

The `en.json` has a `resultCount` key with ICU format `{total} result{plural}` but it's unused.

**Fix:** Replace all hardcoded strings with `t()` calls and add missing keys to the search namespace.

#### 🟡 Medium — Silent Error Handling
```tsx
} catch (e) {
  // Error handled silently
}
```
Users see stale results or empty state with no indication that something failed. Show a toast or inline error.

#### 🟢 Low — No Empty State Distinction
When `results.deliveries` is empty, there's no visual difference between "no results found" and "you haven't searched yet" — both show the same centered text area.

---

## 2. Inbound Webhooks Page

**File:** `dashboard/src/app/[locale]/dashboard/inbound/page.tsx`
**Summary:** Configuration page for receiving webhooks from external providers (Stripe, GitHub, Shopify) with provider selection, secret input, endpoint routing, and active config display.

### Issues Found

#### 🟡 Medium — Hardcoded English Strings (No i18n)
Nearly every UI string is hardcoded in English:
- `"📨 Inbound Webhooks"` title (line 52)
- `"Receive webhooks from Stripe, GitHub, Shopify..."` subtitle (line 53)
- `"How it works"` section (line 62)
- Flow diagram: `"External Service"`, `"POST /v1/inbound/:provider"`, `"Verify Signature"`, `"Your Endpoint"` (lines 66–74)
- `"Add Inbound Provider"` (line 78)
- `"Webhook Secret"` label (line 88)
- `"From {provider} dashboard → Webhooks → Signing secret"` hint (line 91)
- `"Route to Endpoint"` label (line 95)
- `"Select endpoint..."` placeholder (line 98)
- `"Your Inbound URLs"` section (line 108)
- `"Active Configs"` section (line 122)
- `"Not set"` fallback (line 130)
- `"+ Add Provider"` button (line 57)

Only 3 keys use `t()`: `configCreated`, `configFailed`, `active`, `disabled` (root namespace).

**Fix:** Add `inbound` namespace to `en.json` and replace all hardcoded strings.

#### 🟡 Medium — Inconsistent API_BASE Pattern
```tsx
const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');
```
Other pages use `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1'` (simpler fallback). This inconsistency could cause different behavior between pages. Should use the `apiFetch` helper or a shared constant.

#### 🟡 Medium — No Copy Feedback
The "Copy" button next to each inbound URL has no visual feedback after clicking. Users don't know if the copy succeeded.

**Fix:** Add a brief "Copied!" state with `setTimeout`.

#### 🟢 Low — No Delete/Edit for Existing Configs
Active configs are displayed but there's no way to delete, edit, or toggle them from the UI. Users can only view.

#### 🟢 Low — No Empty State for Configs
When `configs.length === 0`, the "Active Configs" section simply doesn't render. A helpful empty state ("No inbound configs yet — add one above") would improve UX.

---

## 3. API Importer Page

**File:** `dashboard/src/app/[locale]/dashboard/api-importer/page.tsx`
**Summary:** Imports endpoints from OpenAPI/Swagger specifications. Supports URL fetch and JSON paste modes with endpoint selection and batch creation.

### Issues Found

#### 🟡 Medium — No i18n at All
Every single string is hardcoded in English:
- `"📥 API Spec Importer"` title
- `"Import endpoints from an OpenAPI/Swagger specification..."` subtitle
- `"🔗 From URL"` / `"📋 Paste JSON"` mode buttons
- `"OpenAPI Spec URL"` / `"Paste OpenAPI JSON"` labels
- `"Fetch"` / `"Parse"` buttons
- `"Deselect All"` / `"Select All"` toggle
- `"Import X Endpoints"` button
- `"Select at least one endpoint"` error
- `"Imported X/Y endpoints"` toast
- `"Supported Formats"` section
- All format descriptions

**Fix:** Add `apiImporter` namespace to translation files.

#### 🟡 Medium — YAML Not Supported Despite Claims
The "Supported Formats" section lists `"OpenAPI 3.0 — .json / .yaml"` but `parseOpenApiSpec` only calls `JSON.parse()`. YAML specs will fail silently (returns `null`).

**Fix:** Either add a YAML parser (`js-yaml`) or remove `.yaml` from the supported formats list.

#### 🟡 Medium — CORS Will Block URL Fetches
```tsx
const res = await fetch(specUrl);
```
Fetching arbitrary cross-origin URLs from the browser will fail due to CORS unless the target server allows it. Most OpenAPI spec servers don't set CORS headers.

**Fix:** Proxy the fetch through the backend API: `${API}/proxy/fetch?url=${encodeURIComponent(specUrl)}`

#### 🟡 Medium — Sequential Endpoint Import
```tsx
for (const ep of selected) {
  await endpointsApi.create(token, { ... });
}
```
Endpoints are imported one at a time. For large specs (50+ endpoints), this is very slow.

**Fix:** Use `Promise.allSettled()` with a concurrency limiter (e.g., p-limit or manual batching).

#### 🟢 Low — No Loading State for Fetch/Parse
The "Fetch" button has no loading indicator while the spec is being downloaded.

#### 🟢 Low — Sample Spec Placeholder May Confuse
The `sampleSpec` is used as a `placeholder` attribute on the textarea, but it's a multi-line JSON string. Placeholders in textareas are single-render and will look odd.

---

## 4. Webhooks New (Send Test Webhook) Page

**File:** `dashboard/src/app/[locale]/dashboard/webhooks/new/page.tsx`
**Summary:** Test webhook sending interface with endpoint selection, event type input, JSON payload editor, response viewer, and JSON validation.

### Issues Found

#### 🟡 Medium — Hardcoded English Strings
Several strings bypass `t()`:
- `"Endpoint"` label (line 68)
- `"Event Type"` label (line 77)
- `"Payload (JSON)"` label (line 84)
- `"Sending..."` loading text (line 112) — should use a translation key
- `"📡"` emoji + description in empty response state

#### 🟡 Medium — Response Panel Not Dark-Mode Aware
```tsx
<pre className="bg-gray-900 text-green-400 p-4 rounded-xl ...">
```
The response `<pre>` block always uses dark styling regardless of the user's theme preference. In dark mode it looks fine; in light mode it's a jarring dark block.

**Fix:** Use `dark:bg-gray-900 bg-gray-100 dark:text-green-400 text-green-700` or similar.

#### 🟢 Low — Endpoint Dropdown Shows Raw URLs
The endpoint `<select>` shows raw URLs which can be very long and overflow. Consider truncating with CSS or showing a description alongside.

#### 🟢 Low — No Keyboard Shortcut for Send
Common developer tool pattern: Ctrl+Enter to send. Not implemented.

---

## 5. Retry Policy Page

**File:** `dashboard/src/app/[locale]/dashboard/retry-policy/page.tsx`
**Summary:** Global retry policy configuration with backoff strategy, delay settings, dead letter queue toggle, status code selection, and a visual delay preview.

### Issues Found

#### 🔴 Critical — Fetch Logic Maps Endpoint Data Incorrectly
```tsx
const data = await apiFetch<Array<{ max_attempts: number; base_delay_ms: number; max_delay_ms: number; multiplier: number }>>('/endpoints', { token });
```
This calls `/endpoints` which returns **endpoint objects** (id, url, description, etc.), not retry policy objects. The type assertion is wrong. `data[0].max_attempts` etc. will be `undefined`.

**Fix:** Either fetch from a dedicated `/retry-policy/default` endpoint, or fetch each endpoint's retry policy individually.

#### 🟡 Medium — Save Applies Policy to ALL Endpoints Individually
```tsx
for (const ep of endpoints) {
  await apiFetch(`/endpoints/${ep.id}/retry-policy`, { method: 'PUT', ... });
}
```
This iterates through every endpoint and updates them one by one. Issues:
- **N+1 problem:** For 100 endpoints, this makes 100 API calls
- **Partial failure:** Some endpoints may update while others fail, leaving inconsistent state
- **No progress feedback:** User sees "Saving..." with no indication of progress

**Fix:** Add a dedicated `PUT /retry-policy/global` backend endpoint, or at minimum use `Promise.allSettled()` with progress feedback.

#### 🟡 Medium — No i18n at All
Every string is hardcoded: "Retry Policy", "Retry Settings", "Max Attempts", "Backoff Strategy", "Exponential", "Linear", "Fixed", "Initial Delay", "Max Delay", "Request Timeout", "Dead Letter Queue", "Enable DLQ", "Max Age", "Retry on Status Codes", "Delay Preview", "Total retry time", etc.

#### 🟡 Medium — Plain Anchor Breaks Locale Routing
```tsx
<a href="/dashboard/endpoints" className="underline">Endpoint Settings</a>
```
This is a plain `<a>` tag, not a locale-aware `<Link>`. For non-English locales (e.g., `/tr/dashboard/retry-policy`), this link will navigate to `/dashboard/endpoints` without the locale prefix, causing a redirect or 404.

**Fix:** Use `import { Link } from '@/i18n/navigation'` and `<Link href="/dashboard/endpoints">`.

#### 🟡 Medium — Toggle Not Keyboard Accessible
The DLQ toggle uses a visually styled `<div>` with a hidden `<input className="sr-only">`. The checkbox is `sr-only` (screen-reader only) and positioned behind the visual toggle. While it works for screen readers, the visual toggle doesn't respond to keyboard focus styling.

**Fix:** Add `focus:ring-2 focus:ring-brand-500` to the hidden checkbox and ensure the visual indicator reflects focus state.

#### 🟡 Medium — Missing Common Retryable Status Codes
The `STATUS_CODES` array is missing:
- `409 Conflict` — common in webhook scenarios
- `422 Unprocessable Entity` — validation errors that may be transient

#### 🟢 Low — Delay Preview Recalculates on Every Render
`getDelayPreview()` is called in the JSX without memoization. It recalculates on every render.

**Fix:** Wrap in `useMemo` with policy dependencies.

#### 🟢 Low — `parseInt` Without Validation
```tsx
onChange={(e) => setPolicy({ ...policy, default_max_attempts: parseInt(e.target.value) || 5 })}
```
Typing "0" results in `parseInt("0") || 5 = 5`. Negative values or very large numbers aren't clamped despite `min`/`max` attributes on the input.

---

## 6. AuthGuard Component

**File:** `dashboard/src/components/AuthGuard.tsx`
**Summary:** Client-side auth gate that redirects unauthenticated users to `/login`. Shows loading spinner during auth state resolution.

### Issues Found

#### 🟡 Medium — Hardcoded English Strings
- `"Loading..."` (line 17)
- `"Redirecting to login..."` (line 27)

**Fix:** Use `useTranslations('common')` or pass as props.

#### 🟡 Medium — No Dark Mode Support
```tsx
<div className="min-h-screen bg-gray-50 flex items-center justify-center">
```
Both loading and redirect states use `bg-gray-50` (light mode only). In dark mode, this creates a jarring light flash.

**Fix:** Add `dark:bg-slate-950` and dark mode text colors.

#### 🟡 Medium — Double Render on Redirect
When `!token`, the component renders both the "Redirecting to login..." spinner AND triggers `router.push('/login')` via `useEffect`. The user briefly sees the redirect spinner before navigation completes. Consider showing nothing (return `null`) during redirect.

#### 🟢 Low — No Auth State Recovery
If the `/auth/me` call in the store fails due to a network error (not actual unauthenticated state), the user gets redirected to login. Consider distinguishing between "not authenticated" and "network error" states.

---

## 7. Onboarding Component

**File:** `dashboard/src/components/Onboarding.tsx`
**Summary:** Multi-step onboarding modal with illustrations, progress tracking, and step navigation. Uses localStorage to track completion. Separately exports a `useOnboarding` hook.

### Issues Found

#### 🟢 Low — All Good (Well-Implemented)
This is one of the best-implemented components reviewed:
- ✅ Fully i18n'd with `useTranslations('onboarding')` — all keys exist in en.json
- ✅ Uses locale-aware `useRouter` from `@/i18n/navigation`
- ✅ Dark mode fully supported
- ✅ Clean step navigation with progress bar
- ✅ Proper localStorage persistence

#### 🟢 Low — `useOnboarding` Hook Duplicates Logic
The `useOnboarding` hook and the `Onboarding` component both check `localStorage.getItem(STORAGE_KEY)` independently. If both are used on the same page, there's redundant localStorage access.

#### 🟢 Low — No Escape Key to Dismiss
The modal overlay can only be dismissed via the "Skip tour" button or clicking the backdrop. Adding `onKeyDown` for Escape would improve accessibility.

---

## 8. OnboardingWizard Component

**File:** `dashboard/src/components/OnboardingWizard.tsx`
**Summary:** Full onboarding wizard with 6 steps: welcome, use case selection, SDK choice, endpoint creation, test webhook, and completion with confetti. Also exports `SetupChecklist` and `SuccessToast`.

### Issues Found

#### 🔴 Critical — All Step Content Hardcoded in English (i18n Keys Exist But Unused)
Despite `en.json` having a full `onboarding` namespace with 45+ keys, the wizard uses **zero** `t()` calls. Every string is hardcoded:

| Hardcoded String | Translation Key (exists in en.json) |
|---|---|
| `"Welcome to HookSniff! 🪝"` | `onboarding.welcomeTitle` |
| `"Let's get your webhooks set up..."` | `onboarding.welcomeWizardDesc` |
| `"What are you building?"` | `onboarding.whatBuilding` |
| `"Choose your SDK"` | `onboarding.chooseSdk` |
| `"Install Command"` | `onboarding.installCommand` |
| `"Continue →"` | `onboarding.continue` |
| `"Create your first endpoint"` | `onboarding.createFirstEndpoint` |
| `"Endpoint URL"` | `onboarding.endpointUrl` |
| `"Send a test webhook"` | `onboarding.sendTestWebhook` |
| `"I've sent a test"` | `onboarding.iveSentTest` |
| `"You're all set! 🎉"` | `onboarding.allSetTitle` |
| `"Skip setup"` | `onboarding.skipSetup` |
| `"Setup Progress"` | `onboarding.setupProgress` |
| ... and 20+ more | ... |

**Fix:** Add `const t = useTranslations('onboarding')` and replace all hardcoded strings.

#### 🔴 Critical — Plain `<a>` Tags Break Locale Routing
All internal links use plain `<a href="...">` instead of the locale-aware `<Link>`:
- `<a href="/playground">` (line 347) — also missing `/dashboard` prefix!
- `<a href="/dashboard/playground">` (line 384)
- `<a href="/dashboard/endpoints">` (line 413)
- `<a href="/dashboard/deliveries">` (line 417)
- `<a href="/dashboard/playground">` (line 421)
- `<a href="/dashboard/api-keys">` (line 425)
- SetupChecklist `href={item.href}` (line 591)

For non-English locales, these links will navigate to the wrong path (no locale prefix), causing a redirect or 404.

**Fix:** Import and use `<Link>` from `@/i18n/navigation` for all internal links.

#### 🟡 Medium — Missing `/dashboard` Prefix
Line 347: `<a href="/playground">` should be `<a href="/dashboard/playground">`.

#### 🟡 Medium — Confetti Animation Doesn't Fall
```tsx
className="absolute animate-bounce"
```
The confetti pieces use `animate-bounce` which makes them bounce in place. Combined with `top: '-10px'`, they just bounce at the top of the screen and never fall down.

**Fix:** Create a custom `@keyframes confetti-fall` animation that moves from `top: -10px` to `top: 110vh` with horizontal drift.

#### 🟡 Medium — `handleFinish` Dismisses Before Navigating
```tsx
const handleFinish = () => {
  setShowConfetti(true);
  setTimeout(() => setShowConfetti(false), 3000);
  dismiss();           // Sets dismissed: true, hides wizard
  router.push('/dashboard');  // Navigate
};
```
The wizard disappears immediately (via `dismiss()`) before the confetti finishes or the navigation completes. The confetti will show for a moment with no wizard behind it.

**Fix:** Delay `dismiss()` until after navigation or confetti completion.

#### 🟢 Low — No `user.name` Fallback Chain
```tsx
Welcome, {user.name || user.email.split('@')[0]}!
```
If `user.name` is an empty string `""`, it's falsy, so the fallback triggers. This is fine, but `user.name` could be `undefined` — the fallback handles it.

#### 🟢 Low — SDK List Is Hardcoded
The 11 SDKs are hardcoded in the component. If the product adds more SDKs, this component needs updating. Consider fetching from an API or config.

---

## 9. Sidebar (in Dashboard Layout)

**File:** `dashboard/src/app/[locale]/dashboard/layout.tsx`
**Summary:** Dashboard layout shell with responsive sidebar navigation, top bar, auth guard, and page content area. The sidebar contains 25+ navigation items with icons.

### Issues Found

#### 🔴 Critical — Locale Prefix Regex Missing `'en'`
```tsx
const localePrefix = pathname.match(/^\/(tr|de|ja|pt-BR|es|fr|ko)(\/|$)/);
```
The regex matches `tr|de|ja|pt-BR|es|fr|ko` but **NOT `en`**. Since `localePrefix: 'always'` in the routing config, English URLs are `/en/dashboard/...`. The regex won't match `/en/...`, so:

- `cleanPath` for `/en/dashboard/endpoints` → `/en/dashboard/endpoints` (wrong! should be `/dashboard/endpoints`)
- **All active state detection breaks** for English users: `cleanPath === item.href` will never match
- **Page title breaks**: `navigation.find((n) => n.href === cleanPath)` returns undefined
- **`getLocalizedHref` breaks**: For English, it returns the href unchanged (no prefix), but the href already has no prefix, so links navigate to `/dashboard/endpoints` without `/en/` → redirect loop

**Fix:** Include `'en'` in the regex:
```tsx
const localePrefix = pathname.match(/^\/(en|tr|de|ja|pt-BR|es|fr|ko)(\/|$)/);
```

#### 🟡 Medium — Hardcoded Navigation Labels
Several navigation items use hardcoded English instead of `t()`:
- `'🚀 Get Started'` (line 34)
- `'⚡ Rate Limiting'` (line 46)
- `'🔐 Signature Tool'` (line 47)
- `'📥 API Importer'` (line 48)
- `'🖼️ Portal Customize'` (line 49)
- `'🔧 Webhook Builder'` (line 50)
- `'📋 Audit Log'` (line 51)
- `'🔐 SSO / SAML'` (line 52)
- `'🔄 Retry Policy'` (line 53)
- `'🌐 Custom Domain'` (line 54)

These are 10 out of 25 navigation items — 40% are not translated.

**Fix:** Add these keys to the `nav` namespace in all translation files.

#### 🟡 Medium — Sidebar Has No Scroll for Many Items
With 25+ items, the sidebar `<nav>` has no `overflow-y-auto`. On shorter screens, items below the fold are inaccessible.

**Fix:** Add `overflow-y-auto` to the nav and account for the bottom-anchored controls.

#### 🟢 Low — Emoji Icons in Navigation
All navigation items use emoji as icons (`🚀`, `📊`, `🔗`, etc.). While functional, emoji render differently across platforms and can look inconsistent. Consider using an icon library (Lucide, Heroicons) for a more polished look.

#### 🟢 Low — Bottom Controls May Overlap Navigation
The LanguageSwitcher and ThemeToggle are `absolute bottom-4` positioned. If the navigation list is long enough, the last items may be hidden behind these controls.

---

## 10. Middleware

**File:** `dashboard/src/middleware.ts`
**Summary:** Minimal Next.js middleware that delegates entirely to `next-intl/middleware` for locale detection and routing. Matcher excludes API routes, Next.js internals, and static files.

### Issues Found

#### 🟡 Medium — No Edge-Level Auth Protection
The middleware only handles locale routing. There's no auth check at the edge, meaning:
- Unauthenticated users can load `/en/dashboard/...` pages
- The page renders, then client-side `AuthGuard` kicks in and redirects
- Users briefly see the dashboard layout (with sidebar) before being redirected to login
- This is a UX flash and a minor security concern (page HTML is served to unauthenticated users)

**Fix:** Add auth cookie check in middleware for `/dashboard/*` routes:
```tsx
import { NextRequest, NextResponse } from 'next/server';

export default function middleware(request: NextRequest) {
  // Check auth for dashboard routes
  if (request.nextUrl.pathname.includes('/dashboard')) {
    const session = request.cookies.get('session');
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  return createMiddleware(routing)(request);
}
```

#### 🟢 Low — No Security Headers
The middleware doesn't set any security headers (CSP, X-Frame-Options, etc.). These are typically better set in `next.config.js`, but the middleware is a good place for dynamic headers.

#### 🟢 Low — Matcher May Not Cover All Cases
```tsx
matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
```
The `.*\\..*` pattern excludes anything with a dot (e.g., file extensions). This is standard but could accidentally exclude routes like `/dashboard/api-keys` (no dot, so it's fine) or `/dashboard/my.domain` (would be excluded).

---

## 11. i18n Routing Config

**File:** `dashboard/src/i18n/routing.ts`
**Summary:** Defines supported locales, default locale, and locale prefix strategy for next-intl.

### Issues Found

#### 🟢 Low — `localePrefix: 'always'` Adds Prefix to Default Locale
With `localePrefix: 'always'`, even the default English locale gets `/en/` prefix in URLs. This is non-standard (many sites use no prefix for the default locale). However, it's a valid choice if intentional.

#### 🟢 Low — Navigation Helper Is Clean
`dashboard/src/i18n/navigation.ts` correctly exports locale-aware `Link`, `redirect`, `usePathname`, and `useRouter`. No issues.

---

## 12. Global State Store

**File:** `dashboard/src/lib/store.tsx`
**Summary:** React context-based auth store providing user info, session management (cookie-based), login/register/logout, and API key handling. Persists user info to localStorage, verifies session via `/auth/me` on mount.

### Issues Found

#### 🟡 Medium — `token` Is a Sentinel String, Not an Actual Token
```tsx
setToken('cookie'); // Indicates session is active via cookie
```
The `token` value is always the string `'cookie'` when authenticated. Components that check `if (!token)` work, but any component that tries to use `token` as an actual Bearer token will send `Authorization: Bearer cookie` — which is wrong.

The `apiFetch` helper handles this correctly (always sends `Bearer ${token}` which becomes `Bearer cookie`, and also sends `credentials: 'include'` for the real cookie). But the search page's raw `fetch` doesn't send auth at all (see Issue #1 in Search Page).

**Fix:** Document clearly that `token` is a boolean-like sentinel. Consider renaming to `isAuthenticated: boolean` to avoid confusion.

#### 🟡 Medium — Stale User Data in localStorage
```tsx
localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u }));
```
User info is cached in localStorage. If the user's plan changes, name changes, or admin status changes on the server, the client shows stale data until the next `/auth/me` call (which only happens on page load/refresh).

**Fix:** Consider not caching user info in localStorage, or adding a staleness check (e.g., cache with timestamp, refresh if older than 5 minutes).

#### 🟡 Medium — Logout Doesn't Await Server Response
```tsx
const logout = useCallback(async () => {
  fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' })
    .catch((err) => console.warn('Logout request failed:', err));
  setToken(null);     // Immediate local clear
  setUser(null);
  localStorage.removeItem(STORAGE_KEY);
}, []);
```
Local state is cleared immediately, but the server-side logout (cookie invalidation) is fire-and-forget. If the user immediately navigates to a page that checks the cookie, the cookie might still be valid. This is usually fine but could cause a brief "logged in" state after logout.

#### 🟢 Low — `API_BASE` Computed in Multiple Places
The `API_BASE` constant is computed inside `useEffect`, `login`, `register`, and `logout` callbacks. It should be a module-level constant (computed once) for cleanliness, though the performance impact is negligible since it's a simple ternary.

---

## Cross-Cutting Issues Summary

### 🔴 Critical Issues (5 total)
| # | Component | Issue |
|---|---|---|
| 1 | Search Page | Missing Authorization header in API request |
| 2 | Search Page | Race condition — search fires on every keystroke |
| 3 | Retry Policy | `/endpoints` data mapped to wrong type (retry policy fields) |
| 4 | Dashboard Layout | Locale prefix regex missing `'en'` — breaks active state for English users |
| 5 | OnboardingWizard | All content hardcoded in English despite translation keys existing |

### 🟡 Medium Issues (20+ total)
- **Widespread i18n gaps:** Search, Inbound, API Importer, Retry Policy, OnboardingWizard, and Dashboard Layout all have significant hardcoded English strings
- **Plain `<a>` tags in locale-aware context:** OnboardingWizard and Retry Policy use `<a href>` instead of locale-aware `<Link>`, breaking non-English navigation
- **No edge-level auth:** Middleware doesn't protect dashboard routes, causing content flash
- **CORS issues:** API Importer's URL fetch will fail for most cross-origin specs
- **N+1 save pattern:** Retry Policy saves to each endpoint individually
- **No error feedback:** Search page silently swallows errors

### 🟢 Low Issues (15+ total)
- Missing dark mode in AuthGuard
- Confetti animation doesn't fall
- No keyboard shortcuts (Ctrl+Enter to send)
- Sidebar has no scroll for many items
- `token` sentinel string is confusing
- Various minor UX improvements
