-- Migration 010: GDPR Compliance — Consent Management
-- Items 235-241: Consent mechanism, cookie banner, data retention

-- Item 236: Consent records table
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    session_id TEXT, -- for anonymous users before registration
    consent_type TEXT NOT NULL, -- 'terms_of_service', 'privacy_policy', 'cookie_analytics', 'cookie_marketing', 'data_processing'
    consented BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT,
    consent_version TEXT NOT NULL DEFAULT '1.0', -- version of ToS/Privacy Policy
    withdrawn_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_records_customer ON consent_records(customer_id, consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_records_session ON consent_records(session_id);

-- Item 241: Data retention policy configuration
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type TEXT NOT NULL UNIQUE, -- 'deliveries', 'delivery_attempts', 'audit_log', 'notifications', 'dead_letters'
    retention_days INT NOT NULL DEFAULT 90,
    enabled BOOLEAN NOT NULL DEFAULT true,
    last_cleanup_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default retention policies
INSERT INTO data_retention_policies (resource_type, retention_days) VALUES
    ('deliveries', 90),
    ('delivery_attempts', 90),
    ('audit_log', 365),
    ('notifications', 30),
    ('dead_letters', 30)
ON CONFLICT (resource_type) DO NOTHING;

-- Item 239: Add consent tracking columns to deliveries
-- source_ip and request_headers are PII — track if consent was given
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS pii_collected BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS pii_consent_id UUID REFERENCES consent_records(id);

-- Item 240: Audit log — add consent reference for user_agent storage
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS consent_id UUID REFERENCES consent_records(id);

-- Item 235: Registration consent tracking
-- Add columns to customers table for consent status
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tos_accepted_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS cookie_consent_given BOOLEAN NOT NULL DEFAULT false;
