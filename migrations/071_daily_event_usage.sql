-- Migration 071: Daily event usage tracking for overage notifications
-- Tracks per-day event counts and overage counts for billing notifications.

CREATE TABLE IF NOT EXISTS daily_event_usage (
    id BIGSERIAL PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    event_date DATE NOT NULL DEFAULT CURRENT_DATE,
    event_count BIGINT NOT NULL DEFAULT 0,
    overage_count BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(customer_id, event_date)
);

-- Index for cleanup and lookups
CREATE INDEX idx_daily_event_usage_date ON daily_event_usage(event_date);
CREATE INDEX idx_daily_event_usage_customer ON daily_event_usage(customer_id, event_date);

-- Auto-cleanup: delete rows older than 90 days (handled by retention job, but good to have)
COMMENT ON TABLE daily_event_usage IS 'Daily webhook event usage tracking for overage notifications. Rows older than 90 days can be cleaned up.';
