# Dashboard Core Pages — Code Review

**Reviewed:** 2026-05-10  
**Scope:** 7 core dashboard pages (main, layout, endpoints, endpoint detail, deliveries, delivery detail, logs)  
**App:** HookSniff — Next.js 15 + `next-intl` + Recharts + Tailwind

---

## 1. `dashboard/src/app/[locale]/dashboard/page.tsx` — Main Dashboard

**Summary:** Overview page with stats cards, delivery trend area chart, success rate donut, live activity feed, and recent deliveries table. Uses `useTranslations('dashboard')` and `useTranslations('common')`.

### Issues

#### 🔴 Critical — `router.push` navigates without locale prefix (inherited from layout)
The `Link` components use `href="/dashboard/deliveries"` etc. These use the `Link` from `@/i18n/navigation` which should auto-prefix locale, but the hardcoded paths are a fragile pattern — any deviation breaks non-default locales.

**Actually:** On closer inspection, the `Link` from `@/i18n/navigation` should handle locale prefixing automatically. This is fine for `Link` but see layout issues below for `router.push`.

#### 🟡 Medium — `token!` non-null assertion passes potentially `null` to `<ActivityFeed>`
```tsx
<ActivityFeed token={token!} />
```
`token` comes from `useAuth()` which can be `null`. The `if (!token) return` guard only exists inside `useEffect`, but the component still renders with a `null` token. The `token!` assertion silences the TS error but the API call will fail silently.

**Fix:** Guard rendering: `{token && <ActivityFeed token={token} />}` or handle `null` inside ActivityFeed.

#### 🟡 Medium — `SuccessRateDonut` falls back to raw string for `tc('failed')` and `tc('pending')`
```tsx
{ name: tc('failed') || 'Failed', value: data?.failed ?? 0 },
{ name: tc('pending') || 'Pending', value: data?.pending ?? 0 },
```
The `||` fallback will never trigger if the translation key exists (even if empty string). If the key is missing, `next-intl` throws. This is defensive but the pattern is inconsistent — `tc('success')` has no fallback.

**Fix:** Either all use fallbacks or none. Since `next-intl` throws on missing keys, the `||` is dead code. Remove it.

#### 🟡 Medium — `AnimatedCounter` doesn't handle negative values well
The easing function `1 - Math.pow(1 - progress, 3)` works for positive diffs, but if `value` decreases (e.g., stats refresh), the counter still animates correctly since `diff` can be negative. However, `Math.round` can produce `-0` for very small negative values. Minor but worth noting.

#### 🟢 Low — Skeleton shows 6 cards but actual stat cards are also 6 — fragile coupling
```tsx
{[...Array(6)].map((_, i) => ...)}
```
If `statCards` array changes length, skeleton won't match. Use `statCards.length` or a constant.

#### 🟢 Low — `useTranslations('dashboard')` called at top-level component AND in child components
Each call to `useTranslations` is a hook call. This is fine in React but creates multiple hook instances. No bug, just noting the pattern.

#### 🟢 Low — Recharts `id` attributes for gradients are global
```tsx
<linearGradient id="colorSuccess" ...>
<linearGradient id="colorFailed" ...>
```
If this component renders twice (unlikely but possible), gradient IDs collide. Use `useId()` or unique prefixes.

#### 🟢 Low — `ActivityFeed` polls every 5 seconds unconditionally
No cleanup on unmount is handled correctly (`clearInterval` in return), but the 5s interval is aggressive for a dashboard that may be backgrounded. Consider `requestIdleCallback` or `visibilitychange` throttling.

#### 🟢 Low — Hardcoded strings in stat card table headers
```tsx
<th ...>ID</th>
<th ...>Event</th>
<th ...>Status</th>
<th ...>Attempts</th>
<th ...>Time</th>
```
These should use `t()` or `tc()` translations. Currently hardcoded English.

#### 🟢 Low — `StatusDot` and `StatusBadge` used inconsistently
The activity feed uses `StatusDot` (custom component) while the recent deliveries table uses `StatusBadge` from tremor. Minor visual inconsistency.

