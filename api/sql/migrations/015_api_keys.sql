CREATE TABLE IF NOT EXISTS api_keys (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            api_key_hash TEXT NOT NULL,
            api_key_prefix TEXT NOT NULL,
            name TEXT NOT NULL DEFAULT 'Default',
            is_active BOOL NOT NULL DEFAULT true,
            last_used_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_api_keys_customer
            ON api_keys(customer_id);
        CREATE INDEX IF NOT EXISTS idx_api_keys_hash
            ON api_keys(api_key_hash);
