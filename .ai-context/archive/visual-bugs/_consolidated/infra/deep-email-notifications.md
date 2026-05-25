# Deep Review: Email System & Notification Infrastructure

**Reviewed:** 2026-05-10
**Files:** `api/src/email.rs`, `api/src/routes/auth.rs`, `api/src/notifications/mod.rs`, `api/src/routes/notifications.rs`, `api/src/routes/customer_portal.rs`, `api/src/routes/alerts.rs`, `api/src/routes/devices.rs`, `api/src/jobs/retention.rs`, `api/src/db.rs`, `worker/src/delivery/mod.rs`, `worker/src/delivery/http.rs`, `worker/src/fanout.rs`, `dashboard/src/components/NotificationCenter.tsx`, `dashboard/src/app/[locale]/dashboard/notifications/page.tsx`

---

## 1. Email Sending

### Service
- **Gmail API** via Google Cloud service account with domain-wide delegation
- OAuth2 JWT flow: service account key → JWT → access token exchange → Gmail API `users/me/messages/send`
- Access token cached with 5-minute early expiry buffer

### Async or Blocking
- **Fully async** — all email sends use `tokio::spawn` as fire-and-forget
- Welcome, verification, and password reset emails are all spawned as background tasks

### Failure Handling
- **No retry** — if the `tokio::spawn` task fails, the error is logged via `tracing::warn` and silently dropped
- No dead-letter queue for failed emails
- No callback/notification to the user that their email failed to send

### Logging
- ✅ `tracing::info` on success: `"✅ Email sent to {}: {}"`
- ✅ `tracing::error` on Gmail API error with status and body
- ✅ `tracing::debug` before sending
- ✅ `tracing::warn` when email client is not configured

### Rate Limiting
- **❌ No email-level rate limiting** — no throttling on email sends
- Only API-level rate limits exist (5 registrations/hour, 10 logins/15min, 5 password resets/hour per IP)
- A user could trigger unlimited verification email resends (within the API rate limit of 5/hour/IP)

---

## 2. Email Templates

### Templates Found
| Template | Present | Location |
|----------|---------|----------|
| Welcome | ✅ | `email.rs:send_welcome_email` |
| Email Verification | ✅ | `email.rs:send_verification_email` |
| Password Reset | ✅ | `email.rs:send_password_reset_email` |
| Webhook Delivery Failed | ✅ | `email.rs:send_delivery_failed_email` |
| Contact/Admin Email | ✅ | `email.rs:send_contact_email` (generic) |
| Billing/Invoice | ❌ | Not found |
| Webhook Success | ❌ | Not found |

### Template Quality

**Responsive (Mobile-Friendly):**
- ✅ All templates use `max-width: 600px` and `margin: 0 auto` — standard email width
- ⚠️ No media queries for mobile breakpoints
- ⚠️ No `<meta name="viewport">` tag
- Verdict: **Basic responsive** — works but not optimized for mobile

**Translations:**
- **❌ No translation/i18n** — all templates are English-only
- The dashboard notifications page uses `next-intl` for UI translations, but email content is hardcoded English

**HTML + Plain Text Fallback:**
- **❌ Missing plain text fallback** — `build_raw_message` declares `multipart/alternative` boundary but only includes the `text/html` part
- The MIME structure is malformed: it claims `multipart/alternative` with a boundary but only includes one HTML part with no `text/plain` alternative
- This is a **bug** — some email clients may display incorrectly or flag as spam

**Template Architecture:**
- ⚠️ Templates are **inline Rust strings** — not external template files
- No template engine (Handlebars, Tera, Askama) — just `format!()` interpolation
- ⚠️ XSS risk: `endpoint_name` and `error_details` in `send_delivery_failed_email` are interpolated directly into HTML without escaping
- No template inheritance or shared layout/components

---

## 3. Notification System

### Notification Types
| Type | Icon | Description |
|------|------|-------------|
| `webhook_failed` | 🔴 | Webhook delivery failure |
| `alert` | ⚠️ | Alert rule triggered |
| `system` | 🔔 | System messages |
| `billing` | 💳 | Billing events |

