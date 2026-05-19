-- Add admin_bypass column to sso_configs
ALTER TABLE sso_configs ADD COLUMN IF NOT EXISTS admin_bypass BOOLEAN NOT NULL DEFAULT true;
