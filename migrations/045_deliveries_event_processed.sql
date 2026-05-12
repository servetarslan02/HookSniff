-- Add 'event' column (alias for event_type) and 'processed_at' to deliveries
-- These columns were applied manually to Neon DB but never committed as migrations.

-- Add 'event' column if missing (keeps event_type for backward compat)
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS event TEXT;
-- Backfill from event_type
UPDATE deliveries SET event = event_type WHERE event IS NULL AND event_type IS NOT NULL;

-- Add 'processed_at' column if missing
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;
