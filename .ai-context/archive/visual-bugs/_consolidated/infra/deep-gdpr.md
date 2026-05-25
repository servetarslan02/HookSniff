# 🔒 HookSniff — Deep GDPR & Data Privacy Compliance Audit

**Date:** 2026-05-10  
**Scope:** Full codebase audit (API, Dashboard, Database migrations)  
**Regulation Focus:** EU GDPR (General Data Protection Regulation)

---

## Executive Summary

HookSniff demonstrates **strong foundational GDPR compliance** with dedicated Article 15 (data export) and Article 17 (account deletion) endpoints, a comprehensive privacy policy, and AES-256-GCM encryption for secrets. However, several **critical and high-severity gaps** exist that need remediation before claiming full GDPR compliance.

**Overall Rating:** 🟡 **Partial Compliance** — good bones, missing key operational controls

---

## 1. Data Collection & Minimization

### PII Collected

| Field | Table | Classification | Necessary? |
|-------|-------|---------------|------------|
| `email` | customers | **PII** | ✅ Yes (auth, notifications) |
| `name` | customers | **PII** | ✅ Optional, user-provided |
| `password_hash` | customers | **Sensitive** | ✅ Yes (auth) |
| `api_key_hash` | customers | **Sensitive** | ✅ Yes (API auth) |
| `api_key_prefix` | customers | **Low-risk** | ✅ Yes (key identification) |
| `totp_secret` | customers | **Sensitive** | ✅ Yes (2FA) |
| `stripe_customer_id` | customers | **PII (financial)** | ⚠️ Partially (payment linkage) |
| `polar_customer_id` | customers | **PII (financial)** | ⚠️ Partially |
| `iyzico_customer_id` | customers | **PII (financial)** | ⚠️ Partially |
| `ip_address` | audit_log | **PII** | ✅ Yes (security audit) |
| `user_agent` | audit_log | **Low-risk PII** | ⚠️ Potentially excessive |
| `slack_webhook_url` | notification_preferences | **Low-risk** | ✅ Yes |
| `discord_webhook_url` | notification_preferences | **Low-risk** | ✅ Yes |
| `source_ip` | deliveries | **PII** | ⚠️ Potentially excessive |
| `request_headers` | deliveries | **Potentially PII** | ⚠️ May contain PII |
| `payload` (webhook data) | deliveries, dead_letters | **User data** | ✅ Yes (core service) |
| Device tokens (FCM) | device_tokens | **Low-risk** | ✅ Yes (push notifications) |
| `email` (invite) | team_invites | **PII** | ✅ Yes (team collaboration) |

### Findings

- **✅ Good:** `totp_secret` is excluded from serialization (`#[serde(skip_serializing)]`)
- **✅ Good:** API keys stored as Argon2id hashes, not plaintext
- **⚠️ Issue:** `source_ip` and `request_headers` in deliveries may capture end-user PII without consent
- **⚠️ Issue:** `user_agent` in audit_log is potentially excessive for data minimization
- **⚠️ Issue:** `request_headers` JSONB field could contain cookies, auth tokens, or other PII from webhook source requests

### Severity: 🟡 MEDIUM

---

## 2. Consent Management

### Findings

- **🔴 CRITICAL: No consent mechanism at registration.** The `register` endpoint (`POST /v1/auth/register`) creates accounts without:
  - Accepting Terms of Service
  - Accepting Privacy Policy
  - Cookie consent
  - Any form of explicit consent logging

- **🔴 CRITICAL: No consent logging.** There is no `consent_records` table or any mechanism to track when/how consent was given.

- **⚠️ No cookie consent banner.** The dashboard uses cookies (`hooksniff_token`, `hooksniff_refresh`) but has no cookie consent mechanism. The privacy policy mentions "Essential cookies" and "Analytics cookies" but there's no opt-in/opt-out UI.

- **⚠️ No withdrawal of consent mechanism.** Users cannot selectively withdraw consent for specific processing activities.

### What's Missing

1. **Registration form must include:**
   - Checkbox: "I agree to the Terms of Service and Privacy Policy" (with links)
   - Checkbox: "I consent to receive service-related emails" (optional, GDPR requires explicit consent for marketing)
   
2. **Consent records table needed:**
   ```sql
   CREATE TABLE consent_records (
       id UUID PRIMARY KEY,
       customer_id UUID NOT NULL,
       consent_type VARCHAR(50) NOT NULL, -- 'terms', 'privacy', 'marketing', 'analytics'
       granted BOOLEAN NOT NULL,
       ip_address VARCHAR(45),
       user_agent TEXT,
       created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   ```

