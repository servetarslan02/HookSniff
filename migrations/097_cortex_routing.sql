-- Cortex Stage 9: Smart routing — track endpoint performance for routing decisions
CREATE TABLE IF NOT EXISTS routing_decisions (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    selected_url VARCHAR(2000),
    reason VARCHAR(100),
    alternatives JSONB DEFAULT '[]',
    latency_ms INT,
    success BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_routing_endpoint ON routing_decisions(endpoint_id, created_at DESC);
