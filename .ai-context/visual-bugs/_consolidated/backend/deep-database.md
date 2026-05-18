# HookSniff Deep Database Review

**Date:** 2026-05-10  
**Scope:** All migrations (001–038), `db.rs`, models, `fix-migrations.js`, `run-migrations.js`  
**Severity Scale:** 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low

---

## Executive Summary

The HookSniff database has **two competing migration systems** that run against the same database, **hardcoded credentials** in migration scripts, **missing migration files** (013–025, 036), and several schema integrity issues. The most urgent fix is removing the plaintext Neon credentials and consolidating to a single migration authority.

**Issue Count:** 🔴 5 Critical | 🟠 8 High | 🟡 10 Medium | 🔵 6 Low

---

## 🔴 CRITICAL Issues

### C1. Hardcoded Database Credentials in Migration Scripts

**Files:** `fix-migrations.js` (line 5), `run-migrations.js` (line 5)

```javascript
const DATABASE_URL = 'postgresql://neondb_owner:REDACTED_PASSWORD@ep-frosty-bar-...neon.tech/neondb?sslmode=require';
```

The Neon database password is committed in plaintext. Anyone with repo access has full DB credentials.

**Fix:**
```bash
# Rotate the Neon password immediately
# Then replace hardcoded URLs with environment variables:
```

```javascript
// fix-migrations.js & run-migrations.js
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set');
  process.exit(1);
}
```

---

### C2. Dual Migration Systems — Conflicting Authorities

**Problem:** There are TWO independent migration systems that both run against the same database:

| System | Location | Tracking | Authority |
|--------|----------|----------|-----------|
| SQL files | `migrations/*.sql` (001–038) | None (relies on `IF NOT EXISTS`) | `run-migrations.js` |
| Rust inline | `api/src/db.rs` (001–043) | `_migrations` table | Rust app startup |
| Ad-hoc fixes | `fix-migrations.js` | None | Manual execution |

The SQL files and Rust migrations define **different schemas for the same tables**. For example:

- **`webhook_queue`**: SQL file (via fix-migrations.js) has `delivery_id`, `endpoint_id`, `customer_id`, `payload`, `event_type`. Rust migration 009 has `delivery_id`, `endpoint_id`, `endpoint_url`, `payload`, `custom_headers`, `processed_at` — **completely different columns**.
- **`delivery_attempts`**: SQL file has `status TEXT`, Rust has `status_code INT` — incompatible.
- **`idempotency_keys`**: SQL file has composite PK `(key, customer_id)`, Rust has single PK `key TEXT`.
- **`dead_letters`**: SQL file has `FK REFERENCES deliveries(id) ON DELETE CASCADE`, Rust has no FK on `delivery_id`.

**Fix:** Consolidate to the Rust `db.rs` system (it has proper tracking) and delete/archive the SQL files.

```bash
# Archive the conflicting SQL migration system
mkdir -p migrations/archived
mv migrations/*.sql migrations/archived/
# Remove or archive fix-migrations.js and run-migrations.js
mv fix-migrations.js fix-migrations.js.archived
mv run-migrations.js run-migrations.js.archived
```

---

### C3. `password_hash` Column Allows NULL — Account Takeback Risk

**File:** `db.rs` migration 002, `api/migrations/001_initial_schema.sql`

```sql
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT;
```

`password_hash` is `NULL`-able. Combined with `email_verified BOOLEAN DEFAULT false`, a newly registered customer with `password_hash = NULL` could be exploited if login logic doesn't strictly check for non-null password.

**Fix:**
```sql
-- After confirming all existing customers have passwords set:
UPDATE customers SET password_hash = '!!LEGACY!!' WHERE password_hash IS NULL;
ALTER TABLE customers ALTER COLUMN password_hash SET NOT NULL;
```

---

### C4. Missing Migration Files — 13 SQL Files Absent

**Problem:** Migration files `013` through `025` and `036` are missing from the `migrations/` directory. These correspond to features that exist in `db.rs`:

