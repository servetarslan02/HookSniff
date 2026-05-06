-- AI Agent Orchestration Schema (Phase 3)
-- Tracks AI agents, their executions, and per-customer configurations.

-- Registered AI agents
CREATE TABLE IF NOT EXISTS ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    enabled BOOL DEFAULT true,
    config JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Agent execution history
CREATE TABLE IF NOT EXISTS ai_agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES ai_agents(id),
    delivery_id UUID,
    customer_id UUID,
    trigger_reason TEXT,
    actions_taken JSONB,
    confidence_score FLOAT,
    ai_provider TEXT,
    latency_ms INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Per-customer agent configuration
CREATE TABLE IF NOT EXISTS ai_agent_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    agent_id UUID REFERENCES ai_agents(id),
    enabled BOOL DEFAULT true,
    config JSONB,
    UNIQUE(customer_id, agent_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_agent_executions_agent ON ai_agent_executions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_delivery ON ai_agent_executions(delivery_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_customer ON ai_agent_executions(customer_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_created ON ai_agent_executions(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_configs_customer ON ai_agent_configs(customer_id);
CREATE INDEX IF NOT EXISTS idx_agent_configs_agent ON ai_agent_configs(agent_id);