3. **Cookie consent banner** for non-essential cookies (analytics)

### Severity: 🔴 CRITICAL

---

## 3. Right to Access (Article 15) — Data Export

### Implementation

**Endpoint:** `GET /v1/auth/export` (auth.rs:830–875)

### What's Exported

| Data | Included? | Notes |
|------|-----------|-------|
| Account info (id, email, name, plan) | ✅ Yes | |
| Endpoints | ✅ Yes | Full endpoint data |
| Deliveries (last 90 days, max 10,000) | ✅ Yes | Limited by time/count |
| API keys (prefixes only) | ✅ Yes | Hashes excluded (correct) |
| Audit log | ❌ **No** | Missing |
| Notification preferences | ❌ **No** | Missing |
| Device tokens | ❌ **No** | Missing |
| Teams/team membership | ❌ **No** | Missing |
| SSO configs | ❌ **No** | Missing |
| Custom domains | ❌ **No** | Missing |
| Portal configs | ❌ **No** | Missing |
| Payment transactions | ❌ **No** | Missing |
| Invoices | ❌ **No** | Missing |
| Dead letters | ❌ **No** | Missing |
| Password reset tokens | ❌ **No** | (acceptable - ephemeral) |
| 2FA status | ❌ **No** | Should include `totp_enabled` |

### Issues

- **🔴 HIGH: Incomplete export.** Multiple tables with user data are not included. GDPR Article 15 requires a **complete** copy of all personal data.
- **🟡 MEDIUM: Delivery limit.** 10,000 records / 90 days may not be sufficient for high-volume users. Should offer full export.
- **🟡 MEDIUM: No dashboard UI.** Export is API-only. No "Download My Data" button in settings. Users must know the API.
- **🟡 MEDIUM: Export format.** Returns JSON only. Should also offer CSV for portability (GDPR Article 20).
- **🟡 LOW: No export request logging.** The export is logged (`tracing::info!`) but not in the audit_log table.

### Severity: 🔴 HIGH

---

## 4. Right to Erasure (Article 17) — Account Deletion

### Implementation

**Endpoint:** `DELETE /v1/auth/account` (auth.rs:893–998)

### What's Deleted

| Table | Deleted? | Notes |
|-------|----------|-------|
| delivery_attempts | ✅ Yes | Via delivery_id subquery |
| deliveries | ✅ Yes | |
| endpoints | ✅ Yes | |
| api_keys | ✅ Yes | |
| refresh_tokens | ✅ Yes | |
| password_reset_tokens | ✅ Yes | |
| email_verification_tokens | ✅ Yes | |
| notifications | ✅ Yes | |
| devices | ✅ Yes | |
| installed_agents | ✅ Yes | |
| payment_transactions | ✅ Yes | ⚠️ May conflict with legal retention requirements |
| invoices | ✅ Yes | ⚠️ May conflict with legal retention requirements |
| audit_log | ✅ Yes | ⚠️ May conflict with security audit requirements |
| sso_configs | ✅ Yes | |
| custom_domains | ✅ Yes | |
| portal_configs | ✅ Yes | |
| customers | ✅ Yes | |

### Missing Deletions

| Table | Deleted? | Impact |
|-------|----------|--------|
| **dead_letters** | ❌ **No** | Contains webhook payloads — PII leak |
| **notification_preferences** | ❌ **No** | Contains webhook URLs |
| **rate_limit_configs** | ❌ **No** | Via endpoint CASCADE — may be OK |
| **teams (owned)** | ❌ **No** | Team data persists after owner deletion |
| **team_members** | ❌ **No** | Membership records persist |
| **team_invites** | ❌ **No** | Email addresses in invites persist |

### Critical Issues

- **🔴 CRITICAL: `dead_letters` not deleted.** This table stores webhook payloads (which may contain PII) and is NOT cleaned up on account deletion. The `archive_deliveries` function in `retention.rs` moves deliveries to `dead_letters` but the deletion handler doesn't touch it.

- **🔴 HIGH: Dashboard calls wrong endpoint.** The settings page calls `api.delete('/auth/me')` but the backend route is `DELETE /v1/auth/account`. This means **account deletion from the dashboard is broken** (404 error).

- **🟡 MEDIUM: No grace period.** Deletion is immediate and permanent. GDPR recommends a grace period (e.g., 30 days) for accidental deletions. The Terms of Service mention "within 30 days" but the code deletes immediately.

