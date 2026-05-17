ALTER TABLE idempotency_keys ADD COLUMN IF NOT EXISTS body_hash TEXT;
        CREATE INDEX IF NOT EXISTS idx_idempotency_key_hash
            ON idempotency_keys(key, customer_id, body_hash);
