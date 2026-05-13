-- Migration 016: Add missing payment columns to customers table
-- These columns are referenced in Customer struct and login queries
-- but were never added in any migration.

ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50) NOT NULL DEFAULT 'stripe';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS polar_subscription_id VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS iyzico_subscription_id VARCHAR(255);