| Missing File | Rust Migration | Feature |
|---|---|---|
| 013 | 013_transform_rules | Transform rules table |
| 014 | 014_event_schemas | Event schemas (conflicts with 005_event_mesh.sql) |
| 015 | 015_api_keys | API keys table |
| 016 | 016_alert_rules | Alert rules table |
| 017 | 017_ai_center | AI events, risk scores, AI actions |
| 018 | 018_ai_agents | AI agents and configs |
| 019 | 019_marketplace | Marketplace agents (conflicts with 006_industry.sql) |
| 020 | 020_fifo_queue | FIFO queue table |
| 021 | 021_delivery_targets | Delivery targets + fanout rules |
| 022 | 022_stripe_columns | Stripe customer columns |
| 023 | 023_updated_at_webhook_queue | Zombie reaper support |
| 024 | 024_listen_notify | NOTIFY trigger |
| 025 | 025_trace_id | OpenTelemetry trace IDs |
| 036 | 036_inbound_configs | Inbound webhook configs |

If `run-migrations.js` is ever used, it will skip all these features. If `db.rs` is used, the SQL files create conflicting schemas first.

**Fix:** Delete SQL migration system (see C2). The Rust system is authoritative.

---

### C5. Sensitive Data Exposure — TOTP Secret in `customers` Table

**File:** `db.rs` migration 038, `customer.rs` model

```sql
ALTER TABLE customers ADD COLUMN IF NOT EXISTS totp_secret TEXT;
```

The TOTP 2FA secret is stored alongside the customer record. While `customer.rs` uses `#[serde(skip_serializing)]`, the secret is still accessible via direct SQL queries. A compromised read-only DB access exposes all 2FA secrets.

**Fix:**
```sql
-- Encrypt TOTP secrets at rest using application-level encryption
-- Or use a separate secrets table with restricted access:
CREATE TABLE IF NOT EXISTS customer_secrets (
    customer_id UUID PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
    totp_secret_encrypted BYTEA,
    encryption_key_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Restrict access
REVOKE ALL ON customer_secrets FROM public;
-- Grant only to application role
-- GRANT SELECT, INSERT, UPDATE, DELETE ON customer_secrets TO hooksniff_app;
```

---

## 🟠 HIGH Issues

### H1. `dead_letters` Missing Foreign Key on `delivery_id` (Rust Schema)

**File:** `db.rs` migration 001

```sql
CREATE TABLE IF NOT EXISTS dead_letters (
    ...
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    endpoint_id UUID NOT NULL REFERENCES endpoints(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    ...
);
```

`endpoint_id` and `customer_id` lack `ON DELETE CASCADE` or `ON DELETE SET NULL`. If an endpoint is deleted, dead_letters become orphaned with dangling references.

**Fix:**
```sql
ALTER TABLE dead_letters DROP CONSTRAINT IF EXISTS dead_letters_endpoint_id_fkey;
ALTER TABLE dead_letters ADD CONSTRAINT dead_letters_endpoint_id_fkey
    FOREIGN KEY (endpoint_id) REFERENCES endpoints(id) ON DELETE CASCADE;

ALTER TABLE dead_letters DROP CONSTRAINT IF EXISTS dead_letters_customer_id_fkey;
ALTER TABLE dead_letters ADD CONSTRAINT dead_letters_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
```

---

### H2. `webhook_queue` References `delivery_id` Without FK Constraint

**File:** `db.rs` migration 009

```sql
CREATE TABLE IF NOT EXISTS webhook_queue (
    ...
    delivery_id UUID NOT NULL,
    endpoint_id UUID NOT NULL,
    ...
);
```

No foreign keys at all. Orphaned queue entries can accumulate if deliveries are deleted.

