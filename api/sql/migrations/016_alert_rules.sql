CREATE TABLE IF NOT EXISTS alert_rules (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            condition TEXT NOT NULL,
            threshold INT NOT NULL DEFAULT 0,
            channels JSONB NOT NULL DEFAULT '[]',
            is_active BOOL NOT NULL DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_alert_rules_customer
            ON alert_rules(customer_id);
