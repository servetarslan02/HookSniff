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