**Fix:**
```sql
ALTER TABLE webhook_queue ADD CONSTRAINT webhook_queue_delivery_fk
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE;
ALTER TABLE webhook_queue ADD CONSTRAINT webhook_queue_endpoint_fk
    FOREIGN KEY (endpoint_id) REFERENCES endpoints(id) ON DELETE CASCADE;
```

---

### H3. `event_schemas` — Inconsistent FK Behavior Across Migrations

**File:** `migrations/005_event_mesh.sql` vs `db.rs` migration 014

SQL file: `customer_id UUID REFERENCES customers(id)` — no `ON DELETE`  
Rust: `customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE`

Also, SQL file has `version INT DEFAULT 1` (nullable), Rust has `version INT NOT NULL DEFAULT 1`.

**Fix:**
```sql
-- Standardize to NOT NULL with CASCADE
ALTER TABLE event_schemas ALTER COLUMN customer_id SET NOT NULL;
ALTER TABLE event_schemas ALTER COLUMN version SET NOT NULL;
-- Add CASCADE
ALTER TABLE event_schemas DROP CONSTRAINT IF EXISTS event_schemas_customer_id_fkey;
ALTER TABLE event_schemas ADD CONSTRAINT event_schemas_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
```

---

### H4. `teams.owner_id` Missing `ON DELETE` Behavior (SQL file)

**File:** `migrations/004_teams.sql`

```sql
owner_id UUID NOT NULL REFERENCES customers(id),
```

No `ON DELETE CASCADE` or `ON DELETE SET NULL`. If the owner is deleted, the team becomes orphaned.

**Fix:**
```sql
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_owner_id_fkey;
ALTER TABLE teams ADD CONSTRAINT teams_owner_id_fkey
    FOREIGN KEY (owner_id) REFERENCES customers(id) ON DELETE CASCADE;
```

Note: `db.rs` migration 032 correctly uses `ON DELETE CASCADE`.

---

### H5. `installed_agents` Missing `ON DELETE CASCADE` (SQL file)

**File:** `migrations/006_industry.sql`

```sql
customer_id UUID REFERENCES customers(id),
agent_id UUID REFERENCES marketplace_agents(id),
```

No cascade behavior. Deleting a customer or agent leaves orphaned records.

**Fix:**
```sql
ALTER TABLE installed_agents DROP CONSTRAINT IF EXISTS installed_agents_customer_id_fkey;
ALTER TABLE installed_agents ADD CONSTRAINT installed_agents_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

ALTER TABLE installed_agents DROP CONSTRAINT IF EXISTS installed_agents_agent_id_fkey;
ALTER TABLE installed_agents ADD CONSTRAINT installed_agents_agent_id_fkey
    FOREIGN KEY (agent_id) REFERENCES marketplace_agents(id) ON DELETE CASCADE;
```

---

### H6. `fanout_rules.target_ids` — UUID Array Without FK Validation

**File:** `db.rs` migration 021

```sql
target_ids UUID[] NOT NULL DEFAULT '{}',
```

UUID arrays cannot have FK constraints. If a `delivery_target` is deleted, fanout rules reference non-existent targets. This is a data integrity gap.

**Fix (design change — junction table):**
```sql
CREATE TABLE IF NOT EXISTS fanout_rule_targets (
    rule_id UUID NOT NULL REFERENCES fanout_rules(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES delivery_targets(id) ON DELETE CASCADE,
    PRIMARY KEY (rule_id, target_id)
);
-- Migrate data:
-- INSERT INTO fanout_rule_targets (rule_id, target_id)
-- SELECT fr.id, unnest(fr.target_ids) FROM fanout_rules fr;
-- Then drop the target_ids column from fanout_rules.
```

---

### H7. `sso_configs.client_secret_encrypted` — Encryption Not Verified

**File:** `migrations/038_backend_endpoints.sql`

```sql
client_secret_encrypted TEXT,
```

The column name suggests encryption, but there's no guarantee the application actually encrypts before storing. If stored in plaintext, this is a credential exposure risk.

