-- Item 261: Access token revocation support
-- Two tables: individual token blacklist + per-customer revocation events

-- Individual token blacklist (by JTI)
CREATE TABLE IF NOT EXISTS revoked_tokens (
    jti         TEXT PRIMARY KEY,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for cleanup of expired blacklist entries
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires_at
    ON revoked_tokens(expires_at);

-- Per-customer revocation events (revoke-all-tokens)
-- When a customer changes password or suspects compromise, we record the time.
-- Any token issued before this timestamp is rejected.
CREATE TABLE IF NOT EXISTS token_revocation_events (
    customer_id  UUID PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
    revoked_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
