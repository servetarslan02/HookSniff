# Agent 3 Review: Dashboard Tools Pages

Reviewed: 2026-05-10
Pages: playground, webhook-builder, signature-verifier, templates, schemas, routing, transforms

---

## 1. Playground Page

**File:** `dashboard/src/app/[locale]/dashboard/playground/page.tsx`
**Summary:** Interactive API playground with method/path selector, AI payload generator, preset endpoints, request history (localStorage), live delivery viewer (polling), and a cURL command generator.

### Issues Found

#### 🟡 Hardcoded English strings bypass i18n (Medium)
- `HistoryPanel`: "Request History", "Clear" are hardcoded while the component also uses `t('requestHistory')` and `t('clear')` — inconsistent. Lines ~170, ~176 use literal strings instead of translation keys.
- `LiveRequestViewer`: No translation keys used for "AI Payload Generator" label (line ~340).
- Status labels in `ResponseInspector`: "OK", "Redirect", "Client Error", "Server Error" are hardcoded (lines ~115-118) while translation keys `ok`, `redirect`, `clientError`, `serverError` exist in `en.json` but are **never used**.
- "Sending..." text in button (line ~396) is hardcoded instead of using `t('sending')` or similar key.
- "📋 Copy" button text hardcoded (line ~423).
- "Headers (auto-added)" label hardcoded (line ~365).

**Fix:** Replace all hardcoded strings with `t()` calls. The translation keys already exist for status labels — just wire them up:
```tsx
// Instead of: {status < 300 ? 'OK' : ...}
// Use: {status < 300 ? t('ok') : status < 400 ? t('redirect') : ...}
```

#### 🟡 Hardcoded `Authorization: 'Bearer YOUR_TOKEN'` in headers object (Medium)
- Line ~335: The `headers` object is defined with a literal placeholder `'YOUR_TOKEN'`. This is shown in the cURL generator and used in `fetch()` calls. If a user sends a request without modifying this, it will fail with a 401 and the error won't be clearly explained.
- The `useAuth()` hook is called but its return value (`token`) is never destructured or used.

**Fix:** Destructure `token` from `useAuth()` and use it:
```tsx
const { token } = useAuth();
const headers = {
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};
```

#### 🟡 `API_BASE` defined at module level with `process.env` (Medium)
- Line 10: `const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';` is evaluated at module load time. In Next.js 15, `process.env.NEXT_PUBLIC_*` variables are inlined at build time, so this is technically fine for `'use client'` components — but the fallback `http://localhost:3000/v1` will be used in production if the env var is missing, which would break all requests silently.

**Fix:** Align with `lib/api.ts` which uses `/api` as production fallback:
```tsx
const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');
```

#### 🟡 Direct `fetch()` instead of `apiFetch()` (Medium)
- The playground uses raw `fetch()` with manual header management instead of the shared `apiFetch` utility from `@/lib/api`. This means:
  - No automatic 401 handling / token refresh
  - No request timeout (30s abort)
  - No consistent error handling

**Fix:** For the main `handleSend` function, consider using `apiFetch` or at minimum wrapping the fetch with similar timeout/401 logic. The playground intentionally gives raw control, so this is a design tradeoff — but the 401 auto-redirect should at least be handled.

#### 🟢 `setShowAiGenerator` is unused state (Low)
- Line ~315: `const [_showAiGenerator, setShowAiGenerator] = useState(false);` — the state value is never read (prefixed with `_`). `setShowAiGenerator(false)` is called in `handleAiGenerate` but has no effect since nothing reads the state.

**Fix:** Remove the unused state entirely.

#### 🟢 `ResponseInspector` header text for empty response (Low)
- When `response` is null and `status` is null, it shows `t('sendToInspect')`. But when there's an error (network failure), `response` is `{ error: errorMessage }` and `status` is null, so the status bar won't show — the user sees a response body but no status indicator, which could be confusing.

**Fix:** Show an error status indicator when `status` is null but `response` contains an error.

#### 🟢 History panel doesn't show method color for PUT/PATCH (Low)
- The method badge color logic handles GET, POST, DELETE but falls through to gray for PUT and PATCH, even though those are valid methods in the `METHODS` array.

---

## 2. Webhook Builder Page

**File:** `dashboard/src/app/[locale]/dashboard/webhook-builder/page.tsx`
**Summary:** Visual webhook payload builder with templates, field editor (key/value/type), endpoint selector, JSON preview, and send functionality.

### Issues Found

