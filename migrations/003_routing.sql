-- 003_routing: Smart routing columns for endpoints

-- Routing strategy: round-robin (default), latency, failover
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS routing_strategy STRING NOT NULL DEFAULT 'round-robin';

-- Fallback URL for automatic failover
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fallback_url STRING;

-- Latency tracking: rolling average response time in ms
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS avg_response_ms INT NOT NULL DEFAULT 0;

-- Failure tracking: consecutive failure count
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS failure_streak INT NOT NULL DEFAULT 0;

-- Last failure timestamp for health-aware routing (5 min window)
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS last_failure_at TIMESTAMPTZ;

-- Index for health-aware queries
CREATE INDEX IF NOT EXISTS idx_endpoints_failure_streak ON endpoints(failure_streak) WHERE failure_streak > 0;
