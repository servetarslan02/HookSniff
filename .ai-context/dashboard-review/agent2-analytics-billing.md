# Dashboard Code Review — Agent 2: Analytics, Billing, Alerts, Notifications, Health, Rate-Limiting, Audit Log

> **Reviewer:** Subagent (dashboard-review-2)
> **Date:** 2026-05-10
> **Scope:** 7 pages in `dashboard/src/app/[locale]/dashboard/`

---

## 1. Analytics Page

**File:** `dashboard/src/app/[locale]/dashboard/analytics/page.tsx`
**Summary:** Displays delivery trend charts (area chart) and success rate donut chart with time-range filtering. Uses Recharts for visualization and Tremor-style StatCards for summary metrics.

### Issues

#### 🟡 Medium — Hardcoded subtitle string
- **Line ~83:** `<p>` tag contains a hardcoded English string: `Delivery trends, success rates, and performance metrics`
- **Fix:** Replace with `t('subtitle')` and add the key to translation files.

#### 🟡 Medium — Duplicate subtitle prop on ChartCard
- **Line ~91:** `<ChartCard title={t('deliveryTrends')} subtitle={t('deliveryTrends')}>` — both `title` and `subtitle` use the same translation key.
- **Line ~142:** Same issue: `<ChartCard title={t('successRateOverTime')} subtitle={t('successRateOverTime')}>`
- **Fix:** Use a separate subtitle key (e.g., `t('deliveryTrendsSubtitle')`) or remove the subtitle if it's meant to be the same as title.

#### 🟢 Low — StatCard labels are hardcoded English
- **Lines ~78, ~89, ~102:** `label="Success Rate"`, `label="Total Delivered"`, `label="Total Failed"` are all hardcoded.
- **Fix:** Use `t('successRate')`, `t('totalDelivered')`, `t('totalFailed')`.

#### 🟢 Low — Pie chart center text hardcoded
- **Line ~153:** `<div className="text-xs text-gray-500 dark:text-slate-400">success</div>` — "success" is hardcoded.
- **Fix:** Use `t('success')` or `t('successRateLabel')`.

#### 🟢 Low — No error state feedback
- Both API calls `.catch(() => null)` silently swallow errors. The user sees "No data" rather than an error message. Consider showing a toast or inline error on failure.

#### 🟢 Low — `toLocaleString(undefined, ...)` locale dependency
- **Line ~58:** `toLocaleString(undefined, ...)` uses the browser locale. This is fine for display but may cause inconsistent formatting between server and client SSR. Consider using the `locale` param from `useParams()` or `next-intl`.

---

## 2. Billing Page

**File:** `dashboard/src/app/[locale]/dashboard/billing/page.tsx`
**Summary:** Displays current plan info, usage progress bar, plan comparison cards with upgrade/downgrade flow (Stripe/Polar checkout), and invoice history table. Includes cancel subscription modal.

### Issues

#### 🔴 Critical — `billingApi` and `billingApiExtended` duplicate `getInvoices`
- **Line ~111:** Uses `billingApi.getInvoices(token)` to fetch invoices.
- **Line ~81 (api.ts):** `billingApiExtended` also has `getInvoices` that returns the same data.
- **The bug:** If these two API functions have different return type handling or base paths, they could diverge. Currently they both call `/billing/invoices` but through different code paths (`billingApi` uses `apiFetch` directly; `billingApiExtended` also uses `apiFetch`). This is a maintainability hazard — one may be updated while the other is forgotten.
- **Fix:** Remove `billingApiExtended.getInvoices` and use `billingApi.getInvoices` consistently, or vice versa. Consolidate into one source of truth.

#### 🟡 Medium — Hardcoded English strings throughout
- **Line ~180:** `Cancel Subscription` (button text)
- **Line ~272:** `"Loading invoices…"` (loading text)
- **Line ~277:** `"No invoices yet."` (empty state)
- **Lines ~287-311:** All table headers: `Invoice`, `Date`, `Plan`, `Amount`, `Status`
- **Line ~208:** `plans` array features are hardcoded English arrays: `'100 requests/min'`, `'3 retry attempts'`, etc.
- **Fix:** Wrap all user-visible strings in `t()` calls. The plans features should use translation keys.

