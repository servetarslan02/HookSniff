# Dashboard Pages Code Review

**Reviewer:** AI Code Review Agent  
**Date:** 2026-05-10  
**Scope:** 23 dashboard page files  
**Severity Scale:** 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low

---

## Executive Summary

Reviewed all 23 dashboard page files. The codebase is generally well-structured with consistent patterns, dark mode support, and i18n integration. However, there are several **critical security issues** (token leakage, missing auth headers, XSS vectors), **pervasive silent error swallowing**, and **accessibility gaps** that need attention before production.

### Top Issues Across All Files

| Issue | Severity | Files Affected |
|-------|----------|----------------|
| Silent error swallowing (`catch {}`) | 🟠 High | Nearly all files |
| Missing auth headers on `fetch()` calls | 🔴 Critical | settings, billing, alerts, health, inbound, logs, playground, search, transforms, api-keys |
| `credentials: 'include'` placed in `headers` object instead of fetch options | 🔴 Critical | settings (profile/password), api-keys (create) |
| Hardcoded `Authorization: 'Bearer YOUR_TOKEN'` in playground | 🟠 High | playground |
| No CSRF protection on state-changing requests | 🟠 High | All fetch-based pages |
| Missing `aria-label` on icon-only buttons | 🟡 Medium | All files with icon buttons |
| Recharts SVG gradient ID collisions | 🟡 Medium | dashboard, analytics |
| No input sanitization before rendering | 🟡 Medium | Multiple files |

---

## File-by-File Analysis

### 1. `dashboard/page.tsx` — Dashboard Overview

**Lines:** ~370 | **Complexity:** High

#### Security Issues
- 🟡 **Non-null assertion on token** (line ~290): `token!` used in `<ActivityFeed token={token!} />` — if `token` is null/undefined at render time, this silently passes `undefined` to the API call.

#### Logic Bugs
- 🔵 **AnimatedCounter doesn't handle negative values well**: The easing function works but `Math.round` could show brief negative values during transitions if `value` goes from positive to 0.

#### Missing Error Handling
- 🟠 **Silent catch in ActivityFeed** (line ~231): `catch { // ignore }` — user gets no feedback if deliveries fail to load.
- 🟠 **Silent catch in main load** (line ~280): `catch (err) { // Error handled silently }` — stats and deliveries failures are invisible.

#### Accessibility Issues
- 🟡 **TimeRangeSelector buttons lack aria-pressed**: Screen readers can't tell which range is selected.
- 🟡 **StatusDot lacks aria-label**: The colored dot has no text alternative.
- 🟡 **Table headers lack scope attribute**: `<th>` elements should have `scope="col"`.

#### Performance Concerns
- 🟡 **5-second polling in ActivityFeed**: `setInterval(fetchDeliveries, 5000)` — this creates continuous API calls even when the tab is backgrounded. Consider using `document.visibilityState` to pause.
- 🔵 **Recharts re-renders**: The `chartData` array is recreated on every render inside the component body, causing unnecessary re-renders of the chart.

#### Code Quality
- 🔵 **Duplicate chart code**: `DeliveryTrendChart` and `SuccessRateDonut` duplicate logic that exists in the analytics page. Should be extracted to shared components.
- 🔵 **SVG gradient ID collision risk**: `id="colorSuccess"` and `id="colorFailed"` are hardcoded — if two instances render, IDs collide.

---

### 2. `endpoints/page.tsx` — Endpoints List

**Lines:** ~180 | **Complexity:** Medium

#### Security Issues
- 🟡 **No URL validation beyond `type="url"`**: The HTML5 URL input can be bypassed. Server-side validation is the real protection, but client-side UX could be better.

#### Logic Bugs
- 🔵 **Empty catch on list fetch** (line ~43): `catch(() => {})` — if the API is down, user sees empty list with no error message.

#### Missing Error Handling
- 🟠 **Delete uses `alert()` for errors** (line ~63): `alert((err instanceof Error ...))` — uses browser alert instead of the toast system used elsewhere.

