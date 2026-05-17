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