- **🟡 MEDIUM: Backup handling.** No mention of how backups are handled. GDPR requires that deletion propagates to backups within a reasonable timeframe.

- **🟡 MEDIUM: Legal retention conflict.** Payment transactions and invoices are deleted, but the privacy policy states "Payment records: As required by law (typically 7 years)." These should be anonymized, not deleted.

### Severity: 🔴 CRITICAL

---

## 5. Data Retention

### Retention Job Implementation

**File:** `api/src/jobs/retention.rs`

The retention job (`run_retention`) performs:
1. Archives delivered/failed deliveries to `dead_letters` (then deletes originals)
2. Cleans up expired idempotency keys
3. Cleans up processed webhook_queue items (>7 days)
4. Cleans up expired seen_webhooks
5. Resets monthly webhook counters

### Retention Configuration

- `RETENTION_DAYS` env var (configurable, default varies by plan)
- Privacy policy states: Free=7d, Pro=30d, Business=90d

### Issues

- **🔴 HIGH: `dead_letters` never cleaned up.** The `archive_deliveries` function moves data TO `dead_letters` but there is NO function to clean up `dead_letters` itself. Data accumulates indefinitely.

- **🔴 HIGH: No cleanup for auth tokens.** The following tables have no automatic cleanup:
  - `password_reset_tokens` — expired tokens persist (despite `expires_at` field)
  - `email_verification_tokens` — expired tokens persist
  - `refresh_tokens` — revoked/expired tokens persist
  - `team_invites` — expired invites persist

- **🟡 MEDIUM: `dead_letters` archival is counterproductive for GDPR.** Moving data to `dead_letters` before deletion creates a second copy of user data. The retention job should DELETE directly, not archive.

- **🟡 MEDIUM: No per-user retention controls.** Users cannot configure their own retention period (despite the privacy policy implying plan-based retention).

- **⚠️ LOW: No retention for audit_log.** Audit logs have no automatic cleanup.

### Severity: 🔴 HIGH

---

## 6. Data Processing & Third Parties

### Third-Party Data Sharing

| Third Party | Data Shared | Purpose | DPA in Place? |
|-------------|-------------|---------|---------------|
| **Google Cloud (Gmail API)** | Email addresses, names | Transactional emails | ❓ Unknown |
| **Stripe** | Payment info | Billing | ❓ Unknown |
| **Polar.sh** | Payment info | Billing (alt) | ❓ Unknown |
| **iyzico** | Payment info | Billing (Turkey) | ❓ Unknown |
| **Cloud hosting** | All data | Infrastructure | ❓ Unknown |
| **FCM (Firebase)** | Device tokens | Push notifications | ❓ Unknown |

### Issues

- **🔴 HIGH: No Data Processing Agreements (DPAs) visible in codebase.** GDPR Article 28 requires written agreements with all data processors.

- **🟡 MEDIUM: International data transfers.** The privacy policy mentions "Standard Contractual Clauses" but there's no evidence of:
  - Transfer Impact Assessments (TIAs)
  - EU-US Data Privacy Framework compliance
  - Specific safeguards for Turkish data processing (iyzico)

- **🟡 MEDIUM: Email via Gmail API.** User PII (email, name) is sent through Google's Gmail API. This constitutes data transfer to a third party and requires a DPA with Google.

- **⚠️ LOW: Webhook payloads forwarded to user-configured endpoints.** This is the core service function, but users should be informed that their webhook data is forwarded to third-party URLs they configure.

### Severity: 🔴 HIGH

---

## 7. Security Measures

### Encryption

| Data | At Rest | In Transit | Notes |
|------|---------|------------|-------|
| API keys | ✅ Argon2id hash | ✅ TLS | Excellent |
| Passwords | ✅ Argon2id hash | ✅ TLS | Excellent |
| TOTP secrets | ❌ **Plaintext** | ✅ TLS | Should be encrypted |
| SSO client secrets | ✅ AES-256-GCM | ✅ TLS | `crypto.rs` |
| Email addresses | ❌ **Plaintext** | ✅ TLS | Acceptable (need for lookup) |
| Payment provider IDs | ❌ **Plaintext** | ✅ TLS | ⚠️ Consider encryption |
| Webhook payloads | ❌ **Plaintext** | ✅ TLS | ⚠️ May contain sensitive data |
| Signing secrets | ❌ **Plaintext** | ✅ TLS | ⚠️ Should be encrypted |

