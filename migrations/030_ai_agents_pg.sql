-- Migration 030: AI Agent Layer (PostgreSQL / Neon DB)
-- Agent kimlik sistemi + event API + routing
-- Bu dosya PostgreSQL uyumlu (STRING → TEXT)

-- Agent tablosu
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    agent_key TEXT NOT NULL UNIQUE,
    agent_key_hash TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT agents_name_customer_unique UNIQUE (customer_id, name),
    CONSTRAINT agents_status_check CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Agent event'leri
CREATE TABLE IF NOT EXISTS agent_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    direction TEXT NOT NULL DEFAULT 'emit',
    status TEXT NOT NULL DEFAULT 'delivered',
    target_agent_id UUID REFERENCES agents(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT agent_events_direction_check CHECK (direction IN ('emit', 'receive')),
    CONSTRAINT agent_events_status_check CHECK (status IN ('delivered', 'failed', 'pending'))
);

-- Routing kurallari
CREATE TABLE IF NOT EXISTS agent_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    source_agent_id UUID REFERENCES agents(id),
    target_agent_id UUID NOT NULL REFERENCES agents(id),
    filter_expression JSONB,
    is_active BOOL NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT agent_routes_no_self_route CHECK (source_agent_id != target_agent_id)
);

-- Agent rate limit (her agent icin tek satir)
CREATE TABLE IF NOT EXISTS agent_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE UNIQUE,
    max_events_per_minute INT NOT NULL DEFAULT 60,
    max_events_per_hour INT NOT NULL DEFAULT 1000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT rate_limits_minute_check CHECK (max_events_per_minute > 0 AND max_events_per_minute <= 10000),
    CONSTRAINT rate_limits_hour_check CHECK (max_events_per_hour > 0 AND max_events_per_hour <= 100000)
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_agents_customer ON agents(customer_id);
CREATE INDEX IF NOT EXISTS idx_agents_key ON agents(agent_key);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agent_events_agent ON agent_events(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_events_customer ON agent_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_agent_events_type ON agent_events(event_type);
CREATE INDEX IF NOT EXISTS idx_agent_events_created ON agent_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_events_agent_created ON agent_events(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_routes_customer ON agent_routes(customer_id);
CREATE INDEX IF NOT EXISTS idx_agent_routes_event ON agent_routes(event_type);
CREATE INDEX IF NOT EXISTS idx_agent_routes_active ON agent_routes(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_rate_limits_agent ON agent_rate_limits(agent_id);

-- Audit log tablosu
CREATE TABLE IF NOT EXISTS agent_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_audit_agent ON agent_audit_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_audit_customer ON agent_audit_log(customer_id);
CREATE INDEX IF NOT EXISTS idx_agent_audit_created ON agent_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_audit_action ON agent_audit_log(action);
