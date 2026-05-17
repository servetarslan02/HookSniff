CREATE TABLE IF NOT EXISTS notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            type TEXT NOT NULL DEFAULT 'system',
            title TEXT NOT NULL,
            message TEXT,
            is_read BOOL NOT NULL DEFAULT false,
            link TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_notifications_customer
            ON notifications(customer_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_notifications_unread
            ON notifications(customer_id, is_read) WHERE is_read = FALSE;