### Issues

- **🟡 MEDIUM: TOTP secrets stored in plaintext.** The `totp_secret` field in the `customers` table is not encrypted at rest. While excluded from API serialization, a database breach would expose all 2FA secrets.

- **🟡 MEDIUM: Signing secrets stored in plaintext.** Endpoint `signing_secret` values are stored without encryption.

- **🟡 MEDIUM: Webhook payloads stored in plaintext.** The `payload` JSONB field in `deliveries` and `dead_letters` may contain sensitive user data (PII, financial data, health data depending on use case).

- **✅ Good:** TLS enforced (all cookies have `Secure` flag)
- **✅ Good:** HttpOnly cookies for auth tokens
- **✅ Good:** SameSite cookie policy
- **✅ Good:** Rate limiting on auth endpoints
- **✅ Good:** Argon2id for password/API key hashing
- **✅ Good:** AES-256-GCM encryption module exists (`crypto.rs`)

### Access Logging

- **🟡 MEDIUM: Audit log exists but underused.** The `audit_log` table (migration 038) is created but there's no evidence it's populated for all sensitive operations. Auth events are logged via `tracing::info!` but not to the audit_log table.

- **⚠️ PII in application logs.** Multiple `tracing::info!` calls log user emails:
  - `"✅ New customer registered: {}"` — logs email
  - `"✅ Customer logged in: {}"` — logs email
  - `"📧 Password reset email sent to: {}"` — logs email
  
  These should log customer IDs instead.

### Breach Notification

- **🔴 HIGH: No breach notification procedure.** GDPR Article 33/34 requires:
  - 72-hour notification to supervisory authority
  - Notification to affected individuals without undue delay
  - No code or documentation for breach response

### Severity: 🟡 MEDIUM

---

## 8. Privacy Policy Assessment

### Coverage

| Topic | Covered? | Accurate? |
|-------|----------|-----------|
| Data collected | ✅ Yes | ✅ Mostly accurate |
| Purpose of processing | ✅ Yes | ✅ Accurate |
| Data sharing | ✅ Yes | ✅ Lists Stripe/Polar/iyzico |
| Data retention periods | ✅ Yes | ⚠️ Claims differ from implementation |
| User rights (access, delete, export) | ✅ Yes | ⚠️ Export is incomplete |
| Cookie usage | ✅ Yes | ⚠️ No cookie consent mechanism |
| International transfers | ✅ Yes | ⚠️ Vague on specifics |
| Contact information | ✅ Yes | ✅ |
| Children's privacy | ✅ Yes | ✅ |
| Changes notification | ✅ Yes | ✅ |

### Inaccuracies

- **🔴 HIGH: API key hashing claim is wrong.** Privacy policy states "API keys are hashed before storage (SHA-256)" but the code uses **Argon2id** (which is better, but the policy is inaccurate).

- **🟡 MEDIUM: Retention policy claims vs. reality.** The privacy policy states different retention periods per plan (7/30/90 days) but the actual retention is controlled by a single `RETENTION_DAYS` env var, not per-plan.

- **🟡 MEDIUM: "Analytics cookies" mentioned but no analytics implementation found.** The privacy policy mentions analytics cookies that "can be disabled" but there's no cookie consent UI or analytics opt-out mechanism.

- **🟡 MEDIUM: Missing DPO information.** No Data Protection Officer is mentioned (may be required depending on scale).

- **⚠️ LOW: Privacy policy is static text, not translation-aware.** Uses `useTranslations('privacy')` for nav/title but body content is hardcoded English.

### Severity: 🟡 MEDIUM

---

## 9. Additional GDPR Concerns

### Data Portability (Article 20)

- **🟡 MEDIUM:** Export is JSON-only. GDPR recommends machine-readable, commonly used formats. CSV should be offered as an alternative.

### Right to Rectification (Article 16)

- **✅ Good:** Users can update name and email via `PUT /v1/auth/profile`
- **⚠️ LOW:** No audit trail for profile changes (audit_log not populated for this)

### Data Protection by Design (Article 25)

- **✅ Good:** `totp_secret` excluded from serialization
- **✅ Good:** API key hashes used instead of plaintext
- **✅ Good:** HttpOnly, Secure cookies
- **⚠️ Missing:** No privacy impact assessments (PIAs) documented

### Data Protection Officer (Article 37)

