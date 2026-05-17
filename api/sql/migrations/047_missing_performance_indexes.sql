-- delivery_attempts: time-range queries (Item 184)
        CREATE INDEX IF NOT EXISTS idx_delivery_attempts_created
            ON delivery_attempts(created_at DESC);

        -- password_reset_tokens: cleanup expired tokens (Item 188)
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires
            ON password_reset_tokens(expires_at) WHERE used = false;

        -- refresh_tokens: cleanup expired/revoked tokens (Item 189)
        CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires
            ON refresh_tokens(expires_at) WHERE revoked = false;

        -- email_verification_tokens: cleanup expired tokens (Item 190)
        CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires
            ON email_verification_tokens(expires_at) WHERE used = false;

        -- deliveries: time-range queries (Item 183)
        CREATE INDEX IF NOT EXISTS idx_deliveries_created
            ON deliveries(created_at DESC);

        -- notifications: cleanup old notifications (Item 191)
        CREATE INDEX IF NOT EXISTS idx_notifications_created
            ON notifications(created_at DESC);
