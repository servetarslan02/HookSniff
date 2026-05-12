-- Never Blocked: overage settings and daily event tracking

-- Add overage settings to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS allow_overage BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS overage_email_notification BOOLEAN NOT NULL DEFAULT true;

-- Daily event tracking for per-day limits (separate from monthly webhook_count)
CREATE TABLE IF NOT EXISTS daily_event_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    event_date DATE NOT NULL DEFAULT CURRENT_DATE,
    event_count BIGINT NOT NULL DEFAULT 0,
    overage_count BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(customer_id, event_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_event_usage_customer_date ON daily_event_usage(customer_id, event_date);

-- Updated_at trigger for daily_event_usage
CREATE OR REPLACE FUNCTION update_daily_event_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_daily_event_usage_updated_at
    BEFORE UPDATE ON daily_event_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_event_usage_updated_at();