- **🟡 MEDIUM:** No DPO designated. May be required if processing is large-scale or involves special categories of data.

---

## 10. Summary of Critical Issues

| # | Issue | Severity | GDPR Article |
|---|-------|----------|-------------|
| 1 | No consent mechanism at registration | 🔴 CRITICAL | Art. 6, 7 |
| 2 | No consent logging | 🔴 CRITICAL | Art. 7 |
| 3 | `dead_letters` not deleted on account deletion | 🔴 CRITICAL | Art. 17 |
| 4 | Dashboard calls wrong deletion endpoint (`/auth/me` vs `/auth/account`) | 🔴 HIGH | Art. 17 |
| 5 | Data export incomplete (missing 8+ tables) | 🔴 HIGH | Art. 15 |
| 6 | `dead_letters` accumulates indefinitely | 🔴 HIGH | Art. 5(1)(e) |
| 7 | No cleanup for expired auth tokens | 🔴 HIGH | Art. 5(1)(e) |
| 8 | No Data Processing Agreements visible | 🔴 HIGH | Art. 28 |
| 9 | No breach notification procedure | 🔴 HIGH | Art. 33, 34 |
| 10 | Privacy policy inaccuracies (hashing algorithm) | 🟡 MEDIUM | Art. 12-14 |
| 11 | TOTP secrets stored in plaintext | 🟡 MEDIUM | Art. 32 |
| 12 | PII in application logs (emails) | 🟡 MEDIUM | Art. 5(1)(f) |
| 13 | No dashboard UI for data export | 🟡 MEDIUM | Art. 12 |
| 14 | No cookie consent mechanism | 🟡 MEDIUM | Art. 6, ePrivacy |
| 15 | Teams not cleaned up on deletion | 🟡 MEDIUM | Art. 17 |

---

## 11. Remediation Roadmap

### Phase 1 — Critical (Week 1-2)

1. **Add consent to registration:**
   - Add ToS/Privacy Policy acceptance checkbox
   - Create `consent_records` table
   - Log all consent grants/withdrawals

2. **Fix account deletion:**
   - Fix dashboard endpoint mismatch (`/auth/me` → `/auth/account`)
   - Add `dead_letters` deletion to the cascade
   - Add `notification_preferences`, `teams`, `team_members`, `team_invites` deletion

3. **Fix data export:**
   - Add all missing tables to export
   - Add "Download My Data" button in dashboard settings

### Phase 2 — High Priority (Week 3-4)

4. **Implement retention cleanup:**
   - Add `dead_letters` cleanup to retention job
   - Add expired token cleanup (password_reset, email_verification, refresh_tokens)
   - Consider archiving payments/invoices instead of deleting

5. **Data Processing Agreements:**
   - Execute DPAs with Google Cloud, Stripe/Polar/iyzico, hosting provider
   - Document all third-party data flows

6. **Breach notification procedure:**
   - Document incident response plan
   - Create breach notification templates
   - Establish 72-hour notification workflow

### Phase 3 — Medium Priority (Month 2)

7. **Encrypt sensitive fields at rest:**
   - TOTP secrets → AES-256-GCM
   - Signing secrets → AES-256-GCM
   - Consider encrypting webhook payloads

8. **Fix privacy policy:**
   - Correct SHA-256 → Argon2id claim
   - Add DPO contact (if required)
   - Make retention periods match implementation

9. **Reduce PII in logs:**
   - Replace email logging with customer ID logging
   - Implement structured audit logging to `audit_log` table

10. **Cookie consent:**
    - Implement cookie consent banner
    - Add analytics opt-out if analytics are used

---

## 12. What's Done Well

Despite the gaps, HookSniff has solid foundations:

- ✅ **Dedicated GDPR endpoints** (export + deletion) — many SaaS products don't have these
- ✅ **Comprehensive deletion cascade** covering 15+ tables
- ✅ **Password-protected deletion** (prevents unauthorized account wipes)
- ✅ **Argon2id for secrets** (industry best practice)
- ✅ **AES-256-GCM encryption module** ready for use
- ✅ **HttpOnly + Secure cookies** (XSS-resistant auth)
- ✅ **Rate limiting** on all auth endpoints
- ✅ **TOTP secret excluded** from API serialization
- ✅ **Privacy policy** covers all major GDPR topics
- ✅ **Retention job** exists (needs expansion)
- ✅ **ON DELETE CASCADE** on foreign keys (database-level cleanup)

---

*Report generated by deep GDPR audit — 2026-05-10*
