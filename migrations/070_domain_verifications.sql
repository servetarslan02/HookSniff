-- Migration 070: Domain verification table for SSO verified domains
-- Stores DNS TXT record verification state

CREATE TABLE IF NOT EXISTS domain_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    txt_value TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id, domain)
);

CREATE INDEX idx_domain_verifications_customer ON domain_verifications(customer_id);
CREATE INDEX idx_domain_verifications_domain ON domain_verifications(domain);
CREATE INDEX idx_domain_verifications_verified ON domain_verifications(verified) WHERE verified = true;
