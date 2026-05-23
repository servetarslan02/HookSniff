-- Cortex Stage 3: Anomaly scores
CREATE TABLE IF NOT EXISTS anomaly_scores (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    score INT NOT NULL,
    factors JSONB NOT NULL,
    category VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_anomaly_endpoint ON anomaly_scores(endpoint_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anomaly_customer ON anomaly_scores(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anomaly_high ON anomaly_scores(score DESC) WHERE score > 70;

-- Cortex Stage 3: Alert correlation (groups related alerts)
CREATE TABLE IF NOT EXISTS alert_correlations (
    id BIGSERIAL PRIMARY KEY,
    root_cause VARCHAR(100),
    affected_endpoints JSONB DEFAULT '[]',
    alert_count INT DEFAULT 0,
    severity VARCHAR(20) DEFAULT 'medium',
    first_seen TIMESTAMPTZ DEFAULT now(),
    last_seen TIMESTAMPTZ DEFAULT now(),
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_correlation_active ON alert_correlations(resolved, last_seen DESC) WHERE resolved = false;
