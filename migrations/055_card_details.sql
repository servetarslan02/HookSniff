-- Add card metadata columns to customers table
-- Stores last-4 digits, brand, and expiry from payment provider

ALTER TABLE customers ADD COLUMN IF NOT EXISTS card_last4 VARCHAR(4);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS card_brand VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS card_exp_month SMALLINT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS card_exp_year SMALLINT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS card_updated_at TIMESTAMPTZ;
