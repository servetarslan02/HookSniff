-- Migration 012: Add trace_id columns for OpenTelemetry distributed tracing
-- Adds trace_id to webhook_queue and delivery_attempts tables

-- Add trace_id to webhook_queue
ALTER TABLE webhook_queue ADD COLUMN IF NOT EXISTS trace_id VARCHAR(64);

-- Add trace_id to delivery_attempts
ALTER TABLE delivery_attempts ADD COLUMN IF NOT EXISTS trace_id VARCHAR(64);

-- Index for looking up queue items by trace_id
CREATE INDEX IF NOT EXISTS idx_webhook_queue_trace_id ON webhook_queue(trace_id) WHERE trace_id IS NOT NULL;
