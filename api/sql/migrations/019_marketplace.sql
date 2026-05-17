CREATE TABLE IF NOT EXISTS marketplace_agents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            author TEXT NOT NULL DEFAULT 'unknown',
            version TEXT NOT NULL DEFAULT '1.0.0',
            config JSONB NOT NULL DEFAULT '{}',
            downloads INT NOT NULL DEFAULT 0,
            rating DOUBLE PRECISION NOT NULL DEFAULT 0.0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS installed_agents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            agent_id UUID NOT NULL REFERENCES marketplace_agents(id) ON DELETE CASCADE,
            enabled BOOL NOT NULL DEFAULT true,
            config JSONB,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE(customer_id, agent_id)
        );
        CREATE INDEX IF NOT EXISTS idx_installed_agents_customer
            ON installed_agents(customer_id);
