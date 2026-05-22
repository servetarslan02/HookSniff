-- Migration 087: SSO Enhancements — Role Mapping, Team Mapping, SCIM Support
--
-- Adds:
-- 1. role_mapping: JSON mapping of IdP groups/attributes to HookSniff roles
-- 2. team_mapping: JSON mapping of email domains to team IDs
-- 3. scim_enabled: Enable SCIM provisioning endpoint
-- 4. scim_token_hash: Hashed SCIM bearer token for authentication
-- 5. sso_user_attributes: Store IdP attributes for synced users

-- Step 1: Add new columns to sso_configs
ALTER TABLE sso_configs ADD COLUMN IF NOT EXISTS role_mapping JSONB DEFAULT '{}';
ALTER TABLE sso_configs ADD COLUMN IF NOT EXISTS team_mapping JSONB DEFAULT '{}';
ALTER TABLE sso_configs ADD COLUMN IF NOT EXISTS scim_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE sso_configs ADD COLUMN IF NOT EXISTS scim_token_hash VARCHAR(255);

-- Step 2: Create SSO user attributes table (stores IdP attributes)
CREATE TABLE IF NOT EXISTS sso_user_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    sso_config_id UUID NOT NULL REFERENCES sso_configs(id) ON DELETE CASCADE,
    idp_user_id VARCHAR(255),           -- IdP's unique user identifier
    idp_groups TEXT[],                   -- IdP group memberships
    idp_roles TEXT[],                    -- IdP role attributes
    raw_attributes JSONB DEFAULT '{}',  -- Full IdP attribute set
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id, sso_config_id)
);

CREATE INDEX IF NOT EXISTS idx_sso_user_attributes_customer ON sso_user_attributes(customer_id);
CREATE INDEX IF NOT EXISTS idx_sso_user_attributes_config ON sso_user_attributes(sso_config_id);
CREATE INDEX IF NOT EXISTS idx_sso_user_attributes_idp_user ON sso_user_attributes(idp_user_id) WHERE idp_user_id IS NOT NULL;

-- Step 3: Create SCIM audit log table
CREATE TABLE IF NOT EXISTS scim_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sso_config_id UUID NOT NULL REFERENCES sso_configs(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,         -- 'create', 'update', 'deactivate', 'reactivate'
    external_id VARCHAR(255),            -- IdP user ID
    email VARCHAR(255),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scim_audit_config ON scim_audit_log(sso_config_id);
CREATE INDEX IF NOT EXISTS idx_scim_audit_action ON scim_audit_log(action);

-- Step 4: Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_sso_configs_scim ON sso_configs(scim_enabled) WHERE scim_enabled = true;
