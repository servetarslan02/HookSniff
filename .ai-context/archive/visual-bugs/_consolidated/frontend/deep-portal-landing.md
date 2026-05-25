# Deep Review: HookSniff Public-Facing Pages

**Reviewed:** 2026-05-10  
**Scope:** Portal, Landing, Pricing, About, Contact, Security, Startups, Status, Use Cases, What-is-a-Webhook, Get-Started, Compare, Alternatives, Blog, Docs, Footer, Navigation

---

## 1. Content Quality

### Strengths
- **Clear, developer-friendly messaging** throughout. The landing page hero ("Reliable webhook delivery...") is direct and compelling.
- **Pricing is transparent** with a detailed comparison table, ROI calculator, and build-vs-buy section.
- **CTAs are consistent** — "Start Free", "Get Started →", "Contact Us" appear repeatedly with clear actions.
- **Blog content is substantial** — 17 posts covering tutorials, changelogs, comparisons, and engineering deep-dives.
- **Use cases page** is excellent — 6 industries with pain points, solutions, code examples, and metrics.
- **Compare page** is honest — acknowledges Svix/Hookdeck strengths rather than being purely promotional.

### Issues Found

#### Typos & Grammar
1. **`portal/README.md`** — Written entirely in **Turkish**. While i18n is fine, the README should also have an English version for the global developer audience. Mixed Turkish/English is confusing.
2. **`portal/example.html`** — Same issue: Turkish text (`"Bu sayfa, HookSniff portal widget'ının nasıl embed edileceğini gösterir."`).
3. **`api/src/routes/customer_portal.rs`** — Code comments are in Turkish (`"Müşterilerin kendi webhook'larını..."`). Should be English for open-source contributors.
4. **`api/src/routes/portal_config.rs`** — Comments are in English ✅ (inconsistent with customer_portal.rs).

#### Messaging Gaps
5. **Landing page pricing section** — The CTA buttons (`plan.cta`) use translated keys but the buttons are `<button>` elements, not `<Link>` — they don't navigate anywhere. **Broken CTAs on the landing page pricing cards.**
6. **About page** — "HookSniff started as a side project in 2026" is vague. Consider adding a founder name or more specific origin story for credibility.
7. **Testimonials** — All testimonials use generic roles ("CTO", "Lead Developer", "Solo Founder") with no real names, companies, or links. This reduces credibility. Consider adding at least verifiable testimonials or case studies.

#### Inconsistencies
8. **API URL inconsistency** — The landing page code example uses `hooksniff-api-1046140057667.europe-west1.run.app` while the get-started page uses `api.hooksniff.dev`. These should be unified.
9. **Svix SDK count** — The alternatives/svix page claims Svix has "6 SDKs" but the compare page says "11 SDKs". **Contradictory data.**
10. **Free tier events** — Alternatives/svix page says HookSniff has "10,000 events" free, but pricing page says "1,000/month" for free tier. **Contradictory.**

---

## 2. SEO

### Strengths
- **Meta tags present** in `layout.tsx` — title template, description, Open Graph, Twitter cards, robots, alternates (hreflang).
- **Sitemap** exists at `dashboard/src/app/sitemap.ts` with all locales and alternates.
- **robots.txt** properly disallows `/dashboard/`, `/admin/`, `/api/`.
- **Blog has JSON-LD** structured data (`BlogPosting` schema).
- **Clean URLs** — all routes use semantic slugs (`/pricing`, `/about`, `/compare`, etc.).
- **RSS feed** exists at `/blog/rss`.

### Issues Found

