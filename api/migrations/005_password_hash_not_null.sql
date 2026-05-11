-- Migration 005: Enforce password_hash NOT NULL for password-based accounts
-- Addresses: HS-SECURITY — account takeover risk when password_hash is NULL
--
-- Strategy:
-- 1. First, ensure all existing users with NULL password_hash have a disabled/locked state
--    OR set a sentinel value that cannot be used for login.
-- 2. Add a CHECK constraint: password_hash is NOT NULL for non-OAuth users.
--
-- Note: OAuth-only users (google_id IS NOT NULL) may legitimately have NULL password_hash.
-- We handle this with a conditional CHECK constraint.

-- Step 1: Set a sentinel hash for any existing users with NULL password_hash
-- who are NOT OAuth-only users. The sentinel starts with "!" which no valid Argon2 hash
-- will ever produce, so login will always fail for these accounts until they reset their password.
UPDATE customers
SET password_hash = '!NEEDS_PASSWORD_RESET!'
WHERE password_hash IS NULL
  AND (google_id IS NULL OR google_id = '');

-- Step 2: Add CHECK constraint
-- A customer must have EITHER a password_hash OR a google_id (OAuth)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_password_or_oauth') THEN
        ALTER TABLE customers
            ADD CONSTRAINT chk_password_or_oauth
            CHECK (
                password_hash IS NOT NULL
                OR (google_id IS NOT NULL AND google_id != '')
            );
    END IF;
END $$;

-- Step 3: Create index for password reset token lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires
    ON password_reset_tokens(expires_at)
    WHERE expires_at IS NOT NULL;

-- Step 4: Create index for refresh token lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires
    ON refresh_tokens(expires_at)
    WHERE expires_at IS NOT NULL;

-- Step 5: Create index for email verification token lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires
    ON email_verification_tokens(expires_at)
    WHERE expires_at IS NOT NULL;
