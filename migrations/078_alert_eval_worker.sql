-- Migration 078: Alert evaluation worker support
-- Adds last_triggered_at to alert_rules + alert_history table

-- 1. Add last_triggered_at column for cooldown tracking
ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMPTZ;

-- 2. Alert history table — records every alert trigger
CREATE TABLE IF NOT EXISTS alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_rule_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    condition TEXT NOT NULL,
    actual_value DOUBLE PRECISION NOT NULL,
    threshold INT NOT NULL,
    channels_sent JSONB NOT NULL DEFAULT '[]',
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alert_history_rule ON alert_history(alert_rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_customer ON alert_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_triggered ON alert_history(triggered_at DESC);

-- 3. Add webhook_url column to alert_rules for slack/webhook channels
ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS webhook_url TEXT;
ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS cooldown_minutes INT NOT NULL DEFAULT 15;
