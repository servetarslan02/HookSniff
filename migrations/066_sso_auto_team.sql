-- Migration 066: Add default team auto-join to SSO configs
-- When SSO users log in, they can be automatically added to a team.

ALTER TABLE sso_configs
  ADD COLUMN default_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  ADD COLUMN default_role VARCHAR(20) DEFAULT 'viewer';

-- Index for faster lookups
CREATE INDEX idx_sso_configs_default_team ON sso_configs(default_team_id) WHERE default_team_id IS NOT NULL;
