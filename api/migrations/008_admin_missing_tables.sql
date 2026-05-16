-- Migration 008: Create missing tables referenced by backend code
-- These tables are referenced in routes (audit_log, alerts, notifications, teams, portal_config)
-- but CREATE TABLE was never in any migration.

-- ──────────────────────────────────────────────────────────────
-- 1. audit_log — Track admin and user actions
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_customer ON audit_log(customer_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);

-- ──────────────────────────────────────────────────────────────
-- 2. alert_rules — User-defined alert thresholds
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE, -- NULL = platform-level alert
    name VARCHAR(200) NOT NULL,
    condition VARCHAR(50) NOT NULL,
    threshold INTEGER NOT NULL,
    channels JSONB NOT NULL DEFAULT '["email"]',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_triggered_at TIMESTAMPTZ,
    cooldown_minutes INTEGER NOT NULL DEFAULT 15,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_rules_customer ON alert_rules(customer_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_active ON alert_rules(is_active) WHERE is_active = TRUE;

-- ──────────────────────────────────────────────────────────────
-- 3. notifications — User notification inbox
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_customer ON notifications(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(customer_id, created_at DESC) WHERE is_read = FALSE;

-- ──────────────────────────────────────────────────────────────
-- 4. teams — Team/workspace grouping
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    owner_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id);

-- ──────────────────────────────────────────────────────────────
-- 5. team_members — Team membership
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    UNIQUE(team_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_team_members_customer ON team_members(customer_id);

-- ──────────────────────────────────────────────────────────────
-- 6. team_invites — Pending team invitations
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_invites_token ON team_invites(token);
CREATE INDEX IF NOT EXISTS idx_team_invites_team ON team_invites(team_id);

-- ──────────────────────────────────────────────────────────────
-- 7. notification_preferences — User notification settings
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    webhook_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    slack_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    slack_webhook_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_customer ON notification_preferences(customer_id);

-- ──────────────────────────────────────────────────────────────
-- 8. portal_configs — Customer portal customization
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    logo_url VARCHAR(500),
    primary_color VARCHAR(20) DEFAULT '#4c6ef5',
    company_name VARCHAR(200),
    custom_domain VARCHAR(255),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_configs_customer ON portal_configs(customer_id);

-- ──────────────────────────────────────────────────────────────
-- 9. alert_incidents — Triggered alert events
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alert_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'firing',
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    details JSONB
);

CREATE INDEX IF NOT EXISTS idx_alert_incidents_rule ON alert_incidents(rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_incidents_customer ON alert_incidents(customer_id, triggered_at DESC);
