-- SSO Configuration Table
-- Stores SAML 2.0 and OpenID Connect SSO settings per customer/team

CREATE TABLE IF NOT EXISTS sso_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    created_by UUID REFERENCES customers(id) ON DELETE SET NULL,
    provider VARCHAR(20) NOT NULL DEFAULT 'saml' CHECK (provider IN ('saml', 'oidc')),
    enabled BOOLEAN NOT NULL DEFAULT false,
    admin_bypass BOOLEAN NOT NULL DEFAULT true,

    -- Domain verification
    verified_domain VARCHAR(255),

    -- SAML 2.0 fields
    metadata_url TEXT,
    entity_id TEXT,
    sso_url TEXT,
    certificate TEXT,

    -- OpenID Connect fields
    issuer_url TEXT,
    client_id TEXT,
    client_secret_encrypted TEXT,

    -- Auto team join
    default_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    default_role VARCHAR(20) DEFAULT 'viewer',

    -- Role & Team mapping (JSON)
    role_mapping JSONB DEFAULT '{}',
    team_mapping JSONB DEFAULT '{}',

    -- SCIM provisioning
    scim_enabled BOOLEAN NOT NULL DEFAULT false,
    scim_token_hash VARCHAR(255),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints: one SSO config per team, or one per customer (when team_id IS NULL)
    CONSTRAINT uq_sso_configs_team UNIQUE (team_id)
);

-- Partial unique: one customer-level config (team_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS uq_sso_configs_customer_no_team
    ON sso_configs (customer_id) WHERE team_id IS NULL;

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_sso_configs_customer ON sso_configs(customer_id);
CREATE INDEX IF NOT EXISTS idx_sso_configs_team ON sso_configs(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sso_configs_domain ON sso_configs(verified_domain) WHERE verified_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sso_configs_default_team ON sso_configs(default_team_id) WHERE default_team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sso_configs_scim ON sso_configs(scim_enabled) WHERE scim_enabled = true;

-- SSO Login Attempts (audit log)
CREATE TABLE IF NOT EXISTS sso_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    provider VARCHAR(20) NOT NULL,
    success BOOLEAN NOT NULL DEFAULT false,
    error_message TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sso_login_attempts_email ON sso_login_attempts(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sso_login_attempts_customer ON sso_login_attempts(customer_id, created_at DESC) WHERE customer_id IS NOT NULL;

-- SSO User Attributes (stores IdP attributes for synced users)
CREATE TABLE IF NOT EXISTS sso_user_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    sso_config_id UUID NOT NULL REFERENCES sso_configs(id) ON DELETE CASCADE,
    idp_user_id VARCHAR(255),
    idp_groups TEXT[],
    idp_roles TEXT[],
    raw_attributes JSONB DEFAULT '{}',
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id, sso_config_id)
);

CREATE INDEX IF NOT EXISTS idx_sso_user_attributes_customer ON sso_user_attributes(customer_id);
CREATE INDEX IF NOT EXISTS idx_sso_user_attributes_config ON sso_user_attributes(sso_config_id);
CREATE INDEX IF NOT EXISTS idx_sso_user_attributes_idp_user ON sso_user_attributes(idp_user_id) WHERE idp_user_id IS NOT NULL;

-- SCIM Audit Log
CREATE TABLE IF NOT EXISTS scim_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sso_config_id UUID NOT NULL REFERENCES sso_configs(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    external_id VARCHAR(255),
    email VARCHAR(255),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scim_audit_config ON scim_audit_log(sso_config_id);
CREATE INDEX IF NOT EXISTS idx_scim_audit_action ON scim_audit_log(action);

-- SSO Login States (temporary CSRF/state tokens for SSO flow)
-- Replaces in-memory/Redis state storage — works across Cloud Run instances
CREATE TABLE IF NOT EXISTS sso_login_states (
    state VARCHAR(64) PRIMARY KEY,
    data JSONB NOT NULL,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sso_login_states_expiry ON sso_login_states(expires_at);
CREATE INDEX IF NOT EXISTS idx_sso_login_states_email ON sso_login_states(email);
