-- SSO Configuration Table
-- Stores SAML 2.0 and OpenID Connect SSO settings per customer

CREATE TABLE IF NOT EXISTS sso_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL DEFAULT 'saml' CHECK (provider IN ('saml', 'oidc')),
    enabled BOOLEAN NOT NULL DEFAULT false,

    -- SAML 2.0 fields
    metadata_url TEXT,           -- IdP metadata XML URL
    entity_id TEXT,              -- SP entity ID (urn:hooksniff:sp)
    sso_url TEXT,                -- IdP SSO login URL
    certificate TEXT,            -- IdP X.509 certificate (PEM)

    -- OpenID Connect fields
    issuer_url TEXT,             -- OIDC issuer URL (e.g. https://accounts.google.com)
    client_id TEXT,              -- OIDC client ID
    client_secret_encrypted TEXT, -- OIDC client secret (AES-256-GCM encrypted)

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- One SSO config per customer
    CONSTRAINT uq_sso_configs_customer UNIQUE (customer_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_sso_configs_customer ON sso_configs(customer_id);

-- SSO Login Attempts (audit log)
CREATE TABLE IF NOT EXISTS sso_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    provider VARCHAR(20) NOT NULL,
    success BOOLEAN NOT NULL DEFAULT false,
    error_message TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sso_login_attempts_email ON sso_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_sso_login_attempts_customer ON sso_login_attempts(customer_id);
