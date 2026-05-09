-- Migration 038: Backend endpoints for dashboard features
-- audit_log, sso_configs, custom_domains, portal_configs, rate_limit_configs

-- Audit Log — tracks user actions for compliance
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_customer ON audit_log(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- SSO/SAML Configurations
CREATE TABLE IF NOT EXISTS sso_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL DEFAULT 'saml', -- 'saml' or 'oidc'
    enabled BOOLEAN NOT NULL DEFAULT false,
    -- SAML fields
    metadata_url TEXT,
    entity_id TEXT,
    sso_url TEXT,
    certificate TEXT,
    -- OIDC fields
    issuer_url TEXT,
    client_id TEXT,
    client_secret_encrypted TEXT,
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sso_configs_customer ON sso_configs(customer_id);

-- Custom Domains
CREATE TABLE IF NOT EXISTS custom_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL UNIQUE,
    verified BOOLEAN NOT NULL DEFAULT false,
    ssl_active BOOLEAN NOT NULL DEFAULT false,
    verification_token VARCHAR(64) NOT NULL,
    cname_target VARCHAR(255),
    txt_record VARCHAR(255),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_domains_customer ON custom_domains(customer_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);

-- Portal Configurations (branding, customization)
CREATE TABLE IF NOT EXISTS portal_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#6366f1',
    font_family VARCHAR(100) DEFAULT 'Inter',
    dark_mode BOOLEAN DEFAULT true,
    show_events BOOLEAN DEFAULT true,
    show_deliveries BOOLEAN DEFAULT true,
    allowed_events TEXT[], -- array of allowed event types
    custom_css TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portal_configs_customer ON portal_configs(customer_id);

-- Per-endpoint Rate Limit Configurations
CREATE TABLE IF NOT EXISTS rate_limit_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL UNIQUE REFERENCES endpoints(id) ON DELETE CASCADE,
    requests_per_second INT NOT NULL DEFAULT 10,
    burst_size INT NOT NULL DEFAULT 20,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_configs_endpoint ON rate_limit_configs(endpoint_id);