### Storage
- ✅ **Stored in PostgreSQL** — `notifications` table with proper indexes
- Schema: `id`, `customer_id`, `type`, `title`, `message`, `is_read`, `link`, `created_at`
- Foreign key to `customers` with `ON DELETE CASCADE`

### Real-Time Delivery
- **WebSocket exists** (`api/src/ws/`) — full WebSocket gateway with JWT auth, pattern subscriptions, heartbeat, and reconnection with missed event replay
- **⚠️ Notifications are NOT pushed via WebSocket** — the WebSocket gateway is for webhook *event* streaming, not for in-app notifications
- **FCM Push Notifications** exist via `notifications/mod.rs` — sends to registered device tokens for delivery success/failure
- **In-app notifications poll every 30 seconds** (hardcoded in `NotificationCenter.tsx`)

### Read/Unread Tracking
- ✅ `is_read` boolean column with index
- ✅ `mark_read`, `mark_all_read` endpoints
- ✅ `unread_count` endpoint
- ✅ UI shows unread badge with count (capped at "9+")

### Cleanup
- **❌ No automatic cleanup of old notifications**
- The `retention.rs` job cleans up deliveries, idempotency keys, webhook queue, and seen webhooks — but **not notifications**
- Notifications accumulate indefinitely until the user deletes them manually
- GDPR account deletion does clean up notifications (DELETE FROM notifications WHERE customer_id = $1)

---

## 4. Email Verification

### Token Security
- ✅ **Cryptographically random** — uses `jwt::generate_random_token()`
- ✅ **Time-limited** — expires after 24 hours (`Duration::hours(24)`)
- ✅ **Single-use** — token is marked `used = true` after verification
- ✅ **Stored as hash** — `jwt::hash_token(&token)` stored in DB, raw token only in URL

### Token Reuse Prevention
- ✅ Query checks `used = false AND expires_at > NOW()` — token cannot be reused

### Rate Limiting
- ✅ Rate limited at 5 requests per IP per hour (via `RESET_RATE_LIMIT` constant shared with password reset)
- ⚠️ Same rate limit constant is used for verification resend AND password reset — a user doing 5 password resets blocks verification resend
- ✅ Prevents email enumeration — always returns success message regardless of email existence

### Issues
- ⚠️ **No cleanup of expired verification tokens** — the retention job doesn't purge `email_verification_tokens`
- ⚠️ **No per-user rate limit** — only IP-based. An attacker with multiple IPs could spam a single user's inbox

---

## 5. Password Reset

### Token Security
- ✅ **Cryptographically random** — `jwt::generate_random_token()`
- ✅ **Time-limited** — expires after 1 hour (`Duration::hours(1)`)
- ✅ **Single-use** — marked `used = true` after reset
- ✅ **Stored as hash** — only hash in DB

