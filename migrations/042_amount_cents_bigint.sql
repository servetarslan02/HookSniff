-- Migration 042: amount_cents BIGINT (Item 186)
-- Prevent integer overflow for large payment amounts

ALTER TABLE payment_transactions ALTER COLUMN amount_cents TYPE BIGINT;
ALTER TABLE invoices ALTER COLUMN amount_cents TYPE BIGINT;
