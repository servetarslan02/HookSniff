ALTER TABLE customers ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;
        CREATE INDEX IF NOT EXISTS idx_customers_cancel_at_period_end
            ON customers(cancel_at_period_end) WHERE cancel_at_period_end = true;
