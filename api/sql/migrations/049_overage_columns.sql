ALTER TABLE customers ADD COLUMN IF NOT EXISTS allow_overage BOOLEAN NOT NULL DEFAULT true;
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS overage_email_notification BOOLEAN NOT NULL DEFAULT true;
