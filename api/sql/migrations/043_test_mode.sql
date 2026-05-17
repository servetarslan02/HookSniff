ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;
        ALTER TABLE webhook_queue ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;
        CREATE INDEX IF NOT EXISTS idx_deliveries_is_test ON deliveries(is_test) WHERE is_test = true;
