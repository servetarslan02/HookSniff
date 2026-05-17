CREATE TABLE IF NOT EXISTS retry_policies (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            endpoint_id UUID NOT NULL UNIQUE REFERENCES endpoints(id) ON DELETE CASCADE,
            max_attempts INT NOT NULL DEFAULT 5,
            base_delay_ms BIGINT NOT NULL DEFAULT 1000,
            max_delay_ms BIGINT NOT NULL DEFAULT 3600000,
            multiplier DOUBLE PRECISION NOT NULL DEFAULT 2.0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_retry_policies_endpoint
            ON retry_policies(endpoint_id);
