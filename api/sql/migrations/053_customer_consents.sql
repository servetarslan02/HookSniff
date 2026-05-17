CREATE TABLE IF NOT EXISTS customer_consents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            consents JSONB NOT NULL DEFAULT '{}',
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE(customer_id)
        );
        CREATE INDEX IF NOT EXISTS idx_customer_consents_customer ON customer_consents(customer_id);
