# PublicNavbar Migration Report

**Date:** 2026-05-12  
**Task:** Replace inline `<nav>` blocks with shared `<PublicNavbar />` component across 12 public pages.

---

## Summary

All 12 public pages have been updated to use the shared `PublicNavbar` component instead of their own inline navbar markup.

## Changes Per Page

| # | Page | pageTitle prop | Removed imports | Notes |
|---|------|---------------|-----------------|-------|
| 1 | `security/page.tsx` | `t("title")` | `LanguageSwitcher` | Nav had Link+LanguageSwitcher |
| 2 | `faq/page.tsx` | `t("faqTitle")` | `LanguageSwitcher` | Nav had Link+LanguageSwitcher |
| 3 | `what-is-a-webhook/page.tsx` | `"What is a Webhook?"` | `LanguageSwitcher` | Hardcoded title (no i18n key) |
| 4 | `startups/page.tsx` | `t("title")` | `LanguageSwitcher` | Nav had Link+LanguageSwitcher |
| 5 | `providers/stripe/page.tsx` | `t("stripe")` | `LanguageSwitcher` | Had breadcrumb with /providers link |
| 6 | `providers/github/page.tsx` | `t("github")` | `LanguageSwitcher` | Had breadcrumb with /providers link |
| 7 | `providers/shopify/page.tsx` | `t("shopify")` | `LanguageSwitcher` | Had breadcrumb with /providers link |
| 8 | `about/page.tsx` | `t('about.title')` | `LanguageSwitcher` | Nav used `<a>` not `<Link>` |
| 9 | `contact/page.tsx` | `t('contact.title')` | `LanguageSwitcher` | Nav used `<a>` not `<Link>` |
| 10 | `get-started/page.tsx` | `t('title')` | `LanguageSwitcher` | Complex nav with useAuth+user buttons |
| 11 | `privacy/page.tsx` | `t('nav')` | `LanguageSwitcher` | Nav used `<a>` not `<Link>` |
| 12 | `terms/page.tsx` | `t('nav')` | `LanguageSwitcher` | Nav used `<a>` not `<Link>` |

## What was changed per file

1. **Removed** `import { LanguageSwitcher } from '@/components/LanguageSwitcher';`
2. **Added** `import PublicNavbar from '@/components/PublicNavbar';`
3. **Replaced** entire `<nav>...</nav>` block with `<PublicNavbar pageTitle={...} />`
4. **Kept** `import { Link } from '@/i18n/navigation';` where it's used in body content (all pages except about, contact, privacy, terms)
5. **Kept** `useAuth` in `get-started/page.tsx` — it's used in page body for conditional rendering (signed-in state, dashboard buttons, etc.)

## Notes

- **Providers pages** (stripe, github, shopify): The original nav had a deeper breadcrumb (`/providers / stripe`). Now they show a simple breadcrumb via PublicNavbar (`/ Stripe`). This is consistent with other pages.
- **what-is-a-webhook**: Title is hardcoded `"What is a Webhook?"` since no i18n key was available for it in the nav.
- **privacy/terms**: Used `t('nav')` as the pageTitle since that's the key they used in the original breadcrumb.
- **No `useAuth` was removed** from any page — only `get-started` had it, and it's used in the page body, not just the nav.
- **`<main>` and content blocks** were not touched in any file.
