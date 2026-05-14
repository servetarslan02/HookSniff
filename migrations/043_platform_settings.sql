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