#### 🟡 Medium — Upgrade/downgrade detection logic is fragile
- **Lines ~215-216:** `const planId = t(plan.nameKey).toLowerCase()` — This compares the **translated** plan name (lowercased) against `currentPlan`. If the translation of "Free" in another language is "Gratuit" (French), then `t('plans.free').toLowerCase()` = `"gratuit"` which will never match `currentPlan` = `"free"`.
- **Line ~326 (modal):** Same issue — `t(p.nameKey) === showUpgradeModal` compares translated name against a stored translated name, but `showUpgradeModal` was set from `handleUpgrade(t(plan.nameKey))` — so it stores the **translated** name. This breaks if locale changes mid-session.
- **Fix:** Use a stable plan identifier (e.g., `"free"`, `"pro"`, `"business"`) instead of translated names for comparison logic. Add an `id` field to the `plans` array.

#### 🟡 Medium — Cancel subscription handler has unnecessary nested call
- **Lines ~152-158:** `handleCancel` calls `billingApiExtended.getSubscription(token)` then `api.delete('/billing/subscription', token)`. The `getSubscription` call appears to be a check, but its result is discarded (`.then(async () => { ... })`). This is a wasted API call.
- **Fix:** Remove the `getSubscription` call and just call `api.delete` directly.

#### 🟡 Medium — Dynamic import inside click handler
- **Line ~157:** `const { api } = await import('@/lib/api');` — This is a dynamic import inside a user action handler. While it works, it adds latency on first click and is unusual for a module that's likely already loaded.
- **Fix:** Import `api` statically at the top of the file.

#### 🟡 Medium — Next billing date is calculated client-side incorrectly
- **Line ~228-230:** `const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)` — This always shows the 1st of next month, regardless of the user's actual billing cycle. If the user signed up on the 15th, this is wrong.
- **Fix:** Get the actual billing date from the API/subscription data.

#### 🟢 Low — `handleUpgrade` passes translated name, `confirmUpgrade` passes it to API
- **Line ~171:** `const result = await billingApiExtended.upgrade(token, showUpgradeModal.toLowerCase())` — `showUpgradeModal` contains the translated plan name (e.g., "Gratuit" in French), not the plan ID. The API receives `"gratuit"` instead of `"free"`.
- **Fix:** Store the plan ID (`plan.nameKey` or a dedicated ID) in `showUpgradeModal`, not the translated name.

#### 🟢 Low — Modal close button text "Cancel" is hardcoded
- **Line ~342:** `Cancel` button in upgrade modal is hardcoded English.
- **Fix:** Use `tc('cancel')`.

#### 🟢 Low — No keyboard focus visible indicator
- Modals set `tabIndex={-1}` and call `.focus()`, which is good, but there's no visible focus ring on the modal container for keyboard users.

---

## 3. Alerts Page

**File:** `dashboard/src/app/[locale]/dashboard/alerts/page.tsx`
**Summary:** CRUD interface for alert rules. Users can create alerts with conditions (failure rate, latency, consecutive failures), assign notification channels (Slack/email/webhook), test alerts, and delete them.

### Issues

#### 🟡 Medium — Hardcoded English strings
- **Line ~78:** `Get notified when webhooks fail or endpoints have issues.` — subtitle is hardcoded.
- **Line ~100:** `<label>Name</label>` — hardcoded.
- **Line ~109:** `<label>Condition</label>` — hardcoded.
- **Line ~121:** `<label>Threshold</label>` — hardcoded.
- **Line ~132:** `<label>Channels</label>` — hardcoded.
- **Line ~159:** `No alert rules yet. Create one to get notified about webhook failures.` — empty state hardcoded.
- **Line ~183:** `Test` button text hardcoded.
- **Line ~190:** `Delete` button text hardcoded.
- **Fix:** Wrap all in `t()` calls.

