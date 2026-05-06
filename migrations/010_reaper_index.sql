-- Migration 010: Zombie reaper support
-- Adds updated_at column to webhook_queue and index for reaper queries

-- Add updated_at column (defaults to created_at for existing rows)
ALTER TABLE webhook_queue ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Trigger to auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_webhook_queue_updated_at ON webhook_queue;
CREATE TRIGGER trg_webhook_queue_updated_at
    BEFORE UPDATE ON webhook_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Index to support the zombie reaper query:
-- SELECT ... FROM webhook_queue WHERE status = 'processing' AND updated_at < ...
CREATE INDEX IF NOT EXISTS idx_webhook_queue_status_updated_at
    ON webhook_queue (status, updated_at);
