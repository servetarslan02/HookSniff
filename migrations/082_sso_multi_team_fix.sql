-- Migration 082: Fix SSO multi-team support
-- Remove customer_id UNIQUE constraint that prevents same user from having SSO on multiple teams
-- The team_id UNIQUE constraint (from migration 069) already ensures one SSO per team

-- Drop the old customer_id unique constraint
ALTER TABLE sso_configs DROP CONSTRAINT IF EXISTS sso_configs_customer_id_key;

-- Add composite index for lookups by customer_id (non-unique, for query performance)
CREATE INDEX IF NOT EXISTS idx_sso_configs_customer_id ON sso_configs(customer_id);
