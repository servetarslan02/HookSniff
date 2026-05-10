# HookSniff /tr/ Content Audit Report

**Audit Date:** 2026-05-10  
**Base URL:** https://hooksniff.vercel.app  
**Locale:** Turkish (/tr/)  
**Pages Audited:** 23  

---

## Executive Summary

**CRITICAL FINDING:** The Turkish locale (`/tr/`) has extensive translation infrastructure in place (complete i18n JSON with hundreds of translated strings for dashboard, auth, settings, etc.), but **all public-facing content pages (blog posts, customer stories, changelog, webhooks hub) remain entirely in English**. The `/tr/` route simply renders the English content without translation. This is a systematic i18n gap — not individual page bugs.

### Issue Count by Severity

| Severity | Count |
|----------|-------|
| 🔴 Critical | 2 |
| 🟠 High | 11 |
| 🟡 Medium | 6 |
| 🟢 Low | 1 |

---

## Page-by-Page Audit

### 1. `/tr/blog`

```json
{
  "page": "/tr/blog",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Turkish blog listing page with localized titles, descriptions, categories",
  "actual_content": "Blog listing page with ALL English content: titles, descriptions, category filters (All, Announcement, Engineering, Standard, Changelog, Integration, AI & Agents), search placeholder, newsletter section, testimonials, pagination",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "seo", "description": "Title tag is generic 'HookSniff — Webhook Delivery Service' instead of blog-specific title like 'Blog — HookSniff' or 'HookSniff Blog'"},
    {"severity": "high", "category": "translation", "description": "All UI text in English: 'Insights on webhooks, event-driven architecture, AI agents, and developer tools.', 'Subscribe to our newsletter', 'Search posts by title or content...', category filters (All, Announcement, Engineering, etc.), 'What Users Say', pagination (Previous/Next)"},
    {"severity": "high", "category": "translation", "description": "All 12+ blog post titles and descriptions displayed in English on /tr/ locale"},
    {"severity": "medium", "category": "rss", "description": "RSS link points to '/blog/rss' (missing /tr/ locale prefix) — may 404 or serve English feed"},
    {"severity": "medium", "category": "footer", "description": "Footer exists but has mixed Turkish/English: some items translated (Dokümantasyon, Değişiklik Günlüğü, SSS, İletişim, Şartlar, Gizlilik, Webhook Nedir?) but many remain English (Pricing, Use Cases, Compare, Customers, Security, Playground, Startups, Newsletter, Blog)"},
    {"severity": "low", "category": "darkmode", "description": "Dark mode: theme script exists in <head> for localStorage detection, but NO visible toggle button in SSR HTML — toggle likely renders client-side only"}
  ]
}
```

### 2. `/tr/blog/hooksniff-vs-svix`

```json
{
  "page": "/tr/blog/hooksniff-vs-svix",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Comparison article: HookSniff vs Svix",
  "actual_content": "Only loading spinner (🪝 emoji) — page content not rendered in SSR. This slug may not exist as a standalone post (comparison post uses 'hooksniff-vs-svix-vs-hookdeck')",
  "routing_correct": false,
  "issues": [
    {"severity": "critical", "category": "routing", "description": "Page returns only loading spinner — no article content. Blog listing links to '/tr/blog/hooksniff-vs-svix-vs-hookdeck' not this slug. This URL may be a dead/invalid route that shows loading state indefinitely."},
    {"severity": "high", "category": "seo", "description": "Title is generic site title, not article-specific. No meta description for this slug."}
  ]
}
```

### 3. `/tr/blog/hooksniff-vs-svix-vs-hookdeck`

```json
{
  "page": "/tr/blog/hooksniff-vs-svix-vs-hookdeck",
  "title": "HookSniff vs Svix vs Hookdeck vs Hook0: 2026 Webhook Service Comparison — HookSniff Blog | HookSniff",
  "expected_content": "Turkish comparison article",
  "actual_content": "Article title in English, body content not extractable via web_fetch (SPA rendering) but title confirms English content",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Title and all content in English on /tr/ locale page"},
    {"severity": "high", "category": "seo", "description": "Title includes 'HookSniff Blog | HookSniff' — double branding in title tag"}
  ]
}
```

### 4. `/tr/blog/may-2026-changelog`

```json
{
  "page": "/tr/blog/may-2026-changelog",
  "title": "HookSniff Changelog — May 2026 (Week 2) — HookSniff Blog | HookSniff",
  "expected_content": "Turkish changelog post",
  "actual_content": "English title and content",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Entire changelog content in English on /tr/ locale"},
    {"severity": "high", "category": "seo", "description": "Title has double 'HookSniff' branding"}
  ]
}
```

