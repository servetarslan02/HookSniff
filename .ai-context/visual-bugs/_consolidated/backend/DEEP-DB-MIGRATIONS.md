# 🗄️ HookSniff Database Migration Deep Audit Report

> **Audit Date:** 2026-05-10
> **Auditor:** Deep-DB-Migrations Agent
> **Scope:** All SQL migrations + embedded Rust migrations in `api/src/db.rs`

---

## Table of Contents

1. [Migration Inventory](#1-migration-inventory)
2. [Schema Analysis — Per Table](#2-schema-analysis--per-table)
3. [Performance Issues](#3-performance-issues)
4. [Security Issues](#4-security-issues)
5. [Data Integrity Issues](#5-data-integrity-issues)
6. [GDPR Compliance](#6-gdpr-compliance)
7. [Critical Findings Summary](#7-critical-findings-summary)

---

## 1. Migration Inventory

### Two Competing Migration Systems ⚠️ CRITICAL

HookSniff has **two separate migration systems** that are **out of sync**:

| System | Location | Format | Purpose |
|--------|----------|--------|---------|
| **Standalone SQL** | `migrations/*.sql` (26 files) | Raw `.sql` | CockroachDB / external runner |
| **Embedded Rust** | `api/src/db.rs` (43 steps) | Rust string literals | PostgreSQL production migrations |

**The embedded `db.rs` migrations are the authoritative production schema.** The standalone SQL files are incomplete, use CockroachDB-specific `STRING` types (vs PostgreSQL `TEXT`), and have a massive gap (013–025 missing).

#### Standalone SQL Files (26 files)
```
001_initial.sql
002_security_features.sql
003_routing.sql
004_teams.sql
005_event_mesh.sql
006_industry.sql
007_notifications.sql
008_add_admin_and_profile.sql
009_payment_providers.sql
010_reaper_index.sql
011_listen_notify.sql
012_trace_id.sql
026_response_headers.sql
027_deliveries_updated_at_error.sql
028_invoices.sql
029_free_tier_10k.sql
030_password_reset_tokens.sql
031_email_verification.sql
032_refresh_tokens.sql
033_totp_2fa.sql
034_device_tokens.sql
035_test_mode.sql
037_notification_preferences.sql
038_backend_endpoints.sql
```

#### Embedded Rust Migrations (db.rs — 43 steps)
```
001_initial_schema       → customers, endpoints, deliveries, delivery_attempts,
                           dead_letters, idempotency_keys
002_add_password_hash    → customers.password_hash
003_add_endpoint_security_columns → endpoints.allowed_ips, event_filter, custom_headers
004_add_secret_rotation  → endpoints.old_signing_secret, secret_rotated_at
005_add_retry_policy     → endpoints.retry_policy
006_routing              → endpoints routing columns + index
007_fifo_ordering        → endpoints FIFO columns + deliveries.sequence_num, fifo_group_id
008_endpoint_throttling  → endpoints throttle columns
009_webhook_queue        → webhook_queue table
010_add_endpoint_format  → endpoints.format
011_seen_webhooks        → seen_webhooks table
012_retry_policies       → retry_policies table
013_transform_rules      → transform_rules table
014_event_schemas        → event_schemas table
015_api_keys             → api_keys table
016_alert_rules          → alert_rules table
017_ai_center            → ai_events, risk_scores, ai_actions, ai_blocklist
018_ai_agents            → ai_agents, ai_agent_executions, ai_agent_configs
019_marketplace          → marketplace_agents, installed_agents
020_fifo_queue           → fifo_queue table
021_delivery_targets     → delivery_targets, fanout_rules tables
022_stripe_columns       → customers.stripe_customer_id, stripe_subscription_id
023_updated_at_webhook_queue → webhook_queue.updated_at + trigger
024_listen_notify        → NOTIFY trigger on webhook_queue
025_trace_id             → webhook_queue.trace_id, delivery_attempts.trace_id
026_response_headers     → delivery_attempts.response_headers
027_deliveries_updated_at_error → deliveries.updated_at, error_message + trigger
028_invoices             → invoices table
029_payment_transactions → payment_transactions table
030_customer_payment_columns → customers payment provider columns + updated_at
031_remove_signing_secret_from_queue → webhook_queue signing_secret removal
032_teams                → teams, team_members, team_invites tables
033_notifications        → notifications table
034_idempotency_body_hash → idempotency_keys.body_hash
035_customer_missing_columns → customers.is_active, is_admin, name
036_inbound_configs      → inbound_configs table
037_notification_preferences → notification_preferences table
038_email_verified_totp  → customers.email_verified, totp_secret, totp_enabled
039_password_reset_tokens → password_reset_tokens table
040_email_verification_tokens → email_verification_tokens table
041_refresh_tokens       → refresh_tokens table
042_device_tokens        → device_tokens table
043_test_mode            → deliveries.is_test, webhook_queue.is_test
```

---

## 2. Schema Analysis — Per Table

### 2.1 `customers` (Core)

**Final columns (after all migrations):**
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | ✅ PK |
| email | TEXT | NO | — | ✅ UNIQUE |
| api_key_hash | TEXT | NO | — | ⚠️ No UNIQUE in db.rs (unlike standalone) |
| api_key_prefix | TEXT | NO | — | — |
| plan | TEXT | NO | 'free' | ❌ No CHECK constraint |
| webhook_limit | INT | NO | 10000 | ⚠️ INT overflow risk at high volumes |
| webhook_count | INT | NO | 0 | ⚠️ INT overflow risk; no monthly auto-reset in DB |
| created_at | TIMESTAMPTZ | NO | now() | ✅ |
| password_hash | TEXT | YES | NULL | ✅ Nullable for OAuth users |
| stripe_customer_id | TEXT | YES | NULL | ✅ |
| stripe_subscription_id | TEXT | YES | NULL | ✅ |
| payment_provider | TEXT | NO | 'stripe' | ❌ No CHECK constraint |
| polar_customer_id | TEXT | YES | NULL | ✅ |
| polar_subscription_id | TEXT | YES | NULL | ✅ |
| iyzico_customer_id | TEXT | YES | NULL | ✅ |
| iyzico_subscription_id | TEXT | YES | NULL | ✅ |
| updated_at | TIMESTAMPTZ | NO | now() | ⚠️ No auto-update trigger! |
| is_active | BOOL | NO | true | ✅ |
| is_admin | BOOL | NO | false | ✅ |
| name | TEXT | YES | NULL | ✅ |
| email_verified | BOOL | NO | false | ✅ |
| totp_secret | TEXT | YES | NULL | ❌ Plaintext! Should be encrypted |
| totp_enabled | BOOL | NO | false | ✅ |

**Issues:**
- ❌ `updated_at` has no auto-update trigger (unlike `deliveries` and `webhook_queue`)
- ❌ `totp_secret` stored in **plaintext** — 2FA secrets MUST be encrypted at rest
- ❌ `plan` has no CHECK constraint — any string accepted
- ❌ `webhook_limit` is INT (max 2,147,483,647) — fine for now but inconsistent with BIGINT usage elsewhere
- ⚠️ `api_key_hash` UNIQUE constraint present in standalone SQL but not in db.rs embedded migration

---

### 2.2 `endpoints`

**Final columns:**
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | ✅ PK |
| customer_id | UUID | NO | — | ✅ FK→customers CASCADE |
| url | TEXT | NO | — | ❌ No URL format validation |
| description | TEXT | YES | NULL | ✅ |
| is_active | BOOL | NO | true | ✅ |
| signing_secret | TEXT | NO | — | ❌ Plaintext! Should be encrypted |
| created_at | TIMESTAMPTZ | NO | now() | ✅ |
| allowed_ips | JSONB | YES | NULL | ✅ |
| event_filter | TEXT[] | YES | NULL | ✅ |
| custom_headers | JSONB | YES | NULL | ✅ |
| old_signing_secret | TEXT | YES | NULL | ❌ Plaintext |
| secret_rotated_at | TIMESTAMPTZ | YES | NULL | ✅ |
| retry_policy | JSONB | YES | NULL | ✅ |
| routing_strategy | TEXT | NO | 'round-robin' | ❌ No CHECK constraint |
| fallback_url | TEXT | YES | NULL | ✅ |
| avg_response_ms | INT | NO | 0 | ✅ |
| failure_streak | INT | NO | 0 | ✅ |
| last_failure_at | TIMESTAMPTZ | YES | NULL | ✅ |
| fifo_enabled | BOOL | NO | false | ✅ |
| fifo_sequence | BIGINT | NO | 0 | ✅ |
| fifo_group_by_customer | BOOL | NO | false | ✅ |
| fifo_max_wait_secs | INT | NO | 300 | ✅ |
| throttle_rate | INT | YES | NULL | ✅ |
| throttle_period_secs | INT | NO | 60 | ✅ |
| throttle_strategy | TEXT | NO | 'sliding_window' | ❌ No CHECK constraint |
| format | TEXT | NO | 'standard' | ❌ No CHECK constraint |

**Issues:**
- ❌ `signing_secret` stored in **plaintext** — this is the webhook HMAC signing secret!
- ❌ `old_signing_secret` also plaintext — defeats purpose of rotation
- ❌ No `updated_at` column — can't track endpoint modifications
- ❌ No CHECK constraints on `routing_strategy`, `format`, `throttle_strategy`
- ⚠️ `ip_whitelist` (from standalone 002) vs `allowed_ips` (from db.rs 003) — naming conflict between systems

---

### 2.3 `deliveries` (High-volume)

**Final columns:**
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | ✅ PK |
| endpoint_id | UUID | NO | — | ✅ FK→endpoints CASCADE |
| customer_id | UUID | NO | — | ✅ FK→customers CASCADE |
| payload | JSONB | NO | — | ✅ |
| event_type | TEXT | YES | NULL | — |
| status | TEXT | NO | 'pending' | ❌ No CHECK constraint |
| attempt_count | INT | NO | 0 | ✅ |
| max_attempts | INT | NO | 3 | ✅ |
| last_attempt_at | TIMESTAMPTZ | YES | NULL | ✅ |
| response_status | INT | YES | NULL | ✅ |
| response_body | TEXT | YES | NULL | ✅ |
| next_retry_at | TIMESTAMPTZ | YES | NULL | ✅ |
| replay_count | INT | NO | 0 | ✅ |
| created_at | TIMESTAMPTZ | NO | now() | ✅ |
| sequence_num | BIGINT | YES | NULL | ✅ |
| fifo_group_id | TEXT | YES | NULL | ✅ |
| updated_at | TIMESTAMPTZ | NO | now() | ✅ Has auto-update trigger |
| error_message | TEXT | YES | NULL | ✅ |
| is_test | BOOL | NO | false | ✅ |

**Issues:**
- ❌ `status` has no CHECK constraint — any string accepted ('pending', 'delivered', 'failed', 'dead_letter', etc.)
- ⚠️ No `updated_at` until migration 027 — was missing for most of schema life
- ⚠️ High-volume table with no partitioning strategy

---

### 2.4 `webhook_queue` (High-volume, no FK)

**Final columns:**
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | ✅ PK |
| delivery_id | UUID | NO | — | ❌ **NO FOREIGN KEY** |
| endpoint_id | UUID | NO | — | ❌ **NO FOREIGN KEY** |
| endpoint_url | TEXT | NO | — | — |
| payload | TEXT | NO | — | ⚠️ TEXT not JSONB |
| custom_headers | JSONB | YES | NULL | ✅ |
| attempt_count | INT | NO | 0 | ✅ |
| max_attempts | INT | NO | 3 | ✅ |
| next_retry_at | TIMESTAMPTZ | YES | NULL | ✅ |
| status | TEXT | NO | 'pending' | ❌ No CHECK constraint |
| trace_id | VARCHAR(64) | YES | NULL | ✅ |
| created_at | TIMESTAMPTZ | NO | now() | ✅ |
| processed_at | TIMESTAMPTZ | YES | NULL | ✅ |
| updated_at | TIMESTAMPTZ | NO | now() | ✅ Has auto-update trigger |
| is_test | BOOL | NO | false | ✅ |

**Issues:**
- ❌ **NO FOREIGN KEY on `delivery_id`** — orphaned records if delivery is deleted
- ❌ **NO FOREIGN KEY on `endpoint_id`** — orphaned records if endpoint is deleted
- ❌ `status` has no CHECK constraint
- ⚠️ `payload` is TEXT not JSONB — inconsistent with `deliveries.payload` (JSONB)
- ⚠️ VARCHAR(64) for trace_id vs TEXT everywhere else — type inconsistency

---

### 2.5 `delivery_attempts`

**Final columns:**
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | ✅ PK |
| delivery_id | UUID | NO | — | ✅ FK→deliveries CASCADE |
| attempt_number | INT | NO | — | — |
| status_code | INT | YES | NULL | ✅ |
| response_body | TEXT | YES | NULL | ✅ |
| duration_ms | INT | YES | NULL | ✅ |
| error_message | TEXT | YES | NULL | ✅ |
| trace_id | VARCHAR(64) | YES | NULL | ✅ |
| created_at | TIMESTAMPTZ | NO | now() | ✅ |
| response_headers | JSONB | YES | NULL | ✅ |

**Issues:**
- ❌ No `updated_at` — immutable (OK for audit records, but inconsistent)
- ⚠️ `attempt_number` has no UNIQUE constraint per delivery_id

---

### 2.6 `dead_letters`

**Final columns (db.rs version):**
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | ✅ PK |
| delivery_id | UUID | NO | — | ❌ **NO FK** (intentional — source deleted) |
| endpoint_id | UUID | NO | — | ❌ **NO FK** |
| customer_id | UUID | NO | — | ❌ **NO FK** |
| payload | JSONB | NO | — | ✅ |
| reason | TEXT | YES | NULL | ✅ |
| attempts | INT | NO | 0 | ✅ |
| created_at | TIMESTAMPTZ | NO | now() | ✅ |

**Issues:**
- ❌ **No foreign keys at all** — intentional (archive table) but means no referential integrity
- ❌ No index on `endpoint_id` — slow queries filtering by endpoint
- ❌ No index on `created_at` — slow retention/archival queries
- ⚠️ Standalone SQL version HAS FKs (delivery_id→deliveries, endpoint_id→endpoints, customer_id→customers) — inconsistent

---

### 2.7 `idempotency_keys`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| key | TEXT | NO | — | ✅ PK |
| customer_id | UUID | NO | — | ⚠️ No FK in db.rs (FK in standalone) |
| response_body | JSONB | NO | — | ✅ |
| status_code | INT | NO | — | ✅ |
| created_at | TIMESTAMPTZ | NO | now() | ✅ |
| expires_at | TIMESTAMPTZ | NO | — | ✅ |
| body_hash | TEXT | YES | NULL | ✅ Added in 034 |

**Issues:**
- ⚠️ PK is TEXT (not UUID) — slower index lookups
- ❌ No FK on `customer_id` in db.rs version
- ⚠️ Cleanup relies on code, not DB-level expiration

---

### 2.8 `teams` / `team_members` / `team_invites`

**teams:**
- ✅ PK: UUID, FK on owner_id→customers CASCADE
- ❌ No `updated_at` auto-update trigger in db.rs (has one in standalone)
- Wait, checking again... db.rs step 032 DOES create `trg_teams_updated_at` trigger. ✅

**team_members:**
- ✅ UNIQUE(team_id, customer_id) composite constraint
- ✅ CHECK-like via role default 'viewer' but no CHECK constraint on role values

**team_invites:**
- ✅ UNIQUE on token
- ❌ No cleanup of expired invites (relies on code)

---

### 2.9 `payment_transactions`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | ✅ PK |
| customer_id | UUID | NO | — | ✅ FK→customers CASCADE |
| provider | TEXT | NO | 'stripe' | ❌ No CHECK constraint |
| provider_tx_id | TEXT | YES | NULL | — |
| amount_cents | BIGINT | NO | 0 | ✅ (db.rs uses BIGINT, standalone uses INT!) |
| currency | TEXT | NO | 'USD' | ❌ No CHECK constraint |
| status | TEXT | NO | 'completed' | ❌ No CHECK constraint |
| plan | TEXT | NO | 'free' | ❌ No CHECK constraint |
| created_at | TIMESTAMPTZ | NO | now() | ✅ |

**Issues:**
- ⚠️ `amount_cents` is BIGINT in db.rs but INT in standalone — inconsistency
- ❌ No CHECK constraints on status, provider, currency
- ❌ No `updated_at` column
- ❌ No UNIQUE on (provider, provider_tx_id) — possible duplicate transactions

---

### 2.10 `invoices`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | ✅ PK |
| customer_id | UUID | NO | — | ✅ FK→customers CASCADE |
| amount_cents | INT | NO | 0 | ⚠️ INT (should be BIGINT for money) |
| currency | TEXT | NO | 'usd' | ❌ No CHECK constraint |
| plan | TEXT | NO | 'free' | ❌ No CHECK constraint |
| status | TEXT | NO | 'paid' | ❌ No CHECK constraint |
| provider | TEXT | NO | 'stripe' | ❌ No CHECK constraint |
| provider_invoice_id | TEXT | YES | NULL | — |
| paid_at | TIMESTAMPTZ | YES | NULL | ✅ |
| created_at | TIMESTAMPTZ | NO | now() | ✅ |

**Issues:**
- ❌ `amount_cents` is INT — not BIGINT like payment_transactions (inconsistent)
- ❌ No UNIQUE on (provider, provider_invoice_id)
- ❌ No `updated_at`
- ❌ No CHECK constraints

---

### 2.11 Security/Auth Tables

#### `password_reset_tokens`, `email_verification_tokens`, `refresh_tokens`

All follow same pattern:
- ✅ UUID PK, FK→customers CASCADE
- ✅ `token_hash` TEXT NOT NULL
- ✅ `expires_at` TIMESTAMPTZ
- ✅ `used`/`revoked` BOOLEAN
- ❌ No automatic expiration enforcement (cleanup via code only)
- ❌ No partial index on unused tokens

#### `sso_configs` (from standalone 038)

- ❌ `client_secret_encrypted` — name suggests encryption but column is TEXT, unclear if actually encrypted
- ❌ `certificate` stored as plaintext TEXT

#### `api_keys` (from db.rs 015)

- ✅ `api_key_hash` indexed
- ❌ No UNIQUE constraint on `api_key_hash` — possible duplicate keys
- ⚠️ `last_used_at` tracking via code, not trigger

---

### 2.12 Tables Missing `updated_at`

| Table | Has updated_at? | Should have? |
|-------|----------------|--------------|
| customers | ✅ (added migration 030) | ✅ |
| endpoints | ❌ | ✅ (modified frequently) |
| delivery_attempts | ❌ | ⚠️ Immutable, OK |
| dead_letters | ❌ | ⚠️ Archive, OK |
| idempotency_keys | ❌ | ⚠️ Short-lived, OK |
| event_schemas | ❌ | ✅ (versioned) |
| api_keys | ❌ | ✅ (modified) |
| alert_rules | ❌ | ✅ (modified) |
| ai_events | ❌ | ⚠️ OK |
| ai_agents | ❌ | ✅ (modified) |
| marketplace_agents | ❌ | ✅ (modified) |
| webhook_templates | ❌ (standalone) | ✅ |
| industry_packages | ❌ (standalone) | ✅ |
| invoices | ❌ | ⚠️ OK (immutable) |
| password_reset_tokens | ❌ | ⚠️ OK |
| email_verification_tokens | ❌ | ⚠️ OK |
| refresh_tokens | ❌ | ⚠️ OK |

---

## 3. Performance Issues

### 3.1 Missing Indexes 🔴

| Table | Missing Index | Reason |
|-------|--------------|--------|
| `dead_letters` | `idx_dead_letters_created_at` | Retention archival queries filter by `created_at` |
| `dead_letters` | `idx_dead_letters_endpoint_id` | Dashboard filtering by endpoint |
| `deliveries` | `idx_deliveries_created_at` | Retention queries, dashboard pagination |
| `deliveries` | `idx_deliveries_customer_status` | Composite for `WHERE customer_id=$1 AND status=$2` |
| `webhook_queue` | `idx_webhook_queue_processed_at` | Cleanup query filters by `processed_at` |
| `delivery_attempts` | `idx_delivery_attempts_created_at` | Retention queries |
| `payment_transactions` | `idx_payment_transactions_created_at` | Reporting queries |
| `api_keys` | `idx_api_keys_hash_active` | Composite for `WHERE api_key_hash=$1 AND is_active=true` |
| `audit_log` | `idx_audit_log_resource` | `WHERE resource_type=$1 AND resource_id=$2` |
| `notifications` | `idx_notifications_type` | Filtering by notification type |

### 3.2 Composite Indexes Needed 🟡

```sql
-- deliveries: most common query pattern
CREATE INDEX idx_deliveries_customer_status_created
    ON deliveries(customer_id, status, created_at DESC);

-- webhook_queue: reaper query
CREATE INDEX idx_webhook_queue_status_updated
    ON webhook_queue(status, updated_at)
    WHERE status = 'processing';

-- api_keys: authentication lookup
CREATE INDEX idx_api_keys_hash_active
    ON api_keys(api_key_hash)
    WHERE is_active = true;
```

### 3.3 Partial Indexes 🟡

Existing partial indexes are good:
- ✅ `idx_deliveries_next_retry` WHERE status = 'pending'
- ✅ `idx_webhook_queue_pending` WHERE status = 'pending'
- ✅ `idx_endpoints_failure_streak` WHERE failure_streak > 0
- ✅ `idx_deliveries_is_test` WHERE is_test = true
- ✅ `idx_notifications_unread` WHERE is_read = FALSE
- ✅ `idx_webhook_queue_trace_id` WHERE trace_id IS NOT NULL

Missing partial indexes:
- `idx_refresh_tokens_active` WHERE revoked = false
- `idx_password_reset_tokens_unused` WHERE used = false
- `idx_email_verification_tokens_unused` WHERE used = false
- `idx_teams_active_members` (no meaningful boolean to filter on)

### 3.4 Table Partitioning 🔴

**`deliveries`** and **`webhook_queue`** are high-volume tables that will grow unboundedly.

**Recommendation:**
```sql
-- Range partition deliveries by created_at (monthly)
ALTER TABLE deliveries PARTITION BY RANGE (created_at);

-- Range partition webhook_queue by created_at (weekly for faster cleanup)
ALTER TABLE webhook_queue PARTITION BY RANGE (created_at);
```

### 3.5 Vacuum/Analyze Strategy ⚠️

- **No explicit VACUUM/ANALYZE configuration** found in any migration
- PostgreSQL autovacuum defaults apply, but high-churn tables (`deliveries`, `webhook_queue`) need tuning:
  ```sql
  ALTER TABLE deliveries SET (autovacuum_vacuum_scale_factor = 0.05);
  ALTER TABLE webhook_queue SET (autovacuum_vacuum_scale_factor = 0.05);
  ALTER TABLE delivery_attempts SET (autovacuum_vacuum_scale_factor = 0.05);
  ```

---

## 4. Security Issues

### 4.1 Row Level Security (RLS) 🔴

**RLS is completely absent.** Every table is accessible to any authenticated database user.

- No `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- No `CREATE POLICY` statements anywhere
- Application relies entirely on middleware auth for data isolation

**Risk:** If a SQL injection vulnerability exists, an attacker can access ALL customers' data.

### 4.2 Plaintext Secrets 🔴

| Table | Column | Risk |
|-------|--------|------|
| `customers` | `totp_secret` | **CRITICAL** — 2FA secret in plaintext |
| `endpoints` | `signing_secret` | **HIGH** — HMAC signing key in plaintext |
| `endpoints` | `old_signing_secret` | **HIGH** — Previous signing key in plaintext |
| `sso_configs` | `certificate` | **HIGH** — SAML certificate in plaintext |
| `sso_configs` | `client_secret_encrypted` | ⚠️ Name suggests encryption, but unverified |
| `notification_preferences` | `slack_webhook_url` | **MEDIUM** — Webhook URL could expose tokens |
| `notification_preferences` | `discord_webhook_url` | **MEDIUM** — Same |

**Recommendation:** Use `pgcrypto` for column-level encryption:
```sql
-- Example for totp_secret
ALTER TABLE customers ADD COLUMN totp_secret_encrypted BYTEA;
UPDATE customers SET totp_secret_encrypted = pgp_sym_encrypt(totp_secret, current_setting('app.encryption_key'));
ALTER TABLE customers DROP COLUMN totp_secret;
ALTER TABLE customers RENAME COLUMN totp_secret_encrypted TO totp_secret;
```

### 4.3 Audit Trail 🟡

- ✅ `audit_log` table exists (migration 038 in standalone)
- ❌ **Not in db.rs embedded migrations** — table may not exist in production!
- ❌ No trigger-based audit — relies on application code
- ❌ No audit of data READ operations (only writes)
- ❌ No audit of `customers` table modifications

### 4.4 Data Retention 🟡

- ✅ `retention.rs` implements retention job:
  - Archives delivered/failed deliveries to `dead_letters` before deletion
  - Cleans up expired idempotency keys
  - Cleans up processed webhook_queue items (>7 days)
  - Cleans up expired seen_webhooks
  - Resets monthly webhook counters on the 1st
- ❌ No configurable retention period per customer
- ❌ No retention for audit_log (grows forever)
- ❌ No retention for dead_letters (grows forever)
- ❌ No retention for ai_events, risk_scores, ai_actions

---

## 5. Data Integrity Issues

### 5.1 Missing Foreign Keys 🔴

| Table | Column | Missing FK | Impact |
|-------|--------|-----------|--------|
| `webhook_queue` | `delivery_id` | → deliveries(id) | **Orphaned queue items** when delivery deleted |
| `webhook_queue` | `endpoint_id` | → endpoints(id) | **Orphaned queue items** when endpoint deleted |
| `dead_letters` | `delivery_id` | None (intentional) | OK — archive table |
| `dead_letters` | `endpoint_id` | None | **Stale references** if endpoint deleted |
| `dead_letters` | `customer_id` | None | **Stale references** if customer deleted |
| `idempotency_keys` | `customer_id` | No FK in db.rs | **Orphaned keys** |
| `fanout_rules` | `dead_letter_endpoint_id` | → endpoints(id) | **Orphaned reference** |

### 5.2 Cascade Delete Concerns 🟡

**Current cascade strategy:** Almost everything cascades from `customers`.

```
customers
├── endpoints (CASCADE)
│   ├── deliveries (CASCADE)
│   │   └── delivery_attempts (CASCADE)
│   ├── delivery_targets (CASCADE)
│   ├── fanout_rules (CASCADE via customer_id)
│   └── rate_limit_configs (CASCADE)
├── teams (CASCADE via owner_id)
│   ├── team_members (CASCADE)
│   └── team_invites (CASCADE)
├── notifications (CASCADE)
├── notification_preferences (CASCADE)
├── api_keys (CASCADE)
├── password_reset_tokens (CASCADE)
├── email_verification_tokens (CASCADE)
├── refresh_tokens (CASCADE)
├── device_tokens (CASCADE)
├── installed_agents (CASCADE)
├── payment_transactions (CASCADE)
├── invoices (CASCADE)
├── sso_configs (CASCADE)
├── custom_domains (CASCADE)
├── portal_configs (CASCADE)
└── audit_log (CASCADE)
```

**Missing from cascade tree:**
- `webhook_queue` — no FK, items survive endpoint/customer deletion
- `dead_letters` — no FK, archive survives (intentional)
- `delivery_attempts` via `dead_letters.delivery_id` — N/A (no FK)
- `event_schemas` — FK CASCADE ✅
- `ai_agent_configs` — FK CASCADE ✅

**Risk:** `delete_account` in auth.rs manually deletes from tables but **misses**:
- `webhook_queue` (orphaned items)
- `delivery_targets` (FK cascade handles this)
- `fanout_rules` (FK cascade handles this)
- `ws_subscriptions` (FK cascade handles this)
- `event_schemas` (FK cascade handles this)
- `ai_agent_configs` (FK cascade handles this)
- `team_invites` (FK cascade handles this)
- `sso_configs` (FK cascade handles this)
- `audit_log` (FK cascade handles this)
- `alert_rules` (FK cascade handles this)

The manual deletions are **mostly redundant** due to CASCADE, but `webhook_queue` has NO FK and is never cleaned up on account deletion.

### 5.3 Unique Constraints 🟡

| Table | Constraint | Status |
|-------|-----------|--------|
| customers.email | UNIQUE | ✅ |
| customers.api_key_hash | UNIQUE (standalone) / Missing (db.rs) | ⚠️ |
| endpoints | No unique constraint on (customer_id, url) | ❌ Duplicate endpoints possible |
| team_members | UNIQUE(team_id, customer_id) | ✅ |
| team_invites.token | UNIQUE | ✅ |
| custom_domains.domain | UNIQUE | ✅ |
| portal_configs.customer_id | UNIQUE | ✅ |
| sso_configs.customer_id | UNIQUE | ✅ |
| rate_limit_configs.endpoint_id | UNIQUE | ✅ |
| notification_preferences.customer_id | UNIQUE | ✅ |
| api_keys.api_key_hash | **No UNIQUE** | ❌ Possible duplicate keys |
| payment_transactions(provider, provider_tx_id) | **No UNIQUE** | ❌ Possible duplicate tx |
| invoices(provider, provider_invoice_id) | **No UNIQUE** | ❌ Possible duplicate invoices |
| device_tokens(customer_id, token) | UNIQUE | ✅ |
| installed_agents(customer_id, agent_id) | UNIQUE | ✅ |

### 5.4 Data Type Inconsistencies 🟡

| Issue | Details |
|-------|---------|
| STRING vs TEXT | Standalone SQL uses `STRING` (CockroachDB), db.rs uses `TEXT` (PostgreSQL) |
| VARCHAR vs TEXT | `webhook_queue.trace_id` is `VARCHAR(64)`, everything else is `TEXT` |
| INT vs BIGINT | `amount_cents`: BIGINT in db.rs payment_transactions, INT in invoices and standalone |
| INT vs BIGINT | `webhook_limit`/`webhook_count`: INT (fine for now, inconsistent with BIGINT elsewhere) |
| DOUBLE PRECISION vs FLOAT | `marketplace_agents.rating`: FLOAT in standalone, DOUBLE PRECISION in db.rs |
| TIMESTAMP vs TIMESTAMPTZ | All tables use TIMESTAMPTZ ✅ |

---

## 6. GDPR Compliance

### 6.1 Data Export (Article 15 — Right of Access) 🟡

**Implementation:** `GET /v1/auth/export`

**What's exported:**
- ✅ Endpoints (all)
- ✅ Deliveries (last 90 days, max 10,000)

**What's MISSING from export:**
- ❌ Customer profile data (email, name, plan, created_at)
- ❌ API keys
- ❌ Team memberships
- ❌ Notifications
- ❌ Payment transactions & invoices
- ❌ SSO configurations
- ❌ Audit log entries
- ❌ Notification preferences
- ❌ Device tokens
- ❌ Installed agents
- ❌ Custom domains
- ❌ Portal configurations
- ❌ Alert rules

### 6.2 Account Deletion (Article 17 — Right to Erasure) 🟡

**Implementation:** `DELETE /v1/auth/account`

**What's deleted (manual + cascade):**
- ✅ delivery_attempts (manual)
- ✅ deliveries (manual)
- ✅ endpoints (manual + cascade)
- ✅ api_keys (manual)
- ✅ refresh_tokens (manual)
- ✅ password_reset_tokens (manual)
- ✅ email_verification_tokens (manual)
- ✅ notifications (manual)
- ✅ devices (manual — **NOTE: table name mismatch! Should be `device_tokens`**)
- ✅ installed_agents (manual)
- ✅ payment_transactions (manual)
- ✅ invoices (manual)
- ✅ custom_domains (manual)
- ✅ portal_configs (manual)
- ✅ customers (manual, last)

**What's MISSING from deletion:**
- ❌ `webhook_queue` — no FK, not manually deleted → **orphaned data persists**
- ❌ `dead_letters` — archive survives (intentional but GDPR-relevant)
- ❌ `audit_log` — deleted via CASCADE ✅ (if FK exists)
- ⚠️ `DELETE FROM devices` — should be `device_tokens` (table name bug!)

### 6.3 Data Retention Policy 🟡

- ✅ Retention job exists (`retention.rs`)
- ✅ Configurable `retention_days` parameter
- ❌ No per-customer retention settings
- ❌ No documentation of retention periods
- ❌ Dead letters and audit_log grow indefinitely

### 6.4 Anonymization Strategy 🔴

**No anonymization strategy exists.** Options:
1. **Soft delete with anonymization** — mark as deleted, scrub PII
2. **Hard delete** — current approach (with cascade)
3. **Pseudonymization** — replace identifiers with hashes

Current approach is hard-delete-only, which is acceptable but:
- No grace period for accidental deletion
- No way to restore accidentally deleted accounts
- Dead letters retain payload data indefinitely

---

## 7. Critical Findings Summary

### 🔴 CRITICAL (Must Fix)

| # | Finding | Table(s) | Impact |
|---|---------|----------|--------|
| 1 | **No CHECK constraints anywhere** | All tables | Data validation relies entirely on application code; invalid status strings, plans, roles accepted |
| 2 | **Plaintext TOTP secret** | customers | 2FA compromise if DB is breached |
| 3 | **Plaintext signing secrets** | endpoints | Webhook signature forgery if DB is breached |
| 4 | **webhook_queue has NO foreign keys** | webhook_queue | Orphaned records accumulate; no referential integrity |
| 5 | **No RLS on any table** | All tables | SQL injection = full data access |
| 6 | **Two conflicting migration systems** | migrations/*.sql vs db.rs | Schema drift, confusion about source of truth |
| 7 | **delete_account references `devices` not `device_tokens`** | auth.rs | GDPR deletion bug — device_tokens not cleaned up |

### 🟠 HIGH (Should Fix)

| # | Finding | Table(s) | Impact |
|---|---------|----------|--------|
| 8 | Missing `updated_at` on endpoints | endpoints | Can't track modifications |
| 9 | Missing composite indexes | deliveries, webhook_queue, api_keys | Slow queries under load |
| 10 | No partitioning on high-volume tables | deliveries, webhook_queue | Unbounded table growth |
| 11 | Incomplete GDPR export | customers, api_keys, teams, etc. | GDPR Article 15 non-compliance |
| 12 | No UNIQUE on api_keys.api_key_hash | api_keys | Possible duplicate API keys |
| 13 | INT for money columns | invoices.amount_cents | Overflow risk; inconsistent with BIGINT |
| 14 | No automatic token expiration | password_reset_tokens, etc. | Stale tokens in DB |

### 🟡 MEDIUM (Nice to Fix)

| # | Finding | Table(s) | Impact |
|---|---------|----------|--------|
| 15 | VARCHAR vs TEXT inconsistency | webhook_queue.trace_id | Minor type inconsistency |
| 16 | No comment annotations | All tables | Schema documentation gap |
| 17 | No autovacuum tuning | deliveries, webhook_queue | Potential bloat |
| 18 | Missing indexes on dead_letters | dead_letters | Slow archival queries |
| 19 | No soft-delete pattern | customers | No recovery from accidental deletion |
| 20 | Standalone SQL uses STRING (CockroachDB) | migrations/*.sql | Not valid PostgreSQL |

---

## Appendix A: Complete Table List (db.rs)

| # | Table | Migration | Has FK | Has updated_at | Has Indexes |
|---|-------|-----------|--------|----------------|-------------|
| 1 | customers | 001 | — | ✅ (030) | ✅ |
| 2 | endpoints | 001 | ✅ | ❌ | ✅ |
| 3 | deliveries | 001 | ✅ | ✅ (027) | ✅ |
| 4 | delivery_attempts | 001 | ✅ | ❌ | ✅ |
| 5 | dead_letters | 001 | ❌ | ❌ | ⚠️ Partial |
| 6 | idempotency_keys | 001 | ❌ (db.rs) | ❌ | ✅ |
| 7 | webhook_queue | 009 | ❌ | ✅ (023) | ✅ |
| 8 | seen_webhooks | 011 | — | ❌ | ✅ |
| 9 | retry_policies | 012 | ✅ | ❌ | ✅ |
| 10 | transform_rules | 013 | ✅ | ❌ | ✅ |
| 11 | event_schemas | 014 | ✅ | ❌ | ✅ |
| 12 | api_keys | 015 | ✅ | ❌ | ✅ |
| 13 | alert_rules | 016 | ✅ | ❌ | ✅ |
| 14 | ai_events | 017 | — | ❌ | ✅ |
| 15 | risk_scores | 017 | — | ❌ | ✅ |
| 16 | ai_actions | 017 | — | ❌ | ✅ |
| 17 | ai_blocklist | 017 | — | ❌ | ✅ |
| 18 | ai_agents | 018 | — | ❌ | ❌ |
| 19 | ai_agent_executions | 018 | ✅ | ❌ | ✅ |
| 20 | ai_agent_configs | 018 | ✅ | ❌ | — (PK composite) |
| 21 | marketplace_agents | 019 | — | ❌ | ❌ |
| 22 | installed_agents | 019 | ✅ | ❌ | ✅ |
| 23 | fifo_queue | 020 | ✅ | ❌ | ✅ |
| 24 | delivery_targets | 021 | ✅ | ❌ | ✅ |
| 25 | fanout_rules | 021 | ✅ | ❌ | ✅ |
| 26 | teams | 032 | ✅ | ✅ | ✅ |
| 27 | team_members | 032 | ✅ | ❌ | ✅ |
| 28 | team_invites | 032 | ✅ | ❌ | ✅ |
| 29 | notifications | 033 | ✅ | ❌ | ✅ |
| 30 | notification_preferences | 037 | ✅ | ✅ | ✅ |
| 31 | inbound_configs | 036 | ✅ | ❌ | ✅ |
| 32 | invoices | 028 | ✅ | ❌ | ✅ |
| 33 | payment_transactions | 029 | ✅ | ❌ | ✅ |
| 34 | password_reset_tokens | 039 | ✅ | ❌ | ✅ |
| 35 | email_verification_tokens | 040 | ✅ | ❌ | ✅ |
| 36 | refresh_tokens | 041 | ✅ | ❌ | ✅ |
| 37 | device_tokens | 042 | ✅ | ❌ | ✅ |

---

## Appendix B: Recommended Migration (Priority Fixes)

```sql
-- Migration 044: Critical integrity fixes

-- 1. Add CHECK constraints (using NOT VALID to avoid lock)
ALTER TABLE customers ADD CONSTRAINT chk_customers_plan
    CHECK (plan IN ('free', 'starter', 'pro', 'enterprise', 'custom')) NOT VALID;

ALTER TABLE deliveries ADD CONSTRAINT chk_deliveries_status
    CHECK (status IN ('pending', 'processing', 'delivered', 'failed', 'dead_letter')) NOT VALID;

ALTER TABLE webhook_queue ADD CONSTRAINT chk_queue_status
    CHECK (status IN ('pending', 'processing', 'delivered', 'dead_letter', 'failed')) NOT VALID;

ALTER TABLE payment_transactions ADD CONSTRAINT chk_payment_status
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) NOT VALID;

ALTER TABLE payment_transactions ADD CONSTRAINT chk_payment_provider
    CHECK (provider IN ('stripe', 'polar', 'iyzico')) NOT VALID;

ALTER TABLE payment_transactions ADD CONSTRAINT chk_payment_currency
    CHECK (currency IN ('USD', 'EUR', 'TRY', 'GBP')) NOT VALID;

ALTER TABLE invoices ADD CONSTRAINT chk_invoice_status
    CHECK (status IN ('paid', 'pending', 'failed', 'refunded', 'cancelled')) NOT VALID;

ALTER TABLE endpoints ADD CONSTRAINT chk_routing_strategy
    CHECK (routing_strategy IN ('round-robin', 'latency', 'failover', 'random')) NOT VALID;

ALTER TABLE team_members ADD CONSTRAINT chk_team_role
    CHECK (role IN ('admin', 'editor', 'viewer')) NOT VALID;

-- 2. Add FK to webhook_queue
ALTER TABLE webhook_queue ADD CONSTRAINT fk_queue_delivery
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE;
ALTER TABLE webhook_queue ADD CONSTRAINT fk_queue_endpoint
    FOREIGN KEY (endpoint_id) REFERENCES endpoints(id) ON DELETE CASCADE;

-- 3. Add missing updated_at triggers
CREATE TRIGGER trg_endpoints_updated_at
    BEFORE UPDATE ON endpoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Add missing indexes
CREATE INDEX CONCURRENTLY idx_deliveries_created_at ON deliveries(created_at DESC);
CREATE INDEX CONCURRENTLY idx_deliveries_customer_status ON deliveries(customer_id, status, created_at DESC);
CREATE INDEX CONCURRENTLY idx_dead_letters_created_at ON dead_letters(created_at DESC);
CREATE INDEX CONCURRENTLY idx_dead_letters_endpoint ON dead_letters(endpoint_id);
CREATE INDEX CONCURRENTLY idx_webhook_queue_processed ON webhook_queue(processed_at)
    WHERE processed_at IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_audit_log_resource ON audit_log(resource_type, resource_id);

-- 5. Add UNIQUE constraints
ALTER TABLE api_keys ADD CONSTRAINT uq_api_keys_hash UNIQUE (api_key_hash);
ALTER TABLE payment_transactions ADD CONSTRAINT uq_payment_provider_tx
    UNIQUE (provider, provider_tx_id);
ALTER TABLE invoices ADD CONSTRAINT uq_invoices_provider
    UNIQUE (provider, provider_invoice_id);

-- 6. Fix money columns
ALTER TABLE invoices ALTER COLUMN amount_cents TYPE BIGINT;

-- 7. Validate all NOT VALID constraints
ALTER TABLE customers VALIDATE CONSTRAINT chk_customers_plan;
ALTER TABLE deliveries VALIDATE CONSTRAINT chk_deliveries_status;
ALTER TABLE webhook_queue VALIDATE CONSTRAINT chk_queue_status;
```

---

*End of audit report.*