#### 🔴 No i18n integration at all (Critical)
- **Zero** `useTranslations` usage. Every single string in this page is hardcoded English:
  - "🔧 Webhook Builder", "Visually create and send webhook payloads..."
  - "Templates", "Event Type", "Payload Fields", "+ Add field"
  - "Send To", "🚀 Send Webhook", "Sending..."
  - "Preview", "🔄 Refresh", "// Click \"Refresh\" to preview the payload"
  - Error toasts: "Select an endpoint first", "Webhook sent!", "Failed to send", "Network error"

**Fix:** Add `useTranslations('webhookBuilder')` and add all keys to `en.json` (and other locale files). Replace every hardcoded string.

#### 🟡 `token` from `useAuth()` is fetched but never used in the API call (Medium)
- Line ~66: `const { token } = useAuth();` — token is destructured
- Line ~91: The fetch call uses `credentials: 'include'` but does **not** send `Authorization: Bearer ${token}` header
- The `token` is only checked for truthiness as a guard (`if (!token || !endpointId)`) but never sent to the server

**Fix:** Either use `apiFetch` (which handles auth), or add the Authorization header:
```tsx
const res = await fetch(`${API}/webhooks`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  credentials: 'include',
  body: JSON.stringify({ endpoint_id: endpointId, event: eventType, data: payload }),
});
```

#### 🟡 `API_BASE` inconsistency with shared utility (Medium)
- Line ~89: Defines `const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';` locally instead of using the shared `apiFetch` or the pattern from `lib/api.ts`.

**Fix:** Use `apiFetch` from `@/lib/api` which handles the base URL consistently.

#### 🟡 No response feedback after sending (Medium)
- After `handleSend`, success shows a toast but the response body/status is never displayed. The user has no way to see what the server returned.

**Fix:** Add a response state and display the server response after sending.

#### 🟡 Preview is static — doesn't auto-update (Medium)
- The preview panel requires clicking "🔄 Refresh" to update. Changing fields doesn't trigger a preview update. This is a UX friction point.

**Fix:** Either auto-update preview on field changes (with debounce), or at minimum auto-update when a template is loaded.

#### 🟡 `endpointId` input is a raw text field (Medium)
- Users must manually type an endpoint ID like `ep_your_endpoint_id`. There's no dropdown of existing endpoints, no validation, and no help text explaining where to find the ID.

**Fix:** Add an endpoint selector dropdown populated from `endpointsApi.list()`, similar to how the transforms page does it.

#### 🟢 `updatePreview` builds payload but doesn't include `event` at top level (Low)
- The preview shows `{ event: eventType, data: payload }` but when `handleSend` sends the webhook, it sends `{ endpoint_id, event, data }`. The preview doesn't show `endpoint_id`, which could confuse users about what's actually sent.

#### 🟢 Type select only offers `string`, `number`, `boolean` (Low)
- The `WebhookField` interface defines types `'string' | 'number' | 'boolean' | 'object' | 'array'` but the select only renders options for string, number, boolean. Object and array types are defined but unusable.

---

## 3. Signature Verifier Page

**File:** `dashboard/src/app/[locale]/dashboard/signature-verifier/page.tsx`
**Summary:** Client-side HMAC signature verification tool. Users paste a webhook payload, secret, and signature to verify authenticity. Also includes a "Compute Signature" feature and a Node.js code example.

### Issues Found

#### 🔴 No i18n integration at all (Critical)
- **Zero** `useTranslations` usage. All strings hardcoded:
  - "🔐 Signature Verifier", "Verify webhook signatures..."
  - "Algorithm", "HMAC-SHA256", "HMAC-SHA512"
  - "Verify Signature", "Webhook Payload (raw body)", "Webhook Secret"
  - "Signature (from x-hooksniff-signature header)"
  - "✓ Verify Signature", "🔧 Compute Signature"
  - "Signature Valid!", "Signature Invalid!", all description text
  - "Code Example — Node.js", "How Webhook Signatures Work"
  - Toast messages: "Payload and secret are required", "Signature computed!", etc.

**Fix:** Add `useTranslations('signatureVerifier')` and i18n all strings.

#### 🟡 Signature comparison is not constant-time (Medium)
- Line ~68: `const isValid = computed === provided;` — JavaScript string comparison is **not constant-time**. This is a security tool that explicitly mentions "Use constant-time comparison to prevent timing attacks" in the code example, yet the tool itself doesn't follow this advice.

**Fix:** Implement constant-time comparison:
```tsx
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
```
Note: This is a client-side tool, so the practical risk is low, but it sets a bad example.

#### 🟡 `useAuth` is not imported — no auth check (Medium)
- This page doesn't import `useAuth` at all. If this page should require authentication (it's under `/dashboard/`), there's no guard. Other pages call `useAuth()` at the top.

