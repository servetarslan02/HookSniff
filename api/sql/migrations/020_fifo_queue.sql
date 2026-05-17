CREATE TABLE IF NOT EXISTS fifo_queue (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
            event_type TEXT NOT NULL,
            payload JSONB NOT NULL,
            sequence_num BIGINT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_fifo_queue_endpoint_seq
            ON fifo_queue(endpoint_id, sequence_num);
        CREATE INDEX IF NOT EXISTS idx_fifo_queue_status
            ON fifo_queue(status) WHERE status = 'pending';
