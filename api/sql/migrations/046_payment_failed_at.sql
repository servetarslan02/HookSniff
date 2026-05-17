ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ;
        CREATE INDEX IF NOT EXISTS idx_customers_payment_failed
            ON customers(payment_failed_at) WHERE payment_failed_at IS NOT NULL;
