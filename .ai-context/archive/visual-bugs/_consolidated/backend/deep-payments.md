# Deep Review: Payment & Billing System

**Reviewer:** AI Deep Review Agent
**Date:** 2026-05-10
**Files Reviewed:** `api/src/billing/` (mod.rs, provider.rs, stripe.rs, polar.rs, iyzico.rs), `api/src/routes/billing.rs`, `api/src/routes/admin.rs`, `dashboard/src/app/[locale]/dashboard/billing/page.tsx`, `dashboard/src/app/[locale]/pricing/page.tsx`, `migrations/009_payment_providers.sql`, `migrations/028_invoices.sql`, `migrations/029_free_tier_10k.sql`

---

## Executive Summary

The billing system implements a solid **multi-provider architecture** (Stripe, Polar.sh, iyzico) with good abstraction via the `PaymentProviderImpl` trait. The Stripe webhook signature verification is robust with HMAC-SHA256 + timestamp tolerance. However, there are **critical pricing mismatches**, **missing endpoints**, **no webhook idempotency**, and **several incomplete integrations** that need urgent attention before production launch.

**Severity Breakdown:** 🔴 Critical: 5 | 🟠 High: 6 | 🟡 Medium: 8 | 🔵 Low: 4

---

## 🔴 Critical Issues

### 1. Price Mismatch Between Frontend and Backend

**Severity:** 🔴 Critical — Users see one price, system may charge/record another.

| Source | Pro Price | Business Price |
|--------|-----------|----------------|
| `billing/page.tsx` (frontend) | $49/mo | $149/mo |
| `pricing/page.tsx` (marketing) | $49/mo | $149/mo |
| `Plan::monthly_price_cents()` (backend) | $29/mo | $99/mo |
| `Plan::monthly_price_kurus()` (iyzico display) | ₺29 | ₺99 |
| `IyzicoConfig` defaults | ₺149 | ₺449 |

**Impact:**
- Invoice records in the DB use `plan.monthly_price_cents()` ($29/$99), but users see $49/$149 on the frontend.
- Stripe checkout uses environment-configured price IDs (could be $49), creating a mismatch between actual charges and recorded amounts.
- iyzico defaults to ₺149/₺449 but `Plan::monthly_price_kurus()` says ₺29/₺99 — **5x discrepancy**.

**Fix:** Unify all prices in one place. Either update `Plan::monthly_price_cents()` to $49/$99, or update the frontend to $29/$99. The iyzico config defaults should also match.

### 2. Missing `DELETE /billing/subscription` Endpoint

**Severity:** 🔴 Critical — Cancel subscription button is broken.

The frontend `billing/page.tsx` calls:
```js
await api.delete('/billing/subscription', token);
```

But the billing router only registers:
```rust
.route("/subscription", get(get_subscription))
.route("/upgrade", post(upgrade_plan))
.route("/portal", post(open_portal))
// ... no DELETE handler
```

**Impact:** Clicking "Cancel Subscription" will return a 405 Method Not Allowed. Users cannot cancel their subscriptions through the UI.

**Fix:** Add a `.delete(cancel_subscription)` handler that:
1. Cancels the subscription via the provider (Stripe/Polar/iyzico)
2. Sets `cancel_at_period_end = true` (or immediately downgrades)
3. Returns confirmation

### 3. No Webhook Idempotency / Deduplication

**Severity:** 🔴 Critical — Duplicate charges possible on webhook replay.

None of the three providers check for duplicate webhook events:

