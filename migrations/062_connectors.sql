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