#### Accessibility Issues
- 🟡 **Create form inputs lack `id` + `htmlFor` association**: Labels use `<label>` but aren't connected to inputs via `htmlFor`/`id`.
- 🟡 **Toggle buttons (active/inactive) lack aria-label**.

#### Code Quality
- 🔵 **`handleDelete` is misleading**: It doesn't delete — it sets `deleteId` to show the confirm dialog. The actual delete is `confirmDelete`. Naming is confusing.

---

### 3. `endpoints/[id]/page.tsx` — Endpoint Settings

**Lines:** ~310 | **Complexity:** High

#### Security Issues
- 🔴 **Signing secret partially visible** (line ~240): `endpoint.signing_secret.slice(0, 12)` — even partial exposure of signing secrets is a security risk. The masked display is reasonable, but ensure the API never returns the full secret.
- 🔴 **Secret rotation uses raw `fetch` without auth header** (line ~96): 
  ```ts
  fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1'}/endpoints/${id}/rotate-secret`,
    { method: 'POST', headers: {}, credentials: 'include' as const })
  ```
  The `Authorization` header is missing. If the API uses cookie auth this works, but the `headers: {}` is suspicious — it suggests the auth header was forgotten.
- 🟠 **New secret displayed in plain text** (line ~253): After rotation, `newSecret` is shown in a green box. This is acceptable UX but the secret should auto-hide after a timeout.

#### Logic Bugs
- 🟠 **Fetches all endpoints to find one** (line ~50): `const all = await endpointsApi.list(token); const ep = all.find(e => e.id === id)` — inefficient. Should have a dedicated GET endpoint.

#### Missing Error Handling
- 🔵 **No validation on number inputs**: `parseInt(e.target.value) || 1` could produce NaN edge cases.

#### Accessibility Issues
- 🟡 **Radio buttons for backoff**: The custom radio labels are clickable but the actual `<input type="radio">` has no visible focus ring.

---

### 4. `deliveries/page.tsx` — Deliveries List

**Lines:** ~250 | **Complexity:** Medium

#### Security Issues
- 🟡 **No rate limiting on search**: Client-side filter runs on every keystroke against the full delivery list.

#### Logic Bugs
- 🟠 **`selected` state is set but never used for navigation**: `setSelected` is defined but clicking a row uses `router.push()` instead. The `selected` modal code is dead code (lines ~165-210).
- 🟡 **`perPage` constant (20) must match server-side**: If the server returns a different page size, pagination breaks.

#### Missing Error Handling
- 🔵 **Replay error uses toast but no retry option**.

#### Accessibility Issues
- 🟡 **Table rows are clickable but not keyboard-navigable**: `<tr onClick>` doesn't respond to Enter/Space keys. Should use `<a>` or add `role="button"` + keyboard handler.

#### Code Quality
- 🔵 **Dead code**: The `DetailRow` component and `selected` modal are defined but `selected` is never set to a non-null value in the current code.

---

### 5. `deliveries/[id]/page.tsx` — Delivery Detail

**Lines:** ~520 | **Complexity:** High

#### Security Issues
- 🟡 **Request body displayed without sanitization**: `delivery.request_body` could contain malicious HTML/script content rendered in `<pre>`. While `<pre>` doesn't execute scripts, the `formatJson` function could theoretically be tricked.

#### Logic Bugs
- 🟡 **Attempts timeline uses synthetic data when `attempts` is empty**: If `webhooksApi.getAttempts` fails, the fallback `[]` means no timeline shows — but the old code in the deliveries list page generates fake timeline entries. This page correctly shows "No attempt data available".

#### Missing Error Handling
- 🔵 **`copyToClipboard` failure shows toast but doesn't degrade gracefully** on HTTP (non-HTTPS) contexts where `navigator.clipboard` is undefined.

#### Accessibility Issues
- 🟡 **Expandable attempt sections lack aria-expanded**: Clicking to expand/collapse doesn't announce state to screen readers.
- 🟡 **Copy buttons lack aria-label**: Icon-only copy buttons need text alternatives.

#### Performance Concerns
- 🟡 **`attempts.sort()` mutates the array in-place** (line ~320): Should use `[...attempts].sort()` to avoid mutating state.

---

### 6. `settings/page.tsx` — Settings

**Lines:** ~420 | **Complexity:** High

#### Security Issues
- 🔴 **`credentials: 'include'` placed inside `headers` object** (lines ~82, ~106):
  ```ts
  headers: {
    'Content-Type': 'application/json',
    credentials: 'include' as const,  // ← WRONG! This is not a header
  },
  ```
  The `credentials` option should be a sibling of `headers`, not inside it. This means **the auth cookie is NOT being sent** with profile and password update requests. These requests will likely fail silently or use some other auth mechanism.
- 🟠 **API key displayed as masked dots but `apiKey` is in memory**: The `copyApiKey` function copies the raw `apiKey` from the auth store. Ensure the store doesn't persist this in localStorage.
- 🟠 **Password sent in plain text over fetch**: No client-side hashing. This is standard practice (TLS handles encryption) but worth noting.

#### Logic Bugs
- 🟠 **Notification preferences are local state only**: `emailNotifs`, `failureAlerts`, `weeklyDigest` are initialized to hardcoded defaults, not loaded from the server. The save handler sends them, but on page reload they reset to defaults.

#### Missing Error Handling
- 🟠 **Delete account uses `alert()` for errors** (line ~143): `alert(getErrorMessage(e))` — inconsistent with the toast pattern used elsewhere.

#### Accessibility Issues
- 🟡 **ToggleRow component**: The toggle button lacks `role="switch"` and `aria-checked` attributes.
- 🟡 **Delete confirmation modal**: Focus is not trapped inside the modal.

---

### 7. `billing/page.tsx` — Billing

**Lines:** ~430 | **Complexity:** High

#### Security Issues
- 🔴 **Missing auth header on billing API calls** (lines ~126, ~155, ~168):
  ```ts
  fetch(`${API}/billing/usage`, {
    headers: {}, credentials: 'include' as const,
  })
  ```
  Empty `headers: {}` — no `Authorization` header. Relies entirely on cookie auth.
- 🟠 **Checkout URL redirect without validation** (line ~185):
  ```ts
  if (data.checkout_url) {
    window.location.href = data.checkout_url;
  }
  ```
  If the API is compromised or MITM'd, this could redirect to a malicious URL. Should validate the URL origin.

#### Logic Bugs
- 🟠 **Next billing date is always 1st of next month** (line ~190): This doesn't account for actual subscription billing cycles. Misleading to users.
- 🟡 **`window.location.reload()` after cancel** (line ~163): Full page reload is heavy-handed. Could refetch data instead.

#### Missing Error Handling
- 🔵 **Chart data defaults to empty on error**: No user feedback when usage fetch fails.

#### Accessibility Issues
- 🟡 **Plan cards lack proper heading hierarchy**: `<h3>` for plan names but the section uses `<h2>`.

---

### 8. `api-keys/page.tsx` — API Keys

**Lines:** ~340 | **Complexity:** Medium

#### Security Issues
- 🔴 **`credentials: 'include'` inside `headers` on create** (line ~72):
  ```ts
  headers: {
    credentials: 'include' as const,  // ← WRONG POSITION
    'Content-Type': 'application/json',
  },
  ```
  Same bug as settings page — auth cookie not sent on key creation.
- 🟠 **New API key shown in plain text**: After creation, the full key is displayed. This is expected UX but the key should auto-dismiss after a period or when navigating away.

#### Logic Bugs
- 🔵 **`const { } = useAuth()`**: Destructuring nothing from useAuth — the token is not used for API calls (they use cookies). This is dead code.

#### Missing Error Handling
- 🟠 **Silent catch on fetchKeys** (line ~62): `catch (e) { // Error handled silently }` — user sees empty list with no error.

#### Accessibility Issues
- 🟡 **Delete/Rotate confirmation modals**: Focus not trapped; ESC key doesn't close.

---

### 9. `alerts/page.tsx` — Alerts

**Lines:** ~230 | **Complexity:** Medium

#### Security Issues
- 🔴 **Missing auth header on all API calls** (lines ~66, ~82, ~95, ~107):
  ```ts
  fetch(`${API}/alerts`, {
    headers: {}, credentials: 'include' as const,
  })
  ```
  All alert CRUD operations have empty headers.

#### Logic Bugs
- 🟠 **Silent failure on create** (line ~88): If `res.ok` is false, nothing happens — no error shown to user.
- 🟠 **Test alert uses `alert()`** (line ~112): `alert(t('testSent'))` — uses browser alert instead of toast.

#### Missing Error Handling
- 🟠 **All error paths are silently swallowed**: `catch (e) { // Error handled silently }` on every operation.

#### Accessibility Issues
- 🟡 **Channel toggle buttons**: No aria-pressed state for selected channels.

---

### 10. `analytics/page.tsx` — Analytics

**Lines:** ~180 | **Complexity:** Medium

#### Security Issues
- 🔵 **No issues beyond standard auth pattern**.

#### Logic Bugs
- 🔵 **`loadData` has unused `catch` block** (line ~45): `catch { // ignore }` — API failures are invisible.

#### Accessibility Issues
- 🟡 **Time range selector buttons**: Same issue as dashboard — no aria-pressed.
- 🟡 **Pie chart has no text alternative**: Screen readers get nothing from the donut chart.

#### Performance Concerns
- 🔵 **Same SVG gradient ID collision risk as dashboard**: `analyticsColorSuccess`/`analyticsColorFailed` are unique enough to avoid collision with dashboard, but still hardcoded.

#### Code Quality
- 🔵 **Duplicate chart code**: This page duplicates the dashboard's `DeliveryTrendChart` and `SuccessRateDonut` logic. Should share components.

---

### 11. `health/page.tsx` — Endpoint Health

**Lines:** ~180 | **Complexity:** Medium

#### Security Issues
- 🔴 **Missing auth header** (line ~50):
  ```ts
  fetch(`${API}/endpoint-health`, {
    headers: {}, credentials: 'include' as const,
  })
  ```

#### Logic Bugs
- 🔵 **30-second polling** (line ~58): `setInterval(fetchHealth, 30000)` — reasonable but should pause when tab is hidden.

#### Missing Error Handling
- 🟠 **Silent catch** (line ~53): Health fetch failures are invisible.

#### Accessibility Issues
- 🟡 **Progress bars lack aria attributes**: Should have `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.

---

### 12. `inbound/page.tsx` — Inbound Webhooks

**Lines:** ~180 | **Complexity:** Medium

#### Security Issues
- 🟠 **Webhook secret sent in plain text** (line ~80): The `webhookSecret` is sent in the POST body. Ensure TLS is enforced.
- 🔴 **Missing auth header on config fetch/create** (lines ~68, ~76):
  ```ts
  fetch(`${API}/inbound/configs`, { headers: {}, credentials: 'include' as const })
  ```
- 🟡 **API URL exposed in the UI** (line ~138): `POST {API}/inbound/{p.id}` — shows the full API base URL to users. If `NEXT_PUBLIC_API_URL` contains internal infrastructure details, this leaks them.

#### Logic Bugs
- 🔵 **Unused `_loading` state** (line ~53): `const [_loading, setLoading] = useState(true)` — the underscore prefix suggests it's intentionally unused, but the loading state is never used to show a loading indicator.

#### Missing Error Handling
- 🟠 **Silent catch on initial load** (line ~70): `catch(() => [])` — errors loading endpoints or configs are swallowed.

#### Code Quality
- 🔵 **Inconsistent API patterns**: Uses `fetch` directly instead of the `apiFetch` helper used elsewhere.

---

### 13. `logs/page.tsx` — Logs

**Lines:** ~350 | **Complexity:** Medium

#### Security Issues
- 🔵 **No issues beyond standard auth pattern**.

#### Logic Bugs
- 🟡 **`statusCounts` calculated from current page only** (line ~87):
  ```ts
  const statusCounts = {
    all: total,
    delivered: deliveries.filter((d) => d.status === 'delivered').length,
    ...
  };
  ```
  The "delivered", "failed", "pending" counts are from the current page's deliveries, not the total. This is misleading — the "all" count is the real total, but the per-status counts are page-local.

#### Missing Error Handling
- 🔵 **Auto-refresh error handling**: If an auto-refresh fetch fails, the previous data remains but the user isn't notified.

#### Accessibility Issues
- 🟡 **Detail modal**: Same focus-trapping issues as other modals.
- 🟡 **Table rows clickable but not keyboard-navigable**.

---

### 14. `notifications/page.tsx` — Notifications

**Lines:** ~250 | **Complexity:** Medium

#### Security Issues
- 🔵 **No issues**.

#### Logic Bugs
- 🟡 **`setTotal((t) => t - 1)` on delete** (line ~99): This decrements total but doesn't account for the case where the notification being deleted wasn't on the current page (edge case with filters).

#### Missing Error Handling
- 🔵 **Delete notification failure**: Toast shown but the UI already removed the item optimistically. Should rollback on error.

#### Accessibility Issues
- 🟡 **Notification type filter buttons**: No aria-pressed state.
- 🟡 **"Mark read" and "Delete" buttons**: Could benefit from aria-label with notification title for context.

---

### 15. `playground/page.tsx` — API Playground

**Lines:** ~550 | **Complexity:** Very High

#### Security Issues
- 🔴 **Hardcoded `Authorization: 'Bearer YOUR_TOKEN'`** (line ~340):
  ```ts
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer YOUR_TOKEN',
  };
  ```
  This placeholder is displayed in the cURL command and used in actual fetch requests. If a user doesn't change it, requests will fail. More importantly, if this were ever populated with a real token, it would be sent to whatever URL the user types in `path` — potential token leakage to arbitrary endpoints.
- 🔴 **SSRF risk**: The playground allows the user to set any `path` and the fetch goes to `API_BASE + path`. A malicious user (or XSS) could set the path to internal services: `/../../internal/admin`. While this goes through the browser (mitigating server-side SSRF), it could still hit same-origin internal APIs.
- 🟠 **`endpointsApi.list("")` called with empty string** (line ~365): This passes an empty token to the API, which will likely fail silently.

#### Logic Bugs
- 🟡 **History stored in localStorage**: `MAX_HISTORY = 10` entries are stored, but there's no size limit on the response data stored. Large responses could exceed localStorage limits.

#### Missing Error Handling
- 🔵 **`endpointsApi.list("")` error swallowed** (line ~365).

#### Performance Concerns
- 🟡 **3-second polling in LiveRequestViewer**: Same concern as dashboard polling — continues in background tabs.

#### Code Quality
- 🔵 **Large component**: ~550 lines in a single file. Should be split into smaller components.
- 🔵 **`_showAiGenerator` and `_endpoints` unused state**: Dead code.

---

### 16. `portal/page.tsx` — Customer Portal

**Lines:** ~100 | **Complexity:** Low

#### Security Issues
- 🔵 **No issues** — uses `apiFetch` with proper token.

#### Logic Bugs
- 🔵 **No issues**.

#### Missing Error Handling
- 🔵 **Error state shows raw error message**: `err instanceof Error ? err.message : 'Failed to load portal data'` — could leak internal error details.

#### Accessibility Issues
- 🟡 **Loading state has no aria-live region**: Screen readers won't announce the loading state change.

#### Code Quality
- 🔵 **Inconsistent styling**: This page uses plain `bg-white dark:bg-slate-800` instead of the `glass-card` class used everywhere else. Looks out of place.

---

### 17. `routing/page.tsx` — Routing

**Lines:** ~60 | **Complexity:** Low

#### Security Issues
- 🔵 **No issues**.

#### Logic Bugs
- 🔵 **`badge-red`/`badge-green` CSS classes**: These classes are used but likely not defined in the Tailwind config (no evidence of custom badge classes). Will render as unstyled.

#### Missing Error Handling
- 🟠 **Silent catch** (line ~30): `catch(() => {})` — routing data failures invisible.

#### Accessibility Issues
- 🔵 **No significant issues** — simple list display.

#### Code Quality
- 🔵 **Inconsistent styling**: Uses plain `bg-white` instead of `glass-card`. Missing dark mode text color on some elements (`font-mono text-sm` has no dark mode variant).

---

### 18. `schemas/page.tsx` — Schemas

**Lines:** ~50 | **Complexity:** Low

#### Security Issues
- 🔵 **No issues**.

#### Logic Bugs
- 🔵 **`created_at` displayed as raw string**: `p.version} · {s.created_at` — should format the date.

#### Missing Error Handling
- 🟠 **Silent catch** (line ~25).

#### Code Quality
- 🔵 **Inconsistent styling**: Same as routing — uses plain `bg-white` instead of `glass-card`.

---

### 19. `search/page.tsx` — Search

**Lines:** ~200 | **Complexity:** Medium

#### Security Issues
- 🔴 **Missing auth header** (line ~65):
  ```ts
  fetch(`${API}/search?${params}`, {
    headers: { credentials: 'include' as const },
  })
  ```
  `credentials` is placed inside `headers` — same bug as settings/api-keys. Auth cookie may not be sent.
- 🟡 **Search query sent as URL parameter**: `params.set('q', query)` — the query appears in the URL. This is standard but means search terms are logged in server access logs and browser history.

#### Logic Bugs
- 🟡 **`event` state is unused**: `const [event, _setEvent] = useState('')` — the setter is prefixed with `_` and the state is never modified by any UI element. The `event` filter is sent to the API but there's no UI to set it.

#### Missing Error Handling
- 🟠 **Silent catch** (line ~72).

#### Accessibility Issues
- 🟡 **Table rows clickable but not keyboard-navigable**.
- 🟡 **`window.location.href` used for navigation** (line ~140): Should use Next.js router instead.

---

### 20. `team/page.tsx` — Team Management

**Lines:** ~340 | **Complexity:** Medium

#### Security Issues
- 🟡 **Email input not validated beyond `type="email"`**: No server-side validation check.

#### Logic Bugs
- 🔵 **No issues**.

#### Missing Error Handling
- 🟠 **All team operations silently fail on catch**: `catch { toast('Failed to...', 'error') }` — at least shows toast, but the error message is generic.

#### Accessibility Issues
- 🟡 **Modals**: Same focus-trapping issues.
- 🟡 **Role change select**: No confirmation for role changes (especially dangerous for owner/admin demotion).

---

### 21. `templates/page.tsx` — Templates

**Lines:** ~50 | **Complexity:** Low

#### Security Issues
- 🔵 **No issues**.

#### Logic Bugs
- 🔵 **Template cards are clickable but have no action**: `cursor-pointer` class but no `onClick` handler. Misleading UX.

#### Missing Error Handling
- 🟠 **Silent catch** (line ~25).

#### Code Quality
- 🔵 **Inconsistent styling**: Same as routing/schemas.

---

### 22. `transforms/page.tsx` — Webhook Transforms

**Lines:** ~180 | **Complexity:** Medium

#### Security Issues
- 🔴 **Missing auth header on all transform API calls** (lines ~68, ~85, ~97):
  ```ts
  fetch(`${API}/endpoints/${endpointId}/transforms`, {
    headers: {}, credentials: 'include' as const,
  })
  ```
- 🟠 **Endpoint ID in URL path not validated**: `endpointId` comes from user-selected dropdown and is interpolated directly into the URL. If the select options are manipulated (XSS), this could hit arbitrary endpoints.

#### Logic Bugs
- 🟡 **Filter include/exclude are mutually exclusive in the form**: The form has both include and exclude inputs, but the rule construction sets `rule.filter` with both. The API behavior with both set is unclear.

#### Missing Error Handling
- 🟠 **Silent catch on create** (line ~90): `catch { toast('Failed to create rule', 'error') }` — at least shows toast.
- 🟠 **Silent catch on delete** (line ~100).

#### Code Quality
- 🔵 **Inconsistent API pattern**: Uses raw `fetch` instead of `apiFetch` or `endpointsApi`.

---

### 23. `webhooks/new/page.tsx` — Send Webhook

**Lines:** ~130 | **Complexity:** Low

#### Security Issues
- 🟡 **JSON payload parsed twice**: `JSON.parse(payload)` is called in validation and again in `handleSend`. If the payload changes between calls (unlikely but possible with race conditions), the sent data could differ from what was validated.

#### Logic Bugs
- 🔵 **No issues**.

#### Missing Error Handling
- 🔵 **Endpoint list fetch silently fails** (line ~35): `catch(() => {})`.

#### Accessibility Issues
- 🟡 **Textarea lacks aria-label for the JSON format requirement**.

#### Code Quality
- 🔵 **Good**: Uses `webhooksApi.create` properly with token.

---

## Cross-Cutting Concerns

### 1. Authentication Pattern Inconsistency

The codebase has **three different auth patterns**:
1. **`apiFetch` helper** (portal, routing, schemas, templates) — cleanest
2. **`webhooksApi`/`endpointsApi`/etc.** (dashboard, deliveries, endpoints) — proper wrapper
3. **Raw `fetch` with manual headers** (settings, billing, alerts, health, inbound, api-keys, search, transforms) — error-prone

The raw `fetch` pattern is where the `credentials: 'include'` placement bug occurs repeatedly.

**Recommendation:** Migrate all raw `fetch` calls to use `apiFetch` or dedicated API modules.

### 2. Silent Error Swallowing

**17 out of 23 files** have at least one `catch {}` or `catch { // ignore }` block. This makes debugging production issues extremely difficult and leaves users confused when data doesn't load.

**Recommendation:** At minimum, log errors to console. Ideally, show user-facing error states.

### 3. Modal Accessibility

Every modal in the codebase (endpoints, deliveries, settings, billing, api-keys, team) has the same issues:
- No focus trap
- ESC key doesn't close
- No `role="dialog"` or `aria-modal="true"`
- Backdrop click to close is the only dismissal method

**Recommendation:** Create a shared `Modal` component with proper accessibility.

### 4. Inconsistent Styling

Pages fall into two categories:
- **Full-featured** (dashboard, endpoints, deliveries, settings, billing, etc.): Use `glass-card`, dark mode, i18n
- **Minimal** (portal, routing, schemas, templates): Use plain `bg-white`, no dark mode text colors, no i18n

**Recommendation:** Bring all pages to the same quality level.

### 5. Missing CSRF Protection

None of the state-changing `fetch` calls include a CSRF token. If the API uses cookie-based auth, all POST/PUT/DELETE requests are vulnerable to CSRF attacks from malicious websites.

**Recommendation:** Implement CSRF tokens or use `SameSite=Strict` cookies.

---

## Priority Fix List

### 🔴 Critical (Fix Immediately)
1. Fix `credentials: 'include'` placement in settings (profile/password), api-keys (create), and search pages
2. Add `Authorization` headers to all raw `fetch` calls OR migrate to `apiFetch`
3. Remove hardcoded `Bearer YOUR_TOKEN` from playground
4. Add CSRF protection

### 🟠 High (Fix Before Release)
1. Replace all silent `catch {}` blocks with error logging + user feedback
2. Validate checkout URL origin before redirect in billing
3. Auto-dismiss API key display after timeout
4. Fix `alert()` usage — migrate to toast system

### 🟡 Medium (Fix Soon)
1. Add `aria-pressed` to toggle buttons
2. Add `role="dialog"` + focus trapping to modals
3. Add `aria-label` to icon-only buttons
4. Fix SVG gradient ID collisions
5. Add keyboard navigation to clickable table rows
6. Fix `attempts.sort()` mutation in delivery detail

### 🔵 Low (Backlog)
1. Extract shared chart components
2. Split playground into smaller components
3. Unify styling across all pages
4. Add `aria-live` regions for loading states
5. Format raw dates in schemas page
6. Add `cursor-pointer` action to template cards
