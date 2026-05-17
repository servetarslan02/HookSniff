CREATE TABLE IF NOT EXISTS delivery_targets (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
            target_type TEXT NOT NULL DEFAULT 'http',
            config JSONB NOT NULL DEFAULT '{}',
            enabled BOOL NOT NULL DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_delivery_targets_endpoint
            ON delivery_targets(endpoint_id);

        CREATE TABLE IF NOT EXISTS fanout_rules (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            event_pattern TEXT NOT NULL,
            conditions JSONB,
            target_ids UUID[] NOT NULL DEFAULT '{}',
            dead_letter_endpoint_id UUID,
            enabled BOOL NOT NULL DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_fanout_rules_customer
            ON fanout_rules(customer_id);
