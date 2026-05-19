-- Migration 067: SSO admin_bypass + sso_login_attempts table
-- These were applied manually to Neon DB but missing from repo.

-- Add admin_bypass column to sso_configs (if not exists)
ALTER TABLE sso_configs ADD COLUMN IF NOT EXISTS admin_bypass BOOLEAN NOT NULL DEFAULT true;

-- SSO login attempts audit table
CREATE TABLE IF NOT EXISTS sso_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    provider VARCHAR(20) NOT NULL, -- 'saml' or 'oidc'
    success BOOLEAN NOT NULL DEFAULT false,
    error_message TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sso_login_attempts_email ON sso_login_attempts(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sso_login_attempts_customer ON sso_login_attempts(customer_id, created_at DESC) WHERE customer_id IS NOT NULL;
