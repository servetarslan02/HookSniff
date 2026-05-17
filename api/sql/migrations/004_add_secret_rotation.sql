ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS old_signing_secret TEXT;
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS secret_rotated_at TIMESTAMPTZ;