### Old Password Required?
- **❌ No** — password reset does not require old password (by design — it's a "forgot password" flow)
- Password *change* (`PUT /password`) does require current password ✅

### Cooldown Between Resets
- **❌ No cooldown** — only IP-based rate limit (5/hour/IP)
- No per-user cooldown between reset requests
- No limit on total number of active reset tokens per user

### Session Invalidation After Reset
- ✅ **All refresh tokens revoked** — `UPDATE refresh_tokens SET revoked = true WHERE customer_id = $1`
- ⚠️ **Active JWT access tokens NOT invalidated** — JWTs are stateless and valid until expiry (24 hours)
- After password reset, a stolen JWT remains valid for up to 24 hours

### Issues
- ⚠️ **No cleanup of expired password reset tokens** — same as verification tokens
- ⚠️ **Multiple active reset tokens possible** — each forgot-password request creates a new token without invalidating previous ones

---

## 6. Webhook Failure Notifications

### User Notification on Webhook Failure
- ✅ **Yes** — `send_delivery_failed_email` in `email.rs` sends email to user
- ✅ **FCM push notification** — `notify_delivery_failed` in `notifications/mod.rs`
- ✅ **In-app notification** — stored in `notifications` table

### Threshold Before Notification
- **❌ No threshold** — every single failure triggers a notification
- No configurable threshold like "notify after 3 consecutive failures"
- This could cause **notification spam** during outages

### User-Configurable Preferences
- ✅ **Notification preferences table exists** — `notification_preferences`
- Fields: `email_on_failure`, `email_on_dead_letter`, `email_on_success`, `slack_webhook_url`, `discord_webhook_url`, `webhook_url`
- ✅ API to read/update preferences: `GET/PUT /v1/customer/notifications`
- ⚠️ **Preferences not actually wired** — the worker's `notify_delivery_failed` and `notify_delivery_success` functions in `notifications/mod.rs` do NOT check `notification_preferences` before sending
- ⚠️ **Slack/Discord webhook integration incomplete** — preferences store URLs but no code reads them to actually send Slack/Discord notifications

### Alert Rules
- ✅ Alert rules system exists — users can create rules with conditions (`failure_rate`, `latency`, `consecutive_failures`)
- Supports channels: `slack`, `email`, `webhook`
- ⚠️ **`test_alert` endpoint is a stub** — just returns `{"success": true}` without actually sending anything
- ⚠️ **No code found that evaluates alert rules against delivery data** — the alert rule engine appears to be CRUD-only without evaluation logic

---

## 7. Additional Findings

### Worker Email Delivery
- The worker (`worker/src/delivery/mod.rs`) has a `deliver_email` function that can send webhook payloads via email as a delivery target type
- This is **duplicated code** — it re-implements the Gmail OAuth2 flow instead of reusing `api/src/email.rs`'s `GCloudEmailClient`
- No token caching in worker — each email delivery creates a new access token

### Push Notifications (FCM)
- Uses **FCM Legacy HTTP API** — deprecated by Google in favor of FCM v1
- Sends to all device tokens of a customer (fan-out)
- Updates `last_used_at` on successful send
- No cleanup of stale device tokens (e.g., uninstalled apps)

### WebSocket Gateway
- Full-featured WebSocket implementation for real-time event streaming
- JWT auth, pattern-based subscriptions, heartbeat/ping-pong
- Reconnection with missed event replay
- **Not used for notification delivery** — only for webhook event streaming

---

## Summary of Issues by Severity

### 🔴 Critical
1. **Missing plain text fallback** — MIME declares `multipart/alternative` but only has HTML part (malformed MIME)
2. **XSS in email templates** — `endpoint_name` and `error_details` interpolated without HTML escaping in `send_delivery_failed_email`

### 🟠 High
3. **No email send retry** — fire-and-forget with no retry on failure
4. **Notification preferences not wired** — preferences table exists but delivery code ignores it
5. **Active JWTs not invalidated on password reset** — stolen tokens remain valid up to 24 hours
6. **No notification cleanup** — notifications accumulate indefinitely
7. **No webhook failure threshold** — every failure triggers a notification (spam risk)

### 🟡 Medium
8. **Duplicate Gmail OAuth2 code** in worker vs API
9. **FCM Legacy API** — deprecated, should migrate to FCM v1
10. **No per-user rate limits** — only IP-based, vulnerable to distributed attacks
11. **Multiple active password reset tokens** — no invalidation of previous tokens
12. **No expired token cleanup** — verification and reset tokens accumulate in DB
13. **Alert rule evaluation engine missing** — CRUD exists but no evaluation logic
14. **No email-level rate limiting** — no throttling on email sends
15. **Shared rate limit constant** for verification resend and password reset

### 🟢 Low
16. **No billing/email templates** for invoices
17. **Email templates not translated** — English only
18. **Inline template strings** — no template engine for maintainability
19. **No stale device token cleanup** for FCM
20. **No Slack/Discord integration** despite preferences storing webhook URLs
21. **No mobile viewport meta tag** in email templates
