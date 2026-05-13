-- Migration 047: Add missing columns to customers table
-- These columns exist in Customer struct and are used in login queries
-- but were never added in any migration.

-- Whether the subscription should cancel at end of current billing period
ALTER TABLE customers ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;

-- Timestamp when payment last failed (grace period tracking)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ;

-- Whether overage is allowed (never-blocked mode)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS allow_overage BOOLEAN NOT NULL DEFAULT true;

-- Whether to send email notifications for overage
ALTER TABLE customers ADD COLUMN IF NOT EXISTS overage_email_notification BOOLEAN NOT NULL DEFAULT true;

-- Payment provider and subscription IDs (if missing from migration 016)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50) NOT NULL DEFAULT 'stripe';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS polar_subscription_id VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS iyzico_subscription_id VARCHAR(255);
