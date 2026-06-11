-- Fix: Change default plan from 'free' to 'developer' for new customers.
-- The plan system uses: developer (free), startup, pro, enterprise.
-- 'free' was a legacy name — all new accounts should start as 'developer'.

-- Update existing 'free' customers to 'developer'
UPDATE customers SET plan = 'developer', updated_at = NOW() WHERE plan = 'free';

-- Change the column default
ALTER TABLE customers ALTER COLUMN plan SET DEFAULT 'developer';

-- Ensure CHECK constraint includes 'developer' (add or replace)
ALTER TABLE customers DROP CONSTRAINT IF EXISTS chk_customers_plan;
ALTER TABLE customers ADD CONSTRAINT chk_customers_plan
    CHECK (plan = ANY (ARRAY['developer'::text, 'startup'::text, 'pro'::text, 'enterprise'::text]));
