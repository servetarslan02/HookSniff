CREATE TABLE IF NOT EXISTS webhook_queue (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            delivery_id UUID NOT NULL,
            endpoint_id UUID NOT NULL,
            endpoint_url TEXT NOT NULL,
            payload TEXT NOT NULL,
            custom_headers JSONB,
            attempt_count INT NOT NULL DEFAULT 0,
            max_attempts INT NOT NULL DEFAULT 3,
            next_retry_at TIMESTAMPTZ,
            status TEXT NOT NULL DEFAULT 'pending',
            trace_id VARCHAR(64),
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            processed_at TIMESTAMPTZ
        );

        CREATE INDEX IF NOT EXISTS idx_webhook_queue_pending
            ON webhook_queue(status, next_retry_at)
            WHERE status = 'pending';

        CREATE INDEX IF NOT EXISTS idx_webhook_queue_delivery
            ON webhook_queue(delivery_id);

        CREATE INDEX IF NOT EXISTS idx_webhook_queue_trace_id
            ON webhook_queue(trace_id) WHERE trace_id IS NOT NULL;
