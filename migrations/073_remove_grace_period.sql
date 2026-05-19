-- Migration 073: Remove grace period, add billing period tracking
-- Payment failure → immediate downgrade to free (no grace period)
-- Dunning emails sent BEFORE period end (3, 2, 1 days remaining)

-- Add billing period end tracking
ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Track billing interval (month/year) for dunning schedule
ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS billing_interval VARCHAR(10) DEFAULT 'month';

-- Set current_period_end for existing paid customers (30 days from now as approximation)
UPDATE customers
SET current_period_end = NOW() + INTERVAL '30 days'
WHERE plan NOT IN ('free', 'developer')
  AND current_period_end IS NULL;

-- Clean up old grace period data (payment_failed_at no longer used for grace)
-- Keep the column for audit/logging but it won't drive downgrade logic anymore
UPDATE customers
SET payment_failed_at = NULL
WHERE payment_failed_at IS NOT NULL;
