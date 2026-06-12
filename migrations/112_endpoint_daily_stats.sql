-- Migration 057: Endpoint daily stats for hot/cold data separation
-- Aggregates hourly stats older than 7 days into daily summaries.

CREATE TABLE IF NOT EXISTS endpoint_daily_stats (
    endpoint_id     UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
    day_start       TIMESTAMPTZ NOT NULL,
    total_deliveries BIGINT NOT NULL DEFAULT 0,
    successful      BIGINT NOT NULL DEFAULT 0,
    failed          BIGINT NOT NULL DEFAULT 0,
    avg_latency_ms  INT NOT NULL DEFAULT 0,
    p50_latency_ms  INT NOT NULL DEFAULT 0,
    p95_latency_ms  INT NOT NULL DEFAULT 0,
    p99_latency_ms  INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (endpoint_id, day_start)
);

-- Index for cleanup job and historical queries
CREATE INDEX IF NOT EXISTS idx_daily_stats_day
    ON endpoint_daily_stats(day_start);

-- Index for per-endpoint lookups
CREATE INDEX IF NOT EXISTS idx_daily_stats_endpoint
    ON endpoint_daily_stats(endpoint_id, day_start DESC);