11. **Sitemap is incomplete** — Only lists 10 pages (`publicPages` array). Missing: `/pricing`, `/security`, `/startups`, `/use-cases`, `/what-is-a-webhook`, `/get-started`, `/compare`, `/alternatives/*`, `/blog`, `/blog/*`. This is a **major SEO gap** — most marketing pages aren't in the sitemap.
12. **Blog sitemap** exists separately (`dashboard/src/app/blog/sitemap/route.ts`) but isn't referenced in the main sitemap.
13. **No `description` meta tag on individual pages** — Most pages (pricing, about, security, etc.) don't set their own `metadata` export. They inherit the default from layout, which is the landing page description. **Each page should have unique meta descriptions.**
14. **Missing Open Graph images** — Only the layout sets `/og-image.png`. Individual pages (blog posts, pricing, compare) should have unique OG images for social sharing.
15. **Blog posts lack individual meta tags** — The `[slug]/page.tsx` for blog should generate per-post metadata (title, description, OG image, published date).
16. **No canonical tags on non-layout pages** — Only the layout sets `alternates.canonical`. Individual pages should override when their canonical URL differs.
17. **Missing `sitemap.xml` for alternatives pages** — 8 alternative pages exist but none are in the sitemap.

---

## 3. Accessibility

### Strengths
- **Theme toggle** present on landing page with proper `aria-label` on mobile hamburger button.
- **Color contrast** — dark mode uses `#e4e6ef` on `#0f1117` (ratio ~12:1) ✅. Light mode uses `#1e2030` on `#f5f6fa` (ratio ~12:1) ✅.
- **Portal widget** has `title="HookSniff Webhook Portal"` on iframe ✅.
- **Focus styles** — Tailwind's default focus ring is used on form inputs.

### Issues Found