#### 🟡 Medium — `CONDITION_LABELS` uses raw English, not translation keys
- **Lines ~14-18:** `CONDITION_LABELS` maps condition keys to hardcoded English strings like `'Failure Rate >'`.
- **Fix:** Use `t(`conditions.${key}`)` or similar pattern, or at least make these translatable.

#### 🟡 Medium — `createAlert` silently swallows errors
- **Line ~86-92:** The catch block is empty — if alert creation fails, the user gets no feedback.
- **Fix:** Add `toast(t('createError'), 'error')` in the catch block.

#### 🟡 Medium — `confirmDeleteAlert` silently swallows errors
- **Line ~101-107:** Same issue — no error feedback on delete failure.
- **Fix:** Add error toast.

#### 🟡 Medium — `testAlert` silently swallows errors
- **Line ~111-116:** The catch block is empty. If the test fails, user sees no feedback (the success toast only fires on success).
- **Fix:** Add `toast(t('testFailed'), 'error')` in catch.

#### 🟢 Low — No form validation beyond `!form.name`
- **Line ~155:** Only checks if name is non-empty. No validation on threshold (could be 0 or negative) or channel selection (could be empty).
- **Fix:** Add validation: threshold > 0, at least one channel selected.

#### 🟢 Low — No confirmation before navigating away from create form
- If user fills out the form and clicks the toggle button to close it, all input is lost without warning.

#### 🟢 Low — Form state reset uses hardcoded default
- **Line ~89:** `setForm({ name: '', condition: 'failure_rate', threshold: 10, channels: ['email'] })` — The reset values are hardcoded rather than using a shared constant.

---

## 4. Notifications Page

**File:** `dashboard/src/app/[locale]/dashboard/notifications/page.tsx`
**Summary:** Lists notifications with filtering by type and read status, pagination, mark-as-read, mark-all-as-read, and delete functionality.

### Issues

#### 🟡 Medium — `typeLabels` is hardcoded English, not translated
- **Lines ~22-28:** `typeLabels` maps filter keys to hardcoded strings: `'All'`, `'Webhook Failed'`, `'Alerts'`, `'System'`, `'Billing'`.
- **Fix:** Use translation keys, e.g., `t('types.all')`, `t('types.webhookFailed')`, etc.

#### 🟡 Medium — Multiple hardcoded English strings
- **Line ~60:** `Stay updated on webhook events, alerts, and system messages` — subtitle hardcoded.
- **Line ~67:** `Mark all as read` button text hardcoded.
- **Line ~100:** `Loading notifications...` loading text hardcoded.
- **Line ~160:** `Previous` / `Next` pagination buttons hardcoded.
- **Line ~176:** `Mark read` button text hardcoded.
- **Line ~182:** `Delete` button text hardcoded.
- **Lines ~136-141:** Multiple error toast messages are hardcoded: `'Failed to load notifications'`, `'Failed to mark as read'`, `'Failed to mark all as read'`, `'Failed to delete notification'`, `'Notification deleted'`.
- **Fix:** Wrap all in `t()` calls.

#### 🟡 Medium — `setTotal` closure bug in `handleDelete`
- **Line ~148:** `setTotal((t) => t - 1)` — The parameter `t` shadows the outer `t` (translation function) from `useTranslations`. While this works in practice because the arrow function creates a new scope, it's confusing and fragile. If someone adds code that references `t` (the translation function) after this line in the same scope, it would break.
- **Fix:** Rename the parameter: `setTotal((prev) => prev - 1)`.

#### 🟡 Medium — `handleMarkAsRead` and `handleDelete` have no loading states
- Clicking "Mark read" or "Delete" has no loading indicator. If the API is slow, the user may click multiple times.
- **Fix:** Add per-notification loading state or disable buttons during API call.

#### 🟢 Low — `handleDelete` updates `total` independently of the API response
- **Line ~148:** `setTotal((t) => t - 1)` runs immediately after `deleteNotification` succeeds, but if the server-side total differs (e.g., from a concurrent delete), this could drift. The next `fetchNotifications` call would correct it, but there's a brief inconsistency.

#### 🟢 Low — `perPage` is hardcoded to 20
- **Line ~41:** `const perPage = 20` — This should match the server's page size. If the API changes its default, this would break pagination display.
- **Fix:** Get perPage from the API response or make it configurable.

