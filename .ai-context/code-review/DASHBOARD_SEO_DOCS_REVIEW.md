# Code Review: Dashboard SEO/Alternatives, Blog, Docs & Admin Pages

**Reviewer:** AI Code Review Agent
**Date:** 2026-05-10
**Scope:** 32 files across SEO/Alternatives (8), Blog (3), Docs (15), Admin (6)
**Severity Scale:** 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low | ⚪ Info

---

## Executive Summary

Overall the codebase is **well-structured and readable** — consistent Tailwind patterns, proper dark mode support, and clean component composition. The most significant findings are:

1. **XSS via `dangerouslySetInnerHTML`** in blog post rendering (the biggest real risk)
2. **API base URL hardcoded** across docs pages (information disclosure + inflexibility)
3. **No admin auth guards** — admin pages rely solely on client-side token checks
4. **Newsletter email sent to client-side API without CSRF/rate-limiting indicators**
5. **Massive code duplication** across all 8 alternatives pages

No SQL injection, no server-side vulnerabilities found (all pages are Next.js client/server components rendering static content or calling client-side APIs).

---

## File-by-File Analysis

---

### 1. `dashboard/src/app/[locale]/alternatives/convoy/page.tsx`

**Type:** Static comparison page (Server Component)

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🔵 Low | Code Quality | No `description` in metadata — only `title`. Misses SEO opportunity for meta description. |
| 2 | 🔵 Low | Code Quality | Duplicated nav structure — identical boilerplate in every alternatives page. Should extract to a shared layout component. |
| 3 | ⚪ Info | Design | Table uses `bg-brand-50/20` on HookSniff column — consistent pattern, good visual hierarchy. |

**XSS Risk:** None. All content is static JSX literals.

---

### 2. `dashboard/src/app/[locale]/alternatives/convoy-alternatives/page.tsx`

**Type:** SEO landing page (Server Component)

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🔵 Low | SEO | Metadata includes both `title` and `description` — good. |
| 2 | 🔵 Low | Code Quality | Same nav duplication as all alternatives pages. |
| 3 | ⚪ Info | Content | Uses `max-w-7xl` while other alternatives pages use `max-w-5xl` — inconsistent layout width. |

**XSS Risk:** None.

---

### 3. `dashboard/src/app/[locale]/alternatives/hook0/page.tsx`

**Type:** Static comparison page (Server Component)

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🔵 Low | SEO | Missing `description` in metadata. |
| 2 | 🟡 Medium | Accuracy | Claims Hook0 has "❌ (self-hosted only)" for managed hosting, but Hook0 actually does offer a cloud option. Factually incorrect comparison data could damage credibility. |

**XSS Risk:** None.

---

### 4. `dashboard/src/app/[locale]/alternatives/hookdeck/page.tsx`

**Type:** Static comparison page (Server Component)

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🔵 Low | SEO | Missing `description` in metadata. |
| 2 | 🔵 Low | Code Quality | `rows` array is defined at module level — good for performance (no re-creation on renders). |
| 3 | 🟡 Medium | Content Fairness | The `winner` field highlights HookSniff in green for all rows where it wins, but Hookdeck's wins are also shown in green — this is actually fair and balanced. Good pattern. |

**XSS Risk:** None.

---

### 5. `dashboard/src/app/[locale]/alternatives/hookdeck-alternatives/page.tsx`

**Type:** SEO landing page (Server Component)

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🔵 Low | Code Quality | Includes "Why Choose Hookdeck Over HookSniff?" section — honest and balanced. Good practice for SEO credibility. |
| 2 | 🔵 Low | Consistency | Uses `max-w-7xl` — consistent with `convoy-alternatives` but inconsistent with the single-comparison pages (`max-w-5xl`). |

**XSS Risk:** None.

---

### 6. `dashboard/src/app/[locale]/alternatives/svix/page.tsx`

**Type:** Static comparison page (Server Component)

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🔵 Low | SEO | Missing `description` in metadata. |
| 2 | 🔵 Low | Content | Bottom line mentions "$5,532/year saved" — clear, compelling CTA. |

**XSS Risk:** None.

---

### 7. `dashboard/src/app/[locale]/alternatives/svix-alternatives/page.tsx`

