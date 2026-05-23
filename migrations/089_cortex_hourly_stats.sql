-- Cortex Stage 1: Hourly stats aggregation table
-- Populated by background job from delivery_attempts + deliveries
CREATE TABLE IF NOT EXISTS endpoint_hourly_stats (
    endpoint_id UUID NOT NULL,
    hour_start TIMESTAMPTZ NOT NULL,
    total_deliveries INT DEFAULT 0,
    successful INT DEFAULT 0,
    failed INT DEFAULT 0,
    avg_latency_ms INT DEFAULT 0,
    p50_latency_ms INT DEFAULT 0,
    p95_latency_ms INT DEFAULT 0,
    p99_latency_ms INT DEFAULT 0,
    error_breakdown JSONB DEFAULT '{}',
    PRIMARY KEY (endpoint_id, hour_start)
);

CREATE INDEX IF NOT EXISTS idx_hourly_stats_endpoint
    ON endpoint_hourly_stats(endpoint_id, hour_start DESC);

-- Retention: auto-delete after 90 days (handled by retention job)
