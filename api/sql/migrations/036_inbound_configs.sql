CREATE TABLE IF NOT EXISTS inbound_configs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            provider TEXT NOT NULL,
            secret TEXT NOT NULL DEFAULT '',
            endpoint_id UUID REFERENCES endpoints(id) ON DELETE SET NULL,
            enabled BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE(customer_id, provider)
        );
        CREATE INDEX IF NOT EXISTS idx_inbound_configs_customer
            ON inbound_configs(customer_id);
