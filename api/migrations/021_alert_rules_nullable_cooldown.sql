-- Migration 021: Alert rules — allow platform alerts + add cooldown
-- 1. Make customer_id nullable (platform alerts)
-- 2. Add last_triggered_at for cooldown tracking
-- 3. Add cooldown_minutes for configurable cooldown

ALTER TABLE alert_rules ALTER COLUMN customer_id DROP NOT NULL;
ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMPTZ;
ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS cooldown_minutes INTEGER NOT NULL DEFAULT 15;

-- Index for active alerts (evaluation worker)
CREATE INDEX IF NOT EXISTS idx_alert_rules_active ON alert_rules(is_active) WHERE is_active = TRUE;
