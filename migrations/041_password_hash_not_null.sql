-- Migration 041: password_hash NOT NULL (Item 173)
-- OAuth users get a sentinel hash that will never match any real password
-- NOTE: code must be updated to remove Option<String> for password_hash
--       and check for sentinel value instead of NULL for OAuth detection

-- Backfill NULL password_hash with sentinel (argon2 hash of "OAUTH_NO_PASSWORD_SENTINEL")
UPDATE customers
SET password_hash = '!oauth_no_password!'
WHERE password_hash IS NULL;

ALTER TABLE customers ALTER COLUMN password_hash SET NOT NULL;