#### 🟢 Low — No keyboard accessibility on filter buttons
- Filter buttons are `<button>` elements which are natively keyboard accessible, which is good. But there's no ARIA label or `aria-pressed` state for the active filter.

---

## 5. Health Page

**File:** `dashboard/src/app/[locale]/dashboard/health/page.tsx`
**Summary:** Displays endpoint health status with summary cards (healthy/degraded/unhealthy counts), per-endpoint metrics (success rate, latency, delivery stats), and auto-refreshes every 30 seconds.

### Issues

#### 🔴 Critical — Authentication bypass: uses raw `fetch()` without auth token
- **Lines ~38-44:** The health page uses `fetch(${API}/endpoint-health, ...)` with `credentials: 'include'` but **does not use the auth token** from `useAuth()`. The destructured result is empty: `const { } = useAuth();`.
- Every other page uses `apiFetch` or API helper functions with `{ token }`. This page bypasses the entire auth layer.
- If the API requires a Bearer token (which it does based on other pages), this request will either fail with 401 or (worse) return unauthorized data if cookies happen to work.
- **Fix:** Use `useAuth()` to get the token, then use `apiFetch('/endpoint-health', { token })` instead of raw `fetch`.

#### 🟡 Medium — No error handling for failed health fetch
- **Lines ~40-44:** The catch block is empty. If the endpoint health API fails, the user sees stale data with no indication of an error.
- **Fix:** Add error state and display a warning banner or toast.

#### 🟡 Medium — Summary card labels are hardcoded English
- **Lines ~61, ~67, ~73:** `'Healthy Endpoints'`, `'Degraded Endpoints'`, `'Unhealthy Endpoints'` — labels use raw English text, not translations.
- **Fix:** Use `t('healthyEndpoints')` etc.

#### 🟡 Medium — Empty state text is hardcoded
- **Line ~86:** `No endpoints yet. Create one to start monitoring health.` — hardcoded English.
- **Fix:** Use `t('noEndpoints')`.

#### 🟢 Low — Interval cleanup may not fire on fast navigation
- **Line ~55:** `setInterval(fetchHealth, 30000)` — The cleanup function clears the interval, which is correct. However, if the component unmounts and remounts quickly (e.g., during fast route changes), there could be a brief period where two intervals are running. This is mitigated by React's cleanup, but worth noting.

#### 🟢 Low — No loading skeleton, just text
- **Line ~83:** Loading state shows just `{tc('loading')}` text. Other pages use spinners or skeleton loaders. This is inconsistent.
- **Fix:** Add a consistent loading skeleton or spinner.

#### 🟢 Low — `consecutive_failures` pluralization
- **Line ~148:** `failure${ep.consecutive_failures > 1 ? 's' : ''}` — Manual English pluralization. This won't work for languages with different plural rules.
- **Fix:** Use `t('consecutiveFailures', { count: ep.consecutive_failures })` with ICU message format.

---

## 6. Rate Limiting Page

**File:** `dashboard/src/app/[locale]/dashboard/rate-limiting/page.tsx`
**Summary:** Displays rate limiting configuration overview with summary stats (total endpoints, avg/peak RPS, throttled count), a per-endpoint limits table, and educational content about how rate limiting works.

### Issues

#### 🔴 Critical — No i18n at all — entire page is hardcoded English
- The page does **not import or use `useTranslations`**. Every single user-visible string is hardcoded:
  - `"⚡ Rate Limiting"` (title)
  - `"Monitor and configure rate limits for your webhook endpoints."` (subtitle)
  - `"Total Endpoints"`, `"Avg Requests/sec"`, `"Peak Requests/sec"`, `"Throttled Requests"` (stat labels)
  - `"Per-Endpoint Limits"` (section header)
  - Table headers: `"Endpoint"`, `"RPS"`, `"RPM"`, `"Burst"`, `"Queue"`, `"Throttled"`
  - Empty state: `"Rate Limiting"`, description text, feature cards (`"Auto Retry"`, `"Per-Endpoint"`, `"Alerts"`)
  - `"How Rate Limiting Works"` section with 4 items
