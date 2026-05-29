-- HookSniff initial schema

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    api_key_hash TEXT NOT NULL,
    api_key_prefix TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free',
    webhook_limit INT NOT NULL DEFAULT 10000,
    webhook_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    description TEXT,
    is_active BOOL NOT NULL DEFAULT true,
    signing_secret TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    event_type TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    attempt_count INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 3,
    last_attempt_at TIMESTAMPTZ,
    response_status INT,
    response_body TEXT,
    next_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dead_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    endpoint_id UUID NOT NULL REFERENCES endpoints(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    payload JSONB NOT NULL,
    reason TEXT,
    attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_customer ON deliveries(customer_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_next_retry ON deliveries(next_retry_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_endpoints_customer ON endpoints(customer_id);


-- Security features: rate limiting, IP allowlisting, request signing verification

ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS ip_whitelist TEXT;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS rate_limit_per_minute INT NOT NULL DEFAULT 60;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS secret_rotation_at TIMESTAMPTZ;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS signature_header TEXT NOT NULL DEFAULT 'X-HookSniff-Signature';

ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS source_ip TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS request_headers JSONB;

ALTER TABLE customers ADD COLUMN IF NOT EXISTS ip_allowlist TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS webhook_timeout_seconds INT NOT NULL DEFAULT 30;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS failed_delivery_count INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_deliveries_idempotency ON deliveries(idempotency_key) WHERE idempotency_key IS NOT NULL;


-- 003_routing: Smart routing columns for endpoints

-- Routing strategy: round-robin (default), latency, failover
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS routing_strategy TEXT NOT NULL DEFAULT 'round-robin';

-- Fallback URL for automatic failover
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fallback_url TEXT;

-- Latency tracking: rolling average response time in ms
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS avg_response_ms INT NOT NULL DEFAULT 0;

-- Failure tracking: consecutive failure count
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS failure_streak INT NOT NULL DEFAULT 0;

-- Last failure timestamp for health-aware routing (5 min window)
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS last_failure_at TIMESTAMPTZ;

-- Index for health-aware queries
CREATE INDEX IF NOT EXISTS idx_endpoints_failure_streak ON endpoints(failure_streak) WHERE failure_streak > 0;


CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES customers(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer', -- admin, editor, viewer
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    UNIQUE(team_id, customer_id)
);

CREATE TABLE IF NOT EXISTS team_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 005_event_mesh.sql
-- Phase 4: Event Mesh — Multi-format Event Infrastructure
-- Extends HookSniff from webhook-only to a full event mesh with
-- multi-protocol delivery, schema registry, fan-out rules, and
-- WebSocket real-time streaming.

-- ============================================================================
-- Event Schema Registry
-- Stores JSON schemas for event types. Supports versioning and
-- backward-compatible evolution.
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_schemas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    version INT DEFAULT 1,
    schema JSONB NOT NULL,
    customer_id UUID REFERENCES customers(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by customer + name
CREATE INDEX IF NOT EXISTS idx_event_schemas_customer_name
    ON event_schemas (customer_id, name);

-- Unique constraint: one schema name per version per customer
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_schemas_unique_version
    ON event_schemas (customer_id, name, version);

-- ============================================================================
-- Delivery Targets
-- Each endpoint can have multiple delivery targets (HTTP, WebSocket, gRPC,
-- SQS, Kafka, Email). The delivery router selects the right protocol based
-- on the target_type and config.
-- ============================================================================
CREATE TABLE IF NOT EXISTS delivery_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID REFERENCES endpoints(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL, -- 'http', 'ws', 'grpc', 'sqs', 'kafka', 'email'
    config JSONB NOT NULL,
    enabled BOOL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by endpoint
CREATE INDEX IF NOT EXISTS idx_delivery_targets_endpoint
    ON delivery_targets (endpoint_id);

-- ============================================================================
-- Fan-out Rules
-- Routes a single event to multiple destinations. Supports pattern matching
-- on event type and conditional routing based on payload fields.
-- ============================================================================
CREATE TABLE IF NOT EXISTS fanout_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    event_pattern TEXT NOT NULL,       -- glob pattern: 'order.*', 'payment.completed'
    conditions JSONB,                     -- optional: {"field": "amount", "op": "gt", "value": 1000}
    target_ids UUID[] NOT NULL,           -- array of delivery_target IDs
    dead_letter_endpoint_id UUID,         -- per-fanout dead letter target
    enabled BOOL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast pattern matching per customer
CREATE INDEX IF NOT EXISTS idx_fanout_rules_customer
    ON fanout_rules (customer_id);

-- ============================================================================
-- WebSocket Subscriptions
-- Tracks active WebSocket connections and their event type subscriptions.
-- Used for the real-time gateway to filter and route events to connected
-- clients.
-- ============================================================================
CREATE TABLE IF NOT EXISTS ws_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    connection_id TEXT NOT NULL UNIQUE,
    event_filters TEXT[] NOT NULL,        -- ['order.*', 'payment.completed']
    last_heartbeat TIMESTAMPTZ DEFAULT now(),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by customer
CREATE INDEX IF NOT EXISTS idx_ws_subscriptions_customer
    ON ws_subscriptions (customer_id);

-- Index for cleanup of stale connections
CREATE INDEX IF NOT EXISTS idx_ws_subscriptions_heartbeat
    ON ws_subscriptions (last_heartbeat);


-- 006_industry: Industry packages, templates, and marketplace

CREATE TABLE IF NOT EXISTS industry_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    config JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    config JSONB NOT NULL,
    downloads INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    author TEXT,
    version TEXT DEFAULT '1.0.0',
    config JSONB NOT NULL,
    downloads INT DEFAULT 0,
    rating FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS installed_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    agent_id UUID REFERENCES marketplace_agents(id),
    enabled BOOL DEFAULT true,
    config JSONB,
    installed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(customer_id, agent_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_templates_industry ON webhook_templates(industry);
CREATE INDEX IF NOT EXISTS idx_marketplace_agents_downloads ON marketplace_agents(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_installed_agents_customer ON installed_agents(customer_id);
CREATE INDEX IF NOT EXISTS idx_installed_agents_agent ON installed_agents(agent_id);


CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'webhook_failed', 'alert', 'system', 'billing'
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_customer ON notifications(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(customer_id) WHERE is_read = FALSE;


ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();


-- Migration 009: Add multi-provider payment support (Polar.sh + iyzico)
-- Adds payment_provider field and provider-specific IDs to customers table.

-- Add payment provider column
ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'stripe';

-- Polar.sh fields
ALTER TABLE customers ADD COLUMN IF NOT EXISTS polar_customer_id TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS polar_subscription_id TEXT;

-- iyzico fields
ALTER TABLE customers ADD COLUMN IF NOT EXISTS iyzico_customer_id TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS iyzico_subscription_id TEXT;

-- Index for provider lookups
CREATE INDEX IF NOT EXISTS idx_customers_payment_provider ON customers(payment_provider);
CREATE INDEX IF NOT EXISTS idx_customers_polar_id ON customers(polar_customer_id) WHERE polar_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_iyzico_id ON customers(iyzico_customer_id) WHERE iyzico_customer_id IS NOT NULL;

-- Payment transactions log table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,          -- 'stripe' | 'polar' | 'iyzico'
    provider_tx_id TEXT,             -- External transaction ID
    amount_cents INT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending',  -- pending, completed, failed, refunded
    plan TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_tx_customer ON payment_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_provider ON payment_transactions(provider, provider_tx_id);


-- Migration 010: Zombie reaper support
-- Adds updated_at column to webhook_queue and index for reaper queries

-- Add updated_at column (defaults to created_at for existing rows)
ALTER TABLE webhook_queue ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Trigger to auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_webhook_queue_updated_at ON webhook_queue;
CREATE TRIGGER trg_webhook_queue_updated_at
    BEFORE UPDATE ON webhook_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Index to support the zombie reaper query:
-- SELECT ... FROM webhook_queue WHERE status = 'processing' AND updated_at < ...
CREATE INDEX IF NOT EXISTS idx_webhook_queue_status_updated_at
    ON webhook_queue (status, updated_at);


-- 011_listen_notify.sql
-- PostgreSQL LISTEN/NOTIFY support for webhook_queue
--
-- When a new webhook is inserted with status='pending',
-- NOTIFY 'new_webhook' wakes the worker immediately
-- instead of waiting for the next 1s poll cycle.

-- Trigger function: fire NOTIFY when a pending webhook is inserted
CREATE OR REPLACE FUNCTION notify_new_webhook()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pending' THEN
        PERFORM pg_notify('new_webhook', NEW.id::text);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on INSERT to webhook_queue
DROP TRIGGER IF EXISTS trg_notify_new_webhook ON webhook_queue;

CREATE TRIGGER trg_notify_new_webhook
    AFTER INSERT ON webhook_queue
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_webhook();


-- Migration 012: Add trace_id columns for OpenTelemetry distributed tracing
-- Adds trace_id to webhook_queue and delivery_attempts tables

-- Add trace_id to webhook_queue
ALTER TABLE webhook_queue ADD COLUMN IF NOT EXISTS trace_id VARCHAR(64);

-- Add trace_id to delivery_attempts
ALTER TABLE delivery_attempts ADD COLUMN IF NOT EXISTS trace_id VARCHAR(64);

-- Index for looking up queue items by trace_id
CREATE INDEX IF NOT EXISTS idx_webhook_queue_trace_id ON webhook_queue(trace_id) WHERE trace_id IS NOT NULL;


-- Migration 016: Add missing payment columns to customers table
-- These columns are referenced in Customer struct and login queries
-- but were never added in any migration.

ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50) NOT NULL DEFAULT 'stripe';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS polar_subscription_id VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS iyzico_subscription_id VARCHAR(255);


-- Migration 026: Add response_headers column to delivery_attempts
ALTER TABLE delivery_attempts ADD COLUMN IF NOT EXISTS response_headers JSONB;


-- Migration 027: Add updated_at and error_message to deliveries table
-- Dashboard expects these fields for delivery details view

-- Add updated_at with auto-update trigger
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_deliveries_updated_at ON deliveries;
CREATE TRIGGER trg_deliveries_updated_at
    BEFORE UPDATE ON deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add error_message for failed deliveries
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS error_message TEXT;


CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    amount_cents INT NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'usd',
    plan TEXT NOT NULL DEFAULT 'free',
    status TEXT NOT NULL DEFAULT 'paid',
    provider TEXT NOT NULL DEFAULT 'stripe',
    provider_invoice_id TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);


-- Free tier limit: 1,000 → 10,000 webhooks/month
-- HookSniff MVP: rekabetçi free tier

-- Update existing free-tier customers
UPDATE customers SET webhook_limit = 10000 WHERE plan = 'free' AND webhook_limit = 1000;

-- Update column default for new signups
ALTER TABLE customers ALTER COLUMN webhook_limit SET DEFAULT 10000;


-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_customer ON password_reset_tokens(customer_id);


-- Email verification: add email_verified column and verification tokens table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_hash ON email_verification_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_customer ON email_verification_tokens(customer_id);


-- Refresh tokens for mobile app auth
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_customer ON refresh_tokens(customer_id);


-- Two-factor authentication (TOTP)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS totp_secret TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN NOT NULL DEFAULT false;


-- Device tokens for push notifications (FCM)
CREATE TABLE IF NOT EXISTS device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'android',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(customer_id, token)
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_customer ON device_tokens(customer_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON device_tokens(token);


-- Test mode support: mark deliveries and queue items created with test API keys.
-- Test deliveries are not sent to real endpoints; they get an immediate mock response.

ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE webhook_queue ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;

-- Index for filtering test deliveries in the dashboard
CREATE INDEX IF NOT EXISTS idx_deliveries_is_test ON deliveries(is_test) WHERE is_test = true;


-- Notification preferences per customer
-- Enables portal notification settings (email on failure, Slack webhook, etc.)

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    email_on_failure BOOLEAN NOT NULL DEFAULT true,
    email_on_dead_letter BOOLEAN NOT NULL DEFAULT true,
    email_on_success BOOLEAN NOT NULL DEFAULT false,
    slack_webhook_url TEXT,
    discord_webhook_url TEXT,
    webhook_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(customer_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_customer
    ON notification_preferences(customer_id);


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


-- Migration 039: Performance indexes (Items 182-191)
-- Composite and single-column indexes for common query patterns

-- Deliveries: endpoint + status for dashboard filtering
CREATE INDEX IF NOT EXISTS idx_deliveries_endpoint_status
    ON deliveries(endpoint_id, status);

-- Deliveries: created_at for time-range queries
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at
    ON deliveries(created_at DESC);

-- Delivery attempts: created_at for time-range cleanup and analytics
CREATE INDEX IF NOT EXISTS idx_delivery_attempts_created_at
    ON delivery_attempts(created_at DESC);

-- Dead letters: endpoint analysis
CREATE INDEX IF NOT EXISTS idx_dead_letters_endpoint
    ON dead_letters(endpoint_id);

-- Password reset tokens: cleanup expired tokens
CREATE INDEX IF NOT EXISTS idx_password_reset_expires
    ON password_reset_tokens(expires_at);

-- Refresh tokens: cleanup expired/revoked tokens
CREATE INDEX IF NOT EXISTS idx_refresh_expires
    ON refresh_tokens(expires_at);

-- Email verification tokens: cleanup expired tokens
CREATE INDEX IF NOT EXISTS idx_email_verify_expires
    ON email_verification_tokens(expires_at);

-- Idempotency keys: cleanup 24h+ old records (Item 187)
CREATE INDEX IF NOT EXISTS idx_idempotency_created
    ON idempotency_keys(created_at);


-- Migration 040: ON DELETE behavior fixes (Items 177-181)
-- Fix missing ON DELETE CASCADE on existing foreign keys

-- dead_letters.endpoint_id: CASCADE when endpoint is deleted
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dead_letters_endpoint_id_fkey') THEN
        ALTER TABLE dead_letters DROP CONSTRAINT dead_letters_endpoint_id_fkey;
    END IF;
END $$;
ALTER TABLE dead_letters
    ADD CONSTRAINT fk_dead_letters_endpoint
    FOREIGN KEY (endpoint_id) REFERENCES endpoints(id) ON DELETE CASCADE;

-- dead_letters.customer_id: CASCADE when customer is deleted
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dead_letters_customer_id_fkey') THEN
        ALTER TABLE dead_letters DROP CONSTRAINT dead_letters_customer_id_fkey;
    END IF;
END $$;
ALTER TABLE dead_letters
    ADD CONSTRAINT fk_dead_letters_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- teams.owner_id: CASCADE when owner customer is deleted
-- (owner_id is NOT NULL, so SET NULL is not possible)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teams_owner_id_fkey') THEN
        ALTER TABLE teams DROP CONSTRAINT teams_owner_id_fkey;
    END IF;
END $$;
ALTER TABLE teams
    ADD CONSTRAINT fk_teams_owner
    FOREIGN KEY (owner_id) REFERENCES customers(id) ON DELETE CASCADE;

-- installed_agents.customer_id: CASCADE when customer is deleted
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'installed_agents_customer_id_fkey') THEN
        ALTER TABLE installed_agents DROP CONSTRAINT installed_agents_customer_id_fkey;
    END IF;
END $$;
ALTER TABLE installed_agents
    ADD CONSTRAINT fk_installed_agents_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- installed_agents.agent_id: CASCADE when marketplace agent is removed
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'installed_agents_agent_id_fkey') THEN
        ALTER TABLE installed_agents DROP CONSTRAINT installed_agents_agent_id_fkey;
    END IF;
END $$;
ALTER TABLE installed_agents
    ADD CONSTRAINT fk_installed_agents_agent
    FOREIGN KEY (agent_id) REFERENCES marketplace_agents(id) ON DELETE CASCADE;


-- Migration 041: password_hash NOT NULL (Item 173)
-- OAuth users get a sentinel hash that will never match any real password
-- NOTE: code must be updated to remove Option<String> for password_hash
--       and check for sentinel value instead of NULL for OAuth detection

-- Backfill NULL password_hash with sentinel (argon2 hash of "OAUTH_NO_PASSWORD_SENTINEL")
UPDATE customers
SET password_hash = '!oauth_no_password!'
WHERE password_hash IS NULL;

ALTER TABLE customers ALTER COLUMN password_hash SET NOT NULL;


-- Migration 042: amount_cents BIGINT (Item 186)
-- Prevent integer overflow for large payment amounts

ALTER TABLE payment_transactions ALTER COLUMN amount_cents TYPE BIGINT;
ALTER TABLE invoices ALTER COLUMN amount_cents TYPE BIGINT;


-- Migration 043: platform_settings table (Item 123)
-- Stores global platform configuration managed by admin

CREATE TABLE IF NOT EXISTS platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed with default settings
INSERT INTO platform_settings (key, value) VALUES ('main', '{
    "default_plan": "free",
    "max_endpoints_free": 5,
    "max_endpoints_pro": 50,
    "max_webhooks_free": 1000,
    "max_webhooks_pro": 50000,
    "rate_limit_free": 100,
    "rate_limit_pro": 1000,
    "retry_max_attempts": 3,
    "retention_days_free": 7,
    "retention_days_pro": 30,
    "maintenance_mode": false,
    "signup_enabled": true
}'::jsonb) ON CONFLICT (key) DO NOTHING;


-- Feature flags table for toggling features like Standard Webhooks, deduplication, etc.
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    rollout_percentage INTEGER NOT NULL DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    enabled_for_plans JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES customers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(is_enabled) WHERE is_enabled = true;


-- Add 'event' column (alias for event_type) and 'processed_at' to deliveries
-- These columns were applied manually to Neon DB but never committed as migrations.

-- Add 'event' column if missing (keeps event_type for backward compat)
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS event TEXT;
-- Backfill from event_type
UPDATE deliveries SET event = event_type WHERE event IS NULL AND event_type IS NOT NULL;

-- Add 'processed_at' column if missing
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;


-- Migration 046: webhook_limit BIGINT for enterprise plan (i64::MAX support)
-- INT max = 2,147,483,647 — enterprise plan needs 9,223,372,036,854,775,807
ALTER TABLE customers ALTER COLUMN webhook_limit TYPE BIGINT;


-- Migration 047: Add missing columns to customers table
-- These columns exist in Customer struct and are used in login queries
-- but were never added in any migration.

-- Whether the subscription should cancel at end of current billing period
ALTER TABLE customers ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;

-- Timestamp when payment last failed (grace period tracking)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ;

-- Whether overage is allowed (never-blocked mode)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS allow_overage BOOLEAN NOT NULL DEFAULT true;

-- Whether to send email notifications for overage
ALTER TABLE customers ADD COLUMN IF NOT EXISTS overage_email_notification BOOLEAN NOT NULL DEFAULT true;

-- Payment provider and subscription IDs (if missing from migration 016)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50) NOT NULL DEFAULT 'stripe';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS polar_subscription_id VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS iyzico_subscription_id VARCHAR(255);


-- Service Tokens: Organization-level API tokens
-- Each team (organization) can have multiple service tokens
-- These tokens authenticate as the team, not as individual users

CREATE TABLE IF NOT EXISTS service_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Default Token',
    token_hash TEXT NOT NULL,
    token_prefix VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_service_tokens_team ON service_tokens(team_id);
CREATE INDEX IF NOT EXISTS idx_service_tokens_hash ON service_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_service_tokens_prefix ON service_tokens(token_prefix);


-- Add team_id to endpoints for organization-scoped access
-- When a service token is used, only endpoints belonging to that team are accessible

ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_endpoints_team ON endpoints(team_id) WHERE team_id IS NOT NULL;


-- Add email_on_weekly_digest to notification_preferences
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS email_on_weekly_digest BOOLEAN NOT NULL DEFAULT false;


-- Add card metadata columns to customers table
-- Stores last-4 digits, brand, and expiry from payment provider

ALTER TABLE customers ADD COLUMN IF NOT EXISTS card_last4 VARCHAR(4);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS card_brand VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS card_exp_month SMALLINT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS card_exp_year SMALLINT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS card_updated_at TIMESTAMPTZ;


-- Environment support: dev/staging/prod environments per customer

CREATE TABLE IF NOT EXISTS environments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    description TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    color VARCHAR(7),           -- hex color for UI (e.g. #22c55e)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT environments_customer_slug_unique UNIQUE (customer_id, slug),
    CONSTRAINT environments_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$')
);

-- Index for fast lookup by customer
CREATE INDEX idx_environments_customer_id ON environments(customer_id);

-- Auto-create default environment for existing customers (optional, can be run manually)
-- INSERT INTO environments (customer_id, name, slug, is_default, color)
-- SELECT id, 'Production', 'production', true, '#22c55e' FROM customers;


-- Environment variables: key-value pairs scoped to an environment

CREATE TABLE IF NOT EXISTS environment_variables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_id UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    is_secret BOOLEAN NOT NULL DEFAULT false,  -- if true, value is masked in responses
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT env_vars_unique_key UNIQUE (environment_id, key)
);

-- Index for fast lookup by environment
CREATE INDEX idx_env_vars_environment_id ON environment_variables(environment_id);

-- Index for key lookup within an environment
CREATE INDEX idx_env_vars_key ON environment_variables(environment_id, key);


-- Background tasks: async task tracking per customer
-- Tasks are created by the system (e.g. bulk replay, bulk retry) and can be polled for status.

CREATE TABLE IF NOT EXISTS background_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    task_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    data JSONB,
    result JSONB,
    error TEXT,
    progress SMALLINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    CONSTRAINT bg_tasks_status_check CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled'))
);

CREATE INDEX idx_bg_tasks_customer_id ON background_tasks(customer_id);
CREATE INDEX idx_bg_tasks_status ON background_tasks(customer_id, status);
CREATE INDEX idx_bg_tasks_created_at ON background_tasks(customer_id, created_at DESC);


-- Operational webhook endpoints: where to send system events (delivery failures, endpoint disabled, etc.)

CREATE TABLE IF NOT EXISTS operational_webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    signing_secret VARCHAR(128) NOT NULL,
    event_types TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_op_webhook_endpoints_customer ON operational_webhook_endpoints(customer_id);


-- Operational webhook deliveries: log of every operational event sent

CREATE TABLE IF NOT EXISTS operational_webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL REFERENCES operational_webhook_endpoints(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_status SMALLINT,
    response_body TEXT,
    attempt_count SMALLINT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    delivered_at TIMESTAMPTZ,
    CONSTRAINT op_deliveries_status_check CHECK (status IN ('pending', 'success', 'failed'))
);

CREATE INDEX idx_op_deliveries_endpoint ON operational_webhook_deliveries(endpoint_id);
CREATE INDEX idx_op_deliveries_customer ON operational_webhook_deliveries(customer_id);
CREATE INDEX idx_op_deliveries_created ON operational_webhook_deliveries(customer_id, created_at DESC);


-- Message cursors: track consumer position in the message stream
-- Enables cursor-based polling for clients that need at-least-once delivery semantics.

CREATE TABLE IF NOT EXISTS message_cursors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    consumer_id VARCHAR(255) NOT NULL,
    endpoint_id UUID REFERENCES endpoints(id) ON DELETE CASCADE,
    last_message_id UUID,
    last_sequence_num BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(customer_id, consumer_id)
);

CREATE INDEX idx_message_cursors_customer ON message_cursors(customer_id);
CREATE INDEX idx_message_cursors_lookup ON message_cursors(customer_id, consumer_id);


-- Connectors: built-in connector definitions (Shopify, Stripe, GitHub, etc.)
-- Each connector defines its config schema and supported events.

CREATE TABLE IF NOT EXISTS connectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    icon_url TEXT,
    config_schema JSONB NOT NULL DEFAULT '{}',
    supported_events TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Connector configs: customer's connector instances with credentials
CREATE TABLE IF NOT EXISTS connector_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    connector_id UUID NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    credentials JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_connector_configs_customer ON connector_configs(customer_id);
CREATE INDEX idx_connector_configs_connector ON connector_configs(connector_id);

-- Seed built-in connectors
INSERT INTO connectors (name, display_name, description, config_schema, supported_events) VALUES
('stripe', 'Stripe', 'Payment processing webhooks from Stripe', '{"type":"object","properties":{"webhook_secret":{"type":"string"},"api_key":{"type":"string"}}}', ARRAY['payment_intent.succeeded','payment_intent.failed','charge.succeeded','charge.failed','customer.created','customer.updated','invoice.paid','invoice.payment_failed']),
('shopify', 'Shopify', 'E-commerce webhooks from Shopify', '{"type":"object","properties":{"shop_domain":{"type":"string"},"access_token":{"type":"string"},"webhook_secret":{"type":"string"}}}', ARRAY['orders/create','orders/updated','orders/cancelled','products/create','products/update','customers/create','customers/update']),
('github', 'GitHub', 'Repository and organization webhooks from GitHub', '{"type":"object","properties":{"webhook_secret":{"type":"string"},"app_id":{"type":"string"},"private_key":{"type":"string"}}}', ARRAY['push','pull_request','issues','issue_comment','release','workflow_run','workflow_job','star']),
('slack', 'Slack', 'Slack events and interactions', '{"type":"object","properties":{"signing_secret":{"type":"string"},"bot_token":{"type":"string"}}}', ARRAY['message','reaction_added','reaction_removed','app_mention','channel_created','channel_deleted']),
('twilio', 'Twilio', 'SMS and voice webhook events from Twilio', '{"type":"object","properties":{"auth_token":{"type":"string"},"phone_number":{"type":"string"}}}', ARRAY['message.sent','message.delivered','message.failed','call.completed','call.ringing']),
('discord', 'Discord', 'Discord bot events and interactions', '{"type":"object","properties":{"bot_token":{"type":"string"},"application_id":{"type":"string"}}}', ARRAY['MESSAGE_CREATE','MESSAGE_UPDATE','MESSAGE_DELETE','GUILD_MEMBER_ADD','GUILD_MEMBER_REMOVE','INTERACTION_CREATE']),
('linear', 'Linear', 'Issue and project tracking webhooks from Linear', '{"type":"object","properties":{"webhook_secret":{"type":"string"}}}', ARRAY['Issue','Project','Cycle','Comment','Team']),
('notion', 'Notion', 'Database and page change webhooks from Notion', '{"type":"object","properties":{"integration_token":{"type":"string"}}}', ARRAY['page.created','page.updated','database.updated'])
ON CONFLICT (name) DO NOTHING;


-- Phase 14: Integration — Full integration management system
-- Connects connectors to endpoints with event routing, filtering, and monitoring.

-- Integrations: main table linking connector configs to endpoints
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    connector_config_id UUID NOT NULL REFERENCES connector_configs(id) ON DELETE CASCADE,
    endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT true,
    event_filter TEXT[],                        -- NULL = all events, [] = none, ['a','b'] = specific
    transform_id UUID,                          -- optional transform pipeline
    retry_policy JSONB NOT NULL DEFAULT '{"max_retries": 5, "backoff": "exponential"}',
    metadata JSONB NOT NULL DEFAULT '{}',
    last_triggered_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    failure_count INTEGER NOT NULL DEFAULT 0,
    total_deliveries BIGINT NOT NULL DEFAULT 0,
    total_failures BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Integration events: delivery log for each integration trigger
CREATE TABLE IF NOT EXISTS integration_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    source_event_id VARCHAR(255),               -- original event ID from connector
    payload JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',  -- pending, processing, delivered, failed, filtered
    delivery_id UUID,                           -- link to actual webhook delivery
    error_message TEXT,
    attempts INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_integrations_customer ON integrations(customer_id);
CREATE INDEX idx_integrations_connector_config ON integrations(connector_config_id);
CREATE INDEX idx_integrations_endpoint ON integrations(endpoint_id);
CREATE INDEX idx_integrations_enabled ON integrations(enabled) WHERE enabled = true;
CREATE INDEX idx_integration_events_integration ON integration_events(integration_id);
CREATE INDEX idx_integration_events_status ON integration_events(status);
CREATE INDEX idx_integration_events_created ON integration_events(created_at DESC);
CREATE INDEX idx_integration_events_type ON integration_events(event_type);


-- Phase 15: Streaming — Real-time event streaming subscriptions and channels
-- Supports SSE and WebSocket with per-customer channels and event filtering.

-- Stream channels: named channels customers can subscribe to
CREATE TABLE IF NOT EXISTS stream_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    channel_type VARCHAR(50) NOT NULL DEFAULT 'sse',    -- sse, websocket, both
    event_filter TEXT[],                                 -- NULL = all events
    enabled BOOLEAN NOT NULL DEFAULT true,
    max_subscribers INTEGER NOT NULL DEFAULT 100,
    current_subscribers INTEGER NOT NULL DEFAULT 0,
    total_messages BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(customer_id, name)
);

-- Stream subscriptions: active subscriber connections
CREATE TABLE IF NOT EXISTS stream_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES stream_channels(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    connection_type VARCHAR(50) NOT NULL,                -- sse, websocket
    client_id VARCHAR(255),                              -- browser/session identifier
    event_filter TEXT[],
    connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    messages_sent BIGINT NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'
);

-- Stream message log: recent messages for replay/debugging
CREATE TABLE IF NOT EXISTS stream_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES stream_channels(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    delivered_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_stream_channels_customer ON stream_channels(customer_id);
CREATE INDEX idx_stream_channels_enabled ON stream_channels(enabled) WHERE enabled = true;
CREATE INDEX idx_stream_subscriptions_channel ON stream_subscriptions(channel_id);
CREATE INDEX idx_stream_subscriptions_customer ON stream_subscriptions(customer_id);
CREATE INDEX idx_stream_subscriptions_active ON stream_subscriptions(customer_id, connected_at DESC);
CREATE INDEX idx_stream_messages_channel ON stream_messages(channel_id);
CREATE INDEX idx_stream_messages_created ON stream_messages(created_at DESC);

-- Default channels per customer (will be created via API on first use)


-- 2FA Backup Codes table (missing from 033_totp_2fa.sql)
CREATE TABLE IF NOT EXISTS tfa_backup_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tfa_backup_codes_customer ON tfa_backup_codes(customer_id);
CREATE INDEX IF NOT EXISTS idx_tfa_backup_codes_unused ON tfa_backup_codes(customer_id) WHERE used = false;


-- Migration 066: Add default team auto-join to SSO configs
-- When SSO users log in, they can be automatically added to a team.

ALTER TABLE sso_configs
  ADD COLUMN default_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  ADD COLUMN default_role VARCHAR(20) DEFAULT 'viewer';

-- Index for faster lookups
CREATE INDEX idx_sso_configs_default_team ON sso_configs(default_team_id) WHERE default_team_id IS NOT NULL;


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


-- Migration 068: Add verified_domain to sso_configs
-- Enables domain-based SSO config lookup for auto-join

ALTER TABLE sso_configs ADD COLUMN IF NOT EXISTS verified_domain VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_sso_configs_domain ON sso_configs(verified_domain) WHERE verified_domain IS NOT NULL;


-- Migration 069: Move SSO config from customer to team (organization)
-- sso_configs.team_id → the team this SSO config belongs to
-- sso_configs.created_by → who created it (audit trail, keeps customer_id reference)

-- Step 1: Add team_id column
ALTER TABLE sso_configs ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE sso_configs ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES customers(id) ON DELETE SET NULL;

-- Step 2: Migrate existing data — link SSO config to the customer's primary team
-- For each SSO config, find the team where the customer is owner
UPDATE sso_configs s
SET team_id = (
    SELECT t.id FROM teams t 
    WHERE t.owner_id = s.customer_id 
    ORDER BY t.created_at ASC 
    LIMIT 1
),
created_by = s.customer_id
WHERE s.team_id IS NULL;

-- Step 3: Create index
CREATE INDEX IF NOT EXISTS idx_sso_configs_team ON sso_configs(team_id) WHERE team_id IS NOT NULL;

-- Step 4: Add unique constraint — one SSO config per team
ALTER TABLE sso_configs ADD CONSTRAINT uq_sso_configs_team UNIQUE (team_id);


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


-- Migration 071: Daily event usage tracking for overage notifications
-- Tracks per-day event counts and overage counts for billing notifications.

CREATE TABLE IF NOT EXISTS daily_event_usage (
    id BIGSERIAL PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    event_date DATE NOT NULL DEFAULT CURRENT_DATE,
    event_count BIGINT NOT NULL DEFAULT 0,
    overage_count BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(customer_id, event_date)
);

-- Index for cleanup and lookups
CREATE INDEX idx_daily_event_usage_date ON daily_event_usage(event_date);
CREATE INDEX idx_daily_event_usage_customer ON daily_event_usage(customer_id, event_date);

-- Auto-cleanup: delete rows older than 90 days (handled by retention job, but good to have)
COMMENT ON TABLE daily_event_usage IS 'Daily webhook event usage tracking for overage notifications. Rows older than 90 days can be cleaned up.';


-- Migration 072: Dunning system — failed payment recovery
-- Creates tables for tracking dunning email reminders and payment retry attempts.
-- Adds last_payment_retry_at column to customers table.

-- Track which dunning reminders have been sent to avoid duplicate emails
CREATE TABLE IF NOT EXISTS dunning_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    days_remaining INTEGER NOT NULL CHECK (days_remaining BETWEEN 1 AND 30),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id, days_remaining)
);

