-- 085: refunds table (was missing — admin refund and refund_requests depend on it)

CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    amount_cents BIGINT NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    reason TEXT,
    admin_user_id UUID REFERENCES customers(id),
    provider TEXT NOT NULL DEFAULT 'polar',
    provider_refund_id TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_customer ON refunds(customer_id);