---

## 2. `dashboard/src/app/[locale]/dashboard/layout.tsx` — Dashboard Layout

**Summary:** Shell layout with sidebar navigation, top bar, auth guard, theme toggle, language switcher. Wraps all dashboard pages.

### Issues

#### 🔴 Critical — `router.push` navigations DON'T include locale prefix
```tsx
onClick={() => { logout(); router.push(getLocalizedHref('/login')); }}
```
The `router` is from `@/i18n/navigation` — BUT the `getLocalizedHref` function manually prepends the locale. If `router` from `@/i18n/navigation` already handles locale, this double-prefixes (e.g., `/en/en/login`). If it doesn't handle locale, then `router.push('/login')` would break.

**The actual bug:** The `router` from `@/i18n/navigation` **does** handle locale. So `getLocalizedHref('/login')` produces `/en/login`, and then `router.push('/en/login')` might produce `/en/en/login` depending on implementation. This is a **routing bug**.

**Fix:** Use `router.push('/login')` directly (let the i18n router handle locale), OR verify `router.push` doesn't auto-prefix and `getLocalizedHref` is correct. One of these is wrong.

#### 🔴 Critical — Hardcoded locale list in regex misses some locales
```tsx
const localePrefix = pathname.match(/^\/(tr|de|ja|pt-BR|es|fr|ko)(\/|$)/);
```
This only matches 7 locales. If the app adds `zh`, `ru`, `ar`, etc., navigation matching breaks silently. Also, `next-intl` typically provides a `useLocale()` hook.

**Fix:** Use `useLocale()` from `next-intl` instead of regex parsing:
```tsx
const locale = useLocale();
const cleanPath = pathname.replace(new RegExp(`^/${locale}`), '') || '/';
```

#### 🟡 Medium — Hardcoded navigation names not translated
```tsx
{ name: '🚀 Get Started', href: '/get-started', icon: '🚀' },
{ name: '⚡ Rate Limiting', href: '/dashboard/rate-limiting', icon: '⚡' },
{ name: '🔐 Signature Tool', href: '/dashboard/signature-verifier', icon: '🔐' },
{ name: '📥 API Importer', href: '/dashboard/api-importer', icon: '📥' },
{ name: '🖼️ Portal Customize', href: '/dashboard/portal-customize', icon: '🖼️' },
{ name: '🔧 Webhook Builder', href: '/dashboard/webhook-builder', icon: '🔧' },
{ name: '📋 Audit Log', href: '/dashboard/audit-log', icon: '📋' },
{ name: '🔐 SSO / SAML', href: '/dashboard/sso', icon: '🔐' },
{ name: '🔄 Retry Policy', href: '/dashboard/retry-policy', icon: '🔄' },
{ name: '🌐 Custom Domain', href: '/dashboard/custom-domain', icon: '🌐' },
```
10 out of 26 navigation items have hardcoded English names. Others use `t()`. Inconsistent i18n.

**Fix:** Add translation keys for all navigation items.

#### 🟡 Medium — Active state matching uses `cleanPath === item.href` (exact match only)
```tsx
const isActive = cleanPath === item.href;
```
This means `/dashboard/endpoints/abc123` won't highlight the "Endpoints" nav item. Users lose context on sub-pages.

**Fix:** Use `cleanPath.startsWith(item.href)` for parent routes (but not for `/dashboard` which would match everything).

#### 🟡 Medium — `LanguageSwitcher` rendered twice
Once in the sidebar bottom and once in the top bar header. Redundant UI.

**Fix:** Keep only the sidebar one, or make the top bar one conditional on mobile (where sidebar is hidden).

#### 🟢 Low — Emoji as icons in navigation
Using emoji (`📊`, `🔗`, etc.) as nav icons is fragile across platforms. They render differently on Windows, macOS, Linux, and mobile. Consider using an icon library (Lucide, Heroicons).