**Fix:** Add `useAuth()` call for consistency with other dashboard pages, even if the tool itself works client-side.

#### 🟡 Sample code uses `req.body` directly — misleading (Medium)
- The code example shows `verifyWebhookSignature(req.body, ...)` but `req.body` in Express is already parsed. For HMAC verification, you need the **raw body** string. The comment says "raw body string" but the code doesn't show the Express raw body middleware setup.

**Fix:** Add a note about Express raw body middleware:
```js
// IMPORTANT: Use express.raw() or a custom middleware to get the raw body
// app.use('/webhooks', express.raw({ type: 'application/json' }));
```

#### 🟢 No "clear all" button (Low)
- There's no way to reset all fields at once. Users must clear each field manually.

#### 🟢 Algorithm change doesn't update the sample code (Low)
- The sample code always shows `sha256` regardless of which algorithm is selected. If a user selects SHA-512, the code example is misleading.

---

## 4. Templates Page

**File:** `dashboard/src/app/[locale]/dashboard/templates/page.tsx`
**Summary:** Displays pre-built webhook configuration templates fetched from the API. Shows template name, description, and tags in a grid layout.

### Issues Found

#### 🔴 No i18n integration at all (Critical)
- All strings hardcoded: "📦 Templates", "Pre-built webhook configurations...", "No templates available", "Templates will appear here once configured.", "Loading..."

**Fix:** Add `useTranslations('templates')` and i18n all strings.

#### 🟡 Silent error handling — API failures are invisible (Medium)
- Line ~22: `.catch(() => {})` — if the API call fails, the user sees an empty state ("No templates available") instead of an error message. This conflates "no data" with "fetch failed".

**Fix:** Add error state:
```tsx
const [error, setError] = useState<string | null>(null);
// In catch:
.catch((err) => setError(err.message))
// In render: show error banner when error is set
```

#### 🟡 Loading state is bare text (Medium)
- `return <div className="p-8 text-gray-500">Loading...</div>;` — uses plain text instead of the `LoadingSpinner` component used elsewhere. Inconsistent with other pages.

**Fix:** Use `LoadingSpinner` component and wrap in the page layout.

#### 🟡 No click handler on template cards (Medium)
- Template cards have `cursor-pointer` styling but no `onClick` handler. Clicking a card does nothing. This is misleading UX.

**Fix:** Either remove `cursor-pointer` or add an `onClick` that opens a detail view / applies the template.

#### 🟡 Missing dark mode text color on template name (Medium)
- `<h3 className="font-semibold mb-1">{t.name}</h3>` — no `text-gray-900 dark:text-white` class. In dark mode, the text may be invisible or hard to read depending on the inherited color.

**Fix:** Add explicit dark mode text colors.

#### 🟡 `token` guard prevents loading for unauthenticated users (Medium)
- `if (!token) return;` in useEffect — if the user is still loading auth state, the fetch is skipped and `loading` stays `true` forever (no timeout). If `token` becomes available later, the effect won't re-run because `token` is already in the dependency array but the early return happened.

**Fix:** Handle the loading/auth state properly:
```tsx
useEffect(() => {
  if (!token) { setLoading(false); return; }
  // ... fetch
}, [token]);
```

#### 🟢 No pagination (Low)
- If there are many templates, they all load at once. No pagination or "load more" mechanism.

---

## 5. Schemas Page

**File:** `dashboard/src/app/[locale]/dashboard/schemas/page.tsx`
**Summary:** Displays registered event schemas with name, version, and creation date. Fetched from the API.

### Issues Found

#### 🔴 No i18n integration at all (Critical)
- All strings hardcoded: "📋 Schemas", "Define and validate event schemas...", "No schemas registered yet", "Register a schema to start...", "Loading..."

**Fix:** Add `useTranslations('schemas')` and i18n all strings.

#### 🟡 Silent error handling (Medium)
- Same issue as templates: `.catch(() => {})` hides API failures behind empty state.

#### 🟡 Loading state is bare text (Medium)
- Same as templates: plain "Loading..." text instead of `LoadingSpinner`.

#### 🟡 `created_at` displayed as raw ISO string (Medium)
- `<p className="text-sm text-gray-500">v{s.version} · {s.created_at}</p>` — displays the raw ISO timestamp (e.g., `2024-01-15T10:30:00.000Z`) instead of a formatted date.

**Fix:** Format the date:
```tsx
new Date(s.created_at).toLocaleDateString()
```

#### 🟡 Missing dark mode text color on schema name (Medium)
- `<h3 className="font-semibold">{s.name}</h3>` — no dark mode text color.

