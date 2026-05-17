CREATE TABLE IF NOT EXISTS event_schemas (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            version INT NOT NULL DEFAULT 1,
            schema JSONB NOT NULL,
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_event_schemas_customer
            ON event_schemas(customer_id, name);