**Fix:** Verify the application code encrypts this field. If not:
```sql
-- Add a key reference for proper key management
ALTER TABLE sso_configs ADD COLUMN encryption_key_id TEXT;
```

---

### H8. `webhook_count` Uses `INT` — Will Overflow at 2.1B

**File:** `db.rs` migration 001

```sql
webhook_count INT NOT NULL DEFAULT 0,
```

For a webhook delivery service, `INT` (max 2,147,483,647) could overflow for high-volume customers. Should use `BIGINT`.

**Fix:**
```sql
ALTER TABLE customers ALTER COLUMN webhook_count TYPE BIGINT;
ALTER TABLE customers ALTER COLUMN webhook_limit TYPE BIGINT;
```

---

## 🟡 MEDIUM Issues

### M1. Missing Composite Index on `deliveries(endpoint_id, status)`

**File:** `db.rs` migration 001

The dashboard likely queries "pending deliveries for endpoint X". Current indexes are single-column.

**Fix:**
```sql
CREATE INDEX IF NOT EXISTS idx_deliveries_endpoint_status
    ON deliveries(endpoint_id, status);
```

---

### M2. Missing Index on `deliveries(created_at)` for Time-Range Queries

**File:** `db.rs` migration 001

Dashboard "recent deliveries" and export features need time-range scans.

**Fix:**
```sql
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at
    ON deliveries(created_at DESC);
```

---

### M3. Missing Index on `delivery_attempts(created_at)`

**File:** `db.rs` migration 001

Attempts are queried by delivery_id (indexed) but also by time for debugging.

**Fix:**
```sql
CREATE INDEX IF NOT EXISTS idx_delivery_attempts_created_at
    ON delivery_attempts(created_at DESC);
```

---

### M4. `payment_transactions.amount_cents` Uses `INT` in SQL File

**File:** `migrations/009_payment_providers.sql`

```sql
amount_cents INT NOT NULL,
```

`db.rs` migration 029 correctly uses `BIGINT`. The SQL file uses `INT`, which overflows at $21.4M.

**Fix:** Already fixed in Rust migration. No action needed if Rust system is authoritative.

---

### M5. `dead_letters` Missing Index on `endpoint_id`

**File:** `db.rs` migration 001

Only `customer_id` is indexed. Querying dead letters by endpoint requires a full scan.

**Fix:**
```sql
CREATE INDEX IF NOT EXISTS idx_dead_letters_endpoint ON dead_letters(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_dead_letters_created_at ON dead_letters(created_at DESC);
```

---

### M6. `idempotency_keys` — No Automatic Cleanup

**File:** `db.rs` migration 001

Expired idempotency keys accumulate forever. The `expires_at` index exists but no cleanup job is visible.

**Fix:**
```sql
-- Schedule periodic cleanup (or add to a cron job):
DELETE FROM idempotency_keys WHERE expires_at < now() - INTERVAL '7 days';
DELETE FROM seen_webhooks WHERE expires_at < now() - INTERVAL '1 day';
```

---

### M7. `password_reset_tokens` — No Index on `expires_at` for Cleanup

**File:** `db.rs` migration 039

Expired tokens accumulate. No index for efficient cleanup.

**Fix:**
```sql
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires
    ON password_reset_tokens(expires_at) WHERE used = false;
```

---

### M8. `refresh_tokens` — No Index on `expires_at` for Cleanup

**File:** `db.rs` migration 041

Same issue as password reset tokens.

**Fix:**
```sql
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires
    ON refresh_tokens(expires_at) WHERE revoked = false;
```

---

### M9. `email_verification_tokens` — No Index on `expires_at`

**File:** `db.rs` migration 040

**Fix:**
```sql
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires
    ON email_verification_tokens(expires_at) WHERE used = false;
```

---

### M10. `notifications` — No Cleanup Strategy

**File:** `db.rs` migration 033

Notifications accumulate forever. No TTL or archive strategy.

