# Email Templates — Current State & Gap Analysis

> **Date:** 2026-05-12
> **Items:** 200–206

## Current Implementation

### Providers (`api/src/email.rs`, `api/src/resend_email.rs`)

Two email providers with fallback chain:
1. **Resend** (primary) — `RESEND_API_KEY` env var, free tier 100/day
2. **GCloud Gmail API** (secondary) — `GCP_SA_JSON` env var, OAuth2 service account
3. **None** (fallback) — logs warning, no-op

### Existing Templates (4 templates)

| Template | Method | Language | Mobile-Optimized |
|----------|--------|----------|-----------------|
| Welcome email | `send_welcome_email()` | English only | ❌ No |
| Email verification | `send_verification_email()` | English only | ❌ No |
| Password reset | `send_password_reset_email()` | English only | ❌ No |
| Delivery failed alert | `send_delivery_failed_email()` | English only | ❌ No |

All templates are inline HTML strings in `email.rs` (GCloud) and `resend_email.rs` (Resend).

## Missing Templates (Items 204–205)

| Template | Priority | Notes |
|----------|----------|-------|
| Billing/Invoice email | Medium | Send on subscription change, invoice generated |
| Webhook success confirmation | Low | Optional — mainly for user confidence |
| Team invitation email | Medium | When inviting members to a team |
| Password changed confirmation | Medium | Security notification |
| Account deleted confirmation | Low | GDPR compliance |
| Subscription cancellation | Medium | When user cancels plan |
| Usage limit warning | Medium | When approaching plan limits |

## Issues

### Item 200 — i18n (English only)
All 4 templates have hardcoded English text. No i18n support.
- **Fix:** Template strings should use i18n keys or accept `locale` parameter
- Template HTML is generated in Rust — needs locale-aware string lookup

### Item 201 — No Retry Logic
`send()` methods are fire-and-forget. If Resend/Gmail returns 5xx, the email is lost.
- **Fix:** Add retry with exponential backoff (3 attempts)
- Consider using existing `retry_policy` module

### Item 202 — No Dead-Letter Queue
Failed emails are logged but not persisted. No way to retry later.
- **Fix:** Store failed emails in `dead_letters` table (already exists for webhooks)
- Add a background job to retry dead-lettered emails

### Item 203 — No Email-Level Rate Limiting
No protection against email storms (e.g., 1000 users hit "forgot password" simultaneously).
- **Fix:** Add per-recipient rate limit (max 5 emails/hour)
- Add global rate limit (respect Resend's 100/day free tier)

### Item 206 — Not Mobile-Optimized
Templates use `max-width: 600px` but lack:
- Responsive breakpoints
- Mobile-friendly font sizes
- Touch-friendly button sizes (min 44px tap target)
- Preheader text
- Dark mode support
- **Fix:** Use a responsive email template framework or add media queries

## Recommendations

1. **Extract templates to files** — Move HTML from Rust code to `templates/email/*.html` with Handlebars/Tera placeholders
2. **Add i18n** — Pass locale to template renderer, use translated strings
3. **Add retry + dead-letter** — Use existing retry infrastructure
4. **Add missing templates** — Priority: team invite, password changed, billing
5. **Mobile-responsive** — Add `<style>` media queries for 480px breakpoint
6. **Add preheader text** — Invisible preview text in email clients
