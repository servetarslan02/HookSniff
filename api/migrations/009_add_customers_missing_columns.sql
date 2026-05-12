-- Migration 009: Add missing columns to customers table
-- These columns are referenced by admin.rs and other code but were never in a migration.

-- name column (used in admin user list, CSV export)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- is_admin column (used in admin auth checks, SDK notifications)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- is_active column (index exists from 003 but column may be missing)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- updated_at column (trigger exists from 003 but column may be missing)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Payment provider customer IDs (indexes exist from 003 but columns may be missing)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS polar_customer_id VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS iyzico_customer_id VARCHAR(255);

-- Backfill updated_at for existing rows that have it as epoch
UPDATE customers SET updated_at = created_at WHERE updated_at = '1970-01-01 00:00:00+00' OR updated_at IS NULL;