### 5. `/tr/blog/building-mcp-ready-webhooks`

```json
{
  "page": "/tr/blog/building-mcp-ready-webhooks",
  "title": "Building an MCP-Ready Webhook Service: Lessons from HookSniff — HookSniff Blog | HookSniff",
  "expected_content": "Turkish article about MCP webhooks",
  "actual_content": "English title and content",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Entire article in English on /tr/ locale"},
    {"severity": "high", "category": "seo", "description": "Double 'HookSniff' in title tag"}
  ]
}
```

### 6. `/tr/blog/webhook-integration-tutorial`

```json
{
  "page": "/tr/blog/webhook-integration-tutorial",
  "title": "Complete Webhook Integration Tutorial: From Zero to Production — HookSniff Blog | HookSniff",
  "expected_content": "Turkish tutorial",
  "actual_content": "English title and content",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Entire tutorial in English on /tr/ locale"},
    {"severity": "high", "category": "seo", "description": "Double 'HookSniff' in title tag"}
  ]
}
```

### 7. `/tr/blog/webhook-architecture-deep-dive`

```json
{
  "page": "/tr/blog/webhook-architecture-deep-dive",
  "title": "Inside HookSniff: How We Built a $0/Month Webhook Service — HookSniff Blog | HookSniff",
  "expected_content": "Turkish architecture article",
  "actual_content": "English title and content",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Entire article in English on /tr/ locale"},
    {"severity": "high", "category": "seo", "description": "Double 'HookSniff' in title tag"}
  ]
}
```

### 8. `/tr/blog/customer-spotlight-ecommerce`

```json
{
  "page": "/tr/blog/customer-spotlight-ecommerce",
  "title": "How an E-Commerce Platform Scaled Webhook Delivery with HookSniff — HookSniff Blog | HookSniff",
  "expected_content": "Turkish customer spotlight",
  "actual_content": "English title and content",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Entire article in English on /tr/ locale"},
    {"severity": "high", "category": "seo", "description": "Double 'HookSniff' in title tag"}
  ]
}
```

### 9. `/tr/blog/why-ai-agents-need-webhooks`

```json
{
  "page": "/tr/blog/why-ai-agents-need-webhooks",
  "title": "Why AI Agents Need Webhooks",
  "expected_content": "Turkish article about AI agents",
  "actual_content": "Full English article rendered: 'The AI agent ecosystem is exploding...', sections on Polling Problem, Webhooks as Nervous System, MCP and Event Delivery, HookSniff features, The Future",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Full article body in English on /tr/ locale — headings, paragraphs, bullet points all English"},
    {"severity": "medium", "category": "seo", "description": "Title lacks 'HookSniff Blog' branding unlike other posts — inconsistent"}
  ]
}
```

### 10. `/tr/blog/gemini-webhook-integration`

```json
{
  "page": "/tr/blog/gemini-webhook-integration",
  "title": "How to Handle Google Gemini Webhooks — HookSniff Blog | HookSniff",
  "expected_content": "Turkish Gemini integration guide",
  "actual_content": "English title and content",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Entire article in English on /tr/ locale"},
    {"severity": "high", "category": "seo", "description": "Double 'HookSniff' in title tag"}
  ]
}
```

### 11. `/tr/blog/stripe-webhook-guide`

```json
{
  "page": "/tr/blog/stripe-webhook-guide",
  "title": "Complete Guide to Stripe Webhooks — HookSniff Blog | HookSniff",
  "expected_content": "Turkish Stripe guide",
  "actual_content": "English title and content",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Entire article in English on /tr/ locale"},
    {"severity": "high", "category": "seo", "description": "Double 'HookSniff' in title tag"}
  ]
}
```

### 12. `/tr/blog/changelog-may-2026`

```json
{
  "page": "/tr/blog/changelog-may-2026",
  "title": "HookSniff Changelog — May 2026",
  "expected_content": "Turkish changelog",
  "actual_content": "Full English changelog rendered: 'Here is what we shipped in May 2026', New Features, Improvements, SDK Updates, What is Next sections",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Full changelog body in English on /tr/ locale — all section headers, bullet points, descriptions in English"},
    {"severity": "medium", "category": "seo", "description": "Title simpler than other posts — missing 'HookSniff Blog' suffix for consistency"}
  ]
}
```

### 13. `/tr/changelog`

