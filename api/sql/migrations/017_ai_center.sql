CREATE TABLE IF NOT EXISTS ai_events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_type TEXT NOT NULL,
            severity TEXT NOT NULL DEFAULT 'info',
            title TEXT NOT NULL,
            description TEXT,
            action_taken TEXT,
            target_type TEXT,
            target_id UUID,
            resolved BOOL NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_ai_events_created
            ON ai_events(created_at DESC);

        CREATE TABLE IF NOT EXISTS risk_scores (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            target_type TEXT NOT NULL,
            target_id UUID NOT NULL,
            score INT NOT NULL DEFAULT 0,
            factors JSONB,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_risk_scores_target
            ON risk_scores(target_id, created_at DESC);

        CREATE TABLE IF NOT EXISTS ai_actions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            action_type TEXT NOT NULL,
            description TEXT NOT NULL,
            target_type TEXT,
            target_id UUID,
            status TEXT NOT NULL DEFAULT 'pending',
            risk_level TEXT NOT NULL DEFAULT 'low',
            auto_approved BOOL NOT NULL DEFAULT false,
            executed_at TIMESTAMPTZ,
            rolled_back_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_ai_actions_status
            ON ai_actions(status);

        CREATE TABLE IF NOT EXISTS ai_blocklist (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            block_type TEXT NOT NULL,
            block_value TEXT NOT NULL,
            reason TEXT,
            expires_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_ai_blocklist_expires
            ON ai_blocklist(expires_at) WHERE expires_at IS NOT NULL;