- **Fix:** Import `useTranslations('rateLimiting')` and wrap all strings.

#### 🟡 Medium — Client-side data transformation masks API data
- **Lines ~42-57:** The `fetchStats` function transforms raw API data client-side. It calculates `avg_rps`, `peak_rps`, and `total_throttled` locally, and hardcodes `current_queue_depth: 0` and `throttled_count: 0`. This means the Queue and Throttled columns in the table always show `0`.
- If the API provides these values, they're being discarded. If it doesn't, the columns are misleading (always showing 0 suggests "no throttling" even when there is some).
- **Fix:** Either use the API-provided values for queue depth and throttled count, or remove those columns if the API doesn't provide them.

#### 🟡 Medium — `endpoint_url` is truncated to 8 chars + "..."
- **Line ~51:** `endpoint_url: d.endpoint_id.slice(0, 8) + '...'` — This shows only the first 8 characters of the endpoint ID, which is not a URL at all. The column is labeled "Endpoint" and displays in `font-mono`, suggesting it should show the actual URL.
- **Fix:** The API response should include the endpoint URL. If it only returns `endpoint_id`, the page should fetch endpoint details separately or the API should be enhanced.

#### 🟡 Medium — `total_throttled` is always 0
- **Line ~45:** `total_throttled: 0` is hardcoded. The "Throttled Requests" card always shows `0` in green, which is misleading.
- **Fix:** Get this value from the API or remove the card.

#### 🟢 Low — Empty state shows "Rate Limiting" as h2, which duplicates the page title
- **Line ~145:** `<h2>Rate Limiting</h2>` — This is the same as the page title. Redundant.

#### 🟢 Low — No loading state for the main content area
- The loading state only shows a skeleton for the header area. Once loaded, there's no indication if data is being refreshed.

---

## 7. Audit Log Page

**File:** `dashboard/src/app/[locale]/dashboard/audit-log/page.tsx`
**Summary:** Displays audit log entries in a table with action filtering, actor/resource details, and "load more" pagination. Shows action icons and IP addresses.

### Issues

#### 🔴 Critical — No i18n at all — entire page is hardcoded English
- The page does **not import or use `useTranslations`**. Every single user-visible string is hardcoded:
  - `"📋 Audit Log"` (title)
  - `"Track all activity in your workspace. Who did what, when, and from where."` (subtitle)
  - `"All Actions"`, `"Authentication"`, `"Endpoints"`, `"API Keys"`, `"Webhooks"`, `"Team"`, `"Settings"`, `"Billing"` (filter options)
  - `"Loading audit log..."` (loading text)
  - `"No activity yet"` (empty state h2)
  - Description text in empty state
  - Table headers: `"Time"`, `"Action"`, `"Actor"`, `"Resource"`, `"Details"`, `"IP"`
  - `"Load more"` button
- **Fix:** Import `useTranslations('auditLog')` and wrap all strings.

#### 🟡 Medium — Filter sends category prefix, not exact action
- **Line ~95:** `if (filter) params.set('action', filter)` — The filter sends `"auth"`, `"endpoint"`, etc. as the `action` parameter. But actual actions are like `"auth.login"`, `"endpoint.create"`. This depends on the API supporting prefix matching, which isn't guaranteed.
- **Verify:** Confirm the API supports prefix matching for the `action` parameter. If it expects exact matches, this filter is broken.

#### 🟡 Medium — `page` state doesn't reset on filter change correctly
- **Line ~186:** `onChange={(e) => { setFilter(e.target.value); setPage(1); }}` — This sets `page` to 1 and `filter` simultaneously. But `fetchEntries` is called via `useEffect` on `[fetchEntries]`, and `fetchEntries` depends on `filter`. The `setPage(1)` call may not be reflected in the `fetchEntries` call if React batches the state updates (which it does in React 18+). However, `fetchEntries` takes a `p` parameter and is called with `1` in the effect, so this should be fine because the effect calls `fetchEntries(1)` explicitly.

