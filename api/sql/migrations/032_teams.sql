CREATE TABLE IF NOT EXISTS teams (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            owner_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id);

        CREATE TABLE IF NOT EXISTS team_members (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            role TEXT NOT NULL DEFAULT 'viewer',
            invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            joined_at TIMESTAMPTZ,
            UNIQUE(team_id, customer_id)
        );
        CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
        CREATE INDEX IF NOT EXISTS idx_team_members_customer ON team_members(customer_id);

        CREATE TABLE IF NOT EXISTS team_invites (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
            email TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'viewer',
            token TEXT NOT NULL UNIQUE,
            expires_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_team_invites_team ON team_invites(team_id);
        CREATE INDEX IF NOT EXISTS idx_team_invites_token ON team_invites(token);

        DROP TRIGGER IF EXISTS trg_teams_updated_at ON teams;
        CREATE TRIGGER trg_teams_updated_at
            BEFORE UPDATE ON teams
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
