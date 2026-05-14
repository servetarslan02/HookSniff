-- HookSniff Database Schema
-- Run against CockroachDB

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    api_key_hash TEXT NOT NULL UNIQUE,
    api_key_prefix TEXT NOT NULL,
    password_hash TEXT,
    plan TEXT NOT NULL DEFAULT 'free',
    webhook_limit INT NOT NULL DEFAULT 1000,
    webhook_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_api_key_hash ON customers (api_key_hash);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);

CREATE TABLE IF NOT EXISTS endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    description TEXT,
    is_active BOOL NOT NULL DEFAULT true,
    signing_secret TEXT NOT NULL,
    allowed_ips JSONB,
    event_filter TEXT[],
    custom_headers JSONB,
    retry_policy JSONB,
    old_signing_secret TEXT,
    secret_rotated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_endpoints_customer_id ON endpoints (customer_id);

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

CREATE INDEX IF NOT EXISTS idx_deliveries_customer_id ON deliveries (customer_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_endpoint_id ON deliveries (endpoint_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries (status);
CREATE INDEX IF NOT EXISTS idx_deliveries_next_retry ON deliveries (next_retry_at) WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS delivery_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL,
    status_code INT,
    response_body TEXT,
    duration_ms INT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delivery_attempts_delivery_id ON delivery_attempts (delivery_id);

CREATE TABLE IF NOT EXISTS dead_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL,
    endpoint_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    payload JSONB NOT NULL,
    reason TEXT,
    attempts INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dead_letters_customer_id ON dead_letters (customer_id);

CREATE TABLE IF NOT EXISTS idempotency_keys (
    key TEXT NOT NULL,
    customer_id UUID NOT NULL,
    response_body JSONB NOT NULL,
    status_code INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (key, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON idempotency_keys (expires_at);
