-- Migration 015: Feature flags system
-- Admin can create/toggle feature flags for gradual rollout

CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    rollout_percentage INTEGER NOT NULL DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    enabled_for_plans JSONB NOT NULL DEFAULT '[]',
    created_by UUID REFERENCES customers(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(is_enabled) WHERE is_enabled = TRUE;

-- Insert some default flags
INSERT INTO feature_flags (name, description, is_enabled, rollout_percentage) VALUES
    ('standard_webhooks', 'Enable Standard Webhooks spec compliance (webhook- prefix, whsec_ secret)', FALSE, 0),
    ('deduplication', 'Enable duplicate webhook filtering', FALSE, 0),
    ('custom_retry_schedules', 'Allow customers to define custom retry schedules', FALSE, 0),
    ('bulk_replay', 'Enable bulk replay of webhooks by date range', FALSE, 0),
    ('gdpr_data_deletion', 'Enable GDPR right-to-be-forgotten data deletion', FALSE, 0)
ON CONFLICT (name) DO NOTHING;
