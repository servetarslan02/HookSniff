CREATE TABLE IF NOT EXISTS transform_rules (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
            rule_json JSONB NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_transform_rules_endpoint
            ON transform_rules(endpoint_id);