**Fix:**
```sql
-- Add retention policy:
DELETE FROM notifications WHERE created_at < now() - INTERVAL '90 days' AND is_read = true;
```

---

## 🔵 LOW Issues

### L1. `STRING` vs `TEXT` Type Inconsistency

**Files:** Multiple migrations

The SQL files use CockroachDB's `STRING` type. The Rust migrations use PostgreSQL's `TEXT`. These are compatible on CockroachDB but not on standard PostgreSQL.

**Fix:** Standardize to `TEXT` for PostgreSQL compatibility (already done in Rust migrations).

---

### L2. `VARCHAR` Length Limits Arbitrary

**Files:** `004_teams.sql`, `007_notifications.sql`, `038_backend_endpoints.sql`

```sql
name VARCHAR(255) NOT NULL,
type VARCHAR(50) NOT NULL,
action VARCHAR(100) NOT NULL,
```

Arbitrary limits that may truncate data. The Rust migrations use `TEXT` without limits.

**Fix:** Standardize to `TEXT` (already done in Rust system).

---

### L3. `webhook_templates` and `industry_packages` — Orphaned Tables

**File:** `migrations/006_industry.sql`

These tables are created in the SQL migrations but never referenced in `db.rs`. They may be dead code or belong to a different feature branch.

**Fix:** Verify usage. If unused, drop:
```sql
DROP TABLE IF EXISTS webhook_templates CASCADE;
DROP TABLE IF EXISTS industry_packages CASCADE;
```

---

### L4. `ws_subscriptions` — No Cleanup for Stale Connections

**File:** `migrations/005_event_mesh.sql`

```sql
last_heartbeat TIMESTAMPTZ DEFAULT now(),
```

Stale WebSocket connections accumulate. No TTL or cleanup mechanism.

**Fix:**
```sql
DELETE FROM ws_subscriptions WHERE last_heartbeat < now() - INTERVAL '1 hour';
```

---

### L5. Missing `updated_at` Trigger on `teams` (SQL file)

**File:** `migrations/004_teams.sql`

`teams` has `updated_at` but no trigger to auto-update it. The Rust migration 032 correctly adds the trigger.

---

### L6. `audit_log` — No Partitioning for High-Volume Growth

**File:** `migrations/038_backend_endpoints.sql`

Audit logs grow indefinitely. For compliance, consider time-based partitioning.

**Fix (CockroachDB):**
```sql
-- CockroachDB supports TTL-based row deletion:
ALTER TABLE audit_log SET (ttl_expiration_expression = 'created_at + INTERVAL ''365 days''');
```

---

## Schema Comparison: SQL Files vs Rust `db.rs`

| Table | SQL File | Rust db.rs | Conflict? |
|---|---|---|---|
| `customers` | Has `api_key_hash UNIQUE` | No UNIQUE on hash | ✅ Schema differs |
| `endpoints` | Has `ip_whitelist`, `rate_limit_per_minute`, `secret_rotation_at`, `signature_header` | Has `allowed_ips`, `event_filter`, `custom_headers`, `retry_policy`, `old_signing_secret`, `secret_rotated_at` | 🔴 Different columns |
| `deliveries` | Has `idempotency_key`, `source_ip`, `request_headers` | Has `sequence_num`, `fifo_group_id`, `is_test` | 🔴 Different columns |
| `delivery_attempts` | `status TEXT`, `response_headers JSONB` | `status_code INT`, `response_headers JSONB` | 🔴 Different types |
| `webhook_queue` | Created in fix-migrations.js with `customer_id`, `event_type` | Created in db.rs with `endpoint_url`, `processed_at` | 🔴 Different schema |
| `dead_letters` | Has FK on `delivery_id` | Has FK on `delivery_id` | ✅ Consistent |
| `idempotency_keys` | Composite PK `(key, customer_id)` | Single PK `key` | 🔴 Different PK |
| `event_schemas` | `customer_id` nullable, `version` nullable | `customer_id` NOT NULL, `version` NOT NULL | 🟠 Constraints differ |
| `marketplace_agents` | `author` nullable | `author NOT NULL DEFAULT 'unknown'` | 🟠 Constraints differ |

