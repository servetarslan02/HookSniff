ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'stripe';
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS polar_customer_id TEXT;
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS polar_subscription_id TEXT;
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS iyzico_customer_id TEXT;
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS iyzico_subscription_id TEXT;
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