**Type:** SEO landing page (Server Component)

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🔵 Low | Code Quality | `alternatives` array defined at module level — good. Uses `key={pro}` and `key={con}` for list items — these are string literals so they're stable, but could collide if two pros/cons have identical text. Low risk. |
| 2 | 🟡 Medium | SEO | Most comprehensive alternatives page with honest pros/cons for each competitor including HookSniff's own weaknesses (SOC 2 ready vs Type 2, 99.9% vs 99.99% SLA). Excellent for E-E-A-T. |

**XSS Risk:** None.

---

### 8. `dashboard/src/app/[locale]/alternatives/webhook-relay/page.tsx`

**Type:** Static comparison page (Server Component)

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🔵 Low | SEO | Missing `description` in metadata. |

**XSS Risk:** None.

---

### 📋 Alternatives Pages — Cross-Cutting Issues

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Code Duplication | **All 8 alternatives pages** duplicate the same nav bar, layout wrapper, and page structure. Should be extracted into a shared `AlternativesLayout` component. Approximately 30-40 lines of boilerplate repeated per file. |
| 2 | 🟡 Medium | SEO | Only 2 of 8 pages have `description` in metadata. The other 6 only have `title`. Missing meta descriptions hurts click-through rates on search results. |
| 3 | 🔵 Low | Accessibility | Comparison tables lack `<caption>` elements and `scope` attributes on `<th>` elements. Screen readers will struggle to associate data cells with headers. |
| 4 | 🔵 Low | i18n | All alternatives pages use hardcoded English strings despite being under `[locale]` route. The `LanguageSwitcher` component is rendered but translations are not applied to content. |

---

### 9. `dashboard/src/app/[locale]/blog/page.tsx`

**Type:** `'use client'` — Blog listing page with search, filtering, pagination

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Security | **Newsletter form sends email to `/api/newsletter` without any visible CSRF protection.** The `fetch` call doesn't include a CSRF token. If the API endpoint doesn't validate origin/referer, this is vulnerable to CSRF attacks where a malicious site could subscribe arbitrary emails. |
| 2 | 🟡 Medium | Security | **No client-side email validation** beyond HTML5 `type="email"`. The email is sent directly to the API without sanitization. While the API should validate, defense-in-depth suggests trimming/sanitizing on the client too. |
| 3 | 🟡 Medium | UX | `newsletterMessage` is displayed directly from the API response (`data.message` or `data.error`). If the API returns user-controlled error messages, this could be a **reflected XSS** vector. Currently the message is rendered as plain text in a `<p>` tag, so React auto-escapes — **safe in current form** but fragile if anyone adds `dangerouslySetInnerHTML`. |
| 4 | 🔵 Low | Code Quality | `posts` array is defined inside the module scope with 16 posts. For a growing blog, this should be moved to a separate data file or CMS. |
| 5 | 🔵 Low | Performance | `filteredPosts.filter((p: typeof posts[0]) => p.featured)` runs on every render of the featured section. Should be memoized or computed once. |
| 6 | 🔵 Low | Accessibility | Search input has no `<label>` element or `aria-label`. The `placeholder` alone is insufficient for screen readers. |
| 7 | 🔵 Low | SEO | No `metadata` export — this is a `'use client'` component so it can't export `metadata` directly. Should use `generateMetadata` in a parent server component or a `layout.tsx`. |

**XSS Risk:** Low. React auto-escapes all interpolated values. The `newsletterMessage` from the API is rendered as text content, not HTML.

---

### 10. `dashboard/src/app/[locale]/blog/[slug]/page.tsx`

