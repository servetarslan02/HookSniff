# PublicNavbar Migration Report

**Date:** 2026-05-12  
**Task:** Replace inline `<nav>` blocks with shared `<PublicNavbar>` component across 12 public pages.

## Summary

All 12 pages successfully migrated. Each page now uses `<PublicNavbar pageTitle={...} />` instead of its own inline navbar.

## Changes Per Page

| # | Page | pageTitle prop | Imports removed | Notes |
|---|------|---------------|-----------------|-------|
| 1 | `security/page.tsx` | `t("title")` | `LanguageSwitcher` | `Link` kept (used in body CTA) |
| 2 | `faq/page.tsx` | `t("faqTitle")` | `LanguageSwitcher` | `Link` kept (used in body CTA) |
| 3 | `what-is-a-webhook/page.tsx` | `"What is a Webhook?"` (hardcoded) | `LanguageSwitcher` | No translation key for title; `Link` kept (used in body CTA) |
| 4 | `startups/page.tsx` | `t("title")` | `LanguageSwitcher` | `Link` kept (used in body CTA) |
| 5 | `providers/stripe/page.tsx` | `t("stripe")` | `LanguageSwitcher` | `Link` kept (used in body CTA) |
| 6 | `providers/github/page.tsx` | `t("github")` | `LanguageSwitcher` | `Link` kept (used in body CTA) |
| 7 | `providers/shopify/page.tsx` | `t("shopify")` | `LanguageSwitcher` | `Link` kept (used in body CTA) |
| 8 | `about/page.tsx` | `t('about.title')` | `LanguageSwitcher` | `Link` kept (used in body CTA) |
| 9 | `contact/page.tsx` | `t('contact.title')` | `LanguageSwitcher` | No `Link` import existed (nav used `<a>` tags) |
| 10 | `get-started/page.tsx` | `t('title')` | `LanguageSwitcher` | `useAuth` + `Link` kept (used extensively in body) |
| 11 | `privacy/page.tsx` | `t('nav')` | `LanguageSwitcher` | No `Link` import existed (nav used `<a>` tags) |
| 12 | `terms/page.tsx` | `t('nav')` | `LanguageSwitcher` | No `Link` import existed (nav used `<a>` tags) |

## What was removed per page
- **All 12:** `import { LanguageSwitcher } from '@/components/LanguageSwitcher'` removed
- **All 12:** Inline `<nav className="...">...</nav>` block removed
- **All 12:** Added `import PublicNavbar from '@/components/PublicNavbar'`

## What was preserved
- `<main>` or content `<div>` blocks — untouched
- `<Footer />` components — untouched
- `Link` / `useAuth` imports where used in page body (not just nav)
- All page logic, state, and content — untouched

## Notes
- `what-is-a-webhook/page.tsx`: Title is hardcoded as `"What is a Webhook?"` since no translation key was found for the nav title. Consider adding a `title` key to the `whatIsWebhook` translation namespace.
- `privacy/page.tsx` and `terms/page.tsx`: Use `t('nav')` for the page title (matches their existing translation key pattern).
- Provider pages (stripe/github/shopify): Use the provider-specific key (`t("stripe")`, `t("github")`, `t("shopify")`) instead of the parent `t("title")` which refers to "Providers".