18. **Missing alt text on images** — The compare page uses `<Image>` components with alt text ✅, but the dashboard preview on the landing page uses decorative SVGs without `aria-hidden` (the floating particles div does have it, but the bar chart mockup doesn't).
19. **Missing ARIA labels on interactive elements:**
    - Landing page feature cards — no `role="article"` or landmark semantics.
    - Pricing page FAQ accordion buttons — missing `aria-expanded` (compare page has it ✅, pricing page doesn't).
    - Blog search input — no `aria-label` (has `placeholder` only).
    - Status page "Subscribe to updates" button — no `aria-label` describing what it subscribes to.
20. **Keyboard navigation gaps:**
    - Portal widget detail panel — no `Escape` key handler to close.
    - Blog category filter buttons — no keyboard focus visible styles beyond browser defaults.
    - Status page uptime calendar — tooltip only works on hover (`onMouseEnter`), not keyboard focus.
21. **Skip-to-content link missing** — No skip navigation link on any page. Screen reader users must tab through the entire nav on every page.
22. **Form labels on contact page** — Labels are present ✅, but the `<select>` for subject doesn't have an `id` linking it to its `<label>` via `htmlFor`.
23. **Portal widget `searchInput`** — Uses `placeholder` as label. Should have a `<label>` element or `aria-label`.

---

## 4. Performance

### Strengths
- **Lazy loading** — ThemeToggle and LanguageSwitcher are dynamically imported with `ssr: false` on landing page.
- **Portal iframe** uses `loading="lazy"` ✅.
- **CSS variables** for theming — no runtime style recalculation.
- **Seeded random** for particles — avoids SSR hydration mismatch ✅.

### Issues Found

24. **No image optimization** — The compare page uses `<Image>` from Next.js ✅, but references `/screenshots/compare-hero.jpg`, `/screenshots/scorecard.jpg`, etc. If these are large files, they should use Next.js image optimization (width, height, quality props are set ✅).
25. **Landing page loads all content eagerly** — The entire page (features, pricing, code examples, how-it-works) renders on initial load. Consider code-splitting sections below the fold.
26. **Portal widget loads full CSS inline** — The `style.css` is loaded as a separate file ✅, but `widget.html` contains ~150 lines of inline JavaScript. Should be externalized for caching.
27. **Blog page** — All 17 blog posts are defined as a static array in the component. This means the entire blog index is bundled into the client JS. Should be fetched from an API or generated at build time.
28. **Status page auto-refreshes every 30 seconds** — This is fine for a status page, but the `useCallback` dependency on `loadData` is stable (no deps), so the interval is correctly managed ✅.

---

## 5. Cross-Browser & CSS

### Strengths
- **Portal CSS** uses CSS custom properties with fallback values ✅.
- **Responsive design** — Portal has `@media (max-width: 600px)` breakpoint. Landing page uses Tailwind responsive classes.
- **No CSS-in-JS** — Pure Tailwind + CSS variables = good performance.

### Issues Found

29. **Portal `style.css`** — Uses `inset: 0` for overlay (`.detail-overlay`). This is supported in Chrome 87+, Firefox 66+, Safari 14.1+. The README claims "Chrome 60+, Firefox 60+, Safari 12+" — **incompatible claim**.
30. **`backdrop-blur-xl`** on nav — Requires `backdrop-filter` support. Not available in older browsers. Should have a fallback background color.
31. **`min()` CSS function** in portal — `width: min(480px, 92vw)` — supported in all modern browsers but not in the claimed browser support range.
32. **Custom scrollbar styles** — `::-webkit-scrollbar` only works in WebKit/Browsers. Firefox users get default scrollbar.

---

## 6. Portal Quality

### Strengths
- **Easy to embed** — Single `<script>` tag with data attributes. Well-documented in README.
- **Customizable** — Theme (dark/light), dimensions, target container, API URL all configurable.
- **Self-contained** — iframe-based, no CSS/JS conflicts with host page.
- **Dark/light theme** with localStorage persistence.
- **Search and filter** — Event type search + status filter dropdown.
- **Detail panel** — Slide-in panel with payload, headers, and delivery attempts.
- **XSS protection** — `escHtml()` function properly escapes dynamic content.
- **API key security** — Passed via iframe URL query param, not exposed in parent page DOM.

### Issues Found

33. **API key in URL** — The API key is passed as a query parameter in the iframe `src`. This means it appears in browser history, server logs, and referrer headers. **Security concern.** Consider using `postMessage` from parent to iframe instead.
34. **No error boundary** — If the API returns malformed JSON, the widget will crash silently. The `catch` block only shows a toast but doesn't provide recovery.
35. **No pagination** — Only loads last 50 webhooks. For high-volume users, there's no way to see older events.
36. **No auto-refresh** — The widget loads once. No polling or WebSocket for real-time updates. Users must manually click refresh.
37. **Portal customize page** — The embed code shown uses `portal.hooksniff.dev/embed?token=YOUR_PORTAL_TOKEN` but the actual portal uses `cdn.hooksniff.vercel.app/portal/embed.js`. **Inconsistent embed URLs.**
38. **React integration code** references `hooksniff-sdk/react` — this package doesn't appear to exist (no evidence in the codebase). **Misleading documentation.**
39. **Portal config API** — The `custom_css` field is sanitized against XSS patterns, but the sanitization is case-sensitive after `.to_lowercase()` ✅. However, it doesn't block `@import`, `url()`, or `expression()` in all contexts. The blocklist is incomplete.
40. **Customer portal API** — `list_api_keys` queries `customers` table with `WHERE id = $1` but expects `(String, String, DateTime)` tuple. This query only returns one row (the customer itself), not multiple API keys. **Logic bug** — it should query a separate `api_keys` table or the customer's key fields directly.

---

## 7. Additional Findings

### Security
41. **Contact form** — Submits to `${API}/contact` with no CSRF protection visible. The API endpoint should validate origin.
42. **Newsletter subscription** — Posts to `/api/newsletter` with no visible rate limiting on the client side.
43. **Portal embed.js** — Uses `document.currentScript` with fallback to last script tag. This fallback can be exploited if scripts are dynamically injected.

### Internationalization
44. **Mixed language** — Portal README, example.html, and Rust code comments are in Turkish. The dashboard uses `next-intl` with 8 locales. Portal widget is English-only.
45. **Blog posts** — All content is English-only despite the i18n setup. Blog should either be translated or clearly marked as English-only.

### Missing Pages
46. **Footer links to non-existent pages**: `/customers`, `/newsletter`, `/changelog`, `/playground`, `/faq`, `/terms`, `/privacy`, `/build-vs-buy`, `/webhooks/guides`, `/webhooks/glossary`, `/providers/stripe`, `/providers/github`, `/providers/shopify`. Many of these will return 404.
47. **Landing page footer** links to `/faq` — this page may not exist (not in the file listing).

### Code Quality
48. **Portal widget** — The entire widget is a single HTML file with embedded CSS and JS. Consider splitting for maintainability.
49. **Landing page** — The `TypewriterText` component runs on every mount with `useEffect`. On mobile, this causes unnecessary CPU usage when the user scrolls past.
50. **Status page** — Uses `process.env.NEXT_PUBLIC_VERSION` in client component. This is fine for Next.js but should be set in `next.config.js` for consistency.

---

## Summary by Severity

### 🔴 Critical (Fix Immediately)
| # | Issue | Location |
|---|-------|----------|
| 5 | **Landing page pricing CTAs are broken** — `<button>` elements that don't navigate | `page.tsx` (landing) |
| 9 | **Svix SDK count contradiction** — 6 vs 11 across pages | alternatives/svix vs compare |
| 10 | **Free tier events contradiction** — 1,000 vs 10,000 | pricing vs alternatives |
| 33 | **API key exposed in iframe URL** — visible in logs/history | portal/embed.js |
| 46 | **Footer links to 404 pages** — ~15 broken links | Footer.tsx |

### 🟡 High (Fix Soon)
| # | Issue | Location |
|---|-------|----------|
| 11 | **Sitemap missing most pages** — only 10 of 30+ pages listed | sitemap.ts |
| 13 | **No per-page meta descriptions** — all pages inherit landing page description | All marketing pages |
| 37 | **Inconsistent portal embed URLs** | portal-customize vs portal |
| 38 | **React SDK referenced but doesn't exist** | portal-customize |
| 40 | **API key list logic bug** | customer_portal.rs |
| 3 | **Portal docs in Turkish only** | portal/README.md, example.html |

### 🟢 Medium (Improve)
| # | Issue | Location |
|---|-------|----------|
| 7 | **Generic testimonials** — no real names/companies | pricing, compare, blog |
| 19 | **Missing ARIA labels** on interactive elements | Multiple pages |
| 21 | **No skip-to-content link** | All pages |
| 25 | **Landing page eager loading** | page.tsx |
| 29 | **Browser support claim incompatible with CSS features** | portal/README.md |
| 35 | **Portal: no pagination** | portal/widget.html |
| 36 | **Portal: no auto-refresh** | portal/widget.html |

### ⚪ Low (Nice to Have)
| # | Issue | Location |
|---|-------|----------|
| 6 | Vague About page origin story | about/page.tsx |
| 27 | Blog posts bundled in client JS | blog/page.tsx |
| 32 | Webkit-only scrollbar styles | portal/style.css |
| 44 | Mixed Turkish/English in code comments | Multiple Rust files |
| 49 | Typewriter animation runs on mobile | page.tsx |

---

## Recommendations (Priority Order)

1. **Fix landing page pricing CTAs** — Convert `<button>` to `<Link>` or add `onClick` navigation.
2. **Unify free tier numbers** — Decide: 1,000 or 10,000 free events/month? Update all pages.
3. **Expand sitemap** — Add all public pages including alternatives, blog posts, pricing, etc.
4. **Add per-page meta descriptions** — Each marketing page should export its own `metadata`.
5. **Fix footer broken links** — Either create the missing pages or remove the links.
6. **Translate portal docs to English** — Or add English alongside Turkish.
7. **Fix API key exposure** — Move API key out of iframe URL, use postMessage or fragment identifier.
8. **Add real testimonials** — Even 2-3 verifiable testimonials dramatically improve trust.
9. **Fix customer_portal.rs API key query** — The `list_api_keys` function has a logic bug.
10. **Add skip-to-content links** — Quick accessibility win.