**Type:** Server Component — Dynamic blog post renderer

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🔴 **Critical** | **Security / XSS** | **`dangerouslySetInnerHTML` used for syntax highlighting.** The `tokenizeCode` function processes raw code strings and injects HTML via `dangerouslySetInnerHTML={{ __html: highlighted }}`. While the function does HTML-encode `&`, `<`, `>` at the start, the subsequent regex replacements for keywords/strings/comments could potentially be exploited if a code block contains carefully crafted input that survives encoding and gets re-injected by the regex pipeline. **The risk is mitigated** because: (a) all content is from the static `posts` record (not user input), (b) HTML entities are encoded first. But this is a **dangerous pattern** — any future change that allows user-submitted content would create a direct XSS vulnerability. |
| 2 | 🔴 **Critical** | **Security / XSS** | **`dangerouslySetInnerHTML` for CSS styles.** The syntax highlighting CSS is injected via `<style dangerouslySetInnerHTML={{ __html: '...' }} />`. The CSS string is hardcoded, so no injection risk currently, but this pattern is fragile. |
| 3 | 🟠 High | Code Quality | **~600 lines in a single file.** The `posts` record contains all blog post content as template literals. This is unmaintainable — each post should be in its own file (MDX, JSON, or separate TS module). |
| 4 | 🟠 High | Performance | **All 17 blog posts are bundled into the client payload** even though only one is displayed. The `posts` record is imported at module level and all content ships to the client. This is a significant bundle size issue — potentially 50-100KB+ of unused content per page load. |
| 5 | 🟡 Medium | Logic | `tokenizeCode` regex for strings (`/"(?:[^"\\]|\\.)*"/g`) will incorrectly match escaped quotes inside template literals and may miss edge cases with multi-line strings. The syntax highlighter is fragile and will produce incorrect highlighting for complex code. |
| 6 | 🟡 Medium | Logic | The markdown-to-JSX parser is extremely simplistic. It splits on `\n\n` and pattern-matches prefixes. This will break on: nested lists, code blocks within lists, paragraphs that start with `**` but aren't bold-only, inline code with backticks, and more. |
| 7 | 🟡 Medium | SEO | `generateMetadata` extracts description by finding the first non-heading, non-code paragraph — this is fragile and may produce poor descriptions for some posts. |
| 8 | 🔵 Low | Accessibility | Floating TOC (`fixed right-4`) may overlap with content on medium-width screens. No `aria-label` on the TOC nav. |
| 9 | 🔵 Low | Code Quality | `orderedSlugs` array must be manually kept in sync with the `posts` record — easy to forget when adding new posts. Should derive ordering from post dates. |
| 10 | 🔵 Low | Security | Share links use `encodeURIComponent` for URLs and titles — good, prevents injection into Twitter/LinkedIn/HN share URLs. |

**XSS Risk:** **HIGH** — The `dangerouslySetInnerHTML` usage is the most critical finding. Currently safe because content is static, but the pattern is inherently dangerous.

---

### 11. `dashboard/src/app/[locale]/blog/hooksniff-vs-svix/page.tsx`

**Type:** Server Component — Redirect

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | ⚪ Info | Code Quality | Simple 3-line redirect. Uses `redirect()` from `next/navigation` — correct approach. |

**XSS Risk:** None.

---

### 12. `dashboard/src/app/[locale]/docs/page.tsx`

**Type:** Server Component — Docs landing page

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Security | **API base URL hardcoded in plain text:** `https://hooksniff-api-1046140057667.europe-west1.run.app/v1`. This exposes the Cloud Run project ID (`1046140057667`) and region (`europe-west1`). Should use an environment variable or a generic domain. |
| 2 | 🟡 Medium | Code Quality | Uses `import Link from 'next/link'` instead of `import { Link } from '@/i18n/navigation'` — inconsistent with all other pages that use the i18n-aware Link. This means docs page links won't respect locale routing. |
| 3 | 🔵 Low | Accessibility | Rate limits table lacks `<caption>` and `scope` attributes. |

**XSS Risk:** None.

---

### 13. `dashboard/src/app/[locale]/docs/api/page.tsx`

**Type:** Server Component — API reference

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Security | **API base URL hardcoded** — same issue as docs landing page. Exposes Cloud Run project ID. |
| 2 | 🟡 Medium | Code Quality | `ApiMethod` component is defined in the same file. Should be extracted to a shared component for reuse across docs pages. |
| 3 | 🔵 Low | Code Quality | `useTranslations` is called inside `ApiMethod` which is rendered in a server component context. This works because `next-intl` supports server components, but it's worth noting. |

**XSS Risk:** None — all content is static.

---

### 14. `dashboard/src/app/[locale]/docs/architecture/page.tsx`

