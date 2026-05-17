ALTER TABLE webhook_queue ADD COLUMN IF NOT EXISTS trace_id VARCHAR(64);
        ALTER TABLE delivery_attempts ADD COLUMN IF NOT EXISTS trace_id VARCHAR(64);
        CREATE INDEX IF NOT EXISTS idx_webhook_queue_trace_id
            ON webhook_queue(trace_id) WHERE trace_id IS NOT NULL;