#### 🟡 No actions on schema cards (Medium)
- Schema cards are display-only with no edit, delete, or view detail actions. The card styling suggests interactivity but nothing happens on click.

#### 🟡 `token` guard same issue as templates (Medium)
- Same early return issue with auth loading state.

#### 🟢 No schema version detail or JSON viewer (Low)
- Schemas are listed with just name and version. For a schema validation tool, there's no way to view the actual schema definition.

---

## 6. Routing Page

**File:** `dashboard/src/app/[locale]/dashboard/routing/page.tsx`
**Summary:** Displays endpoint routing configuration including strategy, fallback URLs, health status, and response times.

### Issues Found

#### 🔴 No i18n integration at all (Critical)
- All strings hardcoded: "🔀 Routing", "Configure how webhooks are routed...", "Strategy:", "Fallback:", "Healthy", "Unhealthy", "ms avg", "No endpoints configured yet."

**Fix:** Add `useTranslations('routing')` and i18n all strings.

#### 🔴 Non-existent CSS classes `badge-red` and `badge-green` (Critical)
- Line 53: `<span className={`badge ${ep.failure_streak >= 3 ? 'badge-red' : 'badge-green'}`}>` — the CSS file (`globals.css`) has **no definitions** for `.badge`, `.badge-red`, or `.badge-green`. These classes do nothing. The health status badge will render as unstyled text.

**Fix:** Use actual Tailwind classes:
```tsx
<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
  ep.failure_streak >= 3
    ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
    : 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
}`}>
```

#### 🟡 `apiFetch` returns `RoutingInfo[]` but API likely returns wrapped object (Medium)
- Line ~31: `apiFetch<RoutingInfo[]>('/endpoints', { token })` — assumes the API returns a raw array. But the `Endpoint` interface in `api.ts` and other pages suggest the API returns `{ endpoints: Endpoint[] }`. This could cause a runtime error or empty state.

**Fix:** Verify the API response shape. Likely should be:
```tsx
apiFetch<{ endpoints: RoutingInfo[] }>('/endpoints', { token })
  .then(res => setEndpoints(res.endpoints || []))
