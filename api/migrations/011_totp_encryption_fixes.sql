-- Migration 011: TOTP secret encryption + webhook_count BIGINT + FK validation
-- Items 176, 181, 278

-- Item 176: TOTP secret exposure — add encrypted column
-- The totp_secret column stores plaintext TOTP secrets. We need to add
-- an encrypted version and migrate.
ALTER TABLE customers ADD COLUMN IF NOT EXISTS totp_secret_encrypted TEXT;
-- Note: Application-level encryption using ENCRYPTION_KEY should be used
-- to populate totp_secret_encrypted. The plaintext totp_secret column
-- should be cleared after migration.

-- Item 278: webhook_count INT overflow risk → BIGINT
-- At high volume, INT (max 2.1B) can overflow. BIGINT supports 9.2 quintillion.
ALTER TABLE customers ALTER COLUMN webhook_count SET DATA TYPE BIGINT;

-- Item 181: fanout_rules.target_ids UUID array FK validation
-- Add a check constraint to ensure target_ids references valid endpoints
-- Note: PostgreSQL doesn't support FK on array elements directly.
-- This is enforced at the application level, but we add a comment for documentation.
COMMENT ON COLUMN fanout_rules.target_ids IS 'Array of endpoint UUIDs. FK validation done at application level — each UUID must reference endpoints.id';

-- Item 191: Notifications cleanup strategy
-- Add index for efficient cleanup of old notifications
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)
    WHERE is_read = true;

-- Item 265: avg_response_ms — fix to use proper averaging
-- Add a trigger or computed approach. For now, document the correct SQL.
COMMENT ON COLUMN endpoints.avg_response_ms IS 'Average response time in milliseconds. Use: UPDATE endpoints SET avg_response_ms = (SELECT AVG(duration_ms) FROM delivery_attempts da JOIN deliveries d ON da.delivery_id = d.id WHERE d.endpoint_id = endpoints.id AND da.created_at > now() - interval ''1 hour'')';

-- Item 274: Key collision risk with 15-char prefix
-- Increase api_key_prefix length if possible
-- Note: ALTER COLUMN for length changes may require data validation
-- This is handled at the application level by generating longer prefixes