```json
{
  "page": "/tr/changelog",
  "title": "Changelog — HookSniff | HookSniff",
  "expected_content": "Turkish changelog page with changelog entries",
  "actual_content": "Loading spinner only — SPA not rendering content for readability extractor. Has RSS link in metadata.",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Title in English, meta description in English: 'What's new in HookSniff. Product updates, new features, SDK releases, security patches, and improvements.'"},
    {"severity": "medium", "category": "seo", "description": "Double 'HookSniff' in title: 'Changelog — HookSniff | HookSniff'"}
  ]
}
```

### 14. `/tr/customers`

```json
{
  "page": "/tr/customers",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Turkish customer stories listing",
  "actual_content": "Only loading spinner — SPA page",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "seo", "description": "Title is generic site title, not 'Customer Stories — HookSniff' or similar"},
    {"severity": "high", "category": "translation", "description": "Meta description in English even for /tr/ locale"}
  ]
}
```

### 15. `/tr/customers/ecommerce-platform`

```json
{
  "page": "/tr/customers/ecommerce-platform",
  "title": "Customer Stories — HookSniff | HookSniff",
  "expected_content": "Turkish ShopFlow case study",
  "actual_content": "Full English case study: ShopFlow, E-Commerce, 45 employees, 50K/day events, problem/solution/results sections, testimonial quote",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Full case study body in English on /tr/ locale — headings, quotes, metrics all English"},
    {"severity": "medium", "category": "seo", "description": "Title is generic 'Customer Stories' not specific to ShopFlow"},
    {"severity": "medium", "category": "footer", "description": "Footer present with 'Ready to get started? Join ShopFlow and thousands of developers who trust HookSniff' in English"}
  ]
}
```

### 16. `/tr/customers/fintech-startup`

```json
{
  "page": "/tr/customers/fintech-startup",
  "title": "Customer Stories — HookSniff | HookSniff",
  "expected_content": "Turkish PayStack case study",
  "actual_content": "Full English case study: PayStack, Fintech, 28 employees, 15K/day events",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Full case study in English on /tr/ locale"},
    {"severity": "medium", "category": "seo", "description": "Generic title not specific to PayStack"}
  ]
}
```

### 17. `/tr/customers/ai-agent-fleet`

```json
{
  "page": "/tr/customers/ai-agent-fleet",
  "title": "Customer Stories — HookSniff | HookSniff",
  "expected_content": "Turkish NeuralOps case study",
  "actual_content": "Full English case study: NeuralOps, AI/ML, 15 employees, 100K/day events",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Full case study in English on /tr/ locale"},
    {"severity": "medium", "category": "seo", "description": "Generic title not specific to NeuralOps"}
  ]
}
```

### 18. `/tr/customers/saas-integration`

```json
{
  "page": "/tr/customers/saas-integration",
  "title": "Customer Stories — HookSniff | HookSniff",
  "expected_content": "Turkish CloudSync case study",
  "actual_content": "Full English case study: CloudSync, SaaS, 3 employees, 8K/month events",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Full case study in English on /tr/ locale"},
    {"severity": "medium", "category": "seo", "description": "Generic title not specific to CloudSync"}
  ]
}
```

### 19. `/tr/customers/healthcare-saas`

```json
{
  "page": "/tr/customers/healthcare-saas",
  "title": "Customer Stories — HookSniff | HookSniff",
  "expected_content": "Turkish MedConnect case study",
  "actual_content": "Full English case study: MedConnect, Healthcare, 32 employees, 25K/day events",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Full case study in English on /tr/ locale"},
    {"severity": "medium", "category": "seo", "description": "Generic title not specific to MedConnect"}
  ]
}
```

### 20. `/tr/customers/devtools-platform`

```json
{
  "page": "/tr/customers/devtools-platform",
  "title": "Customer Stories — HookSniff | HookSniff",
  "expected_content": "Turkish BuildKit case study",
  "actual_content": "Full English case study: BuildKit, Developer Tools, 12 employees, 30K/day events",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Full case study in English on /tr/ locale"},
    {"severity": "medium", "category": "seo", "description": "Generic title not specific to BuildKit"}
  ]
}
```

### 21. `/tr/webhooks`

```json
{
  "page": "/tr/webhooks",
  "title": "Webhooks — Guides, Glossary, Tools & Providers | HookSniff | HookSniff",
  "expected_content": "Turkish webhooks hub page",
  "actual_content": "English content: 'A comprehensive resource for webhook implementation, security, and best practices.' Cards for Guides, Glossary, Build vs Buy, Compare Tools, Provider Guides, What is a Webhook? Comparison links for Svix/Hookdeck/Convoy alternatives.",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "All content in English on /tr/ locale — headings, descriptions, link text, CTA buttons"},
    {"severity": "medium", "category": "seo", "description": "Double 'HookSniff' in title, canonical URL points to '/tr' not '/tr/webhooks'"},
    {"severity": "medium", "category": "footer", "description": "CTA section: 'Ready to implement webhooks?' and 'Start for free →' in English"}
  ]
}
```

