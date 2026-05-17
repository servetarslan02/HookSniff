-- Operational webhook deliveries: log of every operational event sent

CREATE TABLE IF NOT EXISTS operational_webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL REFERENCES operational_webhook_endpoints(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_status SMALLINT,
    response_body TEXT,
    attempt_count SMALLINT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    delivered_at TIMESTAMPTZ,
    CONSTRAINT op_deliveries_status_check CHECK (status IN ('pending', 'success', 'failed'))
);

CREATE INDEX idx_op_deliveries_endpoint ON operational_webhook_deliveries(endpoint_id);
CREATE INDEX idx_op_deliveries_customer ON operational_webhook_deliveries(customer_id);
CREATE INDEX idx_op_deliveries_created ON operational_webhook_deliveries(customer_id, created_at DESC);