```

#### 🟡 `RoutingInfo` interface duplicates fields from `Endpoint` (Medium)
- The `RoutingInfo` interface redefines `id`, `url`, `endpoint_id`, `routing_strategy`, etc. These already exist on the `Endpoint` interface in `lib/api.ts`. This is fragile — if the API shape changes, only one gets updated.

**Fix:** Extend `Endpoint`:
```tsx
interface RoutingInfo extends Endpoint {
  resolved_url: string;
  using_fallback: boolean;
}
```

#### 🟡 Silent error handling (Medium)
- `.catch(() => {})` hides failures.

#### 🟡 No dark mode text on URL and strategy text (Medium)
- `<p className="font-mono text-sm">{ep.url}</p>` — no dark mode color. Same for strategy text.

#### 🟡 No action buttons on routing cards (Medium)
- Users can see routing info but can't edit strategy, toggle fallback, or view details. The page description says "Configure how webhooks are routed" but it's read-only.

#### 🟡 Missing `avg_response_ms` null check (Medium)
- `<p className="text-xs text-gray-500 mt-1">{ep.avg_response_ms}ms avg</p>` — if `avg_response_ms` is `undefined` or `null`, this renders "undefinedms avg" or "nullms avg".

**Fix:** `{ep.avg_response_ms ?? '—'}ms avg`

---

## 7. Transforms Page

**File:** `dashboard/src/app/[locale]/dashboard/transforms/page.tsx`
**Summary:** Full CRUD for webhook transform rules per endpoint. Supports filter (include/exclude fields), field mapping (source→target), and field enrichment. Uses the shared `transformsApi` and `endpointsApi`.

### Issues Found

#### 🔴 No i18n integration at all (Critical)
- All strings hardcoded: "🔄 Webhook Transforms", "Filter, map, and enrich...", "+ New Rule", "Select Endpoint", "Choose an endpoint...", "New Transform Rule", all labels, toasts, empty states.

**Fix:** Add `useTranslations('transforms')` and i18n all strings.

#### 🟡 No validation before creating a rule (Medium)
- `handleCreate` doesn't validate that at least one transform operation (filter, map, or enrich) is configured. A user can create an empty rule with no filter, no mappings, and no enrichment — which is a no-op.

**Fix:** Add validation:
```tsx
if (!filterInclude && !filterExclude && !(mapSource && mapTarget) && !(enrichKey && enrichValue)) {
  toast('Configure at least one transform operation', 'error');
  return;
}
```

#### 🟡 `filter` object is overwritten instead of merged (Medium)
- Line ~77: `if (filterInclude) rule.filter = { include: ... }` then `if (filterExclude) rule.filter = { ...rule.filter, exclude: ... }` — this works correctly because of the spread, but if only `filterExclude` is set (no include), `rule.filter` will be `{ exclude: [...] }` with no `include` key. The API might expect both. Also, if `filterInclude` is empty string `""`, it's falsy and skipped, which is correct.

Actually, looking more carefully: the logic is correct. The spread handles the merge. Not a bug.

#### 🟡 Race condition in `loadRules` (Medium)
- `loadRules` sets `setLoading(false)` in the `finally` block. If the user quickly switches endpoints, multiple `loadRules` calls can overlap. The first to finish sets `loading(false)` while the second is still loading, causing a flash of empty state.

**Fix:** Use an abort pattern:
```tsx
const loadRules = useCallback(async (endpointId: string) => {
  if (!token || !endpointId) return;
  setLoading(true);
  const controller = new AbortController();
  try {
    const data = await transformsApi.list(token, endpointId);
    setRules(data);
  } catch {} finally { setLoading(false); }
  return () => controller.abort();
}, [token]);
```

Or use a `useRef` to track the latest request:
```tsx
const latestRequest = useRef(0);
const loadRules = useCallback(async (endpointId: string) => {
  const reqId = ++latestRequest.current;
  // ... in finally:
  if (reqId === latestRequest.current) setLoading(false);
}, [token]);
```

#### 🟡 Delete doesn't confirm (Medium)
- `handleDelete` immediately calls the API with no confirmation dialog. Accidental clicks delete rules permanently.

**Fix:** Add a confirmation step or undo mechanism.

#### 🟡 Empty catch blocks swallow errors in `loadRules` (Medium)
- `catch {}` in `loadRules` — if the API fails, the user sees empty rules with no error indication.

#### 🟡 Filter include/exclude can conflict (Medium)
- A user can add the same field to both include and exclude lists. The behavior is undefined — should the system prevent this or show a warning?

#### 🟢 `showCreate` toggle doesn't scroll to form (Low)
- When clicking "+ New Rule", the form appears but the page doesn't scroll to it. On mobile, the form might be below the fold.

#### 🟢 Enrich section only supports one key-value pair (Low)
- The create form only allows one enrich key/value pair. The API schema supports `Record<string, unknown>` (multiple fields). Users would need to create multiple rules for multiple enrichments.

---

## Cross-Cutting Issues Summary

### 🔴 Critical (Must Fix)
| Issue | Pages Affected |
|-------|---------------|
| No i18n — all strings hardcoded English | webhook-builder, signature-verifier, templates, schemas, routing, transforms (6 of 7 pages) |
| Non-existent CSS classes (`badge-red`, `badge-green`) | routing |

### 🟡 Medium (Should Fix)
| Issue | Pages Affected |
|-------|---------------|
| Silent error handling (`.catch(() => {})`) | templates, schemas, routing |
| Bare "Loading..." text instead of LoadingSpinner | templates, schemas |
| `token` from auth not sent in API calls | webhook-builder |
| Missing dark mode text colors | templates, schemas, routing |
| `API_BASE` fallback inconsistency | playground, webhook-builder |
| Missing null checks on optional fields | routing (`avg_response_ms`) |
| Race condition in data loading | transforms |
| No validation before API writes | transforms, webhook-builder |
| `created_at` displayed as raw ISO string | schemas |

### 🟢 Low (Nice to Have)
| Issue | Pages Affected |
|-------|---------------|
| Unused state (`_showAiGenerator`) | playground |
| No click handlers on card-styled elements | templates, schemas |
| Algorithm change doesn't update sample code | signature-verifier |
| No pagination on list pages | templates, schemas |
| Type select incomplete (missing object/array) | webhook-builder |

### i18n Gap Analysis
- **Playground**: Uses `useTranslations('playground')` — keys exist in `en.json`. ✅ Mostly i18n'd but has ~10 hardcoded strings.
- **Webhook Builder**: No `useTranslations` at all. Needs new `webhookBuilder` section in all locale files.
- **Signature Verifier**: No `useTranslations` at all. Needs new `signatureVerifier` section.
- **Templates**: No `useTranslations` at all. Needs new `templates` section.
- **Schemas**: No `useTranslations` at all. Needs new `schemas` section.
- **Routing**: No `useTranslations` at all. Needs new `routing` section.
- **Transforms**: No `useTranslations` at all. Needs new `transforms` section.

**Total hardcoded strings across all 7 pages: ~120+**
