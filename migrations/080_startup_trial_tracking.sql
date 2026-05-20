-- Migration 080: Track if customer has used Startup first-month-free trial
-- Prevents the same account from getting the discount multiple times.

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS has_used_startup_trial BOOLEAN NOT NULL DEFAULT false;
