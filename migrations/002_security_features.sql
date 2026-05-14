-- Security features: rate limiting, IP allowlisting, request signing verification

ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS ip_whitelist TEXT;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS rate_limit_per_minute INT NOT NULL DEFAULT 60;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS secret_rotation_at TIMESTAMPTZ;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS signature_header TEXT NOT NULL DEFAULT 'X-HookSniff-Signature';

ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS source_ip TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS request_headers JSONB;

ALTER TABLE customers ADD COLUMN IF NOT EXISTS ip_allowlist TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS webhook_timeout_seconds INT NOT NULL DEFAULT 30;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS failed_delivery_count INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_deliveries_idempotency ON deliveries(idempotency_key) WHERE idempotency_key IS NOT NULL;