**Type:** Server Component — Architecture documentation

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟡 Medium | Consistency | Uses ASCII art for architecture diagrams. While readable in code, these render poorly on mobile and don't scale. Consider Mermaid diagrams or SVG. |
| 2 | 🔵 Low | Content | Mentions "Fly.io" in the tech stack table but the blog post about architecture mentions "Google Cloud Run". Inconsistent deployment target documentation. |
| 3 | 🔵 Low | Accessibility | ASCII art diagrams are not accessible to screen readers. No `alt` text or `aria-label`. |

**XSS Risk:** None.

---

### 15. `dashboard/src/app/[locale]/docs/concepts/page.tsx`

**Type:** Server Component — Core concepts documentation

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟡 Medium | Consistency | Uses `CodeBlock` component from `@/components/CodeBlock` — good, consistent with other docs pages. |
| 2 | 🔵 Low | Content | Mentions "6 failed attempts" for DLQ but the retries page says "3" as `max_attempts` default. Inconsistent documentation. |

**XSS Risk:** None.

---

### 16. `dashboard/src/app/[locale]/docs/dashboard/page.tsx`

**Type:** Server Component — Dashboard guide

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🔵 Low | Code Quality | Pure documentation page with no interactive elements. Clean and well-structured. |

**XSS Risk:** None.

---

### 17. `dashboard/src/app/[locale]/docs/dlq/page.tsx`

**Type:** Server Component — DLQ documentation

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Security | **API URL hardcoded** with full Cloud Run project ID in curl examples. Same issue as other docs pages. |
| 2 | 🔵 Low | Content | DLQ retention table shows Free: 7 days, Pro: 30 days, Business: 90 days. But `max_attempts` defaults differ between docs pages (3 vs 6). |

**XSS Risk:** None.

---

### 18. `dashboard/src/app/[locale]/docs/event-types/page.tsx`

**Type:** Server Component — Event types documentation

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Security | **API URL hardcoded** with Cloud Run project ID. |
| 2 | 🔵 Low | Content | Mentions schema validation rejecting with 400 — good documentation of expected behavior. |

**XSS Risk:** None.

---

### 19. `dashboard/src/app/[locale]/docs/idempotency/page.tsx`

**Type:** Server Component — Idempotency documentation

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Security | **API URL hardcoded** with Cloud Run project ID. |
| 2 | 🔵 Low | Content | Well-documented idempotency key patterns with clear examples. |

**XSS Risk:** None.

---

### 20. `dashboard/src/app/[locale]/docs/integrations/page.tsx`

**Type:** Server Component — Integration guides

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟡 Medium | Code Quality | Generic receiver example uses `express.raw()` middleware but then calls `JSON.parse(req.body)` — this works but is inconsistent with the pattern shown in the Stripe example where `req.body` is a Buffer. |
| 2 | 🔵 Low | Content | Shows dual-signature verification (HookSniff + Stripe) — good security practice documentation. |

**XSS Risk:** None.

---

### 21. `dashboard/src/app/[locale]/docs/portal/page.tsx`

**Type:** Server Component — Embeddable portal documentation

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Security | **API key shown in iframe `src` URL:** `<iframe src="https://portal.hooksniff.com/embed?key=hr_live_CUSTOMER_KEY"...>`. API keys in URLs are logged in server access logs, browser history, and referrer headers. Should use POST or a token exchange pattern. |
| 2 | 🟡 Medium | Security | The portal script tag example shows `apiKey: 'hr_live_YOUR_CUSTOMER_KEY'` — while this is a placeholder, the pattern of putting API keys in client-side JavaScript is inherently insecure. Portal keys should be short-lived tokens, not API keys. |
| 3 | 🔵 Low | Content | Portal documentation is clear and well-structured with good customization examples. |

**XSS Risk:** None (content is static).

---

### 22. `dashboard/src/app/[locale]/docs/quickstart/page.tsx`

**Type:** Server Component — Quickstart guide

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Security | **API URL hardcoded** in all code examples. |
| 2 | 🟡 Medium | Naming | SDK examples use `HOOKRELAY_KEY` as the environment variable name, but the product is called "HookSniff". This suggests the env var name wasn't updated after a rename. Confusing for users. |
| 3 | 🔵 Low | Code Quality | Uses `SdkTabs` component for multi-language examples — good UX pattern. |

**XSS Risk:** None.

---

