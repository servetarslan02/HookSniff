CREATE TABLE IF NOT EXISTS service_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL DEFAULT 'Default Token',
            token_hash TEXT NOT NULL,
            token_prefix VARCHAR(32) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            last_used_at TIMESTAMPTZ,
            is_active BOOLEAN NOT NULL DEFAULT true
        );
        CREATE INDEX IF NOT EXISTS idx_service_tokens_team ON service_tokens(team_id);
        CREATE INDEX IF NOT EXISTS idx_service_tokens_hash ON service_tokens(token_hash);
        CREATE INDEX IF NOT EXISTS idx_service_tokens_prefix ON service_tokens(token_prefix);