CREATE INDEX IF NOT EXISTS idx_dunning_reminders_customer
    ON dunning_reminders(customer_id);

CREATE INDEX IF NOT EXISTS idx_dunning_reminders_sent_at
    ON dunning_reminders(sent_at);

-- Track payment retry attempts for observability
CREATE TABLE IF NOT EXISTS payment_retry_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL,
    subscription_id TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'attempted', -- attempted, succeeded, failed
    error_message TEXT,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_retry_customer
    ON payment_retry_attempts(customer_id);

CREATE INDEX IF NOT EXISTS idx_payment_retry_attempted_at
    ON payment_retry_attempts(attempted_at);

-- Add last_payment_retry_at to customers for tracking retry cooldown
ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS last_payment_retry_at TIMESTAMPTZ;

-- Cleanup is handled by the retention job (cleanup_old_dunning_reminders)
-- No partial index needed — the sent_at index is sufficient


-- Migration 073: Remove grace period, add billing period tracking
-- Payment failure → immediate downgrade to free (no grace period)
-- Dunning emails sent BEFORE period end (3, 2, 1 days remaining)

-- Add billing period end tracking
ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Track billing interval (month/year) for dunning schedule
ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS billing_interval VARCHAR(10) DEFAULT 'month';

-- Set current_period_end for existing paid customers (30 days from now as approximation)
UPDATE customers
SET current_period_end = NOW() + INTERVAL '30 days'
WHERE plan NOT IN ('free', 'developer')
  AND current_period_end IS NULL;

