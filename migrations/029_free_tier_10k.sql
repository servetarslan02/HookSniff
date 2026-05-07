-- Free tier limit: 1,000 → 10,000 webhooks/month
-- HookSniff MVP: rekabetçi free tier

-- Update existing free-tier customers
UPDATE customers SET webhook_limit = 10000 WHERE plan = 'free' AND webhook_limit = 1000;

-- Update column default for new signups
ALTER TABLE customers ALTER COLUMN webhook_limit SET DEFAULT 10000;
