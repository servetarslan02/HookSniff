ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fifo_enabled BOOL DEFAULT false;
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fifo_sequence BIGINT DEFAULT 0;
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fifo_group_by_customer BOOL DEFAULT false;
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fifo_max_wait_secs INT DEFAULT 300;
        ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS sequence_num BIGINT;
        ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS fifo_group_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_deliveries_fifo
            ON deliveries(endpoint_id, sequence_num)
            WHERE status = 'pending' AND sequence_num IS NOT NULL;
