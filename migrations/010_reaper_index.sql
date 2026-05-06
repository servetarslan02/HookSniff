-- Index to support the zombie reaper query:
-- SELECT ... FROM webhook_queue WHERE status = 'processing' AND updated_at < ...
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_queue_status_updated_at
    ON webhook_queue (status, updated_at);
