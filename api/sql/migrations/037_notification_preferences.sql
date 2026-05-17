CREATE TABLE IF NOT EXISTS notification_preferences (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            email_on_failure BOOLEAN NOT NULL DEFAULT true,
            email_on_dead_letter BOOLEAN NOT NULL DEFAULT true,
            email_on_success BOOLEAN NOT NULL DEFAULT false,
            slack_webhook_url TEXT,
            discord_webhook_url TEXT,
            webhook_url TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE(customer_id)
        );
        CREATE INDEX IF NOT EXISTS idx_notification_preferences_customer
            ON notification_preferences(customer_id);