### 23. `dashboard/src/app/[locale]/docs/retries/page.tsx`

**Type:** Server Component — Retries documentation

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Security | **API URL hardcoded** with Cloud Run project ID. |
| 2 | 🟡 Medium | Consistency | States "6 times" for retry attempts but the custom retry policy table shows `max_attempts` default as `3`. Contradicts the concepts page which says "6 failed attempts". |
| 3 | 🔵 Low | Content | Good documentation of exponential backoff with jitter. |

**XSS Risk:** None.

---

### 24. `dashboard/src/app/[locale]/docs/sdks/page.tsx`

**Type:** Server Component — SDK documentation

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟡 Medium | Naming | Uses `HOOKRELAY_KEY` environment variable name throughout — inconsistent with the "HookSniff" product name. Should be `HOOKSNIFF_KEY`. |
| 2 | 🟡 Medium | Content | Header says "Official SDKs for Python and Node.js" but the blog post claims 11 official SDKs. The community SDKs section lists Go, Ruby, PHP, Rust as "community-maintained" — contradicts the marketing claims. |
| 3 | 🔵 Low | Code Quality | Node.js signature verification example imports `useTranslations` from `next-intl` inside a code block that's supposed to be an Express handler example. This is a copy-paste error — `useTranslations` is a React hook, not something you'd use in Express middleware. |

**XSS Risk:** None.

---

### 25. `dashboard/src/app/[locale]/docs/security/page.tsx`

**Type:** Server Component — Security documentation

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Security | **API URL hardcoded** with Cloud Run project ID in the IP whitelisting example. |
| 2 | 🔵 Low | Content | Good documentation of HMAC verification, timestamp validation, IP whitelisting, and SSRF protection. The SSRF protection list is comprehensive. |
| 3 | 🔵 Low | Consistency | Uses `webhook-signature` header name in docs but the blog post uses `X-HookSniff-Signature`. Inconsistent header naming. |

**XSS Risk:** None.

---

### 26. `dashboard/src/app/[locale]/docs/self-hosting/page.tsx`

**Type:** Server Component — Self-hosting guide

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟡 Medium | Security | **`.env.example` contains placeholder secrets** like `rastgele-64-karakter-hex-string` (Turkish for "random 64-character hex string"). While these are placeholders, the Turkish text suggests the developer's locale — minor information disclosure. |
| 2 | 🔵 Low | Content | Docker Compose setup is well-documented with clear management commands. |
| 3 | 🔵 Low | Consistency | References `make self-host` and `make generate-secret` — good developer experience. |

**XSS Risk:** None.

---

### 📋 Docs Pages — Cross-Cutting Issues

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Security | **API base URL `https://hooksniff-api-1046140057667.europe-west1.run.app/v1` is hardcoded in 10+ files.** This exposes: (a) Google Cloud project ID (`1046140057667`), (b) deployment region (`europe-west1`), (c) the raw Cloud Run service URL. Should use a custom domain like `api.hooksniff.com` and reference it from an environment variable. |
| 2 | 🟡 Medium | Naming | Environment variable `HOOKRELAY_KEY` is used in quickstart and SDK docs. Product is "HookSniff" — should be `HOOKSNIFF_API_KEY`. |
| 3 | 🟡 Medium | Consistency | Retry attempt defaults are inconsistent: concepts page says 6, retries page says 3, DLQ page says 6. Needs a single source of truth. |
| 4 | 🟡 Medium | i18n | Docs pages use `useTranslations('docs')` for some headings but all code examples, descriptions, and body text are hardcoded in English. Partial i18n is worse than none — it creates a jarring mix of translated headers with English content. |

---

### 27. `dashboard/src/app/[locale]/admin/page.tsx`

**Type:** `'use client'` — Admin overview dashboard

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Security | **No server-side admin authorization check.** The page uses `useAuth()` to get a token and passes it to `adminApi.getStats(token)`, but there's no guard preventing non-admin users from rendering this page. If a regular user navigates to `/admin`, they'll see the loading state and then either an error or (if the API returns data) actual admin data. Should have a server-side middleware or layout guard. |
| 2 | 🟡 Medium | Error Handling | `catch (err)` block is empty — errors are silently swallowed. Should at minimum log to console or show a toast notification. |
| 3 | 🔵 Low | Code Quality | `pieData` computation runs on every render. Should be memoized with `useMemo`. |
| 4 | 🔵 Low | Accessibility | Pie chart has no accessible alternative (no `aria-label`, no data table fallback). |

