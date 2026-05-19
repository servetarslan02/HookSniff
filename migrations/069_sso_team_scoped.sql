-- Migration 069: Move SSO config from customer to team (organization)
-- sso_configs.team_id → the team this SSO config belongs to
-- sso_configs.created_by → who created it (audit trail, keeps customer_id reference)

-- Step 1: Add team_id column
ALTER TABLE sso_configs ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE sso_configs ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES customers(id) ON DELETE SET NULL;

-- Step 2: Migrate existing data — link SSO config to the customer's primary team
-- For each SSO config, find the team where the customer is owner
UPDATE sso_configs s
SET team_id = (
    SELECT t.id FROM teams t 
    WHERE t.owner_id = s.customer_id 
    ORDER BY t.created_at ASC 
    LIMIT 1
),
created_by = s.customer_id
WHERE s.team_id IS NULL;

-- Step 3: Create index
CREATE INDEX IF NOT EXISTS idx_sso_configs_team ON sso_configs(team_id) WHERE team_id IS NOT NULL;

-- Step 4: Add unique constraint — one SSO config per team
ALTER TABLE sso_configs ADD CONSTRAINT uq_sso_configs_team UNIQUE (team_id);
