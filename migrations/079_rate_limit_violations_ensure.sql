-- Ensure rate_limit_violations table exists (may have been skipped in some environments)
CREATE TABLE IF NOT EXISTS rate_limit_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    endpoint_id UUID REFERENCES endpoints(id) ON DELETE SET NULL,
    ip TEXT,
    requests_count INT NOT NULL,
    limit_per_window INT NOT NULL,
    window_seconds INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rl_violations_created ON rate_limit_violations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rl_violations_customer ON rate_limit_violations(customer_id);
