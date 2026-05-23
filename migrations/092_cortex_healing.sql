-- Cortex Stage 4: Self-healing actions and recovery tests
CREATE TABLE IF NOT EXISTS healing_actions (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    reason TEXT,
    details JSONB DEFAULT '{}',
    outcome VARCHAR(30) DEFAULT 'pending',
    outcome_details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_healing_endpoint ON healing_actions(endpoint_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_healing_pending ON healing_actions(outcome, created_at DESC) WHERE outcome = 'pending';

-- Track which endpoints are auto-disabled
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS auto_disabled BOOLEAN DEFAULT false;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS auto_disabled_at TIMESTAMPTZ;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS auto_disable_reason TEXT;
