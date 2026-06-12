-- ═══════════════════════════════════════════════════════════════
-- HookSniff Performance Fixes — Database Migration
-- ═══════════════════════════════════════════════════════════════
-- Run: psql $DATABASE_URL -f 112_performance_fixes.sql

-- 1. Idempotency cache table (reduces per-message DB queries in Redis consumer)
CREATE TABLE IF NOT EXISTS delivery_idempotency_cache (
    delivery_id UUID PRIMARY KEY,
    status TEXT NOT NULL,
    cached_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-expire after 5 minutes
CREATE INDEX IF NOT EXISTS idx_idempotency_cache_expiry
    ON delivery_idempotency_cache(cached_at);

-- 2. Auth lookup optimization — composite index for prefix-based lookups
CREATE INDEX IF NOT EXISTS idx_customers_api_key_prefix_active
    ON customers(api_key_prefix)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_api_keys_prefix_active
    ON api_keys(api_key_prefix)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_service_tokens_prefix_active
    ON service_tokens(token_prefix)
    WHERE is_active = true;

-- 3. Webhook queue priority index (if not exists from earlier migration)
CREATE INDEX IF NOT EXISTS idx_queue_priority_poll
    ON webhook_queue(status, created_at ASC)
    WHERE status = 'pending';
