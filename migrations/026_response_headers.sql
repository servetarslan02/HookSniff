-- Migration 026: Add response_headers column to delivery_attempts
ALTER TABLE delivery_attempts ADD COLUMN IF NOT EXISTS response_headers JSONB;
