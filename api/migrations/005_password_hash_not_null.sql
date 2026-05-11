-- Migration 005: Enforce password_hash NOT NULL
-- Addresses: HS-SECURITY — account takeover risk when password_hash is NULL
--
-- Problem: OAuth users (created via Google/GitHub) have NULL password_hash
-- because OAuth flow doesn't set a password. A malicious user could exploit
-- this to bypass authentication.
--
-- Strategy:
-- 1. Set a sentinel value for all NULL password_hash entries.
--    The sentinel "!NEEDS_PASSWORD_RESET!" is not a valid Argon2 PHC string,
--    so password verification will always fail (Argon2::verify_password returns false).
--    OAuth users don't use password login, so this is safe.
-- 2. Make password_hash NOT NULL so future accounts can't have NULL.

-- Step 1: Set sentinel for existing NULL password_hash entries
UPDATE customers
SET password_hash = '!NEEDS_PASSWORD_RESET!'
WHERE password_hash IS NULL;

-- Step 2: Set default value for new OAuth users and make NOT NULL
-- OAuth users don't set password_hash, so they get the sentinel by default.
ALTER TABLE customers ALTER COLUMN password_hash SET DEFAULT '!NEEDS_PASSWORD_RESET!';
ALTER TABLE customers ALTER COLUMN password_hash SET NOT NULL;

-- Step 3: Create indexes for token lookups (if tables exist)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'password_reset_tokens') THEN
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires
            ON password_reset_tokens(expires_at)
            WHERE expires_at IS NOT NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'refresh_tokens') THEN
        CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires
            ON refresh_tokens(expires_at)
            WHERE expires_at IS NOT NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_verification_tokens') THEN
        CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires
            ON email_verification_tokens(expires_at)
            WHERE expires_at IS NOT NULL;
    END IF;
END $$;
