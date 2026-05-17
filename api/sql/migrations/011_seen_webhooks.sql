CREATE TABLE IF NOT EXISTS seen_webhooks (
            webhook_id TEXT PRIMARY KEY,
            seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            expires_at TIMESTAMPTZ NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_seen_webhooks_expires
            ON seen_webhooks (expires_at);
