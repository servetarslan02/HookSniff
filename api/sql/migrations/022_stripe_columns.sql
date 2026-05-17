ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