#### 🟡 Medium — Nested try-catch swallows inner errors silently
- **Lines ~48-55:** There's a nested try-catch. The outer catch does nothing, and the inner catch also does nothing (sets empty state). This means any error in the `apiFetch` call is silently swallowed.
- **Fix:** At minimum, log the error or show a toast notification.

#### 🟡 Medium — "Load more" appends but doesn't deduplicate
- **Line ~52:** `setEntries(p === 1 ? data.entries : (prev) => [...prev, ...data.entries])` — If the user clicks "Load more" rapidly (before the first request completes), or if the API returns overlapping entries due to concurrent writes, duplicates could appear.
- **Fix:** Add deduplication by ID, or disable the button during loading.

#### 🟡 Medium — `hasMore` is always false in fallback case
- **Line ~53:** When the API returns an error, `setHasMore(false)` is set. This is fine, but combined with the silent error swallowing, the user has no idea why they can't load more entries.

#### 🟢 Low — No date range filter
- The audit log has no date range filtering, which is a common requirement for audit logs. This is a feature gap rather than a bug.

#### 🟢 Low — Resource ID truncation is aggressive
- **Line ~218:** `entry.resource_id?.slice(0, 8)` — Only shows first 8 chars. For debugging, users might need more. Consider a tooltip or copy-to-clipboard.

#### 🟢 Low — No sorting options
- Entries are displayed in API-returned order (presumably chronological). No option to sort by actor, action, or time.

---

## Cross-Page Issues

### 🔴 Critical — Inconsistent i18n adoption
| Page | Uses `useTranslations` | Hardcoded strings |
|------|----------------------|-------------------|
| Analytics | ✅ Yes | 🟡 Some (subtitle, stat labels) |
| Billing | ✅ Yes | 🟡 Many (table headers, plan features, buttons) |
| Alerts | ✅ Yes | 🟡 Many (labels, empty state, buttons) |
| Notifications | ✅ Yes | 🟡 Many (labels, buttons, error toasts) |
| Health | ✅ Yes | 🟡 Some (summary cards, empty state) |
| Rate Limiting | ❌ No | 🔴 **All strings hardcoded** |
| Audit Log | ❌ No | 🔴 **All strings hardcoded** |

**Priority fix:** Add `useTranslations` to Rate Limiting and Audit Log pages immediately. Then address the hardcoded strings in the other 5 pages.

### 🟡 Medium — Inconsistent error handling patterns
- **Analytics:** Silent catch → shows "No data"
- **Billing:** Silent catch → shows defaults
- **Alerts:** Silent catch → no feedback
- **Notifications:** Shows error toast ✅ (best practice)
- **Health:** Silent catch → shows stale data
- **Rate Limiting:** Silent catch → shows empty state
- **Audit Log:** Silent catch → shows empty state

**Recommendation:** Adopt the Notifications pattern (toast on error) across all pages. At minimum, add a "Something went wrong" state with a retry button.

### 🟡 Medium — Inconsistent loading states
- Analytics: Animated pulse text
- Billing: Spinner + text
- Alerts: Text only
- Health: Text only
- Notifications: Animated pulse text
- Rate Limiting: Skeleton loader
- Audit Log: Spinner + text

**Recommendation:** Standardize on one pattern (skeleton loader preferred for perceived performance).

### 🟢 Low — `useAuth()` destructuring inconsistency
- Health page: `const { } = useAuth()` — empty destructuring, doesn't use token
- All others: `const { token } = useAuth()` — correct pattern

---

## Summary of Severity Counts

| Severity | Count |
|----------|-------|
| 🔴 Critical | 4 |
| 🟡 Medium | 28 |
| 🟢 Low | 16 |

### Top 5 Priority Fixes
1. **Health page auth bypass** — Use `apiFetch` with token instead of raw `fetch()`
2. **Rate Limiting + Audit Log i18n** — Add `useTranslations` to both pages
3. **Billing plan comparison logic** — Use stable IDs instead of translated names
4. **Billing upgrade sends translated plan name to API** — Will break in non-English locales
5. **Consistent error handling** — Add error toasts/alerts across all pages