-- Track customer language preference for emails
ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'tr';

-- Clean up old grace period data (payment_failed_at no longer used for grace)
-- Keep the column for audit/logging but it won't drive downgrade logic anymore
UPDATE customers
SET payment_failed_at = NULL
WHERE payment_failed_at IS NOT NULL;


-- Migration 074: Subscription pause/freeze feature
-- Allows customers to temporarily pause their subscription instead of canceling.

-- Track pause state
ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS paused_until TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS pause_plan VARCHAR(20);

-- Index for auto-resume check
CREATE INDEX IF NOT EXISTS idx_customers_paused
    ON customers(paused_until)
    WHERE paused_at IS NOT NULL;


-- Broadcast system for global announcements (maintenance, features, incidents)
-- Admin creates broadcasts → all users see them in notification bell + dashboard banner

CREATE TABLE IF NOT EXISTS broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    broadcast_type VARCHAR(50) NOT NULL DEFAULT 'announcement', -- maintenance, feature, announcement, incident
    severity VARCHAR(20) NOT NULL DEFAULT 'info',               -- info, warning, critical
    link VARCHAR(500),                                           -- optional CTA link
    link_text VARCHAR(100),                                      -- optional CTA button text
    target_plan VARCHAR(50),                                     -- NULL = all plans, or 'free','pro','enterprise'
    is_active BOOLEAN NOT NULL DEFAULT true,
    starts_at TIMESTAMPTZ,                                       -- NULL = immediate
    expires_at TIMESTAMPTZ,                                      -- NULL = never expires
    created_by UUID REFERENCES customers(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_broadcasts_active ON broadcasts(is_active, starts_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_broadcasts_type ON broadcasts(broadcast_type);

-- Track which users dismissed which broadcasts (hide banner)
CREATE TABLE IF NOT EXISTS broadcast_dismissals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broadcast_id UUID NOT NULL REFERENCES broadcasts(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    dismissed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(broadcast_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_broadcast_dismissals_customer ON broadcast_dismissals(customer_id);


-- Security event detection and logging
-- Tracks suspicious activity: brute force, anomalous behavior, credential stuffing, etc.

CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,       -- see EVENT TYPES below
    severity VARCHAR(20) NOT NULL DEFAULT 'medium',  -- low, medium, high, critical
    customer_id UUID,                        -- affected user (NULL if unknown)
    email VARCHAR(255),                      -- email involved (for login attempts)
    ip_address VARCHAR(45),                  -- IPv4 or IPv6
    user_agent TEXT,                         -- browser/client info
    details JSONB,                           -- event-specific data
    resolved BOOLEAN NOT NULL DEFAULT false, -- admin marked as reviewed
    resolved_by UUID,                        -- admin who resolved
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_customer ON security_events(customer_id, created_at DESC) WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_events_email ON security_events(email, created_at DESC) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_events_unresolved ON security_events(created_at DESC) WHERE resolved = false;

-- Rate limiting tracking for brute force detection
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100),  -- 'wrong_password', 'account_disabled', 'account_not_found', 'rate_limited'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_failed ON login_attempts(email, created_at DESC) WHERE success = false;

-- Cleanup: auto-delete old login attempts (keep 30 days)
-- This is handled by the retention job


-- IP blocklist for blocking suspicious IPs at the middleware level

CREATE TABLE IF NOT EXISTS ip_blocklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    reason TEXT,
    blocked_by UUID REFERENCES customers(id),
    auto_blocked BOOLEAN NOT NULL DEFAULT false,  -- true if auto-blocked by security monitor
    event_id UUID REFERENCES security_events(id),  -- linked security event
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ,                        -- NULL = permanent
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ip_blocklist_ip ON ip_blocklist(ip_address) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ip_blocklist_active ON ip_blocklist(is_active, created_at DESC);


-- Migration 078: Alert evaluation worker support
-- Adds last_triggered_at to alert_rules + alert_history table

-- 1. Add last_triggered_at column for cooldown tracking
ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMPTZ;

-- 2. Alert history table — records every alert trigger
CREATE TABLE IF NOT EXISTS alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_rule_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    condition TEXT NOT NULL,
    actual_value DOUBLE PRECISION NOT NULL,
    threshold INT NOT NULL,
    channels_sent JSONB NOT NULL DEFAULT '[]',
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alert_history_rule ON alert_history(alert_rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_customer ON alert_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_triggered ON alert_history(triggered_at DESC);

-- 3. Add webhook_url column to alert_rules for slack/webhook channels
ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS webhook_url TEXT;
ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS cooldown_minutes INT NOT NULL DEFAULT 15;


-- Migration 079: Add language preference to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'tr';


-- Ensure rate_limit_violations table exists (may have been skipped in some environments)
CREATE TABLE IF NOT EXISTS rate_limit_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    endpoint_id UUID REFERENCES endpoints(id) ON DELETE SET NULL,
    ip TEXT,
    requests_count INT NOT NULL,
    limit_per_window INT NOT NULL,
    window_seconds INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rl_violations_created ON rate_limit_violations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rl_violations_customer ON rate_limit_violations(customer_id);


-- HS-039: Add revoked_at for grace period in multi-tab refresh
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked_at ON refresh_tokens(revoked_at) WHERE revoked_at IS NOT NULL;


-- Migration 080: Track if customer has used Startup first-month-free trial
-- Prevents the same account from getting the discount multiple times.

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS has_used_startup_trial BOOLEAN NOT NULL DEFAULT false;


-- Migration 081: Coupon codes table for admin-managed discounts
-- Two types: 'polar' (synced to Polar.sh) and 'internal' (applied directly)

CREATE TABLE IF NOT EXISTS coupon_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) NOT NULL UNIQUE,
    type VARCHAR(16) NOT NULL CHECK (type IN ('polar', 'internal')),
    discount_type VARCHAR(16) NOT NULL CHECK (discount_type IN ('percentage', 'free_month')),
    discount_value INTEGER NOT NULL DEFAULT 0,
    -- For percentage: 0-100. For free_month: number of free months (usually 1)
    target_plan VARCHAR(32),
    -- NULL = works for all plans, otherwise specific plan name
    polar_discount_id VARCHAR(128),
    -- Polar.sh discount ID (only for type='polar')
    max_redemptions INTEGER,
    -- NULL = unlimited
    redemption_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES customers(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupon_codes_code ON coupon_codes(UPPER(code));
CREATE INDEX idx_coupon_codes_type ON coupon_codes(type);
CREATE INDEX idx_coupon_codes_active ON coupon_codes(is_active) WHERE is_active = true;

-- Track coupon usage per customer
CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupon_codes(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(coupon_id, customer_id)
);

CREATE INDEX idx_coupon_redemptions_customer ON coupon_redemptions(customer_id);


-- Migration 082: Fix SSO multi-team support
-- Remove customer_id UNIQUE constraint that prevents same user from having SSO on multiple teams
-- The team_id UNIQUE constraint (from migration 069) already ensures one SSO per team

-- Drop the old customer_id unique constraint
ALTER TABLE sso_configs DROP CONSTRAINT IF EXISTS sso_configs_customer_id_key;

-- Add composite index for lookups by customer_id (non-unique, for query performance)
CREATE INDEX IF NOT EXISTS idx_sso_configs_customer_id ON sso_configs(customer_id);


-- 083: Refund requests with category and admin approval flow
-- Customers submit refund requests → admin reviews → approve/deny

CREATE TABLE IF NOT EXISTS refund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Request details
    category TEXT NOT NULL DEFAULT 'other',
    -- Categories: accidental_purchase, not_satisfied, missing_features, 
    --             technical_issues, billing_error, other
    description TEXT NOT NULL DEFAULT '',
    
    -- Associated invoice
    invoice_id UUID REFERENCES invoices(id),
    amount_cents BIGINT NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending',
    -- Statuses: pending, approved, denied, processed
    
    -- Admin review
    reviewed_by UUID REFERENCES customers(id),
    reviewed_at TIMESTAMPTZ,
    admin_notes TEXT,
    
    -- Refund result (populated when processed)
    refund_id UUID REFERENCES refunds(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for admin to quickly find pending requests
CREATE INDEX idx_refund_requests_status ON refund_requests(status) WHERE status = 'pending';
CREATE INDEX idx_refund_requests_customer ON refund_requests(customer_id);

-- Enable RLS
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;


-- 084: Invoice unique constraint and payment failure grace period

-- Prevent duplicate invoices for the same provider invoice
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_provider_invoice_id 
ON invoices(customer_id, provider_invoice_id) 
WHERE provider_invoice_id IS NOT NULL;

-- Add grace period tracking for payment failures
ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_grace_until TIMESTAMPTZ;

-- Index for finding customers in grace period
CREATE INDEX IF NOT EXISTS idx_customers_payment_grace ON customers(payment_grace_until) WHERE payment_grace_until IS NOT NULL;


-- 085: refunds table (was missing — admin refund and refund_requests depend on it)

CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    amount_cents BIGINT NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    reason TEXT,
    admin_user_id UUID REFERENCES customers(id),
    provider TEXT NOT NULL DEFAULT 'polar',
    provider_refund_id TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_customer ON refunds(customer_id);


-- Add avatar_url column to customers for OAuth profile pictures
ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url TEXT;


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


-- Migration 088: RBAC Enhancements — Permission Cache, Role Rate Limits
--
-- Adds:
-- 1. permission_cache: Cache user permissions for performance
-- 2. role_rate_limits: Different rate limits per role
-- 3. role_audit_log: Detailed RBAC audit trail

-- Step 1: Permission cache table
CREATE TABLE IF NOT EXISTS permission_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '{}',
    cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '5 minutes',
    UNIQUE(customer_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_permission_cache_customer ON permission_cache(customer_id);
CREATE INDEX IF NOT EXISTS idx_permission_cache_expires ON permission_cache(expires_at);

-- Step 2: Role-based rate limits
CREATE TABLE IF NOT EXISTS role_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    requests_per_minute INTEGER NOT NULL DEFAULT 60,
    requests_per_hour INTEGER NOT NULL DEFAULT 1000,
    burst_size INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, role)
);

CREATE INDEX IF NOT EXISTS idx_role_rate_limits_team ON role_rate_limits(team_id);

-- Step 3: RBAC audit log (detailed)
CREATE TABLE IF NOT EXISTS rbac_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES customers(id) ON DELETE SET NULL,
    target_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,         -- 'role_change', 'permission_grant', 'permission_revoke', 'team_join', 'team_leave'
    old_value JSONB DEFAULT '{}',
    new_value JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rbac_audit_actor ON rbac_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_target ON rbac_audit_log(target_id);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_team ON rbac_audit_log(team_id);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_action ON rbac_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_created ON rbac_audit_log(created_at);

-- Step 4: Insert default rate limits for each role
INSERT INTO role_rate_limits (team_id, role, requests_per_minute, requests_per_hour, burst_size)
SELECT t.id, r.role, 
  CASE r.role
    WHEN 'owner' THEN 120
    WHEN 'admin' THEN 100
    WHEN 'developer' THEN 80
    WHEN 'analyst' THEN 60
    WHEN 'viewer' THEN 30
  END,
  CASE r.role
    WHEN 'owner' THEN 5000
    WHEN 'admin' THEN 3000
    WHEN 'developer' THEN 2000
    WHEN 'analyst' THEN 1000
    WHEN 'viewer' THEN 500
  END,
  CASE r.role
    WHEN 'owner' THEN 20
    WHEN 'admin' THEN 15
    WHEN 'developer' THEN 10
    WHEN 'analyst' THEN 8
    WHEN 'viewer' THEN 5
  END
FROM teams t
CROSS JOIN (VALUES ('owner'), ('admin'), ('developer'), ('analyst'), ('viewer')) AS r(role)
ON CONFLICT (team_id, role) DO NOTHING;


-- Cortex Stage 1: Hourly stats aggregation table
-- Populated by background job from delivery_attempts + deliveries
CREATE TABLE IF NOT EXISTS endpoint_hourly_stats (
    endpoint_id UUID NOT NULL,
    hour_start TIMESTAMPTZ NOT NULL,
    total_deliveries INT DEFAULT 0,
    successful INT DEFAULT 0,
    failed INT DEFAULT 0,
    avg_latency_ms INT DEFAULT 0,
    p50_latency_ms INT DEFAULT 0,
    p95_latency_ms INT DEFAULT 0,
    p99_latency_ms INT DEFAULT 0,
    error_breakdown JSONB DEFAULT '{}',
    PRIMARY KEY (endpoint_id, hour_start)
);

CREATE INDEX IF NOT EXISTS idx_hourly_stats_endpoint
    ON endpoint_hourly_stats(endpoint_id, hour_start DESC);

-- Retention: auto-delete after 90 days (handled by retention job)


-- Migration 089: Cortex Performance & Data Quality Fixes
-- Run on Neon DB: psql <connection_string> -f 089_cortex_indexes_and_fixes.sql

-- ============================================================
-- 1. PERFORMANCE INDEXES
-- ============================================================

-- Anomaly scores: healing engine + dashboard queries use this pattern heavily
CREATE INDEX IF NOT EXISTS idx_anomaly_scores_endpoint_created 
    ON anomaly_scores (endpoint_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_anomaly_scores_score_created 
    ON anomaly_scores (score DESC, created_at DESC) 
    WHERE score > 70;

-- Cortex action history: action memory lookups per endpoint
CREATE INDEX IF NOT EXISTS idx_cortex_action_history_endpoint_outcome 
    ON cortex_action_history (endpoint_id, outcome, created_at DESC);

-- Predictions: dashboard listing + per-endpoint queries
CREATE INDEX IF NOT EXISTS idx_predictions_endpoint_created 
    ON predictions (endpoint_id, created_at DESC);

-- Insights: active insights query (WHERE dismissed = false)
CREATE INDEX IF NOT EXISTS idx_cortex_insights_active 
    ON cortex_insights (customer_id, dismissed, created_at DESC) 
    WHERE dismissed = false;

-- Healing actions: per-endpoint lookups
CREATE INDEX IF NOT EXISTS idx_healing_actions_endpoint_created 
    ON healing_actions (endpoint_id, created_at DESC);

-- Recovery surges: active surge lookup
CREATE INDEX IF NOT EXISTS idx_recovery_surges_active 
    ON recovery_surges (endpoint_id, status, started_at DESC) 
    WHERE status = 'active';

-- Endpoint strategy weights: best strategy lookup
CREATE INDEX IF NOT EXISTS idx_strategy_weights_endpoint_weight 
    ON endpoint_strategy_weights (endpoint_id, weight DESC);

-- Alert correlations: active correlation lookup
CREATE INDEX IF NOT EXISTS idx_alert_correlations_active 
    ON alert_correlations (resolved, last_seen DESC) 
    WHERE resolved = false;

-- Weekly reports: unique constraint for upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_reports_customer_week 
    ON weekly_reports (customer_id, week_start);

-- ============================================================
-- 2. UNIQUE CONSTRAINT: Prevent duplicate insights (same type, same endpoint)
-- ============================================================

-- Partial unique index using created_at comparison (immutable-safe)
-- Note: application-level check (24h dedup in insights_engine.rs) handles time window
CREATE UNIQUE INDEX IF NOT EXISTS idx_cortex_insights_no_duplicates 
    ON cortex_insights (customer_id, insight_type, (data->>'endpoint_id'))
    WHERE dismissed = false;

-- ============================================================
-- 3. Add R² column to predictions for confidence tracking
-- ============================================================

ALTER TABLE predictions 
    ADD COLUMN IF NOT EXISTS confidence_r2 FLOAT DEFAULT 0.0;

-- ============================================================
-- 4. Add root_cause_detail to alert_correlations
-- ============================================================

ALTER TABLE alert_correlations 
    ADD COLUMN IF NOT EXISTS root_cause_detail JSONB DEFAULT '{}';


-- Cortex Stage 2: Endpoint behavior profiles
CREATE TABLE IF NOT EXISTS endpoint_profiles (
    endpoint_id UUID PRIMARY KEY REFERENCES endpoints(id) ON DELETE CASCADE,
    latency_p50 INT DEFAULT 0,
    latency_p95 INT DEFAULT 0,
    latency_p99 INT DEFAULT 0,
    latency_stddev FLOAT DEFAULT 0.0,
    success_rate_1h FLOAT DEFAULT 100.0,
    success_rate_24h FLOAT DEFAULT 100.0,
    success_rate_7d FLOAT DEFAULT 100.0,
    baseline_success_rate FLOAT DEFAULT 100.0,
    avg_deliveries_per_hour FLOAT DEFAULT 0.0,
    peak_deliveries_per_hour FLOAT DEFAULT 0.0,
    traffic_pattern JSONB DEFAULT '{}',
    dominant_error_type VARCHAR(100),
    error_distribution JSONB DEFAULT '{}',
    busiest_hour INT,
    quietest_hour INT,
    weekday_avg FLOAT DEFAULT 0.0,
    weekend_avg FLOAT DEFAULT 0.0,
    sample_size INT DEFAULT 0,
    confidence FLOAT DEFAULT 0.0,
    last_updated TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);


-- Migration 090: ML Quality Tracking + Proactive Healing + Healing A/B Tables
-- Run on Neon DB

-- ============================================================
-- 1. ML Model Quality Tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS ml_model_quality (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    model_type VARCHAR(64) NOT NULL,
    predicted_value DOUBLE PRECISION NOT NULL,
    actual_value DOUBLE PRECISION NOT NULL,
    absolute_error DOUBLE PRECISION NOT NULL,
    error_pct DOUBLE PRECISION NOT NULL,
    within_tolerance BOOLEAN NOT NULL DEFAULT false,
    measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_quality_endpoint_type 
    ON ml_model_quality (endpoint_id, model_type, measured_at DESC);

CREATE INDEX IF NOT EXISTS idx_ml_quality_recent 
    ON ml_model_quality (measured_at DESC);

-- Model reset history
CREATE TABLE IF NOT EXISTS ml_model_resets (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    model_type VARCHAR(64) NOT NULL,
    reason VARCHAR(64) NOT NULL,
    quality_score DOUBLE PRECISION,
    reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_resets_endpoint 
    ON ml_model_resets (endpoint_id, reset_at DESC);

-- ============================================================
-- 2. Proactive Healing — new lock ID
-- ============================================================

-- cortex_proactive → 9012, cortex_ml_quality → 9013
-- (already handled in code via mod.rs advisory lock map)

-- ============================================================
-- 3. Healing Strategy Tracking (A/B testing outcomes)
-- ============================================================

-- Add strategy tracking columns to healing_actions if not exists
ALTER TABLE healing_actions 
    ADD COLUMN IF NOT EXISTS strategy_bandit_version VARCHAR(32);

ALTER TABLE healing_actions
    ADD COLUMN IF NOT EXISTS outcome_score DOUBLE PRECISION;

-- Index for strategy performance analysis
CREATE INDEX IF NOT EXISTS idx_healing_actions_strategy 
    ON healing_actions (action_type, outcome, created_at DESC);


-- Cortex Stage 3: Anomaly scores
CREATE TABLE IF NOT EXISTS anomaly_scores (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    score INT NOT NULL,
    factors JSONB NOT NULL,
    category VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_anomaly_endpoint ON anomaly_scores(endpoint_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anomaly_customer ON anomaly_scores(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anomaly_high ON anomaly_scores(score DESC) WHERE score > 70;

-- Cortex Stage 3: Alert correlation (groups related alerts)
CREATE TABLE IF NOT EXISTS alert_correlations (
    id BIGSERIAL PRIMARY KEY,
    root_cause VARCHAR(100),
    affected_endpoints JSONB DEFAULT '[]',
    alert_count INT DEFAULT 0,
    severity VARCHAR(20) DEFAULT 'medium',
    first_seen TIMESTAMPTZ DEFAULT now(),
    last_seen TIMESTAMPTZ DEFAULT now(),
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_correlation_active ON alert_correlations(resolved, last_seen DESC) WHERE resolved = false;


-- Cortex Stage 4: Self-healing actions and recovery tests
CREATE TABLE IF NOT EXISTS healing_actions (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    reason TEXT,
    details JSONB DEFAULT '{}',
    outcome VARCHAR(30) DEFAULT 'pending',
    outcome_details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_healing_endpoint ON healing_actions(endpoint_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_healing_pending ON healing_actions(outcome, created_at DESC) WHERE outcome = 'pending';

-- Track which endpoints are auto-disabled
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS auto_disabled BOOLEAN DEFAULT false;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS auto_disabled_at TIMESTAMPTZ;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS auto_disable_reason TEXT;


-- Cortex Stage 5: Action memory — records every cortex action and its outcome
-- This is the foundation for adaptive learning: "what action worked where"
CREATE TABLE IF NOT EXISTS cortex_action_history (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    customer_id UUID,
    action_type VARCHAR(50) NOT NULL,
    reason TEXT,
    context JSONB DEFAULT '{}',
    outcome VARCHAR(30) DEFAULT 'pending',
    outcome_details JSONB DEFAULT '{}',
    time_to_resolution_secs INT,
    success_score FLOAT,
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_action_history_endpoint ON cortex_action_history(endpoint_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_action_history_type ON cortex_action_history(action_type, outcome);
CREATE INDEX IF NOT EXISTS idx_action_history_customer ON cortex_action_history(customer_id, created_at DESC);

-- Adaptive strategy weights per endpoint
-- Multi-Armed Bandit: tracks success rate of each strategy per endpoint
CREATE TABLE IF NOT EXISTS endpoint_strategy_weights (
    endpoint_id UUID NOT NULL,
    strategy_name VARCHAR(50) NOT NULL,
    attempts INT DEFAULT 0,
    successes INT DEFAULT 0,
    avg_resolution_secs FLOAT DEFAULT 0.0,
    weight FLOAT DEFAULT 1.0,
    last_used TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (endpoint_id, strategy_name)
);


-- Cortex Stage 6: Recovery surge tracking
CREATE TABLE IF NOT EXISTS recovery_surges (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    trigger_reason VARCHAR(100),
    queued_count INT DEFAULT 0,
    processed_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    current_rate_per_min FLOAT DEFAULT 0.0,
    target_rate_per_min FLOAT DEFAULT 0.0,
    ramp_step INT DEFAULT 0,
    total_steps INT DEFAULT 5,
    status VARCHAR(20) DEFAULT 'active',
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_surge_active ON recovery_surges(status, started_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_surge_endpoint ON recovery_surges(endpoint_id, started_at DESC);


-- Cortex Stage 7: Predictive engine — failure probability and capacity forecast
CREATE TABLE IF NOT EXISTS predictions (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    customer_id UUID,
    prediction_type VARCHAR(30) NOT NULL,
    probability FLOAT NOT NULL,
    factors JSONB DEFAULT '{}',
    time_horizon_mins INT DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT now(),
    validated_at TIMESTAMPTZ,
    was_correct BOOLEAN
);

CREATE INDEX IF NOT EXISTS idx_prediction_endpoint ON predictions(endpoint_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prediction_high ON predictions(probability DESC) WHERE probability > 0.7;


-- Cortex Stage 8: Insights — weekly reports, customer health, recommendations
CREATE TABLE IF NOT EXISTS cortex_insights (
    id BIGSERIAL PRIMARY KEY,
    customer_id UUID,
    insight_type VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    severity VARCHAR(20) DEFAULT 'info',
    action_url VARCHAR(500),
    data JSONB DEFAULT '{}',
    dismissed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_insights_customer ON cortex_insights(customer_id, created_at DESC) WHERE dismissed = false;
CREATE INDEX IF NOT EXISTS idx_insights_type ON cortex_insights(insight_type, created_at DESC);

-- Weekly report storage
CREATE TABLE IF NOT EXISTS weekly_reports (
    id BIGSERIAL PRIMARY KEY,
    customer_id UUID NOT NULL,
    week_start DATE NOT NULL,
    report JSONB NOT NULL,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(customer_id, week_start)
);


-- Cortex Stage 9: Smart routing — track endpoint performance for routing decisions
CREATE TABLE IF NOT EXISTS routing_decisions (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    selected_url VARCHAR(2000),
    reason VARCHAR(100),
    alternatives JSONB DEFAULT '[]',
    latency_ms INT,
    success BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_routing_endpoint ON routing_decisions(endpoint_id, created_at DESC);


-- Cortex: Store cortex configuration in platform_settings
-- Uses existing platform_settings table with key='main'
-- Adds cortex_config JSON if not present
UPDATE platform_settings
SET value = value || '{"cortex_config": {
  "hourly_stats_enabled": true,
  "profile_update_interval_mins": 15,
  "anomaly_default_p95_ms": 5000,
  "anomaly_default_p99_ms": 10000,
  "anomaly_high_threshold": 70,
  "anomaly_weights": {"latency_spike": 0.30, "success_drop": 0.30, "error_burst": 0.20, "traffic_anomaly": 0.10, "consecutive_failures": 0.10},
  "auto_disable_days": 14,
  "cascade_threshold_pct": 20.0,
  "recovery_ramp_steps": [10.0, 20.0, 50.0, 100.0, 200.0],
  "recovery_step_interval_secs": 60,
  "recovery_min_success_rate": 95.0,
  "alert_correlation_window_mins": 5,
  "alert_correlation_min_count": 3,
  "predictive_failure_threshold": 0.7,
  "predictive_trend_threshold": -0.1,
  "predictive_momentum_threshold": -0.1,
  "error_breakdown_max_entries": 10,
  "action_memory_max_per_endpoint": 100,
  "adaptive_learning_min_samples": 5,
  "adaptive_learning_success_bonus": 0.05,
  "adaptive_learning_failure_penalty": 0.10
}}'::jsonb
WHERE key = 'main'
AND NOT (value ? 'cortex_config');

-- If platform_settings doesn't have a 'main' row, create it
INSERT INTO platform_settings (key, value)
SELECT 'main', '{"cortex_config": {
  "hourly_stats_enabled": true,
  "profile_update_interval_mins": 15,
  "anomaly_default_p95_ms": 5000,
  "anomaly_default_p99_ms": 10000,
  "anomaly_high_threshold": 70,
  "anomaly_weights": {"latency_spike": 0.30, "success_drop": 0.30, "error_burst": 0.20, "traffic_anomaly": 0.10, "consecutive_failures": 0.10},
  "auto_disable_days": 14,
  "cascade_threshold_pct": 20.0,
  "recovery_ramp_steps": [10.0, 20.0, 50.0, 100.0, 200.0],
  "recovery_step_interval_secs": 60,
  "recovery_min_success_rate": 95.0,
  "alert_correlation_window_mins": 5,
  "alert_correlation_min_count": 3,
  "predictive_failure_threshold": 0.7,
  "predictive_trend_threshold": -0.1,
  "predictive_momentum_threshold": -0.1,
  "error_breakdown_max_entries": 10,
  "action_memory_max_per_endpoint": 100,
  "adaptive_learning_min_samples": 5,
  "adaptive_learning_success_bonus": 0.05,
  "adaptive_learning_failure_penalty": 0.10
}}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM platform_settings WHERE key = 'main');


-- Security: Add unique constraint on ip_blocklist.ip_address for ON CONFLICT support
-- Also add index for fast blocked IP lookups
DO $$ BEGIN
  ALTER TABLE ip_blocklist ADD CONSTRAINT uq_ip_blocklist_ip UNIQUE (ip_address);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_ip_blocklist_active ON ip_blocklist(ip_address, is_active) WHERE is_active = true;

-- Security: Add index on security_events for faster stats queries
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved, created_at DESC);


-- ML Engine: Learned parameters per endpoint
-- Stores EWMA states, anomaly thresholds, bandit weights, forecasting params
CREATE TABLE IF NOT EXISTS ml_models (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}',
    training_samples INT DEFAULT 0,
    last_trained TIMESTAMPTZ,
    accuracy FLOAT DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(endpoint_id, model_type)
);

CREATE INDEX IF NOT EXISTS idx_ml_models_endpoint ON ml_models(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_ml_models_type ON ml_models(model_type, updated_at DESC);

-- ML: Feature vectors for contextual bandit
CREATE TABLE IF NOT EXISTS ml_features (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    feature_value FLOAT NOT NULL,
    context_hash VARCHAR(64),
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ml_features_endpoint ON ml_features(endpoint_id, recorded_at DESC);

-- ML: Decision log for bandit learning
CREATE TABLE IF NOT EXISTS ml_decisions (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    decision_type VARCHAR(50) NOT NULL,
    chosen_action VARCHAR(100) NOT NULL,
    context JSONB DEFAULT '{}',
    reward FLOAT,
    regret FLOAT,
    confidence FLOAT,
    created_at TIMESTAMPTZ DEFAULT now(),
    evaluated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ml_decisions_endpoint ON ml_decisions(endpoint_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_decisions_type ON ml_decisions(decision_type, created_at DESC);

-- ML: Anomaly detection results (separate from simple anomaly_scores)
CREATE TABLE IF NOT EXISTS ml_anomalies (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    detection_method VARCHAR(50) NOT NULL,
    anomaly_score FLOAT NOT NULL,
    is_anomaly BOOLEAN NOT NULL,
    features JSONB NOT NULL,
    threshold_used FLOAT,
    confidence FLOAT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ml_anomalies_endpoint ON ml_anomalies(endpoint_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_anomalies_flagged ON ml_anomalies(is_anomaly, created_at DESC) WHERE is_anomaly = true;


-- Cortex Worker Integration: missing columns + table name fix
-- Fixes: active_url, routing_config, response_url + routing_decisions rename

-- 1. Add active_url column to endpoints (for smart routing URL switching)
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS active_url VARCHAR(2000);

-- 2. Add routing_config column to endpoints (for fallback URL configuration)
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS routing_config JSONB;

-- 3. Add response_url column to delivery_attempts (for smart routing URL scoring)
ALTER TABLE delivery_attempts ADD COLUMN IF NOT EXISTS response_url VARCHAR(2000);

-- 4. Rename routing_decisions → cortex_routing_decisions (match worker query)
ALTER TABLE IF EXISTS routing_decisions RENAME TO cortex_routing_decisions;

-- 5. Index for smart routing lookups
CREATE INDEX IF NOT EXISTS idx_routing_decisions_endpoint
    ON cortex_routing_decisions(endpoint_id, created_at DESC);

-- 6. Index for response_url lookups
CREATE INDEX IF NOT EXISTS idx_delivery_attempts_response_url
    ON delivery_attempts(response_url, created_at DESC)
    WHERE response_url IS NOT NULL;


-- Performance indexes for common admin and analytics queries
-- These indexes speed up COUNT(*) and time-range queries used by:
--   - /admin/stats (system_stats)
--   - /admin/revenue (revenue_by_month)
--   - /v1/stats (user stats)
--   - /admin/deliveries/failed
--   - /admin/audit-logs

-- Deliveries: composite index for time-range + status queries
-- Speeds up: COUNT(*) FILTER (WHERE created_at >= X), COUNT(*) FILTER (WHERE status = 'pending')
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at_status ON deliveries(created_at DESC, status);

-- Deliveries: customer + created_at for per-user time-range queries
CREATE INDEX IF NOT EXISTS idx_deliveries_customer_created ON deliveries(customer_id, created_at DESC);

-- Invoices: status index for revenue calculations
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Invoices: status + paid_at for monthly revenue breakdowns
CREATE INDEX IF NOT EXISTS idx_invoices_status_paid_at ON invoices(status, paid_at DESC) WHERE status = 'paid';

-- Endpoints: is_active filter
CREATE INDEX IF NOT EXISTS idx_endpoints_active ON endpoints(is_active) WHERE is_active = TRUE;

-- Customers: created_at for signup trend queries
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- Customers: is_active for churn queries
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active) WHERE is_active = FALSE;

-- Audit log: created_at for recent activity queries
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

-- Rate limit violations: created_at for recent violations
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_created ON rate_limit_violations(created_at DESC);


