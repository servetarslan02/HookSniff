-- Add team_id to endpoints for organization-scoped access
-- When a service token is used, only endpoints belonging to that team are accessible

ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_endpoints_team ON endpoints(team_id) WHERE team_id IS NOT NULL;
