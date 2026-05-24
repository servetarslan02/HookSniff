-- Cortex Worker Integration: missing columns + table name fix
-- Fixes: active_url, routing_config, response_url + routing_decisions rename

-- 1. Add active_url column to endpoints (for smart routing URL switching)
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS active_url VARCHAR(2000);

-- 2. Add routing_config column to endpoints (for fallback URL configuration)
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS routing_config JSONB;

-- 3. Add response_url column to delivery_attempts (for smart routing URL scoring)
ALTER TABLE delivery_attempts ADD COLUMN IF NOT EXISTS response_url VARCHAR(2000);

-- 4. Rename routing_decisions → cortex_routing_decisions (match worker query)
ALTER TABLE IF EXISTS routing_decisions RENAME TO cortex_routing_decisions;

-- 5. Index for smart routing lookups
CREATE INDEX IF NOT EXISTS idx_routing_decisions_endpoint
    ON cortex_routing_decisions(endpoint_id, created_at DESC);

-- 6. Index for response_url lookups
CREATE INDEX IF NOT EXISTS idx_delivery_attempts_response_url
    ON delivery_attempts(response_url, created_at DESC)
    WHERE response_url IS NOT NULL;