#### 🟢 Low — Mobile sidebar toggle doesn't use `aria-expanded`
```tsx
<button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
```
Missing `aria-expanded={sidebarOpen}` attribute. Accessibility issue.

#### 🟢 Low — No skip-to-content link
The layout has no skip navigation link for keyboard/screen reader users.

---

## 3. `dashboard/src/app/[locale]/dashboard/endpoints/page.tsx` — Endpoints List

**Summary:** Lists webhook endpoints with create form, bulk select/delete, and navigation to detail page.

### Issues

#### 🔴 Critical — `router.push` uses non-localized path
```tsx
onClick={() => router.push(`/dashboard/endpoints/${ep.id}`)}
```
`router` from `@/i18n/navigation` should handle locale, but this is inconsistent with the layout's `getLocalizedHref` pattern. If the layout manually prepends locale but this page doesn't, navigation will break for non-default locales.

**Fix:** Verify whether `router.push` from `@/i18n/navigation` auto-prefixes. If yes, this is fine. If no, this is broken.

#### 🟡 Medium — Hardcoded strings not translated
```tsx
<button>+ New Endpoint</button>  // Should use t('newEndpoint')
<div>No endpoints yet. Create one to start receiving webhooks.</div>  // Should use t('empty')
<label>URL</label>  // Should use t('form.url')
<label>Description</label>  // Should use t('form.description')
<button>Cancel</button>  // Should use tc('cancel')
<span>Select all ({endpoints.length})</span>  // Not translated
<button>🗑 Delete {selected.size} selected</button>  // Not translated
<button>Deleting...</button>  // Should use tc('deleting')
```
Multiple hardcoded English strings in the UI.

#### 🟡 Medium — `handleDelete` sets `deleteId` but doesn't actually delete
```tsx
const handleDelete = async (id: string) => {
  if (!token) return;
  setDeleteId(id);  // Just opens the confirm dialog
};
```
The function is `async` but doesn't await anything. The `async` keyword is unnecessary and misleading. The actual deletion happens in `confirmDelete`. This is fine functionally but the `async` signature is a code smell.

#### 🟡 Medium — Bulk delete doesn't confirm with user
```tsx
const handleBulkDelete = async () => {
  // No confirmation dialog before bulk delete!
  for (const id of selected) { ... }
```
Single delete requires `ConfirmDialog`, but bulk delete of potentially many endpoints happens immediately on click. Data loss risk.

**Fix:** Add a confirmation dialog for bulk delete.

#### 🟡 Medium — `endpointsApi.list` returns `Endpoint[]` directly, not paginated
```tsx
endpointsApi.list(token).then(setEndpoints)
```
The API returns `Endpoint[]` (no pagination). If a user has hundreds of endpoints, the entire list loads at once. No virtualization.

#### 🟢 Low — Error in create form uses `setError` but error display doesn't auto-dismiss
The error message persists until the user clicks "Cancel" or submits again. No timeout or dismiss button.

#### 🟢 Low — Checkbox accessibility
```tsx
<input type="checkbox" checked={selected.has(ep.id)} onChange={() => toggleSelect(ep.id)} />
```
No `aria-label` or associated `<label>` for screen readers on individual endpoint checkboxes.

---

## 4. `dashboard/src/app/[locale]/dashboard/endpoints/[id]/page.tsx` — Endpoint Detail

**Summary:** Endpoint settings page with retry policy configuration, signing secret rotation, rate limit info, and test webhook sender.

### Issues

#### 🔴 Critical — Missing `useTranslations` — ALL strings are hardcoded English
This page has **zero** `useTranslations` calls. Every single string is hardcoded:
- "Endpoint Settings", "Retry Policy", "Max Attempts", "Backoff Strategy", "Exponential", "Linear", "Fixed", "Initial Delay", "Max Delay", "Retry Schedule Preview", "Save Retry Policy", "Signing Secret", "Rotate Secret", "Rate Limits", "API Requests", "Avg Response", "Failure Streak", "Test Webhook", "Send Test Webhook", "Cancel", "Rotate Signing Secret?", etc.

