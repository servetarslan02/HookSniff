-- AI Center Database Schema

-- AI event log
CREATE TABLE IF NOT EXISTS ai_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type STRING NOT NULL,      -- 'risk', 'defense', 'fix', 'optimization', 'system'
    severity STRING NOT NULL,         -- 'info', 'warning', 'critical'
    title STRING NOT NULL,
    description STRING,
    action_taken STRING,              -- What the AI did
    target_type STRING,               -- 'endpoint', 'customer', 'delivery', 'system'
    target_id UUID,
    metadata JSONB,
    resolved BOOL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Risk score history
CREATE TABLE IF NOT EXISTS risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type STRING NOT NULL,      -- 'endpoint' or 'customer'
    target_id UUID NOT NULL,
    score INT NOT NULL,               -- 0-100
    factors JSONB,                    -- Which factors contributed
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI action log
CREATE TABLE IF NOT EXISTS ai_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type STRING NOT NULL,      -- 'fix', 'defense', 'optimization', 'monitoring'
    description STRING NOT NULL,
    target_type STRING,
    target_id UUID,
    status STRING NOT NULL DEFAULT 'pending',  -- 'pending', 'approved', 'executed', 'rejected', 'rolled_back'
    risk_level STRING NOT NULL,       -- 'low', 'medium', 'high', 'critical'
    auto_approved BOOL DEFAULT false,
    executed_at TIMESTAMPTZ,
    rolled_back_at TIMESTAMPTZ,
    created_by STRING DEFAULT 'ai',
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blocklist (IP, customer, endpoint)
CREATE TABLE IF NOT EXISTS ai_blocklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_type STRING NOT NULL,       -- 'ip', 'customer', 'endpoint'
    block_value STRING NOT NULL,
    reason STRING,
    expires_at TIMESTAMPTZ,           -- NULL = permanent
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI configuration
CREATE TABLE IF NOT EXISTS ai_config (
    key STRING PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_events_type ON ai_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ai_events_severity ON ai_events(severity);
CREATE INDEX IF NOT EXISTS idx_ai_events_created ON ai_events(created_at);
CREATE INDEX IF NOT EXISTS idx_risk_scores_target ON risk_scores(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_risk_scores_created ON risk_scores(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_actions_status ON ai_actions(status);
CREATE INDEX IF NOT EXISTS idx_ai_blocklist_type ON ai_blocklist(block_type);
CREATE INDEX IF NOT EXISTS idx_ai_blocklist_expires ON ai_blocklist(expires_at) WHERE expires_at IS NOT NULL;
