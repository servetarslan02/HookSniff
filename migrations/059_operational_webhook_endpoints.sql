-- Operational webhook endpoints: where to send system events (delivery failures, endpoint disabled, etc.)

CREATE TABLE IF NOT EXISTS operational_webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    signing_secret VARCHAR(128) NOT NULL,
    event_types TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_op_webhook_endpoints_customer ON operational_webhook_endpoints(customer_id);