This is a **complete i18n failure** for this page.

**Fix:** Add `useTranslations` and replace all hardcoded strings.

#### 🔴 Critical — `router.push` uses non-localized path
```tsx
router.push('/dashboard/endpoints')
```
Same locale issue as other pages.

#### 🟡 Medium — `fetchEndpoint` fetches ALL endpoints to find one by ID
```tsx
const all = await endpointsApi.list(token);
const ep = all.find((e) => e.id === id);
```
This is an N+1 pattern — fetches every endpoint to find one. The API likely has a `GET /endpoints/:id` but the client doesn't use it.

**Fix:** Use `apiFetch<Endpoint>(`/endpoints/${id}`, { token })` directly or add a `get` method to `endpointsApi`.

#### 🟡 Medium — `handleRotateSecret` uses raw `fetch` instead of `apiFetch`
```tsx
const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1'}/endpoints/${id}/rotate-secret`,
  { method: 'POST', headers: {}, credentials: 'include' as const }
);
```
This bypasses the centralized `apiFetch` which handles auth headers, timeouts, 401 refresh, and error handling. The `Authorization: Bearer` header is NOT sent here (empty `headers: {}`), so this will fail if the API requires auth via header (vs cookie).

**Fix:** Use `apiFetch` or at minimum add the auth header.

#### 🟡 Medium — `handleSendTestWebhook` also uses raw `fetch`
Same issue as above — bypasses `apiFetch`, no auth header, no timeout handling.

#### 🟡 Medium — No form validation on numeric inputs
`maxAttempts`, `initialDelay`, `maxDelay` use `parseInt(e.target.value) || 1` which silently converts invalid input to 1. No visual feedback to the user.

#### 🟡 Medium — Rotate confirmation modal doesn't use `ConfirmDialog` component
The page has a hand-rolled modal for secret rotation while other pages use the `ConfirmDialog` component. Inconsistent UX.

#### 🟢 Low — Rate limit values are hardcoded
```tsx
{endpoint.routing_strategy === 'round-robin' ? '100' : '1,000'}
```
These magic numbers should come from the API or configuration.

#### 🟢 Low — `BACKOFF_OPTIONS` uses `as const` but `label` and `desc` are not translated
The option labels ("Exponential", "Linear", "Fixed") and descriptions are hardcoded English.

---

## 5. `dashboard/src/app/[locale]/dashboard/deliveries/page.tsx` — Deliveries List

**Summary:** Paginated delivery list with status filters, search, replay functionality, and detail modal.

### Issues

#### 🟡 Medium — `router.push` uses non-localized paths
```tsx
onClick={() => router.push(`/dashboard/deliveries/${d.id}`)}
```
Same locale issue throughout.

#### 🟡 Medium — `selected` state is unused effectively
```tsx
const [selected, setSelected] = useState<Delivery | null>(null);
```
This state is set but the `DetailRow` modal renders from `selected`. However, clicking a row navigates to the detail page AND there's a "View Details" button that also navigates. The `selected` modal is never triggered by the current code — rows use `router.push` on click, not `setSelected`.

Wait — looking more carefully: the table row `onClick` navigates via `router.push`, so `selected` is never set by clicking rows. But the `DetailRow` component and the modal at the bottom check `{selected && ...}`. This modal is **dead code** — it will never render because nothing sets `selected`.

**Fix:** Either remove the dead modal code or change row clicks to set `selected` instead of navigating.

#### 🟡 Medium — `getErrorMessage` import but inconsistent error handling
```tsx
import { getErrorMessage } from '@/lib/errors';
```
Used in `fetchData` but `handleReplay` uses inline error extraction. Inconsistent pattern.

#### 🟡 Medium — Search filters client-side but data is fetched server-side
```tsx
const filtered = deliveries.filter((d) =>
  !search || d.event?.toLowerCase().includes(search.toLowerCase()) || d.id.includes(search)
);
```
The search filters the current page's 20 items client-side. If the user searches for something on page 2, it won't be found. This is misleading — it looks like a global search but only filters the current page.

**Fix:** Either send the search query to the API, or clearly indicate "searching current page only".

#### 🟡 Medium — Pagination uses `total` from API but `filtered` for display
`totalPages` is calculated from `total` (server-side count), but the table displays `filtered` (client-side filtered). If search filters reduce items, pagination controls still show full page count.

#### 🟢 Low — Hardcoded table headers
```tsx
<th>ID</th>
<th>Event</th>
<th>Status</th>
<th>Attempts</th>
<th>Response</th>
<th>Time</th>
```
Not translated.

#### 🟢 Low — Filter buttons use hardcoded capitalize
```tsx
{f.charAt(0).toUpperCase() + f.slice(1)}
```
Should use translation keys for status names.

---

## 6. `dashboard/src/app/[locale]/dashboard/deliveries/[id]/page.tsx` — Delivery Detail

**Summary:** Detailed view of a single delivery with request/response inspection, attempt timeline, and replay functionality.

### Issues

#### 🔴 Critical — ALL strings hardcoded English (no `useTranslations`)
This page has **zero** `useTranslations` calls. Every string is hardcoded:
- "Delivery Details", "Replay Webhook", "Status", "Event", "Attempts", "Response", "Delivery Information", "Request Details", "Request Headers", "Request Body (Payload)", "Attempt Timeline", "Error Message", "Response Headers", "Response Body", "Back to deliveries", "Try Again", "Close", etc.

**Fix:** Add `useTranslations` and replace all hardcoded strings.

#### 🟡 Medium — `router.push` uses non-localized paths
```tsx
router.push('/dashboard/deliveries')
```
Same locale issue.

#### 🟡 Medium — `attempts.sort()` mutates the array
```tsx
{attempts.sort((a, b) => a.attempt_number - b.attempt_number).map(...)}
```
`Array.sort()` mutates in-place. In a React render, this mutates state directly, which can cause subtle bugs with React's reconciliation.

**Fix:** Use `[...attempts].sort(...)` or `attempts.toSorted(...)`.

#### 🟡 Medium — Copy button uses `navigator.clipboard` without fallback
```tsx
await navigator.clipboard.writeText(text);
```
`navigator.clipboard` requires HTTPS or localhost. In HTTP environments, this silently fails (caught by try/catch, shows error toast). No `document.execCommand('copy')` fallback.

#### 🟡 Medium — `formatJson` called on every render for request body
```tsx
<pre>{formatJson(delivery.request_body)}</pre>
```
This parses and re-stringifies JSON on every render. Should be memoized with `useMemo`.

#### 🟡 Medium — Attempt timeline shows no duration info if `duration_ms` is undefined
The `duration_ms` field is conditionally shown but there's no indication when it's missing. Users might wonder why some attempts show duration and others don't.

#### 🟢 Low — ConfirmDialog strings are hardcoded
```tsx
<ConfirmDialog
  title="Replay Webhook"
  message={`Replay this webhook delivery to the same endpoint? This will create a new delivery attempt.`}
  confirmLabel="Replay"
