-- Playground history table for webhook testing (Neon/PostgreSQL)
-- Used by Next.js dashboard playground feature

CREATE TABLE IF NOT EXISTS playground_history (
    id TEXT PRIMARY KEY,
    token TEXT NOT NULL,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    query JSONB DEFAULT '{}',
    headers JSONB DEFAULT '{}',
    body TEXT,
    content_length INTEGER DEFAULT 0,
    ip TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_playground_history_token ON playground_history (token, timestamp DESC);

-- Auto-cleanup: 24 saatten eski kayıtları temizle (pg_cron ile veya manual)
-- SELECT cron.schedule('cleanup-playground', '0 * * * *', $$DELETE FROM playground_history WHERE timestamp < NOW() - INTERVAL '24 hours'$$);