**XSS Risk:** None — all data is rendered as text via React.

---

### 28. `dashboard/src/app/[locale]/admin/revenue/page.tsx`

**Type:** `'use client'` — Admin revenue dashboard

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Security | **No server-side admin authorization check** — same issue as admin overview page. |
| 2 | 🟡 Medium | Error Handling | Silent error catching — same pattern as admin overview. |
| 3 | 🔵 Low | Code Quality | `planData` and `monthlyData` computed on every render — should use `useMemo`. |
| 4 | 🔵 Low | Data | `churn_rate` displayed with `.toFixed(1)` — if `churn_rate` is `null` or `undefined`, this will throw. The `|| '0'` fallback handles it but `toFixed` is called before the fallback. Should be `(revenue?.churn_rate ?? 0).toFixed(1)`. |

**XSS Risk:** None.

---

### 29. `dashboard/src/app/[locale]/admin/settings/page.tsx`

**Type:** `'use client'` — Admin platform settings

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Security | **No server-side admin authorization check.** |
| 2 | 🟠 High | Security | **Direct `fetch` to API with token in header** — the `handleSave` function makes a PUT request to `${API}/admin/settings` with the token. If `NEXT_PUBLIC_API_URL` is not set, it defaults to `http://localhost:3000/v1` — this would fail in production but is a development-only concern. |
| 3 | 🟡 Medium | Security | **No confirmation dialog for dangerous actions.** Toggling `maintenance_mode` or `signup_enabled` takes effect immediately on click — no "are you sure?" prompt. These are destructive platform-wide changes. |
| 4 | 🟡 Medium | UX | **No input validation** on numeric fields. Setting `max_endpoints_free` to a negative number or `rate_limit_free` to 0 would be accepted by the UI. |
| 5 | 🟡 Medium | State | Settings are initialized with `defaultSettings` (hardcoded defaults) rather than fetching current settings from the API. On page load, the admin sees default values, not actual platform settings. If they save without changes, they'd overwrite real settings with defaults. |
| 6 | 🔵 Low | Code Quality | `update` function uses `unknown` type for value parameter — should be more specific. |

**XSS Risk:** None.

---

### 30. `dashboard/src/app/[locale]/admin/system/page.tsx`

**Type:** `'use client'` — System health monitoring

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Security | **No server-side admin authorization check.** |
| 2 | 🟡 Medium | Security | **Health endpoint exposed.** The page fetches `${API}/health` — if this endpoint returns infrastructure details (database type, Redis info, queue depths) without proper auth, it's an information disclosure risk. |
| 3 | 🟡 Medium | Performance | **15-second polling interval** (`setInterval(fetchHealth, 15000)`) — this creates continuous API load even when the tab is backgrounded. Should use `visibilitychange` event to pause polling when tab is not visible. |
| 4 | 🔵 Low | Code Quality | `statusColor` function returns object literals on every call — could be memoized or defined as a constant map. |
| 5 | 🔵 Low | UX | Infrastructure info section shows "Oracle Cloud ARM" but the blog post says "Google Cloud Run". Inconsistent infrastructure documentation. |

**XSS Risk:** None.

---

### 31. `dashboard/src/app/[locale]/admin/users/page.tsx`

**Type:** `'use client'` — User management

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Security | **No server-side admin authorization check.** |
| 2 | 🟡 Medium | Security | **No confirmation for ban action.** Clicking "Ban" immediately bans the user without confirmation. This is a destructive action that should require confirmation. |
| 3 | 🟡 Medium | Security | **Plan change modal has no confirmation for downgrading.** Changing a user from "business" to "free" could break their integrations — should warn about consequences. |
| 4 | 🟡 Medium | UX | Search is triggered on form submit but the `search` state updates on every keystroke. The `fetchUsers` callback depends on `search`, so it will re-fetch on every keystroke change (due to the `useEffect` dependency). This creates excessive API calls. Should debounce search or only fetch on submit. |
| 5 | 🔵 Low | Code Quality | `planChangeTarget` state stores the full user object — could just store the user ID to avoid stale data. |

