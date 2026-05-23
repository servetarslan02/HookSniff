-- Cortex Stage 6: Recovery surge tracking
CREATE TABLE IF NOT EXISTS recovery_surges (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    trigger_reason VARCHAR(100),
    queued_count INT DEFAULT 0,
    processed_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    current_rate_per_min FLOAT DEFAULT 0.0,
    target_rate_per_min FLOAT DEFAULT 0.0,
    ramp_step INT DEFAULT 0,
    total_steps INT DEFAULT 5,
    status VARCHAR(20) DEFAULT 'active',
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_surge_active ON recovery_surges(status, started_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_surge_endpoint ON recovery_surges(endpoint_id, started_at DESC);