- **Stripe:** No `event.id` deduplication. If Stripe retries a webhook (common on timeouts), `handle_checkout_completed` will run the UPDATE again (idempotent by accident since it's an UPDATE), but `handle_invoice_paid` will INSERT a **duplicate invoice** every time.
- **Polar.sh:** Same issue. `subscription.created` will try to UPDATE/INSERT multiple times.
- **iyzico:** Same issue.

**Impact:** Duplicate invoice records, potential double-plan-upgrade side effects, corrupted billing history.

**Fix:** Add a `processed_webhooks` table or use the `payment_transactions` table:
```sql
CREATE TABLE processed_webhooks (
    event_id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT now()
);
```
Check for existing event_id before processing. Return 200 immediately for duplicates.

### 4. Stripe Webhook Verification Bypassed When Secret Not Configured

**Severity:** 🔴 Critical — Any attacker can forge Stripe webhooks.

In `handle_stripe_webhook`:
```rust
let webhook_secret = cfg.stripe_webhook_secret.as_deref().unwrap_or("");
if webhook_secret.is_empty() {
    tracing::warn!("Stripe webhook secret not configured, skipping verification");
}
// Continues to call handle_webhook_event with empty secret...
```

When the secret is empty, `verify_webhook_signature` will attempt verification with an empty string. The `whsec_` strip will fail gracefully and the HMAC will likely fail too — **but this depends on the specific empty-string behavior.** More importantly, the `tolerance_secs` check could still pass with a forged timestamp.

**Impact:** If `STRIPE_WEBHOOK_SECRET` env var is missing, anyone can send fake webhook events to upgrade/downgrade/cancel any customer.

**Fix:** Return 500 immediately when webhook secret is not configured:
```rust
if webhook_secret.is_empty() {
    return Err(AppError::Internal(anyhow::anyhow!("Stripe webhook secret not configured")));
}
```

### 5. iyzico Integration is Non-Functional

**Severity:** 🔴 Critical — Cannot process Turkish payments.

Multiple blockers:

1. **Hardcoded placeholder data in checkout:**
   ```rust
   identity_number: "11111111111"  // Fake Turkish ID
   ip: "0.0.0.0"
   city: "Istanbul"
   address: "N/A"
   card_holder_name: ""  // Empty!
   card_number: ""       // Empty!
   ```
   iyzico will reject this request. The checkout form needs to collect real user data.

2. **3DS redirect page doesn't exist:** The checkout creates a URL to `/dashboard/billing/iyzico-3ds?paymentId=...` but no such page exists in the dashboard codebase.

3. **`amount_cents: 0` in webhook:** The `PaymentSucceeded` handler hardcodes `amount_cents: 0` with a TODO comment.

4. **No recurring billing:** iyzico doesn't support native subscriptions (acknowledged in code: "iyzico doesn't have native subscriptions"). But there's **no implementation of manual recurring billing** — no cron job to charge customers monthly, no reminder emails before expiry.

5. **iyzico cancel is a no-op:** `cancel_subscription` just logs and returns Ok. The customer's plan is never actually changed.

**Fix:** Either:
- (a) Fully implement iyzico with hosted checkout page, 3DS handling, and manual recurring billing with cron jobs, OR
- (b) Mark iyzico as "coming soon" and remove it from the provider selection UI

---

## 🟠 High Issues

### 6. Subscription Status Hardcoded to "active"

In `get_subscription`:
```rust
status: "active".to_string(),  // Always "active" regardless of actual state
```

The `SubscriptionStatus` enum exists (Active, Trialing, PastDue, Canceled, Unpaid) but is never used. The customer table doesn't store subscription status — only `plan` and `stripe_subscription_id`.

**Impact:** Users can't see if their subscription is past due, trialing, or canceled. The billing page always shows "active".

**Fix:** Add a `subscription_status` column to the customers table, update it via webhooks.

### 7. No Grace Period on Failed Payments

`handle_invoice_failed` only creates a failed invoice record:
```rust
sqlx::query("INSERT INTO invoices ... status = 'failed' ...")
```

It does **not**:
- Set the subscription to `past_due`
- Send an email notification to the customer
- Schedule a retry
- Downgrade after N failures

**Impact:** Users with failed payments continue to use the paid plan indefinitely. Revenue leakage.

**Fix:**
1. Update subscription status to `past_due`
2. Send payment failure email
3. After 3 failures (configurable), downgrade to free
4. Stripe handles retries automatically, but the webhook handler should track the state

### 8. No Proration on Plan Changes

The upgrade flow creates a new checkout session but doesn't handle:
- **Mid-cycle upgrades:** User on Pro ($29) upgrading to Business ($99) mid-month — no prorated charge
- **Mid-cycle downgrades:** No refund or credit calculation
- **Plan changes via webhook:** `handle_subscription_updated` just overwrites the plan without considering proration

**Impact:** Users either overpay (full new charge without credit for unused time) or underpay (downgrade without accounting for the higher-tier usage).

**Fix:** For Stripe, let Stripe handle proration (it does by default in Checkout). For Polar.sh, check their proration API. For manual changes, calculate and record credits.

### 9. Pricing Page Shows Different Limits Than Backend

| Feature | Pricing Page (Free) | Backend (Free) | Pricing Page (Pro) | Backend (Pro) |
|---------|-------------------|---------------|-------------------|---------------|
| Monthly webhooks | 1,000 | 10,000 | 50,000 | 50,000 |
| Endpoints | 1 | 5 | 10 | 50 |
| Rate limit | 100/min | 100/min | 1,000/min | 1,000/min |

**Impact:** Marketing promises fewer features than the product delivers (Free tier), or more features than available (Pro endpoints: page says 10, backend allows 50). This could create legal/compliance issues.

**Fix:** Sync pricing page data with `Plan` enum values. Consider using a shared config or API endpoint for plan limits.

### 10. Provider Switching Doesn't Cancel Old Subscription

When a customer upgrades via a new provider (e.g., switching from Stripe to Polar), the `upgrade_plan` handler:
1. Creates a new checkout with the new provider
2. Updates `payment_provider` in the DB

But it does **not** cancel the existing subscription with the old provider. The old subscription continues to charge.

**Impact:** Double billing — customer pays both Stripe and Polar simultaneously.

**Fix:** Before creating a new checkout, check for and cancel any existing subscription with the previous provider.

### 11. Polar.sh `create_customer_portal` is a Stub

```rust
async fn create_customer_portal(&self, _polar_customer_id: &str, app_url: &str) -> Result<String, AppError> {
    Ok(format!("{}/dashboard/billing", app_url))
}
```

This just redirects back to the billing page, creating an infinite loop if the billing page has a "Manage Subscription" button that calls the portal endpoint.

**Impact:** Users on Polar can't actually manage their subscription (update payment method, view Polar invoices, etc.).

**Fix:** Implement actual Polar.sh customer portal integration or clearly indicate that management happens through the HookSniff dashboard only.

---

## 🟡 Medium Issues

### 12. No Chargeback/Refund Handling

- **Stripe:** No `charge.refunded`, `charge.dispute.created`, or `charge.dispute.closed` events handled.
- **Polar.sh:** `order.refunded` is handled as `Ignored`.
- **iyzico:** No refund events handled.

**Impact:** If a customer does a chargeback, their plan isn't downgraded. If a refund is issued, the invoice status isn't updated.

**Fix:** Handle at minimum:
- `charge.refunded` → update invoice status, consider downgrading
- `charge.dispute.created` → flag account, send admin notification
- Polar `order.refunded` → update invoice, downgrade if full refund

### 13. Admin Revenue Calculation is Estimation Only

`system_stats` calculates revenue as:
```sql
CASE plan WHEN 'pro' THEN 29.0 WHEN 'business' THEN 99.0 ELSE 0.0 END
```

This doesn't account for:
- Actual payment amounts (could differ from plan price)
- Refunds/chargebacks
- Multi-provider pricing differences (iyzico in TRY)
- Free trials, coupons, or discounts

**Impact:** Admin dashboard shows inaccurate revenue figures.

**Fix:** Calculate revenue from the `invoices` table where `status = 'paid'`, or from `payment_transactions`.

### 14. Invoice Model Missing Provider-Specific Fields

The `process_webhook_result` for Polar/iyzico creates invoices without `provider_invoice_id`:
```rust
sqlx::query("INSERT INTO invoices (customer_id, amount_cents, currency, status, plan) VALUES ...")
```

Stripe invoices include `provider_invoice_id`, but Polar/iyzico ones don't. This makes it impossible to reconcile invoices with provider records.

**Fix:** Always include provider-specific invoice/order IDs.

### 15. `webhook_count` Uses `i32` — Overflow Risk

The customer model uses `webhook_count: i32` (max ~2.1 billion). While Enterprise is `u64::MAX`, the DB column is `INT` (PostgreSQL `INT` = 32-bit). For a high-volume Business customer doing 500K webhooks/month, this is fine, but:
- The `webhook_limit` comparison in SQL uses `i64` (`customer.webhook_limit as i64`)
- But the column is `INT` — potential silent truncation

**Fix:** Use `BIGINT` for both `webhook_count` and `webhook_limit` columns, and `i64`/`u64` in Rust.

### 16. No Webhook Failure Alerting

When a webhook handler fails (returns error), the provider will retry, but:
- No admin notification
- No metric/counter for failed webhook processing
- No dead-letter queue for unprocessable events

**Impact:** Silent failures in billing could go unnoticed for days.

**Fix:** Add alerting for repeated webhook failures. Log to a separate `webhook_failures` table for audit.

### 17. Billing Page Doesn't Show Payment Provider

The billing page's plan cards don't indicate which payment provider the customer is using. A customer on Polar sees the same UI as one on Stripe, but their portal/management experience differs.

**Fix:** Show the active payment provider and provider-specific actions.

### 18. Upgrade Flow Doesn't Validate Plan Transition

The `upgrade_plan` handler allows:
- Upgrading from Pro to Pro (no-op checkout)
- Upgrading to Enterprise (returns error, but after provider selection)
- No validation that the new plan is actually higher than current

**Impact:** Unnecessary checkout sessions, confusing UX.

**Fix:** Validate that `new_plan > current_plan` before creating checkout.

### 19. Checkout URL Validation is Client-Side Only

The billing page validates checkout URLs against a hardcoded allowlist:
```typescript
const trustedHosts = ['polar.sh', 'checkout.polar.sh', 'pay.stripe.com', ...];
```

But the backend doesn't validate URLs. If the backend is compromised or a provider returns a malicious URL, the client-side check is the only protection.

**Fix:** Add server-side URL validation in the checkout response handler.

---

## 🔵 Low Issues

### 20. No Annual Billing Option

All plans are monthly only. No annual discount option exists in the plan definitions, checkout flow, or UI.

**Recommendation:** Add annual pricing (e.g., 2 months free) as a future feature.

### 21. Enterprise Plan Has No Implementation

Enterprise plan returns `monthly_price_cents() = 0` and the upgrade handler returns an error:
```rust
Plan::Enterprise => return Err(AppError::BadRequest("Enterprise plans require contacting sales"))
```

This is fine for now, but there's no "Contact Sales" form integration or lead capture.

### 22. Missing `cancel_at_period_end` Logic

The `Subscription` struct has `cancel_at_period_end: bool` but it's never set or checked. Stripe supports this natively (cancel at period end vs immediate), but the code doesn't use it.

### 23. Currency Not Localized

All USD amounts are displayed without locale-aware formatting. The iyzico integration uses TRY but the billing page always shows `$`.

---

## Architecture Assessment

### ✅ What's Done Well

1. **Clean provider abstraction:** The `PaymentProviderImpl` trait is well-designed. Adding a new provider requires implementing 4 methods.
2. **Stripe webhook signature verification:** HMAC-SHA256 with timestamp tolerance, constant-time comparison, proper key decoding. Solid implementation with good test coverage.
3. **Polar.sh signature verification:** Also properly implemented with the same pattern.
4. **Atomic webhook counting:** `UPDATE ... WHERE webhook_count < limit RETURNING *` is a clean race-condition-free approach.
5. **Batch webhook rollback:** Failed batch items correctly roll back the `webhook_count` increment.
6. **Monthly counter reset:** A cron job in `jobs/retention.rs` resets all counters on the 1st of each month.
7. **Test coverage:** All billing modules have comprehensive unit tests for signature verification, config parsing, and data structures.
8. **Trusted checkout URL validation:** Client-side validation prevents open-redirect attacks.

### ⚠️ Architecture Concerns

1. **Three different price sources:** `Plan::monthly_price_cents()`, `IyzicoConfig::price_*_kurus()`, and Stripe price IDs all define prices independently. This is a recipe for mismatches (which already exist).
2. **No event sourcing for billing state changes:** Plan changes happen via direct UPDATE queries in multiple places (admin, webhooks, checkout). No audit trail of who changed what and when.
3. **Mixed concerns in `process_webhook_result`:** This function handles DB updates for both Polar and iyzico with provider-specific SQL branches. Should be refactored to use the provider trait.
4. **No retry/dead-letter for webhook processing:** If a webhook handler fails, the entire request fails. No queuing for later retry.

---

## Recommended Priority Order

1. **Fix pricing mismatch** (Critical #1) — Immediate. Legal/compliance risk.
2. **Add DELETE /billing/subscription endpoint** (Critical #2) — Users literally cannot cancel.
3. **Add webhook idempotency** (Critical #3) — Prevents duplicate charges/invoices.
4. **Fix webhook secret bypass** (Critical #4) — Security vulnerability.
5. **Decide on iyzico: complete or remove** (Critical #5) — Half-implemented payment is worse than none.
6. **Add subscription status tracking** (High #6) — Required for proper lifecycle management.
7. **Add failed payment handling** (High #7) — Revenue protection.
8. **Sync pricing page with backend** (High #9) — Marketing accuracy.
9. **Handle provider switching** (High #10) — Prevent double billing.
10. **Add chargeback/refund handling** (Medium #12) — Revenue protection.

---

## Test Coverage Gaps

| Area | Current Coverage | Needed |
|------|-----------------|--------|
| Stripe signature verification | ✅ Excellent (7 tests) | — |
| Polar signature verification | ✅ Good (7 tests) | — |
| iyzico signature verification | ✅ Good (3 tests) | — |
| Plan parsing/limits | ✅ Comprehensive | — |
| Webhook event processing | ❌ No integration tests | Need tests for each event type end-to-end |
| Upgrade/downgrade flow | ❌ No tests | Need tests for plan transitions |
| Invoice creation | ❌ No tests | Need tests for each provider |
| Cancel subscription | ❌ No tests (endpoint missing) | Need full cancel flow tests |
| Provider switching | ❌ No tests | Need tests for Stripe→Polar migration |
| Webhook idempotency | ❌ No tests | Need duplicate event tests |
