CREATE TABLE IF NOT EXISTS device_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            token TEXT NOT NULL,
            platform TEXT NOT NULL DEFAULT 'android',
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE(customer_id, token)
        );
        CREATE INDEX IF NOT EXISTS idx_device_tokens_customer ON device_tokens(customer_id);
        CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON device_tokens(token);