**XSS Risk:** None — user data (email, name) is rendered via React which auto-escapes.

---

### 32. `dashboard/src/app/[locale]/admin/users/[id]/page.tsx`

**Type:** `'use client'` — User detail page

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Security | **No server-side admin authorization check.** |
| 2 | 🟡 Medium | Security | **No confirmation for ban/activate toggle.** Same issue as the users list page. |
| 3 | 🟡 Medium | Security | **User ID from URL params used directly in API calls.** `const { id } = useParams()` is used directly in `adminApi.getUserDetail(token, id)`. While the API should validate the ID, the client doesn't sanitize it. If the ID contains special characters, it could cause issues. Low risk since UUIDs are expected. |
| 4 | 🔵 Low | Code Quality | Page renders a full user detail view with endpoints and recent deliveries — good admin UX. |
| 5 | 🔵 Low | UX | The "Update" button for plan changes is disabled when `newPlan === detail.user.plan` — good UX guard. |

**XSS Risk:** None.

---

### 📋 Admin Pages — Cross-Cutting Issues

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 1 | 🟠 High | Security | **No server-side admin authorization on any admin page.** All 6 admin pages are `'use client'` components that rely solely on the presence of a token in `useAuth()`. A non-admin user with a valid token can attempt to access admin pages. The API presumably rejects unauthorized requests, but the pages themselves should have server-side guards (middleware or layout-level auth checks) to prevent rendering any admin UI for non-admin users. |
| 2 | 🟡 Medium | Error Handling | All admin pages silently swallow errors (`catch { }` or `catch (err) { }` with no action). Admin actions should always show error feedback. |
| 3 | 🟡 Medium | DRY | All admin pages duplicate the same loading skeleton pattern, error handling pattern, and data fetching pattern. Should extract to shared hooks or HOCs. |

---

## Summary of Critical & High Severity Findings

### 🔴 Critical (1)

| # | File | Finding |
|---|------|---------|
| 1 | `blog/[slug]/page.tsx` | `dangerouslySetInnerHTML` for syntax highlighting — currently safe (static content) but inherently dangerous pattern. Any future change allowing user content = direct XSS. |

### 🟠 High (12)

| # | File(s) | Finding |
|---|---------|---------|
| 1 | `blog/page.tsx` | Newsletter form lacks CSRF protection |
| 2 | `blog/[slug]/page.tsx` | ~600-line file with all blog content bundled; `dangerouslySetInnerHTML` for CSS |
| 3 | All docs pages (10+) | API base URL with Cloud Run project ID hardcoded |
| 4 | `docs/portal/page.tsx` | API key in iframe URL (logged in access logs, browser history) |
| 5 | All admin pages (6) | No server-side admin authorization guards |
| 6 | All alternatives pages (8) | Massive code duplication — shared layout needed |
| 7 | `admin/settings/page.tsx` | No confirmation for destructive platform-wide changes; settings initialized with defaults instead of fetched values |

---

## Recommendations (Priority Order)

1. **Extract blog content to separate files** (MDX or data files) and remove `dangerouslySetInnerHTML` in favor of a proper syntax highlighting library (Prism.js, Shiki, or highlight.js).

2. **Add server-side admin middleware** — Create a `middleware.ts` that checks admin role before allowing access to `/admin/*` routes.

3. **Replace hardcoded API URLs** with a centralized config: `const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.hooksniff.com/v1'` and use a custom domain instead of the raw Cloud Run URL.

4. **Add CSRF protection** to the newsletter API endpoint (SameSite cookies, CSRF token, or origin checking).

5. **Extract shared alternatives layout** component to eliminate 30-40 lines of duplicated boilerplate per file.

6. **Fix `HOOKRELAY_KEY` naming** — rename to `HOOKSNIFF_API_KEY` across all docs and SDK examples.

7. **Add meta descriptions** to all alternatives pages for better SEO.

8. **Standardize retry attempt documentation** — single source of truth for `max_attempts` default.

9. **Add confirmation dialogs** for destructive admin actions (ban user, toggle maintenance mode, change plans).

10. **Add error handling** to all admin page catch blocks — show toast notifications instead of silently swallowing errors.