```
Should use translations.

#### 🟢 Low — `getAttemptStatusIcon` only handles 'delivered' and defaults to '✕'
Any status other than 'delivered' shows '✕'. This includes 'pending' which should probably show a different icon.

---

## 7. `dashboard/src/app/[locale]/dashboard/logs/page.tsx` — Logs Page

**Summary:** Full delivery log with auto-refresh, status filter tabs with counts, search, pagination, and detail modal.

### Issues

#### 🟡 Medium — `statusCounts` only counts items on the CURRENT page
```tsx
const statusCounts = {
  all: total,
  delivered: deliveries.filter((d) => d.status === 'delivered').length,
  failed: deliveries.filter((d) => d.status === 'failed').length,
  pending: deliveries.filter((d) => d.status === 'pending').length,
};
```
The `delivered`, `failed`, `pending` counts only reflect the current page's 20 items, not the total across all pages. But `all` uses `total` from the API. This is misleading — the badge might show "3 failed" when there are actually 50 failed across all pages.

**Fix:** The API should return counts per status, or fetch counts separately.

#### 🟡 Medium — Hardcoded subtitle not translated
```tsx
<p>Full delivery history with status and response details</p>
```
Should use `t('subtitle')`.

#### 🟡 Medium — Hardcoded loading text
```tsx
<div>Loading logs...</div>
```
Should use `t('loadingLogs')` or `tc('loading')`.

#### 🟡 Medium — `DetailRow` in logs modal uses `React.ReactNode` for `value`
```tsx
function DetailRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean })
```
The `StatusBadge` is passed as `value` which works but the `mono` class is applied to the wrapper span, not the badge. Minor rendering issue.

#### 🟡 Medium — Auto-refresh and manual fetch can race
If the user clicks "Refresh" while auto-refresh is running, two concurrent fetches happen. Both update state. No abort controller or deduplication.

**Fix:** Use an `AbortController` and cancel previous requests.

#### 🟢 Low — Filter button active state uses different colors than deliveries page
Logs: `bg-gray-900 dark:bg-brand-600` vs Deliveries: `bg-gray-900 text-white`. Minor visual inconsistency.

#### 🟢 Low — "↻ Refresh" and "← Previous" / "Next →" use hardcoded strings
Not translated.

#### 🟢 Low — Pagination "Showing X–Y of Z" is hardcoded
```tsx
Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
```
Should use `tc('showing', { from, to, total })` (the translation key exists with interpolation).

---

## Cross-Cutting Issues Summary

### 🔴 Critical (6 issues)
| # | File | Issue |
|---|------|-------|
| 1 | layout.tsx | `router.push(getLocalizedHref('/login'))` may double-prefix locale |
| 2 | layout.tsx | Hardcoded locale regex misses locales; should use `useLocale()` |
| 3 | endpoints/[id]/page.tsx | **Zero translations** — entire page hardcoded English |
| 4 | deliveries/[id]/page.tsx | **Zero translations** — entire page hardcoded English |
| 5 | endpoints/[id]/page.tsx | `handleRotateSecret` and `handleSendTestWebhook` bypass `apiFetch` (no auth header) |
| 6 | endpoints/page.tsx, deliveries/page.tsx, etc. | `router.push` locale handling inconsistent across pages |

### 🟡 Medium (20+ issues)
- Hardcoded strings in every page (table headers, buttons, labels, placeholders)
- `statusCounts` in logs only reflects current page
- Client-side search on server-paginated data (deliveries, logs)
- Dead `selected` modal code in deliveries page
- `attempts.sort()` mutates state in delivery detail
- Bulk delete without confirmation dialog
- `fetchEndpoint` fetches all endpoints to find one
- `token!` non-null assertion in dashboard
- Active nav state uses exact match only
- `LanguageSwitcher` rendered twice

### 🟢 Low (12+ issues)
- Skeleton count hardcoded
- Recharts gradient ID collisions
- Emoji icons inconsistent across platforms
- Missing `aria-expanded` on mobile toggle
- No skip-to-content link
- Hardcoded rate limit values
- `navigator.clipboard` without fallback
- Inconsistent error handling patterns

---

## Recommended Priority Fixes

1. **i18n:** Add translations to `endpoints/[id]` and `deliveries/[id]` pages (Critical)
2. **Routing:** Audit all `router.push` calls for locale correctness — decide if `router` from `@/i18n/navigation` auto-prefixes or not, then fix consistently
3. **Layout:** Replace locale regex with `useLocale()` hook
4. **API:** Make `handleRotateSecret` and `handleSendTestWebhook` use `apiFetch`
5. **Deliveries:** Remove dead `selected` modal or wire it up properly
6. **Logs:** Fix `statusCounts` to use API-provided counts
7. **Endpoints:** Add confirmation dialog for bulk delete
8. **All pages:** Replace hardcoded table headers and labels with translation keys
