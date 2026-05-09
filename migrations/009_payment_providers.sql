-- Migration 009: Add multi-provider payment support (Polar.sh + iyzico)
-- Adds payment_provider field and provider-specific IDs to customers table.

-- Add payment provider column
ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'stripe';

-- Polar.sh fields
ALTER TABLE customers ADD COLUMN IF NOT EXISTS polar_customer_id STRING;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS polar_subscription_id STRING;

-- iyzico fields
ALTER TABLE customers ADD COLUMN IF NOT EXISTS iyzico_customer_id STRING;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS iyzico_subscription_id STRING;

-- Index for provider lookups
CREATE INDEX IF NOT EXISTS idx_customers_payment_provider ON customers(payment_provider);
CREATE INDEX IF NOT EXISTS idx_customers_polar_id ON customers(polar_customer_id) WHERE polar_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_iyzico_id ON customers(iyzico_customer_id) WHERE iyzico_customer_id IS NOT NULL;

-- Payment transactions log table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,          -- 'stripe' | 'polar' | 'iyzico'
    provider_tx_id TEXT,             -- External transaction ID
    amount_cents INT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending',  -- pending, completed, failed, refunded
    plan TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_tx_customer ON payment_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_provider ON payment_transactions(provider, provider_tx_id);
