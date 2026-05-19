-- Migration 068: Add verified_domain to sso_configs
-- Enables domain-based SSO config lookup for auto-join

ALTER TABLE sso_configs ADD COLUMN IF NOT EXISTS verified_domain VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_sso_configs_domain ON sso_configs(verified_domain) WHERE verified_domain IS NOT NULL;
