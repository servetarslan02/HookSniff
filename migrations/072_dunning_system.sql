-- Migration 072: Dunning system — failed payment recovery
-- Creates tables for tracking dunning email reminders and payment retry attempts.
-- Adds last_payment_retry_at column to customers table.

-- Track which dunning reminders have been sent to avoid duplicate emails
CREATE TABLE IF NOT EXISTS dunning_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    days_remaining INTEGER NOT NULL CHECK (days_remaining BETWEEN 1 AND 7),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id, days_remaining)
);

CREATE INDEX IF NOT EXISTS idx_dunning_reminders_customer
    ON dunning_reminders(customer_id);

CREATE INDEX IF NOT EXISTS idx_dunning_reminders_sent_at
    ON dunning_reminders(sent_at);

-- Track payment retry attempts for observability
CREATE TABLE IF NOT EXISTS payment_retry_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL,
    subscription_id TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'attempted', -- attempted, succeeded, failed
    error_message TEXT,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_retry_customer
    ON payment_retry_attempts(customer_id);

CREATE INDEX IF NOT EXISTS idx_payment_retry_attempted_at
    ON payment_retry_attempts(attempted_at);

-- Add last_payment_retry_at to customers for tracking retry cooldown
ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS last_payment_retry_at TIMESTAMPTZ;

-- Cleanup is handled by the retention job (cleanup_old_dunning_reminders)
-- No partial index needed — the sent_at index is sufficient