---

## Migration Ordering Issues

### O1. `fix-migrations.js` Runs Out of Order

The fix script applies migrations 009, 010, 026, 027 in a flat array without respecting dependencies. For example, it creates `webhook_queue` (010) before applying 009's payment columns.

### O2. `run-migrations.js` Uses Lexicographic Sort

```javascript
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
```

File `010_reaper_index.sql` depends on `webhook_queue` existing (from fix-migrations.js), but the SQL migration system has no creation for `webhook_queue`. Migration 010 will fail if run standalone.

### O3. No Rollback Support

Neither the SQL files nor the Rust migrations support rollback. The `_migrations` table tracks applied migrations but has no `down` migration capability.

---

## Performance Concerns

### P1. `deliveries` Table — No Partitioning Strategy

This is the highest-volume table. With `ON DELETE CASCADE` from `customers` and `Endpoints`, deleting a customer triggers cascading deletes across potentially millions of delivery rows.

**Fix (CockroachDB TTL):**
```sql
ALTER TABLE deliveries SET (ttl_expiration_expression = 'created_at + INTERVAL ''90 days''');
```

### P2. `webhook_queue` — Full Table Scan on Status Queries

```sql
CREATE INDEX IF NOT EXISTS idx_webhook_queue_pending
    ON webhook_queue(status, next_retry_at) WHERE status = 'pending';
```

This partial index is good, but the `updated_at` column (added in migration 023) should be part of it for the zombie reaper query:

**Fix:**
```sql
-- Drop the old partial index and create a better composite one
DROP INDEX IF EXISTS idx_webhook_queue_pending;
CREATE INDEX IF NOT EXISTS idx_webhook_queue_pending_retry
    ON webhook_queue(status, next_retry_at, updated_at)
    WHERE status = 'pending';
```

### P3. Missing `INCLUDE` Clause for Covering Indexes

Common dashboard queries select `id, status, created_at` from deliveries. A covering index avoids table lookups:

**Fix:**
```sql
CREATE INDEX IF NOT EXISTS idx_deliveries_status_covering
    ON deliveries(status, created_at DESC)
    INCLUDE (id, endpoint_id, customer_id, event_type);
```

---

## Security Summary

| Issue | Severity | Status |
|---|---|---|
| Hardcoded DB credentials | 🔴 Critical | Fix immediately |
| TOTP secret in customers table | 🔴 Critical | Encrypt at rest |
| `password_hash` nullable | 🔴 Critical | Add NOT NULL |
| `sso_configs.client_secret_encrypted` — no encryption verification | 🟠 High | Verify |
| `webhook_queue` has no FK constraints | 🟠 High | Add FKs |
| `fanout_rules.target_ids` UUID array — no FK validation | 🟠 High | Use junction table |

---

## Recommended Action Plan

1. **Immediate** (this week):
   - Rotate Neon credentials
   - Move `DATABASE_URL` to environment variables
   - Delete/archive `fix-migrations.js` and `run-migrations.js`
   - Delete/archive `migrations/` SQL directory

2. **Short-term** (this sprint):
   - Add missing indexes (M1–M3, M5)
   - Add cleanup jobs for token tables (M6–M9)
   - Fix `dead_letters` FK constraints (H1)
   - Add `webhook_queue` FK constraints (H2)

3. **Medium-term** (next sprint):
   - Migrate `webhook_count`/`webhook_limit` to BIGINT (H8)
   - Add `deliveries` TTL or partitioning (P1)
   - Encrypt TOTP secrets at rest (C5)
   - Add junction table for `fanout_rules.target_ids` (H6)

4. **Long-term**:
   - Add rollback support to migration system
   - Implement row-level security for multi-tenant isolation
   - Add `deliveries` table partitioning by `created_at`
