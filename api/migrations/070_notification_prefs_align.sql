-- 070: Align notification_preferences columns with application code
-- The original migration (008) created email_enabled/webhook_enabled/slack_enabled
-- but the application code expects email_on_failure, email_on_success, etc.

-- Add missing columns
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS email_on_failure BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS email_on_dead_letter BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS email_on_success BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS email_on_weekly_digest BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS discord_webhook_url VARCHAR(500);
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS webhook_url VARCHAR(500);

-- Migrate existing data: email_enabled → email_on_failure
UPDATE notification_preferences SET email_on_failure = email_enabled WHERE email_on_failure = true AND email_enabled = false;

-- Drop old columns (no longer used by application)
ALTER TABLE notification_preferences DROP COLUMN IF EXISTS email_enabled;
ALTER TABLE notification_preferences DROP COLUMN IF EXISTS webhook_enabled;
ALTER TABLE notification_preferences DROP COLUMN IF EXISTS slack_enabled;
