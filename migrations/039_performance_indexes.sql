-- Migration 039: Performance indexes (Items 182-191)
-- Composite and single-column indexes for common query patterns

-- Deliveries: endpoint + status for dashboard filtering
CREATE INDEX IF NOT EXISTS idx_deliveries_endpoint_status
    ON deliveries(endpoint_id, status);

-- Deliveries: created_at for time-range queries
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at
    ON deliveries(created_at DESC);

-- Delivery attempts: created_at for time-range cleanup and analytics
CREATE INDEX IF NOT EXISTS idx_delivery_attempts_created_at
    ON delivery_attempts(created_at DESC);

-- Dead letters: endpoint analysis
CREATE INDEX IF NOT EXISTS idx_dead_letters_endpoint
    ON dead_letters(endpoint_id);

-- Password reset tokens: cleanup expired tokens
CREATE INDEX IF NOT EXISTS idx_password_reset_expires
    ON password_reset_tokens(expires_at);

-- Refresh tokens: cleanup expired/revoked tokens
CREATE INDEX IF NOT EXISTS idx_refresh_expires
    ON refresh_tokens(expires_at);

-- Email verification tokens: cleanup expired tokens
CREATE INDEX IF NOT EXISTS idx_email_verify_expires
    ON email_verification_tokens(expires_at);

-- Idempotency keys: cleanup 24h+ old records (Item 187)
CREATE INDEX IF NOT EXISTS idx_idempotency_created
    ON idempotency_keys(created_at);
