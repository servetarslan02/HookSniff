-- Test mode support: mark deliveries and queue items created with test API keys.
-- Test deliveries are not sent to real endpoints; they get an immediate mock response.

ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE webhook_queue ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;

-- Index for filtering test deliveries in the dashboard
CREATE INDEX IF NOT EXISTS idx_deliveries_is_test ON deliveries(is_test) WHERE is_test = true;
