-- Cortex Stage 5: Action memory — records every cortex action and its outcome
-- This is the foundation for adaptive learning: "what action worked where"
CREATE TABLE IF NOT EXISTS cortex_action_history (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    customer_id UUID,
    action_type VARCHAR(50) NOT NULL,
    reason TEXT,
    context JSONB DEFAULT '{}',
    outcome VARCHAR(30) DEFAULT 'pending',
    outcome_details JSONB DEFAULT '{}',
    time_to_resolution_secs INT,
    success_score FLOAT,
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_action_history_endpoint ON cortex_action_history(endpoint_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_action_history_type ON cortex_action_history(action_type, outcome);
CREATE INDEX IF NOT EXISTS idx_action_history_customer ON cortex_action_history(customer_id, created_at DESC);

-- Adaptive strategy weights per endpoint
-- Multi-Armed Bandit: tracks success rate of each strategy per endpoint
CREATE TABLE IF NOT EXISTS endpoint_strategy_weights (
    endpoint_id UUID NOT NULL,
    strategy_name VARCHAR(50) NOT NULL,
    attempts INT DEFAULT 0,
    successes INT DEFAULT 0,
    avg_resolution_secs FLOAT DEFAULT 0.0,
    weight FLOAT DEFAULT 1.0,
    last_used TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (endpoint_id, strategy_name)
);
