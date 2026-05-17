CREATE TABLE IF NOT EXISTS customers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT NOT NULL UNIQUE,
            api_key_hash TEXT NOT NULL,
            api_key_prefix TEXT NOT NULL,
            plan TEXT NOT NULL DEFAULT 'free',
            webhook_limit INT NOT NULL DEFAULT 10000,
            webhook_count INT NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS endpoints (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            url TEXT NOT NULL,
            description TEXT,
            is_active BOOL NOT NULL DEFAULT true,
            signing_secret TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS deliveries (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            payload JSONB NOT NULL,
            event_type TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            attempt_count INT NOT NULL DEFAULT 0,
            max_attempts INT NOT NULL DEFAULT 3,
            last_attempt_at TIMESTAMPTZ,
            response_status INT,
            response_body TEXT,
            next_retry_at TIMESTAMPTZ,
            replay_count INT NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS delivery_attempts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
            attempt_number INT NOT NULL,
            status_code INT,
            response_body TEXT,
            duration_ms INT,
            error_message TEXT,
            trace_id VARCHAR(64),
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_attempts_delivery ON delivery_attempts(delivery_id);

        CREATE TABLE IF NOT EXISTS dead_letters (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
            endpoint_id UUID NOT NULL REFERENCES endpoints(id),
            customer_id UUID NOT NULL REFERENCES customers(id),
            payload JSONB NOT NULL,
            reason TEXT,
            attempts INT NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS idempotency_keys (
            key TEXT PRIMARY KEY,
            customer_id UUID NOT NULL REFERENCES customers(id),
            response_body JSONB NOT NULL,
            status_code INT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            expires_at TIMESTAMPTZ NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
        CREATE INDEX IF NOT EXISTS idx_deliveries_customer ON deliveries(customer_id);
        CREATE INDEX IF NOT EXISTS idx_deliveries_next_retry ON deliveries(next_retry_at) WHERE status = 'pending';
        CREATE INDEX IF NOT EXISTS idx_endpoints_customer ON endpoints(customer_id);
        CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON idempotency_keys(expires_at);