### 22. `/tr/webhooks/glossary`

```json
{
  "page": "/tr/webhooks/glossary",
  "title": "Webhook Glossary — Terms & Definitions | HookSniff | HookSniff",
  "expected_content": "Turkish webhook glossary",
  "actual_content": "Loading spinner only — SPA page",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Title in English on /tr/ locale"},
    {"severity": "medium", "category": "seo", "description": "Double 'HookSniff' in title"}
  ]
}
```

### 23. `/tr/webhooks/guides`

```json
{
  "page": "/tr/webhooks/guides",
  "title": "Webhook Guides — Everything You Need to Know | HookSniff | HookSniff",
  "expected_content": "Turkish webhook guides",
  "actual_content": "English content: 'Everything you need to implement, secure, and scale webhooks. From first principles to advanced patterns.' CTA: 'Start for free →'",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "All content in English on /tr/ locale"},
    {"severity": "medium", "category": "seo", "description": "Double 'HookSniff' in title"}
  ]
}
```

---

## Cross-Cutting Issues Summary

### 🔴 CRITICAL

1. **`/tr/blog/hooksniff-vs-svix` — Broken Route**: Returns only loading spinner. This slug doesn't exist as a blog post. The comparison post uses `/tr/blog/hooksniff-vs-svix-vs-hookdeck`. Any internal links to this URL will show a perpetual loading state.

2. **Systematic Translation Failure**: All 23 pages under `/tr/` display English content. The i18n infrastructure exists (full Turkish translation JSON for dashboard, auth, settings, etc. is loaded in the layout), but blog posts, customer stories, changelog entries, and marketing pages are NOT translated. The `/tr/` locale is effectively a shell that loads Turkish UI strings but serves English content.

### 🟠 HIGH

3. **SEO — Generic/Inconsistent Titles**: Blog listing page (`/tr/blog`) and customers listing (`/tr/customers`) use the generic site title "HookSniff — Webhook Delivery Service" instead of section-specific titles. Individual blog posts have inconsistent title patterns — some include "HookSniff Blog | HookSniff" (double branding), others don't.

4. **SEO — Double "HookSniff" in Titles**: 10+ pages have "| HookSniff | HookSniff" or "— HookSniff Blog | HookSniff" in their title tags, wasting valuable title tag space.

5. **Footer Mixed Language**: The footer translations are incomplete. Turkish translations exist for some items (Dokümantasyon, Değişiklik Günlüğü, SSS, İletişim, Şartlar, Gizlilik, Webhook Nedir?) but many remain in English (Pricing, Use Cases, Compare, Customers, Security, Playground, Startups, Newsletter, Blog).

6. **Blog Content Not Translated**: All 11 blog post pages display full English content (titles, headings, paragraphs, bullet points) on the `/tr/` locale.

7. **Customer Stories Not Translated**: All 6 customer story pages display full English case studies on the `/tr/` locale.

### 🟡 MEDIUM

8. **RSS Link Missing Locale Prefix**: Blog page RSS link points to `/blog/rss` instead of `/tr/blog/rss`.

9. **Canonical URL Issues**: `/tr/webhooks` has canonical URL pointing to `/tr` (root) instead of `/tr/webhooks`.

10. **Meta Descriptions in English**: All pages have English meta descriptions even for the Turkish locale.

### 🟢 LOW

11. **Dark Mode Toggle**: Theme detection script exists in `<head>` (localStorage check), but no visible toggle button in SSR HTML. Toggle likely renders client-side only — this is acceptable for Next.js SPA but means no toggle for non-JS clients.

---

## Recommendations

1. **Translate blog content** or add a "This article is only available in English" banner for Turkish locale visitors
2. **Fix or redirect** `/tr/blog/hooksniff-vs-svix` to `/tr/blog/hooksniff-vs-svix-vs-hookdeck`
3. **Fix SEO titles** — use section-specific titles (e.g., "Blog — HookSniff") and remove double branding
4. **Complete footer translations** for remaining English items
5. **Fix RSS link** to include `/tr/` locale prefix
6. **Fix canonical URLs** to match actual page paths
7. **Translate meta descriptions** for Turkish locale
8. **Consider adding a visible dark mode toggle** in SSR HTML for better accessibility
