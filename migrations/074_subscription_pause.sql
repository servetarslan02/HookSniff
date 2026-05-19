-- Migration 074: Subscription pause/freeze feature
-- Allows customers to temporarily pause their subscription instead of canceling.

-- Track pause state
ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS paused_until TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS pause_plan VARCHAR(20);

-- Index for auto-resume check
CREATE INDEX IF NOT EXISTS idx_customers_paused
    ON customers(paused_until)
    WHERE paused_at IS NOT NULL;
