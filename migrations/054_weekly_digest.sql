-- Add email_on_weekly_digest to notification_preferences
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS email_on_weekly_digest BOOLEAN NOT NULL DEFAULT false;
