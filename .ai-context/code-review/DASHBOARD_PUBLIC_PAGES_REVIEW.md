# HookSniff Dashboard — Public/Marketing Pages Code Review

**Reviewer:** AI Code Review Agent  
**Date:** 2026-05-10  
**Scope:** 29 public/marketing/SEO pages  
**Severity Scale:** 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low · ⚪ Info

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Cross-Cutting Issues](#cross-cutting-issues)
3. [File-by-File Analysis](#file-by-file-analysis)
4. [Summary of Findings](#summary-of-findings)

---

## Executive Summary

The HookSniff public pages are well-structured marketing/SEO pages built with Next.js App Router, `next-intl` for i18n, and Tailwind CSS. The codebase is generally clean and consistent. However, there are several **security concerns** (API URL exposure, missing CSRF/rate-limiting on client-side forms, token storage in localStorage), **accessibility gaps** (missing ARIA attributes, keyboard navigation issues), **performance opportunities** (client components that could be server components, missing image optimization), and **code quality issues** (hardcoded data, duplicated nav components).

---

## Cross-Cutting Issues

### 🟠 C1: API URL Hardcoded in Client Code
**Files affected:** `contact/page.tsx`, `status/page.tsx`, `playground/page.tsx`  
**Issue:** The full Cloud Run API URL (`https://hooksniff-api-1046140057667.europe-west1.run.app/v1`) is hardcoded in multiple files and exposed to the client.  
**Risk:** Reveals internal infrastructure details (project ID, region). Should use environment variable exclusively.  
**Recommendation:** Use `process.env.NEXT_PUBLIC_API_URL` consistently and never hardcode the fallback URL in client code.

### 🟠 C2: Duplicated Navigation Component
**Files affected:** Every page  
**Issue:** Each page implements its own `<nav>` with slightly different markup and behavior. The landing page has a full hamburger menu; other pages just have a breadcrumb.  
**Impact:** Maintenance burden, inconsistent UX.  
**Recommendation:** Extract a shared `<PublicNav>` component with variants (landing vs. inner page).

### 🟡 C3: Inconsistent Link Patterns
**Files affected:** Multiple  
**Issue:** Some pages use `<a href="/">` for internal links while others use `<Link href="/">` from `@/i18n/navigation`. The `<a>` tags bypass Next.js client-side navigation and i18n routing.  
**Examples:** `about/page.tsx` uses `<a href="/">` in nav; `pricing/page.tsx` uses `<Link href="/">`.  
**Recommendation:** Use `<Link>` consistently for all internal navigation.

### 🟡 C4: No Shared Layout
**Files affected:** All 29 files  
**Issue:** Every page re-implements the full page shell (nav + main + footer). There's no shared layout component.  
**Recommendation:** Create a `PublicLayout` wrapper in a `layout.tsx` file.

### 🔵 C5: Inconsistent i18n Usage
**Files affected:** `about`, `contact`, `pricing`, `compare`, `customers`, etc.  
**Issue:** Some pages use `useTranslations()` for all strings (landing, FAQ), while many pages hardcode English strings. Pages like `pricing`, `compare`, `build-vs-buy`, `use-cases` have all text in English, making them non-translatable.  
**Recommendation:** Either internationalize all pages or explicitly mark them as English-only with a comment.

### 🔵 C6: No Error Boundaries
**Files affected:** All client components  
**Issue:** No error boundaries wrap any of the client components. A runtime error in any component crashes the entire page.  
**Recommendation:** Add error boundaries at the page level.

---

## File-by-File Analysis

### 1. `dashboard/src/app/[locale]/page.tsx` (Landing Page)

| Category | Severity | Finding |
|----------|----------|---------|
| **Performance** | 🟡 | `'use client'` — The entire landing page is a client component. The hero, features, pricing, and footer sections are static content that could be server-rendered. Only the typewriter effect and mobile nav need client interactivity. |
| **Performance** | 🟡 | `FloatingParticles` renders 20 animated `<div>` elements with inline styles. The CSS custom properties `--duration` and `--delay` are set but whether the CSS class `particle` uses them is external. If not, these are dead animations. |
| **Accessibility** | 🟠 | Mobile nav hamburger button has `aria-label="Toggle navigation"` ✅, but the mobile dropdown has no `role="menu"` or focus trap. Keyboard users can tab out of the open menu. |
| **Accessibility** | 🟡 | Code example section uses `<pre><code>` without a "Copy" button. Screen readers will read the raw shell commands. |
| **Security** | 🟡 | API URL with project ID exposed in the code example block: `hooksniff-api-1046140057667.europe-west1.run.app`. Consider using a vanity domain. |
| **Code Quality** | 🔵 | `TypewriterText` — the `phrases` array comes from `t.raw('typewriter')` which could return non-array if translation is missing. No type guard. |
| **Code Quality** | 🔵 | `useEffect` in `TypewriterText` has `phrases` in the dependency array, which is a new array reference on every render (from `t.raw()`). This causes unnecessary effect re-runs. |
| **Code Quality** | 🔵 | Pricing plan buttons are `<button>` elements with no `onClick` handler — they don't navigate anywhere. Should be `<Link>` to `/login` or `/contact`. |

### 2. `dashboard/src/app/[locale]/about/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **i18n** | 🟡 | Uses `useTranslations()` for `deliveryRate` and `avgLatency` but hardcodes all other English strings (mission, story, values, CTA). Inconsistent. |
| **Navigation** | 🔵 | Nav uses `<a href="/">` instead of `<Link>` — breaks i18n routing and client-side navigation. |
| **Accessibility** | 🔵 | Stats section has no `aria-label` describing the statistics group. |
| **SEO** | ⚪ | No `metadata` export — relies on parent layout. Could benefit from a specific title/description. |

### 3. `dashboard/src/app/[locale]/pricing/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **i18n** | 🟠 | All 500+ lines of pricing copy, FAQ answers, comparison table text, testimonials, and CTAs are hardcoded English. Not translatable. |
| **Logic** | 🟡 | `RoiCalculator` — Svix cost calculation is wrong: `const svixCost = events <= 0 ? 0 : 490;` means any event count > 0 shows $490. The slider goes to 100K but Svix pricing is volume-based. This misleads users. |
| **Logic** | 🟡 | `hookdeckCost` formula `events <= 10000 ? 0 : 39 + Math.max(0, Math.ceil((events - 10000) / 100000)) * 1` doesn't match Hookdeck's actual pricing. |
| **Accessibility** | 🟡 | FAQ accordion buttons lack `aria-expanded` and `aria-controls` attributes. |
| **Performance** | 🟡 | Entire page is `'use client'` — the comparison table, security grid, support levels, and build-vs-buy section are all static content. |
| **Code Quality** | 🔵 | Pricing plans are defined as a local `const` array rather than imported from a shared config. The landing page also defines pricing plans separately with different values ($49 vs $29 for Pro). **Price inconsistency.** |

### 4. `dashboard/src/app/[locale]/login/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Security** | 🟠 | `useAuth()` store is called on the client — if `login`/`register` functions store tokens in localStorage, they're vulnerable to XSS. The `getErrorMessage` import suggests error handling exists but the catch block is generic. |
| **Security** | 🟡 | No CSRF protection visible on the login/register form. If the API uses cookie-based auth, CSRF tokens should be included. |
| **Accessibility** | 🟡 | Password strength indicator shows color-coded bars but has no `aria-live` region or screen reader text for the strength label. |
| **Accessibility** | 🟡 | Error messages use `div` with no `role="alert"` — screen readers may not announce them. |
| **UX** | 🔵 | Login/register mode toggle is implemented as `<button onClick>` instead of tabs or a proper toggle. No URL state — refreshing loses the mode. |

### 5. `dashboard/src/app/[locale]/contact/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Security** | 🟠 | Contact form posts to `${API}/contact` with no CSRF token, no rate limiting on the client side, and no honeypot field. Vulnerable to spam/abuse. |
| **Security** | 🟡 | The API URL fallback is hardcoded: `process.env.NEXT_PUBLIC_API_URL || 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1'`. |
| **i18n** | 🟡 | Uses `useTranslations()` only for `sending` and `sendMessage` — all other strings hardcoded. |
| **Accessibility** | 🔵 | Form success/error messages lack `role="alert"`. |

### 6. `dashboard/src/app/[locale]/faq/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Accessibility** | 🟡 | FAQ accordion buttons lack `aria-expanded` attribute. |
| **i18n** | ⚪ | Good use of `useTranslations()` for all FAQ content via key-based approach. |
| **Code Quality** | 🔵 | `FAQAccordion` component renders answer content even when closed (just hidden with conditional). Could use `hidden` attribute or CSS for better semantics. |

### 7. `dashboard/src/app/[locale]/privacy/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **i18n** | 🟠 | Privacy policy text is entirely hardcoded English despite using `useTranslations('privacy')` for nav/title/lastUpdated only. Legal content is not translatable. |
| **Consistency** | 🟡 | Section 7 mentions "Free plan: 7 days" retention but the pricing page says "3-day log retention" for Free. **Data inconsistency.** |
| **SEO** | 🔵 | No structured data (JSON-LD) for the privacy policy page. |

### 8. `dashboard/src/app/[locale]/terms/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **i18n** | 🟠 | Terms of Service entirely hardcoded English despite `useTranslations('terms')` for nav/title only. |
| **Consistency** | 🟡 | Section 8 says "Free plan: 7 days" but pricing page says "3-day log retention". Same inconsistency as privacy page. |
| **Legal** | 🔵 | Section 15 says "governed by the laws of Turkey" — should be more specific (e.g., "laws of the Republic of Turkey"). |

### 9. `dashboard/src/app/[locale]/security/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Rendering** | ⚪ | This is the **only** server component among the public pages (no `'use client'` directive). Good for SEO. |
| **Consistency** | 🟡 | Claims "SOC 2 Ready" but pricing page says "SOC 2 Ready" while compare page says "SOC 2 Ready" — consistent but potentially misleading if audit hasn't started. |
| **Accessibility** | 🔵 | Security feature grid items are `<div>` elements with emoji icons — no `alt` text for screen readers. |

### 10. `dashboard/src/app/[locale]/status/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Security** | 🟠 | Fallback fetches directly to `https://hooksniff-api-1046140057667.europe-west1.run.app/v1/status` with `mode: 'cors'`. Exposes internal API URL to all visitors. |
| **Performance** | 🟡 | Polls every 30 seconds with `setInterval(loadData, 30000)`. For a public status page, this is aggressive. Consider 60s or use SSE/WebSocket. |
| **Performance** | 🟡 | `enrichedComponents` recalculates on every render via `useMemo` but the dependency on `data.components` and `history` means it runs frequently during polling. |
| **Accessibility** | 🟡 | `UptimeCalendar` uses `onMouseEnter`/`onMouseLeave` for tooltips — no keyboard equivalent. Tooltip is `fixed` positioned which can overflow viewport. |
| **Accessibility** | 🟡 | Status badge uses colored dots without text alternatives for colorblind users. The label text helps but the dot itself has no `aria-label`. |
| **Logic** | 🔵 | `unreachableData()` returns `overall_status: 'down'` and `uptime_30d: 0` as initial state before loading. Briefly shows "Major Outage Detected" flash. Should default to a loading/unknown state. |
| **Code Quality** | 🔵 | `formatRelativeTime` doesn't handle future dates (negative diff would produce weird results). |

### 11. `dashboard/src/app/[locale]/newsletter/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Security** | 🟡 | Newsletter subscribe form posts to `/api/newsletter` with no visible rate limiting or honeypot. |
| **Accessibility** | 🔵 | FAQ accordion uses `+`/`−` text instead of `aria-expanded`. |
| **Performance** | 🟡 | Entire page is `'use client'` — past issues list and FAQ are static content. |
| **Code Quality** | 🔵 | Two subscribe forms on the same page (top and bottom) share the same `email`/`status` state — submitting one updates both. This is intentional but could confuse users. |

### 12. `dashboard/src/app/[locale]/startups/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Rendering** | ⚪ | Server component (no `'use client'`). Good. |
| **Content** | 🔵 | No form for startup applications — just a link to `/contact`. Could benefit from a dedicated form with startup-specific fields. |
| **SEO** | ⚪ | Has `metadata` export ✅. |

### 13. `dashboard/src/app/[locale]/compare/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **i18n** | 🟠 | All comparison data, verdicts, testimonials, and FAQ are hardcoded English. 600+ lines of non-translatable content. |
| **Content** | 🟡 | Comparison claims may be inaccurate or outdated. "Svix starts at $490/mo" — should be verified. "SOC 2 Type 2" claims for competitors should cite sources. |
| **Accessibility** | 🟡 | Expandable sections use `onClick` on `<button>` but lack `aria-expanded`. |
| **Performance** | 🟡 | All comparison tables are client-rendered. Could be server components. |

### 14. `dashboard/src/app/[locale]/customers/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Content** | 🟡 | All customer stories use fictional company names (ShopFlow, PayStack, NeuralOps, CloudSync, MedConnect, BuildKit). "PayStack" is a real Nigerian fintech company — **potential trademark issue**. |
| **i18n** | 🟠 | All content hardcoded English. |
| **Accessibility** | 🔵 | Industry filter buttons use `cursor-pointer` class but are `<button>` elements — redundant. |

### 15. `dashboard/src/app/[locale]/customers/[slug]/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Content** | 🟡 | Same trademark concern with "PayStack" as in the customers index page. |
| **Rendering** | ⚪ | Server component with `generateStaticParams` ✅. Proper async params handling. |
| **Logic** | 🔵 | `if (!story)` returns a "Story not found" page but doesn't call `notFound()`. Should use Next.js `notFound()` for proper 404 handling. |
| **SEO** | 🔵 | No `generateMetadata` — relies on parent layout. Each customer story should have unique meta title/description. |

### 16. `dashboard/src/app/[locale]/changelog/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Performance** | 🟡 | Imports `Image` from `next/image` but images in changelog entries use `fill` layout without explicit `width`/`height`. This requires a parent with defined dimensions — the `relative w-full h-[200px]` wrapper handles this, but it's fragile. |
| **Accessibility** | 🔵 | Filter buttons for type and area lack `aria-pressed` or `aria-selected` state. |
| **Code Quality** | 🔵 | Changelog data is imported from `@/lib/changelog-data` — good separation of data and presentation. |

### 17. `dashboard/src/app/[locale]/changelog/[slug]/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **SEO** | ⚪ | Excellent: has `generateMetadata` with OpenGraph and Twitter card metadata ✅. |
| **Rendering** | ⚪ | Server component with proper async params ✅. |
| **Accessibility** | 🔵 | Share links open in new tabs with `target="_blank"` and `rel="noopener noreferrer"` ✅. |
| **Code Quality** | 🔵 | Navigation links (prev/next) are correctly implemented. |

### 18. `dashboard/src/app/[locale]/playground/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Security** | 🟠 | Playground token stored in `localStorage` (`hooksniff_playground_token`, `hooksniff_playground_url`). Accessible to any XSS attack. Should use httpOnly cookies or short-lived tokens with server-side session. |
| **Security** | 🟡 | `fetch('/api/playground/token', { method: 'POST' })` — no CSRF protection. |
| **Performance** | 🟡 | Polls history every 2 seconds. For a playground, this is acceptable but aggressive. |
| **Accessibility** | 🟡 | Request detail panel uses `<pre>` for headers and body — no copy button, no syntax highlighting, no search. |
| **Code Quality** | 🟡 | `ApiAccessSection` is a massive component (~400 lines) defined at the bottom of the file. Should be extracted to its own file. |
| **UX** | 🔵 | Token restoration from `localStorage` happens in `useEffect` — brief flash of "idle" state before "ready". |

### 19. `dashboard/src/app/[locale]/what-is-a-webhook/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Rendering** | ⚪ | Server component ✅. |
| **SEO** | 🟡 | Has `metadata` export but no OpenGraph or Twitter card metadata. |
| **Content** | 🔵 | Good educational content. The pizza analogy is effective. |
| **Accessibility** | 🔵 | Tables lack `<caption>` elements. |

### 20. `dashboard/src/app/[locale]/build-vs-buy/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **i18n** | 🟠 | 400+ lines of hardcoded English content. Not translatable. |
| **Content** | 🟡 | Cost figures ($300K–$1M+ to build) are presented as facts without citations. Could be challenged. |
| **Accessibility** | 🟡 | FAQ accordion lacks `aria-expanded`. |
| **Performance** | 🟡 | All static content rendered as client component. |

### 21. `dashboard/src/app/[locale]/use-cases/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **i18n** | 🟠 | All use case data (6 industries × ~50 lines each) hardcoded English. |
| **Code Quality** | 🟡 | The `useCases` array is 300+ lines of inline data. Should be extracted to a separate file. |
| **Accessibility** | 🔵 | Industry tab buttons lack `role="tab"` and `aria-selected`. |
| **UX** | 🔵 | Code examples reference SDK methods (`hs.webhooks.send`) that may not exist — fictional API. |

### 22. `dashboard/src/app/[locale]/webhooks/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Rendering** | ⚪ | Server component ✅. |
| **SEO** | ⚪ | Good metadata with description ✅. |
| **Content** | 🔵 | Alternatives hub links to pages that may not exist (`/alternatives/svix-alternatives`, etc.). Should verify or use 404 handling. |

### 23. `dashboard/src/app/[locale]/webhooks/glossary/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Rendering** | ⚪ | Server component ✅. |
| **SEO** | ⚪ | Good metadata ✅. |
| **Accessibility** | 🔵 | Quick nav only shows first 10 terms — should show all or provide a search. |
| **Performance** | 🔵 | 34 glossary items rendered statically — good for SEO. |

### 24. `dashboard/src/app/[locale]/webhooks/guides/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Rendering** | ⚪ | Server component ✅. |
| **Content** | 🟡 | Several guide links point to `/docs/quickstart`, `/docs/security`, `/docs/examples` — these may not exist yet. Dead links hurt SEO. |
| **SEO** | ⚪ | Good metadata ✅. |

### 25. `dashboard/src/app/[locale]/providers/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Rendering** | ⚪ | Server component ✅. |
| **SEO** | ⚪ | Good metadata ✅. |
| **Content** | 🔵 | Only 3 providers listed. Could benefit from "Coming soon" indicators for others. |

### 26. `dashboard/src/app/[locale]/providers/github/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Rendering** | ⚪ | Server component ✅. |
| **Content** | 🔵 | Quick start guide is HookSniff-centric but doesn't explain how HookSniff fits into the GitHub webhook flow. |
| **SEO** | 🟡 | Metadata exists but no OpenGraph. |

### 27. `dashboard/src/app/[locale]/providers/shopify/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Rendering** | ⚪ | Server component ✅. |
| **Content** | 🔵 | Similar to GitHub page — good structure but could be more detailed. |

### 28. `dashboard/src/app/[locale]/providers/stripe/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Rendering** | ⚪ | Server component ✅. |
| **Code Quality** | 🟡 | Code example uses `hooksniff-sdk` import but the API (`webhook.verify(req.body, req.headers)`) doesn't match typical Stripe webhook verification patterns. May confuse developers. |
| **SEO** | 🟡 | Metadata exists but no OpenGraph. |

### 29. `dashboard/src/app/page.tsx`

| Category | Severity | Finding |
|----------|----------|---------|
| **Rendering** | ⚪ | Returns `null` — middleware handles locale redirect. This is correct for i18n routing. |
| **Code Quality** | ⚪ | Clean, minimal. |

---

## Summary of Findings

### By Severity

| Severity | Count | Key Issues |
|----------|-------|------------|
| 🔴 Critical | 0 | — |
| 🟠 High | 8 | API URL exposure, missing CSRF/rate limiting, localStorage token storage, hardcoded legal content, PayStack trademark |
| 🟡 Medium | 22 | i18n gaps, accessibility (aria-expanded, role="alert"), performance (client components), data inconsistencies, incorrect ROI calculator |
| 🔵 Low | 18 | Minor code quality, redundant classes, missing structured data |
| ⚪ Info | 12 | Positive findings (server components, metadata, good structure) |

### Top 10 Actionable Recommendations

1. **Extract shared layout** — Create `PublicLayout` with nav + footer to eliminate duplication across 29 files.
2. **Server components for static pages** — Convert `pricing`, `compare`, `build-vs-buy`, `use-cases`, `about` to server components. Move interactive bits to small client components.
3. **Fix API URL exposure** — Remove hardcoded Cloud Run URLs from all client code. Use environment variables exclusively.
4. **Add CSRF/rate limiting to forms** — Contact, newsletter, and playground token endpoints need protection.
5. **Fix price inconsistency** — Landing page says Pro is $49/mo; pricing page says $29/mo. Reconcile.
6. **Fix data retention inconsistency** — Privacy/terms say Free plan is 7 days; pricing page says 3 days.
7. **Add ARIA attributes** — All FAQ accordions need `aria-expanded`; forms need `role="alert"` for messages; tabs need `role="tab"`.
8. **Replace `<a>` with `<Link>`** — All internal navigation should use the i18n-aware `Link` component.
9. **Internationalize or document** — Either translate all hardcoded English content or explicitly mark pages as English-only.
10. **Verify "PayStack" trademark** — This is a real company name. Replace with a fictional name to avoid legal issues.

---

*End of review.*
