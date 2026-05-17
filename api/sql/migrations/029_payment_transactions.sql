CREATE TABLE IF NOT EXISTS payment_transactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            provider TEXT NOT NULL DEFAULT 'stripe',
            provider_tx_id TEXT,
            amount_cents BIGINT NOT NULL DEFAULT 0,
            currency TEXT NOT NULL DEFAULT 'USD',
            status TEXT NOT NULL DEFAULT 'completed',
            plan TEXT NOT NULL DEFAULT 'free',
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_payment_transactions_customer ON payment_transactions(customer_id);
        CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider ON payment_transactions(provider, provider_tx_id);
