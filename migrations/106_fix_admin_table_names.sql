-- Migration 106: Fix table names for admin detail endpoints
-- Rename tables to match Rust code expectations

-- payments -> payment_transactions
ALTER TABLE IF EXISTS payments RENAME TO payment_transactions;
ALTER INDEX IF EXISTS idx_payments_customer RENAME TO idx_payment_transactions_customer;

-- admin_communications -> communication_history
ALTER TABLE IF EXISTS admin_communications RENAME TO communication_history;
ALTER INDEX IF EXISTS idx_admin_comms_customer RENAME TO idx_communication_history_customer;

-- Add missing columns that Rust code expects
ALTER TABLE IF EXISTS payment_transactions ADD COLUMN IF NOT EXISTS provider_transaction_id TEXT;
ALTER TABLE IF EXISTS payment_transactions ADD COLUMN IF NOT EXISTS metadata JSONB;
