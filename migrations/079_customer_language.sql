-- Migration 079: Add language preference to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'tr';
